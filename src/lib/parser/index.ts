/*
 * @vuepress
 * ---
 * headline: lib/parser
 * ---
 */
import { writeFileSync } from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';

import { StatisticType } from '../../constants';
import { DirectoryFile } from '../../interfaces';

import parseFile from './parse-file';
import parseVueFile from './parse-vue-file';

export interface ParseReturn {
  success: boolean;
  dest: string;
  file: DirectoryFile;
  content: string;
  empty: boolean;
  excluded?: boolean;
  relativePathSrc: string;
  relativePathDest: string;
}

/**
 * Parse a typescript or javascript file
 * @param {DirectoryFile} file - The file
 * @param {Object} config - The CLI parsed arguments object
 * @returns {Promise}
 */
export const parse = (file: DirectoryFile, config: any) => {
  if (['.jsx', '.tsx', '.ts', '.js'].includes(file.ext || '')) {
    return parseFile(file, config.srcFolder, config.docsFolder, {
      ...config.jsdoc2md,
      configure: config.jsDoc.configure
    });
  } else if (file.ext === '.vue') {
    return parseVueFile(file, config.srcFolder, config.docsFolder, {
      ...config.vueDocgen,
      configure: config.jsDoc.configure
    });
  } else {
    console.log(`[${file.name}] Not supported file extension: ${file.ext}`);
    return null;
  }
};

/**
 * Write content on disk
 * @param {ParseReturn | null} parseData
 * @param {string} dest
 * @returns {Promise | null} null or type with some data of the saved file
 */
export const writeContentToFile = async (parseData: ParseReturn | null, dest: string) => {
  const root = process.cwd();
  dest = path.join(root, dest);

  let type = StatisticType.ERROR;

  if (parseData?.excluded) {
    type = StatisticType.EXCLUDE;
  }

  try {
    if (parseData?.content) {
      const destPath = `${path.join(dest, parseData.file.name)}.md`;

      await mkdirp(dest);
      writeFileSync(destPath, parseData.content, 'utf-8');

      type = parseData?.empty ? StatisticType.EMPTY : StatisticType.INCLUDE;
    }

    return {
      ...parseData,
      type
    };
  } catch {}

  return null;
};

export default {
  parse,
  writeContentToFile
};
