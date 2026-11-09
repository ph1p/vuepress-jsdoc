/*
 * @vuepress
 * ---
 * title: Main
 * headline: The Main File
 * ---
 */
import chokidar from 'chokidar';
import { deleteAsync } from 'del';
import kleur from 'kleur';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { StatisticType } from './constants.js';
import { CLIArguments, DirectoryFile, ParseReturn } from './interfaces.js';
import { FileTree } from './interfaces.js';
import { getPageName, listFolder, normalizePath } from './lib/list-folder.js';
import { getDestFolder, parseFile, ParseOptions, writeContentToFile } from './lib/parser.js';
import { createSidebarConfig, SidebarOptions } from './lib/vue-sidebar.js';

export { listFolder } from './lib/list-folder.js';
export { parseFile, writeContentToFile } from './lib/parser.js';
export { createSidebarConfig, generateVitepressSidebar, generateVueSidebar } from './lib/vue-sidebar.js';
export { parseComment, parseVuepressFileHeader } from './lib/comment-parser.js';
export { defineConfig, loadConfig } from './lib/config.js';
export { vuepressJsdocPlugin } from './lib/vuepress-plugin.js';
export { StatisticType } from './constants.js';
export type { CLIArguments, DirectoryFile, FileTree, ParseReturn, UserConfig } from './interfaces.js';

/**
 * Split a comma separated string or a list of strings into a list
 * @param {string|string[]} value
 * @returns {string[]}
 */
const toList = (value?: string | string[]) =>
  (Array.isArray(value) ? value : (value || '').split(','))
    .flatMap((v) => v.split(','))
    .map((v) => v.trim())
    .filter(Boolean);

/**
 * Parse all CLI arguments
 * @param {CLIArguments} argv
 * @returns {object} all arguments
 */
export const parseArguments = (argv: CLIArguments) => {
  const codeFolder = normalizePath(argv.folder || 'code');
  const dist = normalizePath(argv.dist || './documentation');
  const srcFolder = normalizePath(argv.source || './src');

  return {
    include: toList(argv.include),
    exclude: toList(argv.exclude),
    srcFolder,
    codeFolder,
    docsFolder: path.posix.join(dist, codeFolder),
    title: argv.title || 'API',
    readme: argv.readme,
    readmePath: argv.readme || path.join(srcFolder, 'README.md'),
    rmPattern: toList(argv.rmPattern),
    partials: toList(argv.partials),
    jsDocConfigPath: argv.jsDocConfigPath,
    format: argv.format === 'vitepress' ? ('vitepress' as const) : ('vuepress' as const)
  };
};

export type Options = ReturnType<typeof parseArguments>;

/**
 * Run async tasks with a limited concurrency, because every jsdoc call spawns a child process.
 * @param {T[]} items
 * @param {Function} fn
 * @returns {Promise<R[]>} results in the order of the items
 */
const mapLimit = async <T, R>(items: T[], fn: (item: T) => Promise<R>, limit = os.availableParallelism()) => {
  const results: R[] = new Array(items.length);
  let index = 0;

  const worker = async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  };

  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker));

  return results;
};

/**
 * Get the sidebar options of the given file tree
 * @param {Options} options
 * @param {FileTree[]} fileTree created by `listFolder`
 * @returns {SidebarOptions}
 */
export const getSidebarOptions = (options: Options, fileTree: FileTree[]): SidebarOptions => ({
  fileTree,
  srcFolder: options.srcFolder,
  docsFolder: options.docsFolder,
  codeFolder: options.codeFolder,
  title: options.title,
  format: options.format
});

/**
 * Write the config.js with the file tree and sidebar
 * @param {Options} options
 * @param {FileTree[]} fileTree created by `listFolder`
 * @returns {Promise<void>}
 */
const createVuepressSidebar = (options: Options, fileTree: FileTree[]) =>
  fs.writeFile(path.join(options.docsFolder, 'config.js'), createSidebarConfig(getSidebarOptions(options, fileTree)));

/**
 * Parse a file and write the markdown file
 * @param {DirectoryFile} file
 * @param {Options} options
 * @returns {Promise<ParseReturn>}
 */
const processFile = async (file: DirectoryFile, options: Options) => {
  const parseOptions: ParseOptions = {
    srcFolder: options.srcFolder,
    destFolder: options.docsFolder,
    jsDocConfigPath: options.jsDocConfigPath,
    partials: options.partials
  };

  const result = await parseFile(file, parseOptions);
  await writeContentToFile(result);

  return result;
};

/**
 * Create the readme file. First page when entering the documentation.
 * @param {Options} options
 * @returns {Promise<void>}
 */
const createReadmeFile = async (options: Options) => {
  const { readmePath } = options;
  // vitepress uses index.md as the page of a folder
  const target = options.format === 'vitepress' ? 'index.md' : 'README.md';
  let content = `# ${options.title}\n`;

  try {
    content = await fs.readFile(readmePath, 'utf-8');
    console.log(
      `${kleur.white().bgBlack(' README ')} ${kleur.dim(readmePath)} → ${kleur.dim(options.docsFolder)}/${target}`
    );
  } catch {
    console.log(`${kleur.white().bgBlack(' README ')} no README.md found, a default one was created`);
  }

  await fs.writeFile(path.join(options.docsFolder, target), content);
};

