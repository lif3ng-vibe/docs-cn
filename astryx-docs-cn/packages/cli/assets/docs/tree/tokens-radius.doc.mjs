// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Source: packages/core/src/theme/tokens.stylex.ts,
//   dataTokens.stylex.ts, and syntax/tokens.ts
// Run: node scripts/generate-token-docs.mjs

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  "type": "generic",
  "name": "tokens-radius",
  "title": "圆角令牌",
  "placement": {
    "parent": "namespace:tokens",
    "slot": "guides",
    "order": 80
  },
  "category": "foundations",
  "description": "基于 4dp 基准单位的数值标尺。这些令牌随主题的圆角倍率缩放；--radius-none 与 --radius-full 固定不变。",
  "sections": [
    {
      "title": "圆角令牌",
      "content": [
        {
          "type": "prose",
          "text": "基于 4dp 基准单位的数值标尺。这些令牌随主题的圆角倍率缩放；--radius-none 与 --radius-full 固定不变。"
        },
        {
          "type": "table",
          "headers": [
            "令牌",
            "值"
          ],
          "rows": [
            [
              "--radius-none",
              "0px"
            ],
            [
              "--radius-inner",
              "4px"
            ],
            [
              "--radius-element",
              "8px"
            ],
            [
              "--radius-container",
              "12px"
            ],
            [
              "--radius-page",
              "28px"
            ],
            [
              "--radius-chat",
              "28px"
            ],
            [
              "--radius-full",
              "9999px"
            ]
          ]
        }
      ],
      "previewType": "radius-box"
    }
  ]
};
