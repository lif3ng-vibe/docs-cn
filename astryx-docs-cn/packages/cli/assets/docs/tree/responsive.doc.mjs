// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs layout/responsive`: decide what each region does as
 * width changes.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'responsive',
  title: '响应式',
  placement: {parent: 'namespace:layout', slot: 'guides', order: 50},
  category: 'guide',
  description:
    '决定宽度变化时每个区域的行为：划分、显现、调整尺寸或替换。',
  keywords: [
    '断点',
    'useMediaQuery',
    'Dialog',
    'BottomSheet',
    '契约',
    'Grid',
    'columns',
    'minWidth',
  ],

  sections: [
    {
      id: 'breakpoints',
      title: '断点',
      content: [
        {
          type: 'prose',
          text: '决定宽度变化时每个区域的行为。在宣布布局完成之前，为每个区域写下响应式契约。',
        },
        {
          type: 'list',
          style: 'do',
          items: [
            '在宣布布局完成之前，为每个区域写下契约',
            '逐区域决定它在每个宽度下是显现、调整尺寸还是替换',
            '宁可去掉一个区域，也不要让它争抢本不存在的宽度',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            '在谁都没有可用空间的宽度下硬撑三个区域',
            '把所有区域均匀缩小，而不是替换或去掉其一',
            '在 CSS 里接了一个契约注释从未提到的断点',
          ],
        },
      ],
    },
    {
      id: 'responsive-contract',
      title: '响应式契约',
      content: [
        {
          type: 'prose',
          text: '锁定宽度变化时每个区域的行为，并让契约的每一行都与执行它的 prop 或 Hook 成对出现。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '划分（divide）：每个宽度下保留多少个区域',
            '显现（reveal）：哪些区域只在有空间时才获得宽度，低于该宽度则按需打开',
            '调整尺寸（resize）：内容伸缩而固定区域守住预算，文本始终受 contentWidth 约束以保持行宽',
            '替换（swap）：导航在 AppShell 的 mobileNav 断点处变为 MobileNav；侧面板在 useMediaQuery 驱动下变为 Dialog 或 BottomSheet',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '与 prop 绑定的契约',
          code: `// Recommended thresholds: 3 regions above 1024, 2 from 768,
// 1 below. Text reads best at 40–60 characters per line.
//   >1024  SideNav 256 | content | side panel 380
//   <=1024 panel moves to a Dialog     (useMediaQuery)
//   <=768  nav collapses to MobileNav   (mobileNav "md")
const isNarrow = useMediaQuery('(max-width: 1024px)');

<AppShell sideNav={<SideNav />} mobileNav={{breakpoint: 'md'}}>
  <Layout
    content={<LayoutContent>{/* rows */}</LayoutContent>}
    end={isNarrow ? undefined : <LayoutPanel width={380} hasDivider />}
  />
</AppShell>`,
        },
        {
          type: 'prose',
          text: '自查：契约的每一行都点名了实现机制，注释因此不会与行为脱节。',
        },
      ],
    },
    {
      id: 'columns-that-reflow',
      title: '会重排的列',
      content: [
        {
          type: 'prose',
          text: '要让列在小屏幕上重排，使用 `Grid columns={{minWidth, max}}`。数字型 `columns` 在所有宽度下都是精确的 N 列、从不重排：`columns={4}` 在 390px 手机上会渲染出四条不足 100px 宽的轨道，一旦内容无法收缩适配，该行就会溢出页面。`{minWidth: 240, max: 4}` 最多渲染四列、每列至少 240px，容器窄时降为一条全宽列；`max` 正是让最后一列能收缩到容器宽度的关键，而 `gap` 也计入列所需的空间。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '可重排的统计行与固定的星期行',
          code: `// Reflows: 4 columns on desktop, 3 in a 768px-wide grid, 1 on a phone.
<Grid columns={{minWidth: 240, max: 4}} gap={3}>
  {stats.map(stat => <StatCard key={stat.id} {...stat} />)}
</Grid>

// Fixed: exactly 7 columns at every width (a number never reflows).
<Grid columns={7} gap={1}>
  {days.map(day => <DayCell key={day} day={day} />)}
</Grid>`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '只用 `{minWidth}`：列数在下限之上能容纳多少是多少，没有上限；容器窄于 `minWidth` 会溢出，凡是会出现在手机上的布局都要加 `max`',
            "`{minWidth, repeat: 'fit'}`：空轨道塌缩，现存条目随之伸展",
            "数字型 `GridSpan` 超过网格当前列数时，会给整个网格添加隐式列；放在该 span 前后的条目会流入其中，而 `columns='full'` 此时只覆盖显式列。在会重排的网格里，span 应保持在它能达到的最小列数之内，或使用不添加任何隐式列的 `'full'`",
            '改变列的可用空间会影响重排形态能达到的列数：`columnGap` 或 `gap` 的取值、网格上的内联 padding，或通过 `xstyle` 设置的 `grid-auto-flow: column`（它会把条目放进额外的隐式列）。`className` 规则只有在级联中胜过生成样式时才会替换计算出的轨道列表；覆盖样式请优先用 `xstyle`',
          ],
        },
      ],
    },
  ],
};
