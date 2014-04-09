---
layout: post
title: Simple backup script written in Ruby
description:
  Simple Ruby backup script that interfaces with Rsync to for weekly
  incremental backups.
categories:
  - projects
  - open source
---
I've written a simple backup script in Ruby that utilises Rsync I've made it public so feel free to fork, change and contribute!

The backups are structured as such:

/remote/location/current - The current folder contains the the latest clone of the intended backup folder.
/remote/location/backup_dir - The backup directory, which by default is the current day (monday, tuesday, etc) contains
the difference to current since it was last run. So it will contain any new files and any files that were deleted.

I need to add a few examples of the settings and how to use it via cron on Linux and Launchd on OS X but the basic script should be working fine.

The script can be found on my [github account](http://github.com/RichGuk), [http://github.com/RichGuk/rrsync/tree/master](http://github.com/RichGuk/rrsync/tree/master)

You can simply clone it with the following command:
**git clone git://github.com/RichGuk/rrsync.git**
