import { StatisticType } from './constants.js';

export interface DirectoryFile {
  /** Path of the file relative to the working directory, e.g. `src/lib/foo.ts` */
  path: string;
  /** Name of the generated page without extension. `index` files are prefixed with their folder. */
  name: string;
  /** File extension, e.g. `.ts` */
  ext: string;
  /** Folder of the file relative to the working directory with a trailing slash, e.g. `src/lib/` */
  folder: string;
}

export interface CLIArguments {
  /** Pattern to include files/folders (comma separated or list) */
  include?: string | string[];
  /** Pattern to exclude files/folders (comma separated or list) */
  exclude?: string | string[];
  /** jsdoc2markdown partial templates */
  partials?: string[] | string;
  /** Additional glob patterns of files to remove before generating */
  rmPattern?: string[] | string;
  /** Folder inside the destination folder, default `code` */
  folder?: string;
  /** Path to a jsdoc config */
  jsDocConfigPath?: string;
  /** Source folder, default `./src` */
  source?: string;
  /** Destination folder, default `./documentation` */
  dist?: string;
  /** Title of the documentation, default `API` */
  title?: string;
  /** Path to a custom readme */
  readme?: string;
  /** Watch the source files */
  watch?: boolean;
  /** Sidebar format of the generated `config.js`, default `vuepress` */
  format?: 'vuepress' | 'vitepress';
  /** Path to a config file */
  config?: string;
}

/**
 * Options of a `vuepress-jsdoc.config.js` file
 */
export type UserConfig = Omit<CLIArguments, 'config'>;

export interface ParseReturn {
  /** Result of parsing */
  type: StatisticType;
  /** Destination folder relative to the working directory */
  dest: string;
  file: DirectoryFile;
  /** Rendered markdown (including the frontmatter) */
  content: string;
  /** Error message, if the file could not be parsed */
  error?: string;
}

export interface FileTree {
  name: string;
  path?: string;
  ext?: string;
  fullPath?: string;
  children?: FileTree[];
}
