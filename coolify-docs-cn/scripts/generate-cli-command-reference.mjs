import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, 'content/docs/cli/command-reference/commands')
const repository = 'https://github.com/coollabsio/coolify-cli.git'
const excludedGroups = new Set(['init', 'firewall'])
const singletonSlugs = new Map([
  ['cli', 'global-options'],
  ['resource', 'resources'],
])
const groupOrder = [
  'cli',
  'context',
  'app',
  'database',
  'service',
  'deploy',
  'project',
  'resource',
  'server',
  'destination',
  'cloud-token',
  'cloud-init',
  's3',
  'github',
  'gitlab',
  'notification',
  'shared-env',
  'teams',
  'private-key',
  'tag',
  'mcp',
  'completion',
  'config',
  'version',
  'update',
]

function escapeCell(value) {
  return value
    .replaceAll('|', '\\|')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('{', '&#123;')
    .replaceAll('}', '&#125;')
}

function escapeMdxText(value) {
  return value
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('{', '&#123;')
    .replaceAll('}', '&#125;')
}

function getGroup(command) {
  const parts = command.split(/\s+/)
  return parts[1] && !parts[1].startsWith('<') && !parts[1].startsWith('[') ? parts[1] : 'cli'
}

function getPageTitle(command, group) {
  let remainder = command.replace(/^coolify\s*/, '')
  if (group !== 'cli') remainder = remainder.replace(new RegExp(`^${group}\\s*`), '')

  const words = remainder
    .split(/\s+/)
    .filter((token) => token && !token.startsWith('<') && !token.startsWith('['))
    .map((token) => token.replaceAll('-', ' '))

  if (group === 'resource' && words.length === 1 && words[0] === 'list') return 'List resources'
  if (words.length > 0) {
    const title = words.join(' ')
    return title.charAt(0).toUpperCase() + title.slice(1)
  }
  if (group === 'cli') return 'Global options'
  return group
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function parseCatalog(source) {
  const marker = '\n## Command Reference\n'
  const reference = source.split(marker, 2)[1]
  if (!reference) throw new Error('llms-full.txt does not contain a Command Reference section.')

  const records = []
  for (const block of reference.trim().split(/\n(?=Command: )/)) {
    const lines = block.split('\n')
    if (!lines[0]?.startsWith('Command: ')) continue

    const command = lines[0].slice('Command: '.length).trim()
    const parameters = []
    let description = ''

    for (let index = 1; index < lines.length; index += 1) {
      const line = lines[index]
      if (line.startsWith('Description: ')) {
        description = line.slice('Description: '.length).trim()
        continue
      }
      if (!line.startsWith('  - name: ')) continue

      const parameter = {
        name: line.slice('  - name: '.length).trim(),
        type: 'string',
        description: '',
        required: 'false',
        default: '',
      }
      index += 1
      while (index < lines.length && lines[index].startsWith('    ')) {
        const match = lines[index].match(/^    (type|description|required|default):\s*(.*)$/)
        if (match) parameter[match[1]] = match[2].trim()
        index += 1
      }
      index -= 1
      parameters.push(parameter)
    }

    const group = getGroup(command)
    if (!excludedGroups.has(group)) records.push({ command, description, parameters, group })
  }
  return records
}

function getOperationSlug(command, group) {
  if (group === 'cli') return 'overview'
  const operation = command
    .split(/\s+/)
    .slice(2)
    .filter((token) => !token.startsWith('<') && !token.startsWith('['))
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return operation || 'overview'
}

function renderPage({ command, description, parameters, group }) {
  const title = getPageTitle(command, group)
  const page = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    '---',
    '',
    `# ${title}`,
    '',
    escapeMdxText(description),
    '',
    '## 用法',
    '',
    '```sh',
    command,
    '```',
  ]

  if (parameters.length > 0) {
    page.push(
      '',
      '## 选项',
      '',
      '| 选项 | 类型 | 必填 | 默认值 | 说明 |',
      '| :--- | :--- | :---: | :--- | :--- |',
    )
    for (const parameter of parameters) {
      const required = parameter.required === 'true' ? '是' : '否'
      const defaultValue = parameter.default ? `\`${escapeCell(parameter.default)}\`` : '—'
      page.push(
        `| \`${escapeCell(parameter.name)}\` | \`${escapeCell(parameter.type)}\` | ${required} | ${defaultValue} | ${escapeCell(parameter.description)} |`,
      )
    }
  }

  const helpCommand = command.split(/\s+(?=[<[])/, 1)[0]
  page.push(
    '',
    '## 查看当前帮助',
    '',
    '```sh',
    `${helpCommand} --help`,
    '```',
    '',
    '已安装 CLI 的帮助信息会反映你的 CLI 版本实际支持的选项。',
    '',
  )
  return page.join('\n')
}

async function generate(source) {
  const records = parseCatalog(source)
  const groupCounts = new Map()
  const groups = new Map()
  for (const record of records) groupCounts.set(record.group, (groupCounts.get(record.group) ?? 0) + 1)

  await rm(output, { recursive: true, force: true })
  await mkdir(output, { recursive: true })

  for (const record of records) {
    const singleton = groupCounts.get(record.group) === 1
    const operationSlug = getOperationSlug(record.command, record.group)
    const items = groups.get(record.group) ?? []
    let slug = operationSlug
    let suffix = 2
    while (items.some((item) => item.slug === slug)) slug = `${operationSlug}-${suffix++}`

    const outputSlug = singleton ? (singletonSlugs.get(record.group) ?? record.group) : slug
    const folder = singleton ? output : path.join(output, record.group)
    await mkdir(folder, { recursive: true })
    await writeFile(path.join(folder, `${outputSlug}.mdx`), renderPage(record))
    items.push({ slug: outputSlug, command: record.command })
    groups.set(record.group, items)
  }

  for (const [group, items] of groups) {
    items.sort((a, b) => a.command.localeCompare(b.command))
    if (items.length === 1) continue
    const title = group
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    await writeFile(
      path.join(output, group, 'meta.json'),
      `${JSON.stringify({ title, pages: items.map((item) => item.slug) }, null, 2)}\n`,
    )
  }

  const orderedGroups = groupOrder.filter((group) => groups.has(group))
  orderedGroups.push(...[...groups.keys()].filter((group) => !groupOrder.includes(group)).sort())
  const pages = orderedGroups.map((group) => {
    const items = groups.get(group)
    return items.length === 1 ? items[0].slug : group
  })
  await writeFile(path.join(output, 'meta.json'), `${JSON.stringify({ title: '命令', pages }, null, 2)}\n`)

  console.log(`Generated ${records.length} command pages in ${groups.size} groups.`)
}

async function main() {
  // Allow building without network access to GitHub (e.g. offline mirrors):
  // point COOLIFY_CLI_CATALOG_FILE at a local copy of llms-full.txt to skip the clone.
  const catalogOverride = process.env.COOLIFY_CLI_CATALOG_FILE
  if (catalogOverride) {
    console.log(`Using local CLI command catalog: ${catalogOverride}`)
    await generate(await readFile(catalogOverride, 'utf8'))
    return
  }

  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'coolify-cli-'))
  const cloneDirectory = path.join(temporaryDirectory, 'repository')

  try {
    console.log('Downloading the latest Coolify CLI command catalog...')
    execFileSync('git', ['clone', '--depth', '1', '--single-branch', '--quiet', repository, cloneDirectory], {
      stdio: 'inherit',
    })
    const source = await readFile(path.join(cloneDirectory, 'llms-full.txt'), 'utf8')
    await generate(source)
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
