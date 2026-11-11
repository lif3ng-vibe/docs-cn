// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/write-good-templates/grade-template-with-agent`:
 * give an agent the canonical rubric and require a reproducible template grade.
 */

import {TEMPLATE_RUBRIC} from './template-grading-rubric.doc.mjs';

const scorecardRows = TEMPLATE_RUBRIC.categories
  .map(({title, max}) => `| ${title} | X | ${max} | |`)
  .join('\n');

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'grade-template-with-agent',
  placement: {parent: 'namespace:write-good-templates', slot: 'guides', order: 20},
  title: '用智能体评分并改进',
  category: 'guide',
  description:
    '把评分规则与所需证据交给智能体（agent），让它发现问题、产出可复现的评分卡，并改进模板。',
  sections: [
    {
      id: 'give-the-agent-the-rubric',
      title: '把评分规则交给智能体',
      content: [
        {
          type: 'prose',
          text: `按模板评分规则 ${TEMPLATE_RUBRIC.version} 为一个确切的包修订版评分。把模板 id、包名和一个能安装打包产物的干净应用交给智能体，然后使用下面的提示词。替换所有尖括号占位值。第一遍只读，因此原始得分与发现保持可见。`,
        },
        {
          type: 'code',
          lang: 'text',
          label: '智能体评分提示词',
          code: `Grade integration template <id> from <package> at <revision>.

Before scoring:
1. Read \`astryx docs authoring/building-blocks/templates/write-good-templates --full\`.
2. Read \`astryx docs authoring/building-blocks/templates/write-good-templates/template-grading-rubric --full\` and every guide it links.
3. Inspect the template source, its matching .doc.mjs file, package.json exports and files, and astryx.integration.mjs.
4. Run \`astryx integration verify\` in the package.
5. Follow \`astryx docs authoring/building-blocks/templates/build-the-template/package-and-test/test-template-in-app --full\`: install the packed package in the clean app, copy the template, build the app, and render the behavior matrix.

Score all seven rubric categories. Cite file and line evidence for every deduction. Do not award points for a state you did not inspect. If browser or build evidence is unavailable, say so and mark the template not publishable.

Return the rubric version, package revision, numeric score, letter grade, category scorecard, publishable yes/no verdict, detailed findings, and the top three fixes. Treat 100 as the target. Name every remaining deduction and say whether it is an intentional tradeoff or still needs work. Do not edit files during this first pass.`,
        },
      ],
    },
    {
      id: 'require-a-scorecard',
      title: '要求一份评分卡',
      content: [
        {
          type: 'code',
          lang: 'markdown',
          code: `# Template grade: <id>

**Rubric:** ${TEMPLATE_RUBRIC.version}
**Package revision:** <revision>
**Type:** page | block
**Grade:** <letter> (<score>/100)
**Publishable:** yes | no

| Category | Points | Max | Evidence |
| --- | ---: | ---: | --- |
${scorecardRows}
| **Total** | **X** | **100** | |

## Detailed findings
- <file:line, rubric rule, observed problem, and deduction>

## Publication blockers
- <failed pack, copy, build, asset, browser, theme, responsive, or input check>

## Top three fixes
1. <highest-value fix>
2. <second fix>
3. <third fix>`,
        },
        {
          type: 'prose',
          text: `各类目得分之和必须恰好等于总分，等级按已发布的分数段确定。只有得分达到 ${TEMPLATE_RUBRIC.minimumScore} 或更高，且 package、copy、build、asset 与 rendered-app 各项检查全部通过时，结论才是 \`yes\`。`,
        },
      ],
    },
    {
      id: 'improve-and-regrade',
      title: '改进并重新评分',
      content: [
        {
          type: 'list',
          style: 'ordered',
          items: [
            '先修复发布阻塞项。',
            '修复每一处合理的扣分，且不借助辅助组件或包内 CSS 把它掩盖过去。',
            '重新打包，复制进一个全新应用，让智能体重复完整评分。保留先前的评分卡，让改进可见。',
            '只有当不存在合理修复时才停止，并记录每一处仍会扣分的有意取舍。',
          ],
        },
      ],
    },
  ],
};
