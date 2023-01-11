const defaultTemplates = {
  component: require('vue-docgen-cli/lib/templates/component.js').default
}

/**
 * Use docgen.config.js file here (with vuepress-jsdoc).
 * The following vue-docgen configuration options will be ignored:
 * - componentsRoot
 * - components
 * - outDir
 * Because vuepress-jsdoc will call vue-docgen-cli compileTemplates method FOR EACH vue file.
 * The output directory is defined in vuepress-jsdoc configuration.
 * See also https://vue-styleguidist.github.io/docs/docgen-cli.html#config
 */
module.exports = {
  templates: {
    component: (...args) => {
      const defaultResult = defaultTemplates.component(...args)
      // Just add a line at the end of content
      return defaultResult + '\nThis is an overridden component template!\n'
    }
  }
}