/*
 * @vuepress
 * ---
 * headline: lib/utils.ts
 * ---
 */

import { readFileSync } from 'fs';
import { isAbsolute, posix } from 'path';
import YAML from 'yaml';

/**
 * Read file sync
 * @param {string} path
 * @returns {String} File content
 */
export const readFile = (path: string, options: object = {}): string =>
  readFileSync(path, {
    encoding: 'utf8',
    ...options
  });

/**
 * Get extension of file
 * @param {string} path
 * @returns {string} extension of file
 */
export const getExtension = (path: string) =>
  path && typeof path === 'string' ? path.substring(path.length, path.lastIndexOf('.')) : '';

/**
 * Check if extension ist correct
 * @param {string} path
 * @param {string[]} extensions
 * @returns {boolean}
 */
export const checkExtension = (path: string, extensions: string[]) => {
  if (!extensions || !path || typeof path !== 'string') return false;

  return extensions.indexOf(getExtension(path)) >= 0;
};

/**
 * Returns an absolute path (POSIX format)
 * @param {string} path
 * @param {string?} root - The root path (default: `process.cwd()`). If path argument is relative, it will be resolved with this value.
 * @returns {string} Absolute path
 */
export const toAbsolutePath = (path: string, root?: string): string => {
  return isAbsolute(path) ? posix.resolve(path) : posix.join(root || process.cwd(), path);
};

/**
 * Converts front matter object to string
 * @param {Object} fmObj - The front matter object to convert
 * @returns {string|null}
 */
export const frontMatterToString = (fmObj: object) => {
  let str = '';
  // If object is not empty
  if (Object.keys(fmObj).length) {
    str += '---\n';
    str += YAML.stringify(fmObj);
    str += '---';
  }
  return str.length ? str : null;
};
