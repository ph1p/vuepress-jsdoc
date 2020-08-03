'use strict';

const commentParser = require('../helpers/comment-parser');

const template = `/*
* @vuepress
* ---
* title: Your custom title
* variable: test
* page: 25
* ---
*/`;

describe('commentParser', () => {
  const { attributes } = commentParser(template);

  test('Title to be "Your custom title"', () => {
    expect(attributes.title).toBe('Your custom title');
  });
  test('Custom variable to be "test"', () => {
    expect(attributes.variable).toBe('test');
  });
  test('Page to be 25', () => {
    expect(attributes.page).toBe(25);
  });
});

describe('commentParser fail', () => {
  const { frontmatter } = commentParser();

  test('fontmatter should be null', () => {
    expect(frontmatter).toBe(null);
  });
});
