// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Source: packages/core/src/theme/tokens.stylex.ts,
//   dataTokens.stylex.ts, and syntax/tokens.ts
// Run: node scripts/generate-token-docs.mjs

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  "type": "generic",
  "name": "tokens-ease",
  "title": "缓动令牌",
  "placement": {
    "parent": "namespace:tokens",
    "slot": "guides",
    "order": 110
  },
  "category": "foundations",
  "description": "动画与过渡的缓动曲线。主题的两个 `motion` 旋钮中，`character` 决定 `--ease-entrance` 与 `--ease-move`：`crisp` 减速且不过冲，`expressive` 略微过冲，在 `standard` 下两者都等于 `--ease-standard`；`--ease-exit` 在任何 character 取值下都保持自己的曲线。`tempo` 不影响曲线。时长标尺自身的字段优先于旋钮，显式 `tokens` 优先于一切。这里的任何曲线都不塑造跟随手指或系统的运动（拖拽、惯性动量、橡皮筋效果、屏幕键盘）；无论 character 如何取值，按压的时钟、悬停意图延迟与手势阈值都保持自己的时序。",
  "sections": [
    {
      "title": "缓动令牌",
      "content": [
        {
          "type": "prose",
          "text": "动画与过渡的缓动曲线。主题的两个 `motion` 旋钮中，`character` 决定 `--ease-entrance` 与 `--ease-move`：`crisp` 减速且不过冲，`expressive` 略微过冲，在 `standard` 下两者都等于 `--ease-standard`；`--ease-exit` 在任何 character 取值下都保持自己的曲线。`tempo` 不影响曲线。时长标尺自身的字段优先于旋钮，显式 `tokens` 优先于一切。这里的任何曲线都不塑造跟随手指或系统的运动（拖拽、惯性动量、橡皮筋效果、屏幕键盘）；无论 character 如何取值，按压的时钟、悬停意图延迟与手势阈值都保持自己的时序。"
        },
        {
          "type": "table",
          "headers": [
            "令牌",
            "值"
          ],
          "rows": [
            [
              "--ease-standard",
              "cubic-bezier(0.24, 1, 0.4, 1)"
            ],
            [
              "--ease-entrance",
              "cubic-bezier(0.24, 1, 0.4, 1)"
            ],
            [
              "--ease-move",
              "cubic-bezier(0.24, 1, 0.4, 1)"
            ],
            [
              "--ease-exit",
              "cubic-bezier(0.3, 0, 0.6, 0.6)"
            ]
          ]
        }
      ],
      "previewType": "easing-curve"
    }
  ]
};
