// 端到端实战教程。每篇用真实的技能包走完一个完整工作流：
// 命令与 agent-skills 仓库里的技能精确对应，每一步都可在
// Claude Code、Codex 或任意智能体里直接运行。prompt 字段是
// 可复制进智能体的功能性输入，保持英文原文（同 SKILL.md 逻辑）。

export interface Step {
  n: string;
  title: string;
  /** 对应的 Claude Code 斜杠命令（如有）。 */
  command?: string;
  /** 本步练到的技能 slug（链接到技能目录）。 */
  skill?: string;
  /** 可复制、与工具无关的提示词，在任何智能体里都能用。 */
  prompt: string;
  /** 智能体会做什么、你会看到什么。 */
  does: string;
  /** 这一步的价值所在。 */
  why: string;
  /** 怎么确认这一步完成、可以进入下一步。 */
  checkpoint?: string;
  /** 可选的“更快路径”提示，例如用 /build auto 跳过逐切片推进。 */
  tip?: string;
}

export interface Tutorial {
  slug: string;
  order: number;
  level: string;
  title: string;
  scenario: string;
  summary: string;
  time: string;
  difficulty: string;
  hue: number;
  /** 复用现有图示作为头图。 */
  diagram: string;
  intro: string;
  prereqs: string[];
  steps: Step[];
  outcome: string;
  /** 技能 → 它帮你赢来了什么，用于收尾回顾。 */
  recap: { skill: string; got: string }[];
}

