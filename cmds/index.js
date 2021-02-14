'use strict';

const fs = require('fs.promised/promisify')(require('bluebird'));
const path = require('path');
const mkdirp = require('mkdirp');
const jsdoc2md = require('jsdoc-to-markdown');
const del = require('del');
const mm = require('micromatch');
const chalk = require('chalk');
const child_process = require('child_process');

const vueSidebar = require('../helpers/vue-sidebar');
const parseVuepressComment = require('../helpers/comment-parser');
const { checkExtension, getExtension, getFilename, asyncForEach } = require('../helpers/utils');

const fileTree = [];
const statistics = {};
const statusTypes = {
  success: 'green',
  error: 'red',
  exclude: 'blueBright',
  empty: 'yellow'
};

const extensions = ['.ts', '.js', '.tsx', '.jsx', '.vue'];

/**A
 * Add status and count to result
 * @param {string} file
 * @param {string} status
 * @param {boolean} isFolder
 */
const addToStatistics = (file, status, isFolder = false) => {
  const extension = !isFolder ? getExtension(file) : 'folder';

  if (!statistics[extension]) {
    statistics[extension] = Object.keys(statusTypes).reduce((before, curr) => ({ ...before, [curr]: 0 }), {});
  }
  statistics[extension][status]++;
};

/**
 * Default command that generate md files
 * @param {object} argv passed arguments
 */
