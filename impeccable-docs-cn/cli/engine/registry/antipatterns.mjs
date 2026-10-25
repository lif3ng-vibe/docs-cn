const ANTIPATTERNS = [
  // ── AI slop: tells that something was AI-generated ──
  {
    id: 'side-tab',
    category: 'slop',
    name: '侧边彩条边框',
    description:
      '卡片一侧的粗彩色描边——AI 生成界面最容易辨认的破绽。请改用更低调的强调色，或彻底移除。',
    skillSection: 'Visual Details',
    skillGuideline: '彩色装饰条',
  },
  {
    id: 'border-accent-on-rounded',
    category: 'slop',
    name: '圆角元素上的彩色描边',
    description:
      '圆角卡片上的粗彩色描边——描边与圆角互相冲突。请移除描边或圆角。',
    skillSection: 'Visual Details',
    skillGuideline: '彩色装饰条',
  },
  {
    id: 'overused-font',
    category: 'slop',
    scopes: ['type'],
    name: '被用滥的字体',
    description:
      'Inter、Roboto、Fraunces、Geist、Plus Jakarta Sans 和 Space Grotesk 被太多网站使用，已经毫无辨识度。每一波 AI 生成的界面都收敛到同一小撮字体。请选一款能给界面带来个性的字体。',
    skillSection: 'Typography',
    skillGuideline: 'Inter 等被用滥的字体',
  },
  {
    id: 'single-font',
    category: 'slop',
    scopes: ['type'],
    name: '全站只用一款字体',
    description:
      '整个页面只用一个字族。当字重与字号对比足以承载层级时，单一字族可行；否则请把一款有个性的展示字体与一款精修的正文字体搭配使用。',
    skillSection: 'Typography',
    skillGuideline: '整页只用一个字族',
  },
  {
    id: 'flat-type-hierarchy',
    category: 'slop',
    scopes: ['type'],
    name: '扁平的字号层级',
    description:
      '字号彼此太接近——没有清晰的视觉层级。请减少字号数量并拉开对比（相邻两档至少 1.25 倍）。',
    skillSection: 'Typography',
    skillGuideline: '扁平的字号层级',
  },
  {
    id: 'gradient-text',
    category: 'slop',
    name: '渐变文字',
    description:
      '渐变文字是装饰而非表意——常见的 AI 破绽，标题和数据指标上尤其多见。文字请用纯色。',
    skillSection: 'Color & Contrast',
    skillGuideline: '渐变文字',
  },
  {
    id: 'ai-color-palette',
    category: 'slop',
    name: 'AI 配色',
    description:
      '紫/罗兰渐变和暗底亮青是 AI 生成界面最容易辨认的破绽。请选一套有辨识度、有意为之的配色。',
    skillSection: 'Color & Contrast',
    skillGuideline: 'AI 配色',
  },
  {
    id: 'cream-palette',
    category: 'slop',
    name: '奶油色 / 米色配色',
    description:
      '温暖的奶油色或米色页面背景已经成了默认的"有品位"AI 表面，伸手就来。请选用来自深思熟虑的配色的背景色，而不是保险的暖调米白。',
    skillSection: 'Color & Contrast',
    skillGuideline: '默认使用奶油色和米色表面',
  },
  {
    id: 'nested-cards',
    category: 'slop',
    scopes: ['layout'],
    name: '嵌套卡片',
    description:
      '卡片套卡片制造视觉噪音和多余的层次。请压平层级——用间距、字体排印和分隔线代替容器嵌套。',
    skillSection: 'Layout & Space',
    skillGuideline: '卡片套卡片',
  },
  {
    id: 'monotonous-spacing',
    category: 'slop',
    scopes: ['layout'],
    name: '单调的间距',
    description:
      '处处使用同一个间距值——没有节奏，没有变化。相关内容用紧凑的分组，区块之间留出宽松的间隔。',
    skillSection: 'Layout & Space',
    skillGuideline: '处处相同的间距',
  },
  {
    id: 'bounce-easing',
    category: 'slop',
    name: '回弹或弹性缓动',
    description:
      '回弹和弹性缓动显得过时且俗气。真实物体是平滑减速的——请改用指数缓动（ease-out-quart/quint/expo）。',
    skillSection: 'Motion',
    skillGuideline: '回弹或弹性缓动',
  },
  {
    id: 'pulsing-dot',
    category: 'slop',
    name: '脉动状态点',
    description:
      '小脉动状态点用装饰方式假装"活跃"。脉动动画请留给真正实时变化的数据指标；带清晰标注的静态指示器更诚实，也更让人安心。',
    skillSection: 'Motion',
    skillGuideline: '装饰性脉动状态点',
  },
  {
    id: 'blinking-cursor',
    category: 'slop',
    severity: 'advisory',
    name: '装饰性闪烁光标',
    description:
      '把闪烁的文字光标动画搬进首屏或落地区块，是在没有输入存在的地方模拟打字。它借用了开发者工具的美学作装饰。真正可编辑的字段会自己画出光标；其他任何地方，请让画面本身抓住注意力，而不是靠一个假的提示符。',
    skillSection: 'Motion',
  },
  {
    id: 'shape-assembled-illustration',
    category: 'slop',
    severity: 'advisory',
    name: '占位图风格的插画',
    description:
      '用一堆原始形状拼出画面的超大内联 SVG，读起来像占位剪贴画，而非插画。图标、Logo 和数据图形在它们的尺度上没有问题；首屏级的大视觉值得真正的插画、照片或刻意绘制的图形。',
    skillSection: 'Imagery',
  },
  {
    id: 'dark-glow',
    category: 'slop',
    name: '发光点缀的暗色模式',
    description:
      '彩色光晕阴影——任意背景上零偏移的彩色光圈（box- 或 text-shadow），或暗色背景上任何彩色模糊阴影——是 AI 生成界面默认的"酷"样式。请用中性海拔阴影和克制、有目的的光效。',
    skillSection: 'Color & Contrast',
    skillGuideline: '带发光点缀的暗色模式',
  },
  {
    id: 'radial-halo',
    category: 'slop',
    name: '径向渐变背景光晕',
    description:
      '中心饱和、向透明过渡的彩色径向渐变，用作暗色页面上的装饰性背景光晕。与发光阴影是同一个破绽，只是用渐变而非阴影绘制。请改用纯色或细微变化的背景，让表面落地。',
    skillSection: 'Color & Contrast',
    skillGuideline: '带发光点缀的暗色模式',
  },
  {
    id: 'marquee',
    category: 'slop',
    name: '自动滚动的跑马灯',
    description:
      '持续自动滚动的内容索取着它并未挣得的注意力，还随时遮住一半内容。动效请留给真正变化的内容；让读者按自己的节奏阅读。',
    skillSection: 'Motion',
    skillGuideline: '自动滚动的跑马灯',
  },
  {
    id: 'icon-tile-stack',
    category: 'slop',
    scopes: ['layout'],
    name: '图标块堆叠在标题上方',
    description:
      '标题上方的小圆角方块图标容器是通用的 AI 功能卡模板——每个生成器都输出这一种形状。试试图标与标题并排，或让图标直接留在文字流里、不要自带容器。',
    skillSection: 'Typography',
    skillGuideline: '每个标题上方都有大号圆角图标',
  },
  {
    id: 'italic-serif-display',
    category: 'slop',
    scopes: ['type'],
    name: '斜体衬线大标题',
    description:
      '超大号斜体衬线（Fraunces、Recoleta、Playfair、Newsreader 斜体）作主首屏标题，孤立看有品位，却已经成了 AI 创业公司落地页的通用首屏。请用正体，或换一款非衬线的展示字体。编辑/杂志调性确有正当需求——请结合语境判断。',
    skillSection: 'Typography',
    skillGuideline: '超大号斜体衬线作首屏标题',
  },
  {
    id: 'hero-eyebrow-chip',
    category: 'slop',
    scopes: ['type'],
    name: '主标题上方的徽章',
    description:
      '紧贴超大首屏标题上方的迷你大写间隔标签——或同一形状的胶囊芯片——已是 AI SaaS 首屏的默认样式。请去掉眉题，把引子并进标题，或改作导航面包屑。',
    skillSection: 'Typography',
    skillGuideline: '首屏标题上方的迷你大写间隔标签',
  },
  {
    id: 'repeated-section-kickers',
    category: 'slop',
    scopes: ['type'],
    severity: 'advisory',
    name: '标题上方的小标签',
    description:
      '在每个区块标题上方重复迷你大写间隔标签，会把品牌页面变成 AI 编辑腔脚手架。请用更有力的结构、实物、图像或刻意的品牌系统代替。',
    skillSection: 'Typography',
    skillGuideline: '反复使用眉题或小标签作区块脚手架',
  },
  {
    id: 'numbered-section-labels',
    category: 'slop',
    scopes: ['type'],
    severity: 'advisory',
    name: '迷你编号区块标签',
    description:
      '贴在区块标题旁的迷你数字编号，一个区块接一个区块地重复，是 AI 编辑腔脚手架——页面在给自己的章节编号，而不是挣得结构。请让层级、内容和节奏来承载顺序。',
    skillSection: 'Layout & Space',
    skillGuideline: '编号区块标记',
  },
  {
    id: 'em-dash-overuse',
    category: 'slop',
    name: '破折号滥用',
    description:
      '正文里超过两处破折号（— 或 --）是 AI 腔调的破绽。请改用逗号、冒号、句号或括号。',
    skillSection: 'Copy',
    skillGuideline: '不用破折号',
  },
  {
    id: 'marketing-buzzword',
    category: 'slop',
    name: '空洞的营销话术',
    description:
      '泛泛的 SaaS 短语（streamline / empower / supercharge / world-class / enterprise-grade / next-generation / cutting-edge 等）是即时的 AI 破绽。请选一个具体的动词和名词，说清产品到底做什么。',
    skillSection: 'Copy',
    skillGuideline: '营销话术',
  },
  {
    id: 'aphoristic-cadence',
    category: 'slop',
    name: '强行对立',
    description:
      '三个及以上区块都收在一句短促的反驳句上（"X。不，Y。" / "X。只要 Y。"），或刻意制造对立的格言（"不是功能。是平台。"），读起来像 AI 腔调，而不是语调。出现一次没问题；成模式才是破绽。',
    skillSection: 'Copy',
    skillGuideline: '格言式句调',
  },
  {
    id: 'oversized-h1',
    category: 'slop',
    scopes: ['type'],
    name: '过大的首屏标题',
    description:
      '以展示级字号排的整句标题会霸占整个视口，首屏给其他内容留不下空间。一两词的有力标题用这个尺寸没问题——问题在于长标题放得过大。长标题请缩小字号，或精简文案。',
    skillSection: 'Typography',
    skillGuideline: '展示级字号的长标题',
  },
  {
    id: 'extreme-negative-tracking',
    category: 'slop',
    scopes: ['type'],
    name: '过挤的字距',
    description:
      '字距收紧到字符失去自身形状的程度，就牺牲了易读性。展示字体的字距要靠目测微调，而不是破坏性地压缩。',
    skillSection: 'Typography',
    skillGuideline: '字距压过易读底线',
  },
  {
    id: 'broken-image',
    category: 'quality',
    name: '破图或占位图',
    description:
      'src 为空、缺失或是占位值的 <img> 标签上线就是破图框。请使用真实图片或生成的素材，或移除该标签。',
    skillSection: 'Imagery',
    skillGuideline: '失效的图片引用',
  },

  // ── Quality: general design and accessibility issues ──
  {
    id: 'script-error',
    category: 'quality',
    severity: 'error',
    name: '加载时出现 JavaScript 错误',
    description:
      '页面加载时有脚本抛出未捕获的异常或解析失败。坏掉的 JavaScript 会悄悄弄坏入场动画、交互和动态内容，甚至让大半个页面不可见。请先修好错误，再评判其他一切。',
  },
  {
    id: 'content-hidden-at-rest',
    category: 'quality',
    severity: 'error',
    scopes: ['layout'],
    name: '内容卡在等待出现',
    description:
      '页面的大部分文字即便在每个入场处理器都有机会运行之后，仍停留在 opacity 0 或 visibility hidden。这就是入场失败的签名：内容上线了，却从未变得可见。请让内容默认可见，让 JavaScript 增强它的入场，而不是用门槛决定它的存在。',
  },
  {
    id: 'edge-flush-cards',
    category: 'quality',
    scopes: ['layout'],
    name: '卡片紧贴滚动容器边缘',
    description:
      '横向滚动容器或标签面板里的卡片在静止时紧贴容器一侧边缘，另一侧却留着空隙，于是卡片边缘和圆角被切掉。通常是面板被设得比它的裁剪框更宽。请在两侧保持一致的留白。',
  },
  {
    id: 'text-occlusion',
    category: 'quality',
    scopes: ['layout'],
    name: '文字被其他元素遮挡',
    description:
      '文字被绘制在不透明元素或另一段文字之下，一部分无法阅读。装饰盒子、堆叠的层，或内边距泄漏的内联元素落在了文字上而不是文字旁边。请给重叠的层留出空间，或把文字从上层下面移出来。',
    skillSection: 'Layout & Space',
  },
  {
    id: 'first-viewport-column-overflow',
    category: 'quality',
    scopes: ['layout'],
    name: '开篇双栏失衡',
    description:
      '多栏开篇区块里有一栏远远跑出首屏，而它的兄弟栏在一个视口内就放下了，于是短栏漂浮在空白里，折叠线深深落进一个区块内部。请平衡各栏、限制高栏高度，或让长内容流到开篇行之下。',
    skillSection: 'Layout & Space',
  },
  {
    id: 'gray-on-color',
    category: 'quality',
    name: '彩色背景上的灰色文字',
    description:
      '灰色文字在彩色背景上显得发灰发白。请改用背景色的更深色调，或用白色/近白色保证对比。',
    skillSection: 'Color & Contrast',
    skillGuideline: '彩色背景上的灰色文字',
  },
  {
    id: 'low-contrast',
    category: 'quality',
    name: '低对比度文字',
    description:
      '文字未达到 WCAG AA 对比度要求（正文 4.5:1，大号文字 3:1）。请提高文字与背景之间的对比度。',
  },
  {
    id: 'layout-transition',
    category: 'quality',
    name: '布局属性动画',
    description:
      '对 width、height、padding、margin 做动画会造成布局抖动和卡顿。请改用 transform 和 opacity，高度动画可用 grid-template-rows。',
    skillSection: 'Motion',
    skillGuideline: '对布局属性做动画',
  },
  {
    id: 'line-length',
    category: 'quality',
    scopes: ['type', 'layout'],
    name: '行宽过长',
    description:
      '宽于约 80 字符的文字行难以阅读。眼睛回读到下一行行首时会找不到位置。请给文字容器加 max-width（65ch 到 75ch）。',
    skillSection: 'Layout & Space',
    skillGuideline: '行宽超过约 80 字符',
  },
  {
    id: 'cramped-padding',
    category: 'quality',
    scopes: ['layout'],
    name: '局促的内边距',
    description:
      '文字离容器边缘太近。两种形态：(1) 元素自带文字，而内边距相对字号过低；(2) 包裹层带有文字子元素，却对着可见边界（边框、outline 或非透明背景）只有近乎为零的内边距——子元素直接顶到边界线上。有边框、描边或彩色底色的容器内请至少加 8px（最好 12–16px）内边距。',
    skillSection: 'Layout & Space',
    skillGuideline: '边框或彩色容器内部',
  },
  {
    id: 'body-text-viewport-edge',
    category: 'quality',
    scopes: ['layout'],
    name: '正文顶到页面边缘',
    description:
      '正文段落直接贴着视口左右边缘渲染，没有任何容器提供水平内边距。请把内容包进至少有 16px（最好 24-32px）水平内边距的容器，或使用 max-width 配合 mx-auto。',
  },
  {
    id: 'tight-leading',
    category: 'quality',
    scopes: ['type'],
    name: '过小的行高',
    description:
      '行高低于字号的 1.3 倍会让多行文字难以阅读。正文请用 1.5 到 1.7，让行与行之间有呼吸的空间。',
  },
  {
    id: 'skipped-heading',
    category: 'quality',
    scopes: ['type'],
    name: '跳级的标题层级',
    description:
      '标题层级不应跳级（例如 h1 之后直接 h3，跳过 h2）。屏幕阅读器靠标题层级导航，跳级会破坏文档大纲。',
  },
  {
    id: 'heading-rhythm',
    category: 'quality',
    scopes: ['layout', 'type'],
    name: '标题离上一区块更近',
    description:
      '标题与它所引入的内容绑定，因此它上方的渲染空间应大于下方。当一页里各标题与上方区块的距离小于等于它与自己内容的距离时，每个区块读起来都像在给上一个区块配说明。请拉开每个标题上方的空间。',
    skillSection: 'Layout & Space',
  },
  {
    id: 'justified-text',
    category: 'quality',
    scopes: ['type'],
    name: '两端对齐的文本',
    description:
      '没有连字符断行的两端对齐会制造不均的词间距（"白色河流"）。正文请用 text-align: left；确需两端对齐，请开启 hyphens: auto。',
  },
  {
    id: 'tiny-text',
    category: 'quality',
    scopes: ['type'],
    name: '过小的正文字号',
    description:
      '低于 12px 的正文难以阅读，在高 DPI 屏幕上尤其如此。正文请至少用 14px，16px 最理想。',
  },
  {
    id: 'all-caps-body',
    category: 'quality',
    scopes: ['type'],
    name: '全大写正文',
    description:
      '大写的长段落难以阅读。我们靠单词的形状（上伸部和下伸部）识别词义，而全大写恰恰抹掉了形状。大写请只留给短标签和标题。',
    skillSection: 'Typography',
    skillGuideline: '大写的长段正文',
  },
  {
    id: 'wide-tracking',
    category: 'quality',
    scopes: ['type'],
    name: '正文的过宽字距',
    description:
      '正文字距超过 0.05em 会打散自然的字符组合、拖慢阅读。宽字距请只留给大写短标签。',
  },
  {
    id: 'text-overflow',
    category: 'quality',
    scopes: ['layout'],
    name: '内容溢出容器',
    description:
      '内容渲染得比容器更宽，溢出到外面或强制出现横向滚动条。请让文字换行、约束宽度，或给该区域一个刻意的滚动可供性。',
    skillSection: 'Layout & Space',
    skillGuideline: '内容比容器更宽',
  },
  {
    id: 'repeated-container-text',
    category: 'quality',
    name: '同一容器内重复相同文字',
    description:
      '同一段文字在一张卡片或面板内结构不同的位置重复出现三次以上，是冗余的信息——通常是某个状态或标签被接进了模板的每个槽位。请只说一次，说在最重要的槽位上。',
  },
  {
    id: 'clipped-overflow-container',
    category: 'quality',
    scopes: ['layout'],
    name: '被裁切的菜单与弹出层',
    description:
      '裁剪容器（overflow hidden 或 clip）包住绝对定位的子元素，会切断需要越界的提示框、菜单和弹出层。请让溢出可见，或把定位层移出裁剪容器。',
    skillSection: 'Layout & Space',
    skillGuideline: '溢出容器裁切定位子元素',
  },
  {
    id: 'design-system-font',
    category: 'quality',
    scopes: ['type'],
    name: '字体不在 DESIGN.md 中',
    description:
      '使用了未在 DESIGN.md 字体排印中声明的字体。请使用已记录的字体体系；若这是有意为之的品牌新增，请更新 DESIGN.md。',
    skillSection: 'Typography',
    skillGuideline: '字族超出项目设计系统',
  },
  {
    id: 'design-system-color',
    category: 'quality',
    severity: 'advisory',
    name: '颜色不在 DESIGN.md 中',
    description:
      '某个字面颜色不在 DESIGN.md 色板和随附的色调刻度之内。这可能是合理的，但它应当是有意的设计系统新增，而不是漂移。',
    skillSection: 'Color & Contrast',
    skillGuideline: '字面颜色超出项目设计系统',
  },
  {
    id: 'design-system-radius',
    category: 'quality',
    severity: 'advisory',
    name: '圆角不在 DESIGN.md 中',
    description:
      '某个 border-radius 值不在 DESIGN.md 圆角刻度之内。请使用已记录的圆角令牌；若新形状是有意的，请更新设计系统。',
    skillSection: 'Visual Details',
    skillGuideline: '圆角超出项目设计系统',
  },
  {
    id: 'design-system-font-size',
    category: 'quality',
    severity: 'advisory',
    scopes: ['type'],
    name: '字号不在 DESIGN.md 中',
    description:
      '某个字面 font-size 不在 DESIGN.md 字体排印所记录的字号刻度上。请使用已记录的字号档位；若新档位是有意的，请更新设计系统。',
    skillSection: 'Typography',
    skillGuideline: '字号超出项目设计系统',
  },

  // ── Common generated-UI tells ───────────────────────────────────────────
  {
    id: 'gpt-thin-border-wide-shadow',
    category: 'slop',
    severity: 'advisory',
    name: '发丝描边配大范围阴影',
    description:
      '发丝描边配上又宽又散的阴影，是反复出现的生成式界面签名。请二选一——清晰的边缘或柔和的海拔——而不是两者并用。',
    skillSection: 'Visual Details',
    skillGuideline: '发丝描边加大范围漫射阴影',
  },
  {
    id: 'repeating-stripes-gradient',
    category: 'slop',
    severity: 'advisory',
    name: '重复渐变条纹',
    description:
      '用作表面装饰的重复渐变条纹，是反复出现的生成式界面签名。请换上属于设计本身的纹理，或让表面保持素净。',
    skillSection: 'Visual Details',
    skillGuideline: '重复渐变装饰条纹',
  },
  {
    id: 'codex-grid-background',
    category: 'slop',
    severity: 'advisory',
    name: '装饰性网格线背景',
    description:
      '用发丝线性渐变层按固定像素单元平铺出的装饰性网格或线场背景，是反复出现的生成式界面签名。网格覆盖层请留给真正的画布、地图、蓝图或度量表面；其他地方请用产品结构或素净表面。',
    skillSection: 'Visual Details',
    skillGuideline: '双轴网格线渐变背景',
  },
  {
    id: 'theater-slop-phrase',
    category: 'slop',
    severity: 'advisory',
    name: '动辄斥为"表演"',
    description:
      '把事物一笔斥为"theater（表演）"是反复出现的生成式文案习惯。请直说这件事做到了什么、没做到什么。',
    skillSection: 'Copy',
    skillGuideline: '"表演"式措辞',
  },
  {
    id: 'image-hover-transform',
    category: 'slop',
    severity: 'advisory',
    name: '悬停时的图片变换',
    description:
      '悬停时缩放或旋转图片是反复出现的生成式界面签名。请让图像保持静止，或改用更克制、有目的的交互。',
    skillSection: 'Motion',
    skillGuideline: '悬停时缩放或旋转图片',
  },
];

