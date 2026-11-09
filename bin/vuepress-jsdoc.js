#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import cli from '../dist/cmds.js';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

cli(version);
