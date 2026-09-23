# Kun 的 Agentic 开发环境 - 工具清单核实记录

> ## ⚠️ 历史快照，不是现状
>
> 这份文档是 2026-09-19/20 搭建期间的调研记录，**只作归档保留，不要拿它判断当前状态**。
> 已知与现状不符的地方：
>
> - 第六节列为「未装」的 `gh-axi` / `gnhf` / `chrome-devtools-axi` / `lavish-axi` / `backpass` 现在全部已装
> - 文中描述的 git submodule + 源码编译路线**已经放弃**，现在统一按各工具官方方式从上游安装，本仓库不再有 `.gitmodules`
>
> 当前的工具链清单、安装方式和取舍，一律以 [`README.md`](../README.md) 的「Agent 工具链」一节为准。

> 更新时间：2026-09-19（此后未再维护）
> 目的：复刻 Kun（GitHub: kunchenguid）的完整 AI 编程开发环境到 Mac mini，并同步更新 Jasontopia 自己的 dotfiles
> 状态：**第一轮信息核实**，部分仓库细节尚未抓取完整原文

---

## 一、身份信息

- GitHub 账号：`github.com/kunchenguid`（77 个仓库，6.2k followers）
- 简介：Former L8 engineer at Meta, Microsoft, Atlassian；目前是 Atlassian Lead Principal Engineer，主导 Rovo Dev（Atlassian 的 AI coding agent）
- 其他阵地：Substack（kunchenguid.com）、X @kunchenguid、Discord、LinkedIn

---

## 二、核心仓库清单与核实状态

