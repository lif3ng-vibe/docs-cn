---
title: "代码签名策略"
description: "Windows 代码签名、发布审批与隐私。"
sidebar:
  order: 27
---
Worktrunk 向 SignPath Foundation 提交的申请正在审核中。当前的 Windows 签名流水线使用自签名测试证书，并在签名失败时允许发布未签名版本。

## 为什么签名很重要

[Authenticode](https://learn.microsoft.com/en-us/windows/hardware/drivers/install/authenticode) 签名用于标识二进制文件的发布者，并验证文件自签名以来未被改动。

## 签名证书

> 免费代码签名由 [SignPath.io](https://signpath.io/) 提供，证书由 [SignPath Foundation](https://signpath.org/) 颁发。

SignPath 将私钥保存在硬件安全模块（hardware security module）中，维护者无法接触私钥。

## 签名范围

签名流水线覆盖 [GitHub Releases](https://github.com/max-sixty/worktrunk/releases) 上 `x86_64-pc-windows-msvc` 归档中的 `wt.exe` 与 `git-wt.exe`，这些产物也通过 winget 分发。

## 构建与签名流水线

[`release` 工作流](https://github.com/max-sixty/worktrunk/blob/main/.github/workflows/release.yaml)在 GitHub 托管的 runner 上使用 [cargo-dist](https://axodotdev.github.io/cargo-dist/) 构建打了标签的提交，随后将 Windows 归档提交给 SignPath，并在签名成功后发布已签名的归档。

## 项目角色

[@max-sixty](https://github.com/max-sixty) 持有全部签名角色：

- **作者（Author）**：提交代码并为发布版打标签。
- **评审人（Reviewer）**：在发布前评审外部贡献。
- **审批人（Approver）**：授权签名请求。

拥有签名权限的维护者在 GitHub 和 SignPath 上均使用多因素认证（multi-factor authentication）。

## 发布审批

根据本策略，每个签名请求都需先确认构建产物由仓库中打了标签的提交构建，再经人工审批。

## 隐私

Worktrunk 不收集任何遥测（telemetry）数据或分析数据。仅在执行用户请求或配置的操作时，才会向其他系统传输信息。

## 报告问题

如怀疑官方发布产物遭篡改，或杀毒软件对官方发布产物报警，请[提交 issue](https://github.com/max-sixty/worktrunk/issues) 报告。疑似 Defender 误报也可以[提交给 Microsoft 复核](https://www.microsoft.com/en-us/wdsi/filesubmission)。
