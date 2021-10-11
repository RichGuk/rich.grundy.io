---
title: Archlinux on encrypted btrfs with systemd-boot and KDE
description: "If you wanted to know how to install and configure Archlinux on an
Luks encrypted SSD with Systemd-boot and KDE desktop, then this is the post."
hero: //media.rich.grundy.io/blogs/2020-05-05-archlinux/hero.png
tags:
  - linux
---

I've been a Linux user since the 2000s starting on Mandrake with KDE2, however,
it never became my main desktop. I always stuck with Windows XP, Windows 7 and
then Mac OSX; Linux was still my love for anything server side, but not desktop.

About 6 years ago I decided the Apple premium wasn't worth it any more. Linux
had better package managers, cli tools, and I spent most of my time in the web
browser or terminal. I felt ready for a Linux desktop. I sold all my Apple
hardware, bought an extra SSD and dual booted again.  Archlinux with KDE became
my desktop of choice.

There are plenty of guides for installing Arch, the [Arch
wiki](https://wiki.archlinux.org/index.php/installation_guide) being a one such
resource, but I wanted to document how I configure mine all in one place with
the following:

* UEFI with systemd-boot
* Full disk encryption on ssd/nvme
* btrfs with subvolumes, compression and snapshots
* [Swapfile for hibernation](#swapfile)
* [Unlock encryption with USB flash drive](#usb-keyfile)

## Getting started

Boot the Archlinux live environment and configure networking. If you're using
ethernet then DHCP will already be running. Verify with ping.

```bash
ping archlinux.org
```

If you need Wi-Fi then run **wifi-menu** and enable the profile after:

```bash
wifi-menu # Let it scan networks, pick yours
netctl enable wlan-ssid # Can tab complete profile
```

*(On my systems I use NetworkManager for desktops and Systemd-networkd for
servers, but netctl is available within the live environment and provides
wifi-menu so I use it during install.)*

Ensure the system clock is accurate with:

```bash
timedatectl set-ntp true
```

Edit **/etc/pacman.d/mirrorlist** and move faster mirrors to the top (i.e.
the ones closer geographically).

## Partition and file system set up

Find the disk you wish to install Arch on using **lsblk**. For example an
nvme drive at **/dev/nvme0n1**.

Create two partitions one for boot the other for the main OS. Boot will contain
EFI/systemd-boot, and main will contain subvolumes for root and home.

EFI should be at least 260 MiB, and I tend to use 512 MiB for full compatibility.

Run **gdisk**:

```bash
gdisk /dev/nvme0n1
o (create a new empty GUID partition table (GPT))
Proceed? (Y/N): y

n (add a new partition)
Partition number (1-128, default 1): 1
First sector : (hit enter)
Last sector : +512MB (at least 260MiB, 512MiB for compability with old UEFI)
Hex code or GUID: ef00

n (add a new partition)
Partition number (2-128, default 2): 2
First sector : (hit enter)
Last sector : (hit enter - rest of disk)
Hex code or GUID: (hit enter, default, 8300)

w
Do you want to proceed? (Y/N): y
```

Set up encryption on the main partition:

```bash
cryptsetup luksFormat /dev/nvme0n1p2
Are you sure? YES
(enter passphrase)
cryptsetup luksOpen /dev/nvme0n1p2 cryptroot
```

Format the partitions:

```bash
mkfs.fat -F32 -n LINUXEFI /dev/nvme0n1p1
mkfs.btrfs -L Arch /dev/mapper/cryptroot
```

Now for the main partition create subvolumes for **root** and **home**, along
with **snapshots/@** and **snapshots/@home** (so you can run backups and restore
independently).

It's also recommended creating subvolumes for directories we don't want backed up
e.g. _/var/cache_, a subvol for swap if you're going to use a swapfile, and if we
have VMs or databases, to disable copy-on-write (COW).

```bash
mount -o compress=zstd,noatime /dev/mapper/cryptroot /mnt
btrfs subvol create /mnt/@
btrfs subvol create /mnt/@home
btrfs subvol create /mnt/@swap

mkdir /mnt/snapshots
btrfs subvol create /mnt/snapshots/@
btrfs subvol create /mnt/snapshots/@home

umount /mnt
mount -o compress=zstd,noatime,subvol=@ /dev/mapper/cryptroot /mnt
mkdir -p /mnt/{boot,home}
mount -o compress=zstd,noatime,subvol=@home /dev/mapper/cryptroot /mnt/home
mount /dev/nvme0n1p1 /mnt/boot

mkdir /mnt/var
btrfs subvol create /mnt/var/cache
btrfs subvol create /mnt/var/log

mkdir -p /mnt/var/lib/{mysql,postgres,machines}
chattr +C /mnt/var/lib/{mysql,postgres,machines}
```

Note the use of **noatime**, and **compress=zstd** options.

**noatime** will disable writing of access times to each file when they're
accessed.  [It's often recommended][btrfs-noatime] for COW file systems to help
performance because writes cause COW.

**compress=zstd** adds transparent compression, helping to reduce file sizes;
Its super fast, and I've never had performance issues.

## Installation

Install the base system + extra packages:

```text
pacstrap /mnt base base-devel linux linux-firmware intel-ucode amd-ucode \
wpa_supplicant btrfs-progs dosfstools e2fsprogs sudo zsh zsh-completions \
zsh-syntax-highlighting tmux rsync openssh git vim neovim htop networkmanager \
openvpn networkmanager-openvpn fzf ruby python nodejs
```

Generate fstab:

```text
genfstab /mnt >> /mnt/etc/fstab
```
_Note: change the boot partition to use UUID._

Example fstab:

```
/dev/mapper/cryptroot / btrfs rw,noatime,compress=zstd:3,space_cache,subvol=@ 0 0
/dev/mapper/cryptroot /home btrfs rw,noatime,compress=zstd:3,space_cache,subvol=@home 0 0
UUID=559E-32F1 /boot vfat rw,relatime,fmask=0022,dmask=0022,codepage=437,iocharset=iso8859-1,shortname=mixed,utf8,errors=remount-ro 0 2
```

Chroot into our system to finish installation:

```bash
cp /etc/pacman.d/mirrorlist /mnt/etc/pacman.d/mirrorlist
arch-choot /mnt

nvim /etc/locale.gen # Uncomment en_GB.UTF-8
locale-gen
echo LANG=en_GB.UTF-8 > /etc/locale.conf
echo keymap=uk > /etc/vconsole.conf
ln -sf /usr/share/zoneinfo/Europe/London /etc/localtime
hwclock --systohc

echo new-hostname > /etc/hostname

passwd # Set root password
```

Edit **/etc/hosts** to match:

```
127.0.0.1       localhost
::1             localhost
127.0.1.1       new-hostname.localdomain      new-hosthostname
```

Edit **/etc/mkinitcpio.conf** to add *systemd*, *sd-vconsole*, *sd-encrypt*
and move *keyboard*.

``` diff
- HOOKS=(base udev autodetect modconf block filesystems keyboard fsck)
+ HOOKS=(base systemd autodetect keyboard sd-vconsole modconf block sd-encrypt filesystems fsck)

- BINARIES=()
+ BINARIES=(btrfs)
```

Generate initramfs:

```bash
mkinitcpio -P
```

Install the systemd-boot loader:

```bash
bootctl --path=/boot install
```

Get the UUID of the luks partition (not cryptroot, but /dev/nvme0n1p2 for
example) with **blkid**. This is the partition we want to unlock to create
*cryptroot*.

```bash
blkid
```

Create **/boot/loader/entries/arch.conf**:

```text
title Arch Linux
linux /vmlinuz-linux
initrd  /amd-ucode.img
initrd /initramfs-linux.img
options rd.luks.name=UUID_OF_LUKS_PARTITION=cryptroot root=/dev/mapper/cryptroot rootflags=subvol=@ rd.luks.options=discard rw
```

*rd.luks.options=discard* will be needed for TRIM support.

You need to pick the right ucode for your processor: *amd-ucode* or *intel-ucode*.

Change *UUID_OF_LUKS_PARTITION* to the UUID you found via *blkid*.

Edit **/boot/loader/loader.conf**:

```text
default arch
timeout 2
```

Reboot:

```bash
exit
umount -R /mnt
reboot
```

You should have a functioning base system at this point.

## Post install

These steps are more personalised towards how I want my desktop to work. Feel
free to tweak as you need to.

Lets login as root and get some networking; we installed NetworkManager before
so start and enable that now:

```bash
systemctl start NetworkManager NetworkManager-wait-online
systemctl enable NetworkManager NetworkManager-wait-online
```

If you need Wi-Fi you can run the following:

```bash
nmcli device wifi list
nmcli device wifi connect SSID password mysecurepass
```

Enable ssh and fstrim:

```bash
systemctl enable sshd fstrim.timer
```

*fstrim* runs a periodic service for TRIM (needed for SSDs). It's
[recommended](https://wiki.archlinux.org/index.php/Solid_state_drive#Continuous_TRIM)
to run weekly rather than continuous.

Ensure time is synced:

```bash
timedatectl set-ntp true
```

Create your user:

```bash
useradd -m -G wheel,users -s /usr/bin/zsh rich
passwd rich # Enter password
```

Edit sudo to enable wheel group access:

```bash
EDITOR=nvim visudo
## Uncomment to allow members of group wheel to execute any command
%wheel ALL=(ALL) ALL
```

Save the changes, exit and login as the new user.

Graphics:
```bash
sudo pacman -S xorg-server xf86-video-fbdev xf86-video-nouveau xf86-video-amdgpu
```

I install a lot of AUR packages; to make this easier I use the *yay* AUR
manager:

```bash
git clone https://aur.archlinux.org/yay.git /tmp/yay

cd /tmp/yay
makepkg -si
```

Install KDE desktop:

```bash
sudo pacman -S plasma-meta sddm kdialog konsole dolphin noto-fonts \
phonon-qt5-vlc
```

You may wish to review the following, but these are the packages, themes and
fonts I use:


```bash
sudo pacman -S adobe-source-code-pro-fonts noto-fonts-emoji ttf-opensans \
ttf-roboto ttf-fira-mono ttf-bitstream-vera \
inetutils firefox chromium \
virt-manager edk2-ovmf qemu libvirt docker docker-compose \
kubectl helm colord-kde kdeconnect exfat-utils
```

```bash
yay -S otf-san-francisco sierrabreeze-kwin-decoration-git archlinux-artwork \
materia-kde materia-gtk-theme plasma5-applets-eventcalendar
```

Add some groups to our user to make docker/kvm easier:

```bash
sudo usermod -a -G docker,libvirt,kvm rich
sudo systemctl enable docker libvirtd
```

To configure login manager, create the following folder:

```bash
sudo mkdir /etc/sddm.conf.d
```

Then create **/etc/sddm.conf.d/kde_settings.conf**:

```text
[Autologin]
Relogin=false
Session=plasma
User=rich

[General]
HaltCommand=/usr/bin/systemctl poweroff
Numlock=none
RebootCommand=/usr/bin/systemctl reboot

[Theme]
Current=breeze

[Users]
MaximumUid=60000
MinimumUid=1000
```

(*Note I auto login my user.*)


At this point I clone my [dotfiles](https://github.com/RichGuk/dotfiles), but
feel free to skip this step as they only contain my configs for KDE themes, zsh,
git, etc.

```bash
git clone --bare --recursive https://github.com/RichGuk/dotfiles.git $HOME/.dotfiles
alias config='/usr/bin/git --git-dir=$HOME/.dotfiles --work-tree=$HOME'

config checkout
config submodule update
config config --local status.showUntrackedFiles no
```

Enable login manager and reboot.

```bash
sudo systemctl enable sddm
sudo reboot
```

You should be all set!

---

## <a name="usb-keyfile"></a> USB based keyfile

Find the drive you wish to use with *lsblk*. You can use an existing partition,
or create a new partition with *gdisk*. For example ext4 on /dev/sde3.

Mount the file system and generate a keyfile to use:

```
sudo mkdir /mnt/usb-keyfiles
sudo mount /dev/sde3 /mnt/usb-keyfiles
sudo dd bs=512 count=4 if=/dev/random of=/mnt/usb-keyfiles/myhostname.key iflag=fullblock
sudo chmod 600 /mnt/usb-keyfiles/myhostname.key
```

Find your luks partition with *lsblk* (this is not the btrfs partition). Add the
keyfile:

```
sudo cryptsetup luksAddKey /dev/nvme0n1p2 /mnt/usb-keyfiles/myhostname.key
(enter your existing encryption password)
```

Get the UUID flash drive:

```bash
sudo blkid
```

Edit **/boot/loader/entries/arch.conf**:

```text
title Arch Linux
linux /vmlinuz-linux
initrd  /amd-ucode.img
initrd /initramfs-linux.img
options rd.luks.key=UUID_OF_LUKS_PARTITION=/myhostname.key:UUID=UUID_OF_USB_PARTITION rd.luks.name=UUID_OF_LUKS_PARTITION=cryptroot root=/dev/mapper/cryptroot rootflags=subvol=@ rd.luks.options=discard,keyfile-timeout=10s rw
```

Add **rd.luks.key** and **keyfile-timeout=10s** to *rd.luks.options*.

**rd.luks.key** the first part is the luks we're trying to open, then
the location of the keyfile (in our case root of flash drive), and then the UUID
of the USB flash partition to use.

**keyfile-timeout=10s** needed to allow us to fallback to password unlock if USB
key doesn't exist.

We need to add the partition type (in our case ext4) to initramfs. Edit
**/etc/mkinitcpio.conf**:

```diff
- MODULES=()
+ MODULES=(ext4)
```

Regenerate initramfs:

```bash
mkinitcpio -P
```

You can now reboot with the USB flash drive plugged in and it should automatically
unlock your encryption.

## <a name="swapfile"></a> Swapfile / Hibernation

Swapfile cannot be on a snapshotted subvolume. This is why, in the earlier
steps, we created the *@swap* subvolume. Lets mount it:

```bash
sudo mkdir /swapspace
sudo mount -o noatime,subvol=@swap /dev/mapper/cryptroot /swapspace
```

*(Don't mount with compression.)*

Create the swapfile:

```bash
sudo truncate -s 0 /swapspace/swapfile
sudo chattr +C /swapspace/swapfile
sudo btrfs property set /swapspace/swapfile compression none

sudo fallocate -l 32G /swapspace/swapfile
sudo mkswap /swapspace/swapfile

sudo chmod 600 /swapspace/swapfile
```

Activate the swapfile:

```bash
sudo swapon /swapspace/swapfile
```

Now edit **/etc/fstab** to mount *swapspace* and *swapfile*
on boot:

```text
/dev/mapper/cryptroot /swapspace btrfs rw,noatime,space_cachesubvol=@swap 0 0
/swapspace/swapfile none swap defaults,discard 0 0
```

If you want to be able to hibernate you need to [follow
this](https://wiki.archlinux.org/index.php/Power_management/Suspend_and_hibernate#Hibernation_into_swap_file_on_Btrfs)
to get the offset.  Then add *resume* and *resume_offset* to
**/boot/loader/entries/arch.conf**:

```text
title Arch Linux
linux /vmlinuz-linux
initrd  /amd-ucode.img
initrd /initramfs-linux.img
options rd.luks.key=UUID_OF_LUKS_PARTITION=/myhostname.key:UUID=UUID_OF_USB_PARTITION rd.luks.name=UUID_OF_LUKS_PARTITION=cryptroot root=/dev/mapper/cryptroot rootflags=subvol=@ rd.luks.options=discard,keyfile-timeout=10s resume=/dev/mapper/cryptroot resume_offset=OFFSET_CALC rw
```


[btrfs-noatime]: https://btrfs.wiki.kernel.org/index.php/Manpage/btrfs\(5\)#NOTES_ON_GENERIC_MOUNT_OPTIONS
