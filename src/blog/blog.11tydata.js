const path = require("path")

module.exports = {
  layout: "layouts/blog-entry",
  tags: "post",
  permalink:
    "/blog/{% if postSlug %}{{ postSlug }}{% else %}{{ title | slug }}{% endif %}/index.html",
  changeFreq: "monthly",
  priority: "0.9",
  eleventyComputed: {
    heroBaseUrl: (data) => {
      return process.env.NODE_ENV === "production"
        ? `//media.rich.grundy.io/blog/${path.basename(data.page.url)}`
        : `/assets/images/blog/${path.basename(data.page.url)}`
    }
  }
}