const RULE_ENGINE_SUPPORT = {
  regex: new Set(['source', 'page-analyzer']),
  'static-html': new Set(['element', 'page']),
  browser: new Set(['element', 'page', 'layout']),
  visual: new Set(['visual-contrast']),
};

function getAntipattern(id) {
  return ANTIPATTERNS.find(rule => rule.id === id);
}

function getRulesForCategory(category) {
  return ANTIPATTERNS.filter(rule => rule.category === category);
}

function getRuleEngineSupport(engine) {
  return RULE_ENGINE_SUPPORT[engine] || new Set();
}

// Set of scope tags rules can declare (e.g. 'type', 'layout'). Used by the
// CLI --scope flag to narrow output to one design domain.
const RULE_SCOPES = new Set(
  ANTIPATTERNS.flatMap(rule => rule.scopes || []),
);

// Keep only findings whose rule declares at least one of the requested
// scopes. An empty scope list means no filtering (default CLI behavior).
function filterByScopes(findings, scopes = []) {
  if (!scopes || scopes.length === 0) return findings;
  const enabled = new Set(scopes);
  return findings.filter(f => {
    const rule = getAntipattern(f.antipattern);
    return (rule?.scopes || []).some(scope => enabled.has(scope));
  });
}

export {
  ANTIPATTERNS,
  RULE_SCOPES,
  RULE_ENGINE_SUPPORT,
  getAntipattern,
  getRulesForCategory,
  getRuleEngineSupport,
  filterByScopes,
};
