import { parseComment } from '../lib/comment-parser';

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

  test('Title to be "Your custom title"', () => {
    expect(attributes?.title).toBe('Your custom title');
  });
  test('Custom variable to be "test"', () => {
    expect(attributes?.variable).toBe('test');
  });
  test('Page to be 25', () => {
    expect(attributes?.page).toBe(25);
  });
});

describe('parseComment() fail', () => {
  // @ts-expect-error check empty method
  const { frontmatter } = parseComment();

  test('fontmatter should be null', () => {
    expect(frontmatter).toBe(null);
  });
});
