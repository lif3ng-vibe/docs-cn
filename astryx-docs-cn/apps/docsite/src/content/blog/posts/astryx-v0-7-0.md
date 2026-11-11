---
title: 'Astryx v0.7.0：更好的移动体验、更清晰的输入与更坚实的基础'
description: 'v0.6.0 之后交付的内容：更易用的表单、更强的移动端行为、可组合的 Markdown、更好的数据展示、更清晰的 CLI 集成，以及有指引的迁移。'
date: '2026-10-12'
type: 'update'
draft: false
authors:
  - 'team'
tags:
  - 'Release'
  - 'Theming'
  - 'Components'
  - 'Accessibility'
---

Astryx v0.7.0 汇集了 v0.6.1 到 v0.6.8 的全部交付内容以及本发布的最后更新。这一版改善了人们接触最多的体验——表单、移动端布局、菜单、Markdown 和表格——同时让主题与 CLI 的行为更可预期。

## 表单与输入

你传入的样式、ID 和处理器现在会落在用户真正操作的控件上，可搜索的拾取器也能创建缺失的选项。

```diff
 <TextInput
   label="Project name"
   value={name}
   onChange={setName}
-  xstyle={styles.projectName}
+  controlXstyle={styles.projectName}
 />

 <Typeahead
   label="Assignee"
   searchSource={peopleSource}
   value={assignee}
   onChange={setAssignee}
-  xstyle={styles.assigneeField}
-  emptySearchResultsText="No people found"
+  containerXstyle={styles.assigneeField}
+  emptySearchText="No people found"
 />
```

### 搜索时创建缺失的选项

![一个带 Platform badge 的 Reviewers 多选。展开后是一个搜索框和三个 checkbox 选项；输入 Access 后只剩一行：Create "Access"。选择它会给字段添加一个 Access badge，并在列表末尾追加一个勾选的 Access 选项。](/blog/astryx-v0-7-0/multiselector-create.webp)

_开启 `hasSearch` 与 `hasCreate` 后，没有任何选项匹配的查询会给出一个 Create 行。`onChange` 收到的新值附带 `{type: 'create', query}` 描述符，让你的应用可以把该选项加入列表。_

```tsx
const [reviewerOptions, setReviewerOptions] = useState(initialReviewerOptions);
const [reviewers, setReviewers] = useState(['platform']);

<MultiSelector
  label="Reviewers"
  options={reviewerOptions}
  value={reviewers}
  onChange={(next, change) => {
    if (change?.type === 'create') {
      setReviewerOptions(current => [
        ...current,
        {value: change.query, label: change.query},
      ]);
    }
    setReviewers(next);
  }}
  hasSearch
  hasCreate
  triggerDisplay="badges"
/>;
```

## 菜单与覆盖层

菜单可以在行旁容纳真正的控件，触屏上子菜单改为逐层下钻；工作表、对话框与 toast 按人们预期的方式堆叠、关闭并留出内容边距。

### 把控件放在菜单行旁边

![展开的 Assign reviewer 下拉菜单。四个姓名行的上方是 Filter reviewers 文本框，下方是带加号图标的 Create team 按钮，全部位于同一个 popover 内。](/blog/astryx-v0-7-0/menu-header-footer@2x.png)

_头部与底部控件保持在菜单本体之外，屏幕阅读器听到的仍是一个普通菜单，Tab 会按顺序到达每个区域。_

```tsx
import {PlusIcon} from '@heroicons/react/24/outline';

<DropdownMenu
  button={{label: 'Assign reviewer'}}
  header={
    <TextInput
      label="Filter reviewers"
      isLabelHidden
      placeholder="Filter reviewers"
      value={query}
      onChange={setQuery}
    />
  }
  footer={
    <Button
      label="Create team"
      variant="secondary"
      icon={<Icon icon={PlusIcon} />}
      onClick={createTeam}
    />
  }
  items={reviewerActions}
/>;
```

### 在手机上逐层下钻子菜单

![一部手机屏幕，Actions 菜单在其按钮下方展开。手指点击带尖角号的 Move to 行，菜单的行原地替换为一行 Back to Actions，其后是 Backlog 和 Next release。点按 Back 返回第一组行。](/blog/astryx-v0-7-0/mobile-submenu-drill-in@2x.webp)

_通过触屏打开时，子菜单在当前行上逐层下钻，并带一行以目标菜单命名的 Back 行。鼠标操作时仍以浮出式打开；在 `DropdownMenuSubMenu` 上设置 `presentation` 可强制任一模式。_

