module.exports = {
  layout: "layouts/blog-entry",
  tags: "post",
  permalink: "/blog/{% if postSlug %}{{ postSlug }}{% else %}{{ title | slug }}{% endif %}/index.html",
  eleventyComputed: {
    posts: data => data.collections.post
  }
}
