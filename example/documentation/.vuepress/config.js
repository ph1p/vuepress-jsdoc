const { sidebarTree } = require('../code/config');

module.exports = {
  contentLoading: true,
  dest: 'public',
  title: 'Hello vuepress-jsdoc',
  description: 'Just playing around with vuepress-jsdoc',
  /*plugins: [
    [
      // require('vuepress-jsdoc')
      require('../../../dist/index.js').default,
      {
        folder: 'code',
        jsDocConfigPath: './jsdoc.json',
        source: './src',
        dist: './documentation',
        title: 'API'
      }
    ]
  ],*/
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
