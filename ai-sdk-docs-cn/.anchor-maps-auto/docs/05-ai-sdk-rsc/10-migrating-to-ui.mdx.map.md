Migrating from RSC to UI | 从 RSC 迁移到 UI | 从-rsc-迁移到-ui
Migrating from RSC to UI | Migrating from RSC to UI | migrating-from-rsc-to-ui
Background | 背景 | 背景
Streaming Chat Completions | 流式传输聊天补全 | 流式传输聊天补全
Basic Setup | 基本设置 | 基本设置
Before: Handle generation and rendering in a single server action | 迁移前：在单个 Server Action 中处理生成与渲染 | 迁移前在单个-server-action-中处理生成与渲染
Before: Call server action and update UI state | 迁移前：调用 Server Action 并更新 UI 状态 | 迁移前调用-server-action-并更新-ui-状态
After: Replace server action with route handler | 迁移后：用 Route Handler 替换 Server Action | 迁移后用-route-handler-替换-server-action
After: Update client to use chat hook | 迁移后：更新客户端以使用 chat Hook | 迁移后更新客户端以使用-chat-hook
Parallel Tool Calls | 并行工具调用 | 并行工具调用
Multi-Step Tool Calls | 多步工具调用 | 多步工具调用
Generative User Interfaces | 生成式用户界面 | 生成式用户界面
Before: Render components within the server action and stream to client | 迁移前：在 Server Action 内渲染组件并流式传输到客户端 | 迁移前在-server-action-内渲染组件并流式传输到客户端
After: Replace with route handler and stream props data to client | 迁移后：替换为 Route Handler 并将 props 数据流式传输到客户端 | 迁移后替换为-route-handler-并将-props-数据流式传输到客户端
After: Update client to use chat hook and render components using tool invocations | 迁移后：更新客户端以使用 chat Hook 并通过工具调用渲染组件 | 迁移后更新客户端以使用-chat-hook-并通过工具调用渲染组件
Handling Client Interactions | 处理客户端交互 | 处理客户端交互
Before: Use actions hook to send messages | 迁移前：使用 actions Hook 发送消息 | 迁移前使用-actions-hook-发送消息
After: Use another chat hook with same ID from the component | 迁移后：在组件中使用相同 ID 的另一个 chat Hook | 迁移后在组件中使用相同-id-的另一个-chat-hook
Loading Indicators | 加载指示器 | 加载指示器
Before: Use `loading` to show loading indicator | 迁移前：使用 `loading` 显示加载指示器 | 迁移前使用-loading-显示加载指示器
After: Use tool invocation state to show loading indicator | 迁移后：使用工具调用状态显示加载指示器 | 迁移后使用工具调用状态显示加载指示器
Saving Chats | 保存聊天 | 保存聊天
Before: Save chats using callback function of context provider | 迁移前：使用上下文提供程序的回调函数保存聊天 | 迁移前使用上下文提供程序的回调函数保存聊天
After: Save chats using callback function of `streamText` | 迁移后：使用 `streamText` 的回调函数保存聊天 | 迁移后使用-streamtext-的回调函数保存聊天
Restoring Chats | 恢复聊天 | 恢复聊天
Before: Load chat from database using callback function of context provider | 迁移前：使用上下文提供程序的回调函数从数据库加载聊天 | 迁移前使用上下文提供程序的回调函数从数据库加载聊天
After: Load chat from database during static generation of page | 迁移后：在页面静态生成期间从数据库加载聊天 | 迁移后在页面静态生成期间从数据库加载聊天
After: Pass chat messages as props and load into chat hook | 迁移后：将聊天消息作为 props 传入并加载到 chat Hook | 迁移后将聊天消息作为-props-传入并加载到-chat-hook
Streaming Object Generation | 流式传输对象生成 | 流式传输对象生成
Before: Use streamable value to stream object generations | 迁移前：使用可流式值流式传输对象生成 | 迁移前使用可流式值流式传输对象生成
Before: Read streamable value and update object | 迁移前：读取可流式值并更新对象 | 迁移前读取可流式值并更新对象
After: Replace with route handler and stream text response | 迁移后：替换为 Route Handler 并流式传输文本响应 | 迁移后替换为-route-handler-并流式传输文本响应
After: Use object hook to decode stream and update object | 迁移后：使用 object Hook 解码流并更新对象 | 迁移后使用-object-hook-解码流并更新对象
