/*
 * @vuepress
 * ---
 * headline: lib/vue-sidebar.ts
 * ---
 */
import fs from 'node:fs';
import path from 'node:path';

import { SIDEBAR_TITLE_PLACEHOLDER } from '../constants.js';
import { FileTree } from '../interfaces.js';

import { normalizePath } from './list-folder.js';

export interface SidebarGroup {
  text: string;
  collapsible: boolean;
  children: SidebarItem[];
}

export type SidebarItem = string | { text: string; link: string } | SidebarGroup;

export interface SidebarOptions {
  /** tree structure, created by `listFolder` */
  fileTree: FileTree[];
  /** name of the folder inside the vuepress folder, e.g. `code` */
  codeFolder: string;
  /** source folder, e.g. `src` */
  srcFolder: string;
  /** folder of the generated markdown files, e.g. `documentation/code` */
  docsFolder: string;
  /** title of the first sidebar group */
  title: string;
  /** sidebar format of the generated `config.js` */
  format?: SiteFormat;
  /** text of the first entry, which links to the readme */
  readmeTitle?: string;
}

export type SiteFormat = 'vuepress' | 'vitepress';

/**
 * Get the route of the generated folder, e.g. `/code/`
 * @param {string} codeFolder
 * @returns {string}
 */
export const getSidebarBase = (codeFolder: string) => `/${normalizePath(codeFolder)}/`;

export interface VitepressSidebarItem {
  text: string;
  link?: string;
  collapsed?: boolean;
  items?: VitepressSidebarItem[];
}

/**
 * Runs through the given tree structure and creates a vuepress 2 sidebar config.
 * Only pages that were generated are linked. Folders become nested sidebar groups.
 * @param {SidebarOptions} data Information to build config
 * @returns {object} returns the vuepress sidebar structure
 */
export const generateVueSidebar = ({
  fileTree,
  codeFolder,
  srcFolder,
  docsFolder,
  title,
  readmeTitle = SIDEBAR_TITLE_PLACEHOLDER
}: SidebarOptions) => {
  const base = getSidebarBase(codeFolder);
  const root = normalizePath(srcFolder);

  const toLink = (file: FileTree): string | null => {
    if (!file.fullPath) return null;

    const relativePath = path.posix.relative(root, normalizePath(file.fullPath));

    if (!fs.existsSync(`${path.join(docsFolder, relativePath)}.md`)) return null;

    return `${base}${relativePath}`;
  };

  const buildChildren = (children: FileTree[]): SidebarItem[] => {
    const items: SidebarItem[] = [];

    for (const child of children) {
      if (child.children) {
        const nested = buildChildren(child.children);
        if (nested.length > 0) {
          items.push({ text: child.name, collapsible: true, children: nested });
        }
      } else {
        const link = toLink(child);
        if (link) items.push(link);
      }
    }

    return items;
  };

  const rootFiles: SidebarItem[] = [
    { text: readmeTitle, link: base },
    ...buildChildren(fileTree.filter((file) => !file.children))
  ];

  const folders: SidebarGroup[] = fileTree
    .filter((file) => file.children)
    .map((folder) => ({ text: folder.name, collapsible: false, children: buildChildren(folder.children!) }))
    .filter((group) => group.children.length > 0);

  return {
    [base]: [{ text: title, collapsible: false, children: rootFiles }, ...folders]
  };
};

/**
 * Convert a vuepress sidebar item into a vitepress sidebar item
 * @param {SidebarItem} item
 * @returns {VitepressSidebarItem}
 */
const toVitepressItem = (item: SidebarItem): VitepressSidebarItem => {
  if (typeof item === 'string') {
    return { text: path.posix.basename(item), link: item };
  }
  if ('link' in item) {
    return { text: item.text, link: item.link };
  }
  return {
    text: item.text,
    // nested folders are collapsed, vitepress opens groups with the active page
    ...(item.collapsible ? { collapsed: true } : {}),
    items: item.children.map(toVitepressItem)
  };
};

/**
 * Runs through the given tree structure and creates a vitepress sidebar config.
 * @param {SidebarOptions} data Information to build config
 * @returns {object} returns the vitepress sidebar structure
 */
export const generateVitepressSidebar = (data: SidebarOptions) =>
  Object.fromEntries(
    Object.entries(generateVueSidebar(data)).map(([base, groups]) => [base, groups.map(toVitepressItem)])
  ) as Record<string, VitepressSidebarItem[]>;

/**
 * Create the content of the `config.js`, which is placed into the generated folder.
 * It exports the file tree and a `sidebarTree(title)` function, which returns the vuepress or vitepress sidebar.
 * @param {SidebarOptions} options
 * @returns {string} javascript code (ES module)
 */
export const createSidebarConfig = (options: SidebarOptions) => {
  // the placeholder is replaced with the `title` parameter of `sidebarTree`
  const data = { ...options, readmeTitle: SIDEBAR_TITLE_PLACEHOLDER };
  const tree = options.format === 'vitepress' ? generateVitepressSidebar(data) : generateVueSidebar(data);
  const sidebar = JSON.stringify(tree, null, 2).replace(JSON.stringify(SIDEBAR_TITLE_PLACEHOLDER), 'title');

  return [
    '// This file is generated by vuepress-jsdoc. Do not edit it manually.',
    `export const fileTree = ${JSON.stringify(options.fileTree, null, 2)};`,
    '',
    `export const sidebarTree = (title = 'Mainpage') => (${sidebar});`,
    '',
    'export default sidebarTree;',
    ''
  ].join('\n');
};
