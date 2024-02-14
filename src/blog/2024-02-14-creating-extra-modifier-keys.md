---
title: "My keyboard setup for productivity"
description: "Enhance any setup by creating extra modifier keys (Hyper/MEH) for MacOS and QMK/VIA keyboards"
permalink: "/dev-setup/keyboard-setup/"
heroIcon: "command"
tags:
  - dotfiles
  - devsetup
  - macos

---

I like to repurpose keys I never use, such as caps lock, into additional
modifier keys, often referred to as Hyper or MEH keys. On MacOS, you can
achieve this using an app called [Karabiner]. However, recently, I acquired a
QMK firmware keyboard with VIA support. This allows me to customise it directly
on the board. In this article, I'll cover both methods.

I've often thought that my keyboard usage is rather unique. I rarely utilise
function keys or media keys such as pause/play, and I have completely forsaken
the numpad. Even my use of arrow keys has been replaced with `hjkl`. That's
precisely why 60% keyboards are my jam!

<div class="article__image-row -center">
    {% imageTag 'blog/nuphy-air60-v2-keyboard-review/DSC01865_2048.avif' %}
</div>

Currently, my main keyboard is the NuPhy Air60 v2 (I wrote about it
[here](/blog/nuphy-air60-v2-keyboard-review/)).

### My key setup

A significant portion of my desktop workflow revolves around changing
workspaces or moving apps between them. Consequently, I tend to overload the
number row for this, assigning each workspace a number. To help me reuse the
number row, I use these Hyper/MEH modifiers.

My modifiers:


| Key       | When held                | When tapped |
| --------- | ------------------------ | ----------- |
| Caps      | Ctrl + Opt + Cmd         | -           |
| Tab       | Shift + Ctrl + Opt       | Tab         |
| Right Cmd | Shift + Ctrl + Opt + Cmd | -           |

The Caps key serves as my primary modifier, with the Tab key acting as my
secondary one. These are both conveniently positioned for easy access without
much hand movement.

_Currently, I haven't assigned any functions to the Right Cmd (Hyper) key; it's
there as a placeholder._

Here are some mappings I have:

