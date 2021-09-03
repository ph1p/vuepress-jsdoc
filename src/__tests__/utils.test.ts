import { checkExtension, getExtension, getFilename } from '../lib/utils';

describe('test utils', () => {
  test('getExtension should return true', () => {
    expect(getExtension('./dir/test.jpg')).toBe('.jpg');
  });
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
    // @ts-ignore
    expect(getFilename(undefined)).toBe('');
    // @ts-expect-error check empty method
    expect(getFilename()).toBe('');
  });
});
