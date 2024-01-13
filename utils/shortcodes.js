const fs = require('fs')
const path = require('path')
const htmlmin = require('html-minifier')

const minify = (content) => (
  htmlmin.minify(content, {
    removeComments: true, collapseWhitespace: true
  })
)

const manifestPath = path.resolve(__dirname, '..', 'dist', 'assets-manifest.json')
let manifest = {}
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, { encoding: 'utf8' }))
}

module.exports = {
  assetUrl: (name) => {
    if (!manifest[name]) {
      return name
    }
    return manifest[name]
  },

  imageTag:
  (src, desc = '') => {
    src = `/assets/images/${src}`
    const file = `${path.dirname(src)}/${path.basename(src, path.extname(src))}`

    return minify(`
      <picture>
        <source srcset="${file}.avif" type="image/avif" loading="lazy">
        <source srcset="${file}.webp" type="image/webp" loading="lazy">
        <img src="${file}.webp" alt="${desc}" loading="lazy">
      </picture>
    `)
  }
}
