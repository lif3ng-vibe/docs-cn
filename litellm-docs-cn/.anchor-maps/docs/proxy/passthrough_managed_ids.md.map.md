Passthrough Managed IDs | 透传托管 ID | 透传托管-id
How to enable | 如何启用 | 如何启用
Native managed endpoints vs passthrough | 原生托管端点与透传对比 | 原生托管端点与透传对比
Supported endpoints | 支持的端点 | 支持的端点
Response ID minting (OUTPUT) | 响应 ID 生成（OUTPUT） | 响应-id-生成output
Managed ID resolution (INPUT) | 托管 ID 解析（INPUT） | 托管-id-解析input
Request flow - any endpoint | 任意端点的请求流程 | 任意端点的请求流程
Permission checks | 权限校验 | 权限校验
1. Provider match | 1. 提供商匹配 | 1-提供商匹配
2. DB existence | 2. 数据库存在性校验 | 2-数据库存在性校验
3. Access check - per-request | 3. 单次请求的访问校验 | 3-单次请求的访问校验
4. Access check - list endpoints | 4. 列表端点的访问校验 | 4-列表端点的访问校验
How list endpoints work | 列表端点的工作方式 | 列表端点的工作方式
Objects the proxy never saw | 代理未曾记录的对象 | 代理未曾记录的对象
Limitations | 局限 | 局限
Streaming is only rewritten for responses | 流式改写仅覆盖 responses | 流式改写仅覆盖-responses
Raw IDs only work for their owner | 原始 ID 仅对其所有者有效 | 原始-id-仅对其所有者有效
IDs are provider-scoped | ID 与提供商绑定 | id-与提供商绑定
