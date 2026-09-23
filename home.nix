{ config, pkgs, user, ... }:

let
  dotfiles = "${config.home.homeDirectory}/.dotfiles";
in

{
  home.username = user;
  home.homeDirectory = "/Users/${user}";
  home.stateVersion = "24.11";
  home.packages = with pkgs; [
    # cli i use constantly
    ripgrep   # fast search
    fd        # fast find
    fzf       # fuzzy finder
    jq        # json on the command line
    lazygit
    neovim
    # the focus ring macOS does not draw, which is what makes AeroSpace legible
    jankyborders
    # the menu bar this machine hides and then has to draw itself
    sketchybar
    # tsc typechecks the Calm extension against the installed Pi's types
    # in tests/pi-calm.test.sh
    typescript
    # the font everything renders in
    nerd-fonts.hack
  ];
  fonts.fontconfig.enable = true;
  home.sessionVariables = {
    EDITOR = "nvim";
    # keep CJK output from the terminal and agents from garbling
    LANG = "en_US.UTF-8";
    LC_ALL = "en_US.UTF-8";
  };
  # treehouse and no-mistakes install scripts drop their binaries here
  home.sessionPath = [ "$HOME/.local/bin" ];

  programs.zsh = {
    enable = true;
    autosuggestion.enable = true;      # ghost text from history
    syntaxHighlighting.enable = true;  # commands turn green when valid
    initContent = ''
      bindkey '^f' autosuggest-accept
    '';
    shellAliases = {
      ".." = "cd ..";
      add = "git add .";
      push = "git push";
      pull = "git pull";
      m = "git switch main";
      cc = "claude --dangerously-skip-permissions";
      co = "codex --full-auto";
      v = "nvim";
      g = "git";
      h = "herdr";
      reload = "source ~/.zshrc";
    };
  };

  programs.starship = {
    enable = true;
    settings = {
      add_newline = false;
      format = "$directory$git_branch$git_status$cmd_duration$line_break$character";
      character = {
        success_symbol = "[❯](purple)";
        error_symbol = "[❯](red)";
      };
      cmd_duration.format = "[$duration]($style) ";
      # show only the current folder (or the repo name inside a git repo)
      directory = {
        truncation_length = 1;
        truncate_to_repo = true;
      };
    };
  };

  # Edit-in-place: the real file stays in my repo, ~/.config just points at it.
  home.file.".config/wezterm".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/.config/wezterm";
  home.file.".config/nvim".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/.config/nvim";
  home.file.".config/herdr".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/.config/herdr";
  # Link the file, not the directory: AeroSpace owns this config but the
  # directory is its own to write into.
  home.file.".config/aerospace/aerospace.toml".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/.config/aerospace/aerospace.toml";
  home.file.".config/borders/bordersrc".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/.config/borders/bordersrc";
  home.file.".config/sketchybar".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/.config/sketchybar";
  home.file.".claude/settings.json".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/.claude/settings.json";
  home.file.".claude/hooks/herdr-agent-state.sh".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/.claude/hooks/herdr-agent-state.sh";

  # Keep Pi's credential and runtime state local by linking only authored files and directories.
  home.file.".pi/agent/themes".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/.pi/agent/themes";
  home.file.".pi/agent/extensions".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/.pi/agent/extensions";
  home.file.".pi/agent/models.json".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/.pi/agent/models.json";
  home.file.".pi/agent/settings.json".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/.pi/agent/settings.json";

  home.file.".claude/CLAUDE.md".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/AGENTS.md";
  home.file.".codex/AGENTS.md".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/AGENTS.md";
  home.file.".config/opencode/AGENTS.md".source =
    config.lib.file.mkOutOfStoreSymlink "${dotfiles}/home/AGENTS.md";

  # Run borders as a login agent rather than through `brew services`, so the
  # machine stays a product of this repo. No arguments: that is what makes
  # borders read ~/.config/borders/bordersrc, which is linked out of here.
  # launchd hands an agent a bare PATH, so bordersrc's own `borders` call needs
  # the package on it explicitly.
  launchd.agents.borders = {
    enable = true;
    config = {
      ProgramArguments = [ "${pkgs.jankyborders}/bin/borders" ];
      EnvironmentVariables.PATH = "${pkgs.jankyborders}/bin:/usr/bin:/bin";
      RunAtLoad = true;
      KeepAlive = true;
    };
  };

  # configuration.nix hides Apple's menu bar; this draws what belongs there
  # instead. Same launchd-agent treatment as borders, for the same reason:
  # `brew services` state would not be a product of this repo.
  # sketchybarrc and its plugins shell out to `sketchybar` itself and to
  # `aerospace`, and launchd hands an agent a bare PATH, so both go on it here.
  launchd.agents.sketchybar = {
    enable = true;
    config = {
      ProgramArguments = [ "${pkgs.sketchybar}/bin/sketchybar" ];
      EnvironmentVariables.PATH =
        "${pkgs.sketchybar}/bin:/opt/homebrew/bin:/usr/bin:/bin";
      RunAtLoad = true;
      KeepAlive = true;
    };
  };
}
