{ user, nixpkgs-unstable, ... }:

{
  # Determinate already manages the Nix daemon, so nix-darwin shouldn't.
  nix.enable = false;

  nixpkgs.config.allowUnfree = true;
  nixpkgs.hostPlatform = "aarch64-darwin"; # use x86_64-darwin for Intel CPU
  # Neovim only: 0.12.5 is on nixpkgs master with no 26.05 backport, so take
  # this one package from unstable. The system is read back off the package set
  # itself, so this stays correct on Intel too. Drop the overlay once 26.05
  # catches up with Neovim.
  nixpkgs.overlays = [
    (final: prev: {
      neovim = (import nixpkgs-unstable {
        system = prev.stdenv.hostPlatform.system;
        config.allowUnfree = true;
      }).neovim;
    })
  ];

  system.primaryUser = user;
  users.users.${user} = {
    home = "/Users/${user}";
  };
  system.stateVersion = 6;
  system.defaults = {
    NSGlobalDomain = {
      AppleInterfaceStyle = "Dark";
      KeyRepeat = 2;          # fast key repeat
      InitialKeyRepeat = 15;  # short delay before repeat
      _HIHideMenuBar = true;  # auto-hide the menu bar
      AppleShowAllExtensions = true;
    };
    dock.autohide = true;
    finder.FXPreferredViewStyle = "Nlsv";  # list view by default
    finder.CreateDesktop = false;          # clean desktop
    trackpad.Clicking = true;              # tap to click
  };
  nix-homebrew = {
    enable = true;
    inherit user;
    # This Mac already had Homebrew in /opt/homebrew before nix-homebrew took over.
    autoMigrate = true;
  };
  homebrew = {
    enable = true;
    onActivation.cleanup = "zap";  # remove anything not listed here
    onActivation.autoUpdate = true;
    onActivation.extraFlags = [ "--force" ];
    taps = [
      "kunchenguid/tap"
    ];
    brews = [
      "herdr"
      # firstmate's universal toolchain: gh for GitHub, node for the npm-installed axi tools
      "gh"
      "node"
      "p7zip"
      # language toolchains I still use directly
      "go"
      "pnpm"
    ];
    casks = [
      "wezterm"
      "claude-code"
      "kunchenguid/tap/baby-menu"
      # GUI apps that were installed by hand until now. They are not in Nixpkgs
      # as macOS apps, and being outside Homebrew meant `zap` could not see them
      # either, so they quietly stayed off the reproducible path.
      "google-chrome"
      "brave-browser"
      "chatgpt"       # also provides the Codex CLI at Contents/Resources/codex
      "typeless"      # voice dictation; runs as a login item
      "uuremote"
    ];
  };
}
