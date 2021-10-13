---
title: Sorting an Array by another Array in JavaScript
description: "Ever needed to sort an Array of Objects by the order of another
Array?"
heroIcon: "icon-javascript"
heroColor: "var(--brand-color-javascript)"
tags:

---


```javascript
const items = [
  { name: 'Bob' },
  { name: 'Tom' },
  { name: 'Josh' },
]

const itemsOrder = ['Tom', 'Josh', 'Bob']

[...items].sort((a, b) => itemsOrder.indexOf(a.name) - itemsOrder.indexOf(b.name))
```
