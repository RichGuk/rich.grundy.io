---
title: "Linux commands for backups: Tar"
description: "This is a beginners guide on how to compress and uncompress
directories and files using Linux's tar command. Part of a useful utility belt
of commands for backups on Linux."
tags:
  - linux
  - cli
---

This is a beginners guide on how to compress and uncompress using Linux's
__tar__ command. Part of a useful utility belt of commands for backups on Linux.

<hr class="-short-within-content">

__Tar__ allows you to archive files or directories into a single file—think of
it like a bag you store items in—its useful if you want to maintain the
ownership and permissions of the files you archive.

## Creating an archive

Say we have a directory called  `myDir` that we want to archive to  `myDir.tar`,
we could run:

```bash
tar --create --verbose --file myDir.tar myDir
```

This can be shortened using the shorthand options: __-c__, __-v__, __-f__.
In fact we don't even need the hyphens, just run:

```bash
tar cvf myDir.tar myDir
```

Awesome! We now have our archived `myDir`, but could we do better? What happens
if we want to save some space?  `myDir` might contain lots of text files that
could be compressed to save space.

Tar has flags for using different compression algorithms: __--gzip (-z)__,
__--bzip2 (-j)__ and __--xz (-J)__, for example. I personally like to use
[zstd][1], a newer algorithm that I find faster with better compression. You may
prefer `gzip`, which will already be installed on nearly all distros.

To compress a folder with zstd, or gzip you could run:

```bash
tar --zstd cvf myDir.tar.zst myDir
tar czvf myDir.tar.gz myDir
```

Its good practice to name the file extension in some way to indicate its a
compressed archive. Common names include: gzip: __.tar.gz__; bzip:
__.tar.bz2__ or zstd: __.tar.zst__

In fact, this has an advantage, tar has an option not many know of:
__--auto-compress__ or __-a__. This option will automatically choose the
compression algorithm based on the file suffix. Our previous commands can be run
with:

```bash
tar cavf myDir.tar.zst myDir
tar cavf myDir.tar.gz myDir
```

What about archiving multiple directories? Just them to the end of the
command:

```bash
tar cavf myArchive.tar.zst myDir myOtherDir notes.txt
```

You can list as many directories or files as you like.

You can also exclude files (or directories) from an archive. For example, if we
wanted everything in `myDir` archived apart from `myDir/list.txt`, then we can
use the __--exclude__ flag:

```bash
tar cavf myDir.tar.zst --exclude=myDir/list.txt myDir
```

The exclude flag is actually quite powerful; you can use patterns with it. For
example, if we have a directory containing RAWs & JPEGs from a camera, and only
want to archive the RAW files:

```bash
tar cavf 2020-10-08-photoshoot-raws.tar.zst --exclude=*.jpg ./todays-photoshoot
```

## Extracting an archive

To extra an archive you simply replace the __-c__ flag with __--extract__, or
__-x__. We don't even need __-a__, tar knows what to do with the compressed
archive:

```bash
tar xvf myDir.tar.zst
```

If you want to extract to a different location, for example _/tmp_, use the
__-C__ flag:

```bash
tar xvf myDir.tar.zst -C /tmp
cd /tmp/myDir
```

## Using Pipe and SSH

A handy feature of tar is you can combine it with the Linux pipe and send
the data over ssh to a remote server.

To archive a local folder to a remote server you can run the following:

```bash
tar cvf - --zstd myDir | ssh user@remote-server "cat > myArchiveDir.tar.zst"
```

Note the __-f -__, the `-` is saying send the tar output to _stdout_.

You can also extract the archive directly on the remote server:

```bash
tar cvf - --zstd myDir | ssh user@remote-server "tar x --zstd"
```


That concludes a beginners guide to the __tar__ command. On its own its useful,
but it becomes really powerful when you start combining it with other commands.
There will be future posts expanding on this.


[1]: https://engineering.fb.com/core-data/smaller-and-faster-data-compression-with-zstandard/
