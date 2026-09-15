local wezterm = require 'wezterm'
local config = wezterm.config_builder()

-- 1. 配色方案与外观 (Aesthetics)
config.color_scheme = 'Tokyo Night'
config.font = wezterm.font('Menlo')
config.font_size = 14.0
config.window_decorations = "RESIZE"
config.hide_tab_bar_if_only_one_tab = false
config.use_fancy_tab_bar = false
config.tab_bar_at_bottom = true

-- 2. 窗口边距与透明度 (Padding & Opacity)
config.window_padding = {
  left = 12,
  right = 12,
  top = 12,
  bottom = 12,
}
config.window_background_opacity = 0.92
config.macos_window_background_blur = 20

-- 3. Leader 键配置 (Ctrl + A)
config.leader = { key = 'a', mods = 'CTRL', timeout_milliseconds = 1000 }

-- 4. 高频分屏与标签页快捷键
config.keys = {
  -- Ctrl+A 然后按 Shift+\ (|) 水平分屏
  { key = '|', mods = 'LEADER|SHIFT', action = wezterm.action.SplitHorizontal { domain = 'CurrentPaneDomain' } },
  -- Ctrl+A 然后按 - 垂直分屏
  { key = '-', mods = 'LEADER', action = wezterm.action.SplitVertical { domain = 'CurrentPaneDomain' } },
  -- Ctrl+A 然后按 c 新建标签页
  { key = 'c', mods = 'LEADER', action = wezterm.action.SpawnTab 'CurrentPaneDomain' },
  -- Ctrl+A 然后按 x 关闭当前分屏
  { key = 'x', mods = 'LEADER', action = wezterm.action.CloseCurrentPane { confirm = true } },
}

return config
