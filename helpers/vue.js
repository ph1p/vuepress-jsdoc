// create vuepress sidebar
module.exports = ({ fileTree, codeFolder, title }) => {
  let rootFiles = [['', 'Mainpage']];
  rootFiles = rootFiles.concat(
    fileTree.filter(file => !file.children).map(file => file.name)
  );

  let rootFolder = fileTree.filter(
    file => file.children && file.children.length > 0
  );

  function buildChildren(children, name, depth) {
    let newChildren = [];

    children.forEach(child => {
      if (child.children && child.children.length > 0) {
        newChildren = newChildren.concat(
          buildChildren(child.children, child.name, depth + 1)
        );
      } else {
        newChildren.push((depth === 0 ? name + '/' : '') + child.name);
      }
    });

    return newChildren;
  }

  const tree = rootFolder.map(folder => ({
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
