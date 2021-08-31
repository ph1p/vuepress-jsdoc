/**
 * Get extension of file
 *
 * @param {string} path
 * @returns extension of file
 */
export const getExtension = (path: string) => path.substring(path.length, path.lastIndexOf('.'));

/**
 * Check if extension ist correct
 *
 * @param {string} path
 * @param {array} extensions
 * @returns a boolean
 */
export const checkExtension = (path: string, extensions: string[]) => extensions.indexOf(getExtension(path)) >= 0;

/**
 * Get filename without extension
 *
 * @param {string} path
 * @returns filename
 */
export const getFilename = (path: string) =>
  path
    ?.split('/')
    ?.pop()
    ?.substring(0, path.lastIndexOf('.')) || '';

/**
 * Async foreach loop
 * @param {array} array
 * @param {function} callback
 */
export const asyncForEach = async (array: any[], callback: (result: any, index: number, array: any[]) => void) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
