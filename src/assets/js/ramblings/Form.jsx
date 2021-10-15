import { h } from 'preact'
import imageCompression from 'browser-image-compression'

const Form = ({ formFields, formError, setFormFields, setTags, onSubmit, isSubmitting }) => {
  const updateTags = (body) => {
    const matchedTags = [...body.matchAll(/#([0-9a-zA-Z_-]+)/g)].map((match) => match[1])
    setTags(matchedTags)
  }

  const updateBody = (e) => {
    const body = e.target.value

    setFormFields({
      ...formFields,
      body,
      bodyWithoutTags: body.replaceAll(/#[0-9a-zA-Z]+/g, '').trim()
    })
    updateTags(body)
  }

  const updateFileField = async (e) => {
    const imageFile = e.target.files[0]

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 750,
      useWebWorker: true
    }

    const compressedFile = await imageCompression(imageFile, options)

    setFormFields({ ...formFields, image: compressedFile })
  }

  const updateField = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value })
  }

  const clearImage = (e) => {
    e.preventDefault()
    setFormFields({ ...formFields, image: null })
  }

  return (
    <form method="post" className="microblog-form" onSubmit={(e) => {
      e.preventDefault()
      onSubmit()
    }}>
      <div className="microblog-form__fields">
        <div className="microblog-form__field">
          <label>Title</label>
          <input type="text" name="title" value={formFields.title} onInput={updateField} />
        </div>

        <div className="microblog-form__field">
          <label>URL</label>
          <input type="text" name="link" value={formFields.link} onInput={updateField} placeholder="https://" />
        </div>
      </div>

      <div className="microblog-form__fields">
        <div className="microblog-form__field">
          <label>Image {formFields.image && <a href="" style="font-weight: normal" onClick={clearImage}>(clear)</a>}</label>
          <input type="file" accept="image/*" onChange={updateFileField} value={formFields.image} />
        </div>
      </div>

      <div className="microblog-form__fields">
        <div className="microblog-form__field">
          <label>Body</label>
          <textarea name="body" value={formFields.body} onInput={updateBody} />
        </div>
      </div>

      <div className="microblog-form__fields -button-box">
        {<span>{formError}</span>}
        <button type="submit" className="microblog-form__btn" disabled={isSubmitting}>Share</button>
      </div>
    </form>
  )
}

export default Form
