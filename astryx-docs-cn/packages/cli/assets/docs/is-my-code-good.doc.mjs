// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs is-my-code-good`: one evidence-first guide for checking
 * whether a product surface uses Astryx well and improving it with an agent.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'is-my-code-good',
  title: '我的 Astryx 代码好吗？',
  category: 'guide',
  keywords: [
    '我的代码好吗',
    '审查我的代码',
    '代码评审',
    '检查我的代码',
    '评估我的代码',
    '审查 astryx 代码',
    '评分细则',
    'astryx 质量评分细则',
    '自定义代码审计',
  ],
  description:
    '检查产品界面是否契合其应用并良好使用 Astryx，为每条结论索要证据，并用可复现的智能体（agent）评审加以改进。',
  sections: [
    {
      id: 'understand-the-app',
      title: '理解应用',
      content: [
        {
          type: 'prose',
          text: '不要孤立地评判某个文件或界面。先弄清使其模式正确、不一致或不完整的应用上下文。',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            '说明这个应用是做什么的、谁在用它，以及这个界面帮助用户完成什么任务。',
            '追踪界面所处的位置：路由、入口、导航路径、父级外壳，以及它应当使用的页面或区块模式。',
            '检查承担相同或相近职责的相邻界面。记录它们共享的头部、操作、布局原语、间距、密度、状态与窄屏行为。',
            '阅读项目指引，包括根目录与相关嵌套的 `AGENTS.md` 文件。记录应用自有的包装组件与有意为之的应用约定。',
            '从项目清单与锁文件记录已安装的 `@astryxdesign/core`、`@astryxdesign/cli` 与集成包版本。运行已安装的 `{@command component --list}` 查看核心与集成组件，再检查未出现在该目录中的应用自有包装。',
            '列出影响任务的真实数据状态、角色与权限、支持的 locale 与 RTL 行为，以及移动端或窄宽度需求。',
          ],
        },
        {
          type: 'prose',
          text: '把这些上下文随评审一起保留。把无法了解的内容标记为 `not inspected`。不要仅因为某个有文档记载、有意为之的应用约定不同于通用模式就将其记为问题；引用该约定，并验证用户任务与无障碍要求仍然成立。',
        },
      ],
    },
    {
      id: 'choose-the-review',
      title: '选择评审类型',
      content: [
        {
          type: 'prose',
          text: '针对一个确切修订版本和一个具名产品界面、路由或组件，在其应用上下文中评审。选择能回答你问题的最小评审。',
        },
        {
          type: 'table',
          headers: ['评审', '适用场景', '能证明什么'],
          rows: [
            [
              '源码检查',
              '快速检查裸元素、直接使用的图标、自定义样式与不受支持的导入',
              '源码发现，加上项目中可见的应用上下文。它不能判定渲染出的产品是好的。',
            ],
            [
              '完整产品评审',
              '判定某个界面已完成',
              '应用契合度与任务完成度，外加源码质量、渲染布局、状态、资源、项目检查与无障碍证据。',
            ],
            [
              '模板发布评级',
              '供人复制的集成模板',
              '共享标准，外加 {@link generic:grade-template-with-agent} 中带版本的评分、元数据、打包、文案与整洁应用检查。',
            ],
          ],
        },
        {
          type: 'prose',
          text: '即便手里只有一个源文件，也照样运行源码检查，并利用一切可用的项目上下文。报告明确的源码阻碍项；列出缺失的应用目的、路由、相邻模式、外壳、主题与密度、已安装组件与版本、真实状态与角色、locale 与移动需求、修订版本、可运行应用、渲染状态与项目检查；并且不要判定整个产品是好的。',
        },
        {
          type: 'prose',
          text: "本指南中的 `astryx` 指项目已安装的 CLI 调用方式，例如本地二进制或既有的 package 脚本。如果项目没有已安装的调用方式，请报告这一证据缺口，而不是为评审下载另一个 CLI 版本。",
        },
        {
          type: 'prose',
          text: '截图能证明可见的结果，但不能证明是哪些导入、组件或样式产生的它。仅有源码也无法证明响应式行为、交互、颜色模式或资源是否加载。把所供证据之外的一切标记为 `not inspected`。',
        },
      ],
    },
    {
      id: 'apply-the-rubric',
      title: '应用共享评分细则',
      content: [
        {
          type: 'prose',
          text: '把每个类别标记为 `good`、`needs work` 或 `not inspected`。为每条依赖上下文的结论引用路由、相邻界面、项目指引、主题、组件目录或用户需求；为每条源码结论引用文件与行号；为每条视觉结论指明渲染状态。绝不要把证据缺失当作通过。阻碍项（blocker）是阻止界面构建、渲染、运行、让目标用户完成任务或满足无障碍要求的发现。其余偏离细则之处均为 `needs work`。',
        },
        {
          type: 'table',
          headers: ['类别', '好意味着什么'],
          rows: [
            [
              '应用契合度与任务完成度',
              "界面使用应用既有的外壳、页面模式、主题、密度、包装、集成与交互约定，除非偏离是有意且有据的。目标用户能在范围内的真实状态与权限下完成该界面的任务。",
            ],
            [
              'Astryx 组件',
              '凡有合适组件的可见或交互模式都由 Astryx 承担。裸元素只在原生语义必要或 Astryx 无等价物时保留。',
            ],
            [
              '图标',
              '图标通过 `Icon`、`IconButton` 或接收组件的 icon prop 渲染，而不是裸 SVG 或直接使用的图标库组件。',
            ],
            [
              '样式',
              '组件 prop 与设计令牌先干活，然后才轮到自定义 StyleX 声明、内联样式或 class。每条自定义规则都要有理由：没有任何受支持的 Astryx 接口适用。',
            ],
            [
              '布局',
              'Astryx 布局原语表达可见的结构、层级、间距与响应式行为，无需用裸容器或 CSS 重建同样的模式。',
            ],
            [
              '图片与资源',
              '每张图片、字体及其他资源都是有意的、无障碍的、稳定的，并能在产品构建路径下正常工作。',
            ],
            [
              '代码健康度',
              '公开导入可解析，客户端边界确有必要，可达状态都有处理，没有死代码或包装掩盖发现。',
            ],
          ],
        },
        {
          type: 'prose',
          text: "在把某个模式称作自定义或错误之前，先对比相邻界面与已安装的组件目录。若应用自有的包装或集成组件已承担该职责，就复用它。有文档记载的应用约定不会仅因不同于通用模式而成为发现；引用该约定并验证用户任务与无障碍要求。",
        },
        {type: 'heading', level: 3, text: '常见组件替换'},
        {
          type: 'table',
          headers: ['裸模式', '常见 Astryx 承担者'],
          rows: [
            [
              '布局 `div`',
              '`VStack`、`HStack`、`Grid`、`Card`、`Section` 或 `Center`',
            ],
            ['`span`、`p`、`h1` 到 `h6`', '`Text` 或 `Heading`'],
            ['`button` 或链接式操作', '`Button`、`IconButton` 或 `Link`'],
            ['页内 `nav` 或 `aside`', '`LayoutPanel`'],
            [
              '`header` 或 `main`',
              '`Layout` 内的 `LayoutHeader` 或 `LayoutContent`',
            ],
            ['`ul`、`ol` 或 `li`', '`List` 与 `ListItem`'],
            [
              '`input`、`textarea` 或 `select`',
              '对应的 Astryx 表单控件',
            ],
            ['`table`、`tr` 或 `td`', '`Table`'],
            [
              '`hr`、`dialog`、`details` 或 `summary`',
              '`Divider`、`Dialog` 或 `Collapsible`',
            ],
          ],
        },
        {
          type: 'prose',
          text: '当原生元素的语义必要且 Astryx 无等价物时保留它。常见例子有提供原生提交的 `form`、承载原生表单状态的 `input type="hidden"`，以及没有通用 Astryx 图片组件适用时的 `img`。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            "把该路由与承担同样职责的相邻界面对比。在评判目标之前，先弄清应用共享的头部、操作、外壳、页面模式、间距与密度。",
            '检查每个 JSX 开标签。把裸 HTML 藏到 PascalCase 辅助函数后面，并不会让底层模式变成 Astryx 组件。',
            '清点每个用作图标的裸 SVG 元素，包括 `svg`、`path`、`circle`、`rect`、`line`、`polyline`、`polygon`、`ellipse` 与 `g`。对内联 SVG 辅助函数，其裸 SVG 元素只在定义处计一次，不在每次渲染时重复计。清点每个在 Astryx 图标表面之外直接渲染的图标库组件。',
            '用 `{@command component <Name> --dense}` 查询可能的替代。不要发明已安装版本并不提供的组件或 prop。',
            '在重建某个模式之前，运行已安装的 `{@command component --list}` 并检查应用自有包装。优先使用该应用或其已安装集成已在用的组件。',
            '检查每个 `stylex.create` 声明、内联样式、`className` 与 `stylex.props` 用法。先找组件 prop 或令牌。',
            "替换字面间距值时，读 `{@command docs spacing --full}` 找到匹配的档位或令牌，并读目标组件文档确认 prop 接受的刻度。不要瞎猜像素到档位的映射。",
            '选择与界面匹配的根。页面用 `Layout`，居中内容用 `Center`，只有当界面承载全局应用框架时才用 `AppShell`。',
            '渲染真实的空态、加载、错误、长内容与交互状态。检查窄、宽两种宽度以及每种支持的颜色模式。',
            '核实目标角色与权限、支持的 locale 与 RTL 行为以及移动需求。从入口到完成走一遍真实任务，而不是只看静态页面。',
            '运行产品构建、类型检查、测试与无障碍检查。让缺失或失败的检查保持可见，而不是宣布结果良好。',
          ],
        },
        {
          type: 'prose',
          text: '这份共享细则没有数字评分。它回答普通产品代码是否良好地使用了 Astryx，而不是假装某个不适用的模板字段或缺席的浏览器状态挣到了分。集成模板在 {@link generic:template-grading-rubric} 中补充带版本的评分。',
        },
      ],
    },
    {
      id: 'collect-the-evidence',
      title: '收集证据',
      content: [
        {
          type: 'list',
          style: 'ordered',
          items: [
            '记录确切修订版本、具名界面、路由与范围内源文件。若文件不在版本控制中，为每个文件记录内容哈希，并说明没有可用的项目修订版本。',
            "写下应用目的、目标用户、界面任务、入口、导航路径、父级外壳、预期页面模式以及用于对比的相邻界面。",
            '记录项目指引、主题、密度、已安装的 Astryx 与集成版本、`{@command component --list}` 的相关输出，以及应用自有包装或约定。',
            '列出重要的状态与上下文，包括真实数据形态、角色与权限，以及适用时的空态、加载、错误、长内容、交互、窄宽度、宽宽度、支持的配色模式、locale 与 RTL 行为。',
            '运行产品并捕获每个具名的渲染状态。可见结论用截图或实时浏览器结果，并从入口到完成跟踪目标用户任务。',
            '运行构建、类型检查、测试与无障碍检查。把命令与结果随评审一起保留。',
            '对每个替换、prop 或组合存疑的 Astryx 组件，阅读 `{@command component <Name> --dense}`。',
          ],
        },
      ],
    },
    {
      id: 'ask-an-agent',
      title: '求助智能体',
      content: [
        {
          type: 'prose',
          text: '先做一轮只读评审，让原始发现保持可见。替换提示词中每个尖括号值。',
        },
        {
          type: 'code',
          lang: 'text',
          label: '智能体评估提示词',
          code: `Evaluate how well <surface> at <revision> fits <app> and uses Astryx. Do not edit files during this first pass.

\`astryx\` below means the project's installed CLI invocation, such as its local binary or existing package script. If none is installed, report that evidence gap instead of downloading a different version.

Before evaluating:
1. Read \`astryx docs is-my-code-good --full\`.
2. Read the root and relevant nested \`AGENTS.md\` files plus other project guidance. State what the app is for, who uses it, and the task this surface supports.
3. Trace the surface's route, entry point, navigation path, parent shell, and expected page or block pattern.
4. Inspect at least two sibling surfaces that do the same or adjacent jobs. Record their shared headers, actions, layout, spacing, density, states, and narrow-screen behavior.
5. Record the app's theme, density, app-owned wrappers, and documented intentional conventions.
6. Read the project manifest and lockfile for the installed Astryx, CLI, and integration versions. Run \`astryx component --list\`, then identify relevant integration components and app-owned wrappers.
7. List the real data states, roles and permissions, supported locales and RTL behavior, and mobile or narrow-width needs.
8. Inspect every source file in scope and its public imports.
9. Run \`astryx component <Name> --dense\` for each Astryx component whose replacement, prop, or composition you question.
10. Read \`astryx docs spacing --full\` and the target component's docs before mapping a literal spacing value to a prop or token.
11. Render every supplied state at narrow and wide widths and in each supported color mode.
12. Read the build, type-check, test, and accessibility-check results.

If only source is supplied, continue with a source check. Report blockers visible in the source, list every missing app-context and product-evidence item, and do not call the full product good. Do not leave the blocker list empty only because no checks were supplied.

Judge the code against the app as well as Astryx. Ask whether it matches sibling surfaces, uses the right shell and page pattern, reuses app or integration components instead of rebuilding them, preserves intentional app conventions, and lets the target user complete the task.

For each rubric category, return \`good\`, \`needs work\`, or \`not inspected\`. Every context-dependent finding must cite the route, sibling file, project guidance, theme, component catalog, wrapper, or user requirement it relies on. Cite file and line evidence for source findings and name the rendered state for visual findings. Mark context you could not learn as \`not inspected\`. Do not flag a documented intentional app convention merely because it differs from a generic pattern. Never turn missing evidence into a pass. Do not hide raw HTML or custom styles behind a helper. Do not calculate a template score for ordinary product code.

Return:
- app purpose, target users, surface job, route, and entry path
- app context inspected and app context missing
- product evidence inspected and product evidence missing
- one row per rubric category with result, evidence, and fix
- task-completion, functional, or accessibility blockers visible in the source or found by the supplied checks
- the top three fixes in order
- every claim that still needs a person to verify`,
        },
      ],
    },
    {
      id: 'verify-and-repeat',
      title: '验证、改进、重复',
      content: [
        {
          type: 'list',
          style: 'ordered',
          items: [
            '拒绝缺少应用上下文、源码与渲染证据的 `good` 结论。打开每处被引用的路由、相邻文件、指引文件与源码位置，并复现每个具名的可见状态。',
            '检查有文档记载的有意约定没有仅因不同于通用模式而被标记，评审者无法了解的上下文仍保持 `not inspected`。',
            '先修复任务完成、构建、功能与无障碍的阻碍项。',
            '先复用应用外壳、页面模式、包装与已安装集成组件，再去替换不必要的裸元素、直接图标与自定义样式。',
            '再次跟踪目标用户任务，渲染完整状态集，并重跑项目检查。',
            '在新修订版本上重复只读评审。保留第一份报告，让改进与每个遗留取舍保持可见。',
          ],
        },
        {
          type: 'prose',
          text: '对集成模板，最后按 {@link generic:grade-template-with-agent} 的带分打包与文案流程收尾。普通产品代码到有据可依的分类报告为止，不会获得模板发布评级。',
        },
      ],
    },
  ],
};
