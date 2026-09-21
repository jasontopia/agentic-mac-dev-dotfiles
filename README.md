# dotfiles

Jasontopia 的 Mac 配置，基于 [Kun 的 dotfiles](https://github.com/kunchenguid/dotfiles)，用 nix-darwin 和 home-manager 管理。
结构和设置以 Kun 的原版为准，在上面叠加少量个人设置（见"与 Kun 原版的差异"）。
目标：一台新 Mac 执行一次 `./bootstrap.sh`，软件和所有配置都恢复成一模一样。

## What you get

执行一次 switch 会配置好：

- 系统设置（深色模式、按键重复、Dock、Finder、触控板）
- Homebrew 应用（casks 和 CLI 工具）
- Nix 用户包（ripgrep、fd、fzf、jq、lazygit、Neovim、Hack Nerd Font）
- Shell（zsh、别名、starship 提示符、自动补全建议）
- 编辑器（Neovim，rose-pine moon 主题）
- 终端（WezTerm，rose-pine moon 主题，中文回退字体）
- Agent 配置（Claude、Codex、opencode 共用一份 `home/AGENTS.md`）
- herdr 配置，以及 herdr 的 Claude 会话 hook
- 可选的 Pi 主题、本地扩展和设置

## Fresh-machine setup

前提：Apple Silicon Mac。Intel Mac 需要把 `configuration.nix` 里的 `nixpkgs.hostPlatform` 改成 `"x86_64-darwin"`。

```sh
git clone https://github.com/jasontopia/dotfiles.git ~/dotfiles
cd ~/dotfiles
./bootstrap.sh
```

`bootstrap.sh` 按顺序做四件事：安装 Determinate Nix、把本仓库软链接到 `~/.dotfiles`、校验 `flake.nix` 里的 `user`、执行第一次 `darwin-rebuild switch`。

只校验、不应用：

```sh
nix flake check --no-build
nix build .#darwinConfigurations.mac.system --dry-run
```

### 在已经用过的机器上第一次 switch

- **Homebrew 会被清理**：没写进 `configuration.nix` 的 Homebrew 包会被卸载（见下方 cleanup warning）。
  neovim、starship、ripgrep、fd、zsh-autosuggestions、Hack Nerd Font 改由 Nix 提供，brew 版被卸掉是正常的。
- **链接目标不能是真实文件**：home-manager 不会覆盖已存在的文件或文件夹。
  如果 `~/.config/herdr`、`~/.config/wezterm`、`~/.zshrc` 等已经是真实文件，先移走再 switch，否则激活会失败。
  herdr 启动时会自己创建 `~/.config/herdr`，所以第一次 switch 前先退出 herdr。
- **Claude Code 只用 Homebrew cask**：不要再用 `npm install -g @anthropic-ai/claude-code`，它会占用 `/opt/homebrew/bin/claude`，导致 cask 安装失败。
- `sudo` 需要真正的终端输入密码，`./rebuild.sh` 要在普通终端窗口里运行。

## Daily use

直接改仓库里的配置文件，然后：

```sh
./rebuild.sh
```

`home/` 下的文件通过 `mkOutOfStoreSymlink` 链接到位（`~/.config/nvim` → `home/.config/nvim` 等），改完立即生效，不需要 rebuild。
改了 `configuration.nix`（软件清单、系统设置）或 `home.nix`（Nix 包、zsh 别名、starship、环境变量、链接列表）时，才需要跑 `./rebuild.sh`。

**Homebrew cleanup warning:** `configuration.nix` 设置了 `homebrew.onActivation.cleanup = "zap"`。
每次 switch 都会卸载所有没写在 `brews`/`casks` 里的 Homebrew 包。新装 Homebrew 软件时，先把它加进 `configuration.nix`。

**Git identity:** 和 Kun 一样，本配置不设置 git 的 name/email，需要自己用 `git config --global` 设置一次。

**Heads-up:** `cc` 和 `co` 别名分别是 `claude --dangerously-skip-permissions` 和 `codex --full-auto`，权限很高，清楚用途再用。

## Agent toolchain

和 Kun 的设计一致：这些工具**不由本仓库声明或 vendor**，而是按各自官方文档从上游安装。
本仓库只负责系统层，工具本身各自独立升级。npm 工具用的是 Homebrew 装的 `node`。

| 工具 | 安装方式 | 用途 |
|---|---|---|
| [firstmate](https://github.com/kunchenguid/firstmate) | `git clone https://github.com/kunchenguid/firstmate ~/firstmate` | Agent distro，在该目录里启动 `claude` 使用 |
| [treehouse](https://github.com/kunchenguid/treehouse) | `curl -fsSL https://kunchenguid.github.io/treehouse/install.sh \| sh` | Git worktree 池（装到 `~/.local/bin`） |
| [no-mistakes](https://github.com/kunchenguid/no-mistakes) | `curl -fsSL https://raw.githubusercontent.com/kunchenguid/no-mistakes/main/docs/install.sh \| sh` | Push 前的验证门禁（装到 `~/.local/bin`） |
| gh-axi / chrome-devtools-axi / tasks-axi / quota-axi | `npm install -g <tool>` | firstmate 必需 |
| lavish-axi | `npm install -g lavish-axi` | 可视化 HTML artifact，可选 |
| [gnhf](https://github.com/kunchenguid/gnhf) | `npm install -g gnhf` | 通宵自主迭代 |
| [backpass](https://github.com/kunchenguid/backpass) | `npm install -g backpass acpx` | 从会话记录训练 `AGENTS.md` |

axi 工具必须全局安装，因为 firstmate 的 `bin/fm-bootstrap.sh` 会检查 PATH 上的二进制和版本下限。
在 firstmate 之外，还可以按 Kun 的推荐用 `npx skills add kunchenguid/<tool> --skill <skill> -g` 装成 Agent Skill。
在 `~/firstmate` 里运行 `bin/fm-bootstrap.sh`，没有 `MISSING` 输出即表示工具链齐全。

## 与 Kun 原版的差异

- `flake.nix`：`user = "admin"`。
- `configuration.nix`：`nix-homebrew.autoMigrate = true`（本机原先已有 Homebrew）；额外的 taps `kunchenguid/tap`、`nikitabobko/tap`；额外的 brews `gh`、`node`、`p7zip`、`go`、`pnpm`；额外的 casks `font-sarasa-gothic`、`baby-menu`、`aerospace`。
- `home.nix`：额外的 `v`/`g`/`h`/`reload` 别名、UTF-8 locale、`~/.local/bin` 进 PATH、starship 只显示当前文件夹（git 仓库里显示仓库名）、链接 herdr 的 Claude hook。
- `home/.config/wezterm/wezterm.lua`：字体增加 Sarasa Term SC 作为中文回退。
- `home/.config/herdr/config.toml`：`onboarding = false`。
- `home/.claude/settings.json`：在 Kun 的设置上增加 `tui`、`skipDangerousModePermissionPrompt`、herdr 的 `SessionStart` hook 和 auto mode 环境说明。
- `home/.claude/hooks/herdr-agent-state.sh`：herdr 生成的 hook 脚本，放进仓库以便新机器直接可用。herdr 更新时会改写它，改动会出现在 `git diff` 里。
- `home/AGENTS.md`：我自己的全局 Agent 规范。
- `.gitignore`：额外忽略 herdr 的运行时文件和 `.env`。
- `docs/`：复刻 Kun 环境时的调研笔记。

## Notes

第一次打开 `nvim` 时会从 GitHub 拉取 [lazy.nvim](https://github.com/folke/lazy.nvim) 和插件，需要联网一次，之后可离线使用。

## License

来自 Kun 原版的部分遵循 MIT No Attribution，见 `LICENSE`。
