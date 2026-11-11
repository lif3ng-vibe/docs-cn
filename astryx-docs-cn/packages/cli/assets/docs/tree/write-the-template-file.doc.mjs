// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/build-the-template/write-the-template-file`:
 * what gets copied, where the copied file lands, and the imports and
 * export a copied template needs.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'write-the-template-file',
  placement: {
    parent: 'namespace:build-the-template',
    slot: 'guides',
    order: 10,
  },
  title: '编写模板文件',
  category: 'guide',
  description:
    'Astryx 只把这一个文件复制进应用，因此要让它在那里能独立工作：它会落到哪里、可以导入什么、以及要导出什么。',
  sections: [
    {
      id: 'know-what-gets-copied',
      title: '了解会被复制的内容',
      content: [
        {
          type: 'prose',
          text: '`{@command template}` 只复制一个源文件。它不会复制同目录的辅助文件、样式表、字体、图标、图片或媒体。在添加配套文件之前，先为这一点做好规划。',
        },
        {
          type: 'table',
          headers: ['模板', '目录目标', '显式文件目标'],
          rows: [
            ['页面（page）', '写入 `<target>/page.tsx`', '写入给定的确切文件路径'],
            [
              '区块（block）',
              '写入 `<target>/<source-basename>.tsx`',
              '写入给定的确切文件路径',
            ],
          ],
        },
        {
          type: 'code',
          lang: 'bash',
          code: `# Page: src/app/account/page.tsx
{@command template acme-account src/app/account}

# Block: src/features/account/acme-stat-card.tsx
{@command template acme-stat-card src/features/account}

# Exact destination for either kind
{@command template acme-stat-card src/features/account/StatusCard.tsx}`,
        },
        {
          type: 'prose',
          text: '除非调用方传入 `--overwrite` 或 `-f`，否则 Astryx 会拒绝覆盖已有文件。',
        },
      ],
    },
    {
      id: 'keep-edited-code-in-one-file',
      title: '把要编辑的代码放在一个文件里',
      content: [
        {
          type: 'prose',
          text: '把应用预期会编辑的每个辅助实现都放进模板源文件。小型的局部组件、示例数据、常量与事件处理器可以放在同一文件中默认组件的上方或下方。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '当辅助实现属于可编辑起点的一部分时，将其内联。',
            '只有当辅助实现应由包持有并随包更新时，才把它移入集成包。',
            '不要导入 `./helper`、`./styles` 或任何其他同目录文件。',
            '不要在运行时创建路由、配置或额外文件。给应用一个明确的、可持有的源文件。',
          ],
        },
      ],
    },
    {
      id: 'use-imports-that-work',
      title: '使用在应用中可用的导入',
      content: [
        {
          type: 'prose',
          text: '复制之后，导入是从应用出发解析的，而不是从模板目录。每个裸导入（bare import）都必须指向应用安装的包，且每个包路径必须是公开的。',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {HStack} from '@astryxdesign/core/HStack';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {AcmeStatusCard} from '@acme/astryx-widgets/components/AcmeStatusCard';

const metrics = [
  {label: 'Healthy accounts', value: '1,248'},
  {label: 'Needs review', value: '37'},
];

function MetricRow({label, value}: {label: string; value: string}) {
  return (
    <HStack justify="between">
      <Text>{label}</Text>
      <Text>{value}</Text>
    </HStack>
  );
}

export default function AcmeAccountSummary() {
  return (
    <Card>
      <VStack gap={4}>
        <AcmeStatusCard />
        {metrics.map(metric => <MetricRow key={metric.label} {...metric} />)}
        <Button label="Review accounts" />
      </VStack>
    </Card>
  );
}`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '从 Core 的公共路径导入 Astryx 组件。',
            '集成包持有的组件、辅助实现、图标或样式，只通过该包导出的路径导入（{@link generic:export-template-assets}）。',
            '当 Astryx 或平台 API 已提供相应行为时，避免再引入另一个库。',
          ],
        },
      ],
    },
    {
      id: 'export-one-component',
      title: '导出一个组件',
      content: [
        {
          type: 'prose',
          text: '源文件必须默认导出一个 React 组件。文件内的具名辅助实现没有问题。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '只有当 Hook、事件处理器、浏览器 API，或作为 prop 传入的组件（例如 `icon={BellIcon}`）需要客户端边界时，才把 `use client` 作为第一条语句加上。',
            '当模板不需要客户端行为时，保持其为服务端兼容的静态模板。',
          ],
        },
      ],
    },
  ],
};
