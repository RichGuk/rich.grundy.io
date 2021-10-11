---
title: Mounting LVM raw disk image on Linux
description: "The commands needed to mount a raw disk image containing LVM partition."
hero: //media.rich.grundy.io/blogs/2020-10-06-mounting-lvm-raw-disk-image-on-linux/hero.webp
tags:
  - linux
---

The other day I needed to extract some files from a raw disk backup; problem is
I never remember the commands and always have to look them up. For future
reference here is how to do it.

Once you have the raw disk image create a loop device from it:

```bash
sudo losetup -f -P rawdisk.img
```

You should now have a loop device with all the partitions from the original raw
disk:

```bash
sudo lsblk -f
...
NAME            FSTYPE      FSVER    UUID
loop1
├─loop1p1
├─loop1p2       ext4        1.0      7f54d4b9-ad5e-4e49-8a24-27e62258e2c0
└─loop1p3       LVM2_member LVM2 001 23c515ac-e138-47ad-b4b3-cbaa119a90d3
```

Now let LVM know about the new LVM device:

```bash
sudo pvscan --cache
```

You should now see the volume groups and logical volumes associated with the
raw disk partition:

```bash
sudo vgs
...
VG        #PV #LV #SN Attr   VSize    VFree
ubuntu-vg   1   1   0 wz--n- <142.00g    0

sudo lvs
LV        VG        Attr       LSize    Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
ubuntu-lv ubuntu-vg -wi------- <142.00g
```

Activate the volume group and LVs:

```bash
sudo vgchange -ay
```


Mount the LV like any other and you're good to go:

```bash
sudo mkdir /mnt/backup-restore
sudo mount /dev/mapper/ubuntu--vg-ubuntu--lv /mnt/backup-restore
```


Then to tear down:

```bash
sudo umount /mnt/backup-restore
sudo lvchange -an /dev/mapper/ubuntu--vg-ubuntu--lv
sudo losetup -d /dev/loop1
sudo pvscan --cache
```

