/*
 * @vuepress
 * ---
 * headline: lib/parser.ts
 * ---
 */
import jsdoc2md from 'jsdoc-to-markdown';
import fs from 'node:fs/promises';
import nodeModule, { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { StatisticType, TYPESCRIPT_EXTENSIONS, VUE_EXTENSIONS } from '../constants.js';
import { DirectoryFile, ParseReturn } from '../interfaces.js';

import { parseVuepressFileHeader } from './comment-parser.js';

const require = createRequire(import.meta.url);

const TEMPLATE_FOLDER = fileURLToPath(new URL('../../template/', import.meta.url));

export interface ParseOptions {
  /** source folder relative to the working directory */
  srcFolder: string;
  /** destination folder relative to the working directory */
  destFolder: string;
  /** path to a jsdoc config */
  jsDocConfigPath?: string;
  /** additional jsdoc2markdown partials */
  partials?: string[];
}

/**
 * Get the folder of the generated markdown file
 * @param {DirectoryFile} file
 * @param {string} srcFolder
 * @param {string} destFolder
 * @returns {string} destination folder
 */
export const getDestFolder = (file: Pick<DirectoryFile, 'folder'>, srcFolder: string, destFolder: string) =>
  path.join(destFolder, path.relative(path.resolve(srcFolder), path.resolve(file.folder)));

/**
 * Get a readable error message
 * @param {unknown} error
 * @returns {string}
 */
const getErrorMessage = (error: unknown) =>
  (error instanceof Error ? error.message : String(error)).split('\n').filter(Boolean).slice(0, 3).join('\n');

/**
 * Remove TypeScript types from source code, so jsdoc is able to parse it.
 * Types are replaced with whitespace, so all comments and line numbers stay intact.
 * @param {string} code TypeScript code
 * @returns {string} JavaScript code
 */
export const stripTypes = (code: string) => {
  const { stripTypeScriptTypes } = nodeModule as unknown as {
    stripTypeScriptTypes?: (code: string, options?: { mode: 'strip' }) => string;
  };

  if (typeof stripTypeScriptTypes !== 'function') {
    throw new Error('TypeScript files need Node.js >= 22.13 or a jsdoc config (--jsDocConfigPath)');
  }

  // stripTypeScriptTypes is still experimental and would print a warning
  const emitWarning = process.emitWarning;
  process.emitWarning = () => {};
  try {
    return stripTypeScriptTypes(code, { mode: 'strip' });
  } catch (e) {
    throw new Error(getErrorMessage(e), { cause: e });
  } finally {
    process.emitWarning = emitWarning;
  }
};

interface TypeScriptApi {
  transpileModule: (
    code: string,
    options: { fileName?: string; compilerOptions?: Record<string, unknown>; reportDiagnostics?: boolean }
  ) => { outputText: string };
  ScriptTarget: Record<string, number>;
  ModuleKind: Record<string, number>;
  JsxEmit: Record<string, number>;
}

/**
 * Load the TypeScript compiler API. The project of the user is preferred over the bundled one.
 * `typescript` >= 7 has no JavaScript API anymore, so `@typescript/typescript6` is tried as well.
 * The result is cached, because it is used for every TypeScript file.
 * @returns {TypeScriptApi | null} TypeScript module or null if it is not installed
 */
let typescript: TypeScriptApi | null | undefined;

const loadTypeScript = (): TypeScriptApi | null => {
  if (typescript !== undefined) return typescript;

  const requires = [createRequire(path.join(process.cwd(), 'package.json')), require];

  for (const req of requires) {
    for (const name of ['typescript', '@typescript/typescript6']) {
      try {
        const ts = req(name) as TypeScriptApi;
        if (typeof ts?.transpileModule === 'function') return (typescript = ts);
      } catch {
        // try the next one
      }
    }
  }

  return (typescript = null);
};

/**
 * Transpile TypeScript with the TypeScript compiler. Comments and JSX are preserved.
 * This supports syntax that type stripping can not handle: `enum`, `namespace`, parameter properties and JSX.
 * @param {string} code TypeScript code
 * @param {string} fileName used to detect `.tsx`
 * @returns {string | null} JavaScript code or null if TypeScript is not installed
 */
const transpileTypes = (code: string, fileName: string) => {
  const ts = loadTypeScript();
  if (!ts) return null;

  return ts.transpileModule(code, {
    fileName,
    reportDiagnostics: false,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
      removeComments: false,
      verbatimModuleSyntax: false,
      isolatedModules: true
    }
  }).outputText;
};

/**
 * Convert TypeScript to JavaScript. Type stripping of Node.js is used first, because it keeps all line numbers.
 * If the file contains syntax which needs a transformation, the TypeScript compiler is used.
 * @param {string} code TypeScript code
 * @param {string} fileName
 * @returns {string} JavaScript code
 */
