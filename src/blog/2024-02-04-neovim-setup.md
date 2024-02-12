---
title: My Neovim setup 2024
description: "Explore the evolution of my decade-old Neovim setup! Uncover the daily options, mappings, and plugins that power my coding journey."
heroIcon: "neovim"
heroColor: "var(--brand-color-neovim)"
draft: true
tags:
  - neovim
  - dotfiles
---

I recently embarked on a dotfiles cleanup journey. Part of that was bringing my Neovim
configuration up to date by eliminating unused key bindings and plugins while
incorporating new ones.

As a fun experiment, I tried to figure out when I switched to Neovim from Vim.
It turns out it was [2018], six years ago. I've only been tracking my dotfiles
for 12 years, so I'm unsure when I transitioned to Vim, probably around 2009.
While my editor setup has evolved, one thing has remained constant: I like to
keep it simple.

With this cleanup, I aimed to achieve a few goals:

- **Experiment with Copilot**
- **Maintain a simple config & ensure quick startup time**
- **Improve my buffer navigation:** Explore using global marks more
- **Transition to lazy.nvim:** With Packer becoming unmaintained, I decided to
  move to Lazy.nvim for plugin management.


At the time of writing, I was using Neovim 0.9. I also transitioned my config files
to pure Lua ten months ago, and I highly recommend it. Lua is fantastic!
 
## Theme - Catppuccin

Previously, I maintained my own theme based on a very old Textmate theme called
`Railscasts`, which I used for years. Old school, eh? 👴 However, with the
myriad of Treesitter changes in Neovim, finding time to maintain my custom
theme became challenging. After trying out 20+ different themes, I finally
settled on [Catppuccin].

<div class="article__image-row -center -full">
    <a href="/assets/images/blog/neovim-setup/SCR-20240116-rtbv.avif" target="_blank">{% imageTag 'blog/neovim-setup/SCR-20240116-rtbv.avif' %}</a>
</div>

Catppuccin is life! I've fully embraced it for everything – a truly delightful theme. It's
also great having an ecosystem of themes complementing Neovim.

## Neovim structure

I maintain a simple structure, organising everything under the `richguk`
namespace to avoid conflicts with other Lua packages. Filetype-specific options
are stored in the `ftplugin` directory.

```
├── ftplugin
│   ├── gitcommit.lua
│   └── markdown.lua
├── init.lua
├── lazy-lock.json
└── lua
    └── richguk
        ├── commands.lua
        ├── mappings.lua
        ├── options.lua
        └── plugins
            ├── ai.lua
            ├── colors.lua
            ├── conform.lua
            ├── fzf.lua
            ├── git-conflict.lua
            ├── harpoon.lua
            ├── indent-blankline.lua
            ├── init.lua
            ├── lspconfig.lua
            ├── lualine.lua
            ├── oil.lua
            ├── other.lua
            └── treesitter.lua
```

The primary `init.lua` file is where the magic happens. Here, I set up
[lazy.nvim] to install itself if not present and include the rest of the
configuration files.


```lua
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable",
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

vim.keymap.set({ 'n', 'v' }, '<Space>', '<Nop>', { silent = true })
vim.g.mapleader = ' '
vim.g.maplocalleader = ' '

require('richguk.options')
require('richguk.mappings')
require('richguk.commands')
require('lazy').setup('richguk.plugins', {
  change_detection = { notify = false },
})


```

Lazy enables you to load plugin specs from a directory, allowing you to split
the plugin specs into individual files for better organization.

One important note is that Lazy recommends setting your [leader key][mapleader]
before including plugin specs. I set my leader key to `spacebar`.

>The Vim leader key functions as a prefix for custom mappings, such as `<leader>c`
>(spacebar + c), to trigger specific actions.

## Options

I won't delve into my options too much. I stick to pretty basic changes. I've
included comments to provide a brief explanation of each option. One noteworthy
preference of mine is enabling relative line numbers, which allows for more concise
line movement as you know how many lines to jump with Vim motions.


