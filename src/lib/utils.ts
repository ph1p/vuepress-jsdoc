/*
 * @vuepress
 * ---
 * headline: lib/utils.ts
 * ---
 */
/**
 * Get extension of file
 * @param path {string}
 * @returns {string} extension of file
 */
export const getExtension = (path: string) => path.substring(path.length, path.lastIndexOf('.'));

/**
 * Check if extension ist correct
 * @param path {string}
 * @param extensions {string[]}
 * @returns {boolean}
 */
export const checkExtension = (path: string, extensions: string[]) => extensions.indexOf(getExtension(path)) >= 0;

/**
 * Get filename without extension
 * @param path {string}
 * @returns {string} filename
 */
export const getFilename = (path: string) =>
  path
    ?.split('/')
    ?.pop()
    ?.substring(0, path.lastIndexOf('.')) || '';
