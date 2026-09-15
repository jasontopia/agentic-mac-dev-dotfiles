{ pkgs, ... }:
{
  system.primaryUser = "admin";
  nix.enable = false;
  nixpkgs.config.allowUnfree = true;
  nixpkgs.hostPlatform = "aarch64-darwin";

  # macOS 系统偏好设置
  system.defaults = {
    NSGlobalDomain.AppleInterfaceStyle = "Dark";
    NSGlobalDomain.InitialKeyRepeat = 15;
    NSGlobalDomain.KeyRepeat = 2;
    dock.autohide = true;
    finder.AppleShowAllExtensions = true;
  };

  # 声明式 Homebrew 软件与 CLI 工具
  homebrew = {
    enable = true;
    brews = [
      "neovim"   # Kun 的核心代码编辑器
      "ripgrep"  # 高吞吐文本搜索工具 rg
      "fd"       # 高吞吐文件搜索工具
      "herdr"    # Agent 时代终端多路复用器 (正确名称: herdr)
    ];
    casks = [
      "wezterm"  # GPU 加速极速终端
    ];
    onActivation.autoUpdate = true;
    onActivation.upgrade = true;
  };

  system.stateVersion = 4;
}