```lua
vim.opt.cursorline = true -- Highlight the current line
vim.opt.number = true -- Show line numbers
vim.opt.numberwidth = 2
vim.opt.relativenumber = true -- Show relative line numbers
vim.opt.history = 500 -- Remember n lines in history
vim.opt.lazyredraw = true -- Don't redraw while executing macros
vim.opt.colorcolumn = '100' -- Show a column at 100 characters
vim.opt.completeopt = { 'menu', 'menuone', 'noselect', 'noinsert' } -- Completion options

-- Indentation
vim.opt.softtabstop = 2
vim.opt.shiftwidth = 2
vim.opt.expandtab = true

vim.opt.ignorecase = true -- Ignore case when searching
vim.opt.smartcase = true -- Override the 'ignorecase' option if the search pattern contains upper case characters

vim.opt.wildmode = 'list:longest,list:full' -- Command-line completion mode

vim.opt.list = true -- Show invisible characters
vim.opt.listchars:append('eol:¬') -- Show a special character at the end of each line

vim.opt.conceallevel = 0 -- Show concealed text

vim.opt.swapfile = false -- Don't create swap files

vim.opt.spell = false -- Don't spell check
vim.opt.spelllang = 'en_gb' -- Set the spell check language

vim.opt.shortmess:append "sI" -- Disable intro message

vim.opt.termguicolors = true -- Enable 24-bit RGB colour
vim.opt.timeoutlen = 400 -- Time in milliseconds to wait for a mapped sequence to complete
vim.opt.undofile = true -- Enable persistent undo
vim.opt.updatetime = 500 -- Faster completion

vim.opt.mouse = 'v' -- Enable mouse support


```

## Plugins

My plugin stack is pretty lean.

<div class="article__image-row">
    <a href="/assets/images/blog/neovim-setup/SCR-20240122-icgd.avif" target="_blank">{% imageTag 'blog/neovim-setup/SCR-20240122-icgd.avif' %}</a>
</div>

Many of them focus on completion, LSP, and syntax highlighting. The main ones boil down to these:

* [Comment.nvim]
* [fzf-lua]
* [indent-blankline.nvim]
* [mini.surround]
* [oil.nvim]
* [vim-tmux-navigator]
* [other.nvim]
* [blame.nvim]
* [git-conflict.nvim]
* [conform.nvim] (used to get prettier formatting)
* nvim-lspconfig

And some plugins I'm experimenting with:

* [copilot.vim] - Will write a future post about my experiences
* ThePrimeagen's [harpoon]


### Comment.nvim

For years, I relied on Tpope's vim-commentary to achieve the same thing—even
with my Lua setup. However, at some point, I made the switch to this Lua
version, probably driven by the move to a pure Lua setup. 🧑‍💻 So, what
does this plugin do, you ask? It enables you to intelligently comment out blocks
of code (with treesitter support). The default bindings are `gcc`, so you
highlight some code and `gcc`, and it will comment it out using the correct
language commenting syntax.

### indent-blankline.nvim

I use indent-blankline.nvim to enhance code readability by adding visual guides
for indentation levels, similar to those found in other editors. It's more of a
nice-to-have feature than a requirement.


### mini.surround

I use this plugin frequently. It's another one where I've recently switched to a
Lua version, having previously used vim-sandwich. This plugin enables you to
add, delete, or replace surround pairs, such as quotes or parentheses. For
example, I'll often highlight some text, type `sa"` to wrap it in double quotes.


### fzf-lua

My preferred fuzzy finder. While there are several options for fuzzy finders in
Neovim, such as Telescope, I've stuck with fzf for years. It's a tool I use
outside of Vim as well, so I prefer consistency. While many plugins integrate
directly with Telescope, I've found that fzf works well for my needs and is
fast.

### oil.nvim

> A file explorer that lets you edit your filesystem like a normal Neovim buffer

This plugin is another nice-to-have. Although Vim does include a built-in file
explorer (netrw), initially, I questioned the necessity of moving files within a
Vim buffer. However, after giving it a try, this plugin has proven to be
reliable. It feels more intuitive to move files around using standard Vim
buffers. I can yank a filename, move two directories up, paste, and it moves the
file. I can utilise all my Vim motions for renaming and creating new files with
this fantastic little plugin!


### vim-tmux-navigator

Vim-tmux-navigator is a must-have for seamless navigation between Neovim and
tmux panes. The default bindings allow me to move between Vim panes (splits)
with `Ctrl` + `hjkl`, with the added benefit of also being able to move from Vim to
the tmux split pane. This integration enhances the overall efficiency of my
workflow, making it an essential component of my Tmux + Neovim setup.

### other.nvim

A plugin I'm contemplating dropping. It facilitates easy navigation to
alternative files. For instance, if you're in a model file, you can quickly jump
to the corresponding spec file. I might find myself using this less as I become
more proficient with Vim's global marks and harpoon.

### blame.nvim / git-conflict.nvim

These are pretty straightforward. While I handle 90% of my git management in the
terminal rather than within Vim, there are two tasks I prefer to perform in Vim:
quickly getting a commit blame for each line and handling merge conflicts. These
two plugins serve these purposes without introducing any unnecessary git
features (within Neovim).

