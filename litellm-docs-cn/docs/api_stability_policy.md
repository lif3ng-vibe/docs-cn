# API 稳定性策略

本页界定 LiteLLM 代理（Proxy）的 HTTP API 中哪些部分属于我们要尽力维持的公开契约，哪些部分是私有的、可能随时变更。

## OpenAPI 规范即公开 API

凡出现在代理 OpenAPI 规范中的端点（endpoint）都是公开的。规范默认在 `/openapi.json` 提供，并在 `/` 以 Swagger UI 呈现（可通过 `DOCS_URL` 配置，参见 [UI 设置](./proxy/ui.md)）。对于公开端点，我们致力于维持其行为契约：路径与 HTTP 方法、请求与响应结构、认证要求以及默认行为。

纯新增的变更不属于破坏性变更（breaking change），可在任意版本中发布：新增端点、新增可选请求字段、新增响应字段均属此类，客户端应忽略自己不认识的响应字段。反之，凡是删除或重命名字段、修改默认值、收紧端点的调用权限，或其他需要采取行动才能维持既有行为的变更，都算破坏性变更。破坏性变更会在发布该版本的[发布说明](https://docs.litellm.ai/release_notes)顶部的 `Breaking Changes` 专门小节中标出，并遵循[发布周期](./proxy/release_cycle.md)的版本号规则。

## 其余皆为私有

不在 OpenAPI 规范中的端点都是私有的。这些路由服务于 LiteLLM 管理界面（Admin UI）或代理的内部需求。在代码库中，它们通过路由定义上的 `include_in_schema=False` 从规范中隐藏，`/login`、`/v2/login`、`/fallback/login` 就是例子。私有端点可以在任何版本中更改请求或响应结构、改变行为，甚至直接移除，且不另行通知，也不受上述破坏性变更流程的约束。

请不要基于私有端点构建集成。如果你需要的功能目前只有某个私有端点才能提供，请提交一个 [GitHub issue](https://github.com/BerriAI/litellm/issues) 并描述使用场景，以便该功能日后通过受支持的公开端点提供。

## 查看你所用版本中的公开内容

规范由运行中的代理生成，因此它精确反映你实际部署的版本。列出公开路径的方法如下：

```bash
curl -s http://localhost:4000/openapi.json | jq '.paths | keys'
```

设置 `NO_DOCS` 或 `NO_OPENAPI`（参见[环境变量](./proxy/config_settings.md#环境变量参考)）会让代理停止提供 Swagger UI 和 `/openapi.json`，但不会改变哪些端点是公开的。想查看公开接口面，请从未设置这些标志的代理获取规范，或在本地运行同一版本来获取。

## 相关页面

- [发布周期](./proxy/release_cycle.md)：版本号如何编排，主版本、次版本与补丁版本升级分别意味着什么。
- [迁移策略](./migration_policy.md)：测试版（beta）功能进入企业版（Enterprise）时会发生什么。
