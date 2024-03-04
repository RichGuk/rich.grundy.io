---
title: Auto hibernate/wake a Linux machine on a time schedule with Systemd
description: ""
heroColor: "#30d475"
heroIcon: "systemd"
tags:
    - linux
---

I have a Linux NAS/Plex server at home that serves as storage for backups and
all my media. It's a behemoth of a machine: 30TB, spread over 8 or so drives,
and powered by a Ryzen 1600 CPU. It consumes power, which is unnecessary while
I'm at work or sleeping. That's why I automate the process of hibernating and
waking the machine on a timed schedule using systemd.

I've been doing this for the last 5+ years, and it has been flawless. My
machine performs its offsite backups at midnight, then hibernates until the
afternoon, when it wakes itself up, ready for any usage from Plex.

To do this, we need some timers/services for hibernation and some for wakeup.
The machine needs to hibernate rather than shutdown completely, for obvious
reasons.

## Hibernation

Let's create the following files.

`/usr/local/bin/auto-suspend`:

```bash
#!/bin/env bash

if [ -e "/tmp/auto-suspend.lock" ]; then
  echo "Lock file in place. NOT SUSPENDING."
  exit 0
fi

echo "Hibernating...."
/usr/bin/systemctl suspend
```

This is a simple hibernate script. If I wish, I can stop automatic hibernation
by creating `/tmp/auto-suspend.lock`. My backup scripts do this, for example,
just in case they're taking longer than usual to run.

`/etc/systemd/system/auto-suspend.service`:

```systemd
[Unit]
Description=Auto suspend service
After=suspend.target

[Service]
Type=simple
ExecStart=/usr/local/bin/auto-suspend

[Install]
WantedBy=suspend.target
```


`/etc/systemd/system/auto-suspend.timer`:

```systemd
[Unit]
Description=Automatically suspend

[Timer]
Unit=auto-suspend.service
OnCalendar=Mon-Fri *-*-* 02:30
OnCalendar=Sat,Sun 03:00

[Install]
WantedBy=timers.target
```

This sets up a simple timer to run the hibernate script at 2:30 AM every
weekday and 3:00 AM on the weekend.

## Wakeup

Now for the fun one: waking up the machine from hibernation.

`/etc/systemd/system/auto-resume.service`:

```systemd
[Unit]
Description=Resume machine

[Service]
Type=oneshot
ExecStart=/usr/local/bin/auto-resume
```

This is a handy way to run anything you wish coming out of hibernation, like updating dynamic DNS.

`/etc/systemd/system/auto-resume.timer`:

```systemd
[Unit]
Description=Automatically resume on a schedule

[Timer]
OnCalendar=Mon-Fri *-*-* 16:30
OnCalendar=Sat,Sun 06:30
WakeSystem=true

[Install]
WantedBy=timers.target
```

Quite similar to the other timer, we're running this at 4:30 PM during the week
and 6:30 AM on the weekend. However, this timer has an additional option,
WakeSystem, which tells systemd to wake the machine out of hibernation when
this triggers. The service part is also optional if you don't need anything to
run. Just the timer is enough.

There we go, we now have timers set up to hibernate and wake our machine up. To
load them, simply run:

```
sudo systemctl daemon-reload
sudo systemctl enable auto-resume.timer
sudo systemctl enable auto-suspend.timer
sudo systemctl start auto-resume.timer
sudo systemctl start auto-suspend.timer
```

