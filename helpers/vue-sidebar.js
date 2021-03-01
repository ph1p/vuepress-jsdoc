'use strict';

// create vuepress sidebar
module.exports = ({ fileTree, codeFolder, title, multinav }) => {
  let rootFiles = [['', '::vuepress-jsdoc-title::']];
  rootFiles = rootFiles.concat(fileTree.filter(file => !file.children).map(file => file.name));

  let rootFolder = fileTree.filter(file => file.children && file.children.length > 0);

  function buildChildren(children, name, depth) {
    let newChildren = [];

    children.forEach(child => {
      if (child.children && child.children.length > 0) {
        newChildren = newChildren.concat(buildChildren(child.children, child.name, depth + 1));
      } else if (child.fullPath) {
        multinav ? newChildren.push(`/${codeFolder}/${child.fullPath}`) : newChildren.push(child.fullPath);
      }
    });

    return newChildren;
  }

  const tree = rootFolder.map(folder => ({
    title: folder.name,
    collapsable: false,
    children: buildChildren(folder.children, folder.name, 0)
  }));

  let sidebar;

  if (multinav) {
    sidebar = {};
    tree.forEach(folder => {
      sidebar[`/${codeFolder}/${folder.title}/`] = folder.children;
    });
  } else {
    sidebar = {
      [`/${codeFolder}/`]: [
        {
          title,
          collapsable: false,
          children: rootFiles
        }
      ].concat(tree)
    };
  }

  return sidebar;
};
