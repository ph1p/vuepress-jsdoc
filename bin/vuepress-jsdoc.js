#!/usr/bin/env node
'use strict';

const { program } = require('commander');

const { generate } = require('../cmds');
const { version } = require('../package.json');

program.version(version).description('a CLI Tool to generate markdown files for vuepress');

program
  .description('Generate the md files')
  .option('-s, --source <string>', 'Source folder with .js or .ts files', './src')
  .option('-d, --dist <string>', 'Destination folder', './documentation')
  .option('-f, --folder <string>', 'Folder inside destination folder. Gets overwritten everytime', 'code')
  .option('-t, --title <string>', 'Title of your documentation', 'API')
  .option('-r, --readme <string>', 'Path to your custom readme')
  .option('-e, --exclude <string>', 'Pattern to exclude files/folders (Comma seperated) - *.test.js,exclude.js')
  .option(
    '-rm, --rmPattern [files...]',
    'Pattern when removing files. You can ex- and include files. (glob pattern)',
    []
  )
  .option('-p, --partials [files...]', 'jsdoc2markdown partial templates (overwrites default ones)', [])
  .option('-c, --jsDocConfigPath <string>', 'Path to jsdoc config')
  .option('-l --live', 'Watches for changed source files and regenerates corresponding markdown files')
  .option('-m --multinav', 'Creates a sidebar for each main navigation')
  .action(generate);

program.parse(process.argv);
