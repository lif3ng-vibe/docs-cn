# tag_routing.md 锚点映射

Tag Based Routing | 基于标签的路由 | 基于标签的路由
Quick Start | 快速上手 | 快速上手
1. Define tags on config.yaml | 1. 在 config.yaml 中定义标签 | 1-在-configyaml-中定义标签
2. Make Request with `tags=["free"]` | 2. 使用 `tags=["free"]` 发起请求 | 2-使用-tagsfree-发起请求
3. Make Request with `tags=["paid"]` | 3. 使用 `tags=["paid"]` 发起请求 | 3-使用-tagspaid-发起请求
Calling via Request Header | 通过请求头调用 | 通过请求头调用
Setting Default Tags | 设置默认标签 | 设置默认标签
1. Set default tag on yaml | 1. 在 yaml 中设置默认标签 | 1-在-yaml-中设置默认标签
2. Start proxy | 2. 启动代理 | 2-启动代理
3. Make request with no tags | 3. 发起不带标签的请求 | 3-发起不带标签的请求
Negation Tags (Denylist) | 否定标签（黑名单） | 否定标签黑名单
Quick example | 快速示例 | 快速示例
Config example | 配置示例 | 配置示例
Combining positive and negation tags | 正向标签与否定标签组合使用 | 正向标签与否定标签组合使用
Excluding multiple providers | 排除多个提供商 | 排除多个提供商
Negation with fallback chains | 否定标签配合回退链 | 否定标签配合回退链
Negation semantics | 否定标签语义 | 否定标签语义
Required Tags (AND) | 必需标签（AND） | 必需标签and
Quick example | 快速示例 | 快速示例
Config example | 配置示例 | 配置示例
Combining required, negation, and plain tags | 必需标签、否定标签与普通标签组合使用 | 必需标签否定标签与普通标签组合使用
Required-AND semantics | 必需标签（AND）语义 | 必需标签and语义
Fail-Open Fallback (`allow_fail_open`) | 失败放行回退（`allow_fail_open`） | 失败放行回退allow_fail_open
Config example | 配置示例 | 配置示例
Without `allow_fail_open` | 未设置 `allow_fail_open` 时 | 未设置-allow_fail_open-时
With `allow_fail_open` | 设置 `allow_fail_open` 后 | 设置-allow_fail_open-后
allow_fail_open semantics | allow_fail_open 语义 | allow_fail_open-语义
Explicit Routing Directives (`tag_routing_prefix`) | 显式路由指令（`tag_routing_prefix`） | 显式路由指令tag_routing_prefix
Quick example | 快速示例 | 快速示例
Config example | 配置示例 | 配置示例
Prefixed tags and the unknown-tag fail-open guard | 带前缀标签与未知标签放行守卫 | 带前缀标签与未知标签放行守卫
tag_routing_prefix semantics | tag_routing_prefix 语义 | tag_routing_prefix-语义
Per-Model-Group Tag Filtering (`enable_tag_filtering`) | 按模型组的标签过滤（`enable_tag_filtering`） | 按模型组的标签过滤enable_tag_filtering
Quick example | 快速示例 | 快速示例
Config example | 配置示例 | 配置示例
enable_tag_filtering semantics | enable_tag_filtering 语义 | enable_tag_filtering-语义
Regex-based tag routing (`tag_regex`) | 基于正则的标签路由（`tag_regex`） | 基于正则的标签路由tag_regex
1. Config | 1. 配置 | 1-配置
2. Verify routing | 2. 验证路由 | 2-验证路由
Matching semantics | 匹配语义 | 匹配语义
Interaction with negation tags | 与否定标签的交互 | 与否定标签的交互
Observability | 可观测性 | 可观测性
Team based tag routing (Enterprise) | 基于团队的标签路由（企业版） | 基于团队的标签路由企业版
Configuration | 配置 | 配置
Create teams with tags | 创建带标签的团队 | 创建带标签的团队
Generate keys for team members | 为团队成员生成密钥 | 为团队成员生成密钥
Verify routing | 验证路由 | 验证路由
