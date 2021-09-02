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
  const excluded: DirectoryFile[] = [];

  const dirs = await fs.readdir(srcPath, {
    withFileTypes: true
  });

  for (const dirent of dirs) {
    const filePath = path.join(srcPath, dirent.name);
    const isDir = dirent.isDirectory();
    const ext = path.extname(filePath);
    let name = path.basename(filePath).replace(ext, '');

    if (name === 'index') {
      name = '_index';
    }

    const file = {
      isDir,
      name,
      path: filePath,
      ...(!isDir ? { ext, folder: filePath.replace(name, '').replace(ext, '') } : {})
    };

    // skip readmes as they are automatically resolved
    if (name.toLowerCase() === 'readme') continue;

    if (!mm.isMatch(path.join(srcPath.replace(mainPath || srcPath, ''), dirent.name), exclude)) {
      const treeEntry: FileTree = {
        name,
        ...(!isDir ? { path: `/${name}`, fullPath: path.join(srcPath, name), ext } : {})
      };

      tree.push(treeEntry);

      if (isDir) {
        treeEntry.children = [];
        paths.push(...(await listFolder(filePath, exclude, mainPath || srcPath, treeEntry.children)).paths);
      }

      paths.push(file);
    } else {
      excluded.push(file);
    }
  }

  return { paths, tree, excluded };
};
