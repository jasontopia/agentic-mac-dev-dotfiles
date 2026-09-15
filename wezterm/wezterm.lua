local wezterm = require 'wezterm'
local config = wezterm.config_builder()

-- Appearance & Theme (Rosé Pine Moon)
config.color_scheme = 'rose-pine-moon'
config.window_decorations = "RESIZE"
config.hide_tab_bar_if_only_one_tab = true
config.window_background_opacity = 0.88
config.macos_window_background_blur = 20

-- Font Settings
config.font = wezterm.font('Hack Nerd Font')
config.font_size = 14.0

-- Scrollback
config.scrollback_lines = 10000

return config
