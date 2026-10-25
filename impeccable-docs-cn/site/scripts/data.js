// ============================================
// DATA: Skill focus areas, command processes, relationships
// ============================================

// Items that are fully complete and ready for public use
// All others will show "Coming Soon"
export const readySkills = [
  'impeccable'  // Consolidated skill with all design domains
];

export const readyCommands = [
  'layout'  // First command to be fully completed
];

// Commands marked as alpha — shown with a badge in the UI
export const alphaCommands = [
  'live'
];

// Consolidated impeccable skill with reference domains
export const skillFocusAreas = {
  'impeccable': [
    { area: '字体排印', detail: '字阶、节奏、层级、表现力' },
    { area: '色彩与对比', detail: '无障碍、体系、主题化' },
    { area: '空间设计', detail: '布局、间距、构图' },
    { area: '响应式', detail: '流式布局、触控目标' },
    { area: '交互', detail: '状态、反馈、可供性' },
    { area: '动效', detail: '微交互、过渡' },
    { area: 'UX 文案', detail: '清晰、语调、报错信息' }
  ]
};

// Slop tells we prevent in each discipline. Same seven categories, but the
// detail line communicates what bad-default we catch — not what we teach.
export const slopFocusAreas = {
  'impeccable': [
    { area: '字体排印', detail: '字阶要有真实对比，字体要刻意挑选，而不是条件反射地上 Inter。' },
    { area: '色彩与对比', detail: '配色要过 WCAG、认定一个主色相。默认的紫色渐变永远不该上线。' },
    { area: '空间设计', detail: '结构来自间距与节奏，而不是把一模一样的卡片再嵌进卡片。' },
    { area: '响应式', detail: '从小屏做起，断点跟着内容走。' },
    { area: '交互', detail: '状态要诚实、可供性要清晰，别动不动就上弹窗或渐变文字。' },
    { area: '动效', detail: '动效像物理一样缓入缓出并稳稳停住。没有任何元素弹跳或越过落点。' },
    { area: 'UX 文案', detail: '文案要具体说出这个东西做什么，而不是"欢迎来到我们的平台"。' }
  ]
};

// Guideline counts per dimension (verified from reference files)
export const dimensionGuidelineCounts = {
  '字体排印': 33,
  '色彩与对比': 29,
  '空间设计': 27,
  '动效': 32,
  '交互': 36,
  '响应式': 23,
  'UX 文案': 32
};

// Reference domains within the impeccable skill
export const skillReferenceDomains = [
  'typography',
  'color-and-contrast',
  'spatial-design',
  'responsive-design',
  'interaction-design',
  'motion-design',
  'ux-writing'
];

export const commandProcessSteps = {
  'impeccable': ['定向', '设计', '构建', '精修'],
  'craft': ['规划', '查参考', '构建', '迭代'],
  'shape': ['访谈', '综合', '简报', '确认'],
  'overdrive': ['评估', '选择', '构建', '打磨'],
  'critique': ['评估', '批评', '排优先级', '给建议'],
  'audit': ['扫描', '记录', '排优先级', '给建议'],
  'typeset': ['评估', '挑选', '定字阶', '精修'],
  'layout': ['评估', '网格', '节奏', '平衡'],
  'colorize': ['分析', '策略', '上色', '平衡'],
  'animate': ['识别', '设计', '实现', '打磨'],
  'delight': ['识别', '设计', '实现'],
  'bolder': ['分析', '放大', '出效果'],
  'quieter': ['分析', '做减法', '精修'],
  'distill': ['体检', '移除', '澄清'],
  'clarify': ['读懂', '化简', '改进', '验证'],
  'adapt': ['分析', '调整', '优化'],
  'polish': ['摸底', '走查', '精修', '验证'],
  'optimize': ['测量', '定位', '改进', '复核'],
  'harden': ['评估', '实现', '测试', '验证'],
  'onboard': ['识别', '设计', '引导', '衡量'],
  'init': ['探索', '访谈', '配置', '建议'],
  'document': ['扫描', '提取', '描述', '撰写'],
  'extract': ['识别', '抽象', '迁移', '文档化'],
  'live': ['启动', '选取', '生成', '采纳']
};

