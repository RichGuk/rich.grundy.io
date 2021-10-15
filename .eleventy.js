const shortcodes = require('./utils/shortcodes.js')
const filters = require('./utils/filters.js')
const collections = require('./utils/collections.js')
const transforms = require('./utils/transforms.js')

const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const pluginRss = require('@11ty/eleventy-plugin-rss')

module.exports = (eleventyConfig) => {
  eleventyConfig.setDataDeepMerge(true)

  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(pluginRss)

  eleventyConfig.addLayoutAlias('default', 'layouts/pages.njk')
  eleventyConfig.addLayoutAlias('pages', 'layouts/pages.njk')

  eleventyConfig
    .addPassthroughCopy({ 'src/assets/images': '/assets/images' })
    .addPassthroughCopy({ 'src/assets/fonts': '/assets/fonts' })
    .addPassthroughCopy({ 'src/assets/vendor': 'vendor' })
    .addPassthroughCopy({ 'src/public': '/' })

  eleventyConfig.setBrowserSyncConfig({
    ui: false,
    ghostMode: true,
    ignorePaths: ['ramblings/share/*'],
    files: [
      './dist/assets/css',
      './dist/assets/js',
    ]
  })

  Object.keys(shortcodes).forEach((name) => {
    eleventyConfig.addShortcode(name, shortcodes[name])
  })

  Object.keys(filters).forEach((name) => {
    eleventyConfig.addFilter(name, filters[name])
  })

  Object.keys(collections).forEach((name) => {
    eleventyConfig.addCollection(name, collections[name])
  })

  Object.keys(transforms).forEach((name) => {
    eleventyConfig.addTransform(name, transforms[name])
  })

  eleventyConfig.setUseGitIgnore(false)

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  }
}
