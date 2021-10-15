import { verifyJwt } from './modules/auth'
import { getFilenameInfo } from './modules/helpers'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Bucket = 'media.rich.grundy.io'
const client = new S3Client({
  region: 'eu-west-1',
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_KEY
  }
})

const handler = async (event, _context) => {
  try {
    const { title, image } = JSON.parse(event.body)
    const { directoryName } = getFilenameInfo(title)
    const command = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: `ramblings/${directoryName}/${image}`,
      ACL: 'public-read'
    })
    const publicUrl = `https://media.rich.grundy.io/ramblings/${directoryName}/${image}`
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 })

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, uploadUrl, publicUrl, directoryName })
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error })
    }
  }
}

exports.handler = verifyJwt(handler)
