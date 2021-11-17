/*
 * @vuepress
 * ---
 * headline: lib/utils.ts
 * ---
 */
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
 * Get filename without extension
 * @param {string} path
 * @returns {string} filename
 */
export const getFilename = (path: string) => {
  if (!path || (path && typeof path !== 'string')) return '';

  const splitted = path.split('/').pop() ?? path;

  return splitted.substring(0, splitted.lastIndexOf('.'));
};
