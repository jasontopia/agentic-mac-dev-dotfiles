#!/usr/bin/env bash
set -e

echo "🔄 Rebuilding nix-darwin environment..."
sudo darwin-rebuild switch --flake ~/dotfiles#Mac

# 重新建立软链接
mkdir -p ~/.config/wezterm ~/.config/nvim ~/.claude
ln -sf ~/dotfiles/home/wezterm/wezterm.lua ~/.config/wezterm/wezterm.lua
ln -sf ~/dotfiles/home/starship.toml ~/.config/starship.toml
ln -sf ~/dotfiles/home/zshrc ~/.zshrc
ln -sf ~/dotfiles/home/nvim/init.lua ~/.config/nvim/init.lua
ln -sf ~/dotfiles/home/AGENTS.md ~/.claude/CLAUDE.md

echo "✅ Environment rebuild complete!"
