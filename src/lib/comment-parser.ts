/*
 * @vuepress
 * ---
 * headline: lib/comment-parser.ts
 * ---
 */
import { createRequire } from 'node:module';

import { DirectoryFile } from '../interfaces.js';

// front-matter is a commonjs module with wrong types for es modules
const fm = createRequire(import.meta.url)('front-matter') as typeof import('front-matter').default;

interface ParsedComment {
  /** raw frontmatter string */
  frontmatter: string | null;
  /** parsed frontmatter attributes */
  attributes: Record<string, any> | null;
}

/**
 * Search in file for a `@vuepress` comment block and parse its frontmatter
 * @param {string} fileContent content of given file
 * @returns {object} object of found frontmatter data
 */
export const parseComment = (fileContent: string): ParsedComment => {
  const empty = { frontmatter: null, attributes: null };

  if (typeof fileContent !== 'string') return empty;

  try {
    const vuepressBlock = fileContent.match(/\/\*[\s\S]*?\*\//g)?.find((block) => /^[\s/*]*@vuepress\b/m.test(block));

    if (!vuepressBlock) return empty;

    const body = vuepressBlock
      .replace(/^\/\*+/, '')
      .replace(/\*+\/$/, '')
      .split('\n')
      // remove the leading "*" of every comment line
      .map((line) => line.replace(/^\s*\*\s?/, ''))
      .filter((line) => !/^\s*@vuepress\s*$/.test(line))
      .join('\n')
      .trim();

    const { frontmatter, attributes } = fm<Record<string, any>>(body);

    return { frontmatter: frontmatter || null, attributes: frontmatter ? attributes : null };
  } catch {
    return empty;
  }
};

/**
 * Quote a string for the use inside yaml frontmatter
 * @param {string} value
 * @returns {string} quoted string
 */
const yamlString = (value: string) => JSON.stringify(value);

/**
 * Helper function to get the header of a page as structured markdown.
 * It contains the frontmatter and a headline (`# headline`).
 * The headline is omitted for vue files, because vue-docgen-cli renders its own.
 * @param {string} content file content
 * @param {DirectoryFile} file file object
 * @returns {string} markdown header
 */
export const parseVuepressFileHeader = (content: string, file: Pick<DirectoryFile, 'name' | 'ext'>) => {
  const { frontmatter, attributes } = parseComment(content);

  const lines: string[] = [];

  if (!attributes?.title) {
    lines.push(`title: ${yamlString(file.name)}`);
  }
  if (frontmatter) {
    lines.push(frontmatter);
  }

  let header = `---\n${lines.join('\n')}\n---\n`;

  if (attributes?.title || file.ext !== '.vue') {
    const headline = attributes?.headline || attributes?.title || file.name;

    header += `\n# ${headline}\n\n`;
  }

  return header;
};