```tsx
<DropdownMenu button={{label: 'Actions'}}>
  <DropdownMenuItem label="Assign to me" onClick={assign} />
  <DropdownMenuItem label="Snooze" onClick={snooze} />
  <DropdownMenuSubMenu label="Move to">
    <DropdownMenuItem label="Backlog" onClick={moveToBacklog} />
    <DropdownMenuItem label="Next release" onClick={moveToNext} />
  </DropdownMenuSubMenu>
</DropdownMenu>
```

### 让嵌套层级有序

- **层级与对话框**：对于工作表内的菜单、popover 和对话框，Escape 先关闭最顶层。嵌套层级始终留在最近的对话框之内。
- **Toast**：在打开的对话框之上保持可见、可点击。

### 给 BottomSheet 的内容留出空间

![手机上同一个底部工作表的前后对比。之前，工作表的文字与按钮紧贴面板边缘、从拖拽把手正下方开始，标题也被把手遮住；之后，同样的内容四周都有舒适的留白，标题在把手下方可见，按钮也离开了底边。](/blog/astryx-v0-7-0/theme-bottomsheet-padding.png)

_BottomSheet 现在默认为内容添加舒适的留白；`padding={0}` 保留旧的紧贴样式。_

```diff
 <BottomSheet
   isOpen={isOpen}
   onOpenChange={setIsOpen}
   label="Filters"
+  padding={0}
 >
   <CustomEdgeToEdgeFilters />
 </BottomSheet>
```

## 移动端与触控

手机端获得 16px 正文文本、行上的滑动操作，以及日期和时间拾取器的选择权。

### 用滑动显出行的操作

![手机上一张卡片内的三行清单。手指把第一行向左拖动，两个操作面板从其后方滑出：中性的 Archive 和红色的 Delete。点按 Archive 后该行移除，列表闭合。](/blog/astryx-v0-7-0/item-swipe-actions@2x.webp)

_横向拖动显出触控操作，同时不让键盘与辅助技术用户失去这些操作。没有操作的行不加载手势代码，首次加载约省 2.7 KB（gzip）。_

```tsx
<ListItem
  label={row.label}
  onClick={openRow}
  swipeActions={{
    trailing: [
      {
        label: 'Archive',
        onActivate: () => archive(row.id),
        variant: 'neutral',
        hasRemoval: true,
      },
      {
        label: 'Delete',
        onActivate: () => remove(row.id),
        variant: 'destructive',
        hasRemoval: true,
      },
    ],
  }}
/>
```

### 自选日期与时间拾取器

日期与时间字段可以显式选择在触屏上保留 Astryx 拾取器、改用 popover，或交给操作系统。

```tsx
<DateInput
  label="Release date"
  value={date}
  onChange={setDate}
  presentation="adaptive-bottom-sheet"
/>
<TimeInput
  label="Release time"
  value={time}
  onChange={setTime}
  presentation="adaptive-bottom-sheet"
/>
```

### 在手机上舒适阅读

![同一手机屏幕的前后对比。之前，正文段落、辅助说明、字段标签与按钮标签都偏小，段落两行放下；之后，正文与标签变大，段落换成三行；标题略有增大，输入文本尺寸不变。](/blog/astryx-v0-7-0/theme-phone-type-scale.png)

_在窄于 `lg` 断点的触控设备上，Neutral、Chocolate、Butter 和 Stone 把排版基准下限设为 16px 并重新推导比率，让 Display 1 保持桌面尺寸。桌面尺寸不变。_

要保留 Neutral 之前的 14px 手机比例，为同一条件追加一条靠后的规则：

```tsx
import {defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral';

const appTheme = defineTheme({
  name: 'app',
  extends: neutralTheme,
  adaptations: {
    rules: [
      {
        when: {pointer: 'coarse', width: {below: 'lg'}},
        value: {typography: {scale: {base: 14, ratio: 1.2}}},
      },
    ],
  },
});
```

如果你的主题 extends 了其中之一并设置了自己的排版比例，触屏上的手机规则会取而代之；请为同一条件追加你自己的规则并填入想要的值。对 Butter 和 Stone，用 `ratio: 1.25`，并在规则的 `value` 里一并恢复 `tokens: {'--text-supporting-size': '12px'}`。

## 数据展示

表格让展开行保持对齐，并让列宽调整更容易被发现。

### 展开行而不扰动表格

![一张带条纹行的订单表。指针点击一个客户名后该行展开：其订单明细出现在从 Customer 列下方开始的面板中，尖角号翻转，下方各行的条纹照旧交替。随后指针点击另一行的 Refund 按钮，这不会触发展开；点击该行的文本才会展开。](/blog/astryx-v0-7-0/table-row-expansion.webp)

