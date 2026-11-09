import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import cli from '../cmds.js';
import { defineConfig, loadConfig } from '../lib/config.js';

let tmp: string;
let cwd: string;

beforeAll(async () => {
  cwd = process.cwd();
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'vuepress-jsdoc-config-'));
  process.chdir(tmp);
  vi.spyOn(console, 'log').mockImplementation(() => {});

  await fs.mkdir('lib', { recursive: true });
  await fs.writeFile('lib/a.js', '/**\n * A\n */\nexport const a = 1;\n');
});

afterAll(async () => {
  vi.restoreAllMocks();
  process.chdir(cwd);
  await fs.rm(tmp, { recursive: true, force: true });
});

describe('loadConfig()', () => {
  test('returns null without a config file', async () => {
    expect(await loadConfig()).toBe(null);
  });

  test('throws for a missing config path', async () => {
    await expect(loadConfig('missing.js')).rejects.toThrow(/not found/);
  });

  test('loads a json config from a path', async () => {
    await fs.writeFile('custom.json', JSON.stringify({ title: 'Json' }));

    expect((await loadConfig('custom.json'))?.config).toEqual({ title: 'Json' });
  });

  test('finds vuepress-jsdoc.config.js in the working directory', async () => {
    await fs.writeFile('vuepress-jsdoc.config.js', "export default { source: './lib', title: 'From config' };\n");

    const loaded = await loadConfig();

    expect(loaded?.path).toBe(path.join(await fs.realpath(tmp), 'vuepress-jsdoc.config.js'));
    expect(loaded?.config).toEqual({ source: './lib', title: 'From config' });
  });

  test('defineConfig() returns the config', () => {
    expect(defineConfig({ source: './lib' })).toEqual({ source: './lib' });
  });
});

describe('cli', () => {
  test('uses the config file, but command line options win', async () => {
    await cli('1.0.0', ['node', 'vuepress-jsdoc', '--title', 'From cli', '--dist', './out']);

    // source comes from the config file
    expect(await fs.readFile('out/code/a.md', 'utf-8')).toContain('# a');
    // title comes from the command line
    expect(await fs.readFile('out/code/config.js', 'utf-8')).toContain('"text": "From cli"');
  });

  test('writes a vitepress sidebar and index.md with --format vitepress', async () => {
    await cli('1.0.0', ['node', 'vuepress-jsdoc', '--dist', './vp', '--format', 'vitepress']);

    const config = await fs.readFile('vp/code/config.js', 'utf-8');

    expect(config).toContain('"items"');
    expect(await fs.readFile('vp/code/index.md', 'utf-8')).toBe('# From config\n');
  });
});