const STATUS_COLORS = {
  [StatisticType.INCLUDE]: kleur.green,
  [StatisticType.ERROR]: kleur.red,
  [StatisticType.EMPTY]: kleur.yellow,
  [StatisticType.EXCLUDE]: kleur.blue
};

/**
 * Print a status line
 * @param {StatisticType} type
 * @param {string} message
 */
const printStatus = (type: StatisticType, message: string) => {
  console.log(
    STATUS_COLORS[type]()
      .inverse()
      .bold(` ${type.padEnd(7)} `),
    message
  );
};

/**
 * Print the result of a parsed file
 * @param {ParseReturn} entry
 */
const printResult = (entry: ParseReturn) => {
  const source = `${kleur.dim(entry.file.folder)}${kleur.bold(path.basename(entry.file.path))}`;

  if (entry.type === StatisticType.INCLUDE) {
    printStatus(entry.type, `${source} → ${kleur.dim(entry.dest + '/')}${kleur.bold(entry.file.name + '.md')}`);
  } else if (entry.type === StatisticType.EMPTY) {
    printStatus(entry.type, `${source} ${kleur.dim('(no documentation found)')}`);
  } else {
    printStatus(entry.type, source);
    if (entry.error) {
      console.log(kleur.red(entry.error.replace(/^/gm, '          ')));
    }
  }
};

/**
 * Default command that generates the markdown files
 * @param {CLIArguments} argv passed arguments
 * @returns {Promise<ParseReturn[]>} results of all parsed files
 */
export const generate = async (argv: CLIArguments) => {
  const options = parseArguments(argv);
  const startTime = performance.now();

  // the generated folder is always recreated
  await fs.rm(options.docsFolder, { recursive: true, force: true });
  if (options.rmPattern.length) {
    await deleteAsync(options.rmPattern);
  }
  await fs.mkdir(options.docsFolder, { recursive: true });

  const lsFolder = await listFolder(options.srcFolder, options.exclude, options.include);

  for (const file of lsFolder.excluded) {
    printStatus(StatisticType.EXCLUDE, `${kleur.dim(file.folder)}${kleur.bold(path.basename(file.path))}`);
  }

  const results = await mapLimit(lsFolder.paths, async (file) => {
    const result = await processFile(file, options);
    printResult(result);
    return result;
  });

  await Promise.all([createVuepressSidebar(options, lsFolder.tree), createReadmeFile(options)]);

  const count = (type: StatisticType) => results.filter((r) => r.type === type).length;
  const resultTime = ((performance.now() - startTime) / 1000).toFixed(2);

  console.log(
    `\n${kleur.green(`${count(StatisticType.INCLUDE)} generated`)}, ${kleur.yellow(
      `${count(StatisticType.EMPTY)} empty`
    )}, ${kleur.red(`${count(StatisticType.ERROR)} failed`)}, ${kleur.blue(`${lsFolder.excluded.length} excluded`)}`
  );
  console.log(`⏰ Time: ${resultTime}s`);

  if (argv.watch) {
    watchFiles(argv);
  }

  return results;
};

/**
 * Watch files in source folder and update the generated markdown files
 * @param {CLIArguments} argv
 * @returns {object} chokidar watcher
 */
export const watchFiles = (argv: CLIArguments) => {
  const options = parseArguments(argv);
  const readmePath = path.resolve(options.readmePath);

  console.log('\n---\n\n👀 watching files...');

  const watcher = chokidar.watch(
    [options.srcFolder, options.readme].filter((p): p is string => Boolean(p)),
    {
      ignored: (p) => /(^|[/\\])\.[^/\\]/.test(p) || p.includes('node_modules'),
      ignoreInitial: true
    }
  );

  let queue = Promise.resolve();

  const update = (event: 'add' | 'change' | 'unlink', changedPath: string) => {
    queue = queue.then(async () => {
      try {
        if (path.resolve(changedPath) === readmePath) {
          await createReadmeFile(options);
          return;
        }

        const { paths, tree } = await listFolder(options.srcFolder, options.exclude, options.include);
        const file = paths.find((p) => path.resolve(p.path) === path.resolve(changedPath));

        if (event === 'unlink') {
          const dir = normalizePath(path.dirname(changedPath));
          const name = getPageName(dir, path.basename(changedPath, path.extname(changedPath)));
          const dest = getDestFolder({ folder: dir }, options.srcFolder, options.docsFolder);
          await fs.rm(path.join(dest, `${name}.md`), { force: true });
          console.log(kleur.dim(`removed ${changedPath}`));
        } else if (file) {
          printResult(await processFile(file, options));
        }

        await createVuepressSidebar(options, tree);
      } catch (e) {
        console.error(e);
      }
    });
  };

  watcher.on('all', (event, p) => {
    if (event === 'add' || event === 'change' || event === 'unlink') update(event, p);
  });

  return watcher;
};
