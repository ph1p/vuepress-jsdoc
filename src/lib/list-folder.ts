import chalk from 'chalk';
import fs from 'fs/promises';
import mm from 'micromatch';
import path from 'path';

import { DirectoryFile } from '../interfaces';

interface FileTree {
  name: string;
  path?: string;
  fullPath?: string;
  children?: FileTree[];
}

export const listFolder = async (srcPath: string, exclude: string[] = [], mainPath?: string, tree: FileTree[] = []) => {
  const paths: DirectoryFile[] = [];

  const dirs = await fs.readdir(srcPath, {
    withFileTypes: true
  });

  for (const dirent of dirs) {
    const filePath = path.join(srcPath, dirent.name);
    const isDir = dirent.isDirectory();
    const ext = path.extname(filePath);
    let name = path.basename(filePath).replace(ext, '');

    // skip readmes as they are automatically resolved
    if (name.toLowerCase() === 'readme') continue;

    if (!mm.isMatch(path.join(srcPath.replace(mainPath || srcPath, ''), dirent.name), exclude)) {
      if (name === 'index') {
        name = '_index';
      }

      const treeEntry: FileTree = {
        name,
        ...(!isDir ? { path: `/${name}`, fullPath: path.join(srcPath, name) } : {})
      };

      tree.push(treeEntry);

      if (isDir) {
        treeEntry.children = [];
        paths.push(...(await listFolder(filePath, exclude, mainPath || srcPath, treeEntry.children)).paths);
      }

      paths.push({
        isDir,
        name,
        path: filePath,
        ...(!isDir ? { ext, folder: filePath.replace(name, '').replace(ext, '') } : {})
      });
    } else {
      // excluded
      console.log(chalk.reset.inverse.bold.blue(' EXCLUDE '), `${chalk.dim('src')}/${chalk.bold(name + ext)}`);
    }
  }

  return { paths, tree };
};
