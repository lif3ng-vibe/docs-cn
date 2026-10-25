// =====================================================================
// Testimonials data
//
// One source of truth for the homepage testimonials section. All marquee
// variants read from this list.
//
// Order is curated for impact: both marquee rows lead with the punchiest
// quotes (Ben Davis spotlight + the strongest punches) so the first
// viewport is loaded with the most memorable testimonials. The marquee
// component splits the array down the middle — first half drives row A,
// second half drives row B. Don't sort alphabetically; the order matters.
//
// Tweet text and avatar URLs were pulled from api.fxtwitter.com (a public
// JSON proxy for X.com). Quote text is verbatim except for: leading
// @-mention reply targets stripped, trailing self-links removed.
// Avatars live in site/public/assets/testimonials/<id>.jpg.
// =====================================================================

export const testimonials = [
  // ---- Row A: spotlight + heaviest hitters ----
  // Featured quote from a video on the Nerd Snipe Podcast.
  // No avatar (private @davis7 handle on Twitter); falls back to the coin.
  {
    id: 'davis7',
    handle: '@davis7',
    name: 'Ben Davis',
    role: 'Nerd Snipe Podcast 联合主播',
    source: 'video',
    quote: "真他妈好用，效果漂亮极了。太酷了。",
    tier: 'spotlight',
  },

  { id: 'MertcanDYuzer',   handle: '@MertcanDYuzer',   name: 'Mertcan Yüzer',
    avatar: '/assets/testimonials/MertcanDYuzer.jpg',
    url: 'https://x.com/MertcanDYuzer/status/2047058254878945560',
    quote: "Impeccable 比 Claude 自带的设计强" },

  { id: 'adrien_ninet',    handle: '@adrien_ninet',    name: 'Adrien Ninet',
    avatar: '/assets/testimonials/adrien_ninet.jpg',
    url: 'https://x.com/adrien_ninet/status/2041825321721458961',
    quote: "把你现在用的前端技能卸载掉，换成 Impeccable。" },

  { id: 'illscience',      handle: '@illscience',      name: 'Anish Acharya',
    avatar: '/assets/testimonials/illscience.jpg',
    url: 'https://x.com/illscience/status/2046953520449114555',
    quote: "把设计思维融入编码工作流的工具里，Impeccable 是最被低估的一个。" },

  { id: 'cathrynlavery-1', handle: '@cathrynlavery',   name: 'Cathryn Lavery',
    avatar: '/assets/testimonials/cathrynlavery-1.jpg',
    url: 'https://x.com/cathrynlavery/status/2055485368632295911',
    quote: "每当有人问我前端设计，我总是推荐 @impeccable_ai 插件。我对设计非常挑剔，它已经成了我日常工具栈的一部分。" },

  { id: 'IanAndrewsDC',    handle: '@IanAndrewsDC',    name: 'Ian Andrews',
    avatar: '/assets/testimonials/IanAndrewsDC.jpg',
    url: 'https://x.com/IanAndrewsDC/status/2029553242712002879',
    quote: "这大概才是 Figma Make 该有的样子。" },

  { id: 'carlrannaberg',   handle: '@carlrannaberg',   name: 'Carl Rannaberg',
    avatar: '/assets/testimonials/carlrannaberg.jpg',
    url: 'https://x.com/carlrannaberg/status/2053016778855305304',
    quote: "Impeccable 毫无疑问是市面上最好的 UI 设计技能。我每天都在用，也推荐给别人。做得很棒！💪" },

  { id: 'BowTiedGroundHo', handle: '@BowTiedGroundHo', name: 'BowTiedGroundHog',
    avatar: '/assets/testimonials/BowTiedGroundHo.jpg',
    url: 'https://x.com/BowTiedGroundHo/status/2055062377541091373',
    quote: "它把我交付复杂而精美设计的能力抬到了另一个层次。" },

  { id: 'ivanleomk',       handle: '@ivanleomk',       name: 'Ivan Leo',
    avatar: '/assets/testimonials/ivanleomk.jpg',
    url: 'https://x.com/ivanleomk/status/2041371674248147047',
    quote: "Impeccable 是我今年用过最好的技能。不敢相信它是免费的。" },

  { id: 'wanikwai',        handle: '@wanikwai',        name: 'Watson Cyrus Anikwai',
    avatar: '/assets/testimonials/wanikwai.jpg',
    url: 'https://x.com/wanikwai/status/2044973876963311928',
    quote: "Impeccable 真的太好用了。我爱它。" },

  { id: 'faizan10114-2',   handle: '@faizan10114',     name: 'Faizan Khan',
    avatar: '/assets/testimonials/faizan10114.jpg',
    url: 'https://x.com/faizan10114/status/2052872900324057321',
    quote: "谁敢说 Impeccable 半句坏话我就跟谁急，告诉我他们是谁就行。" },

  { id: 'Hicker_Moledao',  handle: '@Hicker_Moledao',  name: 'Hickerzed',
    avatar: '/assets/testimonials/Hicker_Moledao.jpg',
    url: 'https://x.com/Hicker_Moledao/status/2057451530459160942',
    quote: "我试用过很多提升 AI 美感的 UI 设计工具，这是我用过最好、最惊艳的一个。" },

  { id: 'largePrawn',      handle: '@largePrawn',      name: 'Tony Ge',
    avatar: '/assets/testimonials/largePrawn.jpg',
    url: 'https://x.com/largePrawn/status/2054644203330961471',
    quote: "兄弟你这东西风格也太野了" },

  { id: 'karatzas_thomas', handle: '@karatzas_thomas', name: 'Thomas Karatzas',
    avatar: '/assets/testimonials/karatzas_thomas.jpg',
    url: 'https://x.com/karatzas_thomas/status/2052753026864042368',
    quote: "@impeccable_ai 真的很棒，这是我第一次真切感受到 AI 带来 10 倍生产力提升。而我可是尽量把工具都试个遍的人。" },

  { id: 'faizan10114',     handle: '@faizan10114',     name: 'Faizan Khan',
    avatar: '/assets/testimonials/faizan10114.jpg',
    url: 'https://x.com/faizan10114/status/2052620908615917922',
    quote: "今天才知道 Impeccable 是你做的。起码有 3 个客户转化要归功于你。感谢做出这么棒的工具。" },

  { id: 'MikitaHQ',        handle: '@MikitaHQ',        name: 'Mikita',
    avatar: '/assets/testimonials/MikitaHQ.jpg',
    url: 'https://x.com/MikitaHQ/status/2043352324047774008',
    quote: "用 @conductor_build 和 @impeccable_ai，两小时就上线了一个落地页。从想法到生产，比大多数人挑个字体的时间还短 ;))" },

  // ---- Row B: second-tier punches + substance ----

  { id: 'vandotorres',     handle: '@vandotorres',     name: 'Servando',
    avatar: '/assets/testimonials/vandotorres.jpg',
    url: 'https://x.com/vandotorres/status/2042263432448090256',
    quote: "就是这个。这玩意儿真管用。" },

  { id: 'eclecticV',       handle: '@eclecticV',       name: 'Vishveshwar Jatain',
    avatar: '/assets/testimonials/eclecticV.jpg',
    url: 'https://x.com/eclecticV/status/2042086081827623331',
    quote: "在我看来，这是有史以来最好的插件。" },

  { id: 'nik_ska',         handle: '@nik_ska',         name: 'Nik',
    avatar: '/assets/testimonials/nik_ska.jpg',
    url: 'https://x.com/nik_ska/status/2037158216488919184',
    quote: "Claude 技能大多徒有虚名。这几个是罕见的真正有用的。" },

  { id: 'HeyZohaib',       handle: '@HeyZohaib',       name: 'Zohaib A.',
    avatar: '/assets/testimonials/HeyZohaib.jpg',
    url: 'https://x.com/HeyZohaib/status/2047568264273023058',
    quote: "这居然是免费的？？🔥🔥" },

  { id: 'IceCreamChai',    handle: '@IceCreamChai',    name: 'Sankalp Mukim',
    avatar: '/assets/testimonials/IceCreamChai.jpg',
    url: 'https://x.com/IceCreamChai/status/2056718266593341867',
    quote: "@impeccable_ai 竟然免费，太离谱了。它取代了好几款付费产品，还比它们更好。" },

  { id: 'michaelhedgpeth', handle: '@michaelhedgpeth', name: 'Michael Hedgpeth',
    avatar: '/assets/testimonials/michaelhedgpeth.jpg',
    url: 'https://x.com/michaelhedgpeth/status/2045283339264028817',
    quote: "从原型到生产，@impeccable_ai 在每个阶段都帮了大忙。它实实在在提升了我们的水准。我想不出有什么开箱即用的东西能取代它。" },

  { id: 'littlemartta',    handle: '@littlemartta',    name: 'martta_xu',
    avatar: '/assets/testimonials/littlemartta.jpg',
    url: 'https://x.com/littlemartta/status/2039038639087194470',
    quote: "Impeccable 是我现在用过最好的前端设计技能，把其他选择远远甩在身后。" },

  { id: 'Paul_Kinlan',     handle: '@Paul_Kinlan',     name: 'Paul Kinlan',
    avatar: '/assets/testimonials/Paul_Kinlan.jpg',
    url: 'https://x.com/Paul_Kinlan/status/2047580124141310457',
    quote: "这太不可思议了。开发者和设计师的工作流正在快速变化，而且是在变好。" },

  { id: 'JASHANGUPTA15',   handle: '@JASHANGUPTA15',   name: 'Jashan Gupta',
    avatar: '/assets/testimonials/JASHANGUPTA15.jpg',
    url: 'https://x.com/JASHANGUPTA15/status/2057568922443133188',
    quote: "最近在我的个人作品集上用了这个技能，直接被震撼。在 Claude Code 上迭代了好几轮，几乎没碰 Figma。" },

  { id: 'sid_hori',        handle: '@sid_hori',        name: 'Sidney Hori Hawthorne',
    avatar: '/assets/testimonials/sid_hori.jpg',
    url: 'https://x.com/sid_hori/status/2030486593048326567',
    quote: "这太🔥了。我的落地页之前看起来百分之百是凭感觉瞎写的。现在我觉得它像样多了，过程也很有意思。" },

  { id: 'billzh',          handle: '@billzh',          name: 'billzh',
    avatar: '/assets/testimonials/billzh.jpg',
    url: 'https://x.com/billzh/status/2035525691085603172',
    quote: "很高兴我们再也不用碰 Figma 了。直接用 @paper 配 Impeccable 的 Claude 技能，跑上 8 个智能体就行。" },

  { id: 'johnennis',       handle: '@johnennis',       name: 'John Ennis',
    avatar: '/assets/testimonials/johnennis.jpg',
    url: 'https://x.com/johnennis/status/2038248854726791481',
    quote: "Impeccable 是个非常好的技能。我每天都要用上好几次，效果天差地别。" },

  { id: 'devsome_sh',      handle: '@devsome_sh',      name: 'Somesh',
    avatar: '/assets/testimonials/devsome_sh.jpg',
    url: 'https://x.com/devsome_sh/status/2049193038447264007',
    quote: "用更好的 UI、UX 和品牌感升级了一个内部工具，还减少了 AI slop。这为项目本身立下了标准。" },

  { id: 'alejandroreyes',  handle: '@alejandroreyes',  name: 'Alejandro Reyes',
    avatar: '/assets/testimonials/alejandroreyes.jpg',
    url: 'https://x.com/alejandroreyes/status/2055495489777434973',
    quote: "真的太好用了。" },

  { id: 'EmreCoklar',      handle: '@EmreCoklar',      name: 'Emre Coklar',
    avatar: '/assets/testimonials/EmreCoklar.jpg',
    url: 'https://x.com/EmreCoklar/status/2036873830191251677',
    quote: "这是唯一一套我真觉得有用的智能体技能。感谢你们做出它。" },
];

// Helpers used by the marquee variants
export const spotlight = testimonials.find(t => t.tier === 'spotlight');
