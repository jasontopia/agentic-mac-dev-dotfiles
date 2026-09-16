# 🚀 Agentic Dev Environment Dotfiles (v1.0 Final)

[![Nix Darwin](https://img.shields.io/badge/Nix--Darwin-Declarative-blue.svg)](https://github.com/LnL7/nix-darwin)
[![Neovim](https://img.shields.io/badge/Neovim-0.9+-green.svg)](https://neovim.io/)
[![Terminal](https://img.shields.io/badge/Terminal-WezTerm%20%2B%20Herdr-orange.svg)](https://wezfurlong.org/wezterm/)
[![Agentic Engineering](https://img.shields.io/badge/Agentic-First%20Mate-purple.svg)](https://github.com/kunchenguid/firstmate)
[![GitHub CLI](https://img.shields.io/badge/GitHub%20CLI-Authenticated-black.svg)](https://cli.github.com/)

这是一套基于 **Nix-Darwin** 声明式配置与 **Kun Chen（前 Meta / Microsoft L8 Principal 工程师）** Agentic Engineering 理念打造的高吞吐多 Agent 开发者环境 Dotfiles。

旨在实现 **一台新 Mac 一键还原所有系统偏好、终端外壳、CLI 工具、键盘驱动编辑器与全套多 Agent 协作调度系统**。

---

## 目录
- [📦 项目全貌与软件架构](#-项目全貌与软件架构)
- [🛠 目录结构](#-目录结构)
- [🚀 新机一键部署指南](#-新机一键部署指南)
- [💡 核心 Agentic 工具链与使用指南](#-核心-agentic-工具链与使用指南)
- [📄 许可与致谢](#-许可与致谢)

---

## 📦 项目全貌与软件架构

| 组件 / 配置文件 | 分类 | 作用与核心特性 |
| :--- | :--- | :--- |
| **`flake.nix` & `configuration.nix`** | 系统基座 | **声明式 macOS 系统与依赖**：使用 Nix-Darwin 声明系统偏好（自动深色模式、键盘超快重复、隐藏 Dock/菜单栏、显示全量文件扩展名），代码化安装 Homebrew 软件包（`wezterm`、`font-hack-nerd-font`、`neovim`、`starship`、`ripgrep`、`fd`、`zsh-autosuggestions`、`gh`、`herdr`）。 |
| **`wezterm/wezterm.lua`** | 终端外壳 | **沉浸式终端**：无边框设计、88% 半透明 + macOS 20px 毛玻璃效果、Rosé Pine Moon 主题配色、Hack Nerd Font 高清美化字体以及划选自动拷贝。 |
| **`starship.toml`** | 终端提示符 | **极简 Starship**：隐藏冗长的 `admin@Mac` 主机名，只保留当前项目路径与 Git 分支状态。 |
| **`zshrc`** | Shell 环境 | **Zsh 高效增强**：集成 `zsh-autosuggestions` 自动补全，配置全局环境变量 PATH 挂载 Agent 工具链，提供快捷别名（`v` -> `nvim`, `h` -> `herdr`, `g` -> `git`, `reload`）。 |
| **`init.lua`** | 键盘流编辑器 | **Neovim 极速代码审查**：集成 Lazy.nvim、`Oil.nvim`（文本化文件流管理）、`Neogit`（键盘驱动 Git diff 审查）以及按 `ESC` 自动保存。 |
| **`AGENTS.md`** | 统一记忆库 | **全局 AI Agent 行为准则**：软链接至 `~/.claude/CLAUDE.md`，规范所有 AI Agent（Claude, Codex 等）的工程行为与架构要求。 |
| **`gh`** | 身份与协作 | **GitHub CLI**：通过 SSH Key 完整授权登录（Jasontopia），实现命令行一键创建仓库、提交 PR 与 Git 操作。 |
| **`herdr` (`h`)** | 多路复用器 | **Agent 专属终端复用器**：比传统 tmux 更懂 AI Agent，原生感知 Agent 会话状态，完美管理多 Agent 并行窗口与后台任务调度。 |
| **`firstmate`** | 大副调度引擎 | **First Mate Orchestrator**：Kun 开源的大副 Agent 调度系统，人类作为 Captain 授权大副并行分发多任务给 Crewmate 子 Agent 执行。包含 `bin/` 下 180+ 个自动化处理脚本。 |
| **`treehouse`** | 目录隔离 | **Git Worktree 多 Agent 隔离工具**：基于 Go 静态编译，防止多 Agent 同时改动同一目录导致代码冲突。 |
| **`no-mistakes`** | 自动化质检 | **对抗式测试与审查系统**：基于 Go 静态编译，Agent 提交代码前自动运行门禁测试与安全审查，确保零失误。 |
| **`quota-axi`** | 额度监控 | **多模型 API 额度实时监控**：基于 TypeScript/Node 工具链，实时跟踪多模型 Token 与 API 额度消耗，智能调度最佳模型。 |

---

## 🛠 目录结构

```text
~/dotfiles/
├── flake.nix              # Nix-Darwin 入口与 Flake 依赖声明
├── configuration.nix      # macOS 系统设置与 Homebrew 声明式软件包列表 (含 gh, herdr 等)
├── wezterm/
│   └── wezterm.lua        # WezTerm 沉浸式无边框/透明磨砂/字体配置
├── starship.toml          # Starship 极简终端提示符配置
├── zshrc                  # Zsh 配置文件 (含 zsh-autosuggestions, 环境变量 PATH 与快捷别名)
├── init.lua               # Neovim 配置文件 (Oil.nvim, Neogit, ESC 自动保存)
├── AGENTS.md              # 规范 AI Agent 行为准则的全局记忆文件
├── firstmate/             # [Submodule] First Mate 大副 Agent 项目与 bin/ 全局工具集
│   └── bin/               # 存放 fm-afk-*, treehouse, no-mistakes, quota-axi 等所有可执行二进制
├── treehouse/             # [Submodule] Git Worktree 多 Agent 隔离源码库
├── no-mistakes/           # [Submodule] 对抗式自动化质检源码库
└── quota-axi/             # [Submodule] 模型 API 额度监控源码库
```

---

## 🚀 新机一键部署指南

在一台全新的 Mac 电脑（Apple Silicon / Intel）上，只需按照以下 6 个步骤即可完成全套开发环境的初始化：

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

# 3. 递归克隆 dotfiles 仓库（包含所有 Agent 子模块）
git clone --recursive git@github.com:jasontopia/dotfiles.git ~/dotfiles
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

### 5. 编译与挂载 Agent 工具链

```bash
cd ~/dotfiles

# 1. 初始化并拉取子模块最新代码
git submodule update --init --recursive

# 2. 编译 Go 工具 (treehouse & no-mistakes) 至 bin 目录
cd ~/dotfiles/treehouse && CGO_ENABLED=0 go build -o ~/dotfiles/firstmate/bin/treehouse .
cd ~/dotfiles/no-mistakes && CGO_ENABLED=0 go build -o ~/dotfiles/firstmate/bin/ ./cmd/...

# 3. 挂载 TS/Node 工具 (quota-axi)
chmod +x ~/dotfiles/quota-axi/bin/quota-axi.ts
ln -sf ~/dotfiles/quota-axi/bin/quota-axi.ts ~/dotfiles/firstmate/bin/quota-axi

# 4. 刷新环境
source ~/.zshrc
```

---

### 6. 验证安装状态

```bash
# 验证 GitHub CLI 登录状态
gh auth status

# 验证终端复用器与编辑器
herdr
v

# 一键验证 Agent 三剑客路径
which treehouse && which no-mistakes && which quota-axi
```

---

## 💡 核心 Agentic 工具链与使用指南

### 1. 多路复用分发 (`herdr`)
输入 **`h`** 或 `herdr` 进入终端界面。通过 `herdr` 管理多个工作区窗格，为大副与不同子 Agent 提供独立、可视化的工作空间。

### 2. 大副 Agent 调度 (`First Mate`)
人类扮演 **Captain**，将高级指令传达给 **First Mate**（大副）。大副会自动读取 `AGENTS.md` 中的规范，通过调度规则自动将子任务并发派发给不同 Crewmate Agent。

### 3. 多 Agent 目录隔离 (`treehouse`)
在多 Agent 并行开发时，运行 `treehouse` 自动为每个 Agent 创建独立的 Git Worktree 隔离目录，彻底避免多个 AI 同时修改同一个文件引发的代码冲突。

### 4. 对抗式自动代码审查 (`no-mistakes`)
在 Agent 提交 Pull Request 前，`no-mistakes` 会自动触发拦截与审查门禁，对生成的代码进行断言测试与回归验证，确保代码符合生产级标准。

### 5. API 额度实时监控 (`quota-axi`)
运行 `quota-axi` 可实时查看全局 OpenAI、Claude、Gemini 等模型的 API 额度消耗，为 Agent 调度策略提供最佳的成本与速度模型选择。

---

## 📄 许可与致谢

- 本配置架构与 Agentic 工具链完全致谢前 Meta / Microsoft L8 Principal 工程师 **[Kun Chen](https://github.com/kunchenguid)** 开源的 Agentic Engineering 体系。
