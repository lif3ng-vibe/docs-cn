// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/templates/template-grading-rubric`:
 * complete scoring rules for page and block template quality.
 */

/**
 * The single source of rubric version, grade bands, category ids, and weights.
 * The agent-grading guide and any grading tool import this constant; the
 * detailed scoring rules live in the sections below.
 */
export const TEMPLATE_RUBRIC = Object.freeze({
  version: '1.4',
  minimumScore: 75,
  minimumGrade: 'B',
  grades: Object.freeze([
    Object.freeze({
      grade: 'A',
      min: 90,
      max: 100,
      meaning: '典范。可直接复制使用，无已知质量问题。',
    }),
    Object.freeze({
      grade: 'B',
      min: 75,
      max: 89,
      meaning: '良好。可能仍有小问题，但模板可用。',
    }),
    Object.freeze({
      grade: 'C',
      min: 60,
      max: 74,
      meaning: '发布前需要改进。',
    }),
    Object.freeze({
      grade: 'D',
      min: 40,
      max: 59,
      meaning: '较差。需要大幅重写。',
    }),
    Object.freeze({
      grade: 'F',
      min: 0,
      max: 39,
      meaning: '不及格。模板在传授或产出糟糕的模式。',
    }),
  ]),
  categories: Object.freeze([
    Object.freeze({
      id: 'component_purity',
      title: 'Astryx 组件纯度',
      max: 30,
      guide: 'template-grading-rubric',
    }),
    Object.freeze({
      id: 'icon_purity',
      title: '图标纯度',
      max: 15,
      guide: 'template-grading-rubric',
    }),
    Object.freeze({
      id: 'custom_css',
      title: '自定义 CSS',
      max: 15,
      guide: 'template-grading-rubric',
    }),
    Object.freeze({
      id: 'layout_structure',
      title: '布局与结构',
      max: 15,
      guide: 'template-grading-rubric',
    }),
    Object.freeze({
      id: 'doc_metadata',
      title: '文档元数据',
      max: 10,
      guide: 'template-grading-rubric',
    }),
    Object.freeze({
      id: 'image_handling',
      title: '图片处理',
      max: 5,
      guide: 'template-grading-rubric',
    }),
    Object.freeze({
      id: 'code_quality',
      title: '代码质量',
      max: 10,
      guide: 'template-grading-rubric',
    }),
  ]),
});

