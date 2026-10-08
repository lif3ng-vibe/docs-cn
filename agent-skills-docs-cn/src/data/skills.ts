// 技能目录——生成自 agent-skills 仓库（简体中文镜像，非官方翻译）。
// 原文：https://github.com/addyosmani/agent-skills

export type PhaseId =
  | 'meta'
  | 'define'
  | 'plan'
  | 'build'
  | 'verify'
  | 'review'
  | 'ship';

export interface Phase {
  id: PhaseId;
  label: string;
  short: string;
  order: number;
  /** 用于弱化强调的色相。 */
  hue: number;
  blurb: string;
  command?: string;
}

export const phases: Phase[] = [
  {
    id: 'meta',
    label: '元',
    short: '元',
    order: 0,
    hue: 220,
    blurb: '把任务路由到合适的技能，并定下共同的操作规则。',
  },
  {
    id: 'define',
    label: '定义',
    short: '定义',
    order: 1,
    hue: 205,
    blurb: '在写下一行代码之前，先弄清楚要构建什么。',
    command: '/spec',
  },
  {
    id: 'plan',
    label: '规划',
    short: '规划',
    order: 2,
    hue: 255,
    blurb: '把规格拆成小的、可验证的、有序的任务。',
    command: '/plan',
  },
  {
    id: 'build',
    label: '构建',
    short: '构建',
    order: 3,
    hue: 175,
    blurb: '以薄而带测试的垂直切片编写代码。',
    command: '/build',
  },
  {
    id: 'verify',
    label: '验证',
    short: '验证',
    order: 4,
    hue: 40,
    blurb: '用真实的运行时证据证明它确实能跑。',
    command: '/test',
  },
  {
    id: 'review',
    label: '评审',
    short: '评审',
    order: 5,
    hue: 340,
    blurb: '合并之前的质量、安全与性能门禁。',
    command: '/review',
  },
  {
    id: 'ship',
    label: '上线',
    short: '上线',
    order: 6,
    hue: 145,
    blurb: '放心部署——发布、回滚、可观测。',
    command: '/ship',
  },
];

export const phaseMap: Record<PhaseId, Phase> = Object.fromEntries(
  phases.map((p) => [p.id, p]),
) as Record<PhaseId, Phase>;

export interface Skill {
  slug: string;
  name: string;
  phase: PhaseId;
  /** 卡片用的简短有力的摘要。 */
  summary: string;
  /** 一句话的“何时使用”触发条件。 */
  useWhen: string;
  /** 来自 SKILL.md frontmatter 的完整描述。 */
  description: string;
  /** 过滤标签。 */
  tags: string[];
  /** 激活该技能的斜杠命令（如有）。 */
  command?: string;
  /** 标记值得重点展示的头部技能。 */
  featured?: boolean;
}

