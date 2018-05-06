// auto generated sidebar
const { sidebarTree } = require('../code/config');

module.exports = {
  home: true,
  dest: 'documentation',
  locales: {
    '/': {
      title: 'static-site-jsdoc',
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
        // Add sidebar
        sidebar: Object.assign({}, sidebarTree)
      }
    }
  }
};