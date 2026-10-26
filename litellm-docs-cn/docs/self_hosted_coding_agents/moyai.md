---
title: Moyai
sidebar_label: Moyai
description: 在自己的云端运行开源编码智能体，通过 LiteLLM 选择模型，并追踪每位队友的花费。了解 Moyai 的实际效果，并配置你的第一个任务。
hide_title: true
hide_table_of_contents: true
---

import {MoyaiHero, BenefitGrid, GuideCards, SetupCallout} from '@site/src/components/Moyai';
import BugWorkflowDemo from '@site/blog/internal-devin-two-days/BugWorkflowDemo';
import Image from '@theme/IdealImage';
import styles from '@site/src/components/Moyai/styles.module.css';
import Heading from '@theme/Heading';

<MoyaiHero />

Moyai 是一个运行在你自己云端的开源编码智能体（coding agent）。在 Slack 或浏览器里派发一个 bug 修复或仓库改动，然后审查它提交的拉取请求（pull request）。接入你的 LiteLLM 网关即可选择模型，并追踪每个任务的花费。

<section className={styles.why} aria-labelledby="why-moyai">
  <Heading as="h2" id="why-moyai">为什么选择 Moyai</Heading>
  <BenefitGrid />
  <GuideCards />
  <p className={styles.setupRequirements}>从一个 Modal 账号和一个 LiteLLM 网关开始。在你接入仓库之前，配置指南会先验证一个云端任务能跑通。</p>
</section>

## 让浏览器直接给 Moyai 派任务 {#start-in-the-browser}

描述改动内容，选择智能体和模型，再补充仓库上下文。团队的会话连同技能和应用连接，都收纳在同一个工作区里。

<figure className={styles.spendFigure}>
  <Image
    img={require('../../img/moyai_task_composer.jpg')}
    alt="Moyai 的浏览器工作区，含一个修复 bug 的提示词、智能体与模型选择器、已连接的应用以及最近的会话。"
    style={{width: '100%', display: 'block'}}
  />
  <figcaption>Moyai 界面示例，展示的是示例提示词和样例工作区数据。这张截图展示的是任务配置，并非一次已完成的智能体运行。</figcaption>
</figure>

## 看一个任务如何从请求变成 PR {#watch-a-task}

看一个团队让 Moyai 排查 bug、运行回归测试，最后把拉取请求发回 Slack。你可以在浏览器里跟进整个过程，并在同一段对话里发出修改意见。

<BugWorkflowDemo />

## 查看每位队友的花费 {#see-agent-spend}

打开 Moyai 的花费仪表板，找出模型账单背后的用户、会话和模型。Moyai 会记录 LiteLLM 为每个被追踪请求上报的费用，因此任何一个总额都能回溯到同一份成本数据。

<figure className={styles.spendFigure}>
  <Image
    img={require('../../img/moyai_spend_users.jpg')}
    alt="Moyai 按 LLM 花费汇总的用户表，列出每位队友记录在案的成本、会话数、模型请求数以及在团队花费中的占比。"
    style={{width: '100%', display: 'block'}}
  />
  <figcaption>Moyai 花费仪表板，数据为样例。人名与数字仅用于演示界面，并非 LiteLLM 的生产用量，也不能作为上文节省估算的依据。</figcaption>
</figure>

[对照 LiteLLM 核查请求记录](./moyai/setup.md#track-spend)。[成本核算指南](./moyai/architecture.md#cost-accounting)解释了覆盖范围与缺失扣费凭证的情形。云托管与存储成本不包含在上述模型费用之内，仍单独计算。

## 从团队已知的 bug 入手 {#put-moyai-to-work}

配置检查通过后，接入一个仓库，并给 Moyai 一个小而可复现的 issue：

> 复现这个 bug，补一个回归测试，修复它，然后发起一个拉取请求。修复前附上失败的测试，修复后附上通过的结果。

审查 diff 和测试输出，然后在 Moyai 里查看这次会话的模型成本。用第一个结果来决定接下来委托哪些任务。

## 开始配置之前 {#prerequisites}

<div className={styles.questions}>
<details>
<summary>需要准备什么才能开始？</summary>

一个 Modal 账号、一个可从云端访问的 LiteLLM 网关，以及为所选模型创建的虚拟密钥（virtual key）。[配置指南](./moyai/setup.md)会带你完成安装和一个云端任务。要开 GitHub PR，还需要一个组织名下的 GitHub App；请在接入仓库之前先验证第一个任务。

</details>
<details>
<summary>要为什么付费？</summary>

模型用量，外加托管、智能体沙箱和存储。账单多少取决于你的工作负载和模型选择。每天 $700 是我们团队的估算值，既不是起价，也不构成对你成本的承诺。在扩大部署范围之前，先衡量自己的任务。

</details>
<details>
<summary>团队需要维护什么？</summary>

服务由你自己管理，包括部署、更新、凭据和备份。Moyai 适合愿意自行运维云端智能体的、彼此信任的工程团队。[架构指南](./moyai/architecture.md)会在你决定运行它之前，讲解部署选择、检查点（checkpoint）和恢复机制。

</details>
<details>
<summary>能否选择智能体可以访问什么？</summary>

在 **Connections** 中选择应用和仓库。启用的应用工具可以在其连接策略允许的范围内写入，无需逐次审批。GitHub PR 的审查与合并由你完成。模型请求会经由你的 LiteLLM 网关发往你选择的提供商（provider），因此在决定共享哪些代码时，要把这个提供商考虑进去。

</details>
</div>

<SetupCallout />

<details>
<summary>想找原来的网关配置说明？</summary>

<span id="how-moyai-uses-litellm" />
<span id="step-1-add-the-models" />
<span id="step-2-create-a-virtual-key-for-moyai" />
<span id="step-3-set-the-gateway-in-moyai" />
<span id="step-4-do-a-test-of-the-connection" />
<span id="track-spend" />
<span id="troubleshooting" />
<span id="more-information" />

[网关配置](./moyai/setup.md#configure-litellm)、[连接检查](./moyai/setup.md#check-the-model-connection)、[花费追踪](./moyai/setup.md#track-spend)和[故障排查](./moyai/setup.md#故障排查)现已移入配置指南。

</details>