_展开的明细与第一个数据列对齐，尖角号保持在其列内居中，行条纹保持稳定，行内的按钮或链接永不触发展开。_

```tsx
const expansion = useTableRowExpansion<Order>({
  expandedKeys,
  onToggle: key => setExpandedKeys(previous => toggle(previous, key)),
  getRowKey: order => order.id,
  renderExpanded: order => <OrderItems order={order} />,
  hasRowClickExpansion: true,
});

<Table
  data={orders}
  columns={columns}
  idKey="id"
  isStriped
  hasHover
  plugins={{expansion}}
/>;
```

### 调整列宽而不丢失上下文

![一张宽幅订单表。指针移入表头行时，每个列边界出现一条细线。指针把 Status 之后的边界向右拖动，列随之变宽；松开后新宽度保持。](/blog/astryx-v0-7-0/table-column-resize.webp)

_悬停表头时显现列边界，拖动结束后新列宽保持原位。_

```tsx
const columnResize = useTableColumnResize<Order>({
  columnWidths,
  columns,
  onColumnResizeEnd: updates =>
    setColumnWidths(previous => ({...previous, ...updates})),
});

<Table data={orders} columns={columns} idKey="id" plugins={{columnResize}} />;
```

## Markdown 与内容

Markdown 现在能把你的自有语法变成真正的组件，而不再止步于格式化文本。下面的示例在插件启用前后使用同一份源文本，因此每个特性的效果都能独立看清。

### 保留作者写入的换行

![同一份四行 Markdown 清单的两次渲染。插件启用前，各行连成一个段落；启用后，每行都从新行开始。](/blog/astryx-v0-7-0/markdown-soft-breaks.png)

_单个行尾变成换行；代码块与行内代码保持不变。_

```tsx
import {Markdown} from '@astryxdesign/core/Markdown';
import {markdownSoftBreaksPlugin} from '@astryxdesign/core/Markdown/plugins';

<Markdown plugins={[markdownSoftBreaksPlugin]}>{source}</Markdown>;
```

### 把 frontmatter 当数据读

![一份以 YAML frontmatter 块开头的文档的两次渲染。插件启用前，frontmatter 显示为一条水平线、一行原始的 key: value 文本和标题上的另一条线；启用后，frontmatter 从文档中消失，你的应用把解析出的值显示为同一标题上方的 draft badge 与标题。](/blog/astryx-v0-7-0/markdown-frontmatter.png)

_你的应用把 frontmatter 拿到为带类型的数据，而它不会出现在渲染后的文档里。_

```tsx
import {Markdown} from '@astryxdesign/core/Markdown';
import {createMarkdownFrontmatter} from '@astryxdesign/core/Markdown/plugins';

const frontmatter = createMarkdownFrontmatter({
  name: 'release-notes',
  parse: fields => ({
    title: typeof fields.title === 'string' ? fields.title : 'Untitled',
    status: typeof fields.status === 'string' ? fields.status : 'draft',
  }),
});

const result = frontmatter.parse(source);
<Markdown plugins={[frontmatter.plugin]}>{source}</Markdown>;
```

### 把产品语法变成链接

![一句提到两个 spec id 的话的两次渲染。插件启用前，AST-064 和 AST-069 是纯文本；启用后，两者都变成带下划线的链接，而行内代码里的同一 id 保持原样。](/blog/astryx-v0-7-0/markdown-text-transform.png)

_文本转换可以为正文里的产品标识符加链接，而不碰代码段、已有链接、图片或数学公式。_

```tsx
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  createMarkdownPlugin,
  createMarkdownTextTransform,
} from '@astryxdesign/core/Markdown/plugins';

const specLinks = createMarkdownPlugin({
  name: 'spec-links',
  apiVersion: 1,
  transform: createMarkdownTextTransform({
    pattern: /\bAST-(\d{3})\b/g,
    requiredSubstrings: ['AST-'],
    replace: match => ({
      type: 'link',
      url: `/specs/${match[0]}`,
      children: [{type: 'text', value: match[0]}],
    }),
  }),
});

<Markdown plugins={[specLinks]}>{source}</Markdown>;
```

### 把自定义围栏变成组件

![一段文字后跟一个标记为 callout 的围栏代码块的两次渲染。插件启用前，围栏显示为标注 callout 的代码块及其两行文本；启用后，同一围栏渲染为警告横幅，第一行是标题，第二行是描述。](/blog/astryx-v0-7-0/markdown-fence.png)

_声明的围栏语言可以渲染为产品组件，其余围栏保持常规代码呈现。_

