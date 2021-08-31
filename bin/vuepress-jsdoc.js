#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { version } = require('../package.json');
require('../dist/cmds').default(version);
