const { sidebarTree } = require('../code/config');

const config = {
  locales: {
    '/': {
      title: 'vuepress-jsdoc',
      description: 'A JSDoc cli to build md files for static site generators'
    }
  },
  themeConfig: {
    editLinks: true,
    sidebarDepth: 4,
    docsDir: 'code',
    locales: {
      '/': {
        nav: [
          {
            text: 'Home',
            link: '/'
          }
        ],
        // Add the generated sidebar
        sidebar: {
          ...sidebarTree
        }
      }
    }
  }
};

module.exports = config;