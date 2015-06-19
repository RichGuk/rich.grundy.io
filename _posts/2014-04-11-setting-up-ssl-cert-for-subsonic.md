---
layout: post
title: Setting up a valid SSL certificate for Subsonic
description: Make your Linux Subsonic installtion secure with a valid SSL certificate.
hero: //i.imgur.com/2ZGUdCW.jpg
---

Due to the recent OpenSSL issues ([Heartbleed][heartbleed]) I've been rekeying my
SSL certificates and as part of that I've needed to update the [Subsonic][subsonic]
key. I never remember the steps for this, luckily they were still in my ZSH
history. To save myself in future and to help others I've written the
process down.

## Prerequisites

You need to make sure openSSL is installed (and the latest patched version), you
will also need zip installed and obviously [Subsonic][subsonic] configured and working.

## Get a valid SSL certificate

Plenty of places offer CA certs, you can get free certificates from
[StartSSL][startssl]. I chose to buy mine from my registrar,
[Namecheap][namecheap], for ~£5.

Generate a CSR (Certificate Signing Request) as Namecheap or StartSSL will need this.

<pre>
openssl req -new -newkey rsa:2048 -nodes -keyout hostname.key -out hostname.csr
</pre>

Fill out all the needed information, country, town, organisation. The Common
name is the full domain name you wish create the SSL cert for. This has to be
correct, for example if you run subsonic on homemachine.mydomain.com then enter
this here. I didn't bother with passphrase.

When submitting this request remember to choose OpenSSL as the certificate type.
You will have to wait for it to be verified, this took a few hours on Namecheap
for myself.

## Generate for Subsonic

Subsonic needs a different key format to the Apache style one, you can convert
this with openssl command.

When you get the certificates from the registrar you should have files similar
to:

- hostname.crt
- PositiveSSLCA2.crt
- AddTrustExternalCARoot.crt

You need to combine these files, along with the hostname.key you generated
earlier.

<pre>
cat hostname.key hostname.crt PositiveSSLCA2.crt AddTrustExternalCARoot.crt > subsonic.crt
</pre>

Next convert it to a format [Subsonic][subsonic] understands.

<pre>
openssl pkcs12 -in subsonic.crt -export -out subsonic.pkcs12
</pre>

When prompted enter __subsonic__ as export password.

Now you should have a subsonic.pkcs12 file, we need to import this into a
keystore for [Subsonic][subsonic] to use.

<pre>
sudo keytool -importkeystore -srckeystore subsonic.pkcs12 -destkeystore subsonic.keystore -srcstoretype PKCS12 -srcstorepass subsonic -srcalias 1 -destalias subsonic
</pre>

When prompted enter __subsonic__ as the password.

Finally we need to put the keystore into the file [Subsonic][subsonic] uses to
boot.

<pre>
sudo zip /var/subsonic/subsonic-booter-jar-with-dependencies.jar subsonic.keystore
</pre>

_note: Your paths may differ, these are default for Archlinux_

## Enable SSL in Subsonic

Finally you will need to enable SSL in [Subsonic][subsonic], if you haven't done so already.

<pre>
sudo vim /var/subsonic/subsonic.sh
# Change SUBSONIC_HTTPS_PORT=0 to the port you want to use for SSL.
</pre>

Now restart [Subsonic][subsonic]

<pre>
sudo systemctl restart subsonic
</pre>


Congratulations, you now have a valid and secure [Subsonic][subsonic]
installation.

[heartbleed]: http://heartbleed.com
[subsonic]: http://subsonic.org
[startssl]: http://www.startssl.com
[namecheap]: http://namecheap.com