async function generate(argv) {
  const exclude = (argv.exclude && argv.exclude.split(',')) || [argv.exclude || ''];
  const srcFolder = argv.source;
  const codeFolder = argv.folder;
  const docsFolder = `${argv.dist}/${codeFolder}`;
  const title = argv.title;
  const readme = argv.readme;
  const rmPattern = argv.rmPattern || [];
  const partials = argv.partials || [];

  // remove docs folder, except README.md
  const deletedPaths = await del([`${docsFolder}/**/*`, `!${docsFolder}/README.md`, ...rmPattern]);

  /**
   * Read all files in directory
   * @param {string} folder
   * @param {number} depth
   * @param {array} tree
   */
  const readFiles = async (folder, depth, tree) => {
    try {
      // get all files
      const files = await fs.readdir(folder);
      const completeFolderPath = folder.replace(srcFolder, '');

      // if this is not a subdir
      let folderPath = docsFolder;

      // generate correct docs folder path
      if (depth > 0) {
        folderPath += completeFolderPath;
      }

      // iterate through all files in folder
      await asyncForEach(files, async file => {
        if (exclude && mm.contains(`${chalk.dim(folder)}/${file}`, exclude)) {
          console.log(chalk.reset.inverse.bold.blueBright(' EXCLUDE '), `${chalk.dim(folder)}/${chalk.bold(file)}`);

          addToStatistics(file, 'exclude');
          return;
        }

        const stat = await fs.lstat(`${folder}/${file}`);

        let fileName = getFilename(file);

        // prefix index with unserscore, the generated index.html comes from vuepress
        if (fileName === 'index') {
          fileName = '_index';
        }

        if (stat.isDirectory(folder)) {
          // check file length and skip empty folders
          try {
            let dirFiles = await fs.readdir(`${folder}/${file}`);

            dirFiles = dirFiles.filter(f => !mm.contains(f, exclude));

            if (dirFiles.length > 0) {
              await fs.mkdir(`${folderPath}/${file}`);
            }

            addToStatistics(file, 'success', true);
          } catch (error) {
            console.log(error.message);
            console.log(
              chalk.yellow('cannot create folder, because it already exists'),
              `${chalk.dim(folderPath)}/${file}`
            );

            addToStatistics(file, 'error', true);
          }

          // Add to tree
          tree.push({
            name: file,
            children: []
          });

          // read files from subfolder
          await readFiles(`${folder}/${file}`, depth + 1, tree.filter(treeItem => file === treeItem.name)[0].children);
        }
        // Else branch accessed when file is not a folder
        else {
          // check if extension is correct
          if (checkExtension(file, extensions)) {
            const fileData = await fs.readFile(`${folder}/${file}`, 'utf8');
            let mdFileData = '';

            if (/\.vue$/.test(file)) {
              const nodeModulesPath = path.join(path.dirname(fs.realpathSync(__filename)), '../node_modules');
              process.chdir(folder);
              child_process.execSync(`${nodeModulesPath}/.bin/vue-docgen ${file} ${path.join('../', folderPath)}`);
              process.chdir('../');

              mdFileData = fs.readFileSync(`${folderPath}/${fileName}.md`, 'utf-8');
            } else if (/\.(js|ts|jsx|tsx)$/.test(file) && fileData) {
              const configPath = argv.jsDocConfigPath;

              try {
                // render file
                mdFileData = await jsdoc2md.render({
                  files: [`${folder}/${file}`],
                  configure: configPath,
                  partial: [
                    path.resolve(__filename, '../../template/header.hbs'),
                    path.resolve(__filename, '../../template/main.hbs'),
                    ...partials
                  ]
                });
              } catch (error) {
                const isConfigExclude = error.message.includes('no input files');

                console.log(
                  chalk.reset.inverse.bold.red(isConfigExclude ? ' EXCLUDE BY CONFIG ' : ' ERROR '),
                  `${chalk.dim(folder)}/${chalk.bold(file)} \u2192 ${chalk.dim(folderPath)}/${chalk.bold(
                    fileName + '.md'
                  )}`
                );

                if (!isConfigExclude) {
                  console.log(error.message);

                  addToStatistics(file, 'error');
                }
              }
            }

            if (mdFileData) {
              const { frontmatter, attributes } = parseVuepressComment(fileData);

              console.log(
                chalk.reset.inverse.bold.green(' SUCCESS '),
                `${chalk.dim(folder)}/${chalk.bold(file)} \u2192 ${chalk.dim(folderPath)}/${chalk.bold(
                  fileName + '.md'
                )}`
              );

              let fileContent = '---\n';

              fileContent += !attributes || !attributes.title ? `title: ${fileName}` : '';

              if (frontmatter) {
                fileContent += !attributes || !attributes.title ? '\n' : '';
                fileContent += `${frontmatter}`;
              }

              fileContent += '\n---\n';
              if ((attributes && attributes.title) || !/\.vue$/.test(file)) {
                let headline = fileName;

                if (attributes && attributes.headline) {
                  headline = attributes.headline;
                } else if (attributes && attributes.title) {
                  headline = attributes.title;
                }

                fileContent += `\n# ${headline}\n\n`;
              }
              fileContent += mdFileData;

              await fs.writeFile(`${folderPath}/${fileName}.md`, fileContent);

              tree.push({
                name: fileName,
                path: `/${fileName}`,
                fullPath: `${folderPath.replace(`${docsFolder}/`, '')}/${fileName}`
              });

              addToStatistics(file, 'success');
            } else {
              console.log(
                chalk.reset.inverse.bold.yellow(' EMPTY '),
                `${chalk.dim(folder)}/${chalk.bold(file)} \u2192 ${chalk.dim(folderPath)}/${chalk.bold(
                  fileName + '.md'
                )}`
              );

              addToStatistics(file, 'empty');
            }
          }
        }
      });

      return Promise.resolve(files);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('cannot find source folder');
      } else {
        console.log(error.message);
      }
    }
  };

  // create docs folder
  mkdirp(docsFolder).then(async () => {
    const startTime = +new Date();
    // read folder files
    await readFiles(srcFolder, 0, fileTree);

    await fs.writeFile(
      `${docsFolder}/config.js`,
      `exports.fileTree=${JSON.stringify(fileTree)};exports.sidebarTree = (title = 'Mainpage') => (${JSON.stringify(
        vueSidebar({
          fileTree,
          codeFolder,
          title
        })
      ).replace('::vuepress-jsdoc-title::', '"+title+"')});`
    );

    // create README.md
    let readMeContent = `### Welcome to ${title}`;
    const readmePath = readme || `${srcFolder}/README.md`;

    try {
      readMeContent = await fs.readFile(readmePath, 'utf-8');
      if (deletedPaths.some(p => ~p.indexOf(`${codeFolder}/README.md`))) {
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

    // get longest type string
    const maxExtLength = Math.max.apply(
      null,
      Object.keys(statistics).map(w => w.length)
    );

    console.log(`\n${Array(maxExtLength + maxExtLength / 2).join('-')}`);

    const errorCount = Object.keys(statistics).reduce((b, c) => b + statistics[c].error, 0);
    // iterate trough stats
    Object.entries(statistics)
      .sort()
      .forEach(([extension, types]) => {
        const content = Object.keys(statusTypes)
          .map(key => types[key] && chalk[statusTypes[key]].bold(`${types[key]} ${key}`))
          .filter(Boolean)
          .join(' ');

        const total = Object.keys(statusTypes).reduce((before, curr) => before + types[curr], 0);

        console.log(
          `${extension}${Array(maxExtLength - extension.length + maxExtLength / 2).join(
            ' '
          )}|  ${content} - ${total} total`
        );
      });

    console.log(`${Array(maxExtLength + maxExtLength / 2).join('-')}\nTime: ${resultTime}s\n`);

    process.exit(errorCount ? 1 : 0);
  });
}

module.exports = {
  generate,
  plugin: (options, ctx) => ({
    name: 'vuepress-plugin-jsdoc',
    generate: generate(options, ctx)
  })
};
