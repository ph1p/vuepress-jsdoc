// Node v18 compat
const crypto = require("crypto")
const crypto_orig_createHash = crypto.createHash
crypto.createHash = algorithm => crypto_orig_createHash(algorithm == "md4" ? "sha256" : algorithm)

const { sidebarTree } = require('../code/config');

module.exports = {
  contentLoading: true,
  dest: 'public',
  title: 'vuepress-jsdoc',
  description: 'vuepress-jsdoc documented with itself',
  plugins: [
    [
      // require('vuepress-jsdoc')
      require('../../dist/index.js').default,
      {
        folder: 'code',
        source: './dist',
        dist: './documentation',
        title: 'API',
        partials: ['./example/partials/*.hbs'],
        readme: './README.md',
        exclude: '**/*.d.ts,**/interfaces.*,**/constants.*,**/cmds.*'
      }
    ]
  ],
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
          },
          {
            text: 'Github',
            link: 'https://github.com/ph1p/vuepress-jsdoc'
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
