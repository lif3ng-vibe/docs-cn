// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Source: packages/core/src/theme/tokens.stylex.ts,
//   dataTokens.stylex.ts, and syntax/tokens.ts
// Run: node scripts/generate-token-docs.mjs

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  "type": "generic",
  "name": "tokens-syntax",
  "title": "语法高亮令牌",
  "placement": {
    "parent": "namespace:tokens",
    "slot": "guides",
    "order": 30
  },
  "category": "foundations",
  "description": "CodeBlock 所使用的代码高亮颜色。每项默认取自一个调色板令牌，因此语法颜色会跟随主题；defineTheme({syntax}) 则可改为指定一套语法主题。",
  "sections": [
    {
      "title": "语法高亮令牌",
      "content": [
        {
          "type": "prose",
          "text": "CodeBlock 所使用的代码高亮颜色。每项默认取自一个调色板令牌，因此语法颜色会跟随主题；defineTheme({syntax}) 则可改为指定一套语法主题。"
        },
        {
          "type": "table",
          "headers": [
            "令牌",
            "值"
          ],
          "rows": [
            [
              "--color-syntax-keyword",
              "var(--color-text-accent)"
            ],
            [
              "--color-syntax-string",
              "var(--color-text-green)"
            ],
            [
              "--color-syntax-comment",
              "var(--color-text-secondary)"
            ],
            [
              "--color-syntax-number",
              "var(--color-text-orange)"
            ],
            [
              "--color-syntax-function",
              "var(--color-text-blue)"
            ],
            [
              "--color-syntax-type",
              "var(--color-text-purple)"
            ],
            [
              "--color-syntax-variable",
              "var(--color-text-primary)"
            ],
            [
              "--color-syntax-operator",
              "var(--color-text-cyan)"
            ],
            [
              "--color-syntax-constant",
              "var(--color-text-orange)"
            ],
            [
              "--color-syntax-tag",
              "var(--color-text-red)"
            ],
            [
              "--color-syntax-attribute",
              "var(--color-text-teal)"
            ],
            [
              "--color-syntax-property",
              "var(--color-text-cyan)"
            ],
            [
              "--color-syntax-punctuation",
              "var(--color-text-secondary)"
            ],
            [
              "--color-syntax-background",
              "var(--color-background-muted)"
            ],
            [
              "--color-syntax-added",
              "color-mix(in srgb, var(--color-success-muted) 25%, transparent)"
            ],
            [
              "--color-syntax-removed",
              "color-mix(in srgb, var(--color-error-muted) 25%, transparent)"
            ],
            [
              "--color-syntax-diff-header",
              "var(--color-background-muted)"
            ],
            [
              "--color-syntax-added-marker",
              "var(--color-text-green)"
            ],
            [
              "--color-syntax-removed-marker",
              "var(--color-text-red)"
            ]
          ]
        }
      ],
      "previewType": "swatch"
    }
  ]
};
