# vuepress-jsdoc

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ph1p_vuepress-jsdoc&metric=alert_status)](https://sonarcloud.io/dashboard?id=ph1p_vuepress-jsdoc)
[![npm](https://img.shields.io/npm/v/vuepress-jsdoc.svg)](https://www.npmjs.com/package/vuepress-jsdoc)
[![vercel](https://img.shields.io/badge/vercel-demo-black)](https://vuepress-jsdoc-example.vercel.app)

This npm package serves as a command line script designed to analyze your JavaScript, Vue, or TypeScript source code. Leveraging [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown) and [vue-docgen-cli](https://github.com/vue-styleguidist/vue-styleguidist/tree/dev/packages/vue-docgen-cli), it dynamically generates markdown files tailored for VuePress.

![CLI ./example](https://user-images.githubusercontent.com/15351728/131877824-0124e47f-9080-4976-88d0-84ad04b64f24.gif)

## Vuepress support

This npm package is compatible with VuePress 2; however, it requires a version lower than `5.0.0` for proper functionality with VuePress 1.

## How to

```bash
yarn global add vuepress-jsdoc
npm i vuepress-jsdoc -g
```

**Example:**

```bash
# search code in src and move it to code (./documentation/code) in your vuepress folder (./documentation)
vuepress-jsdoc --source ./src --dist ./documentation --folder code --title API --exclude="**/*/*.test.js"
```

You can also use `npx vuepress-jsdoc`, if you want.

#### Watch-Mode `alpha`

If you do not want to run`vuepress-jsdoc` again and again and again.
You can simply pass `--watch` or `-w`.

### Command-Options

Use these options after `vuepress-jsdoc`.

| Name              | Alias | Default         | Description                                                                                                                                     |
| ----------------- | ----- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| --source          | -s    | ./src           | Source folder with .js or .ts files                                                                                                             |
| --dist            | -d    | ./documentation | Destination folder                                                                                                                              |
| --folder          | -f    | ./code          | Folder inside destination folder. Gets overwritten everytime                                                                                    |
| --title           | -t    | API             | Title of your documentation                                                                                                                     |
| --help            | -h    |                 | Show help                                                                                                                                       |
| --version         | -v    |                 | Show current version                                                                                                                            |
| --readme          | -r    |                 | Path to custom readme file                                                                                                                      |
| --exclude         | -e    |                 | Pattern to exclude files/folders (Comma seperated) - \*.test.js,exclude.js [more information](https://github.com/micromatch/micromatch#ismatch) |
| --include         | -e    |                 | Pattern to include files/folders (Comma seperated) - \*.test.js,include.js [more information](https://github.com/micromatch/micromatch#ismatch) |
| --rmPattern       | -rm   |                 | Pattern when removing files. You can ex- and include files. (glob pattern)                                                                      |
| --partials        | -p    |                 | jsdoc2markdown partial templates (overwrites default ones)                                                                                      |
| --jsDocConfigPath | -c    |                 | Path to [JsDoc Config](http://usejsdoc.org/about-configuring-jsdoc.html) (experimental)                                                         |
| --watch           | -w    |                 | Watch changes and update markdown files                                                                                                         |

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

To include a custom path for your readme, simply utilize the `--readme ./path/to/file.md` parameter. If you relocate a `README.md` file into your source folder, the system will automatically resolve it.

For setting the title, provide it as an argument to the `sidebarTree('Mainpage title')` function within your `./.vuepress/config.js` file.

## @vuepress comment block

Enhance your page customization by incorporating custom metadata through the `@vuepress` block:

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

To integrate TypeScript support, install the following dev-dependencies with the following command:

```bash
npm install -D typescript jsdoc-babel @babel/cli @babel/core @babel/preset-env @babel/preset-typescript jsdoc-to-markdown
```

After installation, include a `jsdoc.json` file in your project with specific settings, and reference it using the `-c` parameter. For a comprehensive example with all the necessary configurations, refer to the `./example` folder. The example also demonstrates the usage of Babel plugins.

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
