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

<a href="//i.imgur.com/cfmJjm1.png" data-fluidbox><img
src="//i.imgur.com/cfmJjm1.png" class="figure"></a>

Semaphore is a hosted CI solution that links directly to your [Github]
repositories. It automatically runs a build script, which you can customise,
with every commit you push and branch you create. Our script runs things like
db:test:prepare, rspec, etc..

For us, Semaphore offered private repositories at an affordable price with
basic plans that handle 5 projects for $39/pm - compare that to Travis CI's base
private package at $129/pm.

Getting notified of build failures is important and Semaphore fully supports
this. By default this is via email but we have our notifications sent to
[HipChat] _(saving HipChat for a later post)_. It also supports Github's commit
status API, which means you get build statuses directly in a Github pull
request.

<a href="//i.imgur.com/GiBcCm6.png" data-fluidbox><img
src="//i.imgur.com/GiBcCm6.png" class="figure"></a>

<a href="//i.imgur.com/Mlf69Tp.png" data-fluidbox><img
src="//i.imgur.com/Mlf69Tp.png" class="figure"></a>

Semaphore also allows you to exercise automatic deployment for successful
builds. This is something we haven't yet taken advantage of but I would very
much like to in future. It allows you to deploy via Capistrano, Heroku, Cloud66
_(something else we want to look at)_ or a generic deployment script (bash
script run in the root of the application).

<a href="//i.imgur.com/hLFRhkE.png" data-fluidbox><img
src="//i.imgur.com/hLFRhkE.png" class="figure"></a>

## Conclusion

We have been rocking Semaphore for well over a year now, and have loved our
experience so far. It's reasonably priced, fast, had very little issues, the
creators are lovely folk and their UI is sexy to boot.

If you haven't already setup a CI server for your team, especially if your team
is small, then I can highly recommend Semaphore. Even if you don't go with
Semaphore I recommend running a CI server as it takes the integration headache
away from your developers and ensures they're not distracted with having to
remember to run a test suite.

[Stinkyink]: http://www.stinkyinkshop.co.uk
[Jenkins]:http://jenkins-ci.org/
[Travis CI]:https://travis-ci.org/
[Semaphore]:https://semaphoreapp.com/
[Github]:http://github.com/
[HipChat]:http://hipchat.com/
