/*
 * @vuepress
 * ---
 * headline: cmds.ts
 * ---
 */
import { program } from 'commander';

import { generate } from '.';

/**
 * This method builds the cli interface and is necessary because
 * we need the version from the package.json here. We do not import
 * this here, because otherwise the folder structure in the dist folder would get mixed up.
 * @param {string} version a version string
 */
export default (version: string) => {
  program.version(version).description('a CLI Tool to generate markdown files for vuepress');

  program
    .description('Generate the md files')
    .option('-s, --source <string>', 'Source folder with .js or .ts files', './src')
    .option('-d, --dist <string>', 'Destination folder', './documentation')
    .option('-f, --folder <string>', 'Folder inside destination folder. Gets overwritten everytime', 'code')
    .option('-t, --title <string>', 'Title of your documentation', 'API')
    .option('-r, --readme <string>', 'Path to your custom readme')
    .option('-i, --include <string>', 'Pattern to include files/folders (Comma seperated) - *.test.js,include.js')
    .option('-e, --exclude <string>', 'Pattern to exclude files/folders (Comma seperated) - *.test.js,exclude.js')
    .option('-w, --watch', 'This flag watches your source files')
    .option(
      '-rm, --rmPattern [files...]',
      'Pattern when removing files. You can ex- and include files. (glob pattern)',
      ''
    )
    .option('-p, --partials [files...]', 'jsdoc2markdown partial templates (overwrites default ones)', '')
    .option('-c, --jsDocConfigPath <string>', 'Path to jsdoc config')
    .option('--docgenConfigPath <string>', 'Path to vue-docgen config')
    .option('--j2md-template <string>', 'jsdoc2markdown template option')
    .option('--j2md-heading-depth <number>', 'jsdoc2markdown heading-depth option')
    .option('--j2md-example-lang <string>', 'jsdoc2markdown example-lang option')
    .option('--j2md-plugin [files...]', 'jsdoc2markdown plugin option')
    .option('--j2md-helper [files...]', 'jsdoc2markdown helper option')
    .option('--j2md-name-format <string>', 'jsdoc2markdown name-format option')
    .option('--j2md-no-gfm', 'jsdoc2markdown no-gfm option')
    .option('--j2md-separators', 'jsdoc2markdown separators option')
    .option('--j2md-module-index-format <string>', 'jsdoc2markdown module-index-format option')
    .option('--j2md-global-index-format <string>', 'jsdoc2markdown global-index-format option')
    .option('--j2md-param-list-format <string>', 'jsdoc2markdown param-list-format option')
    .option('--j2md-property-list-format <string>', 'jsdoc2markdown property-list-format option')
    .option('--j2md-member-index-format <string>', 'jsdoc2markdown member-index-format option')
    .option('--j2md-private', 'jsdoc2markdown private option')
    .action(generate);

  program.parse(process.argv);
};
