const fs = require("fs")
const path = require("path")
const htmlmin = require("html-minifier")

const manifestPath = path.resolve(__dirname, "dist", "assets-manifest.json")
let manifest = {}
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, { encoding: "utf8" }))
}
const filters = require("./utils/filters.js")

const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")
const pluginRss = require("@11ty/eleventy-plugin-rss")

module.exports = (eleventyConfig) => {
  const devMode = process.env.NODE_ENV !== "production"

  eleventyConfig.setDataDeepMerge(true)

  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(pluginRss)

  eleventyConfig.addLayoutAlias("default", "layouts/pages.njk")
  eleventyConfig.addLayoutAlias("pages", "layouts/pages.njk")

  eleventyConfig
    .addPassthroughCopy({ "src/assets/static": "/assets" })
    .addPassthroughCopy({ "src/assets/vendor": "vendor" })
    .addPassthroughCopy({ "src/public": "/" })

  eleventyConfig.addShortcode("assetUrl", (name) => {
    if (!manifest[name]) {
      return name
    }
    return manifest[name]
  })

  eleventyConfig.addShortcode(
    "imageTag",
    (src, desc = "") => {
      src = devMode ? `/assets/images/${src}` : `//media.rich.grundy.io/${src}`
      const file = `${path.dirname(src)}/${path.basename(src, path.extname(src))}`
      return `<picture><source srcset="${file}.avif" type="image/avif" loading="lazy"><source srcset="${file}.webp" type="image/webp" loading="lazy"><img src="${src}" alt="${desc}" loading="lazy"></picture>`
    }
  )

  eleventyConfig.addCollection("tagList", function (collection) {
    const tags = [...collection.getAll()].reduce((acc, item) => {
      if (item.data.tags) {
        filters.withoutSpecialTags(item.data.tags).forEach((tag) => {
          acc[tag] ||= 0
          acc[tag] += 1
        })
      }

      return acc
    }, {})

    return Object.keys(tags).sort().reduce((acc, tag) => {
      acc[tag] = { slug: filters.slug(tag), count: tags[tag] }
      return acc
    }, {})
  })

  Object.keys(filters).forEach((name) => {
    eleventyConfig.addFilter(name, filters[name])
  })

  eleventyConfig.setBrowserSyncConfig({
    files: [
      "./dist/assets"
    ]
  })

  // Minify HTML in for the prod build.
  if (!devMode) {
    eleventyConfig.addTransform("htmlmin", (content, outputPath) => {
      if (outputPath.endsWith(".html")) {
        const minified = htmlmin.minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true
        })
        return minified
      }
      return content
    })
  }

  return {
    dir: {
      input: "src",
      output: "dist"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    passthroughFileCopy: true
  }
}
