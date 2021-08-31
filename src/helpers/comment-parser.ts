import fm from 'front-matter';

const parseComment = (fileContent: string) => {
  try {
    const allCommentBlocks = fileContent.match(/\/*[\s\S]*\/.*/g);
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

export default parseComment;
