import fs from 'fs';
interface Node {
  name: string;
  children: any[];
}

export const generateVueSidebar = ({
  fileTree,
  codeFolder,
  srcFolder,
  title
}: {
  fileTree: any;
  codeFolder: string;
  srcFolder: string;
  title: string;
}) => {
  let rootFiles = [['', '::vuepress-jsdoc-title::']];
  rootFiles = rootFiles.concat(fileTree.filter((file: Node) => !file.children).map((file: Node) => file.name));

  const rootFolder = fileTree.filter((file: Node) => file.children && file.children.length > 0);

  const buildChildren = (children: any[], name: string, depth: number) => {
    let newChildren: any[] = [];

    for (const child of children) {
      if (fs.existsSync(child.fullPath)) {
        if (child.children && child.children.length > 0) {
          newChildren = newChildren.concat(buildChildren(child.children, child.name, depth + 1));
        } else if (child.fullPath) {
          newChildren.push(child.fullPath.replace(`${srcFolder}/`, ''));
        }
      }
    }

    return newChildren;
  };

  const tree = rootFolder.map((folder: Node) => ({
    title: folder.name,
    collapsable: false,
    children: buildChildren(folder.children, folder.name, 0)
  }));

  return {
    [`/${codeFolder}/`]: [
      {
        title,
        collapsable: false,
        children: rootFiles
      }
    ].concat(tree)
  };
};
