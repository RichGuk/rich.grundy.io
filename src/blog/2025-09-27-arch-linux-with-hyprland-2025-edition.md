---
title: Arch Linux with Hyprland (2025 edition)
description: "My 2025 Arch Linux setup running Hyprland. Full list of setup commands with screenshots."
heroColor: "#1793D1"
heroIcon: "archlinux"
tags:
    - linux
---

I’ve recently revived my Arch Linux desktop — I use Arch, btw — and moved to
Hyprland. If you just want the TL;DR, jump to the [commands below](#commands). For a more
in-depth walkthrough, my [previous post][previous] is still mostly relevant.

## Screenshots

<div class="full-bleed -full">
    <div class="article__image-row">
        <a href="/assets/images/blog/my-2025-archlinux-hyprland-setup/screenshot-2025-09-27_16-43-06.webp" target="_blank">
            {% imageTag 'blog/my-2025-archlinux-hyprland-setup/screenshot-2025-09-27_16-43-06.avif' %}
        </a>
    </div>

    <div class="article__image-row">
        <a href="/assets/images/blog/my-2025-archlinux-hyprland-setup/screenshot-2025-09-27_18-33-55.avif" target="_blank">
            {% imageTag 'blog/my-2025-archlinux-hyprland-setup/screenshot-2025-09-27_18-33-55.avif' %}
        </a>
    </div>

    <div class="article__image-row">
        <a href="/assets/images/blog/my-2025-archlinux-hyprland-setup/2025-09-27-214906_hyprshot.avif" target="_blank">
            {% imageTag 'blog/my-2025-archlinux-hyprland-setup/2025-09-27-214906_hyprshot.avif' %}
        </a>
    </div>
</div>

## About the setup

Theme-wise, it's [Catppuccin](https://catppuccin.com) all the way — I fell in love, and now it’s hard to
imagine using anything else. Catppuccin is life. I also borrowed a few ideas
from omaracy.

Key mappings are currently a bit of an odd blend. I wanted parity with my
Yabai/macOS setup, and since I still switch between the two daily, I’ve kept as
much of that behaviour as possible.

Workspaces are laid out like this:

1. terminal
2. personal browser
3. code editor
4. work browser (coding-related)
5. chat apps (WhatsApp, Discord, Slack)
6. Spotify

Anything beyond that is just a scratch workspace.

For the bar I use **Waybar** — simple and clean. For app launching I’ve settled on
**Walker**. Firefox is my main browser (Zen is tempting), and I keep Brave around
too.

For my terminal I’m on Kitty now. I previously used WezTerm — it’s awesome, and
I love Lua configs — but it just wouldn’t launch properly on Hyprland.
Converting to Kitty was straightforward enough.

For files I’ve decided to try **Yazi**. It’s a TUI file manager (I go TUI wherever
I can 😃).


<div class="-full">
    <div class="article__image-row">
        <a href="/assets/images/blog/my-2025-archlinux-hyprland-setup/screenshot-2025-09-27_21-57-49.webp" target="_blank">
            {% imageTag 'blog/my-2025-archlinux-hyprland-setup/screenshot-2025-09-27_21-57-49.avif' %}
        </a>
    </div>
</div>


## Why Linux again?

I wrote an [older post][previous] about my Arch Linux setup (back when I was on KDE). That
was more than five years ago, around the time I’d sold all my Apple gear and gone
full Linux desktop.

Then a lot changed. Covid hit, I started a new job, and Apple launched the
first Apple silicon MacBook Pro. My new job gave me an M1 Pro MBP (still going
strong), and just like that I was back on macOS. The chip was so good, the
battery life incredible — Apple won me back. We even bought another MBP for personal use.

On macOS I refined my workflow: moved my Vim config to a [Lua Neovim
config](/blog/my-neovim-setup-2024/), got a [QMK
keyboard](/blog/nuphy-air60-v2-keyboard-review/), customised my keybindings,
and (ironically) discovered tiling window managers via
[Yabai](https://github.com/koekeishiya/yabai). It fit perfectly with how I
work: one app per workspace, shortcuts to move between them, and the occasional
side-by-side window, automatically sized. Bliss.


Still, the love for Linux never went away. Plus, Apple keeps moving macOS in a
direction that doesn't align with my workflow, Yabai could break at any moment,
and I often wonder what a _real_ tiling WM would feel like. Inspired by DHH’s
recent switch, I resurrected my Arch desktop and gave Hyprland a go — and so
far, I’m absolutely loving it

Currently I’m running this on my desktop PC rig, but I’m looking forward to the
day ARM-class performance comes to Windows laptops, so I can fully embrace
Linux everywhere. For now, I’ll stick with macOS on the go — although the
Framework setup is looking very tempting.

<div id="commands">

## Finally, give me those commands!


```bash
# Load keyboard layout
loadkeys us

# Connect to WLAN (if not LAN).
# See https://wiki.archlinux.org/title/Iwd#iwctl for Wifi setup.
iwctl --passphrase [password] station wlan0 connect [network]

# Check internet connection.
ping -c4 www.archlinux.org

# This is an optional step, I prefer doing the install process using a different machine
# so I can copy and paste commands. For that, we need to set a root password, and get our IP address
# so we can connect via ssh.
passwd
ip addr
systemctl start sshd
# Connect from another machine.
ssh root@ip

# Ensure system time is accurate.
timedatectl set-ntp true

# List drives
lsblk

# Create partitions
gdisk /dev/sda
# Partition 1: +512M ef00 (for EFI)
# Partition 2: Available space 8300 (for Linux filesystem)
# Write w, Confirm Y

# Setup encryption on the root drive.
cryptsetup luksFormat /dev/sda2 # setup password
cryptsetup luksOpen /dev/sda2 root # type password

# Make file systems.
mkfs.fat -F32 -n ArchEFI /dev/sda1
mkfs.btrfs -L Arch /dev/mapper/root

# Creating btrfs subvols.
mount -o compress=zstd,noatime /dev/mapper/root /mnt
btrfs subvol create /mnt/@
btrfs subvol create /mnt/@home
btrfs subvol create /mnt/@swap

mkdir /mnt/snapshots
btrfs subvol create /mnt/snapshots/@
btrfs subvol create /mnt/snapshots/@home

umount /mnt

# Mount the main @ and @home subvols.
mount -o compress=zstd,noatime,subvol=@ /dev/mapper/root /mnt
mkdir -p /mnt/{boot,home}
mount -o compress=zstd,noatime,subvol=@home /dev/mapper/root /mnt/home

# Make some subvols for various things so that they are either excluded from backups,
# or so we can disable CoW.
mkdir /mnt/var
btrfs subvol create /mnt/var/cache
btrfs subvol create /mnt/var/log

mkdir -p /mnt/var/lib/{mysql,postgres,machines}
chattr +C /mnt/var/lib/{mysql,postgres,machines}

# Mount boot
mount /dev/sda1 /mnt/boot

# Bootstrap that OS!
pacstrap /mnt base base-devel linux linux-firmware intel-ucode amd-ucode sudo rsync neovim reflector

# Generate fstab
genfstab -U /mnt >> /mnt/etc/fstab
cat /mnt/etc/fstab
# I update root / and /home to load from /dev/mapper/root instead of UUID.
vim /mnt/etc/fstab

# Finally chroot into the system, so we can finish our setup.
arch-chroot /mnt


#===========================
# Now the fun setup begins.
#===========================

# Sort out time.
ln -sf /usr/share/zoneinfo/Europe/London /etc/localtime
hwclock --systohc

# Keep time in sync
timedatectl set-ntp true

# Update pacman mirror list (wtih reflector).
reflector -c "United Kingdom," -p https -a 3 --sort rate --save /etc/pacman.d/mirrorlist

pacman -Syy

# Install the rest of my packages.
pacman -S \
acpid adobe-source-code-pro-fonts bat blueberry bluez \
brightnessctl btop btrfs-progs cargo chromium cifs-utils clang cups cups-browsed \
cups-filters cups-pdf dmidecode docker docker-buildx docker-compose \
dust edk2-ovmf exfat-utils eza fastfetch fd ffmpeg ffmpegthumbnailer \
firefox fontconfig fzf gcc14 git github-cli gnome-calculator gnome-keyring \
gnome-themes-extra gvfs-mtp gvfs-smb helm hypridle hyprland hyprland-qtutils \
hyprlock hyprpicker hyprshot hyprsunset imagemagick imv inetutils iwd jq \
kubectl kvantum-qt5 less libqalculate llvm luarocks mako man mariadb-libs mpv \
mpv-mpris nautilus noto-fonts noto-fonts-cjk noto-fonts-emoji noto-fonts-extra \
nss-mdns pacman-contrib pipewire-alsa pipewire-audio pipewire-pulse \
playerctl plocate polkit-gnome poppler postgresql-libs python-gobject \
python-poetry-core qemu-full resvg ripgrep slurp swaybg \
swayosd system-config-printer tldr tree-sitter-cli ttf-bitstream-vera \
ttf-cascadia-mono-nerd ttf-fira-mono ttf-firacode-nerd ttf-liberation \
ttf-opensans ttf-roboto ufw uwsm unzip virt-manager waybar wf-recorder whois \
wireless-regdb wireplumber woff2-font-awesome xdg-desktop-portal-gtk \
xdg-desktop-portal-hyprland xmlstarlet yazi zoxide zsh

# Set lang
nvim /etc/locale.gen # Uncomment en_GB.UTF-8 (or your locale)
locale-gen
echo LANG=en_GB.UTF-8 > /etc/locale.conf

# Setup keyboard.
echo keymap=us > /etc/vconsole.conf # I use an ANSI keyboard, so got used to US

# Set hostname and localhost
echo "arch" >> /etc/hostname
echo "127.0.0.1 localhost" >> /etc/hosts
echo "::1 localhost" >> /etc/hosts
echo "127.0.1.1 arch.localdomain arch" >> /etc/hosts

# Set root password
passwd

# Create your user
useradd -m -G wheel,users,docker,libvirt,kvm -s /usr/bin/zsh rich
passwd rich # Enter password

systemctl enable bluetooth
systemctl enable cups
systemctl enable sshd
systemctl enable reflector.timer
systemctl enable fstrim.timer
systemctl enable acpid
systemctl enable docker
systemctl enable libvirtd

# Use greetd for basic auto-login. This is a single user system, I use luks as password on boot.
# Add:
#
#+ [initial_session]
#+ command = "Hyprland"
#+ user = "rich"
pacman -Sy greetd
systemctl enable greetd
nvim /etc/greetd/config.toml

# Edit /etc/mkinitcpio.conf to add btrfs binary, and update hooks:
# - HOOKS=(base udev autodetect modconf block filesystems keyboard fsck)
# + HOOKS=(base systemd autodetect keyboard sd-vconsole modconf block sd-encrypt filesystems fsck)
#
# - BINARIES=()
# + BINARIES=(btrfs)
sudo nvim /etc/mkinitcpio.conf

mkinitcpio -P

# Install boot loader (systemd-boot).
bootctl --path=/boot install

# Create /boot/loader/entries/arch.conf
# get UUIDs for drive with blkid. We want the UUID of the partiton holding luks, not luks itself.
# blkid /dev/sda2
echo "title Arch Linux
linux /vmlinuz-linux
initrd /amd-ucode.img
initrd /initramfs-linux.img
options rd.luks.name=DRIVE_UUID=root root=/dev/mapper/root rootflags=subvol=@ rd.luks.options=discard rw" > /boot/loader/entries/arch.conf


# Enable wheel group in sudo
# uncomment #%wheel ALL=(ALL:ALL) ALL
EDITOR=nvim visudo

# Ensure networking is enabled.
echo "[Match]
Name=en*

[Network]
Bridge=br0" > /etc/systemd/network/25-br0-en.network

echo "[NetDev]
Name=br0
Kind=bridge" > /etc/systemd/network/25-br0.netdev

echo "[Match]
Name=br0

[Network]
DHCP=yes
MulticastDNS=yes
LLMNR=no

[DHCPv4]
RouteMetric=100

[IPv6AcceptRA]
RouteMetric=100" > /etc/systemd/network/25-br0.network

systemctl enable systemd-networkd
systemctl enable systemd-resolved
ln -sf ../run/systemd/resolve/stub-resolv.conf /etc/resolv.conf

# Now I would get my dot files setup.
su rich
cd ~/
# https for now, would later move to ssh
git clone --bare --recursive https://github.com/RichGuk/dotfiles.git $HOME/.dotfiles
alias dots='/usr/bin/git --git-dir=$HOME/.dotfiles --work-tree=$HOME'
dots checkout
dots submodule update
dots config --local status.showUntrackedFiles no
exit

# We're done, time to try booting :)
exit
umount -R /mnt
reboot

```

## Extra setup

```bash
# Let's get yay setup for AUR packages.
git clone https://aur.archlinux.org/yay.git /tmp/yay
cd /tmp/yay
makepkg -si

yay -S adw-gtk3 delta archlinux-artwork walker elephant elephant-desktopapplications elephant-calc \
elephant-menus elephant-symbols catppuccin-gtk-theme-mocha localsend yaru-icon-theme spotify brave-bin

```
</div>

[previous]:/blog/archlinux-on-encrypted-btrfs-with-systemd-boot-and-kde/
