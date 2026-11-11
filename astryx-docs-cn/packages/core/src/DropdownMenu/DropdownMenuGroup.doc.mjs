// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuGroup',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Group',
  isHiddenFromOverview: true,
  playground: {
    // A standalone group has no required props, so the properties-tab preview
    // would render an empty box. Seed a title so the heading shows.
    defaults: {title: 'Version history'},
  },
  description:
    '复合菜单中的一组菜单行。可见标题通过 aria-labelledby 为 role="group" 命名；省略标题时该组没有名称。标题不是 menuitem，因此方向键和 typeahead 会跳过它。标题内容应保持非交互，控件应放在 DropdownMenu 的 header 或 footer 中。数据驱动的等价形式是 `items` 中的 `{type: "section", title, items}` 条目；两种形式共享同一套标题处理和主题目标。宿主属性和 DOM 处理器（id、data-*、aria-*）会传到分组元素上；其 role 以及有标题时的名称由组件自身掌管。',
  usage: {
    description:
      '使用 DropdownMenuGroup 为相关的复合菜单行提供同一个可见名称和程序化名称。只有当单独的名称无助于理解这些行时，才使用无标题分组。',
    bestPractices: [
      {
        guidance: true,
        description:
          '使用简短、描述性的标题内容，说明这些行共同之处。',
      },
      {
        guidance: true,
        description:
          '保持标题非交互，让每个可用操作都保留在菜单的方向键顺序中。',
      },
      {
        guidance: false,
        description:
          '不要在标题中放置按钮、链接、输入控件或其他控件；应改用 DropdownMenu 的 header 或 footer。',
      },
      {
        guidance: false,
        description:
          '不要包裹构不成有意义集合的行；只有当关系有助于用户理解时，分组才增加结构价值。',
      },
    ],
    anatomy: [
      {
        name: 'Group',
        required: true,
        description:
          '包含标题和菜单行的 role="group" 包装元素。',
      },
      {
        name: 'Heading',
        required: false,
        description:
          '为分组命名的可见非交互标题内容，承载 dropdown-menu-section-heading 主题目标。',
      },
      {
        name: 'Rows',
        required: false,
        description:
          '由 DropdownMenu 持有的菜单项、可选项、单选组或子菜单。',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description:
        "显示在行上方并用作分组无障碍名称的非交互标题内容。不需要命名时省略；控件应放在 DropdownMenu 的 header 或 footer 中。",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '分组中的行：DropdownMenuItem、DropdownMenuCheckboxItem、DropdownMenuRadioGroup 或 DropdownMenuSubMenu。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '应用于 role="group" 包装元素的 StyleX 样式。必须是 stylex.create() 的值，不能是内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description: '应用于 role="group" 包装元素的 CSS 类名。',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: '应用于 role="group" 包装元素的内联样式。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到 role="group" 包装元素的 ref。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-dropdown-menu-section-heading'}],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'DropdownMenuGroup',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Group',
  isHiddenFromOverview: true,
  description:
    '复合菜单中的一组菜单行。可见标题通过 aria-labelledby 为 role="group" 命名；省略标题时该组没有名称。标题不是 menuitem，因此方向键和预输入会跳过它。标题内容应保持非交互；控件应放在 DropdownMenu 的 header 或 footer 中。宿主属性和 DOM 事件处理函数（id、data-*、aria-*）会传到分组元素上；其 role 以及有标题时的名称由组件控制。',
  usage: {
    description:
      '使用 DropdownMenuGroup 为相关的复合菜单行提供同一个可见名称和无障碍名称。只有当名称能帮助理解这些菜单行时才使用分组。',
    bestPractices: [
      {guidance: true, description: '使用简短且能说明菜单行关系的标题。'},
      {
        guidance: true,
        description: '保持标题非交互，让所有操作都位于菜单的方向键顺序中。',
      },
      {
        guidance: false,
        description:
          '在标题中放置按钮、链接或输入控件；应改用 DropdownMenu 的 header 或 footer。',
      },
      {guidance: false, description: '对没有共同含义的菜单行进行分组。'},
    ],
    anatomy: [
      {
        name: '组',
        required: true,
        description: '包含标题和菜单行的 role="group" 包装元素。',
      },
      {
        name: '标题',
        required: false,
        description: '用于命名分组的可见非交互标题内容。',
      },
      {
        name: '菜单行',
        required: false,
        description: '由 DropdownMenu 持有的菜单项、可选项、单选组或子菜单。',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description:
        '显示在菜单行上方并作为分组无障碍名称的非交互标题内容。省略时分组无名称；控件应放在 DropdownMenu 的 header 或 footer 中。',
    },
    {name: 'children', type: 'ReactNode', description: '该分组中的菜单行。'},
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '应用于 role="group" 包装元素的 StyleX 样式。',
    },
    {
      name: 'className',
      type: 'string',
      description: '应用于 role="group" 包装元素的 CSS 类名。',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: '应用于 role="group" 包装元素的内联样式。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到 role="group" 包装元素的 ref。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-dropdown-menu-section-heading'}],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '为复合菜单行命名的 role="group"；数据 API 中 {type: "section"} 的组合式对应物',
  usage: {
    description:
      '为相关的复合菜单行提供同一个可见名称和程序化名称。',
    bestPractices: [
      {
        guidance: true,
        description: '用简短标题说明这些行的关系。',
      },
      {
        guidance: true,
        description:
          '非交互标题让每个操作都保留在菜单方向键导航中。',
      },
      {
        guidance: false,
        description:
          '不要把控件放进标题；应改用 DropdownMenu 的 header 或 footer。',
      },
      {guidance: false, description: '不要对无关的行分组。'},
    ],
  },
  propDescriptions: {
    title: '行上方的非交互标题；为分组命名',
    children: '分组中的菜单行',
    xstyle: 'role="group" 包装元素上的 StyleX 样式',
    className: 'role="group" 包装元素上的 CSS 类名',
    style: 'role="group" 包装元素上的内联样式',
    ref: '转发到 role="group" 包装元素的 ref',
  },
};
