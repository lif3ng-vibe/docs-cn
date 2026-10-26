# 凭证用量统计

当某个模型关联了[可复用凭证（reusable credential）](./model_management.md#可复用的提供商凭据)后，LiteLLM 会自动把凭证名称作为标签注入每个使用该模型的请求。也就是说，无需任何额外配置，凭证维度的花费与用量就能自动纳入统计。

## 工作原理

通过 `litellm_credential_name` 把模型关联到某个可复用凭证后，每条经该模型路由的请求都会被打上 `Credential: <name>` 标签（例如 `Credential: xAI`）。该标签会汇入 `DailyTagSpend`，并出现在 Usage 页面的 **Tag** 视图中，你可以在那里按凭证筛选花费与用量。

如果模型没有关联任何凭证，行为保持不变，也不会添加凭证标签。

## 查看凭证用量

在管理界面（Admin UI）中，进入 **Usage → Tag**，查找带有 `Credential: ` 前缀的标签。这些标签汇总了使用该凭证的所有请求的花费与 Token 用量。

## 相关文档

- [添加 LLM 凭证](./model_management.md#可复用的提供商凭据) - 如何创建可复用凭证并将其关联到模型
- [标签预算](./tag_budgets.md) - 为标签设置花费上限
- [标签路由](./tag_routing.md) - 基于标签路由请求
