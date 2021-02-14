# vuepress-jsdoc

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9ec565a85a134df2a0f6bdf905e438d4)](https://app.codacy.com/app/ph1p/vuepress-jsdoc?utm_source=github.com&utm_medium=referral&utm_content=ph1p/vuepress-jsdoc&utm_campaign=Badge_Grade_Settings)
[![npm](https://img.shields.io/npm/v/vuepress-jsdoc.svg)](https://www.npmjs.com/package/vuepress-jsdoc)
[![now](https://img.shields.io/badge/now-demo-black)](https://vuepress-jsdoc-example.now.sh)

This npm package is a command line script, which scans your JavaScript, Vue or Typescript source code and generates markdown files for vuepress with the help of [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown) and [vue-docgen-cli](https://github.com/vue-styleguidist/vue-styleguidist/tree/dev/packages/vue-docgen-cli).

![CLI ./example](/example/img/cli.gif)

## How to

```bash
yarn global add vuepress-jsdoc
npm i vuepress-jsdoc -g
```

**Example:**

```bash
# search code in src and move it to code (./documentation/code) in your vuepress folder (./documentation)
vuepress-jsdoc --source ./src --dist ./documentation --folder code --title API --exclude *.test.js,exclude.js
```

### Commands

If no command passed it will run `generate` as default

| Name     | Alias  | Description                                                                                             |
| -------- | ------ | ------------------------------------------------------------------------------------------------------- |
| generate | gen, g | search code in src and move it to code (./documentation/code) in your vuepress folder (./documentation) |

### Options

| Name              | Alias | Default         | Description                                                                                                                                           |
| ----------------- | ----- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| --source          | -s    | ./src           | Source folder with .js or .ts files                                                                                                                   |
| --dist            | -d    | ./documentation | Destination folder                                                                                                                                    |
| --folder          | -f    | ./code          | Folder inside destination folder. Gets overwritten everytime                                                                                          |
| --title           | -t    | API             | Title of your documentation                                                                                                                           |
| --help            | -h    |                 | Show help                                                                                                                                             |
| --version         | -v    |                 | Show current version                                                                                                                                  |
| --readme          | -r    |                 | Path to custom readme file                                                                                                                            |
| --exclude         | -e    |                 | Pattern to exclude files/folders (Comma seperated) - \*.test.js,exclude.js                                                                            |
| --rmPattern       | -rm   |                 | Pattern when removing files. You can ex- and include files. (glob pattern)                                                                            |
| --partials        | -p    |                 | jsdoc2markdown partial templates (overwrites default ones)                                                                                            |
| --jsDocConfigPath | -c    |                 | Path to [JsDoc Config](http://usejsdoc.org/about-configuring-jsdoc.html) (experimental)                                                               |

### config.js

Inside your generated folder, you can find a `config.js`.
This file includes a complete filetree and an vuepress sidebar tree.

## How to configure vuepress

[Vuepress](https://vuepress.vuejs.org/) is a static site generator by Evan You.
You can add all generated documentation files to your existing vuepress project or create a new one.

```bash
# First install vuepress
yarn global add vuepress

# Run the CLI
vuepress-jsdoc

# Run vuepress dev server
vuepress dev ./documentation

# Run vuepress build, if you want to ship it
vuepress build ./documentation
```

**Access it via:** [http://localhost:8080/code/](http://localhost:8080/code/)

Now you need the sidebar.
Create a `.vuepress` folder inside the `documentation` folder and add the following `config.js`.

**config.js:**

```javascript
// auto generated sidebar
const { sidebarTree } = require('../code/config');

module.exports = {
  dest: 'dist',
  locales: {
    '/': {
      title: 'vuepress-jsdoc',
      description: 'Generate jsdoc markdown files for vuepress'
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
        sidebar: Object.assign({}, sidebarTree('Mainpage title'))
      }
    }
  }
};
```

## Custom readme

You can easily add a custom path to your readme by using the `--readme ./path/to/file.md` parameter. If you move a `README.md` inside your source folder, it should resolve it automatically.
You can set the title by passing it to the `sidebarTree('Mainpage title')` function inside your `./.vuepress/config.js`.

Once the README.md has been added, it is no longer overwritten!
If you want it to be overwritten, set `--rmPattern=./documentation/code/README.md`.

## @vuepress comment block

You can add custom meta data to your pages by using the `@vuepress` block:

```javascript
/*
 * @vuepress
 * ---
 * title: Your custom title
 * headline: You custom headline
 * ---
 */
```

Use `headline` to add a custom `h1` title.

[More information](https://vuepress.vuejs.org/guide/markdown.html#front-matter)

## Typescript

To use typescript, you have to install these dev-dependencies:

```bash
yarn add -D typescript jsdoc-babel @babel/cli @babel/core @babel/preset-env @babel/preset-typescript jsdoc-to-markdown
```

Next, you have to add a `jsdoc.json` to your project with some settings and add it with the `-c` parameter.
You can find a full working example with all settings inside the `./example` folder.
The example shows also how to use babel-`plugins`.

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

## Contribute

PRs are always welcome (:
