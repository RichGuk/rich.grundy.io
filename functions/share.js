import { verifyJwt } from './modules/auth'
import { buildFile } from './modules/builder'
import { writeFile } from './modules/github'
import { getFilenameInfo } from './modules/helpers'

const handler = async (event, _context) => {
  try {
    let fields = JSON.parse(event.body)

    if (!fields.title && !fields.image && !fields.body && !fields.link) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Missing data!'
        })
      }
    }

    if (fields.image) {
      const { directoryName, publicUrl } = fields.image
      fields = {
        ...fields,
        directoryName,
        filename: `${directoryName}.md`,
        imageUrl: publicUrl
      }
    } else {
      fields = { ...fields, ...getFilenameInfo(fields.title) }
    }

    await writeFile(buildFile(fields))

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true
      })
    }
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: err.toString()
      })
    }
  }
}

exports.handler = verifyJwt(handler)
