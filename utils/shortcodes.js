import fs from 'fs'
import path from 'path'
import htmlmin from 'html-minifier'

const __dirname = import.meta.dirname

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

export default {
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
  },

  icon: (name) => {
    const svgPath = path.resolve(__dirname, '..', 'src', 'assets', 'icons', `${name}.svg`)
    return fs.readFileSync(svgPath, { encoding: 'utf8' })
  }
}
