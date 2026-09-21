# dotfiles

Jasontopia 的 Mac 配置，基于 [Kun 的 dotfiles](https://github.com/kunchenguid/dotfiles)，用 nix-darwin 和 home-manager 管理。
结构和设置以 Kun 的原版为准，只在用户名和个人软件清单上有差异（见"与 Kun 原版的差异"）。

## What you get

执行一次 switch 会配置好：

- 系统设置（深色模式、按键重复、Dock、Finder、触控板）
- Homebrew 应用（casks 和 CLI 工具）
- Nix 用户包（ripgrep、fd、fzf、jq、lazygit、Neovim、Hack Nerd Font）
- Shell（zsh、别名、starship 提示符）
- 编辑器（Neovim，rose-pine moon 主题）
- 终端（WezTerm，rose-pine moon 主题）
- Agent 配置（Claude、Codex、opencode 共用一份 `home/AGENTS.md`）
- 可选的 Pi 主题、本地扩展和设置

## Fresh-machine setup

```sh
git clone https://github.com/Jasontopia/dotfiles.git ~/dotfiles
cd ~/dotfiles
./bootstrap.sh
```

`bootstrap.sh` 按顺序做四件事：安装 Determinate Nix、把本仓库软链接到 `~/.dotfiles`、校验 `flake.nix` 里的 `user`、执行第一次 `darwin-rebuild switch`。

只校验、不应用：

```sh
nix flake check --no-build
nix build .#darwinConfigurations.mac.system --dry-run
```

## Daily use

直接改仓库里的配置文件，然后：

```sh
./rebuild.sh
```

`home/` 下的文件通过 `mkOutOfStoreSymlink` 链接到位，改完立即生效，不需要 rebuild。
只有改了包列表或系统设置时才需要跑 `./rebuild.sh`。

**Homebrew cleanup warning:** `configuration.nix` 设置了 `homebrew.onActivation.cleanup = "zap"`。
每次 switch 都会卸载所有没写在 `brews`/`casks` 里的 Homebrew 包。新装 Homebrew 软件时，先把它加进 `configuration.nix`。

## Agent toolchain

和 Kun 的设计一致：这些工具**不由本仓库声明或 vendor**，而是按各自官方文档从上游安装。
本仓库只负责系统层，工具本身各自独立升级。

| 工具 | 安装方式 | 用途 |
|---|---|---|
| [firstmate](https://github.com/kunchenguid/firstmate) | `git clone https://github.com/kunchenguid/firstmate ~/firstmate` | Agent distro，在该目录里启动 `claude` 使用 |
| [treehouse](https://github.com/kunchenguid/treehouse) | `curl -fsSL https://kunchenguid.github.io/treehouse/install.sh \| sh` | Git worktree 池 |
| [no-mistakes](https://github.com/kunchenguid/no-mistakes) | `curl -fsSL https://raw.githubusercontent.com/kunchenguid/no-mistakes/main/docs/install.sh \| sh` | Push 前的验证门禁 |
| gh-axi / chrome-devtools-axi / lavish-axi | `npm install -g <tool>` | firstmate 必需（lavish-axi 用于可视化，可选） |
| tasks-axi / quota-axi | `npm install -g <tool>` | firstmate 必需 |
| [gnhf](https://github.com/kunchenguid/gnhf) | `npm install -g gnhf` | 通宵自主迭代 |
| [backpass](https://github.com/kunchenguid/backpass) | `npm install -g backpass acpx` | 从会话记录训练 `AGENTS.md` |

axi 工具必须全局安装，因为 firstmate 的 `bin/fm-bootstrap.sh` 会检查 PATH 上的二进制和版本下限。
在 firstmate 之外，还可以按 Kun 的推荐用 `npx skills add kunchenguid/<tool> --skill <skill> -g` 装成 Agent Skill。
在 `~/firstmate` 里运行 `bin/fm-bootstrap.sh`，没有 `MISSING` 输出即表示工具链齐全。

## 与 Kun 原版的差异

- `flake.nix`：`user = "admin"`。
- `configuration.nix`：`nix-homebrew.autoMigrate = true`（本机原先已有 Homebrew）；额外保留 `gh`、`node`、`p7zip`、`font-sarasa-gothic`、`baby-menu`、`aerospace`。
- `home.nix`：额外的 `v`/`g`/`h`/`reload` 别名、UTF-8 locale、`~/.local/bin` 进 PATH。
- `home/.config/wezterm/wezterm.lua`：字体增加 Sarasa Term SC 作为中文回退。
- `home/AGENTS.md`：我自己的全局 Agent 规范。
- `home/.claude/settings.json`：在 Kun 的设置上保留 `tui` 和 `skipDangerousModePermissionPrompt`。

## License

来自 Kun 原版的部分遵循 MIT No Attribution，见 `LICENSE`。
