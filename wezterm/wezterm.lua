local wezterm = require 'wezterm'
local config = wezterm.config_builder()

-- Remove titlebar for borderless look
config.window_decorations = "RESIZE"

-- Hide tab bar when single tab
config.hide_tab_bar_if_only_one_tab = true

-- Background transparency (88%) and macOS blur
config.window_background_opacity = 0.88
config.macos_window_background_blur = 20

-- Font size
config.font_size = 14.0

return config
