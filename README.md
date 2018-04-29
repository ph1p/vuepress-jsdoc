# static-site-jsdoc

[![npm](https://img.shields.io/npm/v/static-site-jsdoc.svg)](https://www.npmjs.com/package/static-site-jsdoc)

This npm package is a command line script, which scans your JavaScript or Typescript source code and generates markdown files with the help of [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
These markdown files can be used in static site generators like vuepress.

## How to use?

```bash
npm i static-site-jsdoc -g
```

**Example:**

```bash
static-site-jsdoc --source=./src --dist=./documentation --folder=./code --title=API
```

### Options

|name|default|description|
|-|-|-|
|--source=|./src|Source folder with .js or .ts files|
|--dist=|./documentation|Destination folder|
|--folder=|./code|Folder inside destination folder. Gets overwritten everytime|
|--title=|./API|Title of your documentation|

### config.js

Inside your generated md files, you can find a `config.js`.
This file includes a complete filetree and an vuepress sidebar tree.

## Vuepress

[Vuepress](https://vuepress.vuejs.org/) is a new static site generator by Evan You.
You can add all generated documentation files to your existing vuepress project or create a new one.

```bash
# First install vuepress
npm i vuepress -g

# Run the CLI
static-site-jsdoc

# Run vuepress dev server
vuepress dev ./documentation

# Run vuepress build, if you want to ship it
vuepress build ./documentation
```

**Access it via:** http://localhost:8080/code/

Now you need the sidebar navigation.
Create a `.vuepress` folder inside `documentation` if it does not exist and add a `config.js`.

**Example:**

```javascript
// auto generated sidebar
const { sidebarTree } = require('../code/config');

module.exports = {
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
```
## Example

The `./example` folder includes a full working vuepress example generated from `./src`.

## ToDo

- [] Update description README.md
- [] Custom README.md
- [] Custom meta data