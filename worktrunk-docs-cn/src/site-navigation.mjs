// Sidebar order is authored here. Each page's `sidebar.order` frontmatter must
// agree with it: the docs sync test reads that value to order
// `docs/public/llms.txt`, and `test_sidebar_matches_frontmatter_order` fails
// when the two disagree.
export const sidebar = [
  { label: '概览', link: '/' },
  { label: '安装', link: '/#安装' },
  {
    label: '命令',
    items: [
      { label: 'wt switch', link: '/switch/' },
      { label: 'wt list', link: '/list/' },
      { label: 'wt merge', link: '/merge/' },
      { label: 'wt remove', link: '/remove/' },
      { label: 'wt config', link: '/config/' },
      { label: 'wt step', link: '/step/' },
      { label: 'wt hook', link: '/hook/' },
    ],
  },
  {
    label: '指南',
    items: [
      { label: 'Agent 集成', link: '/claude-code/' },
      { label: '扩展 Worktrunk', link: '/extending/' },
      { label: 'LLM 提交信息', link: '/llm-commits/' },
      { label: '技巧与模式', link: '/tips-patterns/' },
      { label: 'Shell 集成', link: '/shell-integration/' },
      { label: '常见问题', link: '/faq/' },
    ],
  },
];
