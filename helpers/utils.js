'use strict';

/**
 * Get extension of file
 *
 * @param {string} path
 * @returns extension of file
 */
const getExtension = path => path.substring(path.length, path.lastIndexOf('.'));

/**
 * Check if extension ist correct
 *
 * @param {string} path
 * @param {array} extensions
 * @returns a boolean
 */
const checkExtension = (path, extensions) => extensions.indexOf(getExtension(path)) >= 0;

/**
 * Get filename without extension
 *
 * @param {string} path
 * @returns filename
 */
const getFilename = path =>
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
const asyncForEach = async function(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

module.exports = {
  getExtension,
  checkExtension,
  getFilename,
  asyncForEach
};
