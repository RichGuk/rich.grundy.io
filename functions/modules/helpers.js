import { slug } from '../../utils/filters'
import { DateTime } from 'luxon'

export const getFilenameInfo = (title) => {
  const date = DateTime.utc()
  let filename = `${date.toFormat('yyyy-LL-dd')}-`

  if (title) {
    filename += slug(title)
  } else {
    filename += String(date.toSeconds()).split('.')[0]
  }

  return {
    filename: `${filename}.md`,
    directoryName: filename,
    srcDirectory: `src/ramblings/${filename}`
  }
}
