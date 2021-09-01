import chalk from 'chalk';
import del from 'del';
import { join } from 'path';
import mkdirp from 'mkdirp';
import fs from 'fs/promises';

import { listFolder } from './lib/list-folder';
import { parseFile, parseVueFile, writeContentToFile } from './lib/parser';
import { getExtension } from './lib/utils';
import { generateVueSidebar } from './lib/vue-sidebar';

const fileTree: any[] = [];
const statistics: Record<string, any> = {};
const statusTypes = {
  success: 'green',
  error: 'red',
  exclude: 'blueBright',
  empty: 'yellow'
};

const extensions = ['.ts', '.js', '.tsx', '.jsx', '.vue'];

/** A
 * Add status and count to result
 * @param {string} file
 * @param {string} status
 * @param {boolean} isDir
 */
const addToStatistics = (file: string, status: string, isDir = false) => {
  const extension = !isDir ? getExtension(file) : 'folder';

  if (!statistics[extension]) {
    statistics[extension] = Object.keys(statusTypes).reduce((before, curr) => ({ ...before, [curr]: 0 }), {});
  }
  statistics[extension][status]++;
};

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
  const deletedPaths = await del([`${docsFolder}/**/*`, `!${docsFolder}/README.md`, ...rmPattern]);

  const filesAndFolder = await listFolder(srcFolder, exclude);

  await mkdirp(docsFolder);

  const parsePromises: Promise<any>[] = [];

  console.log();
  for (const file of filesAndFolder) {
    if (!file.isDir) {
      process.stdout.clearLine(-1);
      process.stdout.cursorTo(0);
      process.stdout.write(`${chalk.dim(` ${file.path} `)}`);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }
  process.stdout.clearLine(-1);
  process.stdout.cursorTo(0);

  for (const file of filesAndFolder) {
    if (!file.isDir) {
      switch (file.ext) {
        case '.tsx':
        case '.ts':
        case '.js':
          parsePromises.push(
            writeContentToFile(parseFile(file, srcFolder, docsFolder, argv.jsDocConfigPath, partials))
          );
          break;
        case '.jsx':
        case '.vue':
          parsePromises.push(writeContentToFile(parseVueFile(file, srcFolder, docsFolder)));
          break;
      }
    }
  }

  const result = await Promise.all(parsePromises);

  for (const entry of result.flat()) {
    console.log(
      chalk.reset.inverse.bold.green(` ${entry.type.toUpperCase()} `),
      `${chalk.dim(entry.relativePathSrc)}${chalk.bold(entry.file.name + entry.file.ext)} \u2192 ${chalk.dim(
        entry.relativePathDest
      )}${chalk.bold(entry.file.name + '.md')}`
    );
  }

  // await fs.writeFile(
  //   `${docsFolder}/config.js`,
  //   `exports.fileTree=${JSON.stringify(fileTree)};exports.sidebarTree = (title = 'Mainpage') => (${JSON.stringify(
  //     generateVueSidebar({
  //       fileTree,
  //       codeFolder,
  //       title
  //     })
  //   ).replace('::vuepress-jsdoc-title::', '"+title+"')});`
  // );

  // create README.md
  let readMeContent = `### Welcome to ${title}`;
  const readmePath = readme || `${srcFolder}/README.md`;

  try {
    readMeContent = await fs.readFile(readmePath, 'utf-8');
    if (deletedPaths.some(p => p.indexOf(`${codeFolder}/README.md`) !== -1)) {
      console.log(`\n${chalk.black.bgYellow('found')} ${readmePath} and copies content to ${docsFolder}/README.md`);
    }
  } catch (e) {
    console.log(`${chalk.white.bgBlack('skipped')} copy README.md`);
  }

  // Do nothing if README.md already exists
  try {
    readMeContent = await fs.readFile(`${docsFolder}/README.md`, 'utf-8');
    console.log(`\n${chalk.yellow(`${docsFolder}/README.md already exists`)}`);
  } catch (e) {
    await fs.writeFile(`${docsFolder}/README.md`, readMeContent);
  }

  const resultTime = (Math.abs(startTime - +new Date()) / 1000).toFixed(2);

  console.log(`\n⏰ Time: ${resultTime}s\n`);

  // /**
  //  * Read all files in directory
  //  * @param {string} folder
  //  * @param {number} depth
  //  * @param {array} tree
  //  */
  // const readFiles = async (folder: string, depth: number, tree: any[]) => {
  //   try {
  //     // get all files
  //     const files = await fs.readdir(folder);
  //     const completeFolderPath = folder.replace(srcFolder, '');

  //     // if this is not a subdir
  //     let folderPath = docsFolder;

  //     // generate correct docs folder path
  //     if (depth > 0) {
  //       folderPath += completeFolderPath;
  //     }

  //     // iterate through all files in folder
  //     await asyncForEach(files, async file => {
  //       let isExcluded = false;

  //       if (exclude && mm.isMatch(path.join(folder.replace(srcFolder, ''), file), exclude)) {
  //         console.log(chalk.reset.inverse.bold.blueBright(' EXCLUDE '), `${chalk.dim(folder)}/${chalk.bold(file)}`);

  //         addToStatistics(file, 'exclude');
  //         isExcluded = true;
  //       }

  //       const stat = await fs.lstat(`${folder}/${file}`);

  //       let fileName = getFilename(file);

  //       // prefix index with unserscore, the generated index.html comes from vuepress
  //       if (fileName === 'index') {
  //         fileName = '_index';
  //       }

  //       if (stat.isDirectory()) {
  //         // check file length and skip empty folders
  //         try {
  //           let dirFiles = await fs.readdir(path.join(folder, file));

  //           dirFiles = dirFiles.filter(f => {
  //             return !mm.isMatch(path.join(folder.replace(srcFolder, ''), file, f), exclude);
  //           });

  //           if (dirFiles.length > 0) {
  //             await fs.mkdir(`${folderPath}/${file}`);
  //           }

  //           addToStatistics(file, 'success', true);
  //         } catch (e) {
  //           const error = e as Record<string, string>;
  //           console.log(error.message);
  //           console.log(
  //             chalk.yellow('cannot create folder, because it already exists'),
  //             `${chalk.dim(folderPath)}/${file}`
  //           );

  //           addToStatistics(file, 'error', true);
  //         }

  //         // Add to tree
  //         tree.push({
  //           name: file,
  //           children: []
  //         });

  //         // read files from subfolder
  //         await readFiles(`${folder}/${file}`, depth + 1, tree.filter(treeItem => file === treeItem.name)[0].children);
  //       }
  //       // Else branch accessed when file is not a folder
  //       else if (!isExcluded) {
  //         // check if extension is correct
  //         if (checkExtension(file, extensions)) {
  //           const fileData = await fs.readFile(`${folder}/${file}`, 'utf8');
  //           let mdFileData = '';

  //           if (/\.vue$/.test(file)) {
  //             // const rootProjectFolder = process.cwd();
  //             // await vueDocgen({
  //             //   ...extractConfig(path.join(rootProjectFolder, folder)),
  //             //   components: file,
  //             //   outDir: path.join(rootProjectFolder, folderPath)
  //             // });
  //             // // just a small workaround to get the written file
  //             // await new Promise(resolve => setTimeout(resolve, 200));
  //             // mdFileData = await fs.readFile(`${path.join(rootProjectFolder, folderPath, fileName)}.md`, 'utf-8');
  //           } else if (/\.(js|ts|jsx|tsx)$/.test(file) && fileData) {
  //             const configPath = argv.jsDocConfigPath;

  //             try {
  //               // render file
  //               mdFileData = await jsdoc2md.render({
  //                 files: [`${folder}/${file}`],
  //                 configure: configPath,
  //                 partial: [
  //                   path.resolve(__filename, '../../template/header.hbs'),
  //                   path.resolve(__filename, '../../template/main.hbs'),
  //                   ...partials
  //                 ]
  //               });
  //             } catch (e) {
  //               const error = e as Record<string, string>;
  //               const isConfigExclude = error.message.includes('no input files');

  //               console.log(
  //                 chalk.reset.inverse.bold.red(isConfigExclude ? ' EXCLUDE BY CONFIG ' : ' ERROR '),
  //                 `${chalk.dim(folder)}/${chalk.bold(file)} \u2192 ${chalk.dim(folderPath)}/${chalk.bold(
  //                   fileName + '.md'
  //                 )}`
  //               );

  //               if (!isConfigExclude) {
  //                 console.log(error.message);

  //                 addToStatistics(file, 'error');
  //               }
  //             }
  //           }

  //           if (mdFileData) {
  //             const { frontmatter, attributes } = parseVuepressComment(fileData);

  //             console.log(
  //               chalk.reset.inverse.bold.green(' SUCCESS '),
  //               `${chalk.dim(folder)}/${chalk.bold(file)} \u2192 ${chalk.dim(folderPath)}/${chalk.bold(
  //                 fileName + '.md'
  //               )}`
  //             );

  //             let fileContent = '---\n';

  //             fileContent += !attributes?.title ? `title: ${fileName}` : '';

  //             if (frontmatter) {
  //               fileContent += !attributes?.title ? '\n' : '';
  //               fileContent += `${frontmatter}`;
  //             }

  //             fileContent += '\n---\n';
  //             if (attributes?.title || !/\.vue$/.test(file)) {
  //               let headline = fileName;

  //               if (attributes?.headline) {
  //                 headline = attributes.headline;
  //               } else if (attributes?.title) {
  //                 headline = attributes.title;
  //               }

  //               fileContent += `\n# ${headline}\n\n`;
  //             }
  //             fileContent += mdFileData;

  //             await fs.writeFile(`${folderPath}/${fileName}.md`, fileContent);

  //             tree.push({
  //               name: fileName,
  //               path: `/${fileName}`,
  //               fullPath: `${folderPath.replace(`${docsFolder}/`, '')}/${fileName}`
  //             });

  //             addToStatistics(file, 'success');
  //           } else {
  //             console.log(
  //               chalk.reset.inverse.bold.yellow(' EMPTY '),
  //               `${chalk.dim(folder)}/${chalk.bold(file)} \u2192 ${chalk.dim(folderPath)}/${chalk.bold(
  //                 fileName + '.md'
  //               )}`
  //             );

  //             addToStatistics(file, 'empty');
  //           }
  //         }
  //       }
  //     });

  //     return Promise.resolve(files);
  //   } catch (e) {
  //     const error = e as Record<string, string>;
  //     console.log(error);
  //     if (error.code === 'ENOENT') {
  //       console.log('cannot find source folder');
  //     } else {
  //       console.log(error.message);
  //     }
  //   }
  // };

  // // create docs folder
  // mkdirp(docsFolder).then(async () => {
  //   const startTime = +new Date();
  //   // read folder files
  //   await readFiles(srcFolder, 0, fileTree);

  //   await fs.writeFile(
  //     `${docsFolder}/config.js`,
  //     `exports.fileTree=${JSON.stringify(fileTree)};exports.sidebarTree = (title = 'Mainpage') => (${JSON.stringify(
  //       vueSidebar({
  //         fileTree,
  //         codeFolder,
  //         title
  //       })
  //     ).replace('::vuepress-jsdoc-title::', '"+title+"')});`
  //   );

  //   // create README.md
  //   let readMeContent = `### Welcome to ${title}`;
  //   const readmePath = readme || `${srcFolder}/README.md`;

  //   try {
  //     readMeContent = await fs.readFile(readmePath, 'utf-8');
  //     if (deletedPaths.some(p => p.indexOf(`${codeFolder}/README.md`) !== -1)) {
  //       console.log(`\n${chalk.black.bgYellow('found')} ${readmePath} and copies content to ${docsFolder}/README.md`);
  //     }
  //   } catch (e) {
  //     console.log(`${chalk.white.bgBlack('skipped')} copy README.md`);
  //   }

  //   // Do nothing if README.md already exists
  //   try {
  //     readMeContent = await fs.readFile(`${docsFolder}/README.md`, 'utf-8');
  //     console.log(`\n${chalk.yellow(`${docsFolder}/README.md already exists`)}`);
  //   } catch (e) {
  //     await fs.writeFile(`${docsFolder}/README.md`, readMeContent);
  //   }

  //   const resultTime = (Math.abs(startTime - +new Date()) / 1000).toFixed(2);

  //   // get longest type string
  //   const maxExtLength = Object.keys(statistics).length
  //     ? Math.max.apply(
  //         null,
  //         Object.keys(statistics).map(w => w.length)
  //       )
  //     : 0;

  //   const errorCount = Object.keys(statistics).reduce((b, c) => b + statistics[c].error, 0);

  //   // iterate trough stats
  //   console.log();
  //   Object.entries(statistics)
  //     .sort()
  //     .forEach(([extension, types]) => {
  //       const content = Object.keys(statusTypes)
  //         .map(key => types[key] && chalk[statusTypes[key]].bold(`${types[key]} ${key}`))
  //         .filter(Boolean)
  //         .join(' ');

  //       const total = Object.keys(statusTypes).reduce((before, curr) => before + types[curr], 0);

  //       console.log(
  //         `${extension}${Array(Math.round(maxExtLength - extension.length + maxExtLength / 2)).join(
  //           ' '
  //         )}|  ${content} - ${total} total`
  //       );
  //     });

  //   console.log(`\n⏰ Time: ${resultTime}s\n`);

  //   process.exit(errorCount ? 1 : 0);
  // });
};
