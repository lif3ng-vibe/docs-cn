// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs migration/component-migration`: migrate the app frame,
 * map shadcn/Radix primitives, and wire up command palette, settings, and
 * theme controls.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'component-migration',
  title: '组件迁移',
  placement: {parent: 'namespace:migration', slot: 'guides', order: 20},
  category: 'guide',
  description:
    '先迁移应用框架，把 shadcn 和 Radix 原语映射到组件，再接好命令面板、设置与主题控件。',
  keywords: [
    'Button',
    'TextInput',
    'CommandPalette',
  ],

  sections: [
    {
      title: '先迁移应用框架',
      content: [
        {
          type: 'prose',
          text: '从 AppShell 开始，让页面迁移在最终的导航、间距、表面与响应式框架内进行。由于每个路由都共享同一个 shell，主题与颜色问题也会更早暴露。',
        },
        {
          type: 'table',
          headers: ['旧版结构', '组件', '说明'],
          rows: [
            ['页头', 'TopNav', '用于产品标识、全局操作、账户入口和命令/搜索触发器。'],
            ['侧边栏', 'SideNav', '用分区与嵌套导航项表示路由组；选中状态保持由路由器驱动。'],
            ['主页面包装层', 'AppShell + Layout', '持久结构交给 shell；页面内容交给路由组件。'],
            ['移动端抽屉导航', 'MobileNav 或 AppShell 移动端行为', '在窄视口上验证焦点、关闭行为与路由切换。'],
            ['设置菜单', 'Popover + Layout + Switch', '作为主题模式与应用偏好设置的落脚点。'],
          ],
        },
      ],
    },
    {
      title: '映射 shadcn 与 Radix 原语',
      content: [
        {
          type: 'prose',
          text: '不要用设计系统样式去包一层旧的 shadcn 组件。用真正负责行为、无障碍、状态类与令牌用法的组件替换原语。',
        },
        {
          type: 'table',
          headers: ['现有原语', '组件', '迁移说明'],
          rows: [
            ['button / shadcn Button', 'Button 或 IconButton', '带文字的命令用 Button；仅图标的工具栏操作用 IconButton。'],
            ['input', 'TextInput', '校验状态放在 status prop 里，不要用临时加的边框类。'],
            ['textarea', 'TextArea', '多行编辑是主要操作时使用。'],
            ['switch', 'Switch', '用于持久化的布尔设置；主题模式若表现为二元选择也适用。'],
            ['checkbox', 'CheckboxInput 或 CheckboxList', '分组选择用列表变体。'],
            ['radio group', 'RadioList', '必须从一组可见选项中选其一时使用。'],
            ['select / combobox', 'Selector 或 Typeahead', '选项有限用 Selector；可搜索的异步选项用 Typeahead。'],
            ['用作页面导航的 tabs', 'TabList', '用路由状态或当前页面状态作为真值来源。'],
            ['command dialog', 'CommandPalette', '应用专属的搜索源放在 shell 之外，并为其提供可搜索条目。'],
            ['dropdown action menu', 'DropdownMenu 或 MoreMenu', '紧凑的溢出操作用 MoreMenu。'],
            ['alert / callout', 'Banner 或 Toast', '页面或区块消息用 Banner；短暂反馈用 Toast。'],
            ['dialog', 'Dialog 或 AlertDialog', '破坏性确认用 AlertDialog；任务流程用 Dialog。'],
            ['类卡片的列表行', 'ListItem', '可选择行优先用 ListItem，不要把 Button 样式化成行。'],
          ],
        },
      ],
    },
    {
      id: 'command-palette',
      title: '命令面板、设置与主题',
      content: [
        {
          type: 'prose',
          text: 'shell 就位后，把全局搜索迁移到 CommandPalette。把命令面板看作应用命令之上的一个视图：路由、上下文操作、创建操作、筛选器、最近项目和实体结果。数据规范化保留在应用代码里，让搜索源始终返回可搜索条目的数组。',
        },
        {
          type: 'prose',
          text: '把浅色与深色模式控件放进设置 popover 或账户菜单。开关或选择器应更新传给 Theme 的模式，而不是切换孤立的 body 类。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '设置 popover 中的主题控件',
          code: `function ThemeModeSwitch() {
  const {mode, setMode} = useSettings();
  const isDark = mode === 'dark';

  return (
    <Switch
      label="Dark mode"
      description="Use the dark color theme"
      value={isDark}
      onChange={next => setMode(next ? 'dark' : 'light')}
    />
  );
}`,
        },
      ],
    },
  ],
};
