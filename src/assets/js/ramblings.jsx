import { h, render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import useAuth from './ramblings/auth'
import Form from './ramblings/Form'
import Preview from './ramblings/Preview'
import imageCompression from 'browser-image-compression'

const defaultFormFields = {
  title: null,
  image: null,
  body: '',
  bodyWithoutTags: '',
  link: null
}

const Root = () => {
  const { isAuthenticated, token } = useAuth()
  const [formFields, setFormFields] = useState(defaultFormFields)
  const [formError, setFormError] = useState(null)
  const [tags, setTags] = useState([])
  const [isSubmitting, setSubmitting] = useState(false)

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', async (event) => {
      const { title, url, text, image } = event.data
      const link = url || text
      const imageCompressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 750,
        useWebWorker: true
      }

      let compressedImage = null
      if (image) {
        compressedImage = await imageCompression(image, imageCompressionOptions)
      }

      setFormFields({ ...formFields, title, link, image: compressedImage })
    })
  }, [formFields])

  const uploadImage = async () => {
    if (!formFields.image) {
      return null
    }

    const signedResponse = await fetch('/.netlify/functions/s3upload', {
      method: 'post',
      headers: new Headers({
        Authorization: `Bearer ${token}`
      }),
      body: JSON.stringify({
        title: formFields.title,
        image: formFields.image.name
      })
    })
    const { uploadUrl, publicUrl, directoryName } = await signedResponse.json()

    await fetch(uploadUrl, {
      method: 'put',
      headers: new Headers({
        'Content-Type': formFields.image.type
      }),
      body: formFields.image
    })

    return { publicUrl, directoryName }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setFormError(null)

      const image = await uploadImage()

      const response = await fetch('/.netlify/functions/share', {
        method: 'post',
        headers: new Headers({
          Authorization: `Bearer ${token}`
        }),
        body: JSON.stringify({
          ...formFields,
          tags,
          image
        })
      })
      const responseBody = await response.json()

      if (response.ok) {
        setFormFields(defaultFormFields)
      } else {
        setFormError(responseBody.error)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="microblog-wrapper" style={{ margin: '3rem auto', padding: '1rem' }}>
      <p><a href="/ramblings">Back</a></p>

      <Form
        setFormFields={setFormFields}
        setTags={setTags}
        formError={formError}
        formFields={formFields}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <Preview tags={tags} formFields={formFields} />
    </div>
  )
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/ramblings-sw.js').then((reg) => {
      console.log('Successfully registered worker: ', reg.scope)
    })
  })
}

render(<Root />, document.getElementById('root'))
