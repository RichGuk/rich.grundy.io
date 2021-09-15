const filters = require("./filters.js")

module.exports = {
  tagList: (collection) => {
    const tags = [...collection.getAll()].reduce((acc, item) => {
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
  },

  posts: (collection) => {
    return collection.getFilteredByGlob("src/blog/**/*.md")
  }
}
