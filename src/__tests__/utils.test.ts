import { checkExtension, getExtension } from '../lib/utils';

describe('test utils', () => {
  describe('getExtension()', () => {
    test('should return .jpg', () => {
      expect(getExtension('./dir/test.jpg')).toBe('.jpg');
    });
    test('should return empty string', () => {
      // @ts-ignore
      expect(getExtension()).toBe('');
      // @ts-ignore
      expect(getExtension(321)).toBe('');
      expect(getExtension('')).toBe('');
    });
  });

  describe('checkExtension()', () => {
    test('should return false', () => {
      // @ts-ignore
      expect(checkExtension()).toBe(false);
      // @ts-ignore
      expect(checkExtension('test.jpg')).toBe(false);
      // @ts-ignore
      expect(checkExtension(undefined, [])).toBe(false);
      // @ts-ignore
      expect(checkExtension(undefined, ['.vue', '.jpg'])).toBe(false);
      expect(checkExtension('test.jpg', ['.vue'])).toBe(false);
      // @ts-ignore
      expect(checkExtension(321, ['.vue'])).toBe(false);
      // @ts-ignore
      expect(checkExtension(321)).toBe(false);
      // @ts-ignore
      expect(checkExtension(false, false)).toBe(false);
      // @ts-ignore
      expect(checkExtension(false)).toBe(false);
      // @ts-ignore
      expect(checkExtension(true, true)).toBe(false);
    });
    test('should return true', () => {
      expect(checkExtension('./dir/test.jpg', ['.jpg'])).toBe(true);
    });
  });
});
