---
title: '🤝 为代理公司（The Agency）做贡献'
---

# 🤝 为代理公司（The Agency）做贡献

首先，感谢你考虑为代理公司（The Agency）做贡献！正是像你这样的人，让这套 AI 智能体集合对每个人都变得更好。

## 📋 目录

- [行为准则](#-行为准则)
- [我能如何贡献](#-我能如何贡献)
- [智能体设计指南](#-智能体设计指南)
- [Pull Request 流程](#-pull-request-流程)
- [风格指南](#-风格指南)
- [社区](#-有疑问)

---

## 📜 行为准则

本项目及所有参与者都受我们的行为准则约束。参与即表示你同意维护这一准则：

- **保持尊重**：以尊重的态度对待每个人。我们鼓励健康的辩论，但不容忍人身攻击。
- **保持包容**：欢迎并支持各种背景和身份的人。
- **保持协作**：我们一起创造的东西，好过各自单干。
- **保持专业**：让讨论聚焦于改进智能体和社区本身。

---

## 🎯 我能如何贡献

### 1. 创建新智能体

有了一个专业智能体的点子？太好了！按下面的步骤添加：

1. **Fork 仓库**
2. **选择合适的部门**——或者提议一个新部门。部门是智能体目录的顶层（如
   `engineering/`、`security/`、`gis/`、`marketing/`、`finance/`……）；
   浏览一下，找到你的智能体该放哪里。带标签、图标和颜色的权威清单在仓库根目录的
   [`divisions.json`](/divisions.json)里，永远保持最新。

   > **部门由 `divisions.json`（仓库根目录）定义**——这是部门集合的唯一事实来源，
   > 由 CI 里的 `scripts/check-divisions.sh` 校验。**提议一个新部门**意味着：
   > 创建目录、在 `divisions.json` 里加一条（label/icon/color）、并把它加进
   > `scripts/convert.sh` 和 `scripts/lint-agents.sh` 两个文件里的 `AGENT_DIRS`。
   > 这几处不一致、或目录里一个智能体文件都没有，检查就会让构建失败。
   >
   > 注意：`strategy/`（NEXUS playbooks/runbooks——没有智能体 frontmatter）和
   > `integrations/`（由 `convert.sh` 生成的各工具产物）**不是**部门，
   > 绝不能加进部门列表。

3. **按下面的模板创建你的智能体文件**
4. **在真实场景中测试你的智能体**
5. **提交一个包含该智能体的 Pull Request**

### 2. 改进现有智能体

找到了让某个智能体变得更好的方法？欢迎贡献：

- 补充真实案例和使用场景
- 用现代模式增强代码示例
- 根据新的最佳实践更新工作流程
- 增加成功指标和基准
- 修正笔误、提升清晰度、完善文档

### 3. 分享成功案例

用这些智能体取得了成功？分享你的故事：

- 在 [GitHub Discussions](https://github.com/msitarzewski/agency-agents/discussions) 发帖
- 在 README 里加一个案例研究
- 写一篇博文并附上链接
- 制作一个视频教程

### 4. 报告问题

发现了问题？告诉我们：

- 先看看这个问题是否已有人报过
- 提供清晰的复现步骤
- 说明你的使用场景背景
- 有想法的话，顺便提出潜在解决方案

---

## 🎨 智能体设计指南

### 智能体文件结构

每个智能体都应遵循以下结构：

```markdown
---
name: Agent Name
description: One-line description of the agent's specialty and focus
color: colorname or "#hexcode"        # see the note below — not any name works
emoji: 🎯
vibe: One-line personality hook — what makes this agent memorable
services:                              # optional — only if the agent requires external services
  - name: Service Name
    url: https://service-url.com
    tier: free                         # free, freemium, or paid
---

# Agent Name

## 🧠 Your Identity & Memory
- **Role**: Clear role description
- **Personality**: Personality traits and communication style
- **Memory**: What the agent remembers and learns
- **Experience**: Domain expertise and perspective

## 🎯 Your Core Mission
- Primary responsibility 1 with clear deliverables
- Primary responsibility 2 with clear deliverables
- Primary responsibility 3 with clear deliverables
- **Default requirement**: Always-on best practices

## 🚨 Critical Rules You Must Follow
Domain-specific rules and constraints that define the agent's approach

## 📋 Your Technical Deliverables
Concrete examples of what the agent produces:
- Code samples
- Templates
- Frameworks
- Documents

## 🔄 Your Workflow Process
Step-by-step process the agent follows:
1. Phase 1: Discovery and research
2. Phase 2: Planning and strategy
3. Phase 3: Execution and implementation
4. Phase 4: Review and optimization

## 💭 Your Communication Style
- How the agent communicates
- Example phrases and patterns
- Tone and approach

## 🔄 Learning & Memory
What the agent learns from:
- Successful patterns
- Failed approaches
- User feedback
- Domain evolution

## 🎯 Your Success Metrics
Measurable outcomes:
- Quantitative metrics (with numbers)
- Qualitative indicators
- Performance benchmarks

## 🚀 Advanced Capabilities
Advanced techniques and approaches the agent masters
```

**关于 `color`**。`#RRGGBB` 值总是可用。颜色*名称*只有在
`scripts/convert.sh` 里的 `resolve_opencode_color()` 认识它时才有效——
其他名称会在 OpenCode 集成里被悄悄改写成 grey，让人误以为是一种选择
而不是一个错误。`scripts/lint-agents.sh` 直接从转换器里读取那份名单，
拒绝不在名单里的名称，并打印出可用的名称。想用新名称，
就在同一个 PR 里把它加进那个映射表。

### 智能体结构

智能体文件分成两个语义组，对应 OpenClaw 的工作区格式，
也帮助其他工具解析你的智能体：

#### 人格（智能体是谁）
- **身份与记忆**——角色、性格、背景
- **沟通风格**——语气、声线、方式
- **关键规则**——边界与约束

#### 运作（智能体做什么）
- **核心使命**——主要职责
- **技术交付物**——具体产出和模板
- **工作流程**——分步方法论
- **成功指标**——可度量的结果
- **高级能力**——专业技术

不需要特殊格式——只要把人格相关的章节（身份、沟通、规则）与
运作章节（使命、交付物、流程、指标）分开归组即可。`convert.sh`
脚本会根据这些章节标题，自动把智能体拆分成各工具专用的格式。

### 智能体设计原则

1. **🎭 鲜明性格**
   - 给智能体一个独特的声音和个性
   - 不要"我是一个乐于助人的助手"——要具体、要让人记得住
   - 例："我默认找出 3-5 个问题并要求视觉证据"（Evidence Collector）

2. **📋 清晰的交付物**
   - 提供具体的代码示例
   - 附上模板和框架
   - 展示真实产出，而不是含糊的描述

3. **✅ 成功指标**
   - 给出具体、可度量的指标
   - 例："3G 网络下页面加载时间低于 3 秒"
   - 例："各账号合计 10,000+ karma"

4. **🔄 经过验证的工作流程**
   - 分步骤的流程
   - 经过真实检验的方法
   - 不是纸上谈兵——是实战打磨过的

5. **💡 学习记忆**
   - 智能体能识别哪些模式
   - 它如何随时间进步
   - 它在会话之间记得什么

### 外部服务

智能体可以依赖外部服务（API、平台、SaaS 工具），
前提是这些服务对智能体的功能不可或缺。依赖它们时：

1. **在 frontmatter 里用 `services` 字段声明依赖**
2. **智能体必须自己立得住**——把 API 调用剥掉，
   底下仍然应该有一个有用的人格、流程和专业能力
3. **不要复制厂商文档**——引用它们，别照抄。
   智能体文件读起来应该像一个智能体，而不是一份入门指南
4. **优先选择有免费档的服务**，方便贡献者测试这个智能体

检验标准：*这个智能体是给用户用的，还是给厂商用的？*借助某项服务
解决用户问题的智能体属于这里；而穿着智能体外衣的服务快速上手指南
不属于。

### 各工具的兼容性

**Qwen Code 兼容性**：智能体正文支持 `${variable}` 模板化来注入动态上下文（如 `${project_name}`、`${task_description}`）。Qwen 子智能体使用极简 frontmatter：只要求 `name` 和 `description`；`color`、`emoji` 和 `version` 字段会被省略，因为 Qwen 用不到它们。

**Codex 兼容性**：Codex 自定义智能体生成为独立的 TOML 文件。Codex 集成保持极简的 1:1 映射：`name` 和 `description` 从 frontmatter 原样复制，Markdown 正文变成 `developer_instructions`。仅源文件使用的元数据（如 `color`、`emoji`、`vibe` 等不支持的 frontmatter 字段）会被省略。

### 新增工具集成

想让 agency-agents 安装进一个新工具（某个 CLI、编辑器或智能体运行时）？先**[开一个 Discussion](https://github.com/msitarzewski/agency-agents/discussions)**——新增集成平台属于"先讨论再动手"的变更（见下文 PR 流程）。达成一致之后，一个干净的集成其实很小——通常**约 5 个文件，且绝不包含转换产物本身**。刚合并的 Mistral Vibe 集成就是一个可以照抄的好例子。

仓库根目录的 `tools.json` 是工具集合的唯一事实来源，`scripts/check-tools.sh`（CI）会在下列任何一处对不上时让构建失败。跑一下它——它会点名所有必须对齐的地方。

**清单：**

1. **`tools.json`**——新增一条，包含 `id`、`label`、`kebab`、`format`、`installKind`、`dest`，以及 detect/version/scope 与展示字段。如果你的工具渲染出的文件与另一个工具逐字节相同，就**复用已有的 `format`**（例如消费 `SKILL.md` 的工具共享 `"format": "skill-md"`——不需要新渲染器）。把 `installKind` 设为 `per-agent`、`roster` 或 `plugin`。除非 [app](https://github.com/msitarzewski/agency-agents-app) 为它内置了品牌 SVG，否则把 `icon` 设为 `null`。
2. **`scripts/convert.sh`**——新增一个 `convert_<tool>()`（或复用共享的 `format` 渲染器），并把它接进工具列表和 `--help`。
3. **`scripts/install.sh`**——新增一个 `install_<tool>()`，并在 `ALL_TOOLS`、检测/标注逻辑和 `--help` 里注册。
4. **`.gitignore`**——为你的工具在 `integrations/<tool>/` 下的生成产物加一条规则。**这一步必做且极易遗漏**。转换出的智能体/技能文件由 `convert.sh` 在本地生成，**绝不提交**（见下文"一律关闭的 PR"）——被跟踪的只有 `integrations/<tool>/README.md`。照抄一条现有的按工具条目即可。
5. **`integrations/<tool>/README.md`**——这个集成的简短文档（每个工具都有一份，是该工具目录里唯一被跟踪的文件）。
6. **跑 `./scripts/check-tools.sh`**——必须通过。它会交叉校验 `tools.json` 与 `install.sh`、`convert.sh`，并标记任何缺失项。
7. **跑 `./scripts/test-install.sh`**——必须通过。它把安装器装进一次性的
   沙箱（绝不会碰你真实的 `$HOME`），并固定住安装器的可观察
   契约：文件落在哪里、`--path` 优先于该工具的环境变量、
   `--division` / `--agent` / `--agents-file` 过滤、`--dry-run` 不写
   任何东西，以及带空格的路径能否存活。CI 在 Linux 和 macOS 上跑它。
8. **跑 `./scripts/test-convert-outputs.sh`**——必须通过。它把
   每个工具的输出重新生成到一个临时目录，检查的是*产物*而不是
   语法：每个智能体的 description 完整往返、每个生成文件都能被
   真正的 YAML/TOML 解析器解析、每个工具对每个智能体恰好产出一个
   输出文件，以及每个源文件按桌面应用读取的方式解析。
   当你有意修改过某个转换器时，它会在该工具那一行报告 **manifest drift**
   ——这是预期中的。看一眼改了什么，用 `--update` 再跑一次，
   然后提交刷新后的 `scripts/convert-outputs.sha256`，让评审者一眼
   看清影响范围。manifest 每个智能体一行、每个工具一行，其哈希在
   所有平台一致（正斜杠路径、LF 行尾），所以 Windows checkout 出的
   也是同一个文件。CI 在每个 PR 上跑它。

如果你的 PR 提交了转换产物（生成的 `integrations/<tool>/*` 文件），CI 和评审会要求你删掉它，改成加 `.gitignore` 规则。

### 什么样的智能体才算优秀

**优秀智能体的特质**：
- ✅ 窄而深的专业化
- ✅ 鲜明的性格和声音
- ✅ 具体的代码/模板示例
- ✅ 可度量的成功指标
- ✅ 分步骤的工作流程
- ✅ 真实场景下的测试与迭代

**要避免**：
- ❌ 千篇一律的"乐于助人的助手"人格
- ❌ 含糊的"我会帮助你……"式描述
- ❌ 没有代码示例或交付物
- ❌ 范围过宽（样样通、样样松）
- ❌ 未经测试的纸上谈兵

---

## 🔄 Pull Request 流程

### PR 里该放什么（以及不该放什么）

最快被合并的 PR 是**一个 markdown 文件**——一个新增或改进的智能体。这就是最佳甜点区。

超出这个范围的，我们这样保持顺畅：

#### 随时欢迎以 PR 形式提交
- 新增一个智能体（一个 `.md` 文件）
- 改进现有智能体的内容、示例或性格
- 修正笔误或让文档更清晰

#### 先发起 Discussion
- 新的工具链、构建系统或 CI 工作流
- 架构级变更（新目录、新脚本、站点生成器）
- 牵动仓库里大量文件的变更
- 新的集成格式或平台

我们欢迎雄心勃勃的想法——开一个 [Discussion](https://github.com/msitarzewski/agency-agents/discussions) 只是在写代码之前，给社区一个就方案达成一致的机会。这为所有人省时间，尤其是为你。

#### 一律关闭的 PR
- **提交构建产物**：生成的文件（`_site/`、编译产物、转换后的智能体文件）绝不应入库。用户在本地跑 `convert.sh`，其输出已被 gitignore。新增工具时，加那条 `.gitignore` 规则是你的职责——见[新增工具集成](#新增工具集成)。
- **未经事先讨论就批量修改现有智能体的 PR**——哪怕出于好意的重排格式，也会给其他贡献者制造合并冲突。
- **近似重复的"换皮"**：新智能体只是对现有某个智能体做查找替换（比如换一个国家名或平台名），而不是真正的新专家。提交前先跑 `scripts/check-agent-originality.sh`——CI 会自动跑它。

### 提交前

1. **测试你的智能体**：在真实场景中使用，根据反馈迭代
2. **遵循模板**：与现有智能体的结构保持一致
3. **补充示例**：至少包含 2-3 个代码/模板示例
4. **定义指标**：给出具体、可度量的成功标准
5. **校对**：检查笔误、格式问题、清晰度
6. **确认原创**：跑 `./scripts/check-agent-originality.sh path/to/your-agent.md`。它会拿你的智能体与整个名册（roster）比对，标记近似重复（换个国家名/平台名骗不过它）。新智能体应该是真正的新——如果你在做某个市场的本地化，就让平台、战术和示例真正不同，而不是查找替换。
7. **确认它能完好穿过每个工具**：跑 `./scripts/test-convert-outputs.sh`。它会重新生成每个工具的输出，确认你的智能体在每个转换器下都安然无恙——description 完整往返、文件可解析、没有内容丢失——并且它的 frontmatter 能按桌面应用读取的方式解析。新增或编辑智能体会改变生成产物，所以它会报告点名你智能体的 **manifest drift**——这是预期内的，且在 PR 上它是**提示性**的：CI 会打印但不会因此失败。你完全不用动 `scripts/convert-outputs.sha256`；维护者会在你的 PR 合并时重新生成它。（如果你跑了 `--update`，也没问题——manifest 每个智能体一行，不会和其他人的 PR 冲突，而且哈希在 Windows、macOS 和 Linux 上一致。）

说说这些检查为什么存在。人们在这些智能体之上构建着真正了不起的东西，每天都有成千上万的人通过十几种工具使用它们。这很棒——但也意味着某一个转换器里的小小闪失、某一个文件里一个走丢的引号，会同时悄无声息地波及所有这些人。在本地跑这套检查，就是我们让下游每一个人都保持顺滑的方式。大约一分钟，它意味着你的成果原样抵达每一个工具、每一个人手里，和你写下的一模一样。谢谢你多走的这一步——这是对你永远不会见面的人的实实在在的善意。

### 提交你的 PR

1. **Fork** 仓库
2. **创建分支**：`git checkout -b add-agent-name`
3. **做出修改**：加入你的智能体文件
4. **提交**：`git commit -m "Add [Agent Name] specialist"`
5. **推送**：`git push origin add-agent-name`
6. **开一个 Pull Request**，附上：
   - 清晰的标题："Add [Agent Name] - [Category]"
   - 这个智能体做什么的描述
   - 为什么需要这个智能体（使用场景）
   - 你做过的任何测试

### PR 评审流程

1. **社区评审**：其他贡献者可能会给出反馈
2. **迭代**：处理反馈并做出改进
3. **批准**：维护者会在就绪时批准
4. **合并**：你的贡献成为代理公司的一部分！

### PR 模板

```markdown
## Agent Information
**Agent Name**: [Name]
**Category**: [engineering/design/marketing/etc.]
**Specialty**: [One-line description]

## Motivation
[Why is this agent needed? What gap does it fill?]

## Testing
[How have you tested this agent? Real-world use cases?]

## Checklist
- [ ] Original — not a near-duplicate (ran `scripts/check-agent-originality.sh`)
- [ ] Follows agent template structure
- [ ] Includes personality and voice
- [ ] Has concrete code/template examples
- [ ] Defines success metrics
- [ ] Includes step-by-step workflow
- [ ] Proofread and formatted correctly
- [ ] Tested in real scenarios
```

---

## 📐 风格指南

### 写作风格

- **要具体**：写"把页面加载时间降低 60%"，不写"让它变快"
- **要落地**：写"用 TypeScript 创建 React 组件"，不写"做 UI"
- **让人记得住**：给智能体性格，别用千篇一律的公司腔
- **要实用**：给出真实代码，而不是伪代码

### 排版格式

- 一致地使用 **Markdown 格式**
- 为章节标题加 **emoji**（便于扫读）
- 所有代码示例都使用**代码块**，并配正确的语法高亮
- 比较选项或展示指标时用**表格**
- 强调用**加粗**，技术名词用 `code`

### 代码示例

```markdown
## Example Code Block

\`\`\`typescript
// Always include:
// 1. Language specification for syntax highlighting
// 2. Comments explaining key concepts
// 3. Real, runnable code (not pseudo-code)
// 4. Modern best practices

interface AgentExample {
  name: string;
  specialty: string;
  deliverables: string[];
}
\`\`\`
```

### 语气

- **专业但亲切**：不过分正式，也不过分随意
- **自信但不傲慢**：说"这是最好的方案"，而不是"也许你可以试试……"
- **有帮助但不手把手**：假设对方有能力，提供深度
- **性格驱动**：每个智能体都该有独一无二的声音

---

## 🌟 表彰

做出重要贡献的贡献者将：

- 被列入 README 致谢部分
- 在发布说明中被突出提及
- 进入"每周智能体"展示（如适用）
- 在智能体文件本身中获得署名

---

## 🤔 有疑问？

- **一般问题**：[GitHub Discussions](https://github.com/msitarzewski/agency-agents/discussions)
- **Bug 报告**：[GitHub Issues](https://github.com/msitarzewski/agency-agents/issues)
- **功能请求**：[GitHub Issues](https://github.com/msitarzewski/agency-agents/issues)
- **社区交流**：[加入我们的讨论](https://github.com/msitarzewski/agency-agents/discussions)

---

## 📚 资源

### 给新贡献者

- [README.md](/catalog/)——总览与智能体目录
- [示例：Frontend Developer](/engineering/engineering-frontend-developer/)——结构良好的智能体示例
- [示例：Reddit Community Builder](/marketing/marketing-reddit-community-builder/)——出色性格示例
- [示例：Whimsy Injector](/design/design-whimsy-injector/)——创意型专家示例

### 给智能体设计

- 读现有智能体找灵感
- 研究行之有效的模式
- 在真实场景中测试你的智能体
- 根据反馈迭代

---

## 🎉 谢谢你！

你的贡献让代理公司对每个人都更好。无论你是在：

- 新增智能体
- 改进文档
- 修 bug
- 分享成功案例
- 帮助其他贡献者

**你都在带来改变**。谢谢你！

---

<div align="center">

**有问题？有想法？有反馈？**

[开一个 Issue](https://github.com/msitarzewski/agency-agents/issues) • [发起一个 Discussion](https://github.com/msitarzewski/agency-agents/discussions) • [提交 PR](https://github.com/msitarzewski/agency-agents/pulls)

由社区用 ❤️ 打造

</div>