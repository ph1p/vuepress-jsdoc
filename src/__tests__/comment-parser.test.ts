import { describe, expect, test } from 'vitest';

import { parseComment, parseVuepressFileHeader } from '../lib/comment-parser.js';

const template = `/*
* @vuepress
* ---
* title: Your custom title
* variable: test
* page: 25
* ---
*/`;

describe('parseComment()', () => {
  const { attributes } = parseComment(template);

  test('parses attributes', () => {
    expect(attributes?.title).toBe('Your custom title');
    expect(attributes?.variable).toBe('test');
    expect(attributes?.page).toBe(25);
  });

  test('keeps "*" inside of values', () => {
    const { attributes } = parseComment(`/*
 * @vuepress
 * ---
 * title: a * b
 * ---
 */`);
    expect(attributes?.title).toBe('a * b');
  });

  test('finds the block after other comments', () => {
    const { attributes } = parseComment(`/** some jsdoc */\nconst a = 1;\n${template}`);
    expect(attributes?.title).toBe('Your custom title');
  });

  test('returns null without a vuepress block', () => {
    expect(parseComment('/* no frontmatter */').frontmatter).toBe(null);
    // @ts-expect-error check empty method
    expect(parseComment().frontmatter).toBe(null);
  });
});

describe('parseVuepressFileHeader()', () => {
  test('uses the file name as title and headline', () => {
    expect(parseVuepressFileHeader('', { name: 'file', ext: '.js' })).toBe('---\ntitle: "file"\n---\n\n# file\n\n');
  });

  test('uses the custom title and headline', () => {
    const header = parseVuepressFileHeader(
      `/*\n * @vuepress\n * ---\n * title: Custom\n * headline: Headline\n * ---\n */`,
      { name: 'file', ext: '.ts' }
    );
    expect(header).toBe('---\ntitle: Custom\nheadline: Headline\n---\n\n# Headline\n\n');
  });

  test('omits the headline of vue files, because vue-docgen renders one', () => {
    expect(parseVuepressFileHeader('', { name: 'comp', ext: '.vue' })).toBe('---\ntitle: "comp"\n---\n');
  });
});
