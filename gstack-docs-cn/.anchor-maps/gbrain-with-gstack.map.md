## The one-command install | ## 一条命令安装 | 一条命令安装
## What you get after setup | ## 配置完成后你会得到什么 | 配置完成后你会得到什么
## The four paths | ## 四条路径 | 四条路径
### Path 1: Supabase, you already have a connection string | ### 路径 1：Supabase，已有连接串 | 路径-1supabase已有连接串
### Path 2a: Supabase, auto-provision a new project | ### 路径 2a：Supabase，自动开通新项目 | 路径-2asupabase自动开通新项目
### Path 2b: Supabase, create manually | ### 路径 2b：Supabase，手动创建 | 路径-2bsupabase手动创建
### Path 3: PGLite local | ### 路径 3：PGLite 本地 | 路径-3pglite-本地
### Path 4: Remote gbrain MCP (split-engine) | ### 路径 4：远程 gbrain MCP（双引擎拆分） | 路径-4远程-gbrain-mcp双引擎拆分
## MCP registration for Claude Code | ## 为 Claude Code 注册 MCP | 为-claude-code-注册-mcp
## Per-remote trust policy (the triad) | ## 按远端的信任策略（三元组） | 按远端的信任策略三元组
## Keeping the brain current with `/sync-gbrain` | ## 用 `/sync-gbrain` 保持 brain 时新 | 用-sync-gbrain-保持-brain-时新
## Switching engines later | ## 之后切换引擎 | 之后切换引擎
## GStack memory sync (a separate concern) | ## GStack 记忆同步（另一回事） | gstack-记忆同步另一回事
## Cleanup orphan projects | ## 清理孤儿项目 | 清理孤儿项目
## Command + flag reference | ## 命令与 flag 参考 | 命令与-flag-参考
### `/setup-gbrain` entry modes | ### `/setup-gbrain` 进入模式 | setup-gbrain-进入模式
### Bin helpers (for scripting) | ### bin 辅助脚本（用于脚本化） | bin-辅助脚本用于脚本化
### gbrain CLI (upstream tool) | ### gbrain CLI（上游工具） | gbrain-cli上游工具
### Config files + state | ### 配置文件与状态 | 配置文件与状态
### Environment variables | ### 环境变量 | 环境变量
## Conductor + GSTACK_* env vars | ## Conductor 与 GSTACK_* 环境变量 | conductor-与-gstack_-环境变量
## Security model | ## 安全模型 | 安全模型
## Troubleshooting | ## 排障 | 排障
### "PATH SHADOWING DETECTED" during install | ### 安装时报 "PATH SHADOWING DETECTED" | 安装时报-path-shadowing-detected
### "rejected direct-connection URL" | ### "rejected direct-connection URL" | rejected-direct-connection-url
### Auto-provision times out at 180s | ### 自动开通在 180 秒超时 | 自动开通在-180-秒超时
### "Another `/setup-gbrain` instance is running" | ### "Another `/setup-gbrain` instance is running" | another-setup-gbrain-instance-is-running
### "No cross-model tension" on policy file | ### 策略文件上的 "No cross-model tension" | 策略文件上的-no-cross-model-tension
### `gbrain doctor` says "warnings" | ### `gbrain doctor` 报 "warnings" | gbrain-doctor-报-warnings
### `/sync-gbrain` reports `OK` but `gbrain search` returns nothing semantic | ### `/sync-gbrain` 报 `OK` 但 `gbrain search` 搜不出语义结果 | sync-gbrain-报-ok-但-gbrain-search-搜不出语义结果
### `gbrain sync` blocked at a commit hash — `FILE_TOO_LARGE` | ### `gbrain sync` 卡在某个 commit hash —— `FILE_TOO_LARGE` | gbrain-sync-卡在某个-commit-hash--file_too_large
### ZeroEntropy embeddings stop working after September 4, 2026 | ### ZeroEntropy 嵌入在 2026 年 9 月 4 日后停止工作 | zeroentropy-嵌入在-2026-年-9-月-4-日后停止工作
### Switching PGLite → Supabase hangs | ### PGLite → Supabase 切换卡住 | pglite--supabase-切换卡住
## Why this design | ## 为什么这样设计 | 为什么这样设计
## Related skills + next steps | ## 相关技能与下一步 | 相关技能与下一步
