module.exports = {
  eleventyComputed: {
    title: "My Writings for #{{ tag | slug }}",
    posts: data => data.collections[ data.tag ]
  }
}
