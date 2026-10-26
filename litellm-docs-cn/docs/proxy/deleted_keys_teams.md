import Image from '@theme/IdealImage';

# 已删除密钥与团队审计日志

<Image img={require('../../img/ui_deleted_keys_table.png')} />

在这里可以查看已删除的 API 密钥与团队，以及它们被删除时的花费与预算信息，满足审计与合规需求。

## 概览

已删除密钥与团队（Deleted Keys & Teams）功能为 LiteLLM 代理中的已删除实体提供审计追踪（audit trail）。借助这一功能，你可以轻松审计哪个密钥或团队被删除，以及删除时的花费与预算。

当密钥或团队被删除时，LiteLLM 会自动记录：

- **删除时间戳**：实体被删除的时间
- **删除人**：执行删除操作的人
- **删除时花费**：删除时刻累计的总花费
- **原始预算**：删除前为该实体设置的预算
- **实体详情**：密钥或团队的标识信息

这些信息在删除之后依然保留，帮助你维持准确的财务记录与审计追踪，满足合规要求。

## 查看已删除密钥

### 第 1 步：前往 API 密钥页面

在 LiteLLM UI 中打开 API 密钥页面：

```
http://localhost:4000/ui/?login=success&page=api-keys
```

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/73b97ba9-0ab5-4140-aee2-05fa90463461/ascreenshot_5e6d9f05d452405c83d7a368349d087d_text_export.jpeg)

### 第 2 步：进入日志区块

点击导航栏中的 "Logs"（日志）菜单项。

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/73b97ba9-0ab5-4140-aee2-05fa90463461/ascreenshot_8ebab354b1e542e59e1082e519927edd_text_export.jpeg)

### 第 3 步：查看已删除密钥

点击 "Deleted Keys"（已删除密钥），查看所有已删除 API 密钥的表格。

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/00668558-9326-4a6f-8e87-159d54b17a72/ascreenshot_d0e50e49e9aa43d4a22ada6f12a78b12_text_export.jpeg)

### 第 4 步：查看删除信息

已删除密钥表格包含每条已删除密钥的以下信息：

- **何时被删除**（时间戳）
- **由谁删除**（用户/管理员信息）
- **密钥标识**详情

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/8538f7c4-634e-44c8-8d7d-fafbd6da0b02/ascreenshot_6b73f9c6a52d4e40a2368ef441cf6c8f_text_export.jpeg)

### 第 5 步：查看财务信息

表格还会展示删除时刻记录的财务信息：

- **删除时花费**：密钥被删除时累计的总花费
- **原始预算**：为该密钥设置的预算上限

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/f8b03850-b17c-490c-a507-c3b0b6c050ab/ascreenshot_070b139f111844bba38fbed8835b097b_text_export.jpeg)

## 查看已删除团队

### 第 1 步：进入已删除团队

在日志区块中点击 "Deleted Teams"（已删除团队），查看所有已删除的团队。

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/716ce26f-09af-4a6d-99c5-921d6b6a8555/ascreenshot_d36c16f1cf894340aa8bc20ada5922ac_text_export.jpeg)

### 第 2 步：查看团队删除信息

已删除团队表格提供每条已删除团队的详细信息：

- **何时被删除**（时间戳）
- **由谁删除**（用户/管理员信息）
- **团队标识**详情

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/0a3f2d3f-179a-4ad7-916e-b77a13dca01d/ascreenshot_ded5970762d54528ae656421148116c4_text_export.jpeg)

### 第 3 步：查看团队财务信息

与已删除密钥一样，已删除团队表格同样展示财务信息：

- **删除时花费**：团队被删除时累计的总花费
- **原始预算**：为该团队设置的预算上限

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-17/5b24871f-b57e-404d-8fbe-a4b27cb2a6a0/ascreenshot_3121fbafbd6b4abf90993ce6c03c608d_text_export.jpeg)

## 适用场景

这一功能尤其适用于：

- **财务审计**：追踪已删除实体的花费与预算
- **合规**：留存谁在何时删除了什么内容的记录
- **成本分析**：了解删除前的花费模式
- **责任追溯**：确认是哪位管理员或用户执行了删除
- **历史记录**：即使实体已删除，财务数据依然保留

## 相关功能

- [审计日志](./multiple_admins.md)：查看所有实体变更的审计日志
- [UI 日志](./ui_logs.md)：查看请求日志与花费追踪