### harpoon

I've recently started experimenting with this plugin. While its functionality
somewhat mirrors what you can achieve with Vim's global marks, there's a key
distinction: Global marks are, as the name suggests, global and not unique to a
specific project. This plugin, on the other hand, is project specific.

It allows you to define a set of essentially hotkeys for files. This feature
becomes particularly useful when working on a feature. With just a few
keystrokes, I can navigate between a set of core files, ensuring I land
exactly where I need to.

In Vim, I'm aware that `Ctrl` + `6` lets you jump between the last and current
files, and `Ctrl` + `o` helps you step back through files. However, during
debugging sessions, I often find myself jumping through 4-5 files before identifying
the root cause. Instead of having to step back through each of these files, it's
great being able to jump directly back to your main file.

It's still early in my usage, and I'll assess how it performs over time.

## Treesitter / LSP

[Treesitter] has been a welcome addition to Neovim. It brought improved syntax
highlighting, language parsing, and excellent text object support. Text objects
enable efficient navigation through entities like functions and parameters.
When I initially made the switch, I observed a significant enhancement in Ruby
highlighting.

I maintain a relatively standard setup for Treesitter. I install several
languages by default, catering to my regular usage. Additionally, I have it
configured to install any missing languages automatically upon the initial
launch.

```lua
return {
  {
    'nvim-treesitter/nvim-treesitter',
    build = ':TSUpdate',
    event = { "BufReadPost", "BufNewFile" },
    dependencies = {
      'nvim-treesitter/nvim-treesitter-textobjects',
    },
    config = function()
      require('nvim-treesitter.configs').setup({
        ensure_installed = { 'vim', },
        sync_install = false,
        auto_install = true,
        highlight = {
          enable = true,
        },
        indent = {
          enable = true,
        },
        textobjects = {
          select = {
            enable = true,
            lookahead = true,
            keymaps = {
              ["a="] = { query = '@assignment.outer' },
              ["i="] = { query = '@assignment.inner' },
              ["l="] = { query = '@assignment.lhs' },
              ["r="] = { query = '@assignment.rhs' },

              ['aa'] = '@parameter.outer',
              ['ia'] = '@parameter.inner',

              ['af'] = '@function.outer',
              ['if'] = '@function.inner',

              ['ac'] = '@class.outer',
              ['ic'] = '@class.inner',
            },
          },
          move = {
            enable = true,
            set_jumps = true,
            goto_next_start = {
              ["]k"] = { query = "@block.outer", desc = "Next block start" },
              ["]f"] = { query = "@function.outer", desc = "Next function start" },
              ["]a"] = { query = "@parameter.inner", desc = "Next argument start" },
            },
            goto_next_end = {
              ["]K"] = { query = "@block.outer", desc = "Next block end" },
              ["]F"] = { query = "@function.outer", desc = "Next function end" },
              ["]A"] = { query = "@parameter.inner", desc = "Next argument end" },
            },
            goto_previous_start = {
              ["[k"] = { query = "@block.outer", desc = "Previous block start" },
              ["[f"] = { query = "@function.outer", desc = "Previous function start" },
              ["[a"] = { query = "@parameter.inner", desc = "Previous argument start" },
            },
            goto_previous_end = {
              ["[K"] = { query = "@block.outer", desc = "Previous block end" },
              ["[F"] = { query = "@function.outer", desc = "Previous function end" },
              ["[A"] = { query = "@parameter.inner", desc = "Previous argument end" },
            },
          },
        },
      })
    end
  },
}
```

With these bindings, I can select the contents of a function with vif and
navigate up and down functions using `[f` and `]f`. It has truly been a great
addition to my Vim motions.

Now, regarding LSP, my configuration is relatively standard. I did experiment
with lsp-zero briefly, but it didn't seem to offer anything significantly
different. However, I still rely on [nvim-lspconfig] to provide some sensible
defaults.

Here's the configuration:

