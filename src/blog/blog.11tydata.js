import path from 'path'

export default {
  layout: 'layouts/blog-entry',
  tags: 'post',
  permalink:
    '/blog/{% if postSlug %}{{ postSlug }}{% else %}{{ title | slug }}{% endif %}/index.html',
  changeFreq: 'monthly',
  priority: '0.9',
  eleventyComputed: {
    heroBaseUrl: (data) => {
      return `/assets/images/blog/${path.basename(data.page.url)}`
    },
    posts: (data) => data.collections.posts
  }
}
