// Copyright (c) Meta Platforms, Inc. and affiliates.

// @ts-check

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'EmojiPicker',
  displayName: 'Emoji Picker',
  category: 'Form Controls',
  keywords: ['emoji', '表情', '表情选择器', 'emoji picker', 'emoticon', '笑脸', 'EmojiPicker'],
  description:
    '独立的 emoji 面板：一个覆盖全部分组 emoji 的搜索框，常用 emoji 排在最前。可内联放置或放入 Popover；选取 emoji 时调用 onSelect。',
  usage: {
    description:
      'emoji 选择器把 emoji 插入读者正在撰写的内容中，如评论或消息。放在由 emoji 按钮打开的 Popover 中，或内联放在 emoji 本身就是内容的位置。若是从一小组固定选项中选反应，直接给出这些选项即可。',
    anatomy: [
      {
        name: 'Search',
        required: true,
        description:
          '将搜索的每个词与 emoji 名称或关键词的开头匹配。Enter 选取第一个匹配项；Down 进入 emoji 区。',
      },
      {
        name: 'Groups',
        required: true,
        description:
          '常用组在前，其后按 CLDR 分组列出所有 emoji，分组标题在 emoji 滚动时固定在顶部。',
      },
      {
        name: 'Emoji',
        required: true,
        description:
          '每行八个，每个分组是一个 grid，全部共享一个 Tab 停留点。方向键在行间和分组间移动，Home 和 End 在行内移动，Ctrl+Home 和 Ctrl+End 跳到第一个和最后一个 emoji，Enter 选取。',
      },
      {
        name: 'Preview',
        required: true,
        description: '显示指针悬停或焦点所在 emoji 的名称。',
      },
    ],
    bestPractices: [
      {
        guidance: true,
        description:
          '把读者最近使用的 emoji 作为 `frequentEmojis` 传入，最常用的排最前。',
      },
      {
        guidance: true,
        description:
          '从按钮打开的 Popover 中呈现，并保留 Popover 的自动聚焦，让输入立即可搜索。内联或 Dialog 中则改设 `hasAutoFocus`。',
      },
      {
        guidance: false,
        description:
          '不要用于小固定词汇表的反应选择；直接给出这些选项即可。',
      },
      {
        guidance: false,
        description:
          '不要把宽度压到约 280 像素以下。每行保持八个 emoji，窄选择器会让每个目标都变小。',
      },
    ],
    accessibility: [
      {
        name: 'Emoji grids',
        category: 'Keyboard',
        criterion: '2.1.1 Keyboard',
        description:
          '每个分组是一个以其标题命名的 WAI-ARIA grid，每行八个单元格。一个游走的 Tab 停留点贯穿全部分组：从搜索框按 Tab 即落在其上，再按 Tab 离开选择器。方向键遵循布局方向，在从右到左文本中镜像。',
      },
      {
        name: 'Search field',
        category: 'Keyboard',
        description:
          'Down 进入第一个 emoji，从第一行按 Up 返回。Enter 选取第一个匹配项。输入法组词期间，Enter 和方向键由输入法接管。',
      },
      {
        name: 'Emoji names',
        category: 'Content',
        description:
          '每个 emoji 按钮以 CLDR 名称命名，如 "Party popper"；字形本身对辅助技术隐藏。内置名称为英文：其他语言请传入带本地化名称的 `categories` 和 `frequentEmojis`。',
      },
      {
        name: 'Focus ring',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        description:
          '聚焦的 emoji 以内缩方式绘制系统焦点环，因此不会与相邻项重叠；焦点环相对 popover 表面须保持 3:1 对比度。',
      },
    ],
  },
  theming: {
    targets: [
      {
        className: 'astryx-emoji-picker',
      },
    ],
  },
  props: [
    {
      name: 'onSelect',
      type: '(emoji: string, option: EmojiOption) => void',
      required: true,
      description: '以选中的 emoji 及其选项调用。',
    },
    {
      name: 'frequentEmojis',
      type: 'readonly EmojiOption[]',
      default: 'DEFAULT_FREQUENT_EMOJIS',
      description:
        '排在最前的 emoji，显示在 "Frequently used" 之下。空数组则省略该行。',
    },
    {
      name: 'categories',
      type: 'readonly EmojiCategory[]',
      description:
        '要提供的 emoji，按分组。首次挂载时省略它将加载内置集合（含 Emoji 15 的全部 emoji，带英文 CLDR 名称）；本地化或自定义集合请传入自己的数据。',
    },
    {
      name: 'height',
      type: 'SizeValue',
      default: "'calc(var(--spacing-8) * 10)'",
      description: '滚动 emoji 列表的高度。',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      default: 'false',
      description:
        '选择器挂载时聚焦搜索框，适用于内联或 Dialog 场景。在 Popover 内请改用 Popover 自身的自动聚焦。',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'emoji 列表的无障碍名称。默认为本地化的 "Emoji"。',
    },
    {
      name: 'searchLabel',
      type: 'string',
      description:
        '搜索框的占位符与隐藏标签。默认为本地化的 "Search emoji"。',
    },
  ],
  examples: [
    {
      label: '内联选择器',
      code: `import {Card} from '@astryxdesign/core/Card';
import {EmojiPicker} from '@astryxdesign/lab';

<Card padding={0} width={352}>
  <EmojiPicker onSelect={(emoji, option) => insert(emoji)} />
</Card>`,
    },
    {
      label: '在 Popover 中',
      code: `import {useState} from 'react';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Popover} from '@astryxdesign/core/Popover';
import {EmojiPicker} from '@astryxdesign/lab';

export default function Example() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      label="Add emoji"
      padding={0}
      width={352}
      content={
        <EmojiPicker
          onSelect={emoji => {
            insert(emoji);
            setIsOpen(false);
          }}
        />
      }>
      <IconButton label="Add emoji" icon={<span aria-hidden>🙂</span>} />
    </Popover>
  );
}`,
    },
  ],
};