export const skills: Skill[] = [
  {
    slug: 'using-agent-skills',
    name: 'using-agent-skills',
    phase: 'meta',
    summary: '把接手的任务映射到合适的技能，并定下共同的操作规则。',
    useWhen: '开始一个会话，或判断该用哪个技能。',
    description:
      '发现并调用智能体技能。这是一条统管其他所有技能如何被发现和调用的元技能——先加载它，它会为每个任务路由到正确的工作流。',
    tags: ['routing', 'workflow'],
  },
  {
    slug: 'interview-me',
    name: 'interview-me',
    phase: 'define',
    summary: '一次只问一个问题的访谈，挖出你真正想要的东西。',
    useWhen: '需求说得含糊，或者说一声“interview me”/“grill me”。',
    description:
      '通过一次只问一个问题的访谈，挖出用户真正想要的东西，而不是用户自以为想要的东西，直到对底层意图有约 95% 的把握为止。',
    tags: ['requirements', 'discovery'],
    featured: true,
  },
  {
    slug: 'idea-refine',
    name: 'idea-refine',
    phase: 'define',
    summary: '结构化的发散/收敛思考，把模糊概念磨利。',
    useWhen: '手头有个粗糙想法，需要探索和压力测试。',
    description:
      '通过结构化的发散与收敛思考，把原始想法沉淀成清晰、可落地的概念。收敛到一个方案之前，先压力测试假设并扩展选项。',
    tags: ['ideation', 'discovery'],
  },
  {
    slug: 'spec-driven-development',
    name: 'spec-driven-development',
    phase: 'define',
    command: '/spec',
    summary: '写一份 PRD，覆盖目标、结构、风格、测试与边界——都在写代码之前。',
    useWhen: '开始新项目、新功能或重大改动。',
    description:
      '在编码之前先建立规格。当需求不清晰、有歧义或只存在于一个模糊念头里时，写出一份覆盖目标、命令、结构、代码风格、测试与边界的 PRD。',
    tags: ['spec', 'planning', 'requirements'],
    featured: true,
  },
  {
    slug: 'planning-and-task-breakdown',
    name: 'planning-and-task-breakdown',
    phase: 'plan',
    command: '/plan',
    summary: '把规格拆成小的、可验证的任务，带验收标准与先后顺序。',
    useWhen: '已有规格，需要可实施的工作单元。',
    description:
      '把工作拆成有序任务，附带验收标准和依赖排序。适用于：任务大到无从下手、需要估算工作量、或者可以并行推进的时候。',
    tags: ['planning', 'tasks'],
  },
  {
    slug: 'incremental-implementation',
    name: 'incremental-implementation',
    phase: 'build',
    command: '/build',
    summary: '薄的垂直切片——实现、测试、验证、提交。改动易回滚。',
    useWhen: '任何会碰多个文件的改动。',
    description:
      '以薄的垂直切片增量交付改动，配备功能开关、安全默认值和利于回滚的变更。适合你正准备一次性写大批代码的时候。',
    tags: ['implementation', 'workflow'],
    featured: true,
  },
  {
    slug: 'test-driven-development',
    name: 'test-driven-development',
    phase: 'build',
    command: '/test',
    summary: '红-绿-重构、测试金字塔、DAMP 优于 DRY、碧昂丝法则。',
    useWhen: '实现逻辑、修 bug 或改动行为。',
    description:
      '用测试驱动开发。红-绿-重构、测试金字塔（80/15/5）、测试粒度、DAMP 优于 DRY、碧昂丝法则（Beyoncé Rule），以及浏览器测试。测试是证明，不是马后炮。',
    tags: ['testing', 'tdd', 'quality'],
    featured: true,
  },
  {
    slug: 'context-engineering',
    name: 'context-engineering',
    phase: 'build',
    summary: '在正确的时机喂给智能体正确的信息——规则文件、上下文打包、MCP。',
    useWhen: '开始会话、切换任务，或发现输出质量下降。',
    description:
      '优化智能体的上下文准备。配置规则文件、有意识地打包上下文、接好 MCP 集成，让智能体拿到的恰好是它需要的东西——不多，也不少。',
    tags: ['context', 'agents', 'mcp'],
  },
  {
    slug: 'source-driven-development',
    name: 'source-driven-development',
    phase: 'build',
    summary: '每个框架决策都落到官方文档上——验证、引用、标记未验证项。',
    useWhen: '想要任何框架或库的权威、注明出处代码。',
    description:
      '把每个实现决策都落到官方文档上。对来源做验证、给出引用，并标记一切未经验证的内容，让代码不沾过时的套路。',
    tags: ['documentation', 'correctness'],
  },
  {
    slug: 'doubt-driven-development',
    name: 'doubt-driven-development',
    phase: 'build',
    summary: '对每个非平凡的决策做对抗式全新上下文评审，当场就做。',
    useWhen: '风险高、代码陌生，或当场验证胜过日后调试。',
    description:
      '让每个非平凡决策在定案之前都经历一次全新上下文的对抗式评审：CLAIM → EXTRACT → DOUBT → RECONCILE → STOP，可选经用户授权的跨模型升级。',
    tags: ['verification', 'quality', 'agents'],
    featured: true,
  },
  {
    slug: 'frontend-ui-engineering',
    name: 'frontend-ui-engineering',
    phase: 'build',
    summary: '组件架构、设计系统、状态、响应式、WCAG 2.1 AA 无障碍。',
    useWhen: '构建或修改面向用户的界面。',
    description:
      '构建生产级、无障碍、响应式的面向用户界面。组件架构、设计系统、状态管理、响应式设计与 WCAG 2.1 AA 无障碍——产出看起来是生产质量，而不是 AI 生成的。',
    tags: ['frontend', 'ui', 'accessibility'],
    featured: true,
  },
  {
    slug: 'api-and-interface-design',
    name: 'api-and-interface-design',
    phase: 'build',
    summary: '契约先行设计、海勒姆定律（Hyrum’s Law）、单版本法则、错误语义。',
    useWhen: '设计 API、模块边界或公共接口。',
    description:
      '引导稳定的 API 与接口设计。契约先行设计、海勒姆定律（Hyrum’s Law）、单版本法则（One-Version Rule）、错误语义，以及 REST、GraphQL 与模块间类型契约的边界校验。',
    tags: ['api', 'architecture'],
  },
  {
    slug: 'browser-testing-with-devtools',
    name: 'browser-testing-with-devtools',
    phase: 'verify',
    summary: '用 Chrome DevTools MCP 拿活的运行时数据——DOM、控制台、网络、性能剖析。',
    useWhen: '构建或调试任何在浏览器里跑的东西。',
    description:
      '通过 Chrome DevTools MCP 在真实浏览器里做测试。检查 DOM、抓取控制台报错、分析网络请求、剖析性能，用真实运行时数据校验视觉输出。',
    tags: ['testing', 'browser', 'mcp'],
  },
  {
    slug: 'debugging-and-error-recovery',
    name: 'debugging-and-error-recovery',
    phase: 'verify',
    summary: '五步分诊：复现、定位、缩小、修复、设防。停线规则。',
    useWhen: '测试挂了、构建崩了，或行为不像预期。',
    description:
      '引导系统性的根因调试。复现、定位、缩小、修复、设防——配停线规则（stop-the-line）与安全回退，修的是病根而不是撞运气。',
    tags: ['debugging', 'quality'],
  },
  {
    slug: 'code-review-and-quality',
    name: 'code-review-and-quality',
    phase: 'review',
    command: '/review',
    summary: '五轴评审、约 100 行的改动粒度、严重度标签、评审速度规范。',
    useWhen: '合并任何改动之前。',
    description:
      '做多轴代码评审，覆盖正确性、可读性、架构、安全与性能。改动粒度（约 100 行）、严重度标签（Critical/Required/Optional/Nit）、评审速度规范与拆分策略。',
    tags: ['review', 'quality', 'security'],
    featured: true,
  },
  {
    slug: 'code-simplification',
    name: 'code-simplification',
    phase: 'review',
    command: '/code-simplify',
    summary: '切斯特顿围栏（Chesterton’s Fence）、500 行规则——在不改行为的前提下砍复杂度。',
    useWhen: '代码能跑，但读起来或维护起来不该这么费劲。',
    description:
      '为清晰而化简代码。切斯特顿围栏（Chesterton’s Fence）、500 行规则（Rule of 500）——当代码积累了不必要的体量时，在保持行为完全不变的前提下降低复杂度。',
    tags: ['refactoring', 'quality'],
  },
  {
    slug: 'security-and-hardening',
    name: 'security-and-hardening',
    phase: 'review',
    summary: 'OWASP Top 10 预防、认证模式、密钥管理、依赖审计。',
    useWhen: '处理用户输入、认证、数据存储或外部集成。',
    description:
      '加固代码以防范漏洞。OWASP Top 10 预防、认证模式、密钥管理、依赖审计，以及面向任何接收不可信数据的功能的三层边界体系。',
    tags: ['security', 'hardening'],
    featured: true,
  },
  {
    slug: 'performance-optimization',
    name: 'performance-optimization',
    phase: 'review',
    command: '/webperf',
    summary: '先测量——Core Web Vitals 指标、性能剖析、打包分析、N+1 修复。',
    useWhen: '存在性能要求，或怀疑出现性能回退。',
    description:
      '优化前端、后端、查询与数据库的应用性能。先测量的方法论——Core Web Vitals 目标、剖析工作流、打包分析与反模式检测。用 /webperf 运行审计。',
    tags: ['performance', 'web-vitals'],
    featured: true,
  },
  {
    slug: 'git-workflow-and-versioning',
    name: 'git-workflow-and-versioning',
    phase: 'ship',
    summary: '主干开发、原子提交、约 100 行改动、提交即存档点。',
    useWhen: '做任何代码改动（永远适用）。',
    description:
      '规范 git 工作流实践。主干开发（trunk-based development）、原子提交、改动粒度（约 100 行）与提交即存档点模式——另有分支、冲突、发布与语义化版本。',
    tags: ['git', 'workflow'],
  },
  {
    slug: 'ci-cd-and-automation',
    name: 'ci-cd-and-automation',
    phase: 'ship',
    summary: '左移（Shift Left）、更快更安全、功能开关、质量门禁流水线。',
    useWhen: '搭建或修改构建与部署流水线。',
    description:
      '自动化 CI/CD 流水线搭建。左移（Shift Left）、更快更安全（Faster is Safer）、功能开关、质量门禁流水线与失败反馈回路——把门禁自动化，让速度与安全互相放大。',
    tags: ['ci-cd', 'automation'],
  },
  {
    slug: 'deprecation-and-migration',
    name: 'deprecation-and-migration',
    phase: 'ship',
    summary: '代码即负债的观念、强制弃用与劝导弃用、僵尸代码清除。',
    useWhen: '移除旧系统、迁移用户或下线功能。',
    description:
      '管理弃用与迁移。代码即负债的观念、强制弃用与劝导弃用之分、迁移模式与僵尸代码清除——帮你决定现有代码是继续维护还是下线。',
    tags: ['migration', 'maintenance'],
  },
  {
    slug: 'documentation-and-adrs',
    name: 'documentation-and-adrs',
    phase: 'ship',
    summary: '架构决策记录（ADR）、API 文档、行内规范——把“为什么”写下来。',
    useWhen: '做架构决策、改 API 或发布功能。',
    description:
      '记录决策与撰写文档。架构决策记录（ADR）、API 文档与行内文档规范——把未来的工程师和智能体读懂代码库所需的上下文留住。',
    tags: ['documentation', 'adr'],
  },
  {
    slug: 'observability-and-instrumentation',
    name: 'observability-and-instrumentation',
    phase: 'ship',
    summary: '结构化日志、RED 指标、OpenTelemetry 追踪、按症状告警。',
    useWhen: '加遥测，或发布任何要跑在生产的系统。',
    description:
      '给代码插桩，让生产行为可见、可诊断。结构化日志、RED 指标、OpenTelemetry 追踪与按症状告警——开发时就插桩，而不是出了事故再补。',
    tags: ['observability', 'production'],
  },
  {
    slug: 'shipping-and-launch',
    name: 'shipping-and-launch',
    phase: 'ship',
    command: '/ship',
    summary: '发布前清单、功能开关生命周期、分阶段发布、回滚流程。',
    useWhen: '准备部署到生产。',
    description:
      '为生产发布做准备。发布前清单、功能开关生命周期、分阶段发布、回滚流程与监控架设。通过 /ship 运行：并行展开各评审角色，最后汇成一个放行/叫停（go/no-go）。',
    tags: ['launch', 'production', 'rollout'],
    featured: true,
  },
];

export const skillsByPhase = phases.map((phase) => ({
  phase,
  skills: skills.filter((s) => s.phase === phase.id),
}));

export const featuredSkills = skills.filter((s) => s.featured);

export function getSkill(slug: string): Skill | undefined {
  return skills.find((s) => s.slug === slug);
}

export const totalSkills = skills.length;

export const REPO_URL = 'https://github.com/addyosmani/agent-skills';
export const INSTALL_CMD = 'npx skills add addyosmani/agent-skills';