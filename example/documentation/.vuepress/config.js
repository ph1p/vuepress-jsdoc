const { sidebarTree } = require('../code/config');

// module.exports = {
//   contentLoading: true,
//   title: 'Hello vuepress-jsdoc',
//   description: 'Just playing around with vuepress-jsdoc',
//   locales: {
//     '/': {
//       title: 'vuepress-jsdoc',
//       description: 'A CLI to create jsdoc md files for vuepress'
//     }
//   },
//   themeConfig: {
//     sidebarDepth: 4,
//     locales: {
//       '/': {
//         nav: [
//           {
//             text: 'Home',
//             link: '/'
//           }
//         ],
//         // Add the generated sidebar
//         sidebar: {
//           ...sidebarTree('Test')
//         }
//       }
//     }
//   }
// };

// auto generated sidebar

// console.log('sidebarTree',sidebarTree())
// let sidebarTreeData = sidebarTree()

module.exports = {
  dest: 'dist',
  //   base: '/bwFEdoc',
  locales: {
    '/': {
      title: 'baiwangFE-doc',
      description: 'Generate baiwangFE-doc markdown files for vuepress'
    }
  },
  themeConfig: {
    editLinks: true,
    sidebarDepth: 2,
    docsDir: '/code',
    locales: {
      '/': {
        nav: [
          {
            text: 'Home',
            link: '/'
          },
          {
            text: 'Code',
            link: '/code'
          }
        ],
        // can't show
        // Add the generated sidebar
        // can't show
        sidebar: Object.assign({}, sidebarTree('Mainpage title'))
        // can't show
        // sidebar: Object.assign({}, sidebarTree()['/code/'])
        // can't show
        // sidebar: sidebarTree()['/code/']
        // can't show
        // sidebar: sidebarTreeData
        // sidebar: [{
        //     'title': 'common-ui',
        //     'collapsable': false,
        //     'children': ['common-ui/button/Button', 'common-ui/data-grid/_index', 'common-ui/icon/Icon', 'common-ui/loading/Loading', 'common-ui/page/Page', 'common-ui/page/Page2', 'common-ui/single-table/_index', 'common-ui/switch/Switch', 'common-ui/table/Table', 'common-ui/table/cell', 'common-ui/table/dynamic-column', 'common-ui/table/table-body', 'common-ui/table/table-head']
        // },
        // {
        //     'title': 'common-ui',
        //     'collapsable': false,
        //     'children': ['common-ui/button/Button', 'common-ui/data-grid/_index', 'common-ui/icon/Icon', 'common-ui/loading/Loading', 'common-ui/page/Page', 'common-ui/page/Page2', 'common-ui/single-table/_index', 'common-ui/switch/Switch', 'common-ui/table/Table', 'common-ui/table/cell', 'common-ui/table/dynamic-column', 'common-ui/table/table-body', 'common-ui/table/table-head']
        // },
        // {
        //     'title': 'common-ui',
        //     'collapsable': false,
        //     'children': ['common-ui/button/Button', 'common-ui/data-grid/_index', 'common-ui/icon/Icon', 'common-ui/loading/Loading', 'common-ui/page/Page', 'common-ui/page/Page2', 'common-ui/single-table/_index', 'common-ui/switch/Switch', 'common-ui/table/Table', 'common-ui/table/cell', 'common-ui/table/dynamic-column', 'common-ui/table/table-body', 'common-ui/table/table-head']
        // }]

        //         and so on like in vuepress doc
      }
    }
  }
};
