/*
 * @vuepress
 * ---
 * headline: lib/parser/parse-vue-file.ts
 * ---
 */
import createConfig from '@hperchec/vue-docgen-template';
import { CreateConfigOptions } from '@hperchec/vue-docgen-template/dist/config';
import deepMerge from 'deepmerge';
import { existsSync } from 'fs';
import path from 'path';
import { DocgenCLIConfig } from 'vue-docgen-cli';
import compileTemplates from 'vue-docgen-cli/lib/compileTemplates';
import { SafeDocgenCLIConfig } from 'vue-docgen-cli/lib/config';
import { extractConfig } from 'vue-docgen-cli/lib/docgen';

import { DirectoryFile } from '../../interfaces';
import { readFile, toAbsolutePath } from '../utils';
import vuepressDocblockHandler from '../vue-docgen/script-handlers/vuepress-docblock-handler';

import { ParseReturn } from '.';

export interface ParseVueFileOptions extends CreateConfigOptions {
  configPath?: string;
}

const templatePath = path.resolve(__filename, '../../../../template');

const vueDocgenHandlers = [vuepressDocblockHandler];

/**
 * Parse a vue file
 * @param {DirectoryFile} file - The file
 * @param {string} srcFolder - The source folder path
 * @param {string} destFolder - The destination folder path
 * @param {ParseVueFileOptions} options - The options
 * @returns {object} file data
 */
export const parseVueFile = async (
  file: DirectoryFile,
  srcFolder: string,
  destFolder: string,
  options: ParseVueFileOptions
): Promise<ParseReturn | null> => {
  if (!file.folder) return null;

  const root = process.cwd();
  const relativePathDest = path.join(destFolder, file.folder.replace(srcFolder, ''));
  const folderInDest = path.join(root, relativePathDest);
  const folderInSrc = path.join(root, file.folder);

  const { configPath, helper, partial, template: templateOpt, jsDoc: jsDocOpt } = options;

  // Get vue-docgen config
  let configAbsolutePath;
  let customConfigObj;

  // We need to get configuration object manually before calling vue-docgen-cli extractConfig method
  // because it will auto resolve templates.component property. So, when ckecking manually,
  // we know exactly what configuration property is overriden by the user.
  // If configPath option is provided:
  if (configPath) {
    configAbsolutePath = toAbsolutePath(configPath);
    customConfigObj = require(configAbsolutePath); // Throw error if file not found
  } else {
    // Check in the current file folder if docgen.config.js file exists
    configAbsolutePath = path.join(root, file.folder, 'docgen.config.js');
    if (existsSync(configAbsolutePath)) {
      customConfigObj = require(configAbsolutePath);
    } else {
      // Check at root level
      configAbsolutePath = path.join(root, 'docgen.config.js');
      if (existsSync(configAbsolutePath)) {
        customConfigObj = require(configAbsolutePath);
      } else {
        customConfigObj = {};
      }
    }
  }

  // Add script handlers
  customConfigObj.apiOptions = customConfigObj.apiOptions || {};
  customConfigObj.apiOptions.addScriptHandlers = customConfigObj.apiOptions.addScriptHandlers
    ? vueDocgenHandlers.concat(customConfigObj.apiOptions.addScriptHandlers)
    : vueDocgenHandlers;

  // Apply @hperchec/vue-docgen-template to config
  let docgenConfig: DocgenCLIConfig = createConfig(customConfigObj, {
    helper,
    partial: [
      path.join(templatePath, 'vue-docgen/partials/frontmatter.hbs'),
      ...(partial ? (Array.isArray(partial) ? partial : [partial]) : [])
    ],
    template: templateOpt || readFile(path.join(templatePath, 'vue-docgen/component.hbs')),
    jsDoc: jsDocOpt
  });

  // Get extracted config with vue-docgen-cli extractConfig method
  const extractedConfig: SafeDocgenCLIConfig = extractConfig(path.dirname(configAbsolutePath));

  // Merge with extracted config
  docgenConfig = deepMerge(extractedConfig, docgenConfig);

  const config: SafeDocgenCLIConfig = {
    ...docgenConfig,
    componentsRoot: folderInSrc, // force value
    components: file.name + file.ext // force value
  };

  let success = true;
  let empty = false;
  let fileContent = '';

  try {
    let fileName = file.name;
    if (fileName === '__index__') {
      fileName = 'index';
    }
    // parse file
    const data = await compileTemplates(
      path.join(config.componentsRoot, fileName + file.ext),
      config,
      fileName + file.ext
    );

    if (data.content) {
      fileContent += data.content;
    } else {
      empty = true;
    }
  } catch (e) {
    console.log(e);
    success = false;
  }

  return {
    success,
    file,
    empty,
    relativePathDest,
    relativePathSrc: file.folder,
    dest: folderInDest,
    content: fileContent
  };
};

export default parseVueFile;
