{ pkgs, ... }:

{
  # 1. 禁用 nix-darwin 对 Nix 原生 Daemon 的管理 (适配 Determinate)
  nix.enable = false;

  # 2. 显式声明 Mac CPU 架构
  nixpkgs.hostPlatform = "aarch64-darwin";

  # 3. 声明当前 Mac 主用户名
  system.primaryUser = "admin";

  # 4. Zsh Shell 与系统状态版本
  programs.zsh.enable = true;
  system.stateVersion = 4;

  # 5. Homebrew 声明式依赖列表 (补全 herdr 及全量软件)
  homebrew = {
    enable = true;
    onActivation.cleanup = "uninstall";
    brews = [
      "herdr"
      "neovim"
      "ripgrep"
      "fd"
      "go"
      "pnpm"
      "zsh-autosuggestions"
      "starship"
      "gh"
    ];
    casks = [
      "wezterm"
      "font-hack-nerd-font"
    ];
  };
}
