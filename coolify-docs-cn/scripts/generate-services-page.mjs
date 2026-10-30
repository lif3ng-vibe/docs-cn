import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { collectServices, root, servicesDir } from './services-data.mjs'

const outputFile = path.join(servicesDir, 'all.mdx')

/**
 * Derive alphabetical category order from the current service data.
 *
 * @param {{ category: string }[]} services
 * @returns {string[]}
 */
function buildCategoryOrder(services) {
  return [...new Set(services.map((service) => service.category))].sort((a, b) => a.localeCompare(b, 'en'))
}

/**
 * Render the generated `all.md` page content from categorized services.
 *
 * @param {{ name: string, slug: string, description: string, category: string }[]} services
 * @param {string[]} categoryOrder
 * @returns {string}
 */
function renderServicesPage(services, categoryOrder) {
  const grouped = new Map()

  for (const service of services) {
    const categoryServices = grouped.get(service.category) ?? []
    categoryServices.push(service)
    grouped.set(service.category, categoryServices)
  }

  for (const categoryServices of grouped.values()) {
    categoryServices.sort((a, b) => a.name.localeCompare(b.name, 'en'))
  }

  const sections = []

  for (const category of categoryOrder) {
    const categoryServices = grouped.get(category)

    if (!categoryServices || categoryServices.length === 0) {
      continue
    }

    sections.push(`## ${category}`)
    sections.push('')

    for (const service of categoryServices) {
      sections.push(`- [${service.name}](/services/${service.slug}) - ${service.description}`)
    }

    sections.push('')
  }

  return `---
title: 全部服务
description: Coolify 一键服务完整目录，涵盖 AI、分析、数据库、CMS、监控等各类应用。
layout: doc
---

# 全部服务

Coolify 全部一键服务的完整目录，按分类整理。

${sections.join('\n').trimEnd()}

---

想用可搜索的界面？访问我们的[交互式服务搜索](/services/overview)页面。

想申请新增服务，请查看我们的[贡献指南](https://github.com/coollabsio/coolify/blob/v4.x/CONTRIBUTING.md)。
`
}

/**
 * Generate the markdown page that lists every service by category.
 *
 * @returns {Promise<void>}
 */
async function generateServicesPage() {
  const services = (await collectServices()).filter((service) => !service.disabled)
  const categoryOrder = buildCategoryOrder(services)
  const content = renderServicesPage(services, categoryOrder)

  await writeFile(outputFile, content)
  console.log(`Generated ${path.relative(root, outputFile)} with ${services.length} services.`)
}

generateServicesPage().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
