import fs from 'fs/promises';
import jsdoc2md from 'jsdoc-to-markdown';
import mkdirp from 'mkdirp';
import path from 'path';
import compileTemplates from 'vue-docgen-cli/lib/compileTemplates';
import { extractConfig } from 'vue-docgen-cli/lib/docgen';

import { DirectoryFile } from '../interfaces';

import { parseVuepressFileHeader } from './comment-parser';

interface ParseReturn {
  dest: string;
  filename: string;
  content: string;
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
  const folderInDest = path.join(root, destFolder, file.folder.replace(srcFolder, ''));
  const folderInSrc = path.join(root, file.folder);

  // render file
  const content = await jsdoc2md.render({
    files: [`${path.join(folderInSrc, file.name + file.ext)}`],
    configure: configPath,
    partial: [
      path.resolve(__filename, '../../template/header.hbs'),
      path.resolve(__filename, '../../template/main.hbs'),
      ...partials
    ]
  });

  if (!content) {
    return null;
  }

  let fileContent = parseVuepressFileHeader(
    await fs.readFile(`${path.join(folderInSrc, file.name + file.ext)}`, 'utf-8'),
    file
  );

  fileContent += content;

  return {
    dest: folderInDest,
    filename: file.name,
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
  const folderInDest = path.join(root, destFolder, file.folder.replace(srcFolder, ''));
  const folderInSrc = path.join(root, file.folder);
  const config = {
    ...extractConfig(path.join(root, file.folder)),
    components: file.name + file.ext,
    outDir: folderInDest
  };

  const data = await compileTemplates(
    path.join(config.componentsRoot, file.name + file.ext),
    config,
    file.name + file.ext
  );

  await fs.unlink(`${path.join(folderInDest, file.name)}.md`);

  if (!data.content) {
    return null;
  }

  let fileContent = parseVuepressFileHeader(
    await fs.readFile(`${path.join(folderInSrc, file.name + file.ext)}`, 'utf-8'),
    file
  );

  fileContent += data.content;

  return {
    dest: folderInDest,
    filename: file.name,
    content: fileContent
  };
};

export const writeContentToFile = async (file: Promise<ParseReturn | null>) => {
  const data = await file;

  if (data) {
    await mkdirp(data?.dest);
    await fs.writeFile(`${path.join(data.dest, data.filename)}.md`, data.content, 'utf-8');
  }
};
