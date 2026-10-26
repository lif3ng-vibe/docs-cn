# 💸 GET 每日花费与用量指标

本页原先介绍的 `GET /daily_metrics` 端点已从代理（proxy）中移除。每日花费与用量数据现在由 `GET /user/daily/activity` 提供，返回按天统计的花费、Token 数与请求数，并支持按模型、模型组、提供商、端点、API 密钥和 MCP（Model Context Protocol）服务器拆分明细。完整的响应结构请见[每日花费明细 API](./cost_tracking#每日花费明细-api)一节，全部参数请查阅 [Swagger 参考文档](https://docs.litellm.ai/api-reference/#/Budget%20%26%20Spend%20Tracking/get_user_daily_activity_user_daily_activity_get)。

## 请求格式
```shell
curl -X GET "http://0.0.0.0:4000/user/daily/activity?start_date=2025-03-20&end_date=2025-03-27" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

可选查询参数：`model`、`api_key` 与 `user_id` 用于过滤结果（非管理员调用方必须传入自己的 `user_id`）；`page` 与 `page_size`（默认 50，最大 1000）用于分页；`timezone`（相对 UTC 的分钟偏移量）配合 `include_current_utc_day` 控制按天分桶的对齐方式。

## 响应格式
```json
{
    "results": [
        {
            "date": "2025-03-27",
            "metrics": {
                "spend": 0.0177072,
                "prompt_tokens": 111,
                "completion_tokens": 1711,
                "total_tokens": 1822,
                "api_requests": 11,
                "successful_requests": 11,
                "failed_requests": 0
            },
            "breakdown": {
                "models": {"{{openai_small}}": {"metrics": {"spend": 1.82e-05, "...": "..."}, "metadata": {}}},
                "providers": {"openai": {"metrics": {"...": "..."}, "metadata": {}}},
                "api_keys": {"3126b6eaf1...": {"metrics": {"...": "..."}, "metadata": {"key_alias": "my-key", "team_id": null}}}
            }
        }
    ],
    "metadata": {
        "total_spend": 0.7274667,
        "total_prompt_tokens": 280990,
        "total_completion_tokens": 376674,
        "total_tokens": 657664,
        "total_api_requests": 14,
        "total_successful_requests": 14,
        "total_failed_requests": 0
    }
}
```

如需查看单个请求的日志，请使用 [`GET /spend/logs`](./cost_tracking#-花费日志-api单笔交易日志)。
