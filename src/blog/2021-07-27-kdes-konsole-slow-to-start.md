---
title: "Konsole on KDE slow to start?"
description: ""
heroColor: #1c94eb
tags:
  - linux
---

> TL;DR  
> It turns out lots of bookmarks for remote servers in Konsole slows things down.

My Konsole was slow to create new windows,  taking 5-10 seconds. It didn't
happen all the time but frustrating nonetheless.

Debugging was unsuccessful. I removed all my ZSH configs, disabled KDE window
overrides. But, nothing. No answers on Google.

Eventually, I realised it only happens when my fileserver is offline, so I
started digging around all the Konsole options and found the problem.

I had a ton of **bookmarks in Konsole**, several of which were for remote
servers. I didn't realise Konsole had this feature as it's not something I would
use. The bookmark shortcut is Ctrl + Shift + B, very close to the paste Ctrl +
Shift + V.  I can see myself mashing that a few times.

I was unable to edit bookmarks initially because I hadn't installed the
`keditbookmarks` package on Archlinux. Once installed, I could delete all the
bookmarks (this is also really laggy with the server offline), and voilà!

Fast Konsole once again.
