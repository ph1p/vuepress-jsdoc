import { fs, vol } from 'memfs';
import path from 'node:path';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { listFolder, normalizePath } from '../lib/list-folder.js';

// memfs resolves relative paths against "/" instead of the working directory
vi.mock('node:fs/promises', () => ({
  default: {
    ...fs.promises,
    readdir: (p: string, options: object) => fs.promises.readdir(path.resolve(p), options)
  }
}));

const file = (name: string, ext: string, folder = 'src/') => ({
  name,
  ext,
  folder,
  path: `${folder}${name}${ext}`
});

describe('listFolder()', () => {
  beforeEach(() => {
    vol.reset();
  });

  test('returns paths and tree', async () => {
    vol.fromJSON(
      {
        'file1.js': '',
        'file2.ts': '',
        'lib/file3.vue': '',
        'lib/index.js': ''
      },
      './src'
    );

    const { paths, tree, excluded } = await listFolder('./src');

    expect(paths).toEqual([
      file('file1', '.js'),
      file('file2', '.ts'),
      file('file3', '.vue', 'src/lib/'),
      { name: 'src-lib-index', ext: '.js', folder: 'src/lib/', path: 'src/lib/index.js' }
    ]);

    expect(tree).toEqual([
      { fullPath: 'src/file1', name: 'file1', path: '/file1', ext: '.js' },
      { fullPath: 'src/file2', name: 'file2', path: '/file2', ext: '.ts' },
      {
        name: 'lib',
        children: [
          { fullPath: 'src/lib/file3', name: 'file3', path: '/file3', ext: '.vue' },
          { fullPath: 'src/lib/src-lib-index', name: 'src-lib-index', path: '/src-lib-index', ext: '.js' }
        ]
      }
    ]);
    expect(excluded).toEqual([]);
  });

  test('skips unsupported files, declarations, hidden folders, node_modules and empty folders', async () => {
    vol.fromJSON(
      {
        'file1.js': '',
        'types.d.ts': '',
        'style.css': '',
        '.hidden/file.js': '',
        'node_modules/dep/index.js': '',
        'assets/logo.png': ''
      },
      './src'
    );

    const { paths, tree } = await listFolder('src');

    expect(paths).toEqual([file('file1', '.js')]);
    expect(tree).toEqual([{ fullPath: 'src/file1', name: 'file1', path: '/file1', ext: '.js' }]);
  });

  test('does not prefix files named like "myindex"', async () => {
    vol.fromJSON({ 'myindex.js': '' }, './src');

    expect((await listFolder('src')).paths).toEqual([file('myindex', '.js')]);
  });

  test('handles invalid parameters', async () => {
    vol.fromJSON({ 'file1.js': '', 'file2.ts': '' }, './src');

    const expected = [file('file1', '.js'), file('file2', '.ts')];

    // @ts-expect-error invalid parameter
    expect((await listFolder('./src', false)).paths).toEqual(expected);
    // @ts-expect-error invalid parameter
    expect((await listFolder('./src', '')).paths).toEqual(expected);
    // @ts-expect-error invalid parameter
    expect((await listFolder()).paths).toEqual([]);
  });

  describe('exclude', () => {
    beforeEach(() => {
      vol.fromJSON({ 'file1.js': '', 'file2.ts': '' }, './src');
    });

    test('does not exclude with an empty or a not matching pattern', async () => {
      expect((await listFolder('./src', [''])).paths).toHaveLength(2);
      expect((await listFolder('./src', ['file3'])).paths).toHaveLength(2);
    });

    test('excludes files', async () => {
      const { paths, excluded } = await listFolder('./src', ['file1.js']);

      expect(paths).toEqual([file('file2', '.ts')]);
      expect(excluded).toEqual([file('file1', '.js')]);
    });

    test('excludes whole folders', async () => {
      vol.fromJSON({ '__tests__/a.test.ts': '', 'lib/__tests__/b.test.ts': '', 'lib/c.ts': '' }, './src');

      const { paths, tree } = await listFolder('./src', ['**/__tests__']);

      expect(paths.map((p) => p.path)).toEqual(['src/file1.js', 'src/file2.ts', 'src/lib/c.ts']);
      expect(tree.map((t) => t.name)).toEqual(['file1', 'file2', 'lib']);
    });
  });

  describe('include', () => {
    test('includes ts files, but not test files', async () => {
      vol.fromJSON({ 'file1.ts': '', 'file2.test.ts': '', 'file3.spec.ts': '' }, './src');

      const { paths } = await listFolder('./src', ['*.(test|spec).ts'], ['*.ts']);

      expect(paths).toEqual([file('file1', '.ts')]);
    });

    test('includes matching files only', async () => {
      vol.fromJSON({ 'file1.js': '', 'file2.ts': '' }, './src');

      expect((await listFolder('./src', [], [''])).paths).toHaveLength(2);
      expect((await listFolder('./src', [], ['file2*'])).paths).toEqual([file('file2', '.ts')]);

      const { paths, excluded } = await listFolder('./src', [], ['file2.ts']);
      expect(paths).toEqual([file('file2', '.ts')]);
      expect(excluded).toEqual([file('file1', '.js')]);
    });
  });
});

describe('normalizePath()', () => {
  test('removes "./" and trailing slashes', () => {
    expect(normalizePath('./src/')).toBe('src');
    expect(normalizePath('src/lib/../')).toBe('src');
    expect(normalizePath('./')).toBe('.');
  });
});
