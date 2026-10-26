Budgets, Rate Limits | 预算与速率限制 | 预算与速率限制
Set Budgets | 设置预算 | 设置预算
Global Proxy | 全局代理 | 全局代理
Team | 团队 | 团队
**Add budgets to teams** | 为团队添加预算 | 为团队添加预算
**Add budget duration to teams** | 为团队添加预算周期 | 为团队添加预算周期
Team Members | 团队成员 | 团队成员
Step 1. Create User | 第 1 步：创建用户 | 第-1-步创建用户
Step 2. Add User to an existing Team - set `max_budget_in_team` | 第 2 步：将用户加入现有团队并设置 `max_budget_in_team` | 第-2-步将用户加入现有团队并设置-max_budget_in_team
Step 3. Create a Key for Team member from Step 1 | 第 3 步：为第 1 步的团队成员创建密钥 | 第-3-步为第-1-步的团队成员创建密钥
Step 4. Make /chat/completions requests for Team member | 第 4 步：为团队成员发起 /chat/completions 请求 | 第-4-步为团队成员发起-chatcompletions-请求
Update a team member's budget | 更新团队成员的预算 | 更新团队成员的预算
Reset a team member's spend | 重置团队成员的花费 | 重置团队成员的花费
Existing spend counts against a budget added later | 已有花费会计入后补的预算 | 已有花费会计入后补的预算
Internal User | 内部用户 | 内部用户
**Add budgets to users** | 为用户添加预算 | 为用户添加预算
**Add budget duration to users** | 为用户添加预算周期 | 为用户添加预算周期
Create new keys for existing user | 为已有用户创建新密钥 | 为已有用户创建新密钥
Virtual Key | 虚拟密钥 | 虚拟密钥
**Add budgets to keys** | 为密钥添加预算 | 为密钥添加预算
**Add budget duration to keys** | 为密钥添加预算周期 | 为密钥添加预算周期
**Set multiple budget windows on a key** | 在密钥上设置多个预算窗口 | 在密钥上设置多个预算窗口
✨ Virtual Key (Model Specific) | ✨ 虚拟密钥（按模型） | 虚拟密钥按模型
How LiteLLM matches model names | LiteLLM 如何匹配模型名 | litellm-如何匹配模型名
View current usage | 查看当前用量 | 查看当前用量
Test the budget | 测试预算 | 测试预算
✨ Internal User (Model Specific) | ✨ 内部用户（按模型） | 内部用户按模型
Agents | 智能体（Agent） | 智能体agent
Customers | 客户 | 客户
Reset Budgets | 重置预算 | 重置预算
Fallback to 'free' models | 回退到"免费"模型 | 回退到免费模型
Budget reservation | 预算预留 | 预算预留
How it works | 工作原理 | 工作原理
Disable budget reservation | 关闭预算预留 | 关闭预算预留
Batch requests | 批处理请求 | 批处理请求
Hard budget enforcement (fail closed) | 硬性预算强制执行（fail closed） | 硬性预算强制执行fail-closed
Set Rate Limits | 设置速率限制 | 设置速率限制
TPM Rate Limit Type (Input/Output/Total) | TPM 速率限制类型（输入/输出/总量） | tpm-速率限制类型输入输出总量
Estimated Output Tokens (requests without `max_tokens`) | 预估输出 Token（未带 `max_tokens` 的请求） | 预估输出-token未带-max_tokens-的请求
Per-model rate limits and fallbacks | 按模型速率限制与回退 | 按模型速率限制与回退
Step 1. Create Budget | 第 1 步：创建预算 | 第-1-步创建预算
Step 2. Create `Customer` with Budget | 第 2 步：创建带预算的 `Customer` | 第-2-步创建带预算的-customer
Step 3. Pass `user_id` id in `/chat/completions` requests | 第 3 步：在 `/chat/completions` 请求中传入 `user_id` | 第-3-步在-chatcompletions-请求中传入-user_id
Set default budget for ALL internal users | 为所有内部用户设置默认预算 | 为所有内部用户设置默认预算
Multi-instance rate limiting | 多实例速率限制 | 多实例速率限制
Hard rate limit enforcement (fail closed) | 硬性速率限制强制执行（fail closed） | 硬性速率限制强制执行fail-closed
Grant Access to new model | 授予新模型的访问权限 | 授予新模型的访问权限
Create new keys for existing internal user | 为已有内部用户创建新密钥 | 为已有内部用户创建新密钥
API Specification | API 规范 | api-规范
`GenericBudgetInfo` | `GenericBudgetInfo` | genericbudgetinfo
Fields: | 字段 | 字段
Example: | 示例 | 示例