| 仓库 | 一句话定位（官方原话） | Star | 核实状态 |
|---|---|---|---|
| [`firstmate`](https://github.com/kunchenguid/firstmate) | "Talk to one agent. Ship with a crew." | 6.7k | ✅ README 已读，详见下方 |
| [`no-mistakes`](https://github.com/kunchenguid/no-mistakes) | "git push no-mistakes" | 8.6k | ⚠️ 仅从 PR 间接了解，README 原文未读 |
| [`lavish-axi`](https://github.com/kunchenguid/lavish-axi) | "HTML is the new markdown. Lavish is the new editor for your HTML artifacts." | 3.8k | ❌ 未读 |
| [`backpass`](https://github.com/kunchenguid/backpass) | "You don't write AGENTS.md. You train it with gradient descent." | 1.1k | ❌ 未读，视频资料完全没提过，需确认是否要复刻 |
| [`dotfiles`](https://github.com/kunchenguid/dotfiles) | "Kun's dotfiles for agentic engineering" | 622 | ✅ 与你上传的文档2一致，已确认为真实内容 |
| [`kun`](https://github.com/kunchenguid/kun) | "Think and build like a principal engineer. Leverage Kun's experience, knowledge, tools, workflows, and skills." | 348 | ❌ **未能抓取到内容**，怀疑是整合所有方法论的总纲仓库，**优先级最高，需要你直接打开看一眼或告诉我怎么访问** |
| [`quota-axi`](https://github.com/kunchenguid/quota-axi) | "Allow your agents to see your LLM subscription quota windows." | 16 | ✅ README 已读，详见下方 |
| [`axi`](https://github.com/kunchenguid/axi) | "Design principles for agent ergonomics. Higher accuracy with lower token cost than both MCP and regular CLI." | 763 | ❌ 未读，但这是一个设计规范/协议，quota-axi 等工具都基于它 |
| [`chrome-devtools-axi`](https://github.com/kunchenguid/chrome-devtools-axi) | "The most agent-ergonomic browser automation" | 67 | ❌ 未读，对应视频2里提到的"Chrome DevTools Axi" |
| [`gnhf`](https://github.com/kunchenguid/gnhf) | "Before I go to bed, I tell my agents: good night, have fun" | 591 | ❌ 未读，对应视频1里的"Good Night Have Fun" |
| `treehouse` | Git worktree 隔离工具，已迭代到 v1.8.0（支持 lease 机制） | 未知 | ⚠️ 确认存在（在 firstmate 的 PR 里被引用），但**没在 pinned 列表里**，仓库归属账号待确认（可能不在 kunchenguid 账号下，是被 firstmate 依赖的外部工具） |
| `herdr` | 终端多路复用器 | — | ⚠️ 在 firstmate 最新 README 中被列为「experimental」可选终端之一（与 zellij / cmux / Orca 并列），**不是必装项**，这点和你最早给我的文档1（说是必装核心组件）不一致，需要你确认最新版视频里的说法 |

---

## 三、已核实的关键信息

### firstmate（大副调度系统）

- **本质定位**：官方原话强调它「不是模型、不是 harness、不是 skill、不是 MCP server、不是 CLI」，而是一个 **"agent distro"**（智能体发行版）——一个装了 `AGENTS.md` + 脚本 + 规范的文件夹
- **安装方式极简**：
  ```bash
  gh auth login
  git clone https://github.com/kunchenguid/firstmate
  cd firstmate
  ```
  然后在里面直接启动支持的 harness 之一：`claude`（Claude Code）/ `grok --trust`（Grok）/ `pi`（Pi）
- **三个"co-primary"推荐 harness**：Claude Code、Grok、Pi 三者并列推荐，用哪个取决于你的订阅和习惯。Codex 和 OpenCode 也支持，但被归类为"harness-specific tradeoffs 更多"的次选
- **核心概念**：
  - **Ship task**（交付任务）vs **Scout task**（调研/审计任务，只产出报告不改代码）
  - **项目交付模式**：`no-mistakes`（严格门禁）/ `direct-PR`（轻量直接合并）/ `local-only`（本地不推）三选一，外加可选的 `+yolo` 自主标志
  - **Secondmate（二副）**：可选的持久化二级调度器，拥有独立的 `FM_HOME`，管理自己的项目子集
  - 每个任务运行在独立的 **treehouse worktree** 中，避免并行任务冲突

### quota-axi（额度监控）

- **实际功能比视频描述的更具体**：不是一个笼统的"监控面板"，而是一个 **命令行工具**，核心命令就是 `npx -y quota-axi`
- 支持的模型/工具：**Claude、Codex、Cursor、GitHub Copilot、Grok** 五个提供方
- **设计哲学**：只读数据，绝不做路由/推荐/代理/登录/改状态；本地读取各家官方的额度接口，不经过第三方中转
- **安装方式**：推荐用 [`npx skills`](https://github.com/vercel-labs/skills) 把它装成一个 **Agent Skill**（而不是全局装 CLI）：
  ```bash
  npx skills add kunchenguid/quota-axi --skill quota-axi -g
  ```
  这样你的 Agent（比如 Claude Code）会在需要时自己调用它，不需要你手动预装
- **macOS 用户注意**：Claude Code 的 token 存在 macOS Keychain 里，quota-axi 第一次读取需要你手动批准一次 Keychain 授权（`--allow-keychain-prompt`，选 "Always Allow"），之后就能一直自动读取

### dotfiles（主仓库）

- 已确认这是 **Kun 本人的真实公开仓库**，内容与你上传的文档2一致
- 技术栈：nix-darwin + home-manager，一条 `./bootstrap.sh` 命令搞定新机器
- **只负责系统层**：系统设置、Homebrew、Nix 用户包（ripgrep/fd/fzf/jq/lazygit/Neovim）、Zsh、Starship、Neovim（rose-pine 主题）、WezTerm、以及一份 Claude/Codex/opencode 共用的 `AGENTS.md`
- **不包含** `firstmate`/`no-mistakes`/`treehouse`/`quota-axi` 的源码——这些是独立仓库，dotfiles 里大概率只是引用/声明依赖，不是把源码放进去

---

## 四、悬而未决、需要你确认或补充的问题

1. **`kun` 这个仓库**——我没能抓到内容，这很可能是最关键的一份资料（总纲性质）。麻烦你直接打开 `github.com/kunchenguid/kun` 看一眼，把 README 内容复制给我，或者告诉我这个仓库是不是私有/需要登录才能看
2. **`backpass` 仓库**——"你不写 AGENTS.md，而是用梯度下降训练它"，这个概念很新颖但完全没出现在你给我的四份视频资料里。这个是否也是你要复刻范围内的东西？还是它是独立于这套 Setup 之外的另一个工具？
3. **`herdr` 的定位变化**——最新版 firstmate README 把它列为可选项之一，不再是必装组件。这和你视频资料/文档1的描述有出入，需要确认这是不是 Kun 后期迭代改变了推荐方案
4. **`treehouse` 的真实仓库地址**——目前只在 firstmate 的 PR 引用里看到它，没有在 kunchenguid 账号的置顶列表里找到独立仓库，需要单独确认它现在挂在哪个地址下（有可能因为迭代升级重新独立仓库化了，也可能仍在 kunchenguid 账号但没置顶）

---

## 五、【已收尾】第一轮悬而未决问题的解答

1. `kun` 仓库、`treehouse` 独立仓库、`backpass` —— 均已由用户手动加入 Project Knowledge，内容确认属实
2. `herdr` —— 用户确认：**仍是必装项**，最新版 firstmate README 虽把它列为 experimental 可选项之一，但不影响必装决定
3. Claude Code 是否原生读取 `AGENTS.md` —— 已查证官方文档（code.claude.com）：**否**，Claude Code 只读 `CLAUDE.md`，需要 `@AGENTS.md` 导入语法或 symlink 才能兼容；这不影响 `backpass` 的必要性，两者解决的是不同问题（读取机制 vs 内容生产）

## 六、Mac mini 现状 diff（2026-09-20 完成）

**已装、状态良好**：
- 系统层：`nix` / `darwin-rebuild` / `brew` / `git` / `gh` / `herdr` 全部就绪
- `firstmate`（submodule 方式，自带 609 行 `AGENTS.md` ——这是"大副角色的调度契约"，随仓库自带，不需要用户自己写）
- `treehouse` / `no-mistakes` / `quota-axi`（均为 git submodule + 源码编译进 `firstmate/bin/`，**不是官方 README 推荐的 `npx skills` 方式**，两种方式都可行，但编译方式的版本不会随官方更新自动同步，后续需要手动 `git submodule update` + 重新编译）
- 全局 `AGENTS.md`（`~/dotfiles/home/AGENTS.md`，17 行骨架）—— **确认属于两层架构中的"全局层"，与 firstmate 自带的"大副契约层"分工不同，骨架化是合理状态，不是缺失**
- `~/.claude/skills/synced/` —— 确认是 Claude 官方 Skills 同步机制的产物（docx/pdf/pptx 等文档技能 + 用户自定义技能），**与 Kun 工具链完全无关**，排除

**确认未装、是下一阶段的任务**：
- ❌ `gh-axi`
- ❌ `gnhf`
- ❌ `chrome-devtools-axi`
- ❌ `lavish-axi`
- ❌ `backpass`

`.gitmodules` 里目前只登记了 `firstmate`/`treehouse`/`no-mistakes`/`quota-axi` 四个，上述 5 个从未被纳入过复刻范围操作，需要在下一阶段规划怎么装（继续走 submodule+编译路线，还是改用官方推荐的 `npx skills` 方式，这个决策留到下一阶段）。

## 七、这个 Chat 的任务到此收尾

"资料核实 + 现状 diff" 阶段完成。下一阶段（排装机顺序、决定安装方式、逐条讲解、处理报错）建议开新 Chat 进行，标题类似「安装 gh-axi/gnhf/chrome-devtools-axi/lavish-axi/backpass」。新 Chat 依托这份 Project Knowledge 即可继承全部背景，无需重新解释。
