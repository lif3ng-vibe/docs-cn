# Reload Price Data 后模型缺失

刚加入 LiteLLM 定价映射的模型，没有出现在管理界面（Admin UI）的模型选择器里；或者成本追踪（cost tracking）记下了 `This model isn't mapped yet`，并为它记了 `$0` 花费，而 **Reload Price Data** 却报告了成功和模型数量。在这类反馈中，绝大多数情况是代理完全照指令行事：它抓取了自己被指向的文件，而那份文件里当时还没有这个条目。在追问部署环境的任何细节之前，先回答第 1 步里的两个问题；只需一分钟，大多数反馈就能当场定位。

## 第 1 步：条目何时进入 `main`？代理读的是哪份映射？

代理从 `https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json` 读取定价：启动时一次，每次 Reload Price Data 一次，可选的定时重载（reload schedule）触发时也会读取。定价 PR 不一定直接合入 `main`。开发在 `litellm_internal_staging` 分支上进行，`main` 分批接收这些改动，所以一个条目可能已经合并、按 day-0 定价对外宣布，却还要一天甚至更久才会进入代理实际抓取的那份文件。一次返回模型数量的成功重载只能证明抓取动作成功了，仅此而已。

先确认条目此刻是否已经在 `main` 上。模型是用哪些键加进去的，就把每个键都测一遍，因为提供商（provider）通常会有自己带前缀的独立条目：

```bash
curl -s https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json \
  | jq '[has("{{gemini_flash}}"), has("gemini/{{gemini_flash}}")]'
```

再看它是什么时候上去的，以及上游何时合并：

```bash
git fetch origin main litellm_internal_staging
git log -S '"{{gemini_flash}}"' --first-parent --format='%h %ci %s' origin/main -- model_prices_and_context_window.json
git log -S '"{{gemini_flash}}"' --first-parent --format='%h %ci %s' origin/litellm_internal_staging -- model_prices_and_context_window.json
```

`origin/main` 没有输出，说明条目还没进去，部署侧重载、重启、改配置都无济于事。如果有输出，第一行就是把它带上 `main` 的那次合并，这个时间戳是重载最早可能拿到它的时刻，还要加上 raw.githubusercontent.com 返回缓存副本的最多五分钟。`main` 行与 staging 行之间的时间差，就是客户实际经历的延迟。

接下来问代理自己读的是什么：

