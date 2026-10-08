---
title: Agency Agents
description: 一支 300+ 专业智能体组成的"代理公司"——完整名册与战略手册的中文阅读站。
template: splash
hero:
  tagline: >-
    把一整家人型规模的"代理公司"（The Agency）装进你的终端：18 个部门、300+
    个专业智能体，外加成体系的多智能体协作战略手册。这是 [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents)
    的非官方中文翻译镜像。
  actions:
    - text: 浏览完整名册目录
      link: /catalog/
      icon: right-arrow
      variant: primary
    - text: NEXUS 快速上手
      link: /strategy/QUICKSTART/
      icon: right-arrow
    - text: 部门总览
      link: /catalog/#-代理公司名册
---

import { Card, CardGrid } from '@astrojs/starlight/components';

## 这是什么

**agency-agents** 是一套给 Claude Code 等编码智能体使用的 agent 定义库：每个
`*.md` 文件就是一个可以随取随用的专家人格——前端架构师、品牌守护者、事故响应指挥、
GIS 分析师、空间计算设计师……从工程到市场到游戏开发，共 18 个部门。

它还附带 **NEXUS**——一套完整的战略手册（战略、playbooks、runbooks、协调模板），
说明如何把这些智能体编排成一条真正能干活的多智能体流水线。

## 怎么读这个站

- 想认识整个"公司"：从[名册目录](/catalog/)开始，那里有每个部门的介绍和全部智能体索引
- 想直接用某个专家：在侧边栏按部门找，或用左上角搜索
- 想看它们怎么协作：读[战略手册](/strategy/QUICKSTART/)和[示例](/examples/)
- 想在自己电脑上安装使用：看[工具集成](/integrations/)

## 部门速览

<CardGrid>
  <Card title="工程 Engineering" icon="code">65 位智能体：架构、数据、DevOps、代码评审……名册里最大的部门。</Card>
  <Card title="专项 Specialized" icon="sparkles">59 位跨领域专家：从 ATS 简历优化到中文网络工程。</Card>
  <Card title="市场营销 Marketing" icon="megaphone">37 位智能体：品牌、内容、SEO、增长。</Card>
  <Card title="战略 Strategy" icon="compass">NEXUS 手册：7 个阶段的 playbook 与 4 套 runbook。</Card>
</CardGrid>

## 关于本镜像

- 翻译范围：全部 326 篇 Markdown（agent 定义、战略手册、示例、工具集成说明）
- 术语策略：意译为主，术语首次出现附英文原词；产品/工具名不译
- 一次性快照翻译，不与上游自动同步；源仓库与快照信息见[仓库说明](https://github.com/msitarzewski/agency-agents)