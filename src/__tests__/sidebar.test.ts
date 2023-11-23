import { generateVueSidebar } from '../lib/vue-sidebar';

jest.mock('node:fs', () => ({
  existsSync: () => true
}));

describe('test sidebar', () => {
  test('generateVueSidebar should return valid vue config', () => {
    const codeFolder = 'test_folder_code';
    const title = 'test_folder';
    const srcFolder = 'test_folder_src';
    const docsFolder = 'test_folder_docs';

    const fileTree = [
      { fullPath: 'src/file1', name: 'file1', path: '/file1', ext: '.js' },
      { fullPath: 'src/file2', name: 'file2', path: '/file2', ext: '.ts' },
      {
        children: [
          { fullPath: 'src/lib/file3', name: 'file3', path: '/file3', ext: '.vue' },
          { fullPath: 'src/lib/index', name: 'index', path: '/index', ext: '.js' }
        ],
        name: 'lib'
      }
    ];

    const sidebar = generateVueSidebar({ fileTree, codeFolder, docsFolder, srcFolder, title });

    const result = {
      [`/${codeFolder}/`]: [
        {
          text: title,
          collapsable: false,
          children: [
            { link: `/${codeFolder}/`, text: '::vuepress-jsdoc-title::' },
            `/${codeFolder}/file1`,
            `/${codeFolder}/file2`
          ]
        },
        {
          text: 'lib',
          collapsable: false,
          children: [`/${codeFolder}/src/lib/file3`, `/${codeFolder}/src/lib/index`]
        }
      ]
    };

    expect(sidebar).toEqual(result);
  });
});
