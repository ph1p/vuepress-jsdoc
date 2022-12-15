/*
 * @vuepress
 * ---
 * headline: lib/parser.ts
 * ---
 */
import fs from 'fs/promises';
import jsdoc2md from 'jsdoc-to-markdown';
import mkdirp from 'mkdirp';
import { join, resolve } from 'path';
import compileTemplates from 'vue-docgen-cli/lib/compileTemplates';
import { extractConfig } from 'vue-docgen-cli/lib/docgen';

import { StatisticType } from '../constants';
import { DirectoryFile, ParseReturn, ParseFileOptions } from '../interfaces';

import { parseVuepressFileHeader } from './comment-parser';

/**
 * Parse a typescript or javascript file
 * @param file {DirectoryFile}
 * @param srcFolder {string}
 * @param destFolder {string}
 * @param options {ParseFileOptions}
 * @returns {object} file data
 */
export const parseFile = async (
  file: DirectoryFile,
  srcFolder: string,
  destFolder: string,
  options: ParseFileOptions
): Promise<ParseReturn | null> => {
  if (!file.folder) return null;

  const root = process.cwd();
  const relativePathDest = join(destFolder, file.folder.replace(srcFolder, ''));
  const folderInDest = join(root, relativePathDest);
  const folderInSrc = join(root, file.folder);

  let success = true;
  let empty = false;
  let excluded = false;
  let fileContent = '';

  // parse file
  try {
    let content = '';
    let fileName = file.name;
    if (fileName === '__index__') {
      fileName = 'index';
    }

    const { configPath, partials, ...otherOptions } = options;

    const renderOptions = {
      'no-cache': configPath ? true : false,
      files: [join(root, file.folder, fileName + file.ext)],
      configure: configPath,
      partial: [
        resolve(__filename, '../../../template/header.hbs'),
        resolve(__filename, '../../../template/main.hbs'),
        ...partials
      ]
    }

    for (const name in otherOptions) {
      if (otherOptions[name] !== undefined) renderOptions[name] = otherOptions[name];
    }

    content = await jsdoc2md.render(renderOptions);

    fileContent = parseVuepressFileHeader(
      await fs.readFile(`${join(folderInSrc, fileName + file.ext)}`, 'utf-8'),
      file
    );

    if (content) {
      fileContent += content;
    } else {
      empty = true;
    }
  } catch (e) {
    success = false;
    excluded = true;
  }

  return {
    success,
    file,
    empty,
    excluded,
    relativePathDest,
    relativePathSrc: file.folder,
    dest: folderInDest,
    content: fileContent
  };
};

/**
 * Parse a vue file
 * @param {DirectoryFile} file
 * @param {string} srcFolder
 * @param {string} destFolder
 * @returns {object} file data
 */
export const parseVueFile = async (
  file: DirectoryFile,
  srcFolder: string,
  destFolder: string
): Promise<ParseReturn | null> => {
  if (!file.folder) return null;

  const root = process.cwd();
  const relativePathDest = join(destFolder, file.folder.replace(srcFolder, ''));
  const folderInDest = join(root, relativePathDest);
  const folderInSrc = join(root, file.folder);

  const config = {
    ...extractConfig(join(root, file.folder)),
    components: file.name + file.ext
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
    const data = await compileTemplates(join(config.componentsRoot, fileName + file.ext), config, fileName + file.ext);

    fileContent = parseVuepressFileHeader(
      await fs.readFile(`${join(folderInSrc, fileName + file.ext)}`, 'utf-8'),
      file
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

/**
 * Write content on disk
 * @param {ParseReturn | null} parseData
 * @param {string} dest
 * @returns {Promise | null} null or type with some data of the saved file
 */
export const writeContentToFile = async (parseData: ParseReturn | null, dest: string) => {
  const root = process.cwd();
  dest = join(root, dest);

  let type = StatisticType.ERROR;

  if (parseData?.excluded) {
    type = StatisticType.EXCLUDE;
  }

  try {
    if (parseData?.content) {
      const path = `${join(dest, parseData.file.name)}.md`;

      await mkdirp(dest);
      await fs.writeFile(path, parseData.content, 'utf-8');

      type = parseData?.empty ? StatisticType.EMPTY : StatisticType.INCLUDE;
    }

    return {
      ...parseData,
      type
    };
  } catch {}

  return null;
};
