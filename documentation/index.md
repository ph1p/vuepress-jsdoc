---
layout: home

hero:
  name: vuepress-jsdoc
  tagline: Generate VuePress and VitePress pages from your JSDoc comments
  actions:
    - theme: brand
      text: Get Started
      link: /code/
    - theme: alt
      text: GitHub
      link: https://github.com/ph1p/vuepress-jsdoc

features:
  - title: JavaScript, TypeScript and Vue
    details: Parses .js, .ts, .tsx and .vue files with jsdoc-to-markdown and vue-docgen-cli. TypeScript works without any babel setup.
  - title: VuePress plugin
    details: Add one plugin to your config. The documentation and the sidebar are generated when VuePress starts and updated while you write.
  - title: CLI and VitePress
    details: Use the CLI with a config file, watch mode and a generated sidebar for VuePress 2 or VitePress. This site is built with it.
---

```bash
pnpm add -D vuepress-jsdoc

# VitePress
vuepress-jsdoc --source ./src --dist ./docs --format vitepress
```

```javascript
// VuePress: .vuepress/config.js
import { vuepressJsdocPlugin } from 'vuepress-jsdoc';

export default defineUserConfig({
  plugins: [vuepressJsdocPlugin({ source: './src' })]
});
```
