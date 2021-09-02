const { sidebarTree } = require('../code/config');

module.exports = {
  contentLoading: true,
  dest: 'public',
  title: 'Hello vuepress-jsdoc',
  description: 'Just playing around with vuepress-jsdoc',
  locales: {
    '/': {
      title: 'vuepress-jsdoc',
      description: 'A CLI to create jsdoc md files for vuepress'
    }
  },
  themeConfig: {
    sidebarDepth: 4,
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
          ...sidebarTree('Readme')
        }
      }
    }
  }
};
