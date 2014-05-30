---
layout: post
title: "Application error handling with Honeybadger"
hero: http://cl.ly/image/0d1Z0H2j363Z/content
---

Part two in a series of posts detailing the services used at [work][Stinkyink].
This post covers how we handle errors in our application. Part one covered
[continuous integration][Part1].


## Errors?

Error handling is very important for any application; you want to know when
things break right? Traditionally applications have used log files or emails,
however, monitoring a log file is cumbersome, and suddenly getting thousands of
emails is overwhelming.

There are plenty of services that make error handling easier; [Honeybadger],
[Airbrake], [Sentry], [Raygun], the list goes on... They all essentially do
the same thing just with the odd USP and price difference. These services
provide a central place for errors, smartly notify you when they occur, combine
duplicates, and allow team members to comment and mark as resolved - all
terribly important.

At [Stinkyink] we went with [Honeybadger], which is very Ruby focused so if you
need to support other platforms then apparently [Sentry] is good fit. You should
pick whichever one suites you, the important thing is you pick one. If you're
looking to spend £0 then [errbit] looks interesting, a self hosted open source
alternative.

<a href="http://cl.ly/image/0g0W2g0H0Y0G/content" data-fluidbox><img
src="http://cl.ly/image/0g0W2g0H0Y0G/content" class="figure"></a>

A nice feature of Honeybadger is that it knows about Rails' stack trace and it
attempts to tidy it for you. When you dig into the exception you also get useful
information like environment variables, session and cookie data and the query
params.

## Getting setup (in Rails)

Setting up Honeybadger is dead simple for Rails.

Add the following to your Gemfile

{% highlight ruby %}
gem 'honeybadger'
{% endhighlight %}

Then generate the initializer with the following command.

<pre>
rails generate honeybadger --api-key your-api-key
</pre>

That _should_ be all you need to do. Honeybadger will now send any exceptions
that happen within Rails to your account, and it should of set a test when you
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

Honeybadger will notify you via email by default, however, who the hell reads
email? Like with out [continuous integration][Part1] setup we like to send our
notifications to [HipChat], which is fully supported.


[Stinkyink]:http://www.stinkyinkshop.co.uk
[Part1]:/blog/rails-continuous-integration-with-semaphore/
[Honeybadger]:https://www.honeybadger.io/
[Airbrake]:https://www.honeybadger.io/
[Sentry]:https://www.getsentry.com/
[Raygun]:http://raygun.io/
[errbit]:https://github.com/errbit/errbit/
[HipChat]:https://www.hipchat.com/
