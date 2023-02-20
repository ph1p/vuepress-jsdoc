import { RenderOptions } from 'jsdoc-to-markdown';

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
  rmPattern: string[];
  folder: string;
  source: string;
  dist: string;
  title: string;
  readme: string;
  watch: boolean;
  // jsDoc specific options
  jsDocConfigPath: string | undefined;
  // jsdoc2md specific options
  j2mdExampleLang: RenderOptions['example-lang'];
  j2mdGlobalIndexFormat: RenderOptions['global-index-format'];
  j2mdHeadingDepth: RenderOptions['heading-depth'];
  j2mdHelper: RenderOptions['helper'];
  j2mdMemberIndexFormat: RenderOptions['member-index-format'];
  j2mdModuleIndexFormat: RenderOptions['module-index-format'];
  j2mdNameFormat: RenderOptions['name-format'];
  j2mdNoGfm: RenderOptions['no-gfm'];
  j2mdPartial: string[];
  j2mdParamListFormat: RenderOptions['param-list-format'];
  j2mdPlugin: RenderOptions['plugin'];
  j2mdPropertyListFormat: RenderOptions['property-list-format'];
  j2mdSeparators: RenderOptions['separators'];
  j2mdTemplate: RenderOptions['template'];
  // vue-docgen-cli specific options
  docgenConfigPath: string | undefined;
  docgenHelper: string | string[] | undefined;
  docgenPartial: string | string[] | undefined;
  docgenTemplate: string | undefined;
}

export interface FileTree {
  name: string;
  path?: string;
  ext?: string;
  fullPath?: string;
  children?: FileTree[];
}
