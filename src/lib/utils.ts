/**
 * Get extension of file
 * @param path
 * @returns extension of file
 */
export const getExtension = (path: string) => path.substring(path.length, path.lastIndexOf('.'));

/**
 * Check if extension ist correct
 * @param path
 * @param extensions
 * @returns boolean
 */
export const checkExtension = (path: string, extensions: string[]) => extensions.indexOf(getExtension(path)) >= 0;

/**
 * Get filename without extension
 * @param path
 * @returns filename
 */
export const getFilename = (path: string) =>
  path
    ?.split('/')
    ?.pop()
    ?.substring(0, path.lastIndexOf('.')) || '';

/**
 * Async foreach loop
 * @param array
 * @param callback
 */
export const asyncForEach = async (
  array: any[],
  callback: (result: any, index: number, array: any[]) => Promise<void>
) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
