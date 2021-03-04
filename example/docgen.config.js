/** @type import("vue-docgen-cli").DocgenCLIConfig */
module.exports = {
	docsRepo: 'vue-styleguidist/vue-styleguidist',
	docsBranch: 'dev',
	docsFolder: 'example',
	componentsRoot: 'src/components',
	components: '**/[A-Z]*.vue',
	outDir: './documentation/code/components',
	defaultExamples: true,
	templates: {
		// global component template wrapping all others see #templates
		// component: require('../template/component').component,
		// slots: require('../template/slots').slots,
		// props: require('../template/props').props,
	}
}