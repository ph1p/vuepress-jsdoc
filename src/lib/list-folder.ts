import chalk from 'chalk';
import fs from 'fs/promises';
import mm from 'micromatch';
import path from 'path';

import { DirectoryFile } from '../interfaces';

export const listFolder = async (srcPath: string, exclude: string[] = [], mainPath?: string) => {
  const paths: DirectoryFile[] = [];
  const dirs = await fs.readdir(srcPath, {
    withFileTypes: true
  });

  for (const dirent of dirs) {
    const filePath = path.join(srcPath, dirent.name);
    const isDir = dirent.isDirectory();
    const ext = path.extname(filePath);
    let name = path.basename(filePath).replace(ext, '');

    if (!mm.isMatch(path.join(srcPath.replace(mainPath || srcPath, ''), dirent.name), exclude)) {
      if (isDir) {
        paths.push(...(await listFolder(filePath, exclude, mainPath || srcPath)));
      }

      if (name === 'index') {
        name = '_index';
      }

      paths.push({
        isDir,
        name,
        path: filePath,
        ...(!isDir ? { ext, folder: filePath.replace(name, '').replace(ext, '') } : {})
      });
    } else {
      // excluded
      console.log(chalk.reset.inverse.bold.blue('EXCLUDE BY CONFIG '), `${chalk.dim('src')}/${chalk.bold(name + ext)}`);
    }
  }

  return paths;
};
