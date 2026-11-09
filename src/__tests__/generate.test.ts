import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { StatisticType } from '../constants.js';
import { generate, parseArguments } from '../index.js';

let tmp: string;
let cwd: string;

const write = async (name: string, content: string) => {
  await fs.mkdir(path.dirname(path.join(tmp, name)), { recursive: true });
  await fs.writeFile(path.join(tmp, name), content);
};

const exists = (p: string) =>
  fs.access(path.join(tmp, p)).then(
    () => true,
    () => false
  );

beforeAll(async () => {
  cwd = process.cwd();
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'vuepress-jsdoc-generate-'));
  process.chdir(tmp);
  vi.spyOn(console, 'log').mockImplementation(() => {});

  await write('src/index.js', '/**\n * Entry point\n */\nexport const main = () => {};\n');
  await write(
    'src/lib/math.ts',
    '/**\n * Add numbers\n * @param {number} a\n */\nexport const add = (a: number) => a;\n'
  );
  await write('src/lib/empty.js', 'export const a = 1;\n');
  await write('src/lib/__tests__/math.test.ts', '/** test */\nexport const t = 1;\n');
  await write('src/README.md', '# My Project\n');
  await write('documentation/code/old.md', 'old');
});

afterAll(async () => {
  vi.restoreAllMocks();
  process.chdir(cwd);
  await fs.rm(tmp, { recursive: true, force: true });
});

describe('parseArguments()', () => {
  test('normalizes paths and lists', () => {
    const options = parseArguments({
      source: './src/',
      dist: './docs',
      folder: 'api',
      title: 'Title',
      exclude: 'a.js, b.js',
      partials: ['p1.hbs,p2.hbs']
    });

    expect(options.srcFolder).toBe('src');
    expect(options.docsFolder).toBe('docs/api');
    expect(options.exclude).toEqual(['a.js', 'b.js']);
    expect(options.partials).toEqual(['p1.hbs', 'p2.hbs']);
  });
});

describe('generate()', () => {
  test('creates the documentation', async () => {
    const results = await generate({
      source: './src',
      dist: './documentation',
      folder: 'code',
      title: 'API',
      exclude: '**/__tests__'
    });

    const types = Object.fromEntries(results.map((r) => [r.file.path, r.type]));

    expect(types).toEqual({
      'src/index.js': StatisticType.INCLUDE,
      'src/lib/empty.js': StatisticType.EMPTY,
      'src/lib/math.ts': StatisticType.INCLUDE
    });

    expect(await exists('documentation/code/old.md')).toBe(false);
    expect(await exists('documentation/code/src-index.md')).toBe(true);
    expect(await exists('documentation/code/lib/math.md')).toBe(true);
    expect(await exists('documentation/code/lib/empty.md')).toBe(false);
    expect(await fs.readFile(path.join(tmp, 'documentation/code/README.md'), 'utf-8')).toBe('# My Project\n');

    const config = await import(`${path.join(tmp, 'documentation/code/config.js')}?t=${Date.now()}`);

    expect(config.sidebarTree('Overview')).toEqual({
      '/code/': [
        {
          text: 'API',
          collapsible: false,
          children: [{ text: 'Overview', link: '/code/' }, '/code/src-index']
        },
        { text: 'lib', collapsible: false, children: ['/code/lib/math'] }
      ]
    });
  });
});
