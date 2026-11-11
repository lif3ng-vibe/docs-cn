// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/docs/short-and-findable`:
 * keep each read short, lead each section with its summary, and write docs
 * that search finds.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'short-and-findable',
  placement: {parent: 'namespace:docs', slot: 'guides', order: 50},
  title: '短小且可检索',
  category: 'guide',
  description: '写出简短的分区，让人和智能体（agent）都能通过搜索找到。',
  sections: [
    {
      id: 'keep-each-read-short',
      title: '让每次阅读保持简短',
      content: [
        {
          type: 'prose',
          text: '读者一次只打开一个分区，所以每个分区只讲一个观点，控制在 30 行左右。任何超过 32 KB 的读取都会让 `{@command doctor}` 发出警告。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '当分区需要第二个观点时，把它拆成两个分区。',
            '一个话题控制在几个分区之内。超过五个时，在你的文档分区里拆成更多指南。',
            '多于一个分区的话题会按其分区列表呈现。读者可以按键打开单个分区，或用 `--full` 阅读整个话题。',
          ],
        },
        {
          type: 'code',
          lang: 'bash',
          code: '# The section list\n{@command docs acme/deploying}\n# One section\n{@command docs acme/deploying check-before-you-ship}\n# Everything\n{@command docs acme/deploying --full}',
        },
      ],
    },
    {
      id: 'lead-with-the-summary',
      title: '以摘要开头',
      content: [
        {
          type: 'prose',
          text: '分区的第一个 prose 块（或第一个列表项）就是它在分区列表与搜索结果中的摘要。让它用一两句话回答该分区的问题。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '摘要在大约 240 字符处截断。',
            '开头是代码块不算数：摘要取自下一个 prose 块。',
            '以答案开头，而不是背景。',
          ],
        },
        {
          type: 'code',
          lang: 'text',
          code: 'build-before-you-ship  Build before you ship - Build the app, then upload the `dist` folder.',
        },
      ],
    },
    {
      id: 'make-docs-findable',
      title: '让文档可被找到',
      content: [
        {
          type: 'prose',
          text: '在多于一个分区的话题中，标题命中查询、或用反引号点名查询的分区，排名高于正文中的词语。每个分区的标题都应写成读者会搜索的任务。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '用读者会输入的词命名任务，如 "Deploy to production"。避免 "Overview" 或 "Details" 这类标题。',
            '字段名、文件名与错误码放进反引号，如 `deployTarget`：在多于一个分区的话题里，搜索会把每一个当作关键词。',
            '摘要与正文里的其他词也能匹配，但排名低于标题与标识符。摘要会显示在每条命中之下，所以让它能回答查询。',
          ],
        },
      ],
    },
    {
      id: 'test-with-search',
      title: '用搜索测试',
      content: [
        {
          type: 'prose',
          text: '按新读者发现文档的方式测试它：搜索那个问题，确认第一条命中就能回答它。多词查询要加引号。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command search "place a doc" --type doc}',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '这个查询会返回本指南中演示如何放置文档的分区。',
            '在安装了你包的应用里运行同样的搜索；见 {@link generic:test-in-an-app}。',
          ],
        },
      ],
    },
  ],
};
