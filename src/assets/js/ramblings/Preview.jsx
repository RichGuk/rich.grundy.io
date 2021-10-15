import { h } from 'preact'
import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
})

const Preview = ({ tags, formFields }) => {
  const formatBody = (body) => {
    body = body.replaceAll(/#[0-9a-zA-Z]+/g, '').trim()

    if (tags.length > 0) {
      const linkedTags = tags.map((tag) => `<a href="">#${tag}</a>`).join(' ')
      body += `<div class="microblog__tags">${linkedTags}</div>`
    }

    return body
  }

  const image = formFields.image && URL.createObjectURL(formFields.image)
  const body = markdown.render(formatBody(formFields.body))

  return (
    <article className="microblog">
      <div className="microblog__header">
        {formFields.title && <h2 class="microblog__title">{formFields.title}</h2>}
        <time className="microblog__date">18 Oct 2021</time>
      </div>

      {image && <img className="microblog__image" src={image} />}

      {formFields.body && (
        <div className="microblog__body" dangerouslySetInnerHTML={{ __html: body }} />
      )}

      {formFields.link && <a className="microblog__body-link" href={formFields.link}>{formFields.link}</a>}
    </article>
  )
}

export default Preview
