---
title: "升级 Lens"
description: "独立升级 Lens，同时保留其记录、凭据与恢复点。"
slug: "/proxy/lens/deployment/upgrades"
---

# 升级 Lens

选择一个可用的 [Lens 构件](./releases.md)，并阅读其迁移要求。只要契约兼容，Lens 与网关的版本可以各自独立。嵌入页 UI 发生变更时，网关侧也要同步更新对应的 UI

在改动持久化安装之前，先[备份并演练恢复](https://github.com/BerriAI/lens/blob/main/docs/backup.md)。完整保留当前安装所用的镜像、源码或安装包、环境变量文件，以及 ClickHouse 数据和 Keeper 状态。维护窗口开始前，暂停定时任务，并结束或取消进行中的调查

## 从网关托管版 Lens 迁出

如果 Lens 的元数据仍存放在 PostgreSQL 中，请按照[元数据迁移指南](https://github.com/BerriAI/lens/blob/main/docs/migration.md)操作：停掉旧的写入方，检查导入计划，执行导入，并在启动新的 Lens 运行时之前核对已保存的身份标识与记录。如果元数据已经存放在 ClickHouse 中，则保留该数据库及其 Keeper 状态，不要再对它跑导入器

部署归属变更同样要求每份资源只由一个控制器管理。将捆绑安装的 Lens 部署从网关发布中拆分出来时，请使用 [Helm 归属转移流程](https://github.com/BerriAI/lens/blob/main/helm/lens/README.md#select-versions-independently)。保留既有的资源名称、选择器、Secret 与卷

## 更新独立安装

使用 Compose 时，把保留的 `deploy/lens/.env` 中的 `LENS_IMAGE` 改成已验证的构件，然后在配套的 Lens 代码检出目录或安装包里应用该配置：

```sh
docker compose -f deploy/lens/compose.yaml up -d --wait
```

使用 Helm 时，保留原有的 release 名称、命名空间与 values，并按照 [Lens Helm 指南](https://github.com/BerriAI/lens/blob/main/helm/lens/README.md)更新 Lens 镜像或 chart。Helm 会复用已生成且具备集群访问权限的凭据；GitOps 则使用[预先创建的 Secret](./storage.md#gitops)

恢复定时任务前，先完成[首次追踪检查](../deployment.md#check-the-installation)，打开一条此前保存的追踪记录和对应数据集，并做一次限定范围的调查。接入 LiteLLM 时，还要在嵌入页中验证常规推理是否正常，以及既有用户的权限范围是否不变

## 携带匹配数据回滚

验证完成之前，保留旧的构件与恢复点。切换镜像前，先确认回滚目标能够读取当前状态。若要退回写 PostgreSQL 的实现，需要配套的快照，并对期间新增的写入做对账；[迁移指南](https://github.com/BerriAI/lens/blob/main/docs/migration.md#interrupted-import-and-rollback)说明了这条边界

环境变量文件和 ClickHouse 卷务必保留。`docker compose down --volumes` 会删除已存储的 Lens 数据
