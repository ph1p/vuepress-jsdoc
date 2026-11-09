export enum StatisticType {
  EMPTY = 'EMPTY',
  ERROR = 'ERROR',
  INCLUDE = 'INCLUDE',
  EXCLUDE = 'EXCLUDE'
}

/**
 * File extensions which are parsed with jsdoc-to-markdown
 */
export const SCRIPT_EXTENSIONS = ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts'];

/**
 * File extensions which are parsed with vue-docgen-cli
 */
export const VUE_EXTENSIONS = ['.vue'];

/**
 * TypeScript extensions. These need their types stripped before jsdoc can read them.
 */
export const TYPESCRIPT_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts'];

/**
 * Placeholder inside the generated sidebar, which gets replaced with the title passed to `sidebarTree(title)`
 */
export const SIDEBAR_TITLE_PLACEHOLDER = '::vuepress-jsdoc-title::';
