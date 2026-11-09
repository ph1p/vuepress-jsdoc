import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { StatisticType } from '../constants.js';
import {
  escapeVueInterpolation,
  parseFile,
  stripTypes,
  typescriptToJavaScript,
  writeContentToFile
} from '../lib/parser.js';

let tmp: string;
let cwd: string;

const createFile = async (name: string, content: string) => {
  await fs.mkdir(path.join(tmp, 'src', path.dirname(name)), { recursive: true });
  await fs.writeFile(path.join(tmp, 'src', name), content);

  const ext = path.extname(name);
  const folder = path.posix.join('src', path.dirname(name)) + '/';

  return { name: path.basename(name, ext), ext, folder: folder.replace('/./', '/'), path: `src/${name}` };
};

const options = { srcFolder: 'src', destFolder: 'docs/code' };

beforeAll(async () => {
  cwd = process.cwd();
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'vuepress-jsdoc-parser-'));
  process.chdir(tmp);
});

afterAll(async () => {
  process.chdir(cwd);
  await fs.rm(tmp, { recursive: true, force: true });
});

describe('escapeVueInterpolation()', () => {
  test('escapes interpolations in text and <code> tags', () => {
    expect(escapeVueInterpolation('a {{ b }}')).toBe('a &#123;&#123; b &#125;&#125;');
    expect(escapeVueInterpolation('<code>{{ b }}</code>')).toBe('<code>&#123;&#123; b &#125;&#125;</code>');
  });

  test('keeps interpolations in code blocks and inline code', () => {
    expect(escapeVueInterpolation('```js\n{{ b }}\n```')).toBe('```js\n{{ b }}\n```');
    expect(escapeVueInterpolation('`{{ b }}`')).toBe('`{{ b }}`');
  });
});

describe('stripTypes()', () => {
  test('removes types and keeps comments and line numbers', () => {
    const code = stripTypes('/** doc */\nconst a: number = 1;\ninterface B { c: string }\n');

    expect(code).toContain('/** doc */');
    expect(code).not.toContain(': number');
    expect(code).not.toContain('interface');
    expect(code.split('\n')).toHaveLength(4);
  });

  test('throws for unsupported syntax', () => {
    expect(() => stripTypes('enum A { B }')).toThrow();
  });
});

describe('typescriptToJavaScript()', () => {
  test('uses type stripping for plain typescript', () => {
    const code = typescriptToJavaScript('/** doc */\nconst a: number = 1;\n', 'a.ts');

    expect(code).toBe('/** doc */\nconst a         = 1;\n');
  });

  test('transpiles enums and keeps comments', () => {
    const code = typescriptToJavaScript('/** Colors */\nexport enum Color { Red }\n', 'a.ts');

    expect(code).toContain('/** Colors */');
    expect(code).not.toContain('enum');
  });

  test('keeps JSX in .tsx files', () => {
    const code = typescriptToJavaScript(
      '/** Icon */\nexport const Icon = (p: { a: string }) => <i>{p.a}</i>;\n',
      'a.tsx'
    );

    expect(code).toContain('<i>{p.a}</i>');
    expect(code).not.toContain(': {');
  });
});

describe('parseFile()', () => {
  test('renders a javascript file', async () => {
    const file = await createFile(
      'math.js',
      '/**\n * Add two numbers\n * @param {number} a\n * @param {number} b\n * @returns {number}\n */\nexport function add(a, b) { return a + b; }\n'
    );

    const result = await parseFile(file, options);

    expect(result.type).toBe(StatisticType.INCLUDE);
    expect(result.dest).toBe('docs/code');
    expect(result.content).toMatch(/^---\ntitle: "math"\n---\n\n# math\n/);
    expect(result.content).toContain('Add two numbers');
  });

  test('renders a typescript file without a jsdoc config', async () => {
    const file = await createFile(
      'lib/greet.ts',
      '/**\n * Greet someone\n * @param {string} name\n */\nexport const greet = (name: string): string => `Hi ${name}`;\n'
    );

    const result = await parseFile(file, options);

    expect(result.type).toBe(StatisticType.INCLUDE);
    expect(result.dest).toBe('docs/code/lib');
    expect(result.content).toContain('Greet someone');
  });

  test('renders typescript enums and tsx files', async () => {
    const enumFile = await createFile(
      'color.ts',
      '/**\n * Available colors\n * @enum {string}\n */\nexport enum Color { Red = "red" }\n'
    );
    const tsxFile = await createFile(
      'Icon.tsx',
      '/**\n * Render an icon\n * @param {object} props\n */\nexport const Icon = (props: { name: string }) => <i>{props.name}</i>;\n'
    );

    const enumResult = await parseFile(enumFile, options);
    const tsxResult = await parseFile(tsxFile, options);

    expect(enumResult.error).toBeUndefined();
    expect(enumResult.content).toContain('Available colors');
    expect(tsxResult.error).toBeUndefined();
    expect(tsxResult.content).toContain('Render an icon');
  });

  test('returns EMPTY for files excluded by the jsdoc config', async () => {
    const file = await createFile('skip.test.js', '/** doc */\nexport const a = 1;\n');
    await fs.writeFile(path.join(tmp, 'jsdoc.json'), JSON.stringify({ source: { excludePattern: '.+\\.test\\.js$' } }));

    const result = await parseFile(file, { ...options, jsDocConfigPath: 'jsdoc.json' });

    expect(result.error).toBeUndefined();
    expect(result.type).toBe(StatisticType.EMPTY);
  });

  test('returns EMPTY for files without documentation', async () => {
    const file = await createFile('empty.js', 'export const a = 1;\n');

    expect((await parseFile(file, options)).type).toBe(StatisticType.EMPTY);
  });

  test('returns ERROR with a message for invalid files', async () => {
    const file = await createFile('broken.js', '/** doc */\nexport const = ;\n');

    const result = await parseFile(file, options);

    expect(result.type).toBe(StatisticType.ERROR);
    expect(result.error).toBeTruthy();
  });

  test('renders a vue file', async () => {
    const file = await createFile(
      'components/Button.vue',
      `<template><button>{{ label }}</button></template>
<script>
/**
 * A simple button
 */
export default {
  name: 'MyButton',
  props: {
    /** The label of the button */
    label: { type: String, default: 'Click' }
  }
}
</script>
`
    );

    const result = await parseFile(file, options);

    expect(result.error).toBeUndefined();
    expect(result.type).toBe(StatisticType.INCLUDE);
    expect(result.content).toContain('The label of the button');
  });
});

describe('writeContentToFile()', () => {
  test('writes included files only', async () => {
    const file = await createFile('write.js', '');
    const dest = 'docs/code/write';

    expect(await writeContentToFile({ type: StatisticType.EMPTY, file, dest, content: '' })).toBe(null);

    const written = await writeContentToFile({ type: StatisticType.INCLUDE, file, dest, content: '# hi\n' });

    expect(written).toBe(path.join(dest, 'write.md'));
    expect(await fs.readFile(written!, 'utf-8')).toBe('# hi\n');
  });
});