```lua
return {
  {
    'neovim/nvim-lspconfig',
    event = { 'BufReadPre', 'BufNewFile' },
    dependencies = {
      'williamboman/mason.nvim',
      'williamboman/mason-lspconfig.nvim',
      {
        'hrsh7th/nvim-cmp',
        dependencies = {
          'hrsh7th/cmp-path',
          'hrsh7th/cmp-buffer',
          'hrsh7th/cmp-nvim-lsp',
          'hrsh7th/cmp-nvim-lua',
          {
            'L3MON4D3/LuaSnip',
            version = "v2.*",
          },
          'saadparwaiz1/cmp_luasnip'
        }
      }
    },
    config = function()
      local ensure_installed = {}
      if os.getenv("FULL_DOTFILES") then
        ensure_installed = {
          'tsserver',
          'eslint',
          'golangci_lint_ls',
          'gopls',
        }
      end

      vim.diagnostic.config({
        virtual_text = false,
        float = {
          header = false,
          border = 'rounded',
          focusable = true,
        },
      })

      vim.lsp.handlers['textDocument/hover'] = vim.lsp.with(vim.lsp.handlers.hover, {
        focusable = true,
        border = 'rounded',
      })
      vim.lsp.handlers['textDocument/signatureHelp'] = vim.lsp.with(vim.lsp.handlers.signature_help, {
        focusable = true,
        border = 'rounded',
      })

      local lsp_capabilities = require('cmp_nvim_lsp').default_capabilities()
      require('mason').setup({})
      require('mason-lspconfig').setup({
        ensure_installed = ensure_installed,
        handlers = {
          function(server)
            require('lspconfig')[server].setup({
              capabilities = lsp_capabilities
            })
          end,
          lua_ls = function()
            require('lspconfig').lua_ls.setup({
              capabilities = lsp_capabilities,
              settings = {
                Lua = {
                  diagnostics = {
                    globals = { 'vim' },
                  },
                }
              }
            })
          end
        }
      })
      require('lspconfig').solargraph.setup({})
      -- require('lspconfig').ruby_ls.setup({})

      local cmp = require('cmp')
      local luasnip = require('luasnip')

      local has_words_before = function()
        unpack = unpack or table.unpack
        local line, col = unpack(vim.api.nvim_win_get_cursor(0))
        return col ~= 0 and vim.api.nvim_buf_get_lines(0, line - 1, line, true)[1]:sub(col, col):match('%s') == nil
      end

      cmp.setup({
        window = {
          completion = cmp.config.window.bordered(),
          documentation = cmp.config.window.bordered(),
        },
        snippet = {
          expand = function(args)
            require('luasnip').lsp_expand(args.body)
          end
        },
        sources = {
          { name = 'path' },
          { name = 'nvim_lsp' },
          { name = 'nvim_lua' },
          { name = 'buffer',  keyword_length = 3 },
          { name = 'luasnip' },
        },
        mapping = cmp.mapping.preset.insert({
          ['<CR>'] = cmp.mapping.confirm({ select = true }),
          ['<Tab>'] = function(fallback)
            if cmp.visible() then
              cmp.select_next_item()
            elseif luasnip.expand_or_jumpable() then
              luasnip.expand_or_jump()
            elseif has_words_before() then
              cmp.complete()
            else
              fallback()
            end
          end,
          ['<S-Tab>'] = function(fallback)
            if cmp.visible() then
              cmp.select_prev_item()
            elseif luasnip.jumpable(-1) then
              luasnip.jump(-1)
            else
              fallback()
            end
          end,
        }),
      })
    end
  }
}
```

A couple of things to note: I use the [mason] tool for automatic installations
of LSP servers. Additionally, I include LuaSnip as a snippet library, even
though I don't use any snippets as I found nvim-cmp/lspconfig errored without
it.

I've also implemented a check for an environment variable called FULL_DOTFILES
to selectively install LSPs on my main machines only. 

I've added lines to ensure borders are displayed on autocomplete modals:


```lua
vim.lsp.handlers['textDocument/hover'] = vim.lsp.with(vim.lsp.handlers.hover, {
  focusable = true,
  border = 'rounded',
})
vim.lsp.handlers['textDocument/signatureHelp'] = vim.lsp.with(vim.lsp.handlers.signature_help, {
  focusable = true,
  border = 'rounded',
})
```

Regarding mappings, I prefer using `Tab` to cycle between suggestions and `Enter`
to confirm the selected option.


## Mappings

