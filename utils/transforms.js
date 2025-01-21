import htmlmin from 'html-minifier'

// Minify HTML in for the prod build.
export default {
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
