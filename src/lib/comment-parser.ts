/**
 * @vuepress
 * ---
 * headline: lib/comment-parser.ts
 * ---
 */

import fm from 'front-matter';

import { DirectoryFile } from '../interfaces';

/**
 * Search in file for @vuepress comment
 * @param {string} fileContent content of given file
 * @returns {object} object of found frontmatter data
 */
export const parseComment = (fileContent: string) => {
  try {
    const allCommentBlocks = fileContent.match(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/g);
    const vuepressBlock = allCommentBlocks?.filter((block: string) => {
      return block.split('\n').filter(line => line.indexOf('@vuepress') >= 0).length;
    })[0];

    if (!vuepressBlock) {
      return {
        frontmatter: null,
        attributes: null
      };
    }

    return fm<Record<string, string>>(
      vuepressBlock
        .replace(/\n /g, '\n')
        .replace('/*', '')
        .replace('*/', '')
        .replace(/@vuepress/g, '')
        .replace(/\*\s?/g, '')
        .trim()
    );
  } catch (e) {
    return {
      frontmatter: null,
      attributes: null
    };
  }
};

/**
 * Helper function to get front matter object
 * @param {string} content file content
 * @param {object} file file object
 * @returns {Object} Front matter as plain object
 */
export const parseVuepressFileHeader = (content: string, file: DirectoryFile) => {
  const { attributes } = parseComment(content);

  const frontMatterObj = attributes || {};

  // Check if title exists
  frontMatterObj.title = frontMatterObj.title || file.name; // set filename if title is not set
  // Process headline attribute
  if (attributes?.title || file.ext !== '.vue') {
    let headline = file.name;

    if (attributes?.headline) {
      headline = attributes.headline;
    } else if (attributes?.title) {
      headline = attributes.title;
    }

    frontMatterObj.headline = headline;
  }

  return frontMatterObj;
};