```bash
curl -s http://localhost:4000/model/cost_map/source \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
curl -s http://localhost:4000/schedule/model_cost_map_reload/status \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
curl -s -X POST http://localhost:4000/reload/model_cost_map \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

`GET /model/cost_map/source` 会报告 `url`，也就是代理抓取的文件（只要不是 `main` 的 URL，就说明设置了 `LITELLM_MODEL_COST_MAP_URL`，此时 `main` 已无关紧要）；`source`，取值 `remote` 或 `local`；`is_env_forced`，在 `LITELLM_LOCAL_MODEL_COST_MAP=True` 把代理钉在随版本打包的定价上时出现；`fallback_reason`，在抓取失败、回退到打包副本时出现；以及 `model_count`，即当前在用的映射条目数。

`GET /schedule/model_cost_map_reload/status` 报告是否存在定时重载，以及 `last_run` 和 `next_run`。如果 `scheduled: false` 且启动后没有手动重载过，映射就是启动时抓到的那份。

`POST /reload/model_cost_map` 返回 `models_count`，即刚抓取的文件里的条目数（可能大于文件的原始键数，因为代理会补上派生的别名条目）。每次定价合并它都会变化，因此可以作为代理所加载 `main` 版本的指纹：`main` 合并之后做的一次重载若数量纹丝不动，说明代理没有看到合并后的 `main`。返回 `502` 表示抓取失败、沿用了旧映射，所以只要成功响应带回了数量，就证明抓取确实走通了。

同时记下版本号，即 `GET /health/readiness/details` 返回的 `litellm_version`，因为打包定价在构建时就已冻结，老版本可能缺少其中某些端点。

| 现象 | 含义 |
|------|------|
| 条目不在 `main` 上 | 部署侧无可排查。先用第 3 步的临时办法，等合并落地 |
| 合入 `main` 的时间晚于上次重载 | 重载跑早了。再重载一次就能拿到 |
| `url` 不是 `main` 的 URL | 部署覆盖了映射来源。查那个文件，别盯着 `main` |
| `source` 为 `local` | 代理回退到了打包副本。`fallback_reason` 会说明原因 |
| 已在 `main`、来源为 `remote`、仍然缺失 | 继续第 2 步 |

## 第 2 步：`main` 已有条目，代理读的也是 `main`，但仍然缺失

做任何其他操作之前，先再重载一次：raw.githubusercontent.com 会缓存这份文件约五分钟，合并后五分钟内重载拿到的仍是旧文件。

然后确认各副本的视图是否一致。手动重载只在处理该请求的 pod 里执行；较新的版本会通过数据库发布这次重载，其他副本在下次轮询时同步，而老版本只重载被请求命中的那个 pod，管理界面可能恰好由一个从未重载过的 pod 提供服务。通过负载均衡多调几次 `GET /model/cost_map/source`：如果 `model_count` 在几个数值之间来回切换，说明各副本持有不同的映射，做一次滚动重启就能让它们回到同一份文件上。

如果每个副本的数量都一致、条目也确实在 `main` 上，那多半是请求没有解析到新增的那个键。对照第 1 步测过的键，核对部署实际使用的模型名和提供商前缀；报错信息 `This model isn't mapped yet. model=<name>, custom_llm_provider=<provider>` 会把两者都写出来。

## 第 3 步：`main` 合入前的临时解决办法

把代理指向已经有该条目的分支并重启，因为 URL 只在启动时读取。这会用那个分支的副本整体替换定价映射，等 `main` 追上来之后记得撤掉这个覆盖：

```bash
export LITELLM_MODEL_COST_MAP_URL=https://raw.githubusercontent.com/BerriAI/litellm/litellm_internal_staging/model_prices_and_context_window.json
```

或者用 `model_info` 里的[自定义定价](../proxy/custom_pricing)为该部署单独定价。在当前版本上，部署级定价不会被后续重载冲掉，所以在合并落地之前就需要正确计费时，这是更稳妥的选择。

## 致维护者

回复时先给出第 1 步查到的 `main` 合并时间戳，而不是 PR 的合并日期。对这份文件来说，已合并和可抓取是两个不同的时间点，而被告知定价 day-0 上线的客户，看的正是代理在读的那份文件。把客户提供的重载数量和你这边对 `main` 重新重载得到的数量并列引用：两个不同的数量就是两份不同的文件，足以回答"是不是我的部署有问题"，关于客户配置的一个问题都不用问。

这份文件目前不带时间戳或版本号，条目数是判断代理加载的是哪个 `main` 的唯一指纹。在映射能自报版本之前，第 1 步的那两条命令就是判据。

## 排查清单

1. 条目此刻在不在 `main` 上？在哪些键名下？
2. 它何时合入 `main`？何时合入 staging？
3. `GET /model/cost_map/source` 报告的 `url`、`source`、`fallback_reason` 和 `model_count` 各是什么？
4. 相对 `main` 合并时间，上次重载（`GET /schedule/model_cost_map_reload/status`，或客户的手动重载）是什么时候跑的？
5. 重新重载得到的 `models_count` 与客户报的数量是否一致？
6. 代理跑的是哪个版本？
7. 在 `main` 追上来之前，客户是否需要 staging URL 或部署级定价？

## 另请参阅

- [从 GitHub 同步模型定价](../proxy/sync_models_github)
- [自定义模型成本映射](../proxy/custom_model_cost_map)
- [按部署自定义定价](../proxy/custom_pricing)
- [排查成本偏差](./cost_discrepancy)
