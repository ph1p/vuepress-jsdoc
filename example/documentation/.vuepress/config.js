import { defaultTheme } from '@vuepress/theme-default';
import { sidebarTree } from '../code/config';

export default {
  contentLoading: true,
  dest: 'public',
  title: 'vuepress-jsdoc',
  description: 'Just playing around with vuepress-jsdoc',
  locales: {
    '/': {
      title: 'vuepress-jsdoc',
      description: 'A CLI to create jsdoc md files for vuepress',
      home: '/code/'
    }
  },
  theme: defaultTheme({
    locales: {
      '/': {
        navbar: [
          {
            text: 'Home',
            link: '/'
          },
          {
            text: 'Code',
            link: '/code/'
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
  })
};
