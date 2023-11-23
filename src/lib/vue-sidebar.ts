/*
 * @vuepress
 * ---
 * headline: lib/vue-sidebar.ts
 * ---
 */
import fs from 'node:fs';
import { join } from 'node:path';

import { FileTree } from '../interfaces';

/**
 * Runs through the given tree structure and creates a vuepress config
 * @param {object} data Information to build config
 * @param {array} data.fileTree tree structure
 * @param {string} data.codeFolder ./code/ folder
 * @param {string} data.srcFolder ./src/ folder
 * @param {string} data.docsFolder ./documentation/ folder
 * @param {string} data.title title string
 * @returns {object} returns the vuepress menu structure
 */
export const generateVueSidebar = ({
  fileTree,
  codeFolder,
  srcFolder,
  docsFolder,
  title
}: {
  fileTree: any;
  codeFolder: string;
  srcFolder: string;
  docsFolder: string;
  title: string;
}) => {
  let rootFiles = [{ link: `/${codeFolder}/`, text: '::vuepress-jsdoc-title::' }];
  rootFiles = rootFiles.concat(
    fileTree.filter((file: FileTree) => !file.children).map((file: FileTree) => `/${join(codeFolder, file.name)}`)
  );

  const rootFolder = fileTree.filter((file: FileTree) => file.children && file.children.length > 0);

  const buildChildren = (children: FileTree[], name: string, depth: number) => {
    let newChildren: any[] = [];

    for (const child of children) {
      if (child.children && child.children.length > 0) {
        newChildren = newChildren.concat(buildChildren(child.children, child.name, depth + 1));
      } else if (child.fullPath) {
        const path = child.fullPath.replace(srcFolder, '');

        if (fs.existsSync(`${join(docsFolder, path)}.md`)) {
          newChildren.push(`/${join(codeFolder, path)}`);
        }
      }
    }

    return newChildren;
  };

  const tree = rootFolder.map((folder: FileTree) => ({
    text: folder.name,
    collapsable: false,
    children: buildChildren(folder.children!, folder.name, 0)
  }));

  return {
    [`/${codeFolder}/`]: [
      {
        text: title,
        collapsable: false,
        children: rootFiles
      }
    ].concat(tree)
  };
};
