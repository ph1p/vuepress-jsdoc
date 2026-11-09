/*
 * @vuepress
 * ---
 * headline: lib/vuepress-plugin.ts
 * ---
 */
import path from 'node:path';

import { generate, getSidebarOptions, parseArguments, watchFiles } from '../index.js';
import { CLIArguments } from '../interfaces.js';

import { listFolder } from './list-folder.js';
import { generateVueSidebar, getSidebarBase } from './vue-sidebar.js';

export interface VuepressJsdocPluginOptions extends Omit<CLIArguments, 'dist' | 'watch' | 'format' | 'config'> {
  /**
   * Add the generated sidebar to all generated pages (frontmatter `sidebar`).
   * Disable it, if you configure the sidebar in your theme.
   * @default true
   */
  sidebar?: boolean;
  /**
   * Text of the first sidebar entry, which links to the readme
   * @default 'Readme'
   */
  sidebarTitle?: string;
}

/** Minimal parts of the vuepress app, which are used by the plugin */
interface App {
  dir: { source: (...args: string[]) => string };
  env: { isDev: boolean };
}

interface Page {
  path: string;
  frontmatter: Record<string, unknown>;
}

/**
 * VuePress 2 plugin, which generates the documentation when vuepress starts and
 * updates it while `vuepress dev` is running. No separate CLI call is needed.
 * @example
 * import { vuepressJsdocPlugin } from 'vuepress-jsdoc';
 *
 * export default defineUserConfig({
 *   plugins: [vuepressJsdocPlugin({ source: './src', folder: 'code' })]
 * });
 * @param {VuepressJsdocPluginOptions} pluginOptions
 * @returns {Function} vuepress plugin
 */
export const vuepressJsdocPlugin =
  ({ sidebar = true, sidebarTitle = 'Readme', ...pluginOptions }: VuepressJsdocPluginOptions = {}) =>
  (app: App) => {
    // generated files are written into the source folder of vuepress
    const argv: CLIArguments = {
      ...pluginOptions,
      dist: path.relative(process.cwd(), app.dir.source()) || '.',
      format: 'vuepress',
      watch: false
    };
    const options = parseArguments(argv);
    const base = getSidebarBase(options.codeFolder);

    let generated: Promise<unknown> | null = null;
    // the promise is cached, because all pages are extended at the same time
    let sidebarCache: ReturnType<typeof buildSidebar> | null = null;

    const buildSidebar = async () => {
      const { tree } = await listFolder(options.srcFolder, options.exclude, options.include);
      return generateVueSidebar({ ...getSidebarOptions(options, tree), readmeTitle: sidebarTitle });
    };

    return {
      name: 'vuepress-plugin-jsdoc',

      // this hook runs before the pages are resolved, so the generated files become pages
      extendsMarkdownOptions: async () => {
        generated ??= generate(argv);
        await generated;
      },

      extendsPage: async (page: Page) => {
        if (!sidebar || !page.path.startsWith(base) || page.frontmatter.sidebar !== undefined) return;

        sidebarCache ??= buildSidebar();
        page.frontmatter.sidebar = await sidebarCache;
      },

      onWatched: (_app: App, watchers: { close: () => Promise<void> | void }[]) => {
        const watcher = watchFiles(argv);
        // changed files can create or remove a page, which changes the sidebar
        watcher.on('all', (event) => {
          if (event !== 'addDir') sidebarCache = null;
        });
        watchers.push(watcher);
      }
    };
  };
