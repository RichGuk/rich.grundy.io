module.exports = {
  eleventyComputed: {
    title: "My Writings for #{{ tag | slug }}",
    postsForTag: (data) => data.collections[data.tag]
  }
}
