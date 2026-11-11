// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/ship/checks`: what each package check
 * proves, what fails and what only warns, and one command to run them all.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'checks',
  placement: {parent: 'namespace:ship', slot: 'guides', order: 20},
  title: '检查集成',
  category: 'guide',
  keywords: ['发布前检查', '校验集成'],
  description:
    '为每类问题选择合适的检查，了解哪些会失败、哪些只警告，并在 CI 中运行全部检查。',
  sections: [
    {
      id: 'pick-a-check',
      title: '选择检查',
      content: [
        {
          type: 'prose',
          text: '在包目录中运行这些检查。四个 `doctor integration` 检查读取你的源码，`integration check` 一次性运行全部四个；`integration verify` 则检查 npm 将要发布的包。',
        },
        {
          type: 'table',
          headers: ['命令', '证明内容', '何时以 1 退出', '何时仅警告'],
          rows: [
            [
              '`{@command doctor integration validate}`',
              'manifest 能加载，每个根目录都装着 CLI 可读取的贡献内容，且每个文档都符合其创作类型。Notes 会列出格式错误的 `cliCommand`（`invalid_cli_command`），以及每个话题中以包运行器写出的命令（`runner_command`）、裸写的命令（`plain_command`）或面向单一包管理器的命令（`package_manager_command`），还有无法解析的 token（`doc_token`；见 {@link generic:doc-syntax}）。Notes 默认不导致失败；`integration check --strict --next` 会对标记为 `next` 的项失败，下一个次版本发布将把它们计入',
              '声明的根目录缺失（`missing_root`）、某个贡献内容无法加载（`invalid_doc`、`invalid_component`、`invalid_theme`），或包内两个模板替换同一个 Core id（`ambiguous_template_replacement`）',
              'manifest 带有此 CLI 不认识的键（`unknown_manifest_key`），或文档字段与该文档的创作类型不符：类型中不存在的字段、缺失的必填字段，或超出字段类型的值。对任何读取端都无法呈现的内容也会警告：重复列出的 prop（`duplicate_prop`）、未指向已文档化 prop 的 `propDescriptions` 键（`unknown_translated_prop`）、没有内容的小节（`empty_section`）、同一话题中键相同的两个小节（`duplicate_section_key`），或旁边没有话题文件的 `.doc.zh.mjs` 或 `.doc.dense.mjs` 覆盖文件（`orphan_doc_overlay`）。自 0.7.3 起，它还会从源码出发、以列表形式（不导致失败）报告包要求应用导入但应用无法导入的内容：组件的 import（文档的 `import`，或 CLI 推导出的）或模板的公开导入，其子路径未在 package.json `exports` 中声明（`component_import_not_exported`、`template_import_not_exported`）或指向另一个包（`component_import_other_package`）；导入未声明子路径的示例（`example_import_not_exported`）；导入模板根目录之外路径的模板（`template_import_outside_root`），或导入其包与 Core 均未导出的路径（`template_private_import`）。同样以列表形式报告的还有：组件 import 所在模块未导出该组件（`component_import_missing_name`）、导入其包未导出名称的示例或模板（`example_import_missing_name`、`template_import_missing_name`），以及没有默认导出的模板源码（`template_no_default_export`）。每一项都是 note，随修复建议一同打印，从下一个次版本起会让 `--strict` 失败；无法判定的导入（如尚未构建的 `exports` 目标，或通向尚未构建的 `dist/` 的深层路径）会在 `publicImports` 下列为未检查。它用你安装的 `typescript` 检查文档；在 `typescript` 缺失或没有 JavaScript 编译器 API（TypeScript 7）之处，改用已安装的 `@typescript/typescript6`；两者都没有时，打印 `[skip] Docs not type-checked`。没有 `astryx.integration.mjs` 时，它打印提示并以 0 退出',
            ],
            [
              '`{@command doctor integration components}`',
              '没有组件名与 Core 组件冲突，每个 `replaces` 都指向一个 Core 组件，且每个组件文档的 props 与组件的 TypeScript props 一致',
              '未安装 Core（`core_not_found`）。在声明了启用替换的 CLI 范围的包中，`replaces` 目标缺失（`missing_component_replacement_target`）或无效（`invalid_component_replacement`），或两个组件替换同一个 Core 组件（`ambiguous_component_replacement`）',
              '名称与 Core 冲突；组件在未声明该范围的包中设置了 `replaces`（`inactive_component_replacement`，缺失、无效或重复的 `replaces` 也一并作为警告上报）；或文档化的 prop 与代码不一致：代码中缺失（`not_in_code`）、文档遗漏包声明的 prop（`not_in_doc`），或其 `required`（`required_mismatch`）、类型（`type_mismatch`）、字面量 `default`（`default_mismatch`）不一致；或组件文档中的 `{@link}` 未指向文档（`invalid_doc_graph`）。它用你安装的 `typescript` 读取 props；没有它时，打印 `[skip] Props not compared`',
            ],
            [
              '`{@command doctor integration templates}`',
              '每个 `replaces` 都指向同类型的 Core 模板',
              '`replaces` 目标缺失（`missing_template_replacement_target`）或类型不符（`invalid_template_replacement`），或两个模板替换同一个 id（`ambiguous_template_replacement`）',
              '模板 id 与 Core id 相同却未设 `replaces`',
            ],
            [
              '`{@command doctor integration docs}`',
              '你的文档树、每个链接、话题名与 Core 的冲突、两个话题逐字重复的段落、填充短语与低密度话题，以及写出的文档指针',
              '话题占用 Core 话题名却未设 `replaces` 或 `extends`、文档无效（`invalid_doc`），或 namespace 或 placement 失败导致文档被隐藏（`invalid_doc_graph`）',
              '链接未指向文档（`invalid_doc_graph`）、两个话题逐字重复一段文字（`copied_passage`）、prose 使用列出的填充短语或低于密度下限（`doc_fluff`），或 prose、描述或摘要、组件文档文本在应检查链接之处写出了 `{@command docs <name>}`（`stray_doc_pointer`）',
            ],
            [
              '`{@command integration check}`',
              '四个 `doctor integration` 检查证明的全部内容，一条命令完成，用于你的构建',
              '四个中任何一个单独运行会以 1 退出的情形。带 `--strict` 时，还包括任何警告，以及任何未能运行的检查（如没有 `astryx.integration.*` 的包）',
              '四个检查警告的任何内容，除非你传入 `--strict`',
            ],
            [
              '`{@command integration verify}`',
              '打包后的包含有全部文件、呈现相同的贡献内容、能解析每个公开导入，并声明了所需的 CLI',
              '`validate` 会失败的任何情形、没有 manifest、文件未进入 `.tgz` 包、导入无法解析，或缺少 CLI peer',
              '`validate` 警告的任何情形；或组件设置了 `replaces` 而包未声明启用它的 CLI 范围（`component_replaces_needs_cli`）',
            ],
          ],
        },
        {
          type: 'prose',
          text: '传入包名（如 `{@command doctor integration validate @acme/astryx-widgets}`），可在应用中改为检查已安装的副本。props 发现项的修复方法见 {@link generic:check-the-props}。',
        },
      ],
    },
    {
      id: 'run-every-check-in-ci',
      title: '在每次构建中运行全部检查（必须）',
      content: [
        {
          type: 'prose',
          text: '每个集成都要在自己的构建中运行 `integration check --strict`，让每次构建都保持文档、类型与链接同步；这是必须项，不是可选项。严格检查对文档检查列出的每个重复段落都会失败（见 {@link generic:check-your-docs}）。发布前请运行 `integration verify`。先安装 devDependencies，因为 components 检查需要 Core，`tsc --noEmit` 需要 `typescript` 和 `tsconfig.json`。在 package.json 中：',
        },
        {
          type: 'code',
          lang: 'json',
          code: '"typecheck": "tsc --noEmit && astryx integration check --strict"',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`integration check` 按该顺序运行 `validate`、`components`、`templates` 和 `docs`，逐个打印结果，最后打印汇总；其中任何一个会以 1 退出时它也以 1 退出。',
            '`--strict` 还会在出现任何警告或任何检查未运行时以 1 退出。不带它时，警告保持退出码 0：在你修复包中已有警告期间可以用这种方式。',
            '它的退出码与 JSON 是构建的契约：新检查或新失败码只会在发布说明中写明的次版本中加入。patch 版本仍可能带来与你的名称冲突的 Core 组件、模板或 CLI 话题。',
            '`integration verify` 只运行 `validate`，不运行其余三个：Core 名称冲突、未指向 Core 模板的 `replaces`、占用 Core 名称的话题、隐藏指南都能通过它。发布前两者都运行：`astryx integration check --strict && astryx integration verify`。',
            '在包内运行裸的 `{@command doctor}`，还会对超过 32 KB 的文档小节发出警告——这是以上检查都不测量的。',
          ],
        },
      ],
    },
    {
      id: 'what-integration-verify-does',
      title: '校验打包后的包',
      content: [
        {
          type: 'prose',
          text: '`integration verify` 用 npm 打包你的包，解包进一个临时应用，并检查该应用能看到源码中的一切。它不发布任何内容，也不留下 `.tgz` 文件或临时文件夹。',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            '它会像 `{@pm-only npm "npm 是向 registry 发布的客户端" publish}` 那样运行 `{@pm-only npm "registry 收到的 tarball" pack}`，包括你的 `prepack` 脚本。',
            '它检查每个贡献文件是否都在 `.tgz` 包内。`files` 中缺失某个根目录会失败，并提示 `Add "templates" to "files" in package.json.`',
            '它列出临时应用看到的组件、模板、主题、文档与 codemod，并与你的源码比对。',
            '它按 Node 的方式解析每个组件的 `import` 和每个模板的公开导入，并检查模块是否以文档记载的名称导出该组件，模板则是否有默认导出。仅类型的导出不算数。',
            '对每个主题，它重新构建源码，将构建出的模块与生产 CSS 同手写产物比对，并证明模块、CSS 与可选字体 CSS 的导出都能从打包后的包中解析。',
            '需要 `@astryxdesign/cli` peer 而缺少它的包会被判失败：设置 `keywords` 的模板需要 `>=0.6.6`；设置 `replaces` 的模板、文档分区、有 placement 的指南、带 `id` 的文档小节或主题需要 `>=0.6.4`。',
          ],
        },
        {
          type: 'prose',
          text: '`integration pack --check` 是该检查在 0.6.5 发布前的名称，现在仍会运行同一检查并打印一条提示；它将在后续版本中移除。选项与退出码见 {@link command:integration verify}。',
        },
      ],
    },
  ],
};
