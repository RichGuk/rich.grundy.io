---
title: "Access your home network from anywhere with ZeroTier"
description: "ZeroTier lets you create lightweight and easy to set up peer-to-peer VPNs."
hero: "/assets/images/blog/access-your-home-network-from-anywhere-with-zerotier/hero-small.jpg"
heroIcon: "connection"
tags:
  - networking
---

[ZeroTier](http://zerotier.com/) (ZT) lets you create lightweight and easy to
set up peer-to-peer VPNs.  It allows internet-connected devices to appear as
part of the same virtual network, providing an excellent solution for accessing
your home securely from anywhere.

ZT is an open source platform. You can, if you wish, run the entire thing
self-hosted.  However, as clients send traffic directly to each other, you only
need the root server component for the initial handshake. The ZeroTier website
provides a free tier that accommodates plenty of hosts for a small network.

## So, what can you do with it?

As you access each device directly, there's no need to mess about with
port-forwarding, firewalls or opening ports up to the world. 

Some things you may run:

* Game server—some older games only work on LAN
* Off-site backups—for example, I keep a Raspberry Pi & HDD at my Dad's house
* Generally accessing stuff behind NAT
  * File sharing—NAS access anywhere
  * Connecting to machines via SSH or RDP
  * Self-hosted HTTP/HTTPS services (Seafile, Bitwarden, Git)
  * Sharing Plex with friends and family

I can access these from anywhere, using my phone or laptop, without leaving them
exposed to everyone. Awesome!

## How does it work? Is it not just a traditional VPN?

ZT is like other more “traditional” VPNs. Both allow you to create private
networks. However, ZT works peer-to-peer, unlike other VPNs where all the
traffic routes through a dedicated server. There is a central component for the
initial handshake, but you don't need to manage that (although you can if you
wish). Once you establish the connection, it doesn't matter if a server goes
down. There is no single point of failure.


It's also much easier to set up. If you're not running the root server yourself
(called moons), you only need to create an account on
[my.zerotier.com](my.zerotier.com) and install the client on the machines.
Clients connect directly and __choose to join__ the network, which highlights
another difference. More traditional VPNs mean any new host on the local network
is accessible via VPN when added. They don't explicitly choose to join a
network. For example, I only have three machines connected to my ZT network at
home, even though I have more computers on the network.



ZT employs a network hack called [UDP hole
punching](https://www.zerotier.com/2014/08/25/the-state-of-nat-traversal/) to
achieve this peer-to-peer nature behind NAT. Here, the root server comes into
play. Essentially, client A and client B both broadcast their public IP/ports to
the root server. Then, when they want to talk to each other, they coordinate
with the root server to open the correct ports to communicate with each other.
Only those hosts can use those ports. The rest of their traffic is direct, via
peer-to-peer. If a connection cannot establish, then traffic routes via a root
server. So, the privacy concerned may wish to run the root node themselves
(although ZT encrypts traffic).

## Getting started

Getting going is simple. Visit [my.zerotier.com](https://my.zerotier.com) to
create an account.  Once you've logged in, you can create your first network. 


Networks have a unique name. Clients use this to join your network. A client
must request to join, and once they have, you will need to visit the control
panel to allow the client to connect. Once you've connected several clients, you
should be able to connect directly to that client's IP.



ZT has clients for several operating systems and devices. I have one on my Linux
desktop/servers, MacBook and Android phone.


Another great tip. I use my domain to set up a hostname for each service or
machine that points to their ZT network IP address. For example,
https://git.grundy.io points to 192.168.192.2, which runs Nginx/Gogs on a
Raspberry Pi.

---

So, in summary. ZT provides an excellent solution to connect several machines
across different private networks. It's easier to configure than other VPN
solutions, it's open source and free. You don't have to expose your computers to
the world, but still have access remotely. And, finally, you have control over
the devices on the network.
