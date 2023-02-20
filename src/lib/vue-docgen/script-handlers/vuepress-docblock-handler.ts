/**
 * @vuepress
 * ---
 * headline: vue-docgen/script-handlers/vuepress-docblock-handler.ts
 * ---
 */
import * as bt from '@babel/types';
import { ExtendedParseOptions } from '@hperchec/vue-docgen-template/dist/interfaces';
import { NodePath } from 'ast-types/lib/node-path';
import Documentation from 'vue-docgen-api/dist/Documentation';

import { parseComment } from '../../comment-parser';

/**
 * vue-docgen custom script handler to parse @vuepress
 * doc blocks anywhere at the top level of `<script>` content
 * Mutates the `documentation` object:
 * - `frontMatter` property: contains extracted frontmatter from vuepress doc block
 */
export const vuepressDocblockHandler = async (
  documentation: Documentation,
  compDef: NodePath,
  ast: bt.File,
  opt: ExtendedParseOptions
): Promise<void> => {
  // Get top level comment blocks (babel AST File Node type)
  const topLevelCommentBlocks = ast.tokens?.filter(token => token.type === 'CommentBlock') || [];
  // Get frontmatter from first found @vuepress doc block
  for (const commentBlock of topLevelCommentBlocks) {
    const { attributes } = parseComment(`/*${commentBlock.value}*/`);
    if (attributes) {
      // Set additionnal property to vue-docgen-api specific Documentation object
      documentation.set('frontMatter', attributes);
      break; // break when first found
    }
  }
};

export default vuepressDocblockHandler;
