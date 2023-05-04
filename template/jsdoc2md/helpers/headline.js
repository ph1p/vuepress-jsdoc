const path = require('path')

exports.headline = headline

/**
 * Extracts headline from frontMatter if it is set
 * @return {string}
 */
function headline () {
  let hl = path.basename(this.options.files[0]) // Default is filename
  if (this.options.frontMatter) {
    hl = this.options.frontMatter.headline || this.options.frontMatter.title || hl
  }
  return hl
}
