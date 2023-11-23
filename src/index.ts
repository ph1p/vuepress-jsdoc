/*
 * @vuepress
 * ---
 * title: Main
 * headline: The Main File
 * ---
 */
import chokidar from 'chokidar';
import del from 'del';
import kleur from 'kleur';
import { mkdirp } from 'mkdirp';
import fs from 'node:fs/promises';
import readline from 'node:readline';

import { StatisticType } from './constants';
import { CLIArguments, DirectoryFile } from './interfaces';
import { listFolder } from './lib/list-folder';
import { parseFile, parseVueFile, writeContentToFile } from './lib/parser';
import { generateVueSidebar } from './lib/vue-sidebar';

/**
 * Create the sidebar
 * @param {object} options
 * @returns {Promise}
 */
const createVuepressSidebar = (options) =>
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
 * @param {DirectoryFile} file
 * @param {CLIArguments} argv
 * @returns {Promise}
 */
const parseDirectoryFile = (file: DirectoryFile, argv: CLIArguments) => {
  const { srcFolder, docsFolder, partials } = parseArguments(argv);
  if (!file.isDir && file.folder) {
    if (['.jsx', '.tsx', '.ts', '.js'].includes(file.ext || '')) {
      return parseFile(file, srcFolder, docsFolder, argv.jsDocConfigPath, partials);
    }
    if (file.ext === '.vue') {
      return parseVueFile(file, srcFolder, docsFolder);
    }
  }
};

/**
 * Create the readme file. First page when entering the documentation.
 * @param {CLIArguments} argv
 * @param {string} deletedPaths
 * @returns {void}
 */
const createReadmeFile = async (argv: CLIArguments, deletedPaths?: string[]) => {
  const { srcFolder, codeFolder, docsFolder, title, readme } = parseArguments(argv);

  let readMeContent = `### Welcome to ${title}`;
  const readmePath = readme || `${srcFolder}/README.md`;

  try {
    readMeContent = await fs.readFile(readmePath, 'utf-8');
    if (deletedPaths?.some((p) => p.indexOf(`${codeFolder}/README.md`) !== -1)) {
      console.log(
        `\n${kleur.white().bgBlack(' README ')} ${kleur.dim(readmePath.replace('README.md', ''))}${kleur.bold(
          'README.md'
        )} \u2192  ${kleur.dim(docsFolder)}${kleur.bold('/README.md')}`
      );
    }
  } catch (e) {
    console.log(`\n${kleur.white().bgBlack(' README ')} Add default README.md`);
  }

  await fs.writeFile(`${docsFolder}/README.md`, readMeContent);
};

/**
 * Parse all CLI arguments
 * @param {CLIArguments} argv
 * @returns {object} all arguments
 */
const parseArguments = (argv: CLIArguments) => {
  return {
    include: (argv.include || '').split(',').filter(Boolean),
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
  const { exclude, include, srcFolder, codeFolder, docsFolder, title, rmPattern } = parseArguments(argv);

  const startTime = +new Date();

  // remove docs folder, except README.md
  const deletedPaths = await del([`${docsFolder}/**/*`, ...rmPattern]);

  const lsFolder = await listFolder(srcFolder, exclude, include);

  await mkdirp(docsFolder);

  const parsePromises: Promise<any>[] = [];

  // print out all files
  for (const file of lsFolder.paths) {
    if (!file.isDir) {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(kleur.dim(` ${file.path} `));
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);

  // iterate through files and parse them
  for (const file of lsFolder.paths) {
    parsePromises.push(
      (async () => {
        const data = await parseDirectoryFile(file, argv);

        if (data && data?.relativePathDest) {
          return writeContentToFile(data, data.relativePathDest);
        }
      })()
    );
  }

  // wait unitl all files resolved
  let result = await Promise.all(parsePromises);
  result = result.filter(Boolean);

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
      kleur.reset().inverse().bold().blue(' EXCLUDE '),
      `${kleur.dim(file.folder as string)}${kleur.bold(file.name + file.ext)}`
    );
  }

  console.log();

  for (const entry of result.flat()) {
    if (!entry.file) continue;

    const color = {
      [StatisticType.INCLUDE]: kleur.reset().inverse().bold().green,
      [StatisticType.ERROR]: kleur.reset().inverse().bold().red,
      [StatisticType.EMPTY]: kleur.reset().inverse().bold().yellow,
      [StatisticType.EXCLUDE]: kleur.reset().inverse().bold().blue
    }[entry.type];

    console.log(
      color(` ${entry.type} `),
      `${kleur.dim(entry.relativePathSrc)}${kleur.bold(entry.file.name + entry.file.ext)} \u2192 ${kleur.dim(
        entry.relativePathDest
      )}${kleur.bold(entry.file.name + '.md')}`
    );
  }

  // create README.md
  await createReadmeFile(argv, deletedPaths);

  const resultTime = (Math.abs(startTime - +new Date()) / 1000).toFixed(2);

  console.log(`\n⏰ Time: ${resultTime}s`);

  watchFiles(argv);
};

/**
 * Watch files in source folder
 * @param {CLIArguments} argv
 */
export const watchFiles = (argv: CLIArguments) => {
  const { exclude, include, srcFolder, codeFolder, docsFolder, title } = parseArguments(argv);

  if (argv.watch) {
    console.log('\n---\n\n👀 watching files...');
    const watcher = chokidar.watch([srcFolder, argv.readme, `${srcFolder}/README.md`].filter(Boolean), {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    watcher.on('change', async (path) => {
      const lsFolder = await listFolder(srcFolder, exclude, include);
      const file = lsFolder.paths.find((p) => p.path === path);

      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);

      if (path === 'README.md' || path === `${srcFolder}/README.md`) {
        await createReadmeFile(argv);
      }

      if (file) {
        process.stdout.write(kleur.dim(`update ${file.name + file.ext}`));

        parseDirectoryFile(file, argv)?.then((data) => {
          if (data) {
            writeContentToFile(data, data.relativePathDest);
          }

          createVuepressSidebar({
            fileTree: lsFolder.tree,
            srcFolder,
            docsFolder,
            codeFolder,
            title
          });
        });
      }
    });
  }
};
