// Local stub of the private `@lightpanda/common/data/siteDetails` module.
// Values mirror the live site metadata (https://lightpanda.io).
export const siteDetails = {
  siteName: 'Lightpanda',
  siteUrl: 'https://lightpanda.io',
  siteGenerator: 'Next.js',
  docsRepositoryBase: 'https://github.com/lightpanda-io/docs/blob/main',
  socials: [
    { name: 'GitHub', url: 'https://github.com/lightpanda-io/browser' },
    { name: 'Discord', url: 'https://discord.gg/K63XeymfB5' },
    { name: 'X', url: 'https://x.com/lightpanda_io' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/company/102175668' },
  ],
  metadata: {
    description:
      'Lightpanda is a fast, memory-efficient headless browser built for AI agents, automation, and web scraping.',
    keywords: [
      'browser',
      'headless',
      'ai',
      'llm',
      'crawler',
      'automation',
      'scraping',
      'zig',
      'agentic',
      'finetuning',
    ],
    opengraph: {
      type: 'website',
      siteName: 'Lightpanda',
      images: [
        {
          url: 'https://cdn.lightpanda.io/website/assets/images/opengraph/og.png',
          width: 1200,
          height: 630,
          alt: 'Lightpanda',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@lightpanda_io',
      images: ['https://cdn.lightpanda.io/website/assets/images/opengraph/tw.png'],
    },
    robots: 'index, follow',
  },
}
