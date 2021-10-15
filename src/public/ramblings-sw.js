self.addEventListener('install', (event) => {
  console.log('Installing SW!', event)
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (event.request.method !== 'POST' || url.pathname !== '/ramblings/share') {
    return
  }

  event.respondWith(Response.redirect('/ramblings/share/'))

  event.waitUntil(async function () {
    const data = await event.request.formData()
    const title = data.get('title')
    const text = data.get('text')
    const url = data.get('url')
    const image = data.get('image')

    setTimeout(async () => {
      const client = await self.clients.get(event.resultingClientId || event.clientId)
      client.postMessage({ title, text, url, image })
    }, 2000)
  }())
})