```tsx
import {Markdown} from '@astryxdesign/core/Markdown';
import {Banner} from '@astryxdesign/core/Banner';
import {
  createMarkdownFenceTransform,
  createMarkdownPlugin,
  type MarkdownExtensionNode,
} from '@astryxdesign/core/Markdown/plugins';

type CalloutNode = MarkdownExtensionNode<
  'callouts',
  'callout',
  {readonly title: string; readonly body: string},
  'block'
>;

const callouts = createMarkdownPlugin<'callouts', CalloutNode>({
  name: 'callouts',
  apiVersion: 1,
  transform: createMarkdownFenceTransform({
    languages: ['callout'],
    createNode: ({code}) => {
      const [title, ...body] = code.split('\n');
      return {
        type: 'extension',
        plugin: 'callouts',
        name: 'callout',
        display: 'block',
        data: {title, body: body.join(' ')},
      };
    },
  }),
  renderers: {
    callout: {
      render: ({node}) => (
        <Banner
          status="warning"
          title={node.data.title}
          description={node.data.body}
        />
      ),
      toText: node => `${node.data.title}\n${node.data.body}`,
    },
  },
});

<Markdown plugins={[callouts]}>{source}</Markdown>;
```

### 复制标题链接

![两个标题的两次渲染。插件启用前，标题是普通文本；启用后，指针移到第一个标题上时旁边出现一个小的 # 按钮，点击后 # 短暂变成对勾，指针离开时按钮再次淡出。](/blog/astryx-v0-7-0/markdown-heading-links.webp)

_标题链接在悬停或键盘聚焦时显现，复制而不跳转，并短暂确认成功。_

```tsx
import {Markdown} from '@astryxdesign/core/Markdown';
import {createMarkdownHeadingLinks} from '@astryxdesign/core/Markdown/plugins';

const headingLinks = createMarkdownHeadingLinks({
  permalinkBaseUrl: 'https://astryx.atmeta.com/blog/astryx-v0-7-0',
});

<Markdown plugins={[headingLinks]}>{source}</Markdown>;
```

### 把渲染块连接到源码行

![一段文字、一个两项列表和一条引用的两次渲染。插件启用前，各块没有标注；启用后，每块旁边的小边距区标出其源码行：段落是 L1，列表项是 L3 和 L4，引用是 L6。](/blog/astryx-v0-7-0/markdown-source-lines.png)

_边距区仅为示意：页面读取每块的 `data-source-line` 与 `data-source-line-end` 属性来挂载评论、选区和搜索结果。_

```tsx
import {Markdown} from '@astryxdesign/core/Markdown';
import {markdownSourceLinesPlugin} from '@astryxdesign/core/Markdown/plugins';

<Markdown plugins={[markdownSourceLinesPlugin]}>{source}</Markdown>;
```

### 用你产品的渲染器渲染数学公式

![一句带行内分式和独立等式的话的两次渲染。之前，美元符号包裹的数学式显示为字面文本；之后，行内分式在句内排版，等式单独居中成行。](/blog/astryx-v0-7-0/markdown-math.png)

_提供数学渲染器即开启美元符号定界解析；图中排版只是一个示例渲染器，最终的无障碍输出由你的应用负责。_

```tsx
import {Markdown} from '@astryxdesign/core/Markdown';

function MathExpression({
  value,
  display,
}: {
  value: string;
  display: 'inline' | 'block';
}) {
  return <ProductMath source={value} display={display} />;
}

<Markdown components={{math: MathExpression}}>{source}</Markdown>;
```

## 主题与视觉基础

组件在所有稳定主题下都更清晰，数据色有了唯一的 StyleX 来源。

### 使用来自唯一 StyleX 源的数据色

_应用可以读取与 Astryx charts 和主题相同的 data-color 值。_

```tsx
import * as stylex from '@stylexjs/stylex';
import {dataVars} from '@astryxdesign/core/theme/dataTokens.stylex';

const styles = stylex.create({
  series: {
    backgroundColor: dataVars['--color-data-categorical-blue'],
  },
});
```

下面三组对比使用同一场景，分别取自 v0.6.0 与当前发布。

### 让键盘快捷键清晰可读

![三个快捷键与其操作并排的前后对比。之前，键帽字母是浅灰键帽上的中灰；Escape 键显示为全大写 ESC。之后，同样的键帽使用主要文本色，该键显示为 Esc。](/blog/astryx-v0-7-0/theme-kbd-contrast.png)

_键帽文本现在在所有稳定主题下都达到 WCAG AA，常见按键别名渲染一致。_

```tsx
<Kbd keys="mod+k" />
<Kbd keys="mod+shift+s" />
<Kbd keys="esc" />
```

### 让 Slider 刻度跟随填充

![两个带刻度的滑块——单值 65 与区间 20 到 70——的前后对比。之前，所有刻度都是同一浅灰，包括轨道已填充部分的刻度；之后，填充区内的刻度用填充色，区外刻度保持轨道色。](/blog/astryx-v0-7-0/theme-slider-marks.png)

_位于滑块处或其后的刻度使用填充色，未填充刻度在各主题下使用轨道色。_

```tsx
<Slider
  label="Quality"
  value={quality}
  onChange={setQuality}
  min={0}
  max={100}
  step={5}
  marks={[
    {value: 0, label: '0'},
    {value: 25},
    {value: 50, label: '50'},
    {value: 75},
    {value: 100, label: '100'},
  ]}
/>
```

### 图标尺寸跟随其 Button

![四个带前置图标、尺寸为小中大混合的按钮的前后对比。之前，所有按钮上的图标都是同一个大尺寸，挤爆小按钮；之后，每个图标与其按钮匹配：sm 和 md 按钮用小图标，lg 按钮用中图标。](/blog/astryx-v0-7-0/theme-button-icon-size.png)

_未显式指定尺寸的 Icon 现在跟随其 Button，小按钮不再显得拥挤。_

```tsx
<Button
  label="Upload"
  variant="primary"
  icon={<Icon icon={ArrowUpTrayIcon} />}
/>
<Button label="Upload" size="lg" icon={<Icon icon={ArrowUpTrayIcon} />} />
```

## 无障碍与本地化

布局随读者的文字尺寸增长，焦点环跟随用户实际使用的输入方式，横幅播报异步结果而不是让人从颜色上猜。

### 让布局跟随读者的文字尺寸

调大浏览器字号的读者现在会得到随文字增长的边距与间距，而不是把更大的字硬塞进同一套固定间距。

![同一张小表单卡片在 24px 浏览器字号下的前后对比，第二行为默认 16px。之前在 24px 下，文字变大，但卡片的边距与字段和按钮之间的间距仍与 16px 时一样紧；之后，边距与间距随文字增长。在 16px 下两个版本完全一致。](/blog/astryx-v0-7-0/theme-rem-spacing.png)

_间距 token 使用 rem（`--spacing-N` = N × 0.25rem），包括 Matcha 与 Y2K 自有的档位；在默认 16px 根字号下渲染的像素尺寸不变。_

### 让焦点提示跟随上一次输入

![鼠标点击 Edit profile 按钮打开对话框，没有任何焦点环。按 Tab 后 Close 按钮出现焦点环，再按一次焦点环移到 Display name 字段。Escape 关闭对话框，Edit profile 按钮出现焦点环。再次用鼠标打开并点击 Cancel 关闭后，按钮上没有焦点环。](/blog/astryx-v0-7-0/dialog-focus-indicator.webp)

_指针图标为示意鼠标输入而加。Dialog 的初始焦点和关闭时归还的焦点都跟随上一次输入：键盘操作后显示指示，鼠标点击或点按后保持隐藏。_

### 播报异步结果

过去 Banner 的视觉 `status` 会自动选择 live-region 角色，于是决定屏幕阅读器何时听到它的是横幅的外观——而不是异步动作本身。Banner 现在默认安静；由完成的动作播报一次，或在 Banner 本身就是持久消息时设置角色。

```tsx
import {Banner} from '@astryxdesign/core/Banner';
import {useAnnounce} from '@astryxdesign/core/hooks';

const announce = useAnnounce();

async function saveSettings() {
  await save();
  announce('Settings saved');
}

<Banner status="success" title="Settings saved" />;
```

## CLI 与集成

其他库现在可以通过应用已在用的同一个 Astryx CLI 贡献组件、文档、模板、升级脚本、编码指引和源主题。CLI 可以添加并校验这些组件。

### 添加并校验集成组件

![一个终端。输入并运行 npx @astryxdesign/cli integration add component AcmeChart，报告 component contribution added、[ok] AcmeChart 及其创建的四个文件。随后运行 npx @astryxdesign/cli integration verify，报告 Integration package ready、[ok] @acme/charts@1.2.0，以及 5 个打包文件、3/3 必需文件齐备。](/blog/astryx-v0-7-0/cli-integration.webp)

_来自随版本交付的 CLI 的真实输出，所在包的 `package.json` 已声明 `exports` 映射；终端外框是用 Astryx token 绘制的插图。_

```bash
npx @astryxdesign/cli integration add component AcmeChart
npx @astryxdesign/cli integration verify
```

## 升级到 0.7.0

从这里开始：

1. **把 Core 与 CLI 钉到 0.7.0**，以及项目用到的其他所有稳定 Astryx 包。

   ```bash
   OLD_VERSION=0.6.8 # replace with the Core version your project uses today
   npm i @astryxdesign/core@0.7.0 @astryxdesign/cli@0.7.0 @astryxdesign/build@0.7.0 @astryxdesign/theme-neutral@0.7.0
   ```

   示例包含 Neutral；项目里的其他所有稳定 Astryx 主题也请在同一步安装里更新。

2. **运行 0.7.0 升级**。它会重写受支持的调用点、校验 data-color 归属，并在无法安全抉择处留下 TODO。

   ```bash
   npx @astryxdesign/cli upgrade --from "$OLD_VERSION" --apply --path .
   ```

3. **检查下列条目**。四项需要手工改代码，十项影响 CLI 命令或脚本，四项是需在你的应用中检查的视觉或 token 变化，八项已由升级处理或检查。

> **最大风险：过去被忽略的 prop 现在会到达 DOM**。Layout、MetadataList、NavHeadingMenuItem 和 TopNavMegaMenuItem 本来就接受 BaseProps，因此没有类型报错也没有 codemod。只有当调用点原本依赖"这些 prop 什么都不做"时，才需要审计那些传入 ID、ARIA 或 data 属性、事件处理器或样式 prop 的地方。

### 手工代码修改——无 codemod（4）

- **Banner 播报不再从 status 推断** → 在异步流转中调用 `useAnnounce()`，或添加显式的持久角色。
- **过去被忽略的 BaseProps 现在生效** → 仅当传入的 prop 本意是保持无效时，才审计风险提示中的四个组件。
- **完整的图标注册表要求 `upload`** → 为每个自定义的完整 `IconRegistry` 添加 `upload` 条目与图稿。
- **独立的空运算符过滤器不再在打开时保存** → 若打开即应提交过滤器，在调用点保存，否则跳过打开。

### CLI 命令与脚本——无 codemod（10）

- **`theme add` 现在导入已构建主题** → 把复制源码的脚本改为 `theme eject`；既有的 `theme add --import` 调用无需改动。

  ```diff
  - npx @astryxdesign/cli theme add neutral ./src/theme --overwrite
  + npx @astryxdesign/cli theme eject neutral ./src/theme --overwrite
  ```

- **`init --remove-agents` 报告 `removed: false`** → 把 `data.removed` 当布尔值读，不要窄化为字面量 `true`。
- **冲突的 CLI 选项被拒绝** → 从受影响的命令对里移除过去被忽略的那个选项。
- **无效的 CLI 输入现在会失败** → 传入有效的类型、包、上限和参数，并处理 `ERR_AMBIGUOUS_COMPONENT`。
- **空位置参数被拒绝** → 当意图是列出条目时，省略 `""`。
- **集成校验需要包环境** → 在存在 `package.json` 的地方运行，或处理退出码 1。
- **带 Astryx 前缀的智能体变量已移除** → 改用 `AGENT` 与 `AGENT_SESSION_ID`；智能体元数据没有替代。
- **`layout` 命令组已移除** → 改用 `astryx build`、`astryx template` 或 `astryx docs layout`。
- **私有主题变量导致构建失败** → 修复每一个被报告的私有 `--_*` 输入，不要依赖退出码 0。
- **Doctor 对无法加载的已配置项目报失败** → 安装或修复所指集成、将其从配置移除，或修复报告中的字段。

### 视觉与 token 变化——检查你的应用，通常无需改代码（4）

- **`reset.css` 现在覆盖伪元素与搜索框** → 不需要旧的浏览器表现就什么都不用做；需要时追加一层靠后的覆盖。
- **四个主题的手机排版从 16px 起步** → 接受新的 Neutral、Chocolate、Butter 与 Stone 比例，或追加触屏加窄屏覆盖以保留 14px。
- **Core 间距使用 rem** → 用 CSS 变量的无需动作；解析 px 的代码须按根字号换算或读取计算后的长度。
- **Matcha 与 Y2K 间距使用 rem** → 在 16px 根字号下接受像素等同的默认值，或用 px 覆盖间距 token 以保持固定尺寸。

### 由 `astryx upgrade` 处理或检查（8）

- **数据色默认值迁往 StyleX** → 修复 `validate-data-token-ownership` 报告的一切，然后重建已入库的主题 CSS。
- **日期与时间输入的样式目标改为控件** → 审阅 `migrate-field-input-styling` 的重写结果或 TODO。
- **Typeahead、Tokenizer、CheckboxList、RadioList 与 Slider 的样式目标改为字段** → 审阅生成的 `container*` 或 `control*` prop。
- **Selector 的样式目标改为控件** → 审阅重写后的控件样式与透传的触发器 prop。
- **文本输入的样式目标改为控件** → 审阅重写后的控件样式与原生 input ID。
- **主题样式使用现行名称与 data 属性** → 审阅重写后的键与选择器，尤其是自定义 CSS 的 TODO。
- **BottomSheet 添加默认内容边距** → 审阅生成的 `padding={0}` 或 TODO；主题已提供边距时移除该 prop。
- **`emptySearchResultsText` 已移除** → 审阅到 `emptySearchText` 的重命名，以及展开运算或触发器对象上的 TODO。

### 全部 26 条破坏性迁移

1. **`theme add` 现在导入已构建主题**（[#7138](https://github.com/meta/astryx/pull/7138)）——复制脚本从 `theme add <slug> <path>` 改为 `theme eject <slug> <path>`；无 codemod。
2. **Banner 播报改为显式**（[#6630](https://github.com/meta/astryx/pull/6630)）——从由 status 推导的 live region 改为在异步动作中调用 `useAnnounce()` 或添加显式持久角色；无 codemod。
3. **过去被忽略的 DOM prop 现在生效**（[#7331](https://github.com/meta/astryx/pull/7331)）——仅当代码依赖它们"什么都不做"时才移除 Layout、MetadataList、NavHeadingMenuItem 或 TopNavMegaMenuItem 上的 prop；无 codemod。
4. **完整图标注册表包含 Upload**（[#7329](https://github.com/meta/astryx/pull/7329)）——为每个自定义 `IconRegistry` 添加 `upload` 条目；自制图稿无 codemod。
5. **`init --remove-agents` 报告 `removed: false`**（[#6623](https://github.com/meta/astryx/pull/6623)）——把 `data.removed` 当布尔值读，不要窄化为字面量 `true`；无 codemod。
6. **冲突的 CLI 选项被拒绝**（[#7132](https://github.com/meta/astryx/pull/7132)）——从 `gap-report --list-categories`、`init --remove-agents`、`upgrade --list` 以及 `template --cdn`、`--list`、`--skeleton` 中移除被忽略的输入；无 codemod。
7. **无效 CLI 输入不再静默成功**（[#7149](https://github.com/meta/astryx/pull/7149)）——传入有效的类型、包、上限与参数，并处理 `ERR_AMBIGUOUS_COMPONENT`；无 codemod。
8. **空位置参数被拒绝**（[#6620](https://github.com/meta/astryx/pull/6620)）——意图为列出条目时省略 `""`；无 codemod。
9. **集成校验需要包环境**（[#7150](https://github.com/meta/astryx/pull/7150)）——在存在 `package.json` 处运行 `doctor integration validate`，或处理退出码 1；无 codemod。
10. **数据色默认值迁往 StyleX**（[#6834](https://github.com/meta/astryx/pull/6834)）——为 CSS 导入 `dataVars` 并重建已入库的主题 CSS；`validate-data-token-ownership` 会报告不安全变量与过期产物但不改写。
11. **日期与时间输入的样式目标改为控件**（[#7337](https://github.com/meta/astryx/pull/7337)）——根样式改为 `controlXstyle`/`controlClassName`/`controlStyle`；`migrate-field-input-styling` 重写直接的 Astryx JSX。
12. **Typeahead、Tokenizer、CheckboxList、RadioList 与 Slider 的样式目标改为字段**（[#7339](https://github.com/meta/astryx/pull/7339)）——根样式改为 `container*`，InputGroup 内的 Typeahead 例外地使用 `control*`；`migrate-field-input-styling` 处理直接 JSX。
13. **Selector 的样式目标改为控件**（[#7341](https://github.com/meta/astryx/pull/7341)）——根样式改为 `control*`，DOM prop 与 ref 仍到达触发器；`migrate-field-input-styling` 处理直接 JSX。
14. **文本输入的样式目标改为控件**（[#7336](https://github.com/meta/astryx/pull/7336)）——根样式改为 `control*`，传入的 ID 到达原生 input；`migrate-field-input-styling` 处理直接 JSX。
15. **独立过滤器编辑器不在打开时保存**（[#7347](https://github.com/meta/astryx/pull/7347)）——在打开已完成的空运算符过滤器的调用点保存，或跳过打开；无 codemod。
16. **带 Astryx 前缀的智能体变量已移除**（[#7127](https://github.com/meta/astryx/pull/7127)）——把 `ASTRYX_AGENT_ID` 与 `ASTRYX_AGENT_SESSION_ID` 换成 `AGENT` 与 `AGENT_SESSION_ID`；元数据无替代，无 codemod。
17. **主题样式使用现行名称与 data 属性**（[#7302](https://github.com/meta/astryx/pull/7302)）——替换 21 个旧样式名与裸状态类；`migrate-deprecated-theme-surface` 重写已知键与选择器并标记含糊情况。
18. **`layout` 命令组已移除**（[#7137](https://github.com/meta/astryx/pull/7137)）——改用 `astryx build`、`astryx template` 与 `astryx docs layout`；无 codemod。
19. **`reset.css` 覆盖伪元素与搜索框**（[#7355](https://github.com/meta/astryx/pull/7355)）——仅当需要旧浏览器表现时才追加自己靠后层的 `box-sizing`、边框、占位符颜色或搜索框外观；无 codemod。
20. **私有主题变量导致构建失败**（[#6872](https://github.com/meta/astryx/pull/6872)）——修复每个被报告的私有 `--_*` 输入，不要依赖退出码 0；无 codemod。
21. **BottomSheet 添加默认内容边距**（[#6884](https://github.com/meta/astryx/pull/6884)）——移除调用方重复的边距，或传 `padding={0}` 保留旧盒子；`preserve-bottom-sheet-content-padding` 会跳过单独的 Section 或 Layout，给嵌套 Layout 标 TODO，其余情况添加 `padding={0}`。主题已设置 BottomSheet 边距时，移除这个被加上的 prop，让主题边距保留。
22. **手机排版从 16px 起步**（[#6699](https://github.com/meta/astryx/pull/6699)）——原样接受新的 Neutral、Chocolate、Butter 与 Stone 比例，或追加靠后的触屏加窄屏规则以保留 14px 或自定义比例；无 codemod。
23. **`emptySearchResultsText` 已移除**（[#7289](https://github.com/meta/astryx/pull/7289)）——改名为 `emptySearchText`；`rename-empty-search-results-text` 处理受支持的组件，并用 TODO 标记含糊的展开运算或触发器对象。
24. **Core 间距跟随根字号**（[#7359](https://github.com/meta/astryx/pull/7359)）——CSS 变量用户无需改动；解析 px 的代码按根字号换算 rem 或读取计算后的长度；无 codemod。
25. **Matcha 与 Y2K 间距跟随根字号**（[#7374](https://github.com/meta/astryx/pull/7374)）——接受新默认值（在 16px 根字号下像素等同），或用 px 覆盖间距 token 保持固定尺寸；无 codemod。
26. **Doctor 对无法加载的已配置项目报失败**（[#7130](https://github.com/meta/astryx/pull/7130)）——安装或修复所指集成、从配置移除，或修复错误中的配置字段；无 codemod。

## 致谢

感谢 v0.6.1 到 v0.7.0 背后的贡献者：[@AKnassa](https://github.com/AKnassa)、[@aldentan](https://github.com/aldentan)、[@andrskr](https://github.com/andrskr)、[@athz](https://github.com/athz)、[@bhamodi](https://github.com/bhamodi)、[@cixzhang](https://github.com/cixzhang)、[@Cypher-Aura-19](https://github.com/Cypher-Aura-19)、[@ejhammond](https://github.com/ejhammond)、[@ernestt](https://github.com/ernestt)、[@freddymeta](https://github.com/freddymeta)、[@fullstackhacker](https://github.com/fullstackhacker)、[@Geervan](https://github.com/Geervan)、[@Han5991](https://github.com/Han5991)、[@harjothkhara](https://github.com/harjothkhara)、[@HelloOjasMutreja](https://github.com/HelloOjasMutreja)、[@humbertovirtudes](https://github.com/humbertovirtudes)、[@imdreamrunner](https://github.com/imdreamrunner)、[@jiunshinn](https://github.com/jiunshinn)、[@josephfarina](https://github.com/josephfarina)、[@kentonquatman](https://github.com/kentonquatman)、[@korkt-kim](https://github.com/korkt-kim)、[@ksying](https://github.com/ksying)、[@kyu-rong](https://github.com/kyu-rong)、[@Kyujenius](https://github.com/Kyujenius)、[@Lee-Dongwook](https://github.com/Lee-Dongwook)、[@light-merlin-dark](https://github.com/light-merlin-dark)、[@ManoharPaturi](https://github.com/ManoharPaturi)、[@markselby9](https://github.com/markselby9)、[@nynexman4464](https://github.com/nynexman4464)、[@oliprovscode](https://github.com/oliprovscode)、[@rubyycheung](https://github.com/rubyycheung)、[@rupesh-kumar-sah](https://github.com/rupesh-kumar-sah)、[@thedjpetersen](https://github.com/thedjpetersen)、[@vjeux](https://github.com/vjeux)。

逐包完整说明见 [Astryx v0.7.0 发布页](https://github.com/meta/astryx/releases/tag/v0.7.0)。