| Key combo    | Action                     |
| ------------ | -------------------------- |
| Caps + h     | Left arrow                 |
| Caps + j     | Down arrow                 |
| Caps + k     | Up arrow                   |
| Caps + l     | Right arrow                |
| Caps + [     | Esc                        |
| Caps + -     | F11                        |
| Caps + =     | F12                        |
| Caps + [1-6] | Switch to workspace 1 to 6 |
| Tab + [1-6]  | Move app to workspace 1    |


### QMK/VIA


You might wonder, why not just use Karabiner for everything? Well, I like the
idea of keeping as much on the hardware as possible. This allows me to maintain
mostly the same functionality (like arrow keys, ESC, etc.) when switching to
another computer.

So, what do my mappings look like?


<div class="article__image-row -center">
    {% imageTag 'blog/keyboard-setup/SCR-20240213-oido.avif' %}
</div>

On my keyboard, there are 8 configurable layers. A layer is like a saved layout
of the keys, often activated by pressing a key from another layer. For example,
the Fn key activates layer 1 (`MO(1)`).


> *Note: The NuPhy has a Win/Mac toggle, which toggles default layers: 0,1 for
> Mac and 3,4 for Windows. Initially, this was a bit confusing because I didn't
> think my key mappings were being changed; it turned out I was editing the
> wrong layer.*

I have `Tab` configured to send `Shift + Ctrl + Opt` when held, or the `Tab`
if just tapped. To do this with QMK you can use the MT [modtap] key, like so:

`MT(MOD_LCTL | MOD_LSFT | MOD_LALT,KC_TAB)`

In VIA, you need to add a special `any` key to do this:

<div class="article__image-row">
    {% imageTag 'blog/keyboard-setup/SCR-20240213-omyg.png' %}
</div>
<div class="article__image-row -small">
    {% imageTag 'blog/keyboard-setup/SCR-20240214-bckb.avif' %}
</div>


For the `right Cmd` we don't need any modtap behaviour, so we can just do:

`MEH(KC_LGUI)`

Which translates to `LSFT(LCTL(LALT(KC_LGUI)))` or `Shift + Ctrl + Alt + Cmd`

For the `Caps` key I have it setup slightly differently. This key activates layer 7 via `MO(7)`.


<div class="article__image-row">
    {% imageTag 'blog/keyboard-setup/SCR-20240213-ozhn.avif' %}
</div>

Here, you can see I have `hjkl` configured to send the standard arrow keys, `[`
is set to send `Esc` and `-`, `=` for F11 and F12.

Then I have the number row and Q, W, E setup to send the modifier combo `Ctrl +
Opt + Cmd` along with the key.

In QMK, to do that we use LCAG:

```
1 = LCAG(KC_1)
2 = LCAG(KC_2)
...
q = LCAG(KC_Q)
w = LCAG(KC_W)
e = LCAG(KC_E)
```

You can find more keycodes on the [modtap] or [keycodes] documentation.

### Karabiner

Now let's configure the same in Karabiner, which I still use for the built-in MacBook keyboard.

In Karabiner, you can achieve similar functionality using complex modifiers.
Here's the JSON configuration for replicating the mappings:

<div class="article__image-row">
    {% imageTag 'blog/keyboard-setup/SCR-20240214-hsco.avif' %}
</div>

`Caps`:

```json
{
    "manipulators": [
        {
            "description": "Change caps_lock to ctrl+alt+cmd",
            "from": {
                "key_code": "caps_lock",
                "modifiers": {
                    "optional": [
                        "any"
                    ]
                }
            },
            "to": [
                {
                    "key_code": "left_control",
                    "lazy": true,
                    "modifiers": [
                        "left_option",
                        "left_command"
                    ]
                }
            ],
            "type": "basic"
        }
    ]
}
```

`Tab`:

```json
{
    "manipulators": [
        {
            "description": "Change tab to Shift + Ctrl + Opt on hold",
            "from": {
                "key_code": "tab"
            },
            "to": [
                {
                    "key_code": "tab",
                    "lazy": true
                }
            ],
            "to_if_held_down": [
                {
                    "key_code": "left_shift",
                    "modifiers": [
                        "left_control",
                        "left_alt"
                    ]
                }
            ],
            "type": "basic"
        }
    ]
}
```

`Caps` + `[` for Esc:

```json
{
    "manipulators": [
        {
            "description": "Caps + [ to Esc",
            "from": {
                "key_code": "open_bracket",
                "modifiers": {
                    "mandatory": [
                        "caps_lock"
                    ]
                }
            },
            "to": [
                {
                    "key_code": "escape"
                }
            ],
            "type": "basic"
        }
    ]
}
```

Arrow keys (`Caps` + `hjkl`):

```json
{
    "manipulators": [
        {
            "description": "Caps + h",
            "from": {
                "key_code": "h",
                "modifiers": {
                    "mandatory": [
                        "caps_lock"
                    ]
                }
            },
            "to": [
                {
                    "key_code": "left_arrow"
                }
            ],
            "type": "basic"
        }
    ]
},
{
    "manipulators": [
        {
            "description": "Caps + h",
            "from": {
                "key_code": "h",
                "modifiers": {
                    "mandatory": [
                        "caps_lock"
                    ]
                }
            },
            "to": [
                {
                    "key_code": "left_arrow"
                }
            ],
            "type": "basic"
        }
    ]
},
{
    "manipulators": [
        {
            "description": "Caps + k",
            "from": {
                "key_code": "k",
                "modifiers": {
                    "mandatory": [
                        "caps_lock"
                    ]
                }
            },
            "to": [
                {
                    "key_code": "up_arrow"
                }
            ],
            "type": "basic"
        }
    ]
},
{
    "manipulators": [
        {
            "description": "Caps + l",
            "from": {
                "key_code": "l",
                "modifiers": {
                    "mandatory": [
                        "caps_lock"
                    ]
                }
            },
            "to": [
                {
                    "key_code": "right_arrow"
                }
            ],
            "type": "basic"
        }
    ]
}
```


[Karabiner]: https://karabiner-elements.pqrs.org/
[modtap]: https://github.com/qmk/qmk_firmware/blob/master/docs/mod_tap.md
[keycodes]: https://github.com/qmk/qmk_firmware/blob/master/docs/feature_advanced_keycodes.md
