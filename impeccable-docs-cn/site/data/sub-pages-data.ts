/**
 * Command category and relationship data for docs pages.
 * Extracted from scripts/lib/sub-pages-data.js for use in Astro templates.
 */

export const SKILL_CATEGORIES: Record<string, string> = {
  impeccable: 'create',
  generate: 'system',
  shape: 'create',
  critique: 'evaluate',
  audit: 'evaluate',
  typeset: 'refine',
  layout: 'refine',
  colorize: 'refine',
  animate: 'refine',
  delight: 'refine',
  bolder: 'refine',
  quieter: 'refine',
  overdrive: 'refine',
  distill: 'simplify',
  clarify: 'simplify',
  adapt: 'simplify',
  polish: 'harden',
  optimize: 'harden',
  harden: 'harden',
  onboard: 'harden',
  teach: 'system',
  document: 'system',
  extract: 'system',
  live: 'system',
};

export const CATEGORY_ORDER = ['create', 'evaluate', 'refine', 'simplify', 'harden', 'system'];

export const CATEGORY_LABELS: Record<string, string> = {
  create: '创建',
  evaluate: '评估',
  refine: '精修',
  simplify: '化简',
  harden: '加固',
  system: '系统',
};

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  create: '构建全新的东西，从空白页面到能用的功能。',
  evaluate: '审视你现有的东西。打分、批评、找出要修的地方。',
  refine: '一次改进一个维度：字体排印、布局、色彩、动效。',
  simplify: '剥离复杂度。去掉配不上位置的东西。',
  harden: '让它达到生产标准。边界情况、性能、打磨。',
  system: '设置与工具。设计系统工作、提取、组织。',
};

export const COMMAND_RELATIONSHIPS: Record<string, {
  leadsTo?: string[];
  pairs?: string;
  combinesWith?: string[];
}> = {
  generate: {},
  shape: {},
  audit: { leadsTo: ['harden', 'optimize', 'adapt', 'clarify'] },
  critique: { leadsTo: ['polish', 'distill', 'bolder', 'quieter', 'typeset', 'layout'] },
  typeset: { combinesWith: ['bolder', 'polish'] },
  layout: { combinesWith: ['distill', 'adapt'] },
  colorize: { combinesWith: ['bolder', 'delight'] },
  animate: { combinesWith: ['delight'] },
  delight: { combinesWith: ['bolder', 'animate'] },
  bolder: { pairs: 'quieter' },
  quieter: { pairs: 'bolder' },
  overdrive: { combinesWith: ['animate', 'delight'] },
  distill: { combinesWith: ['quieter', 'polish'] },
  clarify: { combinesWith: ['polish', 'adapt'] },
  adapt: { combinesWith: ['polish', 'clarify'] },
  polish: {},
  optimize: {},
  harden: { combinesWith: ['optimize'] },
  onboard: { combinesWith: ['clarify', 'delight'] },
  teach: { combinesWith: ['document'] },
  document: { combinesWith: ['teach', 'extract'] },
  extract: { combinesWith: ['document'] },
  live: {},
};
