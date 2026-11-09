import { describe, expect, test, vi } from 'vitest';

import { createSidebarConfig, generateVitepressSidebar, generateVueSidebar } from '../lib/vue-sidebar.js';

const existing = new Set(['docs/file1.md', 'docs/file2.md', 'docs/lib/file3.md', 'docs/lib/deep/file4.md']);

vi.mock('node:fs', () => ({
  default: { existsSync: (p: string) => existing.has(p) }
}));

const fileTree = [
  { fullPath: 'src/file1', name: 'file1', path: '/file1', ext: '.js' },
  { fullPath: 'src/file2', name: 'file2', path: '/file2', ext: '.ts' },
  {
    name: 'lib',
    children: [
      { fullPath: 'src/lib/file3', name: 'file3', path: '/file3', ext: '.vue' },
      // not generated (e.g. empty), so it is not linked
      { fullPath: 'src/lib/src-lib-index', name: 'src-lib-index', path: '/src-lib-index', ext: '.js' },
      { name: 'deep', children: [{ fullPath: 'src/lib/deep/file4', name: 'file4', path: '/file4', ext: '.js' }] }
    ]
  },
  { name: 'empty', children: [{ fullPath: 'src/empty/file5', name: 'file5', path: '/file5', ext: '.js' }] }
];

const options = { fileTree, codeFolder: 'code', srcFolder: 'src', docsFolder: 'docs', title: 'API' };

describe('generateVueSidebar()', () => {
  test('returns a vuepress 2 sidebar', () => {
    expect(generateVueSidebar(options)).toEqual({
      '/code/': [
        {
          text: 'API',
          collapsible: false,
          children: [{ text: '::vuepress-jsdoc-title::', link: '/code/' }, '/code/file1', '/code/file2']
        },
        {
          text: 'lib',
          collapsible: false,
          children: ['/code/lib/file3', { text: 'deep', collapsible: true, children: ['/code/lib/deep/file4'] }]
        }
      ]
    });
  });

  test('handles "./" in the source folder', () => {
    expect(generateVueSidebar({ ...options, srcFolder: './src' })['/code/'][0].children).toContain('/code/file1');
  });
});

describe('generateVitepressSidebar()', () => {
  test('returns a vitepress sidebar', () => {
    expect(generateVitepressSidebar(options)).toEqual({
      '/code/': [
        {
          text: 'API',
          items: [
            { text: '::vuepress-jsdoc-title::', link: '/code/' },
            { text: 'file1', link: '/code/file1' },
            { text: 'file2', link: '/code/file2' }
          ]
        },
        {
          text: 'lib',
          items: [
            { text: 'file3', link: '/code/lib/file3' },
            { text: 'deep', collapsed: true, items: [{ text: 'file4', link: '/code/lib/deep/file4' }] }
          ]
        }
      ]
    });
  });

  test('is used by createSidebarConfig() with format "vitepress"', async () => {
    const code = createSidebarConfig({ ...options, format: 'vitepress' });
    const mod = await import(`data:text/javascript,${encodeURIComponent(code)}`);

    expect(mod.sidebarTree('Home')['/code/'][0].items[0]).toEqual({ text: 'Home', link: '/code/' });
  });
});

describe('createSidebarConfig()', () => {
  test('creates an es module with a title parameter', async () => {
    const code = createSidebarConfig(options);
    const mod = await import(`data:text/javascript,${encodeURIComponent(code)}`);

    expect(mod.fileTree).toEqual(fileTree);
    expect(mod.default).toBe(mod.sidebarTree);
    expect(mod.sidebarTree('Home')['/code/'][0].children[0]).toEqual({ text: 'Home', link: '/code/' });
    expect(mod.sidebarTree()['/code/'][0].children[0].text).toBe('Mainpage');
  });
});
