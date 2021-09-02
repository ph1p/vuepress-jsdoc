import chalk from 'chalk';
import fs from 'fs/promises';
import jsdoc2md from 'jsdoc-to-markdown';
import mkdirp from 'mkdirp';
import { join, resolve } from 'path';
import compileTemplates from 'vue-docgen-cli/lib/compileTemplates';
import { extractConfig } from 'vue-docgen-cli/lib/docgen';

import { StatisticType } from '../constants';
import { DirectoryFile } from '../interfaces';

import { parseVuepressFileHeader } from './comment-parser';

interface ParseReturn {
  success: boolean;
  dest: string;
  file: DirectoryFile;
  content: string;
  empty: boolean;
  excluded?: boolean;
  relativePathSrc: string;
  relativePathDest: string;
}

export const parseFile = async (
  file: DirectoryFile,
  srcFolder: string,
  destFolder: string,
  configPath: string,
  partials: string | string[]
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

    content = await jsdoc2md.render({
      files: [join(file.folder, file.name + file.ext)],
      configure: configPath,
      partial: [
        resolve(__filename, '../../../template/header.hbs'),
        resolve(__filename, '../../../template/main.hbs'),
        ...partials
      ]
    });

    fileContent = parseVuepressFileHeader(
      await fs.readFile(`${join(folderInSrc, file.name + file.ext)}`, 'utf-8'),
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
    // parse file
    const data = await compileTemplates(
      join(config.componentsRoot, file.name + file.ext),
      config,
      file.name + file.ext
    );

    fileContent = parseVuepressFileHeader(
      await fs.readFile(`${join(folderInSrc, file.name + file.ext)}`, 'utf-8'),
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

      type = parseData?.empty ? StatisticType.EMPTY : StatisticType.SUCCESS;
    }

    return {
      ...parseData,
      type
    };
  } catch {}

  return null;
};
