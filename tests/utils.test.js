'use strict';

const { checkExtension, getFilename } = require('../helpers/utils');

describe('test utils', () => {
  test('checkExtension should return true', () => {
    expect(checkExtension('./dir/test.jpg', ['.jpg'])).toBe(true);
  });
  test('checkExtension should return false', () => {
    expect(checkExtension('test.jpg', ['.vue'])).toBe(false);
  });
  test('getFilename should return only filename', () => {
    expect(getFilename('../path/to/test-file.js')).toBe('test-file.js');
  });
  test('getFilename should return empty string', () => {
    expect(getFilename(undefined)).toBe('');
    expect(getFilename()).toBe('');
  });
});
