import { DateTime } from 'luxon'
import slugify from 'slugify'

const slugFilter = (str) => {
  return slugify(str.replace(/\//g, '-'), {
    remove: /[*+~.()'"!:@,?]/g,
    replacement: '-',
    lower: true
  })
}

const specialTags = new Set(['post', 'posts', 'ramblings'])
const withoutSpecialTags = (tags) =>
  tags.filter((t) => t && !specialTags.has(t))

export default {
  slug: slugFilter,

  readableDate: (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('dd LLL yyyy')
  },

  htmlDateString: (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('yyyy-LL-dd')
  },

  ISOTime: (dateObj) => {
    return DateTime.fromJSDate(dateObj).toISO()
  },

  formatDate: (dateObj, format) => {
    return DateTime.fromJSDate(dateObj).toFormat(format)
  },

  limit: (arr, limit) => {
    return arr.slice(0, limit)
  },

  validTags: (tags) => {
    if (!tags) {
      return []
    }
    return withoutSpecialTags(tags).map((t) => slugFilter(t))
  },

  withoutSpecialTags
}
