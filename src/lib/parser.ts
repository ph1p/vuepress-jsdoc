import fs from 'fs/promises';
import jsdoc2md from 'jsdoc-to-markdown';
import mkdirp from 'mkdirp';
import { join, resolve } from 'path';
import compileTemplates from 'vue-docgen-cli/lib/compileTemplates';
import { extractConfig } from 'vue-docgen-cli/lib/docgen';

import { DirectoryFile } from '../interfaces';

import { parseVuepressFileHeader } from './comment-parser';

interface ParseReturn {
  success: boolean;
  dest: string;
  file: DirectoryFile;
  content: string;
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
  let fileContent = '';

  // parse file
  try {
    const content = await jsdoc2md.render({
      files: [`${join(folderInSrc, file.name + file.ext)}`],
      configure: configPath,
      partial: [
        resolve(__filename, '../../template/header.hbs'),
        resolve(__filename, '../../template/main.hbs'),
        ...partials
      ]
    });

    if (content) {
      fileContent = parseVuepressFileHeader(
        await fs.readFile(`${join(folderInSrc, file.name + file.ext)}`, 'utf-8'),
        file
      );
      fileContent += content;
    }
  } catch {
    success = false;
  }

  return {
    success,
    file,
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
    components: file.name + file.ext,
    outDir: folderInDest
  };

  let success = true;
  let fileContent = '';

  try {
    // parse file
    const data = await compileTemplates(
      join(config.componentsRoot, file.name + file.ext),
      config,
      file.name + file.ext
    );

    if (data.content) {
      fileContent = parseVuepressFileHeader(
        await fs.readFile(`${join(folderInSrc, file.name + file.ext)}`, 'utf-8'),
        file
      );

      fileContent += data.content;
    }
  } catch {
    success = false;
  }

  return {
    success,
    file,
    relativePathDest,
    relativePathSrc: file.folder,
    dest: folderInDest,
    content: fileContent
  };
};

export const writeContentToFile = async (file: Promise<ParseReturn | null>) => {
  const data = await file;
  let type = data?.success ? 'empty' : 'error';

  try {
    if (data && data?.content) {
      const path = `${join(data.dest, data.file.name)}.md`;

      await mkdirp(data?.dest);
      await fs.writeFile(path, data.content, 'utf-8');

      type = 'success';
    }

    return {
      ...data,
      type
    };
  } catch {
    type = 'error';
  }

  return {
    ...data,
    type
  };
};
