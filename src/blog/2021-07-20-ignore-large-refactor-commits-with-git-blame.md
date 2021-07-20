---
title: "Ignore large refactor commits with Git blame"
hero: //media.rich.grundy.io/blogs/ignore-large-refactor-commits-with-git-blame/hero.webp
description: "You can remove certain commits when using Git blame. Really
helpful for mass refactoring commits."
---

Today I was using Git blame trying to work out who changed a line of code. I
kept hitting a wall because the last commit was actually a mass code formatting
commit. I thought to myself—there must be a way to skip these commits. It turns
out there is!

Git has an option `--ignore-rev <rev>`.  From the documentation:

> Ignore changes made by the revision when assigning blame, as if the change
> never happened. Lines that were changed or added by an ignored commit will be
> blamed on the previous commit that changed that line or nearby lines...

You can use `---ignore-rev` several times for multiple commits, but there is
also a flag for specifying a file where you can list the rev ids
`--ignore-revs-file`.

> Ignore revisions listed in file, which must be in the same format as an
> fsck.skipList. This option may be repeated, and these files will be processed
> after any files specified with the blame.ignoreRevsFile config option. An
> empty file name, "", will clear the list of revs from previously processed
> files.

As helpful as the flag is, I use a Vim plugin for Git blame. I needed a way to
configure it easily for all blames within the project. As you may have noticed
from the documentation, you can also set this via a config option.
`blame.ignoreRevsFile`.

In the project in question, simply run:

```
 git config blame.ignoreRevsFile .git-blame-ignore-revs
```
(note lack of --global, only applies to this project).

Create a file in the root named `.git-blame-ignore-revs` and list all the commit
revs you wish to ignore. Note they must be the full-hash. Which you can find
with:

```
git rev-parse eeccbf39
```

As we don't wish to commit this file (unless the team want to), we should ignore
this file. To ignore just in our copy of the repo, open up `.git/info/exclude`
and add the filename in the same format as the usual `.gitignore`.

That's it. You're done.
