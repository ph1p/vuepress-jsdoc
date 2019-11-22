'use strict';

const yargs = require('yargs');
const { generate } = require('./cmds');

function main() {
  yargs
    .usage('$0 <cmd> [args]')
    // Default command 'generate'
    .command({
      command: 'generate [options]',
      aliases: ['gen', 'g', '$0'], // $0 is to set this command as default. This commmand runs when no commans are passed
      desc: 'Generate the md files',
      handler: generate,
      builder: yargs => {
        yargs.options({
          source: {
            alias: 's',
            default: './src',
            desc: 'Source folder with .js or .ts files',
            type: 'string'
          },
          dist: {
            alias: 'd',
            default: './documentation',
            desc: 'Destination folder',
            type: 'string'
          },
          folder: {
            alias: 'f',
            default: 'code',
            desc: 'Folder inside destination folder. Gets overwritten everytime',
            type: 'string'
          },
          title: {
            alias: 't',
            default: 'API',
            desc: 'Title of your documentation',
            type: 'string'
          },
          readme: {
            alias: 'r',
            default: '',
            desc: 'Path to your custom readme',
            type: 'string'
          },
          exclude: {
            alias: 'e',
            default: '',
            desc: 'Pattern to exclude files/folders (Comma seperated) - *.test.js,exclude.js',
            type: 'string'
          },
          rmPattern: {
            alias: 'rm',
            default: [],
            desc: 'Pattern when removing files. You can ex- and include files. (glob pattern)',
            type: 'array'
          },
          jsDocConfigPath: {
            alias: 'c',
            default: '',
            desc: 'Path to jsdoc config',
            type: 'string'
          }
        });
      }
    })
    // adding aliases to help and version args
    .alias('help', 'h')
    .alias('version', 'v').argv;
}

module.exports = main;
