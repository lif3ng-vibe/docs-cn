# 自定义模型成本表

LiteLLM 对每个请求的计价都来自模型成本表（model cost map），一份 JSON 文件，记录每个模型的每 Token 费率、上下文上限与能力。默认情况下，代理会在启动时从 GitHub 拉取最新成本表，因此新模型的定价无需升级 LiteLLM 即可到位。如果你的部署遇到价格错误或缺失（区域价格变体、协商费率，或默认成本表尚未收录的全新档位），有两种修正方式：在配置中针对特定部署覆盖定价，或者用自己托管的副本整体替换成本表。

如果只是有限范围的修正，优先选择按部署覆盖（per-deployment override）。它只改动你点名的部署，不受上游成本表任何更新影响，不需要托管文件，也没有回退失败模式。只有当修正范围大到按部署配置难以维护时，才使用完整的自定义成本表。

## 方式一：按部署覆盖定价（推荐）

成本表中的任何定价键都可以直接设置在部署的 `litellm_params` 里，包括形如 `input_cost_per_token_above_{N}k_tokens` 的分层长上下文键。当输入 Token 数越过阈值时，LiteLLM 会按该档位费率为整个请求计费。

示例：一个按区域价格变体（例如 US Data Zone）计费的 Azure 部署，其长上下文档位在默认成本表中缺失：

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/<your-deployment-name>
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
      input_cost_per_token: 0.0000022        # base rate for your price variant
      output_cost_per_token: 0.0000132
      input_cost_per_token_above_272k_tokens: 0.0000044   # long-context tier
      output_cost_per_token_above_272k_tokens: 0.0000198
      cache_read_input_token_cost: 0.00000022
      cache_read_input_token_cost_above_272k_tokens: 0.00000044
```

可覆盖键的完整集合包括基础每 Token 费率、按秒计费费率、缓存读取与缓存创建费率，以及各自对应的 `above_128k`、`above_200k`、`above_272k` 档位变体，另有 `_priority` 服务档位变体。上文数字仅作示意；实际费率请以提供商的价目表为准。通用覆盖机制见 [自定义 LLM 定价](./custom_pricing)。

分层定价生效不需要改任何代码；成本引擎会读取最终定价里携带的档位键。

### 部分覆盖不会回退到默认定价

只要设置了任何一个自定义定价字段，该部署就会与默认成本表条目脱钩：LiteLLM 会为它单独构建一条定价条目，并且只按这条条目计费。如果你覆盖了 `input_cost_per_token` 却没有设置 `input_cost_per_token_above_272k_tokens`，该部署就完全没有档位边界，超过 272k Token 的请求也会按你的自定义基础费率计费。未设置的档位键不会继承默认成本表的档位价格，LiteLLM 也绝不会把你的基础费率与默认档位溢价混用。

唯一有意设计的例外是缓存定价。当你覆盖基础输入费率时，缺失的缓存字段（`cache_read_input_token_cost`、`cache_creation_input_token_cost` 及其 `above_1hr` 与 `above_200k` 变体）会从后端模型的默认条目继承，避免缓存读取被悄无声息地按零计费。注意这些继承值是默认价格，而不是你的价格变体的价格，因此区域价目表或协商价目表也应一并覆盖缓存键。

把覆盖块当作该部署完整的价目卡来填：基础输入与输出费率、长上下文档位键，以及缓存键。部分覆盖恰恰会在最昂贵的请求上悄悄少计费。

## 方式二：托管你自己的成本表

用以下方式让代理指向你自己的成本表副本：

```bash
export LITELLM_MODEL_COST_MAP_URL="https://your-host.example.com/model_prices.json"
```

成本表在启动时只拉取一次，超时时间为 5 秒，因此该变量必须在代理启动前设置好，且修改后需要重启。URL 必须是 HTTP(S)；不支持 `file://` 路径。如果要完全离线运行，可以设置 `LITELLM_LOCAL_MODEL_COST_MAP=True`，它会跳过拉取，改用随包附带的备份成本表（`litellm/model_prices_and_context_window_backup.json`），你可以在自己的镜像中覆盖这个文件。

### 从完整的上游文件起步

自定义成本表始终应以完整的 [model_prices_and_context_window.json](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json) 为底本 fork 出来，再把你的修正编辑进去。只包含自己模型的小文件会被拒绝：拉取到的成本表必须至少含 50 个模型条目，且条目数至少达到随包备份的一半，否则 LiteLLM 会将其丢弃。这两个阈值都可以通过 `MODEL_COST_MAP_MIN_MODEL_COUNT` 和 `MODEL_COST_MAP_MAX_SHRINK_RATIO` 调整，前提是你愿意承担损坏的成本表通过校验的风险。

### 回退语义：务必监控

如果拉取失败、超时，或文件未通过校验，代理不会崩溃。它只会记录一条警告，然后静默回退到随包备份成本表，这意味着请求会按备份表自带的任意价格计费。对生产部署而言，这正是需要盯住的失败模式：Pod 启动时一次瞬时的网络错误，就会悄悄让你所有的定价修正失效。

用管理端点核实实际加载的是哪份成本表：

```bash
curl -s http://localhost:4000/model/cost_map/source \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

响应会报告 `source`（"remote" 或 "local"）、尝试过的 `url`、人类可读的 `fallback_reason`（成功时为 null）以及 `model_count`。当 `source` 不是 `remote`，或 `fallback_reason` 非 null 时触发告警。

### 生产环境清单

1. 把文件作为带版本的工件托管在你掌控的基础设施上（CDN 背后的对象存储或内部端点），确保每个代理 Pod 都能在 5 秒内访问到。
2. 对 `/model/cost_map/source` 报告回退的情况配置告警。
3. 与上游成本表保持定期重新同步，避免新发布模型的定价停留在 fork 时点。
4. 尽量把自定义成本表当作临时方案：把你的修正贡献到默认成本表上游，然后弃用 fork。

## 如何选择

自定义成本表会替换整座定价数据库：每一条条目都由你负责，在重新同步之前不再收到上游定价更新，而且它的失败模式（静默回退）会在不触发健康检查失败的情况下悄悄撤销你的修正。按部署覆盖没有这些风险，但维护成本会随需要修正的部署数量线性增长。少数几个部署就在配置里修；一整批部署就用 fork 的成本表加监控；无论哪种，都请把修正贡献回上游，让这套变通办法早日退役。
