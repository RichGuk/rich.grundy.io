---
layout: post
title: "Rails and AngularJS: keep it simple"
---

A few months ago I started experimenting with [AngularJS]; I was
blown away by it's power. I planned an entire admin interface rewrite with
a totally angular mindset, and it was going to be great! I had a solid API,
templates, routes, controllers, directives and service objects. I was in an
angular paradise, but for how long?

During the process I began to feel I had gone too far. I was unsure if AngularJS
was the right choice; it felt like I was duplicating much of what Rails already
gave you, and I started to lose faith. I found the documentation lacking, and
there seemed to be no pre-defined structure to the code. I felt overwhelmed,
however, I was not alone in feeling this way, and found several posts of similar
experiences: [Ben Nadel] and [Localytics]. After some
reflection, and a short break from the project, I decided to take a step back.
It was time to ease off on angular, and let Rails take back the things it does
really well: routing, non-dynamic html and a lot of the business logic. Leaving
angular to take care of the things it does well, the dynamic things.



[AngularJS]: http://angularjs.org
[Ben Nadel]: http://www.bennadel.com/blog/2439-my-experience-with-angularjs-the-super-heroic-javascript-mvw-framework.htm
[Localytics]: http://www.localytics.com/blog/2014/a-year-on-angular-on-rails-a-retrospective/
