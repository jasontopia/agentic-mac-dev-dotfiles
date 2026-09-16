vim.g.mapleader = " "

vim.opt.number = true          
vim.opt.relativenumber = true  
vim.opt.tabstop = 2
vim.opt.shiftwidth = 2
vim.opt.expandtab = true
vim.opt.ignorecase = true
vim.opt.smartcase = true

local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git", "clone", "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

require("lazy").setup({
  {
    "stevearc/oil.nvim",
    opts = {},
    config = function()
      require("oil").setup({ default_file_explorer = true })
      vim.keymap.set("n", "<leader>e", "<CMD>Oil<CR>", { desc = "Open Oil File Explorer" })
    end
  },
  {
    "NeogitOrg/neogit",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      local neogit = require("neogit")
      neogit.setup({})
      vim.keymap.set("n", "<leader>g", function() neogit.open() end, { desc = "Open Neogit" })
    end
  },
  {
    "folke/tokyonight.nvim",
    lazy = false,
    priority = 1000,
    config = function()
      vim.cmd([[colorscheme tokyonight]])
    end
  }
})