export const commandCategories = {
  // CREATE - build something new
  'impeccable': 'create',
  'craft': 'create',
  'shape': 'create',
  // EVALUATE - review and assess
  'critique': 'evaluate',
  'audit': 'evaluate',
  // REFINE - improve existing design
  'typeset': 'refine',
  'layout': 'refine',
  'colorize': 'refine',
  'animate': 'refine',
  'delight': 'refine',
  'bolder': 'refine',
  'quieter': 'refine',
  'overdrive': 'refine',
  // SIMPLIFY - reduce and clarify
  'distill': 'simplify',
  'clarify': 'simplify',
  'adapt': 'simplify',
  // HARDEN - production-ready
  'polish': 'harden',
  'optimize': 'harden',
  'harden': 'harden',
  'onboard': 'harden',
  // SYSTEM - setup and tooling
  'init': 'system',
  'document': 'system',
  'extract': 'system',
  'live': 'system'
};

// Skill relationships - now consolidated into impeccable skill
// The impeccable skill contains all domains as reference files
export const skillRelationships = {
  'impeccable': {
    description: '全面的设计智能，参考资料按需渐进加载',
    referenceDomains: ['typography', 'color-and-contrast', 'spatial-design', 'responsive-design', 'interaction-design', 'motion-design', 'ux-writing']
  }
};

export const commandRelationships = {
  'impeccable': { flow: '创建：自由设计，拥有完整设计智能' },
  'craft': { flow: '创建：先规划后编码的完整流程，带视觉迭代' },
  'shape': { flow: '创建：通过结构化的需求澄清，规划 UX 与 UI' },
  'critique': { leadsTo: ['polish', 'distill', 'bolder', 'quieter', 'typeset', 'layout'], flow: '评估：带打分的 UX 与设计走查' },
  'audit': { leadsTo: ['harden', 'optimize', 'adapt', 'clarify'], flow: '评估：技术质量体检' },
  'typeset': { combinesWith: ['bolder', 'polish'], flow: '精修：修好字体排印与字级层级' },
  'layout': { combinesWith: ['distill', 'adapt'], flow: '精修：修好布局与间距' },
  'colorize': { combinesWith: ['bolder', 'delight'], flow: '精修：加入有策略的色彩' },
  'animate': { combinesWith: ['delight'], flow: '精修：加入有目的的动效' },
  'delight': { combinesWith: ['bolder', 'animate'], flow: '精修：加入人格与愉悦感' },
  'bolder': { pairs: 'quieter', flow: '精修：放大怯懦的设计' },
  'quieter': { pairs: 'bolder', flow: '精修：调低吵闹的设计' },
  'overdrive': { combinesWith: ['animate', 'delight'], flow: '精修：技术上非同凡响的效果' },
  'distill': { combinesWith: ['quieter', 'polish'], flow: '化简：剥离到本质' },
  'clarify': { combinesWith: ['polish', 'adapt'], flow: '化简：改进 UX 文案' },
  'adapt': { combinesWith: ['polish', 'clarify'], flow: '化简：适配不同场景' },
  'polish': { flow: '加固：最后一遍打磨，对齐设计系统' },
  'optimize': { flow: '加固：性能优化' },
  'harden': { combinesWith: ['optimize'], flow: '加固：边界情况、报错处理与国际化' },
  'onboard': { combinesWith: ['clarify', 'delight'], flow: '加固：首次运行体验与空状态' },
  'init': { flow: '系统：一次性项目配置。背景信息、live 配置、下一步' },
  'extract': { flow: '系统：提取设计系统组件与令牌' },
  'live': { flow: '系统：浏览器里的视觉变体模式' }
};
