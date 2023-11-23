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
