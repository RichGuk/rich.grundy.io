import fs from 'fs'
import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.GITHUB_APP_ID,
    installationId: process.env.GITHUB_INSTALL_ID,
    privateKey: process.env.GITHUB_PRIVATE_KEY.replace(/\\n/gm, "\n")
  }
})
const branch = 'master'
const repoSrc = 'RichGuk/rich.grundy.io/contents/src/ramblings'
const committer = {
  name: 'Rich Grundy',
  email: 'rich@grundy.io'
}

const writeLocalFile = async (filename, content) => {
  return fs.writeFile(`src/ramblings/${filename}`, content)
}

export const writeFile = async ({ filename, content }) => {
  if (process.env.SHARER_WRITE_LOCALLY === 'true') {
    return await writeLocalFile(filename, content)
  }

  try {
    const response = await octokit.request(`PUT /repos/${repoSrc}/${filename}`, {
      branch,
      message: `Commited new ramble: src/ramblings/${filename}`,
      content: Buffer.from(content).toString('base64'),
      committer
    })
  } catch (e) {
    if (e?.response?.data?.message?.match(/"sha" wasn't supplied/)) {
      throw new Error('file already exists')
    } else {
      throw e
    }
  }
}
