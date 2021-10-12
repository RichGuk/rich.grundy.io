---
title: "Caching assets on Netlify"
heroColor: "var(--brand-color-netlify)"
heroIcon: "icon-netlify"
tags:
  - services
---

For some reason, I never thought to check until now. But caching wasn't working
for any of the assets on this site. You have to turn on the setting within the
Netlify config. It doesn't just assume you want to cache things—it makes sense.

Luckily it's easy, create a file called `netlify.toml` in the project root:

```toml
[[headers]]
  for="/assets/*"
  [headers.values]
  Cache-Control = "public, max-age=31536000"
```

And voilà! We now have cached assets.

If you want different headers for other paths, it's just a case of adding
multiple entries:

```toml
[[headers]]
  for="/images/*"
  [headers.values]
  Cache-Control = "public, max-age=31536000"
[[headers]]
  for="/fonts/*"
  [headers.values]
  Cache-Control = "public, max-age=31536000"
```
