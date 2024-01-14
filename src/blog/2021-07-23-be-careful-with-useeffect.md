---
title: Be careful with useEffect
description: "Be careful when using useEffect, you might not realise you're returning."
heroIcon: "icon-react"
heroColor: "var(--brand-color-react)"
tags:
  - javascript
  - react
---

We had an interesting bug this week at work. A component would load without an
issue, but the second you navigated away, it errored. It had a subtle bug.

```javascript
import React, { useEffect } from 'react'
import Api form 'helpers/api'

const Teacher = ({ id }) => {
  useEffect(() => getTeacher(), [id])

  const getTeacher = () => Api.getWithPromise(`/api/teachers/${id}`).then(...)
  ....
}
```

Can you see the problem?  We're returning something in the `useEffect` hook.

`useEffect` runs any returned value as a cleanup step during component unmount.
It should be a non-promise function or _undefined_ if you wish not to run any
cleanup. Here, we're returning the promise because of the implicit return of
single-expression arrow functions. Once the component was unmounted, it
errored. But this is unintentional. We don't want to run any cleanup. In the
end, it's an easy fix.

```javascript
useEffect(() => {
  getTeacher()
}, [id])
```

React will warn you about this in the console, of course, but it's something to
keep in mind.
