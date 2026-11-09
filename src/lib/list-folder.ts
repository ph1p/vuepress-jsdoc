/*
 * @vuepress
 * ---
 * headline: lib/list-folder.ts
 * ---
 */
import mm from 'micromatch';
import fs from 'node:fs/promises';
import path from 'node:path';

import { SCRIPT_EXTENSIONS, VUE_EXTENSIONS } from '../constants.js';
import { DirectoryFile, FileTree } from '../interfaces.js';

export interface ListFolderResult {
  /** All files which should be parsed */
  paths: DirectoryFile[];
  /** Folder structure of all parsable files */
  tree: FileTree[];
  /** Files which were excluded by the include/exclude patterns */
  excluded: DirectoryFile[];
}

const SUPPORTED_EXTENSIONS = [...SCRIPT_EXTENSIONS, ...VUE_EXTENSIONS];

/**
 * Normalize a path to a posix path without leading `./` and trailing slash
 * @param {string} p path
 * @returns {string} normalized path
 */
export const normalizePath = (p: string) => path.posix.normalize(p.split(path.sep).join('/')).replace(/\/$/, '') || '.';

/**
 * Normalize pattern lists, which may be passed as comma separated string or array
 * @param {string|string[]} patterns patterns
 * @returns {string[]} list of non empty patterns
 */
const toPatternList = (patterns: unknown): string[] => {
  if (typeof patterns === 'string') return patterns.split(',').filter(Boolean);
  if (Array.isArray(patterns)) return patterns.filter((p) => typeof p === 'string' && p.length > 0);
  return [];
};

/**
 * Check if a file should be documented
 * @param {string} fileName name of the file
 * @returns {boolean}
 */
const isSupportedFile = (fileName: string) =>
  SUPPORTED_EXTENSIONS.includes(path.extname(fileName)) && !/\.d\.[cm]?ts$/.test(fileName);

/**
 * Get the page name of a file. Index files are prefixed with their folder,
 * because an `index.md` would collide with the `README.md` of the folder.
 * @param {string} dir directory of the file
 * @param {string} name file name without extension
 * @returns {string} page name
 */
export const getPageName = (dir: string, name: string) => {
  if (name !== 'index') return name;

  const prefix = dir
    .split('/')
    .filter((segment) => segment && segment !== '.' && segment !== '..')
    .join('-');

  return `${prefix || path.basename(path.resolve(dir))}-${name}`;
};

/**
 * Recursively traverse folders and return excluded files, a file list and a file tree.
 * Only `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.mts`, `.cts` and `.vue` files are listed.
 * Hidden folders and `node_modules` are skipped.
 * @param {string} srcPath path to source dir
 * @param {string[]} exclude excluded file pattern list (relative to srcPath)
 * @param {string[]} include included file pattern list (relative to srcPath)
 * @returns {Promise<ListFolderResult>} paths array, tree, excluded array
 */
export const listFolder = async (
  srcPath: string,
  exclude: string[] = [],
  include: string[] = []
): Promise<ListFolderResult> => {
  const excludePatterns = toPatternList(exclude);
  const includePatterns = toPatternList(include);
  const patterns = [...includePatterns, ...excludePatterns.map((e) => '!' + e)];

  const paths: DirectoryFile[] = [];
  const excluded: DirectoryFile[] = [];
  const tree: FileTree[] = [];

  if (!srcPath || typeof srcPath !== 'string') {
    return { paths, tree, excluded };
  }

  const root = normalizePath(srcPath);

  const walk = async (dir: string, subTree: FileTree[]) => {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    dirents.sort((a, b) => a.name.localeCompare(b.name));

    const files = dirents.filter((d) => !d.isDirectory());
    const dirs = dirents.filter((d) => d.isDirectory());

    for (const dirent of files) {
      if (!isSupportedFile(dirent.name)) continue;

      const filePath = path.posix.join(dir, dirent.name);
      const relativePath = path.posix.relative(root, filePath);
      const ext = path.extname(dirent.name);
      const name = getPageName(dir, path.basename(dirent.name, ext));
      const folder = `${dir}/`;

      const file: DirectoryFile = { name, ext, folder, path: filePath };

      if (patterns.length && !mm.every(relativePath, patterns)) {
        excluded.push(file);
        continue;
      }

      paths.push(file);
      subTree.push({
        name,
        path: `/${name}`,
        fullPath: path.posix.join(dir, name),
        ext
      });
    }

    for (const dirent of dirs) {
      if (dirent.name.startsWith('.') || dirent.name === 'node_modules') continue;

      const dirPath = path.posix.join(dir, dirent.name);
      const relativeDir = path.posix.relative(root, dirPath);

      // a folder can be excluded as a whole, e.g. --exclude="tests" or --exclude="**/__tests__"
      if (excludePatterns.length && mm.isMatch(relativeDir, excludePatterns)) continue;

      const children: FileTree[] = [];
      await walk(dirPath, children);

      // do not add empty folders to the tree
      if (children.length > 0) {
        subTree.push({ name: dirent.name, children });
      }
    }
  };

  await walk(root, tree);

  return { paths, tree, excluded };
};
