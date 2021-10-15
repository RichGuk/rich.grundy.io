module.exports = {
  eleventyComputed: {
    title: 'My Writings for #{{ tag | slug }}',
    posts: (data) => {
      return data.collections.posts.filter(
        (post) => post.data.tags && post.data.tags.includes(data.tag))
    }
  }
}
