// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Source: packages/core/src/theme/tokens.stylex.ts,
//   dataTokens.stylex.ts, and syntax/tokens.ts
// Run: node scripts/generate-token-docs.mjs

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  "type": "generic",
  "name": "tokens-duration",
  "title": "时长令牌",
  "placement": {
    "parent": "namespace:tokens",
    "slot": "guides",
    "order": 100
  },
  "category": "foundations",
  "description": "动效时长原语。分为三档：fast（微交互）、medium（入场/退场）、slow（持续动画）。min/max 变体由基准值 × 比例推导。主题的两个 `motion` 旋钮中，`tempo`（0.75–1.5）会缩放这里的所有时长；`character` 不影响时长。时长标尺在其设定的档位上优先于 `tempo`，而显式 `tokens` 优先于两者。`tempo` 不缩放以下内容：手指跟随、惯性动量、橡皮筋效果、屏幕键盘、按压的起始延迟、取消距离与点按闪烁、悬停意图延迟、手势阈值、Spinner 与 Skeleton 的循环动画，以及减弱动效（Reduce Motion）的 200 ms 上限。",
  "sections": [
    {
      "title": "时长令牌",
      "content": [
        {
          "type": "prose",
          "text": "动效时长原语。分为三档：fast（微交互）、medium（入场/退场）、slow（持续动画）。min/max 变体由基准值 × 比例推导。主题的两个 `motion` 旋钮中，`tempo`（0.75–1.5）会缩放这里的所有时长；`character` 不影响时长。时长标尺在其设定的档位上优先于 `tempo`，而显式 `tokens` 优先于两者。`tempo` 不缩放以下内容：手指跟随、惯性动量、橡皮筋效果、屏幕键盘、按压的起始延迟、取消距离与点按闪烁、悬停意图延迟、手势阈值、Spinner 与 Skeleton 的循环动画，以及减弱动效（Reduce Motion）的 200 ms 上限。"
        },
        {
          "type": "table",
          "headers": [
            "令牌",
            "值"
          ],
          "rows": [
            [
              "--duration-fast-min",
              "130ms"
            ],
            [
              "--duration-fast",
              "175ms"
            ],
            [
              "--duration-fast-max",
              "230ms"
            ],
            [
              "--duration-medium-min",
              "310ms"
            ],
            [
              "--duration-medium",
              "410ms"
            ],
            [
              "--duration-medium-max",
              "550ms"
            ],
            [
              "--duration-slow-min",
              "730ms"
            ],
            [
              "--duration-slow",
              "975ms"
            ],
            [
              "--duration-slow-max",
              "1300ms"
            ],
            [
              "--duration-exit",
              "var(--duration-fast)"
            ]
          ]
        }
      ],
      "previewType": "duration-bar"
    }
  ]
};
