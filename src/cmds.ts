/*
 * @vuepress
 * ---
 * headline: cmds.ts
 * ---
 */
import { Command, Option } from 'commander';

import { generate } from './index.js';
import { loadConfig } from './lib/config.js';
import { StatisticType } from './constants.js';
import { CLIArguments } from './interfaces.js';

/**
 * This method builds the cli interface and is necessary because
 * we need the version from the package.json here. We do not import
 * this here, because otherwise the folder structure in the dist folder would get mixed up.
 * @param {string} version a version string
 * @param {string[]} argv process arguments
 */
export default async (version: string, argv = process.argv) => {
  const program = new Command();

  program
    .name('vuepress-jsdoc')
    .version(version)
    .description('Generate markdown files for VuePress out of your JSDoc comments')
    .option('-s, --source <string>', 'Source folder with .js, .ts or .vue files', './src')
    .option('-d, --dist <string>', 'Destination folder', './documentation')
    .option('-f, --folder <string>', 'Folder inside destination folder. Gets overwritten everytime', 'code')
    .option('-t, --title <string>', 'Title of your documentation', 'API')
    .option('-r, --readme <string>', 'Path to your custom readme')
    .option('-i, --include <string>', 'Pattern to include files/folders (comma separated) - **/*.js,include.js')
    .option('-e, --exclude <string>', 'Pattern to exclude files/folders (comma separated) - **/*.test.js,exclude.js')
    .option('-w, --watch', 'Watch your source files and update the documentation')
    .option('--rm, --rmPattern [files...]', 'Additional glob patterns of files to remove before generating')
    .option('-p, --partials [files...]', 'jsdoc2markdown partial templates (overwrites default ones)')
    .option('-c, --jsDocConfigPath <string>', 'Path to jsdoc config')
    .addOption(
      new Option('--format <format>', 'Sidebar format of the generated config.js')
        .choices(['vuepress', 'vitepress'])
        .default('vuepress')
    )
    .option('--config <path>', 'Path to a config file (default: vuepress-jsdoc.config.{js,mjs,cjs,json})')
    .action(async (cliOptions: CLIArguments) => {
      const loaded = await loadConfig(cliOptions.config);
      const options: CLIArguments = { ...cliOptions };

      if (loaded) {
        console.log(`Using config ${loaded.path}`);

        // options of the command line win over the config file, the config file wins over the defaults
        for (const [key, value] of Object.entries(loaded.config)) {
          if (program.getOptionValueSource(key) !== 'cli') {
            (options as Record<string, unknown>)[key] = value;
          }
        }
      }

      const results = await generate(options);

      if (!options.watch && results.some((r) => r.type === StatisticType.ERROR)) {
        process.exitCode = 1;
      }
    });

  await program.parseAsync(argv);
};
