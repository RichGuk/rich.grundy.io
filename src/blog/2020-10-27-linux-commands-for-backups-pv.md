---
title: "Linux commands for backups: pv"
description: "This post is about the using the Linux pipe viewer command, or pv."
tags:
  - linux
  - cli
---

This post is about the Linux pipe viewer command, or `pv`. It's the second part
of my beginners series on useful backup command-line tools for Linux.

* [Part 1: Linux tar](/blog/linux-commands-for-backups-tar/)
* Part 2: Linux pv

<hr class="-short-within-content">

Pipe viewer is a tool for monitoring the progress of data between Linux pipes.
It's a powerful little command. It becomes more powerful when you combine it
with other useful backup commands.

Let's start with a simple example. Copying files from one location to another:

```bash
$ cat /tmp/test > /home/rich/test
# or even:
$ cp /tmp/test /home/rich/test
```

Easy, but these lack progress bars. Instead, we can run it through pv:

```bash
$ pv /tmp/test > /home/rich/test
2.00GiB 0:00:01 [2.00GiB/s] [====>                          ] 19% ETA 0:00:04
```

We get the same action provided but with a handy progress bar. Sweet!

We can use it on a lot of commands, e.g. _gzip_:

```bash
$ gzip -c webserver.log | pv > webserver.log.gz
```

Going back to [part 1](/blog/linux-commands-for-backups-tar/), we
can combine `pv` with `tar` to get the progress of a tar archive:

```bash
$ tar cf - --zstd myDir | pv > myDir.tar.zst
```

Note that we no longer get an ETA for this command. Pipe viewer doesn't know how
big our directory is, unlike before with the file. We need to provide the size
to pv using the `-s` argument:

```bash
$ tar cf - myDir | pv -s $(du -sb myDir | cut -f 1) | zstd > myDir.tar.zst
```

Here we are saying provide the size `-s` in bytes. We're then running a
subcommand `du`, which estimates file space usage. Passing it the `-s`
summarise, and `-b` bytes arguments. `du` outputs two columns, so we're simply
using `cut` to get us the first column. The bytes.

<br>

Now we can combine it with ssh to send our backups over the wire with a
progress bar:

```bash
$ tar cf - myDir | pv -s $(du -bs myDir | cut -f 1) | zstd | ssh user@remote-server "cat > myArchiveDir.tar.zst"
```

Ace! Now you've learnt pipe viewer, a useful tool to know! You can use it
anytime you want to get progress between two commands. In part 3 we're going to
introduce encryption to our backups.
