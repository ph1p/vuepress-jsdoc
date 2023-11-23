/*
 * @vuepress
 * ---
 * headline: lib/list-folder.ts
 * ---
 */
import mm from 'micromatch';
import fs from 'node:fs/promises';
import path from 'node:path';

import { DirectoryFile, FileTree } from '../interfaces';

/**
 * Recursively traverse folders and return exluded files, a file list and a file tree.
 * @param {string} srcPath path to source dir
 * @param {array} exclude exluded file patter list
 * @param {array} include included file patter list
 * @param {string} mainPath path to hold source dir
 * @param {object} tree tree array
 * @returns {object} paths array, tree, excluded array
 */
export const listFolder = async (
  srcPath: string,
  exclude: string[],
  include: string[],
  mainPath?: string,
  tree: FileTree[] = []
) => {
  if (!Boolean(exclude) || !Array.isArray(exclude)) {
    exclude = [];
  }

  if (!Boolean(include) || !Array.isArray(include)) {
    include = [];
  }

  exclude = exclude.filter(Boolean);
  include = include.filter(Boolean);

  const paths: DirectoryFile[] = [];
  const excluded: DirectoryFile[] = [];

  const dirs = srcPath
    ? await fs.readdir(srcPath, {
        withFileTypes: true
      })
    : [];

  for (const dirent of dirs) {
    const filePath = path.join(srcPath, dirent.name);
    const isDir = dirent.isDirectory();
    const ext = path.extname(filePath);
    let name = path.basename(filePath).replace(ext, '');
    const folder = filePath.replace(name, '').replace(ext, '');

    if (name.endsWith('index')) {
      name = srcPath.replace(/\//g, '-') + '-' + name;
    }

    const file = {
      isDir,
      name,
      path: filePath,
      ...(!isDir ? { ext, folder } : {})
    };

    // skip readmes as they are automatically resolved
    if (name.toLowerCase() === 'readme') continue;

    const baseSrc = mainPath || srcPath;

    if (
      mm.every(path.join(srcPath.replace(baseSrc, ''), dirent.name), [...include, ...exclude.map((e) => '!' + e)]) ||
      isDir
    ) {
      let treeEntry: FileTree = {
        name
      };

      if (isDir) {
        treeEntry.children = [];
        paths.push(...(await listFolder(filePath, exclude, include, baseSrc, treeEntry.children)).paths);
      } else {
        treeEntry = {
          ...treeEntry,
          path: `/${name}`,
          fullPath: path.join(srcPath, name),
          ext
        };
      }

      tree.push(treeEntry);
      paths.push(file);
    } else {
      excluded.push(file);
    }
  }

  return { paths, tree, excluded };
};
