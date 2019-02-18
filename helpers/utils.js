'use strict';

/**
 * Check if extension ist correct
 *
 * @param {string} path
 * @param {array} extensions
 * @returns extension of file
 */
exports.checkExtension = (path, extensions) =>
  extensions.indexOf(path.substring(path.length, path.lastIndexOf('.'))) >= 0;

/**
 * Get filename without extension
 *
 * @param {string} path
 * @returns filename
 */
exports.getFilename = path =>
  (path &&
    path
      .split('/')
      .pop()
      .substring(0, path.lastIndexOf('.'))) ||
  '';

/**
 * Async foreach loop
 * @param {array} array
 * @param {function} callback
 */
exports.asyncForEach = async function(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
