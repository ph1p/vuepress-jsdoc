import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { vuepressJsdocPlugin } from '../lib/vuepress-plugin.js';

let tmp: string;
let cwd: string;

beforeAll(async () => {
  cwd = process.cwd();
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'vuepress-jsdoc-plugin-'));
  process.chdir(tmp);
  vi.spyOn(console, 'log').mockImplementation(() => {});

  await fs.mkdir('src/lib', { recursive: true });
  await fs.writeFile('src/a.js', '/**\n * A\n */\nexport const a = 1;\n');
  await fs.writeFile('src/lib/b.js', '/**\n * B\n */\nexport const b = 1;\n');
});

afterAll(async () => {
  vi.restoreAllMocks();
  process.chdir(cwd);
  await fs.rm(tmp, { recursive: true, force: true });
});

const app = { dir: { source: () => path.join(process.cwd(), 'docs') }, env: { isDev: false } };

describe('vuepressJsdocPlugin()', () => {
  test('generates the files before the pages are resolved and adds the sidebar', async () => {
    const plugin = vuepressJsdocPlugin({ source: './src', title: 'API' })(app);

    expect(plugin.name).toBe('vuepress-plugin-jsdoc');

    await plugin.extendsMarkdownOptions();

    expect(await fs.readFile('docs/code/a.md', 'utf-8')).toContain('# a');
    expect(await fs.readFile('docs/code/lib/b.md', 'utf-8')).toContain('# b');

    const page = { path: '/code/lib/b.html', frontmatter: {} as Record<string, unknown> };
    const other = { path: '/guide/', frontmatter: {} as Record<string, unknown> };
    const custom = { path: '/code/a.html', frontmatter: { sidebar: false } as Record<string, unknown> };

    await plugin.extendsPage(page);
    await plugin.extendsPage(other);
    await plugin.extendsPage(custom);

    expect(page.frontmatter.sidebar).toEqual({
      '/code/': [
        { text: 'API', collapsible: false, children: [{ text: 'Readme', link: '/code/' }, '/code/a'] },
        { text: 'lib', collapsible: false, children: ['/code/lib/b'] }
      ]
    });
    expect(other.frontmatter.sidebar).toBeUndefined();
    expect(custom.frontmatter.sidebar).toBe(false);
  });

  test('can disable the sidebar', async () => {
    const plugin = vuepressJsdocPlugin({ source: './src', sidebar: false })(app);
    const page = { path: '/code/a.html', frontmatter: {} as Record<string, unknown> };

    await plugin.extendsPage(page);

    expect(page.frontmatter.sidebar).toBeUndefined();
  });
});
