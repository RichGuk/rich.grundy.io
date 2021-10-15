const filters = require('./filters.js')

const tagsWithPostCountAndSlug = (posts) => {
  const tags = [...posts].reduce((acc, item) => {
    if (item.data.tags) {
      filters.withoutSpecialTags(item.data.tags).forEach((tag) => {
        acc[tag] ||= 0
        acc[tag] += 1
      })
    }

    return acc
  }, {})

  return Object.keys(tags).sort().reduce((acc, tag) => {
    acc[tag] = { slug: filters.slug(tag), count: tags[tag] }
    return acc
  }, {})
}

module.exports = {
  posts: (collection) => {
    return collection.getFilteredByGlob('src/blog/**/*.md')
  },
  ramblings: (collection) => {
    return collection.getFilteredByGlob('src/ramblings/**/*.md')
  },
  tagList: (collection) => {
    return tagsWithPostCountAndSlug(collection.getFilteredByGlob('src/blog/**/*.md'))
  },
  ramblingTags: (collection) => {
    return tagsWithPostCountAndSlug(collection.getFilteredByGlob('src/ramblings/**/*.md'))
  }
}
