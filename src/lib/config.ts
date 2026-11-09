/*
 * @vuepress
 * ---
 * headline: lib/config.ts
 * ---
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { UserConfig } from '../interfaces.js';

/**
 * Names of config files, which are searched in the working directory
 */
const CONFIG_FILES = [
  'vuepress-jsdoc.config.js',
  'vuepress-jsdoc.config.mjs',
  'vuepress-jsdoc.config.cjs',
  'vuepress-jsdoc.config.json'
];

/**
 * Helper for typed config files
 * @example
 * // vuepress-jsdoc.config.js
 * import { defineConfig } from 'vuepress-jsdoc';
 *
 * export default defineConfig({ source: './lib', exclude: ['**\/*.test.js'] });
 * @param {UserConfig} config
 * @returns {UserConfig} the same config
 */
export const defineConfig = (config: UserConfig) => config;

/**
 * Load a config file. Without a path, the working directory is searched for a `vuepress-jsdoc.config.*` file.
 * @param {string} [configPath] path to a config file
 * @returns {Promise<{ path: string, config: UserConfig } | null>} config or null if there is no config file
 */
export const loadConfig = async (configPath?: string) => {
  const file = configPath
    ? path.resolve(configPath)
    : CONFIG_FILES.map((name) => path.resolve(name)).find((p) => fs.existsSync(p));

  if (!file) return null;

  if (!fs.existsSync(file)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  let config: UserConfig;

  if (file.endsWith('.json')) {
    config = JSON.parse(await fs.promises.readFile(file, 'utf-8'));
  } else {
    // the timestamp prevents a cached module in watch mode or tests
    const module = await import(`${pathToFileURL(file).href}?t=${Date.now()}`);
    config = module.default ?? module;
  }

  if (!config || typeof config !== 'object') {
    throw new Error(`Config file has to export an object: ${file}`);
  }

  return { path: file, config };
};
