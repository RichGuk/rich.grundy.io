---
title: "Access your home network from anywhere with ZeroTier"
description: "ZeroTier lets you create lightweight peer-to-peer VPN networks, a perfect solution for remote access."
hero: "//media.rich.grundy.io/blogs/access-your-home-network-from-anywhere-with-zerotier/hero.webp"
tags:
  - networking
---

[ZeroTier](http://zerotier.com/) (ZT) lets you create lightweight and easy to
set up peer-to-peer VPN networks. It allows internet-connected devices to appear
as part of the same virtual network, providing an excellent solution for
accessing your home securely from anywhere.

ZT is open source. You can, if you wish, run the entire thing self-hosted.
However, as clients send traffic directly to each other, you only need the root
server component for the initial handshake. The ZeroTier website provides a free
tier that accommodates plenty of hosts for a small network.

## So, what can you do with it?

Each device is accessed directly, so there's no need to mess about with
port-forwarding, firewalls or opening ports up to the world.

Some things you may run:

* Game server—some older games only work on LAN
* Offsite backups—for example, I keep a Raspberry Pi & HDD at my Dad's house
* Generally accessing stuff behind NAT
* File sharing—NAS access anywhere
  * Connecting to machines via SSH or RDP
  * Self-hosted HTTP/HTTPS services (Seafile, Bitwarden, Git)
  * Sharing Plex with friends and family

I can access these from anywhere, using my phone or laptop, without leaving them
exposed to everyone. Awesome!

## How does it work? Is it not just a traditional VPN?

ZT is similar to other more "traditional" VPNs. Both allow you to create private
networks. However, ZT works peer-to-peer, unlike other VPNs where all the
traffic routes through a dedicated server. There is a central component for the
initial handshake, but you don't need to manage that (although you can if you
wish). Once a connection is established, it doesn't matter if a server goes
down. There is no single point of failure.

It's also much easier to set up. If you're not running the root server yourself
(called moons), you only need to create an account on
[my.zerotier.com](my.zerotier.com) and install the client on the machines. And,
because clients connect directly and choose to join the network, it highlights
another difference. More traditional VPNs mean any new host on the local network
is accessible via VPN when added.  They don't explicitly choose to join a
network.  For example, I only have three machines connected to my ZT network at
home.

ZT employs a network hack called [UDP hole
punching](https://www.zerotier.com/2014/08/25/the-state-of-nat-traversal/) to
achieve this peer-to-peer nature behind NAT (plus without having ports always
open). Here, the root server comes into play. Essentially, client A and client B
both broadcast their public IP/ports to the root server. Then when they want to
talk to each other, they coordinate with the root server to open the correct
ports to communicate with each other. Only those hosts are allowed to use those
ports. If the peer-to-peer network can't establish, then traffic is routed via a
root server.  The privacy concerned may wish to run the root node themselves
(although traffic is encrypted).

## Getting started

Getting going is simple. Visit
[https://my.zerotier.com](https://my.zerotier.com) to create an account.  Once
you've logged in, you can create your first network.

Networks have a unique name. Clients use this to join the network. A client
must request to join, and once they have, you will need to visit the control
panel to allow the client to connect. When you've connected several clients, you
should be able to connect directly to that clients IP.

ZT provide software for pretty much any device. I have one on my Linux
desktop/servers, Macbook and Android phone.

Another great tip. I use my domain to set up hostnames for each service or
machine on my ZT network. For example, https://git.grundy.io points to
192.168.192.2, which runs Nginx/[Gogs](https://gogs.io/) on a Raspberry Pi.


---

__So in summary__, ZT provides an excellent solution to connect several machines
across different private networks. It means you don't have to expose your
computers to the world.  You have control over the devices.
