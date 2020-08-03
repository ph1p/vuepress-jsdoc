'use strict';

const vueSidebar = require('../helpers/vue-sidebar');

describe('test sidebar', () => {
  test('vueSidebar should return valid vue config', () => {
    const codeFolder = 'test_folder';
    const title = 'test_folder';
    const fileTree = [
      { name: 'class', path: '/class', fullPath: './documentation/test_folder/class' },
      {
        name: 'lib',
        children: [
          { name: 'test1', path: '/test1', fullPath: './documentation/test_folder/test1' },
          {
            name: 'test2',
            path: '/test2',
            fullPath: './documentation/test_folder/test2',
            children: [
              { name: 'test3', path: '/test3', fullPath: './documentation/test_folder/test2/test3' },
              { name: 'test4', path: '/test4', fullPath: './documentation/test_folder/test2/test4' }
            ]
          }
        ]
      },
      { name: 'test', path: '/test', fullPath: './documentation/test_folder/test' },
      { name: 'tests', children: [] }
    ];

    const sidebar = vueSidebar({ fileTree, codeFolder, title });

    const result = {
      [`/${codeFolder}/`]: [
        { title, collapsable: false, children: [['', '::vuepress-jsdoc-title::'], 'class', 'test'] },
        {
          title: 'lib',
          collapsable: false,
          children: [
            './documentation/test_folder/test1',
            './documentation/test_folder/test2/test3',
            './documentation/test_folder/test2/test4'
          ]
        }
      ]
    };

    expect(sidebar).toEqual(result);
  });
});
