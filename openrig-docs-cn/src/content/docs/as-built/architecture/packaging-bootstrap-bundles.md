---
kind: as-built
title: 打包、Bootstrap、Bundle 与遗留安装引擎
status: active
topics: [specification-and-bundles, release-and-versioning]
domains: [engineering-advisor, operating-advisor]
applies-when: |
  需要了解 rig/pod bundle 如何组装（schema-version-2 对比遗留 v1）、
  bundle 的 create/inspect/install 与 /api/up 如何跨来源类型路由、
  分阶段的 BootstrapOrchestrator plan/apply 流程，或哪些遗留安装引擎
  接缝仍随版本发布以服务 pre-reboot 数据。
siblings: [agent-spec-and-startup.md, plugin-agent-image-context-pack.md]
prerequisite-reads: [../README.md, agent-spec-and-startup.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


OpenRig 如何把一个拓扑打包为可分享的 bundle，并在另一台主机上将其重建。完全双格式：schema-version-2 pod bundle 加遗留 v1 工件，由 bootstrap 编排器确定性地路由。

> 已在 HEAD `7eaf524c` 对照源码验证（`git describe` → `v0.3.1-6-g7eaf524c`）。包版本 **0.3.1**（slice-00 §1.1）。按 slice-08 §10.1，以 `architecture.md` 标题定位源码（§5 Bundles/bootstrap/legacy compatibility、§6 Bundle create/inspect/install + /api/up、§11 Compat note 3）——行号仅供参考。

## 1. Bundle、bootstrap 与遗留域服务

（`architecture.md` §5 "Bundles, bootstrap, and legacy compatibility"）

- `pod-bundle-assembler.ts`——schema-version-2 bundle 组装器。重新确认：产出 `schemaVersion: 2`（`pod-bundle-assembler.ts:167`）。
- `bundle-types.ts`——v1 与 v2 manifest 类型外加 parse/validate/serialize。重新确认：v2 `PodBundleManifest` 类型携带 `schemaVersion: 2`（`:23`）；`validatePodBundleManifest` 在 `schema_version === 2` 不成立时拒绝（`:38`）；`serializePodBundleManifest` 写出 `schema_version: 2`（`:62`）；`parsePodBundleManifest`（`:87`）；遗留路径 `validateLegacyBundleManifest`（`:143`）——两种格式共存于一个文件。
- `bundle-source-resolver.ts`——`LegacyBundleSourceResolver`（`bundle-source-resolver.ts:25`）加 `PodBundleSourceResolver`（`:132`）。
- `bootstrap-orchestrator.ts`——分阶段的 bootstrap 流程，带直接 pod-aware rig 与 v2 bundle 委托。`BootstrapMode = "plan" | "apply"`（`bootstrap-orchestrator.ts:26`）。
- `up-command-router.ts`——`/api/up` 的 spec/bundle 来源分类。`SourceKind = "rig_spec" | "rig_bundle" | "rig_name"`（`up-command-router.ts:6`）。

以上均已在 `packages/daemon/src/domain/` @HEAD 重新确认存在。

## 2. Bundle 的 create / inspect / install

（`architecture.md` §6 "Bundle create / inspect / install"）

`routes/bundles.ts` 完全双格式：

- **create**——检测 pod-aware RigSpec 并使用 `PodBundleAssembler`（接受可选的 `rigRoot`）；遗留 create 仍使用 `LegacyBundleAssembler`。
- **inspect**——安全解包归档，检测 `schema_version`；v2 返回 `schemaVersion: 2`、`agents[]` 与完整性数据；v1 返回遗留 manifest 形状。
- **install**——使用完整的 bootstrap plan/apply；bootstrap 先窥探 manifest，再确定性地路由到 `pod_bundle` 或 `rig_bundle`。已在源码重新确认：`bootstrap-orchestrator.ts:134-143`——当 `sourceKind === "rig_bundle"` 时，先解包到临时窥探目录，读取 `bundle.yaml`，并调用 `parsePodBundleManifest(...)` 检测 schema 版本，然后再路由。

## 3. `/api/up` 来源路由

（`architecture.md` §6 "`/api/up`"）

`UpCommandRouter` + `BootstrapOrchestrator` 负责：

- 直接的 pod-aware rig spec，
- 遗留 rig spec，
- v1 bundle 安装，
- v2 pod-bundle 安装。

plan 模式与 apply 模式都横跨这些来源类型工作。

> 定义说明（沿用，非数字漂移）——`architecture.md` §6 描述 bootstrap 路由到 `pod_bundle` / `rig_bundle`。`UpCommandRouter` 的*分类*枚举是 `SourceKind = "rig_spec" | "rig_bundle" | "rig_name"`（`up-command-router.ts:6`）；`pod_bundle` 与 `rig_bundle` 之分在更深一层的 `bootstrap-orchestrator.ts` 中通过窥探 manifest 的 schema 版本解决（`:134-143`）。两种说法在各自层次上都准确；此处明确记录分层，以免看似自相矛盾。

## 4. 遗留安装引擎（仍然随版本发布）

（`architecture.md` §5 "Legacy systems that still ship" + §11 compat note 3）

这些 pre-reboot 接缝为向后兼容保持启用：

- 包安装引擎：`package-install-service.ts`、`package-manifest.ts`、`package-repository.ts`、`install-engine.ts`、`conflict-detector.ts`、`role-resolver.ts`（全部在 @HEAD 重新确认存在）。
- bootstrap 与 requirement-probe 支持。
- 发现（discovery）与认领（claim）服务。
- tmux/cmux 适配器与 resume 适配器。

> 漂移检查 D-pkg——`architecture.md` §5/§6 的这部分内容没有 slice-00 数字漂移；v2 bundle 组装器 + 双格式流程已在 HEAD 验证准确（上文 §1–§3）。过时的 footprint/迁移计数落在 `daemon-core.md`，不在本文。

兼容性说明 3（逐字沿用，`architecture.md` §11）："Legacy compatibility seams still ship for pre-reboot data and v1 artifacts."（§11 完整清单在 `architecture-rules-and-event-system.md` 中。）

> 来源说明（沿用，不断言）：`bootstrap-orchestrator.ts:3-5` 仍导入 `LegacyRigSpec` / `LegacyRigSpecCodec` / `LegacyRigSpecSchema`，源码内带有 `TODO: AS-T08b — migrate to pod-aware RigSpec` 标记，且 `:16` 处有 `TODO: AS-T12 — migrate to pod-aware bundle source resolver`。这个遗留接缝是有意为之、进行中的迁移脚手架——按原样记录，不做修饰。

## OPEN / 沿用事项

- **D-pkg（按当前状态解决）**：本模块拆分内容中没有 slice-00 数字漂移；v2 组装器 + 双格式流程已在 HEAD 验证准确。显式记录 bundle 路由分层，以预先化解 §6 与源码之间表面上的矛盾。
- 遗留迁移 TODO 自源码逐字沿用（AS-T08b / AS-T12）。

## 另见

- `agent-spec-and-startup.md`——`RigInstantiator` / `PodRigInstantiator`，以及 bundle 所包裹的双格式 spec 接缝。
- `plugin-agent-image-context-pack.md`——0.3.0/0.3.1 的可复用 starter 状态 / 内容来源（content-provenance）集群（在 8.4b 单独成文）。
- `daemon-core.md`——`/api/up` + `/api/bundles` 是 49 个路由挂载之列；`BootstrapOrchestrator` 在 createDaemon 序列中构造。
- 源码根：`packages/daemon/src/domain/{pod-bundle-assembler,bundle-types,bundle-source-resolver,bootstrap-orchestrator,up-command-router}.ts`、`packages/daemon/src/routes/{bundles,up}.ts`。
