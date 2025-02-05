---
title: Maintaining my GPG setup
description: ""
heroColor: "#0593dd"
heroIcon: "key"
tags:
    - linux
    - security
---

I can never remember how to do various things with `gpg`, despite using it for
encryption and signing git commits. This post is my documentation.


## Subkey management (keeping secret key safe)

I like to keep my master key in a safe place and away from my laptop. For daily operations, I use subkeys instead.


#### 1. Generate a New Key (If You Don't Have One)

```shell
gpg --full-generate-key
```

Choose `RSA and RSA` and set an expiration date.

#### 2. Create Subkeys

```shell
gpg --edit-key KEY_ID
gpg> addkey # S for signing, E for encryption, A for authentication
gpg > save
```

#### 3. Export master & subkeys

```shell
gpg --export-secret-keys KEY_ID > mykey.sec.gpg
gpg --export-secret-subkeys KEY_ID > mykey.subkeys.gpg
```

_(add --armor for text output)_

Then, move these files to a secure location and remove the master secret key.

```shell
gpg --delete-secret-keys KEY_ID
gpg --import mykey.subkeys.gpg # If you accidentally delete the subkey secrets
```

To verify that the master key is missing:

```shell
gpg --list-secret-keys
```

The master key should be marked with `#`.

## Update expiring keys

If the master key is expiring, you will need to re-import the secret key from
your backup. If the subkeys are expiring (and you still have their secrets),
you can run the following:

```shell
gpg --edit-key KEY_ID
gpg > key 1
gpg > key 2
gpg > expire
gpg > ...
gpg > save
```

Publish updates to keyservers:

```shell
gpg --send-keys YOUR_KEY_ID
```

I also re-export the master and subkeys and move them to a secure location.

## Encrypting data

To encrypt a file:

```shell
gpg --encrypt --recipient YOUR_EMAIL --output encrypted-file.gpg file.txt
```

To decrypt:

```shell
gpg --decrypt --output decrypted-file.txt encrypted-file.gpg
```

For symmetric encryption (password-based):

```shell
gpg --symmetric --cipher-algo AES256 --output encrypted-file.gpg file.txt
```

## Signing things

Sign a File (Detached Signature)

```shell
gpg --detach-sign --armor file.txt
```

Verify a signature:

```shell
gpg --verify file.txt.asc file.txt
```

Signing git commits:

```shell
gpg --list-secret-keys --keyid-format=long
git config --global user.signingkey YOUR_SUBKEY_ID
git config --global commit.gpgsign true # sign all commits by default
git commit -S -m 'Signed commit'
```

Hopefully this helps me in the future, and maybe you too!
