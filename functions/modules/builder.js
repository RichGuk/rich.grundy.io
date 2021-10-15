import { DateTime } from 'luxon'

const addFrontmatter = (output, fields) => {
  output += '---\n'

  for (const key in fields) {
    const value = fields[key]

    if (!value) {
      continue
    }

    if (value.constructor === Array) {
      if (value.length > 0) {
        output += `${key}:\n`
        value.forEach((item) => {
          output += ` - ${item}\n`
        })
      }
    } else {
      output += `${key}: ${String(value)}\n`
    }
  }

  output += '---\n\n'

  return output
}

const addBody = (output, { bodyWithoutTags, imageUrl, link }) => {
  let body = ''

  if (imageUrl) {
    body += `<img src=${imageUrl} class="microblog__image" />\n\n`
  }

  body += bodyWithoutTags.replace(/\r\n/g, '\n')

  if (link) {
    body += `\n\n<a href="${link}" class="microblog__body-link">${link}</a>`
  }

  return output + body
}

export const buildFile = (params) => {
  const { title, link, imageUrl, bodyWithoutTags, tags } = params

  let output = []
  output = addFrontmatter(output, {
    title: title ? `"${title.replace('"', "'")}"` : null,
    link: `"${link}"`,
    date: DateTime.utc().toISO({ suppressMilliseconds: true }),
    tags
  })
  output = addBody(output, { bodyWithoutTags, link, imageUrl })

  return {
    ...params,
    content: output
  }
}