Finally, my mappings. I've expanded and refined them over recent months, drawing
inspiration from [ThePrimeagen's dotfiles][primedotfiles]. While not listing
them all here, as many serve simply as shortcuts for plugins or aid in buffer
navigation, I'll highlight some handy ones below. You can view the full list
[here][mymappings].


```lua
vim.keymap.set('v', 'J', ":m '>+1<CR>gv=gv") -- move line up
vim.keymap.set('v', 'K', ":m '<-2<CR>gv=gv") -- move line down
```
These allow you to move visually selected lines up or down, while maintaining indentation level.


```lua
vim.keymap.set('n', 'J', 'mzJ`z')            -- move line below to end of current, but keep cursor in place
vim.keymap.set('n', '<C-d>', '<C-d>zz')      -- scroll down, but keep cursor central
vim.keymap.set('n', '<C-u>', '<C-u>zz')      -- scroll up, but keep cursor central
vim.keymap.set('n', 'n', 'nzzzv')            -- search but keep cursor central
vim.keymap.set('n', 'N', 'Nzzzv')            -- reverse search with central cursor
```

A set of mappings related to maintaining the cursor position while moving. For
instance, it overrides Vim's `J` binding, which moves the line below to the
current line. The custom version preserves the cursor position. I find these
mappings helpful for keeping track of the cursor and avoiding confusion about
its location.

```lua
vim.keymap.set('x', '<leader>p', [["_dP]], { desc = 'Paste without updating register' })
vim.keymap.set('n', '<leader>P', [["+p]], { desc = 'Paste from system' })
vim.keymap.set({ 'n', 'v' }, '<leader>y', [["+y]], { desc = 'Yank to system clipboard the selection' })
vim.keymap.set('n', '<leader>Y', [["+Y]], { desc = 'Yank line into system clip' })
```

These mappings are self-explanatory, focusing on system clipboard yanking and
pasting. The first one, borrowed from Primeagen, is particularly interesting. It
enables you to paste the content of your registry over something without the
registry being updated with the replaced text.

In Vim, when you paste over text, the replaced text is stored in the registry.
This means that if you paste again, it won't be the original text you pasted but
rather the text you replaced.

```lua
vim.keymap.set('n', '<leader>ev', ':vsp <C-R>=expand("%:p:h") . "/" <CR>', { desc = 'Open file in same dir in vsplit' })
```

This expands current file's directory, allowing you to easily create a new file in the same place. 

```lua
vim.keymap.set('n', '<leader>r', [[:%s/\<<C-r><C-w>\>/<C-r><C-w>/gI<Left><Left><Left>]], { desc = 'Rename word under cursor' })
vim.keymap.set('c', 'w!!', '%!sudo tee > /dev/null %', { desc = 'Write with sudo' }) -- forgot to start with sudo?

```

The first shortcut facilitates find/replace using the current word under the
cursor as the search term. The second one enables writing with sudo in case you
forgot to open the file with elevated privileges.


```lua
vim.keymap.set('', '<leader>f', function()
  require('conform').format({ async = true, lsp_fallback = true })
end, { desc = 'Format file' })
```

I don't use linters to auto-format when saving; instead, I prefer to trigger
formatting manually via a shortcut. The mapping initially runs Conform for
formatting (e.g., running Prettier for JavaScript) and then falls back to LSP
formatting if needed.

---

So, there you have it – my Neovim setup. It's a simple configuration that has
been my trusty companion for over a decade, evolving with me. Here's to another
10+ years of seamless coding! For the most up to date config, checkout my [Nvim dotfiles][dotfiles].


[2018]: https://github.com/RichGuk/dotfiles/commit/b4acee06696b7102db09b7d973045dd3d8f0ac77
[Catppuccin]: https://github.com/catppuccin/nvim
[Comment.nvim]: https://github.com/numToStr/Comment.nvim
[fzf-lua]: https://github.com/ibhagwan/fzf-lua
[indent-blankline.nvim]: https://github.com/lukas-reineke/indent-blankline.nvim
[mini.surround]: https://github.com/echasnovski/mini.surround
[oil.nvim]: https://github.com/stevearc/oil.nvim
[other.nvim]: https://github.com/rgroli/other.nvim
[vim-tmux-navigator]: https://github.com/christoomey/vim-tmux-navigator
[copilot.vim]: https://github.com/github/copilot.vim
[conform.nvim]: https://github.com/stevearc/conform.nvim
[harpoon]: https://github.com/ThePrimeagen/harpoon
[lazy.nvim]: https://github.com/folke/lazy.nvim
[mapleader]: https://neovim.io/doc/user/map.html#mapleader
[primedotfiles]: https://github.com/ThePrimeagen/init.lua/tree/master
[mymappings]: https://github.com/RichGuk/dotfiles/blob/main/.config/nvim/lua/richguk/mappings.lua
[blame.nvim]: https://github.com/FabijanZulj/blame.nvim
[git-conflict.nvim]: https://github.com/akinsho/git-conflict.nvim
[Treesitter]: https://tree-sitter.github.io/tree-sitter/
[endwise]: https://github.com/RRethy/nvim-treesitter-endwise
[mason]: https://github.com/williamboman/mason.nvim
[dotfiles]: https://github.com/RichGuk/dotfiles/tree/main/.config/nvim
