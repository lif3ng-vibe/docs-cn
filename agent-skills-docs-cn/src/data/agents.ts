// 专项评审角色——源自 agent-skills/agents/（简体中文镜像，非官方翻译）
export interface Persona {
  slug: string;
  name: string;
  role: string;
  perspective: string;
  command?: string;
}

export const personas: Persona[] = [
  {
    slug: 'code-reviewer',
    name: 'code-reviewer',
    role: '资深骨干工程师',
    perspective:
      '五轴代码评审，标准只有一句：“骨干工程师会批准这段代码吗？”。',
  },
  {
    slug: 'test-engineer',
    name: 'test-engineer',
    role: '质检专家',
    perspective: '测试策略、覆盖率分析与“拿出证据”模式。',
  },
  {
    slug: 'security-auditor',
    name: 'security-auditor',
    role: '安全工程师',
    perspective: '漏洞检测、威胁建模与 OWASP 评估。',
  },
  {
    slug: 'web-performance-auditor',
    name: 'web-performance-auditor',
    role: '网页性能工程师',
    perspective:
      'Core Web Vitals 审计，Quick/Deep 两种模式，外加一条指标诚实规则。通过 /webperf 运行。',
    command: '/webperf',
  },
];

// 映射到生命周期的斜杠命令。
export interface Command {
  cmd: string;
  doing: string;
  principle: string;
}

export const commands: Command[] = [
  { cmd: '/spec', doing: '定义要构建什么', principle: '先规格，后代码' },
  { cmd: '/plan', doing: '规划如何构建', principle: '小而原子的任务' },
  { cmd: '/build', doing: '增量构建', principle: '一次一个切片' },
  { cmd: '/test', doing: '证明它真跑得通', principle: '测试即证明' },
  { cmd: '/review', doing: '合并前先评审', principle: '让代码更健康' },
  { cmd: '/webperf', doing: '审计网页性能', principle: '先测量，再优化' },
  { cmd: '/code-simplify', doing: '化简代码', principle: '清晰胜过炫技' },
  { cmd: '/ship', doing: '上到生产', principle: '更快才更安全' },
];

// 参考清单——源自 agent-skills/references/
export const references = [
  { name: 'definition-of-done', covers: '每个改动都要越过的常态标准。' },
  { name: 'testing-patterns', covers: '结构、命名、打桩，React/API/E2E 示例。' },
  { name: 'security-checklist', covers: '提交前检查、认证、响应头、OWASP Top 10。' },
  { name: 'performance-checklist', covers: 'Core Web Vitals 目标与测量命令。' },
  { name: 'accessibility-checklist', covers: '键盘导航、读屏器、ARIA、测试工具。' },
  { name: 'observability-checklist', covers: '结构化日志、RED/USE 指标、追踪、告警。' },
  { name: 'orchestration-patterns', covers: '多角色编排的模式与反模式。' },
];