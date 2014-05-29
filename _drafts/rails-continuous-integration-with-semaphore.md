---
layout: post
title: "Rails continuous integration with Semaphore"
---

This post covers continuous integration for Rails and is part one of a series of
posts that detail the services my team uses at [work][Stinkyink].

## Continuous integration

Writing software is error prone and riddled with problems. This is often
amplified when working in larger teams as you try to integrate each other's
code. Continuous integration, or CI for short, is a development practice whereby
team members integrate their work as frequently as possible; it is normally
achieved by having software automate the running of a test suite.

At [Stinkyink] we needed to find an affordable private CI server. We initially
setup [Jenkins] as our CI, but we found this difficult to setup and a burden
to maintain - we wanted a hosted solution. First we looked at [Travis CI], a
big player in the Rails world, however at the time they didn't offer private
repositories (good and free for Open Source). We finally settled on a service
called [Semaphore].

## Semaphore

<a href="http://cl.ly/image/1S0e2d3n2r01/content" data-fluidbox><img src="http://cl.ly/image/1S0e2d3n2r01/content" class="figure"></a>

Semaphore is a hosted CI solution that links directly to your [Github]
repositories. It automatically runs a build script, which you can customise,
with every commit you push or branch you create (our script runs things like
db:test:prepare, rspec, etc..). For us, Semaphore offered private repositories
at an affordable price. You can, at the time of writing this, get a basic plan
which handles 5 projects for $39/pm; compare that to Travis CI's base private
package at $129/pm.

Semaphore has several options for build failure notifications. We have our
notifications sent to [HipChat]  _(saving HipChat for a later post)_.
It also supports Github's commit status API, which means you get build statuses
directly in a Github pull request.

<a href="http://cl.ly/image/3o1c1i1T1G2U/content" data-fluidbox><img
src="http://cl.ly/image/3o1c1i1T1G2U/content" class="figure"></a>

<a href="http://cl.ly/image/3e0q3q2h2o24/content" data-fluidbox><img
src="http://cl.ly/image/3e0q3q2h2o24/content" class="figure"></a>

[Stinkyink]: http://www.stinkyinkshop.co.uk
[Jenkins]:http://jenkins-ci.org/
[Travis CI]:https://travis-ci.org/
[Semaphore]:https://semaphoreapp.com/
[Github]:http://github.com/
[HipChat]:http://hipchat.com/