export const typescriptToJavaScript = (code: string, fileName: string) => {
  let reason = 'JSX can not be stripped';

  if (!fileName.endsWith('.tsx')) {
    try {
      return stripTypes(code);
    } catch (e) {
      reason = getErrorMessage(e);
    }
  }

  const transpiled = transpileTypes(code, fileName);
  if (transpiled !== null) return transpiled;

  throw new Error(`${reason}\nInstall typescript or use a jsdoc config with babel (--jsDocConfigPath) for this file.`);
};

/**
 * Escape vue interpolations (`{{ }}`) outside of code, because VuePress compiles every page as a vue template.
 * @param {string} markdown
 * @returns {string} escaped markdown
 */
export const escapeVueInterpolation = (markdown: string) =>
  markdown
    // split by fenced code blocks, <code> and <pre> tags and inline code
    .split(/(```[\s\S]*?```|<pre[\s\S]*?<\/pre>|<code>[\s\S]*?<\/code>|`[^`\n]*`)/)
    // odd parts are code, which is kept. Inside <code> tags vue still interpolates.
    .map((part, i) =>
      i % 2 === 1 && !part.startsWith('<code>')
        ? part
        : part.replace(/\{\{/g, '&#123;&#123;').replace(/\}\}/g, '&#125;&#125;')
    )
    .join('');

/**
 * Render a javascript or typescript file with jsdoc-to-markdown
 * @param {DirectoryFile} file
 * @param {ParseOptions} options
 * @param {string} source content of the file
 * @returns {Promise<string>} markdown
 */
const renderScript = async (file: DirectoryFile, options: ParseOptions, source: string) => {
  const absolutePath = path.resolve(file.path);
  const jsdocOptions: Record<string, unknown> = {
    partial: [
      path.join(TEMPLATE_FOLDER, 'header.hbs'),
      path.join(TEMPLATE_FOLDER, 'main.hbs'),
      ...(options.partials || [])
    ]
  };

  if (options.jsDocConfigPath) {
    // the user config takes care of the file (e.g. typescript via jsdoc-babel)
    jsdocOptions.files = [absolutePath];
    jsdocOptions.configure = path.resolve(options.jsDocConfigPath);
    jsdocOptions['no-cache'] = true;
  } else if (TYPESCRIPT_EXTENSIONS.includes(file.ext)) {
    jsdocOptions.source = typescriptToJavaScript(source, file.path);
  } else {
    jsdocOptions.files = [absolutePath];
  }

  return jsdoc2md.render(jsdocOptions);
};

/**
 * Render a vue file with vue-docgen-cli
 * @param {DirectoryFile} file
 * @returns {Promise<string>} markdown
 */
const renderVue = async (file: DirectoryFile) => {
  const { default: compileTemplates } =
    require('vue-docgen-cli/lib/compileTemplates') as typeof import('vue-docgen-cli/lib/compileTemplates.js');
  const { extractConfig } = require('vue-docgen-cli/lib/docgen') as typeof import('vue-docgen-cli/lib/docgen.js');

  const fileName = path.basename(file.path);
  const config = await extractConfig(path.resolve(file.folder));

  const { content } = await compileTemplates('add', path.join(config.componentsRoot, fileName), config, fileName);

  return content;
};

/**
 * Parse a javascript, typescript or vue file and create the markdown content
 * @param {DirectoryFile} file
 * @param {ParseOptions} options
 * @returns {Promise<ParseReturn>} file data
 */
export const parseFile = async (file: DirectoryFile, options: ParseOptions): Promise<ParseReturn> => {
  const dest = getDestFolder(file, options.srcFolder, options.destFolder);
  const empty: ParseReturn = { type: StatisticType.EMPTY, file, dest, content: '' };

  try {
    const source = await fs.readFile(file.path, 'utf-8');
    const isVue = VUE_EXTENSIONS.includes(file.ext);
    const content = isVue ? await renderVue(file) : await renderScript(file, options, source);

    if (!content?.trim()) return empty;

    return {
      type: StatisticType.INCLUDE,
      file,
      dest,
      content: parseVuepressFileHeader(source, file) + escapeVueInterpolation(content.trim()) + '\n'
    };
  } catch (e) {
    const error = getErrorMessage(e);
    // the file is excluded by the jsdoc config (source.excludePattern)
    if (/no input files to process/i.test(error)) return empty;

    return { ...empty, type: StatisticType.ERROR, error };
  }
};

/**
 * Write the parsed content to disk. Files without content are skipped.
 * @param {ParseReturn} parseData
 * @returns {Promise<string | null>} path of the written file or null
 */
export const writeContentToFile = async (parseData: ParseReturn) => {
  if (parseData.type !== StatisticType.INCLUDE || !parseData.content) return null;

  const filePath = path.join(parseData.dest, `${parseData.file.name}.md`);

  await fs.mkdir(parseData.dest, { recursive: true });
  await fs.writeFile(filePath, parseData.content, 'utf-8');

  return filePath;
};