export const tutorials: Tutorial[] = [
  {
    slug: 'new-app',
    order: 1,
    level: '教程 01',
    title: '从一个空文件夹构建全新应用',
    scenario: '全新项目',
    summary:
      '用一个空目录走完整套技能包驱动的每个生命周期阶段，得到一个通过了测试、过了评审、随时能上线的应用。示例是一个读写 localStorage 的浏览器习惯打卡应用，完全本地运行，无需数据库。',
    time: '30–45 分钟',
    difficulty: '入门',
    hue: 205,
    diagram: 'lifecycle',
    intro:
      '你将构建一个小型习惯打卡应用：添加每日习惯、标记完成、看着连击天数增长。它完全跑在浏览器里，数据存 localStorage，不用装数据库也不用搭后端。代码不是你亲手写的——你驱动智能体走完定义、规划、构建、验证、评审、上线。规格需要选定技术栈时随便挑，哪怕是纯 HTML、CSS 和 JS。目标是体会每个技能能帮你赢来什么。',
    prereqs: [
      '已装好技能包：npx skills add addyosmani/agent-skills',
      '一个空目录，在 Claude Code 或 Codex 里打开',
      '一个浏览器和你喜欢的任意技术栈，纯 HTML、CSS、JS 也行',
    ],
    steps: [
      {
        n: '1',
        title: '写代码之前先压力测试这个想法',
        command: '/spec',
        skill: 'interview-me',
        prompt:
          'Interview me about a habit tracker I want to build. Ask one question at a time until you are ~95% sure what I actually want, then stop. Cover which habits, daily vs weekly, how a streak works, what a missed day does, and that data stays on this device.',
        does: '智能体一次只抛出一个聚焦的问题，意图没弄清楚之前拒绝开工。',
        why: '习惯打卡听起来一目了然，直到你撞上边界情况：连击怎么算、漏掉一天算什么、时区怎么办、数据是否只留在本机。现在多问几个问题，省掉日后一次重写。',
        checkpoint: '你有一段清晰的一段话描述，精确说明要构建什么。',
      },
      {
        n: '2',
        title: '写规格',
        command: '/spec',
        skill: 'spec-driven-development',
        prompt:
          'Follow the spec-driven-development skill. Write a SPEC.md for the habit tracker: objectives, the localStorage data model, the core screens and states, the streak rules, testing strategy, and explicit non-goals.',
        does: '智能体产出一份 SPEC.md，覆盖目标、数据结构、界面、连击规则、测试与边界。',
        why: '花几分钟审阅一份短计划，胜过日后在一千多行生成代码里追逐决策。数据模型和连击规则正是在任何界面出现之前就该钉死的东西。',
        checkpoint: 'SPEC.md 已存在，而且你认可它。不认可的地方当场改。',
      },
      {
        n: '3',
        title: '拆成小的、有序的任务',
        command: '/plan',
        skill: 'planning-and-task-breakdown',
        prompt:
          'Follow the planning-and-task-breakdown skill. Turn SPEC.md into small, verifiable tasks with acceptance criteria and dependency ordering: add a habit, mark a day done, compute streaks, show stats, persist to localStorage. Write them to tasks/plan.md.',
        does: '智能体把规格拆成薄薄的、可独立交付的任务，每条都有明确的完成标准。',
        why: '小任务才是你能实际验证的单元。它让智能体写不出那种你根本没法审阅的巨型整块代码。',
        checkpoint: 'tasks/plan.md 列出的任务，每条都能一口气落地。',
      },
      {
        n: '4',
        title: '构建第一个切片，测试先行',
        command: '/build',
        skill: 'test-driven-development',
        prompt:
          'Follow incremental-implementation and test-driven-development. Implement the first task: computing a streak from a list of completed dates. Write the failing test first, cover the edge cases (a missed day, today not done yet), make it pass, then commit.',
        does: '智能体为连击逻辑先写失败测试，实现到刚好通过为止，跑一遍，然后提交这个切片。',
        why: '连击的数学最藏 bug，所以最适合用测试驱动。每个切片都带着测试独立提交，坏的改动一次 revert 就能撤掉。',
        checkpoint: '连击测试全绿，切片已提交。',
        tip: '逐切片推进觉得慢？改用 /build auto，在一次经你批准的执行里实现整份计划。你批准一次方案，它就按任务推进到底，依然测试先行、逐任务提交，只在失败或风险步骤上暂停。之后在下面的“验证”阶段汇合继续。',
      },
      {
        n: '5',
        title: '设计存储契约与界面',
        skill: 'api-and-interface-design',
        prompt:
          'Design the localStorage module contract first: load, save, the data schema, and what happens when stored data is missing or from an older version. Then build a minimal, accessible UI: a list of habits, a way to mark today done, and a streak display. Keep it production-quality.',
        does: 'api-and-interface-design 和 frontend-ui-engineering 技能会为这些任务自动激活。',
        why: '干净的存储契约把持久化逻辑挡在界面之外，而懂 WCAG 的组件恰恰是智能体最容易偷工减料的地方。技能把底线守住，产出才不会是 AI 味的粗糙工程。',
        checkpoint: '你能添加一个习惯、在浏览器里标记完成，连击数字会更新。',
      },
      {
        n: '6',
        title: '用真实运行时数据证明它能跑',
        command: '/test',
        skill: 'browser-testing-with-devtools',
        prompt:
          'Run the full test suite. Then verify in a real browser: mark a habit done, confirm the streak updates in the DOM, and reload to confirm it persisted in localStorage. If you have the Chrome DevTools MCP configured, browser-testing-with-devtools will capture the DOM and network for you; if not, click through it yourself.',
        does: '智能体跑完全套测试；若配置了 Chrome DevTools MCP 就用它抓取浏览器证据，否则带你手动走一遍检查。',
        why: '“看起来没问题”永远不够。你要亲眼看到连击更新、刷新之后数据还在，这才是证据。配置了 MCP 时，browser-testing-with-devtools 技能把这步自动化。',
        checkpoint: '测试套件通过，而且你亲眼见过一个习惯经刷新后仍在。',
      },
      {
        n: '7',
        title: '宣布做完之前先评审',
        command: '/review',
        skill: 'security-and-hardening',
        prompt:
          'Follow code-review-and-quality across all five axes, then run security-and-hardening focused on rendering user-entered habit names safely (no XSS) and on validating data loaded from localStorage, which is untrusted and can be tampered with or corrupted.',
        does: '智能体评审正确性、可读性、架构、安全与性能，并加固用户输入与存储数据的处理方式。',
        why: '习惯名是渲染进页面的用户输入，是经典的 XSS 陷阱；localStorage 则是不可信边界。这一步在用户之前把两个坑都堵上。',
        checkpoint: '评审发现全部处理，名称已转义，坏的存储数据不会弄崩应用。',
      },
      {
        n: '8',
        title: '用放行 / 叫停结论来上线',
        command: '/ship',
        skill: 'shipping-and-launch',
        prompt:
          'Follow the shipping-and-launch skill. Produce a pre-launch checklist, put a new habit-type behind a feature flag, plan a deploy to any static host, and write the rollback steps. Then give me a go or no-go.',
        does: '智能体跑一遍发布前清单，配置功能开关和带回滚的静态部署方案，并给出不掺水的建议。',
        why: '上线是一个决策，不是一种感觉。静态应用也配得上一份清单、一个可逆的开关和一条回滚路径，然后由你拍板。',
        checkpoint: '你拿到一条放行 / 叫停结论，和一份你信得过的回滚方案。',
      },
    ],
    outcome:
      '一个能跑、过了测试、过了评审的习惯打卡应用，完全跑在浏览器里并记住你的连击，还带上那些让这一切变得安全的产物：SPEC.md、任务计划、测试和一份发布清单。你在每个阶段评审的都是决策，而不是最后面对一整面代码墙。',
    recap: [
      { skill: 'spec-driven-development', got: '一份几分钟就能审完的方案' },
      { skill: 'planning-and-task-breakdown', got: '可验证的单元，而不是一坨巨石' },
      { skill: 'test-driven-development', got: '连击数学被证明正确' },
      { skill: 'security-and-hardening', got: 'XSS 与坏数据被赶在用户之前抓住' },
      { skill: 'shipping-and-launch', got: '一次可逆、有清单的发布' },
    ],
  },
  {
    slug: 'existing-app',
    order: 2,
    level: '教程 02',
    title: '给别人写过的代码库加功能',
    scenario: '存量项目',
    summary:
      '更真实的场景：在既有应用上安全地加一个功能。先让智能体摸透代码库，对着它的既有模式写规格，在陌生代码里做验证，再藏在功能开关后面落地。示例：给一个 API 加上限流。',
    time: '40–60 分钟',
    difficulty: '进阶',
    hue: 40,
    diagram: 'solo-workflow',
    intro:
      '带上你自己的仓库，或者克隆任意喜欢的开源应用。示例给一个既有 API 端点加限流，但这个骨架适用于任何存量系统里的任何功能。存量项目才是智能体最容易闯祸的地方，所以重点落在上下文、验证与可回滚上。',
    prereqs: [
      '已装好技能包：npx skills add addyosmani/agent-skills',
      '一个带测试套件的既有仓库，在 Claude Code 或 Codex 里打开',
      '心里有一个真实要加的功能（示例：某个端点加限流）',
    ],
    steps: [
      {
        n: '1',
        title: '先让智能体摸透代码库',
        skill: 'context-engineering',
        prompt:
          'Follow the context-engineering skill. Read this repo and write a short rules file (CLAUDE.md or AGENTS.md) capturing its conventions: structure, patterns, test commands, and the things a newcomer would get wrong.',
        does: '智能体勘察整个仓库，把它的约定记在今后每个会话都会读到的地方。',
        why: '智能体每次会话都是从零冷启动，用自信的猜测填补空白。把约定写下来一次，它就不会每个项目都从零推导你的工程，也不会发明出你根本没在用的“约定”。',
        checkpoint: '规则文件已存在，且与仓库的实际运作方式相符。',
      },
      {
        n: '2',
        title: '让方案落在真实文档上',
        skill: 'source-driven-development',
        prompt:
          'Follow source-driven-development. For adding rate limiting in this stack, verify the approach against the official docs of the framework and libraries in use, cite the sources, and flag anything you could not confirm.',
        does: '智能体去查框架文档，而不是凭记忆做模式匹配，并给出所用来源的引用。',
        why: '存量项目的依赖版本是钉死的。注明出处的决策能防止智能体伸手抓一个过时或错误的套路。',
        checkpoint: '拟采用的方案背后是可以点开看的引用。',
      },
      {
        n: '3',
        title: '对着既有模式给功能写规格',
        command: '/spec',
        skill: 'spec-driven-development',
        prompt:
          'Follow spec-driven-development, but scope it to a change inside this existing system. Spec rate limiting for one endpoint: where it hooks in, config, limits, error response, and what must not change.',
        does: '智能体写出一份聚焦的规格，贴合当前架构，而不是一套全新项目式的设计。',
        why: '这里的规格描述的是对一个活系统做的改动，包括绝对不能破坏的不变量。动工之前，你先评审决策。',
        checkpoint: '一份短规格，写明接入点与非目标。',
      },
      {
        n: '4',
        title: '碰生产代码之前先怀疑这个方案',
        skill: 'doubt-driven-development',
        prompt:
          'Apply doubt-driven-development to this plan. In fresh context, extract every non-trivial claim about how the existing code behaves, try to refute each one against the actual source, and reconcile.',
        does: '在改动落地之前，用一轮怀疑式评审重查方案里对既有代码行为的全部假设。',
        why: '在不是你写的代码里，一个自信的错误假设此刻抓很便宜，日后到生产里调试就很贵。',
        checkpoint: '对现状行为的假设已对照源码逐一确认。',
      },
      {
        n: '5',
        title: '先钉死现有行为，再切片构建',
        command: '/build',
        skill: 'incremental-implementation',
        prompt:
          'Follow incremental-implementation and test-driven-development. First add characterization tests that pin the endpoint’s current behavior, then add rate limiting behind a feature flag in thin, committed slices.',
        does: '智能体先用测试锁住现有行为，再把功能藏在开关后面增量加上。',
        why: '特征测试（characterization tests）让改动可观察，功能开关让改动可回滚。你改的是别人赖着运行的系统，两样都要。',
        checkpoint: '旧行为已钉死，新行为默认关着。',
        tip: '停太多次了？/build auto 会按一次批准扫完剩余任务，但依然在失败和风险步骤上暂停。在不是你写的代码里，风险最大的任务值得保留手动逐步推进，让 /build auto 只扫常规任务。',
      },
      {
        n: '6',
        title: '坏了就找根因',
        skill: 'debugging-and-error-recovery',
        prompt:
          'A test broke after the change. Follow debugging-and-error-recovery: reproduce it, localize it, reduce it to the smallest failing case, fix the root cause, and add a guard so it cannot regress.',
        does: '智能体做系统化分诊，而不是瞎猜修法。',
        why: '存量项目的故障都藏在角落里。一个守纪律的复现-定位-缩小-修复-设防回路，胜过反复试错。',
        checkpoint: '故障被理解并设防，不只是“看起来过了”。',
      },
      {
        n: '7',
        title: '把它当作对系统的改动来评审',
        command: '/review',
        skill: 'code-review-and-quality',
        prompt:
          'Follow code-review-and-quality. Keep the change near ~100 lines, check that it fits existing patterns, and run security-and-hardening on the new limits and error paths.',
        does: '智能体评审 diff 的正确性与贴合度，并加固新出现的面。',
        why: '存量项目的评审标准是“这个改动是否让系统更好、是否遵循它的既有约定”，而不是“这是不是我会从头重写的写法”。',
        checkpoint: '改动既小、又贴代码库、加固也做了。',
      },
      {
        n: '8',
        title: '藏在功能开关后面灰度放量',
        command: '/ship',
        skill: 'shipping-and-launch',
        prompt:
          'Follow shipping-and-launch. Plan a staged rollout using the feature flag, add the monitoring you would want on a rate limiter, and write the rollback. Give me a go or no-go.',
        does: '智能体规划一次渐进、带监控的放量，方案里有明确的回滚和建议。',
        why: '你先对一小部分流量打开开关，盯着信号，随时一键关掉。不提心吊胆就能改生产，靠的就是这个。',
        checkpoint: '一份分阶段放量方案，带监控与一键回滚。',
      },
    ],
    outcome:
      '一个功能合进了不是你写的系统：现有行为已被钉死、改动又小又可逆、放量全程可观察。同一套流程适用于任何存量项目的功能。',
    recap: [
      { skill: 'context-engineering', got: '智能体不再瞎猜你的规矩' },
      { skill: 'doubt-driven-development', got: '错误假设赶在生产之前抓住' },
      { skill: 'incremental-implementation', got: '又小又带开关、可逆的改动' },
      { skill: 'debugging-and-error-recovery', got: '挖到根因，而不是糊上一个测试' },
      { skill: 'shipping-and-launch', got: '一次随时能关的分阶段放量' },
    ],
  },
  {
    slug: 'loop-engineering',
    order: 3,
    level: '教程 03',
    title: '把技能装进一个回路',
    scenario: '回路工程',
    summary:
      '把技能包裹进一个小而安全的自动化回路：一个夜间任务修一件事、验证它，开一个短 PR 等你批准。技能是回路里的验证环节；外层回路归你。',
    time: '30–45 分钟',
    difficulty: '高级',
    hue: 145,
    diagram: 'inner-outer-loop',
    intro:
      '这篇教程要搭的是最小、不掺假的软件工厂：一个你睡觉时改进代码库、早上等你签字确认的回路。它与回路工程指南配套——指南讲理论，这里动手搭一个。范围故意保持得极小，因为一个回路只有当验证又便宜又难造假时才配得上自主权。',
    prereqs: [
      '已装好技能包，且先做完教程 01 或 02，流程已经顺手',
      '一个测试套件又快又可靠、带 linter 的仓库',
      '一种按计划运行的方式：Claude Code /loop、GitHub Actions cron，或 Codex Automations',
    ],
    steps: [
      {
        n: '1',
        title: '挑一个配得上无人值守的任务',
        skill: 'code-simplification',
        prompt:
          'Help me pick one narrow, high-frequency, hard-to-fake improvement to automate: for example, fixing a single lint violation or removing one needlessly optional prop per run. It must be verifiable by a green-or-red check.',
        does: '你和智能体一起选一个“做完”能被机器证明、而不只由机器断言的改动。',
        why: '反向压力：只自动化你能又便宜又可靠地验证的东西。一个便宜的判官，才让你敢放心走开。回路工程指南里有讲到该把哪些区域的灯一直开着。',
        checkpoint: '你选定了一个够小的任务，带通过 / 失败的判官（测试加 lint）。',
      },
      {
        n: '2',
        title: '定义制造者',
        command: '/build',
        skill: 'incremental-implementation',
        prompt:
          'Write a short instruction for a "maker" agent: find one instance of the target pattern, fix it following incremental-implementation and test-driven-development, run the tests and linter, and commit only if both pass.',
        does: '你把内层回路的工人固化为一段小而可重复的指令（一段提示词，或一个 SKILL.md）。',
        why: '制造者就是一份重复执行的单件工作：取上下文、动手、检查、提交。把它写下来一次，一次性运行才变成了回路。',
        checkpoint: '一份制造者指令，测试和 lint 不绿就停。',
      },
      {
        n: '3',
        title: '另设一个独立的检查者',
        skill: 'code-review-and-quality',
        prompt:
          'Write a "checker" agent that reviews the maker’s diff with code-review-and-quality against a short rubric, and rejects anything outside the target pattern or larger than a few lines.',
        does: '第二个智能体拿着不同的指令，给制造者的产出打分。',
        why: '写代码的那个模型给自己判作业，手一定偏松。一个独立的检查者，才是你敢信无人值守运行的唯一理由。/ship 里用的就是这套分工。',
        checkpoint: '一个能说“不”的检查者，按自己的评分口径工作。',
      },
      {
        n: '4',
        title: '用真实的停止条件包成回路',
        prompt:
          'Set this up to run on a schedule with a verifiable stop condition. In Claude Code use /loop or a run-until-done /goal such as "tests and lint are clean"; in Codex use an Automation. Keep each run to one fix.',
        does: '由框架原语（Claude Code /loop 或 /goal，或一个 Codex Automation）按节奏运行制造者和检查者。',
        why: '回路原语属于你的框架，不属于这个技能包。它负责跑技能，而由另一个模型（而不是制造者）判断运行何时结束。',
        checkpoint: '回路端到端跑通了一整次“制造者-然后-检查者”循环。',
      },
      {
        n: '5',
        title: '给回路一个记忆',
        prompt:
          'Add a state file (a progress markdown file or a tracker) where each run records what it changed and what is left, so tomorrow’s run resumes instead of repeating itself.',
        does: '回路把它做过的事写进磁盘，在任何一次会话之外。',
        why: '模型在两次运行之间什么都记不住。状态文件是让回路接着上次停下的地方继续走的那根脊梁。',
        checkpoint: '某次运行确实读取并更新了状态文件。',
      },
      {
        n: '6',
        title: '让回路把证据交到你手上',
        skill: 'git-workflow-and-versioning',
        prompt:
          'Have the loop open a small pull request with the diff, the passing test and lint output, and a one-line rationale. Anything it cannot verify should be left for me, not merged.',
        does: '每次成功的运行都产出一个短小可评审的 PR；任何它无法验证的东西都会被上报，而不是直接合入。',
        why: '这就是内层回路和外层回路的分界线。跨过这条线的只能是证据：一个 diff、绿的检查、一条理由。裁决权在你。',
        checkpoint: '你早上醒来时，有一个一分钟就能读完的 PR。',
      },
      {
        n: '7',
        title: '守住外层回路',
        prompt:
          'Review the loop’s PR. Decide: merge, redirect, or turn the loop off. Then decide which parts of your codebase should never run lights-out (auth, billing, public APIs) and keep those on manual review.',
        does: '你读证据、做决断，并划定回路允许作业的范围。',
        why: '智能体能上线的量会超出你能评审的量，所以你的判断力才是稀缺资源。你要留在约束、抽样、审计与归属这几个回路里。回路不能替你承担后果——只有你可以。',
        checkpoint: '你已上线一整个回路做出的、敢签上自己名字的改动。',
      },
    ],
    outcome:
      '一座小而不掺假的软件工厂：一个按计划运行的制造者-检查者回路，持续改进代码库并把短 PR 递到你手上等你批准，系统里风险高的部分坚决留在人工评审。这个模式能扩到多远，取决于你的验证能走多远。',
    recap: [
      { skill: 'test-driven-development', got: '回路赖以运转的绿红判官' },
      { skill: 'incremental-implementation', got: '制造者每次的小而安全的修复' },
      { skill: 'code-review-and-quality', got: '一个不是制造者本人的检查者' },
      { skill: 'git-workflow-and-versioning', got: '作为证据递到你面前的小 PR' },
    ],
  },
];

export function getTutorial(slug: string) {
  return tutorials.find((t) => t.slug === slug);
}

export const RUN_MODES = [
  { tool: 'Claude Code', how: '直接输入斜杠命令，例如 /spec。技能也会自行激活。' },
  { tool: 'Codex', how: '按名字调用技能，例如 @spec-driven-development，或直接把提示词粘进去。' },
  { tool: '任意智能体', how: '粘贴步骤里的提示词。提示词点明了要遵循的技能，不依赖斜杠命令。' },
];