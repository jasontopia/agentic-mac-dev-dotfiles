return {
  {
    'folke/which-key.nvim',
    lazy = false,
    dependencies = {
      -- icons for the which-key popup, the Snacks picker and oil
      {
        'echasnovski/mini.icons',
        opts = {},
        config = function(_, opts)
          require('mini.icons').setup(opts)
          -- plugins that ask for nvim-web-devicons get mini.icons instead,
          -- so there's only one icon provider to configure
          MiniIcons.mock_nvim_web_devicons()
        end,
      },
    },
    config = true,  -- popup that shows what my leader keys do
  },
}
