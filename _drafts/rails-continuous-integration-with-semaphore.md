---
layout: post
title: "Rails continuous integration with Semaphore"
---

This post covers continuous integration for Rails and is part one of a series of
posts that detail the services we use at [work][Stinkyink].

## Continuous integration?

Writing software is error prone and riddled with problems. This is often
amplified when working in larger teams as you try to integrate each other's
code. Continuous integration, or CI for short, is a development practice whereby
team members integrate their work as frequently as possible; it is normally
achieved by having software automate the running of a test suite, which you all
have right?

## Semaphore?

At [Stinkyink] we have a private codebase, and so we wanted to find an
affordable private CI provider. We initially setup [Jenkins] as our CI,
but we found this difficult to setup and a burden to maintain. We needed a
"cloud" solution. We first looked at [Travis CI], a big player in the Rails
world, however at the time we setup our CI server they didn't offer private
repositories; If your project is Open Source then I can recommend [Travis CI].



[Stinkyink]: http://www.stinkyinkshop.co.uk
[Jenkins]:http://jenkins-ci.org/
[Travis CI]:https://travis-ci.org/
