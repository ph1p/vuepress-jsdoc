# vuepress-jsdoc

[![npm](https://img.shields.io/npm/v/vuepress-jsdoc.svg)](https://www.npmjs.com/package/vuepress-jsdoc)

This npm package is a command line script, which scans your JavaScript or Typescript source code and generates markdown files for vuepress with the help of [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).

## How to use?

```bash
npm i vuepress-jsdoc -g
```

**Example:**

```bash
vuepress-jsdoc --source=./src --dist=./documentation --folder=./code --title=API
```

### Options

|name|default|description|
|-|-|-|
|--source=|./src|Source folder with .js or .ts files|
|--dist=|./documentation|Destination folder|
|--folder=|./code|Folder inside destination folder. Gets overwritten everytime|
|--title=|API|Title of your documentation|

### config.js

Inside your generated folder, you can find a `config.js`.
This file includes a complete filetree and an vuepress sidebar tree.

## How to configure vuepress

[Vuepress](https://vuepress.vuejs.org/) is a static site generator by Evan You.
You can add all generated documentation files to your existing vuepress project or create a new one.

```bash
# First install vuepress
npm i vuepress -g

# Run the CLI
vuepress-jsdoc

# Run vuepress dev server
vuepress dev ./documentation

# Run vuepress build, if you want to ship it
vuepress build ./documentation
```

**Access it via:** http://localhost:8080/code/

Now you need the sidebar.
Create a `.vuepress` folder in the `documentation` folder and add the following `config.js`.
]
**config.js:**

```javascript
// auto generated sidebar
const { sidebarTree } = require('../code/config');

module.exports = {
  dest: 'dist',
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
        sidebar: Object.assign({}, sidebarTree)
      }
    }
  }
};
```

## Example

The `./example` folder includes a full working vuepress-jsdoc example.

```bash
# Install dependencies
npm install

# Run the CLI
vuepress-jsdoc

# Generate docs
npm run docs

# Run dev server
npm run dev

# Generate dist folder
npm run build
```

## ToDo

- [ ] Update description README.md
- [ ] Custom README.md
- [ ] Custom meta data