// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// hub Pages deploy injection (no env = local dev root path)
const DOCS_SITE = process.env.DOCS_SITE || 'http://localhost:4321';
const DOCS_BASE = (process.env.DOCS_BASE || '/').replace(/\/+$/, '') || '/';

// [sidebar group label, docs subdirectory]
const DIVISIONS = [
  ['Strategy (NEXUS)', 'strategy'],
  ['Academic', 'academic'],
  ['Design', 'design'],
  ['Engineering', 'engineering'],
  ['Finance', 'finance'],
  ['Game Development', 'game-development'],
  ['GIS', 'gis'],
  ['Healthcare', 'healthcare'],
  ['Marketing', 'marketing'],
  ['Paid Media', 'paid-media'],
  ['Product', 'product'],
  ['Project Management', 'project-management'],
  ['Research', 'research'],
  ['Sales', 'sales'],
  ['Security', 'security'],
  ['Spatial Computing', 'spatial-computing'],
  ['Specialized', 'specialized'],
  ['Support', 'support'],
  ['Testing', 'testing'],
  ['Examples', 'examples'],
  ['Tool Integrations', 'integrations'],
];

export default defineConfig({
  site: DOCS_SITE,
  base: DOCS_BASE,
  integrations: [
    starlight({
      title: 'Agency Agents (English Mirror)',
      description: 'Unofficial English mirror of the msitarzewski/agency-agents docs -- a 300+ agent agency with 18 divisions plus the NEXUS strategy playbook.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Start',
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