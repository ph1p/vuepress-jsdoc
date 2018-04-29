exports.fileTree=[
    {
        "text": "class",
        "path": "/class"
    },
    {
        "text": "methods",
        "path": "/methods"
    },
    {
        "text": "objects",
        "path": "/objects"
    },
    {
        "text": "second",
        "items": []
    },
    {
        "text": "subfolder",
        "items": [
            {
                "text": "subfolder.1",
                "items": [
                    {
                        "text": "variables",
                        "path": "/variables"
                    }
                ]
            },
            {
                "text": "variables",
                "path": "/variables"
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
                [
                    "class",
                    "class"
                ],
                [
                    "methods",
                    "methods"
                ],
                [
                    "objects",
                    "objects"
                ],
                [
                    "subfolder/subfolder.1/variables",
                    "subfolder/subfolder.1/variables"
                ],
                [
                    "subfolder/variables",
                    "subfolder/variables"
                ]
            ]
        }
    ]
};