const gradeRows = TEMPLATE_RUBRIC.grades.map(({grade, min, max, meaning}) => [
  grade,
  `${min}-${max}`,
  meaning,
]);

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'template-grading-rubric',
  placement: {
    parent: 'namespace:write-good-templates',
    slot: 'guides',
    order: 10,
  },
  title: '完整评分细则',
  category: 'guide',
  description:
    '用一套共享的启发式标准，在 Astryx 用法、图标、CSS、布局、元数据、图片与代码质量各维度上一致地为模板质量打分。',
  sections: [
    {
      id: 'understand-the-score',
      title: '理解分数',
      content: [
        {
          type: 'prose',
          text: '先看 {@link generic:is-my-code-good}：它掌管共享的 Astryx 质量标准。本细则在其上增加模板权重、计数规则与模板专属检查；凡计分涉及某条共享标准的类目，都会点名该标准。',
        },
        {
          type: 'prose',
          text: `模板评分细则 ${TEMPLATE_RUBRIC.version} 共有七个类目，满分 100 分。以 100 分为目标；${TEMPLATE_RUBRIC.minimumGrade}（${TEMPLATE_RUBRIC.minimumScore} 分）只是发布门槛，不是目标。下面每个类目都列出了自己的权重。绝不要给任何你没有亲自检查过的东西加分。`,
        },
        {
          type: 'table',
          headers: ['等级', '分数', '含义'],
          rows: gradeRows,
        },
        {
          type: 'prose',
          text: '只要某个扣分点还有合理的修法，就继续改进。低于 100 分只在剩余取舍是有意为之且已记录时才可接受。如果复制出的文件无法构建或缺少必需资源，无论得分多少，模板都算未就绪。',
        },
        {
          type: 'prose',
          text: `版本 ${TEMPLATE_RUBRIC.version} 把公开的集成组件视为 Astryx 组件，并在复制之后检查资源与导入。每次评分都记录版本号，让结果可以相互比较。`,
        },
      ],
    },
    {
      id: 'component-purity',
      title: 'Astryx 组件纯度：30 分',
      content: [
        {
          type: 'prose',
          text: '本类目对应 {@link generic:is-my-code-good} 中的 Astryx components 标准。统计复制出的 `.tsx` 源码中的每个 JSX 开标签。Astryx 元素是从 `@astryxdesign/core` 或集成包公开组件导出导入的组件。原生 HTML 元素是任何小写的 JSX 固有标签。按出现次数统计，不只统计去重后的标签名。',
        },
        {
          type: 'prose',
          text: 'fragment 与同文件内定义的 PascalCase 辅助组件不计入。检查该辅助组件并统计其内部的原生 HTML。对每个原生元素，按该指南判断它是必要的（Astryx 没有等价物），还是不必要的（Astryx 组件可以替代）。',
        },
        {
          type: 'table',
          headers: ['原生 HTML 元素', '分数'],
          rows: [
            ['0', '30'],
            ['1-2 个，全部必要', '25'],
            ['1-2 个，存在不必要者', '20'],
            ['3-5', '15'],
            ['6-10', '8'],
            ['11-20', '4'],
            ['21 个及以上', '0'],
          ],
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '当没有通用 Astryx 图片组件适用、且其来源能通过图片处理类目时，`img` 不扣分。',
            '为提供原生提交语义而包在 `FormLayout` 外的 `form` 不扣分。',
            '承载原生表单状态的 `input type="hidden"` 不扣分。',
          ],
        },
      ],
    },
    {
      id: 'icon-purity',
      title: '图标纯度：15 分',
      content: [
        {
          type: 'prose',
          text: '本类目对应 {@link generic:is-my-code-good} 中的 Icons 标准。统计复制出的文件中的原生图标标记。{@link generic:template-icons} 展示了如何改用 Astryx 渲染图标。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '统计用作图标的每个原生 `svg`、`path`、`circle`、`rect`、`line`、`polyline`、`polygon`、`ellipse` 或 `g`。',
            '统计模板中定义的内联 SVG 组件。',
            '统计直接渲染、而未经 `Icon` 或 Astryx 图标 prop 的图标组件。',
          ],
        },
        {
          type: 'table',
          headers: ['原生 SVG 图标实例', '分数'],
          rows: [
            ['0', '15'],
            ['1-2', '10'],
            ['3-5', '5'],
            ['6 个及以上', '0'],
          ],
        },
      ],
    },
    {
      id: 'custom-css',
      title: '自定义 CSS：15 分',
      content: [
        {
          type: 'prose',
          text: '本类目对应 {@link generic:is-my-code-good} 中的 Styling 标准。统计 `stylex.create` 与内联 `style` 对象里的每条 CSS 属性。每处 `className` 与 `stylex.props` 各计一次。`gap`、`padding`、`variant`、`size`、`color`、`level`、`columns`、`contentPadding`、`height` 等 Astryx prop 不计入。',
        },
        {
          type: 'table',
          headers: ['自定义样式声明', '分数'],
          rows: [
            ['0', '15'],
            ['1-3 条，全部合理（Astryx 无替代方案）', '12'],
            ['1-3 条，存在不合理者（存在 Astryx prop）', '8'],
            ['4-10', '5'],
            ['11-20', '2'],
            ['21 条及以上', '0'],
          ],
        },
        {
          type: 'prose',
          text: '本类目只统计复制出的源码中编写的样式。包内样式表会通过其对可移植性与渲染效果的影响来评判，而不能当作把自定义声明藏起来躲过统计的手段。',
        },
      ],
    },
    {
      id: 'layout-and-structure',
      title: '布局与结构：15 分',
      content: [
        {type: 'heading', level: 3, text: '页面模板'},
        {
          type: 'list',
          style: 'ordered',
          items: [
            '按 {@link generic:is-my-code-good} 的 Layout 标准选择页面根组件。在模板中，只有以 `Shell -` 开头的类目才拥有全局外壳，才使用 `AppShell`；其余页面模板都用 `Layout` 或 `Center`。',
            '`Shell -` 模板之外，全局导航交给宿主应用。页内导航放进 `LayoutPanel`，页面标题放进 `LayoutHeader`。',
            '响应式集合使用 `Grid` 配 `columns={{minWidth: 280}}`。不要固定列数，也不要用原生 CSS 重造网格。',
            '居中内容使用 `Center`，不要用自定义 flexbox 变通。',
            '一个页面来自一个源文件。链接可以是无效的示例，但模板不创建嵌套路由或路由器集成。',
          ],
        },
        {
          type: 'table',
          headers: ['页面情形', '分数'],
          rows: [
            [
              '根组件正确、网格响应式、居中得当，且只有一页',
              '15',
            ],
            [
              '根组件有效，但有较小问题，如固定列数或多页行为',
              '8',
            ],
            [
              '根组件与类目不符、使用原生布局根，或没有 Astryx 根',
              '0',
            ],
          ],
        },
        {type: 'heading', level: 3, text: '区块模板'},
        {
          type: 'list',
          style: 'ordered',
          items: [
            '不要把区块包进 `AppShell`。区块渲染在预览或页面容器之内。',
            '让区块聚焦于一个模式或一种组件用法。',
            '组合要足以讲清该模式，又要小到易于改造。通常在 20-100 行左右。',
          ],
        },
        {
          type: 'table',
          headers: ['区块情形', '分数'],
          rows: [
            [
              '没有 `AppShell`、聚焦一个模式、长度合理',
              '15',
            ],
            ['有较小的聚焦或长度问题', '10'],
            ['包在 `AppShell` 里，或严重缺乏聚焦', '0'],
          ],
        },
      ],
    },
    {
      id: 'doc-metadata',
      title: '文档元数据：10 分',
      content: [
        {
          type: 'prose',
          text: '字段准确性 6 分，描述 3 分，命名 1 分。把源码与文档放在一起读。字段存在但与源码不符，不算完整。',
        },
        {type: 'heading', level: 3, text: '字段：6 分'},
        {
          type: 'list',
          style: 'unordered',
          items: [
            '页面：`type`、`name`、`displayName`、`description`、显式的 `isReady`；若页面供人浏览，还需具体的 `category`。',
            '区块：`type`、`name`、`displayName`、`description`、显式的 `isReady`、正数的 `aspectRatio`，以及完整的 `componentsUsed`。',
            '关系与预览字段以 {@link generic:block-template} 为准。与该指南相矛盾的值即视为不准确。',
          ],
        },
        {
          type: 'table',
          headers: ['字段情形', '分数'],
          rows: [
            ['所有适用字段齐全且准确', '6'],
            ['字段齐全，但有一处不准确', '4'],
            ['缺少一个必需字段', '2'],
            ['缺少两个及以上必需字段，或没有文档', '0'],
          ],
        },
        {type: 'heading', level: 3, text: '描述：3 分'},
        {
          type: 'prose',
          text: '一条有力的描述覆盖四个要点：原型类型、使用者要做的事、结构或行为上的差异点，以及人们可能搜索的替换单词。去掉 page、screen、app、view 与组件名等泛词后，至少使用六个不同的实义词。描述可复用的形态，而不只是示例数据。',
        },
        {
          type: 'table',
          headers: ['描述情形', '分数'],
          rows: [
            [
              '四个要点齐备、6 个以上不同实义词、与兄弟模板区分明显',
              '3',
            ],
            [
              '说出并区分了模式，但缺一个要点，或同义词没有写明',
              '2',
            ],
            [
              '空泛、重复组件名，或只描述示例数据',
              '1',
            ],
            ['缺失，或只是复述名称', '0'],
          ],
        },
        {type: 'heading', level: 3, text: '命名：1 分'},
        {
          type: 'prose',
          text: 'id 遵循 {@link generic:start-a-template}，`displayName` 可读，供浏览的页面有具体的 category（{@link generic:page-template}）。slug 长度只是建议，不是计分条件。',
        },
        {
          type: 'table',
          headers: ['命名情形', '分数'],
          rows: [
            [
              'id、显示名称与适用 category 都符合约定',
              '1',
            ],
            ['任何命名或 category 要求未达成', '0'],
          ],
        },
      ],
    },
    {
      id: 'image-handling',
      title: '图片处理：5 分',
      content: [
        {
          type: 'prose',
          text: '本类目对应 {@link generic:is-my-code-good} 中的 Images and assets 标准。对照 {@link generic:template-images-media} 检查复制出的文件中的每一处图片引用。',
        },
        {
          type: 'table',
          headers: ['图片情形', '分数'],
          rows: [
            [
              '无需图片；或复制后每张图片仍正常，且示例占位行为是有意为之',
              '5',
            ],
            [
              '预览中缺一张可选的示例图片，或仍残留占位服务',
              '2',
            ],
            [
              '复制后关键图片失效、使用包相对路径，或依赖无法访问的 URL',
              '0',
            ],
          ],
        },
      ],
    },
    {
      id: 'code-quality',
      title: '代码质量：10 分',
      content: [
        {
          type: 'prose',
          text: '本类目对应 {@link generic:is-my-code-good} 中的 Code health 标准，外加模板独有的条件。每个条件 2 分。评判对象是复制出的文件，而不只是包源码。',
        },
        {
          type: 'table',
          headers: ['条件', '分数', '如何核验'],
          rows: [
            [
              'client 边界正确',
              '2',
              '当用到 hook、事件处理器或浏览器 API 时，`use client` 是第一条可执行语句。静态模板不画蛇添足地添加它。',
            ],
            [
              '默认导出',
              '2',
              '复制出的文件有且仅有一个默认导出的 React 组件。',
            ],
            [
              '导入自包含',
              '2',
              '每个导入都能从复制后的位置解析：通过 React、公开的 Astryx 路径、集成包的公开导出，或模板明确要求的应用依赖。',
            ],
            [
              '示例数据真实',
              '2',
              '内容使用真实的姓名、金额、日期、长度与状态，而不是 lorem ipsum 或编号占位符。',
            ],
            [
              '没有死代码',
              '2',
              '没有未使用的导入或变量、注释掉的代码块，以及从未调用的辅助函数。',
            ],
          ],
        },
      ],
    },
  ],
};
