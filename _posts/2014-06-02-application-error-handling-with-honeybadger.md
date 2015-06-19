---
layout: post
title: "Application error handling with Honeybadger"
description: "How we use Honeybadger to efficiently handle our application
              errors. Gone are the days of tons of exception emails and hard to
              read log files!"
hero: //i.imgur.com/JY0MJvn.png
---

Part two in a series of posts detailing the services we use at
[work][Stinkyink]. This post covers how we handle errors in our application.
Part one covered [continuous integration][Part1].


## Errors?

Error handling is very important for any application; you want to know when
things break right? Traditionally applications have used log files or emails,
however, monitoring a log file is cumbersome and suddenly getting thousands of
emails is overwhelming.

There are plenty of services that make error handling easier; [Honeybadger],
[Airbrake], [Sentry], [Raygun], the list goes on... They all essentially do
the same thing just with the odd unique selling point or price difference.
These services provide a central place for errors, smartly notify you when they
occur, combine duplicates, allow team members to comment, and integrate with
third-party bug tracking and notification systems - all terribly important
things.

At [Stinkyink] we went with [Honeybadger] and get by with the micro plan which
is $19/pm for 3 apps and 7 days retention. A nice feature of Honeybadger is
that it knows about Rails' stack trace and it attempts to tidy it for you. When
you dig into the exception you also get useful information like environment
variables, session data, cookie data and the query params.

<a href="//i.imgur.com/FnV1vMy.png" data-fluidbox><img
src="//i.imgur.com/FnV1vMy.png" class="figure"></a>

Honeybadger is very Ruby focused so if you need other language support then
[Sentry] is often recommended. I think their base plan is $24/pm (if you need
teams, or $9/pm if you don't). If you're looking to spend very little then
[errbit] looks good - it's a self hosted open source project. Regardless of
which one you choose the important thing is you pick one.

## Honeybadger setup for Rails

Setting up Honeybadger is dead simple for Rails.

Add the following to your Gemfile.

{% highlight ruby %}
gem 'honeybadger'
{% endhighlight %}

Then generate the initializer with the following command.

<pre>
rails generate honeybadger --api-key your-api-key
</pre>

That _should_ be all you need to do. Honeybadger will now send any exceptions
that happen within Rails to your account, and it should have sent a test when you
ran the generate command.

Honeybadger allows you to manually send exceptions to your account. This is
especially useful if you want to pass additional information along with the
error.

Here is an example from their documentation.

{% highlight ruby %}
begin
  params = {
    :id => 1,
    :class => MyClass,
    :foo => "bar"
  }
  my_unpredicable_method(*params)
rescue => e
  Honeybadger.notify(
    :error_class   => "Special Error",
    :error_message => "Special Error: #{e.message}",
    :parameters    => params
  )
end
{% endhighlight %}


## Getting notifications

Honeybadger will notify you via email by default, but who reads email? Like
with our [continuous integration][Part1] we like to send our notifications to
[HipChat]. This can be setup in the project's settings.

<img
src="//i.imgur.com/Aq8ooC9.png" class="figure center">

## Conclusion

We have been using Honeybadger for over a year now and having a service handle
our error reporting has been incredibly useful. The HipChat integration provides
enough of a nag factor that developers are reminded of issues without being
overwhelmed so much as to ignore them entirely. I highly recommend going down
this route with your applications right from day one. The costs are small enough
to be a no-brainer for any business.

[Stinkyink]:http://www.stinkyinkshop.co.uk
[Part1]:/blog/rails-continuous-integration-with-semaphore/
[Honeybadger]:https://www.honeybadger.io/
[Airbrake]:https://www.honeybadger.io/
[Sentry]:https://www.getsentry.com/
[Raygun]:http://raygun.io/
[errbit]:https://github.com/errbit/errbit/
[HipChat]:https://www.hipchat.com/
