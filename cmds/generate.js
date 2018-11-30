// const fs = require('fs/promises');
const fs = require('fs.promised/promisify')(require('bluebird'));
const path = require('path');
const mkdirp = require('mkdirp');
const jsdoc2md = require('jsdoc-to-markdown');
const vuedoc = require('@vuedoc/md');
const rimraf = require('rimraf');

const vueSidebar = require('./helpers/vueSidebar');
const parseVuepressComment = require('./helpers/commentParser');

const fileTree = [];

const extensions = ['.ts', '.js', '.vue'];

/**
 * Default command that generate md files
 * @param {Object} argv Arguments passed by yargs
 */
function generate (argv) {
  const srcFolder = argv.source;
  const codeFolder = argv.folder;
  const docsFolder = `${argv.dist}/${codeFolder}`;
  const title = argv.title;

  // remove docs folder
  rimraf(docsFolder, () =>
    // create docs folder
    mkdirp(docsFolder, async () => {
      // read folder files
      await readFiles(srcFolder, 0, fileTree);

      await fs.writeFile(
        `${docsFolder}/config.js`,
        `exports.fileTree=${JSON.stringify(fileTree, null, 4)};
  exports.sidebarTree=${JSON.stringify(vueSidebar({ fileTree, codeFolder, title }), null, 4)};`
      );

      // create README.md
      await fs.writeFile(`${docsFolder}/README.md`, `Welcome`);
    })
  );

  /**
   * Check if extension ist correct
   *
   * @param {string} path
   * @param {array} extensions
   * @returns extension of file
   */
  const checkExtension = (path, extensions) =>
    extensions.indexOf(path.substring(path.length, path.lastIndexOf('.'))) >= 0;

  /**
   * Get filename without extension
   *
   * @param {string} path
   * @returns filename
   */
  const getFilename = path =>
    path
      .split('/')
      .pop()
      .substring(0, path.lastIndexOf('.')) || '';

  /**
   * Read all files in directory
   *
   * @param {any} parameter
   */
  const readFiles = async (folder, depth = 0, tree) => {
    try {
      // get all files
      const files = await fs.readdir(folder);
      const currentFolderName = folder.split('/').pop();
      const completeFolderPath = folder.replace(srcFolder, '');

      // if this is not a subdir
      let folderPath = docsFolder;

      // generate correct docs folder path
      if (depth > 0) {
        folderPath += completeFolderPath;
      }

      // iterate through all files in folder
      await asyncForEach(files, async file => {
        const stat = await fs.lstat(`${folder}/${file}`);

        let fileName = getFilename(file);

        // prefix index with unserscore, the generated index.html comes from vuepress
        if (fileName === 'index') {
          fileName = '_index';
        }

        if (stat.isDirectory(folder)) {
          // check file length and skip empty folders
          try {
            await fs.mkdir(`${folderPath}/${file}`);
          } catch (err) {
            console.log(`can't create folder, because it already exists`, `${folderPath}/${file}`);
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
              mdFileData = await vuedoc.md({
                filename: `${folder}/${file}`
              });
            } else if (/\.(js|ts)$/.test(file)) {
              // render file
              mdFileData = await jsdoc2md.render({
                source: fileData,
                partial: [
                  path.resolve(__dirname, './template/header.hbs'),
                  path.resolve(__dirname, './template/main.hbs')
                ]
              });
            }

            if (mdFileData !== '') {
              const { frontmatter } = parseVuepressComment(fileData);

              console.log('write file', `${folderPath}/${fileName}.md`);

              await fs.writeFile(`${folderPath}/${fileName}.md`, `---\n${frontmatter || `title: ${fileName}`}\n---\n${mdFileData}`);

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
}

/**
 * Async foreach loop
 * @param {*} array
 * @param {*} callback
 */
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

module.exports = generate
