// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/build-the-template/template-assets/template-icons`:
 * render template icons through Astryx and ship custom product icons from the
 * package.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'template-icons',
  placement: {
    parent: 'namespace:template-assets',
    slot: 'guides',
    order: 40,
  },
  title: '图标',
  category: 'guide',
  description:
    '通过 Astryx 渲染图标，保持一致与无障碍；自定义产品图标随你的包交付。',
  sections: [
    {
      id: 'use-astryx-icon',
      title: '使用 Astryx Icon',
      content: [
        {
          type: 'prose',
          text: '独立图标用 `Icon`。组件的图标 prop 则传它接受的类型：多数组件（如 `Button` 与 `IconButton`）接受 `<Icon icon={BellIcon} />` 这样的元素，部分菜单与导航项也接受图标定义本身。这样尺寸、颜色与无障碍行为都与系统对齐。',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {BellIcon} from '@heroicons/react/24/outline';

<Icon icon={BellIcon} size="sm" />
<Button label="Alerts" icon={<Icon icon={BellIcon} />} />`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '模板内始终使用同一个受支持的图标集。',
            '通过 Astryx 控件 API，为纯图标控件提供其必需的可见或辅助标签。',
            '已有图标定义可用时，不要粘贴原生 `svg` 与 `path` 标记。',
            '`Icon` 或接收方 Astryx 组件能渲染时，不要直接渲染库图标。',
            'Astryx 之外的图标库要声明为依赖（{@link generic:export-template-assets}）。',
          ],
        },
      ],
    },
    {
      id: 'ship-a-custom-icon',
      title: '审慎交付自定义图标',
      content: [
        {
          type: 'prose',
          text: '产品标识或缺失的领域符号可以留在包内。从公开包路径导出一个兼容的图标定义，再由模板导入该路径。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'templates/acme-dashboard.tsx',
          code: `import {Icon} from '@astryxdesign/core/Icon';
import {AcmePulseIcon} from '@acme/astryx-widgets/icons/AcmePulseIcon';

<Icon icon={AcmePulseIcon} size="sm" label="Account health" />`,
        },
        {
          type: 'prose',
          text: '导出该图标路径，并把其文件纳入包中（{@link generic:export-template-assets}）。',
        },
      ],
    },
    {
      id: 'check-icons-in-the-app',
      title: '在应用中检查图标',
      content: [
        {
          type: 'prose',
          text: '在应用中测试模板时（{@link generic:test-template-in-app}），还需确认以下几点。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '每种图标状态都能渲染，包括选中、禁用、加载中与窄布局。',
            '有含义的图标带无障碍名称；装饰性图标不重复朗读文本。',
            '图标缺失时控件不得留空。',
          ],
        },
      ],
    },
  ],
};
