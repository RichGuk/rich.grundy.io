module.exports = {
  eleventyComputed: {
    posts: (data) => {
      return data.collections.ramblings.reverse().filter(
        (post) => post.data.tags && post.data.tags.includes(data.tag))
    }
  }
}
