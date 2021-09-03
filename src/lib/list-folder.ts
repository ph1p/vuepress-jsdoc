/*
 * @vuepress
 * ---
 * headline: lib/list-folder.ts
 * ---
 */
import fs from 'fs/promises';
import mm from 'micromatch';
import path from 'path';

import { DirectoryFile, FileTree } from '../interfaces';

/**
 * Recursively traverse folders and return exluded files, a file list and a file tree.
 * @param srcPath
 * @param exclude
 * @param mainPath
 * @param tree
 * @returns {object} paths array, tree, excluded array
 */
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
    const folder = filePath.replace(name, '').replace(ext, '');

    if (name === 'index') {
      name = '__index__';
    }

    const file = {
      isDir,
      name,
      path: filePath,
      ...(!isDir ? { ext, folder } : {})
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
