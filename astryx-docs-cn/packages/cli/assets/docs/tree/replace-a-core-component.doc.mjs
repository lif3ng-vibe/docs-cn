// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/components/replace-a-core-component`:
 * intentionally make an integration component the default for a Core identity.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'replace-a-core-component',
  placement: {parent: 'namespace:components', slot: 'guides', order: 50},
  title: '替换 Core 组件',
  category: 'guide',
  description:
    '只有当集成需要有意识地接管某个 Core 组件身份时，才使用组件替换。',
  sections: [
    {
      id: 'decide-whether-to-replace',
      title: '判断是否替换',
      content: [
        {
          type: 'prose',
          text: '大多数组件不应使用 `replaces`。给新组件起自己的名字，让应用显式选择它。只有当你的组件必须在集成生效的所有地方成为某个 Core 身份的默认选择时，才替换 Core。',
        },
        {type: 'heading', level: 3, text: '适用场景'},
        {
          type: 'list',
          style: 'unordered',
          items: [
            '你的组件有意承担与某个特定 Core 组件相同的角色。',
            '每个加载集成的应用都应从不带限定名的组件详情、`component --list`、搜索、`swizzle <Name>` 与 issue 路由中获得你的组件。',
            '你已经测试过替换组件以及显式访问原 Core 组件这两种路径。',
          ],
        },
        {type: 'heading', level: 3, text: '不适用场景'},
        {
          type: 'list',
          style: 'unordered',
          items: [
            '你的组件是备选方案、变体、包装器或产品专属扩展。请给它起一个独特的名字。',
            '你只是想解决一次意外的命名冲突。',
            '你只想在某个界面或工作流中使用替换组件。替换会作用于集成生效的整个应用。',
          ],
        },
      ],
    },
    {
      id: 'set-the-replacement',
      title: '设置替换',
      content: [
        {
          type: 'code',
          lang: 'javascript',
          label: 'components/AcmeSideNav.doc.mjs',
          code: `/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export default {
  type: 'component',
  name: 'AcmeSideNav',
  displayName: 'Acme Side Nav',
  replaces: 'SideNav',
  import: '@acme/astryx-widgets/components/AcmeSideNav',
  usage: {description: 'Product navigation for Acme apps.'},
  props: [],
};`,
        },
        {
          type: 'prose',
          text: '全部字段见 {@link schema:component-doc}。',
        },
        {
          type: 'prose',
          text: '只有当你的包声明了启用替换的首个 CLI 版本时，替换才会生效。在其 `package.json` 中加入：',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'package.json',
          code: `{
  "peerDependencies": {"@astryxdesign/cli": ">=0.6.7"},
  "peerDependenciesMeta": {"@astryxdesign/cli": {"optional": true}}
}`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '任何从该版本或更高版本起始的 `@astryxdesign/cli` 范围都会启用替换，包括已发布的 0.6.4 与 0.6.5 中 `integration add doc --parent` 写入的 `>=0.7.0`，以及已发布的 0.6.5 中 `integration add theme` 写入的范围。',
            '没有这类范围时，组件保留自己的名字，Core 组件保持被选中（与目标同名的组件在该裸名下依旧有歧义，与之前一样），`doctor integration components` 会警告并给出应添加的范围。加载这种包的应用看不到任何变化。',
            '`replaces` 指向 Core 的 `ComponentDoc` 身份，而不是它的显示标签、import 路径或独立 Hook。',
            '你的组件可以保留独特的名字，也可以与目标同名。在忽略 `replaces` 的旧版 CLI 上，独特的名字仍可直接访问。',
            '`--package @astryxdesign/core` 始终选择原 Core 组件；`--package` 加你的包则可用任一名字选择你的组件。',
            '替换 `SideNav` 只替换这一个名字。`SideNavItem` 与其他 SideNav 部件仍是 Core 组件；你的包提供的部件应在各自的名字下编写文档。',
            '`swizzle --list` 列出 Core 组件，包括你替换的那个。`swizzle SideNav` 复制你的组件，`swizzle SideNav --package @astryxdesign/core` 复制原组件。',
          ],
        },
      ],
    },
    {
      id: 'check-replacement-resolution',
      title: '检查替换解析',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: '{@command doctor integration components}\n{@command component SideNav}\n{@command component AcmeSideNav}\n{@command component SideNav --package @astryxdesign/core}',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '包声明范围后，目标缺失、值非法、同一包内对同一目标的第二个替换、或以另一个 Core 组件命名的替换都是错误。没有范围时，`doctor integration components` 将其中每一项作为警告报告。',
            '多个集成替换同一目标时，显式配置优先于自动选择。在显式配置的集成中，较后的包胜出且 Doctor 会警告。仅在全部为自动链接的集成之间，`package.json` 中列在后面的依赖胜出且 Doctor 会警告。',
          ],
        },
      ],
    },
    {
      id: 'global-mode',
      title: '全局模式',
      content: [
        {
          type: 'prose',
          text: '全局模式下：为整台电脑安装的包所提供的替换在项目之外的文件夹生效；项目内只有项目安装的包所提供的替换生效。见 {@link namespace:global} 和 {@link generic:global-integrations}。',
        },
      ],
    },
  ],
};
