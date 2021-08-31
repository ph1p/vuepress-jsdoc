import chalk from 'chalk';
import del from 'del';
import fs from 'fs/promises';
import jsdoc2md from 'jsdoc-to-markdown';
import mm from 'micromatch';
import mkdirp from 'mkdirp';
import path from 'path';
import compileTemplates from 'vue-docgen-cli/lib/compileTemplates';
import vueDocgen, { extractConfig } from 'vue-docgen-cli/lib/docgen';

import { DirectoryFile } from './interfaces';
import { parseVuepressFileHeader } from './utils/comment-parser';

export const parseFile = async (
  file: DirectoryFile,
  srcFolder: string,
  destFolder: string,
  configPath: string,
  partials: string | string[]
) => {
  if (!file.folder) return;

  const root = process.cwd();
  const folderInDest = path.join(root, destFolder, file.folder.replace(srcFolder, ''));
  const folderInSrc = path.join(root, file.folder);

  try {
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

    const header = parseVuepressFileHeader(
      await fs.readFile(`${path.join(folderInSrc, file.name + file.ext)}`, 'utf-8'),
      file
    );

    await mkdirp(folderInDest);
    await fs.writeFile(`${path.join(folderInDest, file.name)}.md`, `${header}${content}`, 'utf-8');

    return `${header}${content}`;
  } catch (e) {}
};

export const parseVueFile = async (file: DirectoryFile, srcFolder: string, destFolder: string) => {
  if (!file.folder) return;

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

  if (!data.content) {
    return;
  }

  let fileContent = parseVuepressFileHeader(
    await fs.readFile(`${path.join(folderInSrc, file.name + file.ext)}`, 'utf-8'),
    file
  );
  fileContent += data.content;

  await mkdirp(folderInDest);
  await fs.writeFile(`${path.join(folderInDest, file.name)}.md`, fileContent, 'utf-8');

  return fileContent;
};
