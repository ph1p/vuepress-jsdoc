'use strict';

const fs = require('fs.promised/promisify')(require('bluebird'));
const path = require('path');
const mkdirp = require('mkdirp');
const jsdoc2md = require('jsdoc-to-markdown');
const del = require('del');
const mm = require('micromatch');
const chalk = require('chalk');

const vueSidebar = require('../helpers/vue-sidebar');
const parseVuepressComment = require('../helpers/comment-parser');
const { checkExtension, getFilename, asyncForEach } = require('../helpers/utils');
const vueDocToMarkdown = require('../helpers/vue-docgen-to-markdown');

const fileTree = [];

const extensions = ['.ts', '.js', '.tsx', '.jsx', '.vue'];

/**
 * Default command that generate md files
 * @param {object} argv Arguments passed by yargs
 */
async function generate(argv) {
  const exclude = (argv.exclude && argv.exclude.split(',')) || [argv.exclude || ''];
  const srcFolder = argv.source;
  const codeFolder = argv.folder;
  const docsFolder = `${argv.dist}/${codeFolder}`;
  const title = argv.title;
  const readme = argv.readme;
  const rmPattern = argv.rmPattern || [];

  // remove docs folder, except README.md
  const deletedPaths = await del([docsFolder + '/**/*', `!${docsFolder}/README.md`, ...rmPattern]);

  /**
   * Read all files in directory
   * @param {string} folder
   * @param {number} depth
   * @param {array} tree
   */
  const readFiles = async (folder, depth = 0, tree) => {
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
        if (exclude && mm.contains(`${folder}/${file}`, exclude)) {
          console.log(chalk.black.bgBlue('exclude'), `${folder}/${file}`);
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
            let files = await fs.readdir(`${folder}/${file}`);

            files = files.filter(f => !mm.contains(f, exclude));

            if (files.length > 0) {
              await fs.mkdir(`${folderPath}/${file}`);
            }
          } catch (err) {
            console.log(err);
            console.log(chalk.yellow('cannot create folder, because it already exists'), `${folderPath}/${file}`);
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
              mdFileData = await vueDocToMarkdown(`${folder}/${file}`);
            } else if (/\.(js|ts|jsx|tsx)$/.test(file) && fileData) {
              const configPath = argv.jsDocConfigPath;

              try {
                // render file
                mdFileData = await jsdoc2md.render({
                  source: fileData,
                  configure: configPath,
                  partial: [
                    path.resolve(__filename, '../../template/header.hbs'),
                    path.resolve(__filename, '../../template/main.hbs')
                  ]
                });
              } catch (e) {
                const isConfigExclude = e.message.includes('no input files');

                if (!isConfigExclude) {
                  console.log(e.message);
                }

                console.log(
                  chalk.black.bgRed(isConfigExclude ? 'exclude by config' : 'error'),
                  `${folder}/${file} -> ${folderPath}/${fileName}.md`
                );
              }
            }

            if (mdFileData) {
              const { frontmatter, attributes } = parseVuepressComment(fileData);

              console.log(chalk.black.bgGreen('write file'), `${folder}/${file} -> ${folderPath}/${fileName}.md`);

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
                path: '/' + fileName,
                fullPath: `${folderPath.replace(`${docsFolder}/`, '')}/${fileName}`
              });
            }
          }
        }
      });

      return Promise.resolve(files);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('cannot find source folder');
      } else {
        console.log(err);
      }
    }
  };

  // create docs folder
  mkdirp(docsFolder, async () => {
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
    let readMeContent = '### Welcome to ' + title;
    let readmePath = readme || `${srcFolder}/README.md`;

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

    console.log(`\n${chalk.green.bold('Finished! 👍 ')}`);
  });
}

module.exports = {
  generate,
  plugin: (options, ctx) => ({
    name: 'vuepress-plugin-jsdoc',
    generate: generate(options, ctx)
  })
};
