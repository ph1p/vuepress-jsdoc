exports.fileTree=[
    {
        "name": "class",
        "path": "/class",
        "fullPath": "./documentation/code/class"
    },
    {
        "name": "lib",
        "children": [
            {
                "name": "dmd-options",
                "path": "/dmd-options",
                "fullPath": "lib/dmd-options"
            },
            {
                "name": "jsdoc-to-markdown",
                "path": "/jsdoc-to-markdown",
                "fullPath": "lib/jsdoc-to-markdown"
            }
        ]
    },
    {
        "name": "methods",
        "path": "/methods",
        "fullPath": "./documentation/code/methods"
    },
    {
        "name": "objects",
        "path": "/objects",
        "fullPath": "./documentation/code/objects"
    },
    {
        "name": "subfolder",
        "children": [
            {
                "name": "subfolder.1",
                "children": [
                    {
                        "name": "variables",
                        "path": "/variables",
                        "fullPath": "subfolder/subfolder.1/variables"
                    }
                ]
            },
            {
                "name": "variables",
                "path": "/variables",
                "fullPath": "subfolder/variables"
            }
        ]
    }
];
exports.sidebarTree={
    "/code/": [
        {
            "title": "API",
            "collapsable": false,
            "children": [
                [
                    "",
                    "Mainpage"
                ],
                "class",
                "methods",
                "objects"
            ]
        },
        {
            "title": "lib",
            "collapsable": false,
            "children": [
                "lib/dmd-options",
                "lib/jsdoc-to-markdown"
            ]
        },
        {
            "title": "subfolder",
            "collapsable": false,
            "children": [
                "subfolder/subfolder.1/variables",
                "subfolder/variables"
            ]
        }
    ]
};