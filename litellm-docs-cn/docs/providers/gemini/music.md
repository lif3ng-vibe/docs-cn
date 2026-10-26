# Gemini Lyria（音乐生成）

Google Lyria 3 preview 模型已收录在 LiteLLM 的[模型成本映射表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)中，登记在 `gemini/` 提供商名下，用于提供元数据并支持花费追踪（spend tracking）。

| 属性 | 说明 |
|----------|---------|
| 提供商路由 | `gemini/` |
| 模型 | `gemini/lyria-3-clip-preview`、`gemini/lyria-3-pro-preview` |
| 提供商文档 | [Gemini API 定价与模型 ↗](https://ai.google.dev/gemini-api/docs/pricing) |

## 模型

| 模型 | 说明 |
|-------|--------|
| `gemini/lyria-3-clip-preview` | 约 30 秒的短片段；付费层级按 Google 定价中每首生成的歌曲计费 |
| `gemini/lyria-3-pro-preview` | 完整歌曲；付费层级按 Google 定价中每首生成的歌曲计费 |

成本映射表中的输入上下文上限为 **131,072** 个 token。模态、限制与功能详情，请参考 [Google 的 Gemini API 文档 ↗](https://ai.google.dev/gemini-api/docs/models)。

## LiteLLM 行为

- **成本映射表**：按首计费的付费价格保存在这些条目的 `output_cost_per_image` 字段中（每次生成按固定单价计）。在专用计费路径出现之前，基于 token 的对话补全成本可能无法反映音乐生成的真实账单。
- **API 调用**：按 Google 官方文档使用 Gemini API 即可。LiteLLM 并未像 Veo 的 `video_generation` 那样提供独立的 `music_generation` 辅助方法。

## 鉴权

与其他 Gemini API 模型一致：使用 `GEMINI_API_KEY` 或 `GOOGLE_API_KEY`。
