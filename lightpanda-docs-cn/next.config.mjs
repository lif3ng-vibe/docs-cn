import nextra from 'nextra'
import { basePath, redirects } from './redirects.mjs'

const withNextra = nextra({ search: { codeblocks: true } })

export default withNextra({
  basePath,
  transpilePackages: ['@lightpanda/common'],
  outputFileTracingRoot: import.meta.dirname,
  // 目录式产物（x/index.html）：与上游原站 URL 尾斜杠形态一致，
  // GitHub Pages 目录部署下 /x/ 可直出（文件式 x.html 会 404）
  trailingSlash: true,
  output: 'export',
  images: { unoptimized: true },
  // Note: redirects() is honored only by the Node server (next dev / next
  // start). With `output: 'export'` Next drops them, so the same `redirects`
  // map is turned into static stub pages by scripts/generate-redirects.mjs.
  redirects: () =>
    Object.entries(redirects).map(([from, to]) => ({
      source: from,
      destination: to,
      permanent: true,
    })),
})
