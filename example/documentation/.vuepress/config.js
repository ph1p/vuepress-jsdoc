const { sidebarTree } = require('./sidebar');

module.exports = {
  contentLoading: true,
  dest: 'public',
  title: 'Hello vuepress-jsdoc',
  description: 'Just playing around with vuepress-jsdoc',
  themeConfig: {
    sidebarDepth: 4,
    nav: [
      {
        text: 'Home',
        link: '/'
      },
      {
        text: 'Guides',
        link: '/guides/'
      },
      {
        text: 'Components',
        link: '/code/components/'
      },
      {
        text: 'Plugins',
        link: '/code/plugins/'
      }
    ],
    // Add the generated sidebar
    sidebar: {
      ...sidebarTree('Home'),
      '/guides/': [
        '',
        '/guides/migration/',
        '/guides/setup/',
        '/guides/SCSS/'
      ]
    }
  }
};
