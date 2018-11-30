const fm = require('front-matter');

module.exports = fileContent => {
  try {
    let allCommentBlocks = fileContent.match(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/g);
    const vuepressBlock = allCommentBlocks.filter(block => {
      return block.split('\n').filter(line => line.indexOf('@vuepress') >= 0).length;
    })[0];

    return fm(
      vuepressBlock
        .replace(/\n /g, '\n')
        .replace('/*', '')
        .replace('*/', '')
        .replace(/@vuepress/g, '')
        .replace(/\*\s?/g, '')
        .trim()
    );
  } catch (e) {
      return '';
  }
};
