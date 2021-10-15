const htmlmin = require('html-minifier')

// Minify HTML in for the prod build.
module.exports = {
  htmlmin: (content, outputPath) => {
    if (process.env.NODE_ENV === 'production' && outputPath.endsWith('.html')) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      })
    }

    return content
  }
}
