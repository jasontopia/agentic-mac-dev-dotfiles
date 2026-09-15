# 🚀 Agentic Dev Environment Dotfiles

[![Nix Darwin](https://img.shields.io/badge/Nix--Darwin-Declarative-blue.svg)](https://github.com/LnL7/nix-darwin)
[![Neovim](https://img.shields.io/badge/Neovim-0.9+-green.svg)](https://neovim.io/)
[![Terminal](https://img.shields.io/badge/Terminal-WezTerm%20%2B%20Herdr-orange.svg)](https://wezfurlong.org/wezterm/)
[![Agentic Engineering](https://img.shields.io/badge/Agentic-First%20Mate-purple.svg)](https://github.com/kunchenguid/firstmate)

这是一套基于 **Nix-Darwin** 声明式配置打造的 **Agentic 开发者环境 Dotfiles** [134, 137, 185]。灵感源自前 Meta / Microsoft L8 Principal 工程师 **Kun Chen** 的 Agentic Engineering 高吞吐并行开发工作流 [1, 132, 199]。

旨在实现 **一台新 Mac 一键还原所有系统偏好、CLI 工具、编辑器配置与 AI Agent 调度管理系统** [133, 134, 197, 198]。

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
| **`flake.nix` & `configuration.nix`** [137, 139] | **声明式系统与软件基础**：使用 Nix-Darwin 管理 macOS 系统偏好设置（自动深色模式 [143]、超快按键重复 [143]、自动隐藏 Dock/菜单栏 [143]、显示全量文件扩展名 [143]），并通过代码声明安装 Homebrew 依赖（`wezterm` [147]、`neovim` [185]、`ripgrep` [185]、`fd` [185]、`herdr` [185]）[185]。 |
| **`init.lua`** | **Neovim 极速代码审查中心**：集成 Lazy.nvim 插件管理器、Tokyo Night 主题 [157]、**`Oil.nvim`**（将文件系统当作文本直接编辑的文本化文件流 [171, 172, 174]）与 **`Neogit`**（键盘驱动的极速 Git diff 变更审查 [174, 175, 176]）。 |
| **`AGENTS.md`** [191] | **全局 AI Agent 统一记忆库**：软链接至 `~/.claude/CLAUDE.md`，规范所有 AI Agent（Claude, Codex, Pi 等）的工程行为 [191, 197]。包括禁止使用破折号字串 [191]、禁止自动追加 Co-author [192]、技术决策偏向长期可维护性而非仅看开发成本 [193, 194]、端到端复现 Bug [195] 等高标准准则 [196]。 |
| **`firstmate/`** [2, 271] | **First Mate（大副 Agent）调度引擎**：Kun 开源的大副 Agent 调度系统 [1, 2, 271]。人类工程师作为 Captain 只需与大副对话 [2, 56]，大副负责自动分发并并行调度 Crewmate 子 Agent 去执行多任务 [2, 8, 10, 56, 79]，彻底降低上下文切换成本 [2, 56]。包含 `bin/` 目录下 180+ 个自动化处理与离线控制脚本（如 `fm-afk-start.sh`）。 |
| **`herdr`** [1, 183, 184] | **Agent 时代终端多路复用器**：比传统 tmux 更懂 AI Agent [1, 55, 184]。原生感知 Agent 会话状态，完美管理多 Agent 并行窗口与后台任务调度 [1, 184, 186]。 |

---

## 🛠 目录结构

```text
~/dotfiles/
├── flake.nix              # Nix-Darwin 入口与 Flake 依赖声明 [137]
├── configuration.nix      # macOS 系统设置与 Homebrew 声明式软件包列表 [139, 145, 185]
├── init.lua               # Neovim 配置文件 (Oil.nvim, Neogit, TokyoNight) [160, 171, 175]
├── AGENTS.md              # 规范 AI Agent 行为准则的全局记忆文件 [191]
└── firstmate/             # First Mate 大副 Agent 项目与 bin/ 全局工具集 [2, 56]
    └── bin/               # 180+ 个自动化与并发调度可执行脚本 (fm-afk-*.sh 等)
```

---

## 🚀 新机一键部署指南

在一台全新的 Mac 电脑（Apple Silicon / Intel [140, 141]）上，只需按照以下 5 个步骤即可完成全套开发环境的初始化：

### 1. 准备基础命令行工具与 SSH Key

打开 Mac 默认终端（Terminal），运行：

```bash
# 安装 Xcode Command Line Tools [295]
xcode-select --install

# 生成 SSH 密钥并绑定至 GitHub 账号
ssh-keygen -t ed25519 -C "mac-mini" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```
> 将复制的公钥添加至你的 [GitHub SSH Keys](https://github.com/settings/keys)。

---

### 2. 安装 Nix 环境与克隆 Dotfiles

```bash
# 1. 安装 Determinate Nix 安装器 [135]
curl -fsSL https://install.determinate.systems/nix | sh -s -- install

# 2. 刷新终端环境变量 [135]
source /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh

# 3. 克隆本 dotfiles 仓库到本地 ~/dotfiles 路径
git clone git@github.com:<你的GitHub用户名>/dotfiles.git ~/dotfiles
```

---

### 3. 构建并激活声明式系统环境 (Nix-Darwin)

```bash
cd ~/dotfiles

# 首次激活 Nix-Darwin 配置 [141]
nix run nix-darwin -- switch --flake ~/dotfiles#Mac

# 后续如修改了 configuration.nix，随时执行此命令更新系统配置 [142]
sudo darwin-rebuild switch --flake ~/dotfiles#Mac
```

> **注意**：Nix-Darwin 会自动安装 Homebrew [145]、`wezterm` [147]、`neovim` [185]、`ripgrep` [185]、`fd` [185] 以及 `herdr` 多路复用器 [185]。

---

### 4. 建立配置文件软链接与环境变量

```bash
# 1. 链接 Neovim 配置文件 [150]
mkdir -p ~/.config/nvim
ln -sf ~/dotfiles/init.lua ~/.config/nvim/init.lua

# 2. 链接全局 AI Agent 记忆库 AGENTS.md [197]
mkdir -p ~/.claude
ln -sf ~/dotfiles/AGENTS.md ~/.claude/CLAUDE.md

# 3. 将 First Mate 命令行工具挂载至全局 PATH 路径
echo 'export PATH="$HOME/dotfiles/firstmate/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

### 5. 验证安装

```bash
# 验证多路复用器 herdr [185]
herdr

# 验证 Neovim 编辑器 (进入后按 Space + e 体验 Oil 文件浏览) [172]
nvim

# 验证 First Mate 大副工具集
which fm-afk-start.sh
```

---

## 💡 核心组件使用指南

### 1. 终端多路复用 (`herdr`)
输入 `herdr` 即可进入交互界面 [186]。可方便地建立多个 Tab / Pane [186]，分别用于运行系统 Shell、开发服务以及后台 AI Agent 会话 [183, 186]。

### 2. 键盘流编辑器 (`Neovim`)
- **`Space + e`**：打开 **Oil.nvim** 文本化文件管理器 [172]。在缓冲里像编辑文本一样使用 `yy`（复制）[173]、`dd`（删除）[174]、`p`（粘贴）[173] 即可直接更改文件与目录结构 [173, 174]。
- **`Space + g`**：打开 **Neogit**，进行极速键盘驱动的 Git Status 查看与 Diff 代码审查 [175, 176]。

### 3. 大副 Agent 调度 (`First Mate`)
在任何工程项目中启动 AI Agent（如 Claude Code、Pi 等）[2]，Agent 会自动读取全局规则 `AGENTS.md` [191, 197] 与 `firstmate/bin` 工具集，配合 `herdr` 将复杂任务拆解并分发给后台 Crewmate 子 Agent 并行执行 [2, 8, 10, 56, 79]。

---

## 📄 许可与致谢

- 本配置架构灵感与 First Mate 项目均遵循开源协议致谢 [1, 2]。
- 特别感谢 **[Kun Chen](https://github.com/kunchenguid)** 贡献的 Agentic Engineering 理论框架与工具链 [1, 2, 132, 199]。
