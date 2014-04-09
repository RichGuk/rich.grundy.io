---
layout: post
title: Securely backup your VPS using Duplicity &amp; GnuPG
description:
  Duplicity is a backup solution that you can use to backup your VPS. This howto
  shows how to get this setup for simple automatic encrypted backups.
categories:
  - how-to
---
It's always a good idea to backup your data; it gives you protection from data loss and hardware failure. If you host sensitive data, or applications for customers, it's a good idea to encrypt the backups, ensuring their secure and can be safely kept just about anywhere.

There are lots of backup scripts, solutions and services around: [Rsync](http://samba.anu.edu.au/rsync/), [s3sync](http://s3sync.net/wiki), [Rdiff-backup](http://rdiff-backup.nongnu.org/), [Jungle Disk](http://www.jungledisk.com/) and [Duplicity](http://www.nongnu.org/duplicity/) being just a few. After trying a few of them I decided to go with Duplicity for my [Linode](http://www.linode.com/?r=00870b85cb89e8747f4319189550b4943bc7483b) VPS; it provided a simple, yet powerful, way of doing encrypted backups.

Duplicity uses librsync and GnuPG to incrementally encrypt archives of files that have changed since the last backup. You can transfer the backups using a whole range of protocols: ftp, imap, rsync, s3 and scp for example - I store backups on my local file server, however, due to the encrypted nature they could easily be stored on something like Amazon's S3.

The MAN pages have more information on the [actions](http://www.nongnu.org/duplicity/duplicity.1.html#toc4), [options](http://www.nongnu.org/duplicity/duplicity.1.html#toc5) and [URL formats](http://www.nongnu.org/duplicity/duplicity.1.html#toc6) for duplicity, it also provides several [examples](http://www.nongnu.org/duplicity/duplicity.1.html#toc3).

## Installing duplicity and its dependencies
Duplicity is written in python, which needs to be installed if it isn't already (not something covered here). You can install Duplicity via Debian's package manager, but the version is outdated and lacks newer features; to get the latest version it's best to install it from source.

The following dependencies need to be met:

* Python v2.3 or later
* librsync v0.9.6 or later
* GnuPG for encryption
* NcFTP version 3.1.9 or later
* Boto 0.9d or later
* Python development files (python-dev)
* librsync development files (librsync-dev)

Debian users can simply run the following to get all of the required dependencies:

<pre>$ sudo aptitude build-dep duplicity</pre>

Fetch the latest stable release, which as of writing this was 0.6.08b:

<pre>$ mkdir sources<br>$ cd sources<br>$ wget http://code.launchpad.net/duplicity/0.6-series/0.6.08b/+download/duplicity-0.6.08b.tar.gz</pre>

Extract the tarball:

<pre>$ tar xvzf duplicity-0.6.08b.tar.gz<br>$ cd duplicity-0.6.08b</pre>

Finally, install Duplicity:

<pre>$ sudo python setup.py install</pre>

If successful then you should be able to verify by running:

<pre>$ duplicity --version</pre>

## Encryption &amp; Keys
Duplicity takes care of the gpg encryption for us, all we have to do is supply a public encryption and signature key. The encryption key is used to protect the data from nosey people, while the signature key is used to ensure the integrity of the backups.

By default, if you omit the signature key, the encryption key is used for signing as well. It's highly recommended to create separate signature and encryption keys; the passphrase for the signature needs to be available in the script, therefore, using the same key for encryption and signing leaves your encrypted files exposed.

On your local machine, not your production server, you can generate the keys with this command:

<pre>$ gpg --gen-key</pre>

You will be given a choice of key types, I normally go with the default - same thing with the key length and expiry. When you're asked to enter a name, you can put what you want, I tend to put the name of the server and which key it is, signature or encryption.

Example of the encryption key generation:

<pre>
gpg --gen-key
gpg (GnuPG) 1.4.10; Copyright (C) 2008 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Please select what kind of key you want:
   (1) RSA and RSA (default)
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
Your selection? 
*press enter*
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (2048) 
Requested keysize is 2048 bits
*press enter*
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 
*press enter*
Key does not expire at all
Is this correct? (y/N) y

You need a user ID to identify your key; the software constructs the user ID
from the Real Name, Comment and Email Address in this form:
    "Heinrich Heine (Der Dichter) <heinrichh@duesseldorf.de>"

Real name: Edge Backup Encryption Key
Email address: me@domain.com
Comment: Encryption key for Edge backups
You selected this USER-ID:
    "Edge Backup Encryption Key (Encryption key for Edge backups) <me@domain.com>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
You need a Passphrase to protect your secret key.
*enter passphrase, make sure secure*
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
....................+++++
...+++++
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
.....+++++
+++++
gpg: key B5FC8737 marked as ultimately trusted
public and secret key created and signed.

gpg: checking the trustdb
gpg: 3 marginal(s) needed, 1 complete(s) needed, PGP trust model
gpg: depth: 0  valid:   2  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 2u
pub   2048R/B5FC8737 2010-04-03
      Key fingerprint = 2365 2F64 0808 8A90 644C  9AEF FBBD B843 B5FC 8737
uid                  Edge Backup Encryption Key (Encryption key for Edge backups) <me@domain.com>
sub   2048R/9ABB5804 2010-04-03
</pre>

Do exactly the same for the signature key, but make sure you use a different passphrase.

Once both keys have been created you need to export and copy the public encryption and private signature keys to the production box; the safest way to do this is SCP/SSH.

To export the keys run the following commands:

<pre>$ gpg --export -a 'Edge Backup Encryption' > edge.enc.pub.gpg<br>$ gpg --export-secret-keys -a 'Edge Backup Signature' > backup.sig.sec.gpg</pre>

Transfer them to the production box:

<pre>$ scp edge.enc.pub.gpg backup.sig.sec.gpg rich@server.com:/tmp</pre>

Import the transferred keys by running the following command (on the production box):

<pre>$ gpg --import /tmp/backup.enc.pub.gpg<br>$ gpg --import-secret-keys /tmp/backup.enc.sec.gpg</pre>

Verify the keys were imported correctly, we also need to note down the key IDs:

<pre>$ gpg --list-keys<br>$ gpg --list-secret-keys</pre>

<pre>
/root/.gnupg/pubring.gpg
------------------------
pub   2048R/5FD0100F 2010-04-04
uid                  Edge Backup Encryption Key (Encryption key for edge backups) <me@domain.com>
sub   2048R/48F61F08 2010-04-04

pub   2048R/7F73FA36 2010-04-04
uid                  Edge Backup Signature Key (Signature key for edge backups) <me@domain.com>
sub   2048R/A67F8410 2010-04-04



/root/.gnupg/secring.gpg
------------------------
sec   2048R/7F73FA36 2010-04-04
uid                  Edge Backup Signature Key (Signature key for edge backups) <me@domain.com>
ssb   2048R/A67F8410 2010-04-04
</pre>

The two IDs we're interested in are **5FD0100F** (encryption key) and **7F73FA36** (signature key).

## Backup process

I run my backups as root with the scripts running from the root home directory and only readable by root - chmod'ed with 700 (rwx------). I do this for two reasons: one, you need to be able to read all the directories on the server and two, the passphrase needs to be stored in the script.

Before we begin the backups we need to create an exclusion list to ignore certain directories that we don't want to backup. You may include your own directories, or alter the list to better suit your Linux distro.

<pre>$ vim /root/backups/excludelist<br><br># Add the following and save<br>- /sys<br>- /dev<br>- /proc<br>- /tmp<br>- /mnt</pre>

I suggest running the initial backup manually so you can catch any potential errors before automating the process; the initial backup needs to copy everything so expect it to take a while! 

Run the following command, changing the sign and encrypt keys for yours! Time to grab a beer maybe?

<pre>$ duplicity --sign-key '7F73FA36' --encrypt-key '5FD0100F' --exclude-filelist=/root/backups/excludelist / scp://rich@backup_server//mnt/backups/edge/main</pre>

After that has finished confirm the backup ran successfully:

<pre>duplicity collection-status scp://rich@backup_server//mnt/backups/edge/main</pre>

It should list a load of statistics and say something like: _"No orphaned or incomplete backup sets found."_

When you're happy it's all running you can automate the process via a cronjob. Below is the script I use to backup my VPS, note that I dump all the mySQL databases before doing the backup, relying on backups of /var/lib/mysql isn't advised.

{% highlight bash %}
#!/bin/sh

export PASSPHRASE=SomeMagiclySecurePassphrase
export SSH_AUTH_SOCK=/tmp/ssh-agent

#
# Dump mySQL databases, relying on backup of /var/lib/mysql isn't advised.
#
mysqldump --all-databases -uroot -pTEHPAZZ | bzip2 -c > /root/backups/db/all_databases_$(date +%Y_%m_%d).sql.bz2

#
# Main backup.
#
duplicity --sign-key '7F73FA36' --encrypt-key '5FD0100F' --exclude-filelist=/root/scripts/backups/ignorelist / scp://rich@backup_server//mnt/backups/edge/main

#
# Clean up.
#

# Remove the temp database dump.
rm /root/backups/db/all_databases_$(date +%Y_%m_%d).sql.bz2

# Delete duplicity backups older than 30 days.
duplicity remove-older-than 30D scp://rich@backup_server//mnt/backups/edge/main
{% endhighlight %}

That's it! You should now have secure, fully automated backups of your server. Just make sure you keep your GPG keys safe, I keep mine on a USB pen drive I carry with me.
