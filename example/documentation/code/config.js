exports.fileTree = [
  { name: 'Icon', path: '/Icon', fullPath: './documentation/code/Icon' },
  { name: 'class-constructor', path: '/class-constructor', fullPath: './documentation/code/class-constructor' },
  { name: 'class', path: '/class', fullPath: './documentation/code/class' },
  {
    name: 'lib',
    children: [
      { name: 'dmd-options', path: '/dmd-options', fullPath: 'lib/dmd-options' },
      { name: 'jsdoc-to-markdown', path: '/jsdoc-to-markdown', fullPath: 'lib/jsdoc-to-markdown' }
    ]
  },
  { name: 'methods', path: '/methods', fullPath: './documentation/code/methods' },
  { name: 'objects', path: '/objects', fullPath: './documentation/code/objects' },
  {
    name: 'subfolder',
    children: [
      {
        name: 'subfolder.1',
        children: [{ name: 'variables', path: '/variables', fullPath: 'subfolder/subfolder.1/variables' }]
      },
      { name: 'variables', path: '/variables', fullPath: 'subfolder/variables' }
    ]
  },
  { name: 'test', path: '/test', fullPath: './documentation/code/test' },
  { name: 'tests', children: [] }
];
exports.sidebarTree = (title = 'Mainpage') => ({
  '/code/': [
    {
      title: 'API',
      collapsable: false,
      children: [['', '' + title + ''], 'Icon', 'class-constructor', 'class', 'methods', 'objects', 'test']
    },
    { title: 'lib', collapsable: false, children: ['lib/dmd-options', 'lib/jsdoc-to-markdown'] },
    { title: 'subfolder', collapsable: false, children: ['subfolder/subfolder.1/variables', 'subfolder/variables'] }
  ]
});
