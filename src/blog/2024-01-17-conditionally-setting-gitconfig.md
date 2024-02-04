---
title: Conditionally setting gitconfig
heroIcon: "icon-git"
heroColor: var(--brand-color-git)
description: "Effortlessly manage Git configurations for work and personal projects using conditional includes, preventing the risk of using the wrong email in your projects"
---

For years, I've used this alias in my gitconfig:

```git
[alias]
    work = !"git config user.email 'rich@workdomain.tld'"
```

Whenever starting a new work project, I would run `git work` to set a local gitconfig for the project, and it worked well. However, since I don't frequently clone repositories at work, I would forgot to run it.

During a recent dotfiles cleanup, I wondered if there was a better way to handle different settings per project. It turns out there is! You can [conditionally load][gitincludes] configurations in your `gitconfig`.

In your gitconfig:

```git
[includeIf "gitdir:~/Projects/Work/"]
  path = ~/.config/git/work
```
And in `~/.config/git/work`:

```git
[user]
  name = Rich Grundy
  email = rich@workdomain.tld

[commit]
  gpgsign = true
```

This allows you to conditionally target a directory to load extra config options, which is convenient as all my work projects reside in one directory.

There are several other options available. Aside from targeting directories, you can also target the remote:

```git
[includeIf "hasconfig:remote.*.url:git@github.com:OrgAccount/**"]
   path = ~/.config/git/work
```

Hope that helps. 😉

[gitincludes]: https://git-scm.com/docs/git-config#_conditional_includes
