// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// hub Pages 部署注入（无 env 时本地开发走根路径）
const DOCS_SITE = process.env.DOCS_SITE || 'http://localhost:4321';
const DOCS_BASE = (process.env.DOCS_BASE || '/').replace(/\/+$/, '') || '/';

// [中文侧边栏组名, docs 子目录]
const DIVISIONS = [
  ['战略手册（NEXUS）', 'strategy'],
  ['学术', 'academic'],
  ['设计', 'design'],
  ['工程', 'engineering'],
  ['金融', 'finance'],
  ['游戏开发', 'game-development'],
  ['GIS（地理信息）', 'gis'],
  ['医疗健康', 'healthcare'],
  ['市场营销', 'marketing'],
  ['付费媒体', 'paid-media'],
  ['产品', 'product'],
  ['项目管理', 'project-management'],
  ['研究', 'research'],
  ['销售', 'sales'],
  ['安全', 'security'],
  ['空间计算', 'spatial-computing'],
  ['专项', 'specialized'],
  ['客户支持', 'support'],
  ['测试', 'testing'],
  ['示例', 'examples'],
  ['工具集成', 'integrations'],
];

export default defineConfig({
  site: DOCS_SITE,
  base: DOCS_BASE,
  integrations: [
    starlight({
      title: 'Agency Agents 中文镜像',
      description: 'msitarzewski/agency-agents 的中文翻译镜像——一支 300+ 专业智能体组成的"代理公司"完整名册与战略手册。',
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: '开始',
          items: [
            { slug: 'index' },
            { slug: 'catalog' },
            { slug: 'contributing' },
            { slug: 'security' },
          ],
        },
        ...DIVISIONS.map(([label, directory]) => ({
          label,
          items: [{ autogenerate: { directory } }],
        })),
      ],
    }),
  ],
});