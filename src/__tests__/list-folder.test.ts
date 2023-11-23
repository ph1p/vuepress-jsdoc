import { fs, vol } from 'memfs';

import { listFolder } from '../lib/list-folder';

jest.mock('node:fs', () => fs);
jest.mock('node:fs/promises', () => fs.promises);

describe('test file-structure', () => {
  describe('with children', () => {
    beforeEach(() => {
      vol.reset();
    });

    test('get structured file array', async () => {
      vol.fromJSON(
        {
          'file1.js': '',
          'file2.ts': '',
          'lib/file3.vue': '',
          'lib/index.js': ''
        },
        './src'
      );

      const { paths, tree } = await listFolder('./src', [], []);

      expect(paths).toEqual([
        { ext: '.js', folder: 'src/', isDir: false, name: 'file1', path: 'src/file1.js' },
        { ext: '.ts', folder: 'src/', isDir: false, name: 'file2', path: 'src/file2.ts' },
        { ext: '.vue', folder: 'src/lib/', isDir: false, name: 'file3', path: 'src/lib/file3.vue' },
        { ext: '.js', folder: 'src/lib/', isDir: false, name: 'src-lib-index', path: 'src/lib/index.js' },
        { isDir: true, name: 'lib', path: 'src/lib' }
      ]);

      expect(tree).toEqual([
        { fullPath: 'src/file1', name: 'file1', path: '/file1', ext: '.js' },
        { fullPath: 'src/file2', name: 'file2', path: '/file2', ext: '.ts' },
        {
          children: [
            { fullPath: 'src/lib/file3', name: 'file3', path: '/file3', ext: '.vue' },
            { fullPath: 'src/lib/src-lib-index', name: 'src-lib-index', path: '/src-lib-index', ext: '.js' }
          ],
          name: 'lib'
        }
      ]);
    });
  });

  describe('without children', () => {
    beforeEach(() => {
      vol.reset();
    });

    test('get structured file array', async () => {
      vol.fromJSON(
        {
          'file1.js': '',
          'file2.ts': ''
        },
        './src'
      );

      expect((await listFolder('./src', [], [])).paths).toEqual([
        { ext: '.js', folder: 'src/', isDir: false, name: 'file1', path: 'src/file1.js' },
        { ext: '.ts', folder: 'src/', isDir: false, name: 'file2', path: 'src/file2.ts' }
      ]);

      expect((await listFolder('./src', [], [])).tree).toEqual([
        { fullPath: 'src/file1', name: 'file1', path: '/file1', ext: '.js' },
        { fullPath: 'src/file2', name: 'file2', path: '/file2', ext: '.ts' }
      ]);
    });
  });

  describe('missing parameters', () => {
    beforeEach(() => {
      vol.reset();
    });

    test('get structured file array', async () => {
      vol.fromJSON(
        {
          'file1.js': '',
          'file2.ts': ''
        },
        './src'
      );

      // @ts-ignore
      expect((await listFolder('./src', false)).paths).toEqual([
        { ext: '.js', folder: 'src/', isDir: false, name: 'file1', path: 'src/file1.js' },
        { ext: '.ts', folder: 'src/', isDir: false, name: 'file2', path: 'src/file2.ts' }
      ]);

      // @ts-ignore
      expect((await listFolder('./src', '')).paths).toEqual([
        { ext: '.js', folder: 'src/', isDir: false, name: 'file1', path: 'src/file1.js' },
        { ext: '.ts', folder: 'src/', isDir: false, name: 'file2', path: 'src/file2.ts' }
      ]);

      // @ts-ignore
      expect((await listFolder('./src', 'hffdskjh')).paths).toEqual([
        { ext: '.js', folder: 'src/', isDir: false, name: 'file1', path: 'src/file1.js' },
        { ext: '.ts', folder: 'src/', isDir: false, name: 'file2', path: 'src/file2.ts' }
      ]);

      // @ts-ignore
      expect((await listFolder()).paths).toEqual([]);
    });
  });

  describe('exclude', () => {
    beforeEach(() => {
      vol.reset();
    });

    test('should not exlude with empty string', async () => {
      vol.fromJSON(
        {
          'file1.js': '',
          'file2.ts': ''
        },
        './src'
      );

      const { paths } = await listFolder('./src', [''], []);

      // @ts-ignore
      expect(paths).toEqual([
        { ext: '.js', folder: 'src/', isDir: false, name: 'file1', path: 'src/file1.js' },
        { ext: '.ts', folder: 'src/', isDir: false, name: 'file2', path: 'src/file2.ts' }
      ]);
    });

    test('should not exlude with not matching string', async () => {
      vol.fromJSON(
        {
          'file1.js': '',
          'file2.ts': ''
        },
        './src'
      );

      const { paths } = await listFolder('./src', ['file3'], []);

      // @ts-ignore
      expect(paths).toEqual([
        { ext: '.js', folder: 'src/', isDir: false, name: 'file1', path: 'src/file1.js' },
        { ext: '.ts', folder: 'src/', isDir: false, name: 'file2', path: 'src/file2.ts' }
      ]);
    });

    test('should exclude file', async () => {
      vol.fromJSON(
        {
          'file1.js': '',
          'file2.ts': ''
        },
        './src'
      );

      const { paths, excluded } = await listFolder('./src', ['file1.js'], []);

      // @ts-ignore
      expect(paths).toEqual([{ ext: '.ts', folder: 'src/', isDir: false, name: 'file2', path: 'src/file2.ts' }]);

      // @ts-ignore
      expect(excluded).toEqual([{ ext: '.js', folder: 'src/', isDir: false, name: 'file1', path: 'src/file1.js' }]);
    });
  });

  describe('include', () => {
    beforeEach(() => {
      vol.reset();
    });

    test('should include ts files, but not test files', async () => {
      vol.fromJSON(
        {
          'file1.ts': '',
          'file2.test.ts': '',
          'file3.spec.ts': ''
        },
        './src'
      );

      const { paths } = await listFolder('./src', ['*.(test|spec).ts'], ['*.ts']);

      // @ts-ignore
      expect(paths).toEqual([{ ext: '.ts', folder: 'src/', isDir: false, name: 'file1', path: 'src/file1.ts' }]);
    });

    test('should not include with empty string', async () => {
      vol.fromJSON(
        {
          'file1.js': '',
          'file2.ts': ''
        },
        './src'
      );

      const { paths } = await listFolder('./src', [], ['']);

      // @ts-ignore
      expect(paths).toEqual([
        { ext: '.js', folder: 'src/', isDir: false, name: 'file1', path: 'src/file1.js' },
        { ext: '.ts', folder: 'src/', isDir: false, name: 'file2', path: 'src/file2.ts' }
      ]);
    });

    test('should include with matching string', async () => {
      vol.fromJSON(
        {
          'file1.js': '',
          'file2.ts': ''
        },
        './src'
      );

      const { paths } = await listFolder('./src', [], ['file2*']);

      // @ts-ignore
      expect(paths).toEqual([{ ext: '.ts', folder: 'src/', isDir: false, name: 'file2', path: 'src/file2.ts' }]);
    });

    test('should include file', async () => {
      vol.fromJSON(
        {
          'file1.js': '',
          'file2.ts': ''
        },
        './src'
      );

      const { paths, excluded } = await listFolder('./src', [], ['file2.ts']);

      // @ts-ignore
      expect(paths).toEqual([{ ext: '.ts', folder: 'src/', isDir: false, name: 'file2', path: 'src/file2.ts' }]);

      // @ts-ignore
      expect(excluded).toEqual([{ ext: '.js', folder: 'src/', isDir: false, name: 'file1', path: 'src/file1.js' }]);
    });
  });
});
