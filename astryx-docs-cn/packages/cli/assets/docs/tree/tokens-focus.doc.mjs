// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Source: packages/core/src/theme/tokens.stylex.ts,
//   dataTokens.stylex.ts, and syntax/tokens.ts
// Run: node scripts/generate-token-docs.mjs

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  "type": "generic",
  "name": "tokens-focus",
  "title": "焦点令牌",
  "placement": {
    "parent": "namespace:tokens",
    "slot": "guides",
    "order": 70
  },
  "category": "foundations",
  "description": "键盘焦点环，由所有绘制焦点环的组件共享。覆盖这些令牌即可统一重设整个系统的焦点样式。",
  "sections": [
    {
      "title": "焦点令牌",
      "content": [
        {
          "type": "prose",
          "text": "键盘焦点环，由所有绘制焦点环的组件共享。覆盖这些令牌即可统一重设整个系统的焦点样式。"
        },
        {
          "type": "table",
          "headers": [
            "令牌",
            "值"
          ],
          "rows": [
            [
              "--focus-outline-width",
              "2px"
            ],
            [
              "--focus-outline-style",
              "solid"
            ],
            [
              "--focus-outline-color",
              "var(--color-accent)"
            ],
            [
              "--focus-outline-offset",
              "3px"
            ]
          ]
        }
      ]
    }
  ]
};
