// 教学 / 媒体包资源。文件位于 public/teach/（图片素材保持原样，不重绘）。

export interface Diagram {
  slug: string;
  title: string;
  blurb: string;
  hue: number;
  /** 预览框的宽高比标签 */
}

export const diagrams: Diagram[] = [
  {
    slug: 'lifecycle',
    title: '软件开发生命周期全景',
    blurb: '从定义到上线，一个阶段一条命令。核心心智模型浓缩在一帧里。',
    hue: 205,
  },
  {
    slug: 'solo-workflow',
    title: '个人日常回路',
    blurb: '一个开发者如何跑完规格、构建、测试、上线，外加“放手不管”的 /build auto 选项。',
    hue: 175,
  },
  {
    slug: 'team-workflow',
    title: '团队评审面板',
    blurb: '/ship 并行展开四个专项评审角色，最后汇成一条放行 / 叫停结论。',
    hue: 145,
  },
  {
    slug: 'skill-anatomy',
    title: '技能解剖',
    blurb: 'frontmatter、工作流、护栏与验证。为什么技能是一个流程，而不是一句提示词。',
    hue: 255,
  },
  {
    slug: 'customize',
    title: '四种自定义方式',
    blurb: '全装、择几个用、改一改，或自己写。技能就是普通 Markdown。',
    hue: 340,
  },
];

export interface Deck {
  slug: string;
  level: string;
  title: string;
  blurb: string;
  slides: number;
  hue: number;
  covers: string[];
}

export const decks: Deck[] = [
  {
    slug: 'agent-skills-101',
    level: '101',
    title: '入门：是什么，为什么',
    blurb: '默认状态下智能体的问题、技能是什么，以及怎么安装并拿下第一个胜利。',
    slides: 8,
    hue: 205,
    covers: ['抄近路的问题', '技能解剖', '生命周期', '你的第一份规格'],
  },
  {
    slug: 'agent-skills-201',
    level: '201',
    title: '软件开发生命周期的实战形态',
    blurb: '八条命令、个人日常回路，以及每个阶段实际是怎样推进的。',
    slides: 8,
    hue: 175,
    covers: ['八条命令', '日常回路', '从定义到上线', '/build auto'],
  },
  {
    slug: 'agent-skills-301',
    level: '301',
    title: '团队协作与自定义',
    blurb: '评审面板、上下文预算、四种自定义方式、evals，以及向团队推广。',
    slides: 7,
    hue: 340,
    covers: ['评审面板', '四种自定义', '上下文工程', 'evals 与推广'],
  },
];

export interface UsageMode {
  slug: string;
  label: string;
  diagram: string;
  headline: string;
  body: string;
  points: string[];
}

export const usageModes: UsageMode[] = [
  {
    slug: 'solo',
    label: '个人项目',
    diagram: 'solo-workflow',
    headline: '一个人跑完整个软件开发生命周期',
    body: '装一次装好，然后用单条命令驱动每个生命周期阶段。每个检查点都由你拍板，每个切片都独立完成测试与提交。',
    points: [
      '/spec 在任何代码出现之前先写一份简短 PRD',
      '/build 落地薄而带测试的垂直切片',
      '/build auto 会在一份经你批准的方案上放手执行',
    ],
  },
  {
    slug: 'team',
    label: '团队项目',
    diagram: 'team-workflow',
    headline: '过评审面板再上线，走真流程而不是走过场',
    body: '同一套生命周期同样扛得住团队规模。/ship 并行展开专项评审角色，再把各方发现汇成一条不掺水的放行 / 叫停结论，阻塞项一并列明。',
    points: [
      'code-reviewer、security-auditor、test-engineer、web-performance-auditor',
      '反合理化护栏让每个阶段都不掺水',
      '把技能提交进版本控制，成为唯一事实来源',
    ],
  },
  {
    slug: 'customize',
    label: '自定义',
    diagram: 'customize',
    headline: '让工作流迁就你自己的技术栈',
    body: '技能就是普通 Markdown，所以它们归你所有。24 个全装、按任务只装几个、改一个 SKILL.md 写进团队风格，或者用同样的解剖结构写你自己的。',
    points: [
      '上下文是一笔预算：只加载任务需要的内容',
      '改任意 SKILL.md 编码团队规范',
      '新技能照样遵循同样的流程、护栏与验证',
    ],
  },
];

export interface Sticker {
  slug: string;
  title: string;
  blurb: string;
  hue: number;
  pngSize: string;
  webpSize: string;
  png600Size: string;
  webp600Size: string;
}

export const stickers: Sticker[] = [
  {
    slug: 'retro-computer',
    title: '复古终端',
    blurb: '一台米色年代的工位机正在报喜，还自带一束花。',
    hue: 45,
    pngSize: '2.0 MB',
    webpSize: '0.6 MB',
    png600Size: '7.2 MB',
    webp600Size: '1.5 MB',
  },
  {
    slug: 'circuit-heart',
    title: '电路之心',
    blurb: '老派纹身爱心，用电路走线改接，还装了一只开心的小机器人。',
    hue: 340,
    pngSize: '1.3 MB',
    webpSize: '0.5 MB',
    png600Size: '4.4 MB',
    webp600Size: '1.2 MB',
  },
  {
    slug: 'merit-badge',
    title: '荣誉徽章',
    blurb: '一朵圆盘花、一颗星星和两条绶带。你挣来的，佩戴它吧。',
    hue: 205,
    pngSize: '1.4 MB',
    webpSize: '0.5 MB',
    png600Size: '4.7 MB',
    webp600Size: '1.1 MB',
  },
  {
    slug: 'tattoo-heart',
    title: '机器人浪漫',
    blurb: '经典纹身画风的爱心，配上一个明显热爱本职工作的机器人。',
    hue: 5,
    pngSize: '1.4 MB',
    webpSize: '0.5 MB',
    png600Size: '4.7 MB',
    webp600Size: '1.1 MB',
  },
];

export const REPO = 'https://github.com/addyosmani/agent-skills';