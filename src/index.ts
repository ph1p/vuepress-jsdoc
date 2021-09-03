/*
 * @vuepress
 * ---
 * title: Main
 * headline: The Main File
 * ---
 */
import chalk from 'chalk';
import chokidar from 'chokidar';
import del from 'del';
import fs from 'fs/promises';
import mkdirp from 'mkdirp';
import { join } from 'path';
import readline from 'readline';

import { StatisticType } from './constants';
import { CLIArguments, DirectoryFile } from './interfaces';
import { listFolder } from './lib/list-folder';
import { parseFile, parseVueFile, writeContentToFile } from './lib/parser';
import { generateVueSidebar } from './lib/vue-sidebar';

/**
 * Create the sidebar
 * @param options
 * @returns {Promise}
 */
const createVuepressSidebar = options =>
  fs.writeFile(
    `${options.docsFolder}/config.js`,
    `exports.fileTree=${JSON.stringify(
      options.fileTree
    )};exports.sidebarTree = (title = 'Mainpage') => (${JSON.stringify(generateVueSidebar(options)).replace(
      '::vuepress-jsdoc-title::',
      '"+title+"'
    )});`
  );

/**
 * Parse file
 * @param file
 * @param argv
 * @returns {Promise}
 */
const parseDirectoryFile = async (file: DirectoryFile, argv: CLIArguments) => {
  const { srcFolder, docsFolder, partials } = parseArguments(argv);
  if (!file.isDir && file.folder) {
    // path where file should be saved
    const dest = join(docsFolder, file.folder.replace(srcFolder, ''));
    let content;

    if (['.jsx', '.tsx', '.ts', '.js'].includes(file.ext || '')) {
      content = await parseFile(file, srcFolder, docsFolder, argv.jsDocConfigPath, partials);
    }
    if (file.ext === '.vue') {
      content = await parseVueFile(file, srcFolder, docsFolder);
    }

    return { content, dest };
  }
};

const createReadmeFile = async (argv: CLIArguments, deletedPaths?: string[]) => {
  const { srcFolder, codeFolder, docsFolder, title, readme } = parseArguments(argv);

  let readMeContent = `### Welcome to ${title}`;
  const readmePath = readme || `${srcFolder}/README.md`;

  try {
    readMeContent = await fs.readFile(readmePath, 'utf-8');
    if (deletedPaths?.some(p => p.indexOf(`${codeFolder}/README.md`) !== -1)) {
      console.log(
        `\n${chalk.white.bgBlack(' README ')} ${chalk.dim(readmePath.replace('README.md', ''))}${chalk.bold(
          'README.md'
        )} \u2192  ${chalk.dim(docsFolder)}${chalk.bold('/README.md')}`
      );
    }
  } catch (e) {
    console.log(`\n${chalk.white.bgBlack(' README ')} Add default README.md`);
  }

  await fs.writeFile(`${docsFolder}/README.md`, readMeContent);
};

/**
 * Parse all CLI arguments
 * @param argv
 * @returns {object} all arguments
 */
const parseArguments = (argv: CLIArguments) => {
  return {
    exclude: (argv.exclude || '').split(',').filter(Boolean),
    srcFolder: argv.source.replace('./', ''),
    codeFolder: argv.folder,
    docsFolder: `${argv.dist}/${argv.folder}`,
    title: argv.title,
    readme: argv.readme,
    rmPattern: argv.rmPattern || [],
    partials: argv.partials || []
  };
};

/**
 * Default command that generate md files
 * @param {object} argv passed arguments
 */
export const generate = async (argv: CLIArguments) => {
  const { exclude, srcFolder, codeFolder, docsFolder, title, rmPattern } = parseArguments(argv);

  const startTime = +new Date();

  // remove docs folder, except README.md
  const deletedPaths = await del([`${docsFolder}/**/*`, ...rmPattern]);

  const lsFolder = await listFolder(srcFolder, exclude);

  await mkdirp(docsFolder);

  const parsePromises: Promise<any>[] = [];

  // print out all files
  for (const file of lsFolder.paths) {
    if (!file.isDir) {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(chalk.dim(` ${file.path} `));
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);

  // iterate through files and parse them
  for (const file of lsFolder.paths) {
    const data = await parseDirectoryFile(file, argv);
    if (data) {
      parsePromises.push(writeContentToFile(data.content, data.dest));
    }
  }

  // wait unitl all files resolved
  const result = await Promise.all(parsePromises);

  // write vuepress sidebar
  await createVuepressSidebar({
    fileTree: lsFolder.tree,
    srcFolder,
    docsFolder,
    codeFolder,
    title
  });

  // print stats
  for (const file of lsFolder.excluded) {
    console.log(
      chalk.reset.inverse.bold.blue(' EXCLUDE '),
      `${chalk.dim(file.folder)}${chalk.bold(file.name + file.ext)}`
    );
  }

  console.log();

  for (const entry of result.flat()) {
    if (!entry.file) continue;

    const color = {
      [StatisticType.SUCCESS]: 'green',
      [StatisticType.ERROR]: 'red',
      [StatisticType.EMPTY]: 'yellow',
      [StatisticType.EXCLUDE]: 'blue'
    }[entry.type];

    console.log(
      chalk.reset.inverse.bold[color](` ${entry.type} `),
      `${chalk.dim(entry.relativePathSrc)}${chalk.bold(entry.file.name + entry.file.ext)} \u2192 ${chalk.dim(
        entry.relativePathDest
      )}${chalk.bold(entry.file.name + '.md')}`
    );
  }

  // create README.md
  await createReadmeFile(argv, deletedPaths);

  const resultTime = (Math.abs(startTime - +new Date()) / 1000).toFixed(2);

  console.log(`\n⏰ Time: ${resultTime}s`);

  watchFiles(argv);
};

const watchFiles = (argv: CLIArguments) => {
  const { exclude, srcFolder, codeFolder, docsFolder, title } = parseArguments(argv);

  if (argv.watch) {
    console.log('\n---\n\n👀 watching files...');
    const watcher = chokidar.watch([srcFolder, argv.readme, `${srcFolder}/README.md`].filter(Boolean), {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    watcher.on('change', async path => {
      const lsFolder = await listFolder(srcFolder, exclude);
      const file = lsFolder.paths.find(p => p.path === path);

      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);

      if (path === 'README.md' || path === `${srcFolder}/README.md`) {
        await createReadmeFile(argv);
      }

      if (file) {
        process.stdout.write(chalk.dim(`update ${file.name + file.ext}`));

        const data = await parseDirectoryFile(file, argv);
        if (data) {
          await writeContentToFile(data.content, data.dest);
        }

        await createVuepressSidebar({
          fileTree: lsFolder.tree,
          srcFolder,
          docsFolder,
          codeFolder,
          title
        });
      }
    });
  }
};

/**
 * The vuepress plugins
 * @param argv
 * @param ctx
 * @returns {object}
 */
const plugin = (argv: CLIArguments, ctx) => ({
  name: 'vuepress-plugin-jsdoc',
  ready: async () => {
    if (!ctx.isProd) {
      argv.watch = true;
      watchFiles(argv);
    }
  }
});

export default plugin;
