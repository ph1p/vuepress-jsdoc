import chalk from 'chalk';
import del from 'del';
import fs from 'fs/promises';
import mkdirp from 'mkdirp';
import { join } from 'path';
import readline from 'readline';

import { StatisticType } from './constants';
import { listFolder } from './lib/list-folder';
import { parseFile, parseVueFile, writeContentToFile } from './lib/parser';
import { generateVueSidebar } from './lib/vue-sidebar';

/**
 * Default command that generate md files
 * @param {object} argv passed arguments
 */
export const generate = async (argv: Record<string, string>) => {
  const exclude: string[] = (argv.exclude || '').split(',').filter(Boolean);
  const srcFolder = argv.source.replace('./', '');
  const codeFolder = argv.folder;
  const docsFolder = `${argv.dist}/${codeFolder}`;
  const title = argv.title;
  const readme = argv.readme;
  const rmPattern = argv.rmPattern || [];
  const partials = argv.partials || [];

  const startTime = +new Date();

  // remove docs folder, except README.md
  const deletedPaths = await del([`${docsFolder}/**/*`, ...rmPattern]);

  const { tree, paths } = await listFolder(srcFolder, exclude);
  console.log();

  await mkdirp(docsFolder);

  const parsePromises: Promise<any>[] = [];

  // print out all files
  for (const file of paths) {
    if (!file.isDir) {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`${chalk.dim(` ${file.path} `)}`);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);

  // iterate through files and parse them
  for (const file of paths) {
    if (!file.isDir && file.folder) {
      // path where file should be saved
      const dest = join(docsFolder, file.folder.replace(srcFolder, ''));

      switch (file.ext) {
        case '.tsx':
        case '.ts':
        case '.js':
          parsePromises.push(
            writeContentToFile(await parseFile(file, srcFolder, docsFolder, argv.jsDocConfigPath, partials), dest)
          );
          break;
        case '.jsx':
        case '.vue':
          parsePromises.push(writeContentToFile(await parseVueFile(file, srcFolder, docsFolder), dest));
          break;
      }
    }
  }

  // wait unitl all files resolved
  const result = await Promise.all(parsePromises);

  // write vuepress sidebar
  await fs.writeFile(
    `${docsFolder}/config.js`,
    `exports.fileTree=${JSON.stringify(tree)};exports.sidebarTree = (title = 'Mainpage') => (${JSON.stringify(
      generateVueSidebar({
        fileTree: tree,
        srcFolder,
        docsFolder,
        codeFolder,
        title
      })
    ).replace('::vuepress-jsdoc-title::', '"+title+"')});`
  );

  // print stats
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
  let readMeContent = `### Welcome to ${title}`;
  const readmePath = readme || `${srcFolder}/README.md`;

  try {
    readMeContent = await fs.readFile(readmePath, 'utf-8');
    if (deletedPaths.some(p => p.indexOf(`${codeFolder}/README.md`) !== -1)) {
      console.log(
        `\n${chalk.white.bgBlack(' README ')} ${chalk.dim(readmePath.replace('README.md', ''))}${chalk.bold(
          'README.md'
        )} \u2192  ${chalk.dim(docsFolder)}${chalk.bold('/README.md')}`
      );
    }
  } catch (e) {
    console.log(`\n${chalk.white.bgBlack(' README ')} Add default README.md`);
  }

  try {
    await fs.access(`${docsFolder}/README.md`);
  } catch (e) {
    await fs.writeFile(`${docsFolder}/README.md`, readMeContent);
  }

  const resultTime = (Math.abs(startTime - +new Date()) / 1000).toFixed(2);

  console.log(`\n⏰ Time: ${resultTime}s\n`);
};
