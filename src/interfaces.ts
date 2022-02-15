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
  source: string;
  dist: string;
  title: string;
  readme: string;
  watch: boolean;
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
