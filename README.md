# Agentic Mac Dev Dotfiles

一套**专为 macOS 打造的 Agentic 开发环境**：用 nix-darwin + home-manager 把系统设置、软件清单、终端、编辑器、以及 AI Agent（Claude Code / Codex，Pi / opencode 为预留）的配置全部声明在一个仓库里。

目标很简单：**一台全新的 Mac，`git clone` 之后跑一次 `./bootstrap.sh`，就得到一台和现在一模一样的机器。**

之后每次改配置，都是改仓库里的文件，再跑一次 `./rebuild.sh`。机器上不留任何「手点出来的」状态。

> 仅支持 macOS（默认 Apple Silicon）。本项目基于 [Kun 的 dotfiles](https://github.com/kunchenguid/dotfiles) 重构而来，详见文末[致谢](#致谢与来源)。

---

## 这是什么

大多数 dotfiles 只管 `~/.zshrc` 这类点文件，装软件还得自己 `brew install`，系统设置还得自己去「系统设置」里点。

这套配置把三层一起管起来：

| 层 | 由谁声明 | 例子 |
|---|---|---|
| **系统层** | `configuration.nix` | 深色模式、按键重复速度、Dock 自动隐藏、Finder 列表视图、触控板轻点 |
| **软件层** | `configuration.nix` 的 Homebrew 清单 + `home.nix` 的 Nix 包 | WezTerm、Claude Code、Baby Menu、Chrome/Brave、ChatGPT、ripgrep、fd、fzf、neovim、字体 |
| **配置层** | `home.nix` + `home/` 目录 | zsh 别名、starship 提示符、git、Neovim、WezTerm、herdr、borders、Baby Menu 自制组件、Claude/Codex 的 agent 配置（Pi 的配置文件仍在仓库里，预留，默认未启用） |

三层都是**声明式**的：仓库是唯一事实源，机器是它的产物。

---

## 你会得到什么

跑完一次 switch，这些东西全部就位：

**系统与终端**
- macOS 系统偏好：深色模式、快速按键重复、自动隐藏菜单栏和 Dock、显示文件扩展名、Finder 列表视图、干净桌面、轻点即点击
- [WezTerm](https://wezfurlong.org/wezterm/)：rose-pine moon 主题、半透明 + 毛玻璃背景、失焦窗口自动变暗（一眼看出焦点在哪）、Hack Nerd Font + 更纱黑体中文回退
- zsh：历史记录幽灵补全（`Ctrl+F` 接受）、语法高亮、一组高频别名
- [starship](https://starship.rs/) 提示符：只显示当前文件夹名，在 git 仓库里显示仓库名 + 分支 + 状态 + 上条命令耗时
- [JankyBorders](https://github.com/FelixKratz/JankyBorders)：macOS 只靠标题栏深浅表示窗口焦点，堆叠多窗口时几乎看不出来，borders 给焦点窗口描一圈边补上这个。Catppuccin Mocha 蓝配色，由 launchd agent 在登录时拉起
- [Baby Menu](https://github.com/kunchenguid/baby-menu)：菜单栏已经自动隐藏，日常要瞄一眼的信息改由它承载。仓库带两个自制组件：`claude-code-quota`（Claude Code 周额度用量，运行时从 macOS Keychain 读 token，不存任何凭据）和 `system-usage`（CPU / 内存实时占用，只在面板打开时刷新）
- git：`core.quotepath = false` + UTF-8 的 `i18n`，中文文件名和中文 commit message 不再显示成转义码
- GUI 应用：Chrome、Brave、ChatGPT、Typeless（语音输入）、UURemote 都由 cask 声明，不用手动去官网下。Codex CLI 藏在 ChatGPT.app 内部，`home.nix` 把它链到 `~/.local/bin/codex`，所以 `codex` 和 `co` 别名直接可用
- PATH：`~/.local/bin` 和 `/opt/homebrew/{bin,sbin}` 都由 `home.nix` 声明，不依赖 Homebrew 安装器往 `~/.zprofile` 写的那行 `shellenv`

**编辑器**
- Neovim + [lazy.nvim](https://github.com/folke/lazy.nvim)，rose-pine moon 主题
- snacks.nvim 文件/全文/buffer 检索与跳转定义、oil.nvim 文件浏览、neogit + diffview + gitsigns（行级 blame）、which-key 提示
- `Esc` 直接保存，`<leader>f/s/b/e/g` 分别是找文件、搜内容、切 buffer、文件浏览、Git

**Agent 环境（这套配置的重点）**
- **一份 `home/AGENTS.md` 作为全局 Agent 规范**，通过符号链接同时供给 Claude Code（`~/.claude/CLAUDE.md`）和 Codex（`~/.codex/AGENTS.md`）。改一处，两个 agent 同时生效。opencode（`~/.config/opencode/AGENTS.md`）的链接**预留，默认未启用**
- Claude Code：dark-ansi 主题、全屏 TUI、状态栏显示当前模型和上下文使用百分比、SessionStart hook 接入 herdr、auto mode 的环境描述
- herdr 多路复用器：tmux 风格键位（`Ctrl+B` 前缀 + `hjkl` 切 pane），Agents 面板按 space 分组
- Pi（**预留，默认未启用**）：rose-pine moon 主题、安静启动、折叠思考块、自带 **Calm 扩展**（隐藏内置工具的噪音输出、折叠 thinking、底部一艘慢慢开的小船表示正在工作），以及终端标题状态扩展。配置文件都还在仓库里，`home.nix` 里的链接已注释，见[预留组件](#预留组件)
- `cc` / `co` 别名一键进入 Claude Code / Codex 的高权限模式（`co` 保留工作区沙箱）

**可复现性**
- `flake.lock` 锁死 nixpkgs / nix-darwin / home-manager / nix-homebrew 的版本，今天和半年后 build 出来的是同一套
- `tests/` 下有 Pi Calm 扩展的完整测试（渲染、生命周期、持久化、隔离 herdr 会话里的真实 TUI 验证）。随 Pi 一起**预留，默认未启用**

---

## 快速开始

**前提**：一台 macOS（默认 Apple Silicon）。Intel Mac 把 `configuration.nix` 里的 `nixpkgs.hostPlatform` 改成 `"x86_64-darwin"`。

```sh
git clone https://github.com/jasontopia/agentic-mac-dev-dotfiles.git ~/agentic-mac-dev-dotfiles
cd ~/agentic-mac-dev-dotfiles
./bootstrap.sh
```

`bootstrap.sh` 按顺序做四件事：

1. 安装 [Determinate Nix](https://determinate.systems/)（已装则跳过）
2. 把本仓库软链接到 `~/.dotfiles`（`home.nix` 里的路径都从这里解析，所以 clone 到哪个目录名都可以）
3. 校验 `flake.nix` 里的 `user =` 和你的 macOS 用户名是否一致，不一致会询问并帮你改
4. 执行第一次 `darwin-rebuild switch`

过程中需要输入 `sudo` 密码，所以要在真正的终端窗口里运行。

只想验证配置、不实际应用：

```sh
nix flake check --no-build
nix build .#darwinConfigurations.mac.system --dry-run
```

### 在已经用过的机器上第一次 switch

这几条会咬人，先看完再跑：

- **Homebrew 会被清理**：`onActivation.cleanup = "zap"`，没写进 `configuration.nix` 的 Homebrew 包会被卸载。neovim、starship、ripgrep、fd、zsh-autosuggestions、Hack Nerd Font、更纱黑体这些改由 Nix 提供，brew 版被卸掉是预期行为
- **链接目标不能是已存在的真实文件**：home-manager 不会覆盖已有的文件或文件夹。如果 `~/.config/herdr`、`~/.config/wezterm`、`~/.zshrc`、`~/.config/git/config`、`~/.config/git/ignore`、`~/.baby-menu/extensions/{claude-code-quota,system-usage}` 已经是真实文件，先移走再 switch。herdr 启动时会自己创建 `~/.config/herdr`，所以第一次 switch 前先退出 herdr
- **Claude Code 只走 Homebrew cask**：不要用 `npm install -g @anthropic-ai/claude-code`，它会占住 `/opt/homebrew/bin/claude` 导致 cask 安装失败
- **已经手动装过的 GUI 应用会被 cask 接管**：Chrome、Brave、ChatGPT、Typeless、UURemote 如果已经在 `/Applications` 里，cask 安装默认会因为「App 已存在」而失败。`onActivation.extraFlags = [ "--force" ]` 正是为此存在，第一次 switch 时 brew 会直接接管它们
- 本机之前已有 Homebrew 的话，`nix-homebrew.autoMigrate = true` 会接管它；全新机器可以把这行去掉

---

## 需要你自己配置的东西

仓库刻意不声明这些，因为它们要么是私密信息，要么应该独立升级：

| 事项 | 怎么做 |
|---|---|
| Git 身份 | `git config --global user.name/user.email`，本配置不代管（只有身份不代管；`quotepath`/UTF-8 那些非身份配置在 `home/.config/git/config` 里） |
| 用户名 | `flake.nix` 里唯一一行 `user = "..."`，`bootstrap.sh` 会提示你改 |
| Agent 登录 | Claude Code / Codex 各自首次启动时登录 |
| Codex 的 `config.toml` | 由 ChatGPT app 自己生成，本仓库不代管（原因见[注意事项](#注意事项)）。唯一需要手动重设的偏好是 `[desktop] followUpQueueMode = "steer"` |
| Agent 工具链 | 见下一节，按官方方式从上游安装 |
| 本地密钥 | `.env` 已被 gitignore，不要往仓库里放 |

---

## Agent 工具链

这些工具**不由本仓库声明也不 vendor**，各自按官方文档从上游安装，独立升级。本仓库只负责系统层。npm 工具用 Homebrew 装的 `node`。

| 工具 | 安装方式 | 用途 |
|---|---|---|
| [pi](https://github.com/earendil-works/pi) | `npm install -g @earendil-works/pi-coding-agent` | **预留，当前不装**。Agent harness。`home.nix` 链接的 Pi 主题/扩展/模型配置和 `tests/` 都需要它，这些链接目前是注释掉的，见[预留组件](#预留组件) |
| [firstmate](https://github.com/kunchenguid/firstmate) | `git clone https://github.com/kunchenguid/firstmate ~/firstmate` | Agent distro，在该目录里启动 `claude` 使用 |
| [treehouse](https://github.com/kunchenguid/treehouse) | `curl -fsSL https://kunchenguid.github.io/treehouse/install.sh \| sh` | Git worktree 池，装到 `~/.local/bin` |
| [no-mistakes](https://github.com/kunchenguid/no-mistakes) | `curl -fsSL https://raw.githubusercontent.com/kunchenguid/no-mistakes/main/docs/install.sh \| sh` | Push 前的验证门禁，装到 `~/.local/bin` |
| gh-axi / chrome-devtools-axi / tasks-axi / quota-axi | `npm install -g <tool>` | firstmate 必需 |
| lavish-axi | `npm install -g lavish-axi` | 可视化 HTML artifact，必装 |
| [gnhf](https://github.com/kunchenguid/gnhf) | `npm install -g gnhf` | 通宵自主迭代 |
| [backpass](https://github.com/kunchenguid/backpass) | `npm install -g backpass acpx` | 从会话记录训练 `AGENTS.md` |
| [kun](https://github.com/kunchenguid/kun) | `npx skills add kunchenguid/kun -g -a claude-code -a codex` | `/kun` skill。装进 `~/.agents/skills/`，Claude Code 走符号链接，Codex 直接读这个目录 |

axi 系列必须全局安装，因为 firstmate 的 `bin/fm-bootstrap.sh` 会检查 PATH 上的二进制和版本下限。
在 `~/firstmate` 里跑 `bin/fm-bootstrap.sh`，没有 `MISSING` 输出即表示工具链齐全。
在 firstmate 之外，也可以用 `npx skills add kunchenguid/<tool> --skill <skill> -g` 把它们装成 Agent Skill。

`/kun` 的 `SKILL.md` 只有 1 KB，是个壳：每次调用时才从 `raw.githubusercontent.com` 拉 Kun 的 living docs
（`ENTRY.md` / `TOOLS.md` / `OPINIONS.md` / `VOICE.md`）再照着执行，而那几份文档每天自动重新生成。
所以它锁不住版本，跑起来也需要联网，这是上游的设计，不是这里的取舍。

`~/.local/bin` 已经由 `home.nix` 加进 PATH。

---

## 预留组件

Pi 和 opencode 目前**不使用**，但相关文件一份都没删，全部留在仓库里：

- `home/.pi/agent/`：Pi 的主题、扩展（含 Calm）、`models.json`、`settings.json`
- `tests/`：Pi Calm 扩展的测试套件
- `home/AGENTS.md`：opencode 会读的那份规范本来就是共用的，文件本身一直在

关闭的只是 `home.nix` 里的链接声明，它们被注释掉了（不是删掉）：`.pi/agent/` 的四条链接、
`.config/opencode/AGENTS.md` 的链接，以及只给 `tests/pi-calm.test.sh` 用的 `typescript` 包。

**重新启用三步：**

1. 取消 `home.nix` 里对应的注释（搜 `预留：Pi / opencode`，一共三处）
2. 安装 pi：`npm install -g @earendil-works/pi-coding-agent`
3. 跑 `./rebuild.sh`

---

## 日常使用

直接改仓库里的配置文件，然后：

```sh
./rebuild.sh
```

**什么时候需要 rebuild：**

| 改了什么 | 需要 rebuild 吗 |
|---|---|
| `home/` 下的配置文件（nvim、wezterm、herdr、borders、git、claude、pi、baby-menu、AGENTS.md） | **不需要**，它们是 `mkOutOfStoreSymlink` 链接到位的，改完立即生效 |
| `configuration.nix`（软件清单、系统设置） | 需要 |
| `home.nix`（Nix 包、zsh 别名、starship、环境变量、链接列表） | 需要 |

**装新软件**：先写进 `configuration.nix` 的 `brews`/`casks`（或 `home.nix` 的 `home.packages`），再 `./rebuild.sh`。直接 `brew install` 的东西会在下次 switch 时被 zap 掉。

---

## 仓库结构

```
flake.nix           版本锁定（nixpkgs / nix-darwin / home-manager / nix-homebrew）+ 唯一的 user 配置
flake.lock          实际锁定的 revision
configuration.nix   系统层：macOS defaults、Homebrew taps/brews/casks
home.nix            用户层：Nix 包、zsh、starship、环境变量、所有符号链接
home/               真实的配置文件，被链接到 ~ 下
  AGENTS.md           全局 Agent 规范（Claude / Codex 共用；opencode 预留）
  .config/nvim/       Neovim + lazy.nvim
  .config/wezterm/    WezTerm
  .config/herdr/      herdr 键位与 UI
  .config/borders/    JankyBorders 焦点边框
  .config/git/        非身份的 git 配置 + 全局 ignore
  .claude/            Claude Code 设置与 hook
  .pi/agent/          Pi 主题、扩展、模型覆盖（预留，默认未启用）
  .baby-menu/         Baby Menu 自制组件（claude-code-quota、system-usage）
bootstrap.sh        新机器一次性初始化
rebuild.sh          日常 switch
tests/              Pi Calm 扩展的测试（预留，默认未启用）
docs/               搭建时的调研笔记
```

---

## 设计取舍

想改这套东西之前，先看看这几条是**有意为之**的：

- **`homebrew.onActivation.cleanup = "zap"`**：强制「所有 Homebrew 包都必须写进配置」的习惯，机器才是真正可复现的。不要软化成 `uninstall` 或 `none`
- **配置文件用 `mkOutOfStoreSymlink` 而不是拷进 Nix store**：改 nvim 配置不该需要 rebuild。代价是这些文件不受 Nix 版本管理，好处是编辑体验和普通 dotfiles 一样
- **一份 `AGENTS.md` 供多个 agent 共用**：规范只有一份，不会漂移
- **Agent 工具链不进配置**：它们迭代太快，锁进 flake 只会让你永远在改版本号。系统层稳定，工具层自由
- **不管 git 身份、不管密钥**：仓库是公开的
- **Pi 的凭据和运行时状态不入库**：`home.nix` 只链接「作者写的」文件和目录，`auth.json`、`calm` 状态文件都留在本地

更多面向 agent 的项目约定见 [`AGENTS.md`](AGENTS.md)。

---

## 注意事项

- `cc` = `claude --dangerously-skip-permissions`，完全无防护；`co` = `codex -a never -s workspace-write`，不询问审批但写操作被沙箱限制在工作区内。两者权限都高，清楚用途再用（`co` 刻意比 `cc` 收紧一档）
- 第一次打开 `nvim` 会从 GitHub 拉 lazy.nvim 和插件，需要联网一次，之后可离线使用
- `home/.claude/hooks/herdr-agent-state.sh` 是 herdr 生成的脚本，入库是为了新机器开箱可用；herdr 升级时会改写它，改动会出现在 `git diff` 里
- **git 有两个全局配置文件，`~/.gitconfig` 会盖掉仓库版**：git 先读 `~/.config/git/config`（本仓库管），再读 `~/.gitconfig`（本地管身份），后者在冲突时胜出。所以两边的键必须互不重叠：别在 `~/.gitconfig` 里重复写 `quotepath` 之类的东西，否则改仓库不生效
- **`~/.codex/config.toml` 故意不入库**：它整份都是 ChatGPT app 生成的，不是手写配置 - 里面把 app 自己的版本号（`BROWSER_USE_CODEX_APP_VERSION`）硬编码进去，`marketplaces` 的 source 指向 `~/.codex/.tmp/` 和 `~/.cache/codex-runtimes/`，`mcp_servers.node_repl` 指向 app bundle 内部并带版本号的插件缓存路径。入库会把一个版本钉死，app 一升级就指向失效路径；而且 app 需要写这个文件，`mkOutOfStoreSymlink` 会让它每次升级都往仓库里写 diff。里面唯一是你自己选的是 `[desktop] followUpQueueMode`
- **Baby Menu 只链自制组件，不链整个 `extensions` 目录**：该目录里的 `hello-world`、`recipes`、`AGENTS.md`、`babymenu-env.d.ts` 是 app 自带模板，每次启动都会被重写，整个目录链上去会和 app 打架
- flake 的 host 名是 `mac`，改名的话 `flake.nix`、`bootstrap.sh`、`rebuild.sh` 三处都要同步
- `configuration.nix` 里有一个**只针对 Neovim** 的 overlay：0.12.5 合进了 nixpkgs master 但没有 backport 到 26.05，所以单独从 `nixpkgs-unstable` 取这一个包，其余全部留在 26.05。等 26.05 跟上之后，删掉这个 overlay 和 `flake.nix` 里的 `nixpkgs-unstable` 输入即可

---

## 致谢与来源

本项目基于 [**Kun Chen**](https://github.com/kunchenguid) 的 [dotfiles](https://github.com/kunchenguid/dotfiles) 重构而来。整体架构（nix-darwin + home-manager + nix-homebrew 三层分工、`mkOutOfStoreSymlink` 的编辑即生效、bootstrap/rebuild 两个脚本的划分、以及「agent 工具链不进配置」的取舍）都来自 Kun 的原版设计。

相关上游项目：

- [kunchenguid/dotfiles](https://github.com/kunchenguid/dotfiles) - 本项目的直接来源
- [kunchenguid/firstmate](https://github.com/kunchenguid/firstmate) - Agent distro
- [kunchenguid/no-mistakes](https://github.com/kunchenguid/no-mistakes) - push 前验证门禁
- [kunchenguid/treehouse](https://github.com/kunchenguid/treehouse) - worktree 池
- [kunchenguid/axi](https://github.com/kunchenguid/axi) - agent 工效学设计规范

`tests/pi-calm.test.sh` 改编自 Firstmate 的 Calm 测试套件（MIT）。

在此基础上，本仓库做了这些改动：中文文档、更纱黑体中文回退、WezTerm 失焦变暗、starship 只显示当前目录、UTF-8 locale 与配套的 git `quotepath`/`i18n` 配置、herdr 的 Claude SessionStart hook、JankyBorders 焦点环、两个自制 Baby Menu 组件、Pi Calm 扩展与测试、以及一份自己的全局 `AGENTS.md`。

## License

来自 Kun 原版的部分遵循 MIT No Attribution，见 [`LICENSE`](LICENSE)。
