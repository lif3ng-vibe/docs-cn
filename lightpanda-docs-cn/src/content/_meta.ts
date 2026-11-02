import { siteDetails } from '@lightpanda/common/data/siteDetails'
import type { MetaRecord } from 'nextra'

const meta: MetaRecord = {
  'back-to-website': {
    title: '返回官网',
    type: 'page',
    href: siteDetails.siteUrl,
  },
  index: {
    title: '简介',
    theme: {
      breadcrumb: false,
    },
  },
  quickstarts: {
    title: '快速上手',
    theme: {},
  },
  'run-locally': '本地运行',
  'run-on-lightpanda-cloud': '使用 Lightpanda Cloud',
  usage: '用法',
  guides: '指南',
  'core-concepts': '核心概念',
  reference: '参考',
}

export default meta
