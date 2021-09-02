import { fs, vol } from 'memfs';

import { listFolder } from '../lib/list-folder';

jest.mock('fs');
jest.mock('fs/promises', () => fs.promises);

describe('test file-structure', () => {
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

    expect((await listFolder('./src', [])).paths).toEqual([
      { ext: '.js', folder: 'src/', isDir: false, name: 'file1', path: 'src/file1.js' },
      { ext: '.ts', folder: 'src/', isDir: false, name: 'file2', path: 'src/file2.ts' },
      { ext: '.vue', folder: 'src/lib/', isDir: false, name: 'file3', path: 'src/lib/file3.vue' },
      { ext: '.js', folder: 'src/lib/index', isDir: false, name: '_index', path: 'src/lib/index.js' },
      { isDir: true, name: 'lib', path: 'src/lib' }
    ]);
    expect((await listFolder('./src', [])).tree).toEqual([
      { fullPath: 'src/file1', name: 'file1', path: '/file1' },
      { fullPath: 'src/file2', name: 'file2', path: '/file2' },
      {
        children: [
          { fullPath: 'src/lib/file3', name: 'file3', path: '/file3' },
          { fullPath: 'src/lib/index', name: 'index', path: '/index' }
        ],
        name: 'lib'
      }
    ]);
  });
});
