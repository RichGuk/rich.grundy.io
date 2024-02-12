---
title: Making an Array unique in JavaScript
description: "So, you have an Array that you need to make unique in Javascript?"
heroColor: "var(--brand-color-javascript)"
heroIcon: "javascript"
tags:
  - javascript

---

So, you have an Array that you need to make unique in Javascript? But how?

Given the following items:

```javascript
items = [
  'item1',
  'item2',
  'item3',
  'item3',
  'item4',
  'item4',
  'item4'
]
```

Using ES6, we can use the unique nature of [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

```javascript
const newItems = [...new Set(items)]
// [ 'item1', 'item2', 'item3', 'item4' ]
```

`Set` creates a unique mapping, which we convert to a new Array using the spread
operator '`...`' to give us the new list. Neat!

If you're stuck supporting ES5/older browsers (IE9+), you can use the less
concise `filter` trick.

```javascript
var newItems = items.filter(function (item, idx, arr) {
  return arr.indexOf(item) == idx
})
// [ 'item1', 'item2', 'item3', 'item4' ]
```

How does this work? `indexOf` returns the index of the first matching item, so
only the first occurrence will ever match the index in the loop.
