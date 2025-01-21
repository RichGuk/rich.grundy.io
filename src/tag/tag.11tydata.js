export default {
  eleventyComputed: {
    title: 'My Writings for #{{ tag | slug }}',
    filteredPosts: (data) => {
      return data.collections.posts.filter(
        (post) => post.data.tags && post.data.tags.includes(data.tag))
    }
  }
}
