import { RenderOptions, JsdocOptions } from 'jsdoc-to-markdown';

export interface DirectoryFile {
  path: string;
  isDir: boolean;
  ext?: string;
  name: string;
  folder?: string;
}

export interface CLIArguments {
  include: string;
  exclude: string;
  partials: string[];
  rmPattern: string[];
  folder: string;
  jsDocConfigPath: string;
  docgenConfigPath: string;
  source: string;
  dist: string;
  title: string;
  readme: string;
  watch: boolean;
  j2mdTemplate: RenderOptions['template'];
  j2mdHeadingDepth: RenderOptions['heading-depth'];
  j2mdExampleLang: RenderOptions['example-lang'];
  j2mdPlugin: RenderOptions['plugin'];
  j2mdHelper: RenderOptions['helper'];
  j2mdNameFormat: RenderOptions['name-format'];
  j2mdNoGfm: RenderOptions['no-gfm'];
  j2mdSeparators: RenderOptions['separators'];
  j2mdModuleIndexFormat: RenderOptions['module-index-format'];
  j2mdGlobalIndexFormat: RenderOptions['global-index-format'];
  j2mdParamListFormat: RenderOptions['param-list-format'];
  j2mdPropertyListFormat: RenderOptions['property-list-format'];
  j2mdMemberIndexFormat: RenderOptions['member-index-format'];
  j2mdPrivate: boolean; // Not yet documented. See https://github.com/jsdoc2md/gulp-jsdoc-to-markdown/issues/1
}

export interface ParseFileOptions {
  configPath: JsdocOptions['configure'];
  partials: string | string[];
  template: RenderOptions['template'];
  'heading-depth': RenderOptions['heading-depth'];
  'example-lang': RenderOptions['example-lang'];
  plugin: RenderOptions['plugin'];
  helper: RenderOptions['helper'];
  'name-format': RenderOptions['name-format'];
  'no-gfm': RenderOptions['no-gfm'];
  separators: RenderOptions['separators'];
  'module-index-format': RenderOptions['module-index-format'];
  'global-index-format': RenderOptions['global-index-format'];
  'param-list-format': RenderOptions['param-list-format'];
  'property-list-format': RenderOptions['property-list-format'];
  'member-index-format': RenderOptions['member-index-format'];
  private: boolean;
}

export interface ParseVueFileOptions {
  configPath: string | undefined;
}

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

export interface FileTree {
  name: string;
  path?: string;
  ext?: string;
  fullPath?: string;
  children?: FileTree[];
}
