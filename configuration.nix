{ pkgs, ... }:

{
  # Nix-Darwin 基础设置
  system.stateVersion = 4;
  nix.settings.experimental-features = "nix-command flakes";

  # macOS 系统偏好声明
  system.defaults = {
    dock.autohide = true;
    finder.AppleShowAllExtensions = true;
    NSGlobalDomain.AppleInterfaceStyle = "Dark";
  };

  # Homebrew 声明式软件包列表
  homebrew = {
    enable = true;
    onActivation.cleanup = "zap";
    casks = [
      "wezterm"
      "font-hack-nerd-font"
    ];
    brews = [
      "neovim"
      "starship"
      "ripgrep"
      "fd"
      "zsh-autosuggestions"
      "gh"
      "herdr"
    ];
  };
}
