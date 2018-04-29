const { sidebarTree } = require('../code/config');

module.exports = {
  dest: 'documentation',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: `/logo.png`
      }
    ]
  ],
  locales: {
    '/': {
      title: 'static-site-jsdoc',
      description: 'A JSDoc cli to build md files for static site generators'
    }
  },
  themeConfig: {
    editLinks: true,
    sidebarDepth: 4,
    docsDir: 'docs',
    locales: {
      '/': {
        nav: [
          {
            text: 'Home',
            link: '/'
          }
        ],
        sidebar: Object.assign({}, sidebarTree)
      }
    }
  }
};
