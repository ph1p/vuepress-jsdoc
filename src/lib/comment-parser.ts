/*
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
 * Helper function to get header as structured markdown
 * @param {string} content file content
 * @param {object} file file object
 * @returns {string} markdown header
 */
export const parseVuepressFileHeader = (content: string, file: DirectoryFile) => {
  const { frontmatter, attributes } = parseComment(content);

  let fileContent = '---\n';

  fileContent += !attributes?.title ? `title: ${file.name}` : '';

  if (frontmatter) {
    fileContent += !attributes?.title ? '\n' : '';
    fileContent += `${frontmatter}`;
  }

  fileContent += '\n---\n';
  if (attributes?.title || file.ext !== '.vue') {
    let headline = file.name;

    if (attributes?.headline) {
      headline = attributes.headline;
    } else if (attributes?.title) {
      headline = attributes.title;
    }

    fileContent += `\n# ${headline}\n\n`;
  }

  return fileContent;
};
