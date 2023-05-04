/*
 * @vuepress
 * ---
 * headline: lib/parser/parse-file.ts
 * ---
 */
import jsdoc2md, { RenderOptions, JsdocOptions } from 'jsdoc-to-markdown';
import path from 'path';

import { DirectoryFile } from '../../interfaces';
import { parseVuepressFileHeader } from '../comment-parser';
import { readFile, frontMatterToString } from '../utils';

import { ParseReturn } from '.';

const templatePath = path.resolve(__filename, '../../../../template');

export interface ParseFileOptions {
  configure: JsdocOptions['configure'];
  'example-lang': RenderOptions['example-lang'];
  'global-index-format': RenderOptions['global-index-format'];
  'heading-depth': RenderOptions['heading-depth'];
  helper: RenderOptions['helper'];
  'member-index-format': RenderOptions['member-index-format'];
  'module-index-format': RenderOptions['module-index-format'];
  'name-format': RenderOptions['name-format'];
  'no-gfm': RenderOptions['no-gfm'];
  'param-list-format': RenderOptions['param-list-format'];
  partial: string | string[];
  plugin: RenderOptions['plugin'];
  private: boolean;
  'property-list-format': RenderOptions['property-list-format'];
  separators: RenderOptions['separators'];
  template: RenderOptions['template'];
}

/**
 * Parse a typescript or javascript file
 * @param {DirectoryFile} file - The file
 * @param {string} srcFolder - The source folder path
 * @param {string} destFolder - The destination folder path
 * @param {ParseFileOptions} options - The options
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
  const relativePathDest = path.join(destFolder, file.folder.replace(srcFolder, ''));
  const folderInDest = path.join(root, relativePathDest);
  const folderInSrc = path.join(root, file.folder);

  const { configure, partial, helper, template: templateOpt, ...otherOptions } = options;

  // If template option provided
  if (templateOpt) {
    // Build path
    const tmplPath = path.isAbsolute(templateOpt) ? templateOpt : path.join(root, templateOpt);
    // Read file and add property to otherOptions object
    Object.defineProperty(otherOptions, 'template', readFile(tmplPath));
  }

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

    const renderOptions = {
      'no-cache': configure ? true : false,
      files: [path.join(root, file.folder, fileName + file.ext)],
      configure,
      partial: [
        path.join(templatePath, 'jsdoc2md/partials/header.hbs'),
        path.join(templatePath, 'jsdoc2md/partials/main.hbs'),
        ...partial
      ],
      helper: [
        path.join(templatePath, 'jsdoc2md/helpers/headline.js'),
        ...(helper ? (Array.isArray(helper) ? helper : [helper]) : [])
      ]
    };

    for (const name in otherOptions) {
      if (otherOptions[name] !== undefined) renderOptions[name] = otherOptions[name];
    }

    // Parse @vuepress block and extract front matter
    const frontMatter = parseVuepressFileHeader(readFile(path.join(folderInSrc, fileName + file.ext)), file);

    // Pass frontmatter to dmd options
    // @ts-ignore
    renderOptions.frontMatter = frontMatter;

    // Render
    content = await jsdoc2md.render(renderOptions);

    const frontMatterStr = frontMatterToString(frontMatter);

    fileContent += frontMatterStr ? frontMatterStr + '\n\n' : '';

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

export default parseFile;
