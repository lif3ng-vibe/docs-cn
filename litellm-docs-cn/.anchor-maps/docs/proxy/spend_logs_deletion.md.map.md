Maximum Retention Period for Spend Logs | 花费日志的最长保留期 | 花费日志的最长保留期
Requirements | 前提条件 | 前提条件
Usage | 用法 | 用法
Setup | 配置 | 配置
When the job runs | 清理任务的运行时机 | 清理任务的运行时机
What gets deleted | 会删除哪些数据 | 会删除哪些数据
Configuration Options | 配置选项 | 配置选项
`maximum_spend_logs_retention_period` (required) | `maximum_spend_logs_retention_period`（必填） | maximum_spend_logs_retention_period必填
`maximum_spend_logs_retention_interval` (optional) | `maximum_spend_logs_retention_interval`（可选） | maximum_spend_logs_retention_interval可选
`maximum_spend_logs_cleanup_cron` (optional) | `maximum_spend_logs_cleanup_cron`（可选） | maximum_spend_logs_cleanup_cron可选
`maximum_spend_logs_cleanup_batch_size` (optional) | `maximum_spend_logs_cleanup_batch_size`（可选） | maximum_spend_logs_cleanup_batch_size可选
`maximum_spend_logs_cleanup_max_batches` (optional) | `maximum_spend_logs_cleanup_max_batches`（可选） | maximum_spend_logs_cleanup_max_batches可选
`maximum_spend_logs_cleanup_run_budget` (optional) | `maximum_spend_logs_cleanup_run_budget`（可选） | maximum_spend_logs_cleanup_run_budget可选
`maximum_spend_logs_cleanup_batch_timeout` (optional) | `maximum_spend_logs_cleanup_batch_timeout`（可选） | maximum_spend_logs_cleanup_batch_timeout可选
How it works | 工作原理 | 工作原理
Step 1. Lock Acquisition (Optional with Redis) | 第 1 步：锁获取（使用 Redis 时可选） | 第-1-步锁获取使用-redis-时可选
Step 2. Batch Deletion | 第 2 步：批量删除 | 第-2-步批量删除
Step 3. Bounds | 第 3 步：边界控制 | 第-3-步边界控制
Metrics | 指标 | 指标
Large tables | 大表场景 | 大表场景
Indexing | 索引 | 索引
Sizing the knobs | 参数取值权衡 | 参数取值权衡
Draining a large backlog | 清空大量积压 | 清空大量积压
Partitioning for high-volume deployments | 高流量部署的分区方案 | 高流量部署的分区方案
Converting the table | 转换数据表 | 转换数据表
Tuning | 调优 | 调优
