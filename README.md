# 🚀 Agentic Dev Environment Dotfiles

[![Nix Darwin](https://img.shields.io/badge/Nix--Darwin-Declarative-blue.svg)](https://github.com/LnL7/nix-darwin)
[![Neovim](https://img.shields.io/badge/Neovim-0.9+-green.svg)](https://neovim.io/)
[![Terminal](https://img.shields.io/badge/Terminal-WezTerm%20%2B%20Herdr-orange.svg)](https://wezfurlong.org/wezterm/)
[![Agentic Engineering](https://img.shields.io/badge/Agentic-First%20Mate-purple.svg)](https://github.com/kunchenguid/firstmate)

这是一套基于 **Nix-Darwin** 声明式配置打造的 **Agentic 开发者环境 Dotfiles**。灵感源自前 Meta / Microsoft L8 Principal 工程师 **Kun Chen** 的 Agentic Engineering 高吞吐并行开发工作流。

旨在实现 **一台新 Mac 一键还原所有系统偏好、终端外壳、CLI 工具、编辑器配置与 AI Agent 调度管理系统**。

---

## 目录
- [📦 项目包含的内容与作用](#-项目包含的内容与作用)
- [🛠 目录结构](#-目录结构)
- [🚀 新机一键部署指南](#-新机一键部署指南)
- [💡 核心组件使用指南](#-核心组件使用指南)
- [📄 许可与致谢](#-许可与致谢)

---

## 📦 项目包含的内容与作用

| 组件 / 配置文件 | 作用与核心特性 |
| :--- | :--- |
| **`flake.nix` & `configuration.nix`** | **声明式系统与软件基础**：使用 Nix-Darwin 管理 macOS 系统偏好设置（自动深色模式、超快按键重复、自动隐藏 Dock/菜单栏、显示全量文件扩展名），并通过代码声明安装 Homebrew 依赖（`wezterm`、`neovim`、`ripgrep`、`fd`、`herdr`）。 |
| **`wezterm/wezterm.lua`** | **沉浸式终端外壳**：无边框设计、88% 半透明 + macOS 20px 毛玻璃效果、Rosé Pine Moon 主题配色、Hack Nerd Font 高清图标字体以及划选自动拷贝。 |
| **`starship.toml`** | **极简终端提示符**：隐藏冗长的 `admin@Mac` 主机名，只保留当前项目路径与 Git 分支状态。 |
| **`zshrc`** | **Zsh 命令行高效增强**：集成 `zsh-autosuggestions`（灰色历史命令预测补全）、快捷别名（`v` -> `nvim`, `h` -> `herdr`, `g` -> `git`）。 |
| **`init.lua`** | **Neovim 极速代码审查中心**：集成 Lazy.nvim 插件管理器、**`Oil.nvim`**（文本化文件流）、**`Neogit`**（键盘驱动 Git diff 审查）与按 `ESC` 自动保存。 |
| **`AGENTS.md`** | **全局 AI Agent 统一记忆库**：软链接至 `~/.claude/CLAUDE.md`，规范所有 AI Agent（Claude, Codex 等）的工程行为准则。 |
| **`firstmate/`** | **First Mate（大副 Agent）调度引擎**：Kun 开源的大副 Agent 调度系统，人类作为 Captain 授权大副并行分发多任务给 Crewmate 子 Agent 执行。包含 `bin/` 下 180+ 个自动化处理脚本。 |
| **`herdr`** | **Agent 时代终端多路复用器**：比传统 tmux 更懂 AI Agent，原生感知 Agent 会话状态，完美管理多 Agent 并行窗口与后台任务调度。 |

---

## 🛠 目录结构

```text
~/dotfiles/
├── flake.nix              # Nix-Darwin 入口与 Flake 依赖声明
├── configuration.nix      # macOS 系统设置与 Homebrew 声明式软件包列表
├── wezterm/
│   └── wezterm.lua        # WezTerm 沉浸式无边框/透明磨砂/字体配置
├── starship.toml          # Starship 极简终端提示符配置
├── zshrc                  # Zsh 配置文件 (zsh-autosuggestions, 快捷别名)
├── init.lua               # Neovim 配置文件 (Oil.nvim, Neogit, ESC 自动保存)
├── AGENTS.md              # 规范 AI Agent 行为准则的全局记忆文件
└── firstmate/             # First Mate 大副 Agent 项目与 bin/ 全局工具集
    └── bin/               # 180+ 个自动化与并发调度可执行脚本 (fm-afk-*.sh 等)
```

---

## 🚀 新机一键部署指南

在一台全新的 Mac 电脑（Apple Silicon / Intel）上，只需按照以下 5 个步骤即可完成全套开发环境的初始化：

### 1. 准备基础命令行工具与 SSH Key

打开 Mac 默认终端（Terminal），运行：

```bash
# 安装 Xcode Command Line Tools
xcode-select --install

# 生成 SSH 密钥并绑定至 GitHub 账号
ssh-keygen -t ed25519 -C "mac-mini" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```
> 将复制的公钥添加至你的 [GitHub SSH Keys](https://github.com/settings/keys)。

---

### 2. 安装 Nix 环境与克隆 Dotfiles

```bash
# 1. 安装 Determinate Nix 安装器
curl -fsSL https://install.determinate.systems/nix | sh -s -- install

# 2. 刷新终端环境变量
source /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh

# 3. 克隆本 dotfiles 仓库到本地 ~/dotfiles 路径
git clone git@github.com:jasontopia/dotfiles.git ~/dotfiles
```

---

### 3. 构建并激活声明式系统环境 (Nix-Darwin)

```bash
cd ~/dotfiles

# 首次激活 Nix-Darwin 配置
nix run nix-darwin -- switch --flake ~/dotfiles#Mac

# 后续如修改了 configuration.nix，随时执行此命令更新系统配置
sudo darwin-rebuild switch --flake ~/dotfiles#Mac
```

---

### 4. 建立配置文件软链接与环境变量

```bash
# 1. 创建目标配置文件夹
mkdir -p ~/.config/wezterm ~/.config/nvim ~/.claude

# 2. 建立所有配置的软链接
ln -sf ~/dotfiles/wezterm/wezterm.lua ~/.config/wezterm/wezterm.lua
ln -sf ~/dotfiles/starship.toml ~/.config/starship.toml
ln -sf ~/dotfiles/zshrc ~/.zshrc
ln -sf ~/dotfiles/init.lua ~/.config/nvim/init.lua
ln -sf ~/dotfiles/AGENTS.md ~/.claude/CLAUDE.md

# 3. 刷新环境变量
source ~/.zshrc
```

---

### 5. 验证安装

```bash
# 验证终端多路复用器 herdr
herdr

# 验证 Neovim 编辑器 (直接输入 v 体验 Oil 文件浏览与 ESC 自动保存)
v

# 验证 First Mate 大副工具集
which fm-afk-start.sh
```

---

## 💡 核心组件使用指南

### 1. 终端多路复用 (`herdr`)
输入 `h` 或 `herdr` 即可进入交互界面。可方便地建立多个 Tab / Pane，分别用于运行系统 Shell、开发服务以及后台 AI Agent 会话。

### 2. 键盘流编辑器 (`Neovim`)
- **`v`**：快捷打开 Neovim。
- **`-`**：打开 **Oil.nvim** 文本化文件管理器。在缓冲里像编辑文本一样使用 `yy`（复制）、`dd`（删除）、`p`（粘贴）即可直接更改文件与目录结构。
- **按 `ESC` 键**：修改后自动保存。

### 3. 大副 Agent 调度 (`First Mate`)
在任何工程项目中启动 AI Agent，Agent 会自动读取全局规则 `AGENTS.md` 与 `firstmate/bin` 工具集，配合 `herdr` 将复杂任务拆解并分发给后台 Crewmate 子 Agent 并行执行。

---

## 📄 许可与致谢

- 本配置架构灵感与 First Mate 项目均遵循开源协议致谢。
- 特别感谢 **[Kun Chen](https://github.com/kunchenguid)** 贡献的 Agentic Engineering 理论框架与工具链。
