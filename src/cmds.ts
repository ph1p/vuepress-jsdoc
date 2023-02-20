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
    .description(
      'Generate the md files.\n' +
        'See also:\n' +
        '- jsdoc-to-markdown RenderOptions documentation (https://github.com/jsdoc2md/jsdoc-to-markdown/blob/master/docs/API.md#jsdoc2mdrenderoptions--promise)\n' +
        '- vue-docgen-cli configuration documentation (https://vue-styleguidist.github.io/docs/docgen-cli.html#config)'
    )
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
    .option('--jsDoc-configPath <string>', 'Path to jsDoc config')
    .option('--j2md-example-lang <string>', 'jsdoc2md example-lang option')
    .option('--j2md-global-index-format <string>', 'jsdoc2md global-index-format option')
    .option('--j2md-heading-depth <number>', 'jsdoc2md heading-depth option')
    .option('--j2md-helper [files...]', 'jsdoc2md helper option')
    .option('--j2md-member-index-format <string>', 'jsdoc2md member-index-format option')
    .option('--j2md-module-index-format <string>', 'jsdoc2md module-index-format option')
    .option('--j2md-name-format <string>', 'jsdoc2md name-format option')
    .option('--j2md-no-gfm', 'jsdoc2md no-gfm option')
    .option('--j2md-partial [files...]', 'jsdoc2md partial templates (overwrites default ones)', '')
    .option('--j2md-param-list-format <string>', 'jsdoc2md param-list-format option')
    .option('--j2md-plugin [files...]', 'jsdoc2md plugin option')
    .option('--j2md-property-list-format <string>', 'jsdoc2md property-list-format option')
    .option('--j2md-separators', 'jsdoc2md separators option')
    .option(
      '--j2md-template <string>',
      'Path to root template handlebars file. File content will be passed to jsdoc2md template option'
    )
    .option('--docgen-configPath <string>', 'Path to vue-docgen-cli config')
    .option(
      '--docgen-helper <string>',
      'Handlebars helper files to override or extend the default set (similar to --j2md-helper option)'
    )
    .option(
      '--docgen-partial <string>',
      'Handlebars partial files to override or extend the default set (similar to --j2md-partial option)'
    )
    .option(
      '--docgen-template <string>',
      'Handlebars template file to override default component template (similar to --j2md-template option)'
    )
    .action(generate);

  program.parse(process.argv);
};
