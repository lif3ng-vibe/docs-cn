import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import {AgentBand, SalesBand, Tiles, UseCases} from '@site/src/components/Conversion';
import LiteLLMFlow from '@site/src/components/LiteLLMFlow';
import QuickStartBox from '@site/src/components/QuickStartBox';
import styles from './index.module.css';

const POPULAR = [
  {icon: 'gateway', title: '网关快速上手', text: 'Docker 与 Postgres、管理界面，5 分钟拿到你的第一个虚拟密钥。', to: '/docs/proxy/docker_quick_start'},
  {icon: 'sdk', title: 'SDK 快速上手', text: '运行 uv add litellm，然后用 completion() 调用任意提供商。', to: '/docs/'},
  {icon: 'agent', title: '接入 Claude Code 与 Codex', text: '把编程 Agent 和 OpenAI SDK 接到你的网关上。', to: '/docs/proxy/client_setup/overview'},
  {icon: 'mcp', title: '提供商', text: 'OpenAI、Anthropic、Bedrock、Agent Platform、Azure 等 100+ 提供商。', to: '/docs/providers'},
  {icon: 'budget', title: '密钥、预算与成本', text: '虚拟密钥可为每个密钥、团队与标签设置限额。', to: '/docs/proxy/virtual_keys'},
  {icon: 'regions', title: '部署到生产环境', text: '在 AWS、GCP 与 Azure 上用 Helm、Terraform 与 Kubernetes 部署。', to: '/docs/proxy/deploy'},
];

export default function Home() {
  return (
    <Layout
      title="LiteLLM 中文文档"
      description="LiteLLM 中文文档：使用最广泛的开源 AI 网关。Python SDK 与自托管网关让 100+ LLM 提供商共用一个 OpenAI 兼容 API，内置密钥、预算、花费追踪与防护栏（非官方镜像，仅供学习参考）。">
      <Head>
        <link rel="alternate" type="text/markdown" href="/index.md" title="LiteLLM docs home (markdown)" />
      </Head>
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>使用最广泛的开源 AI 网关。</h1>
            <p className={styles.lead}>
              LiteLLM 是面向你所有模型、工具与 Agent 的统一网关：为 100+ LLM 提供商、MCP 工具和 A2A Agent 提供单一 API，
              管控密钥与预算，并记录每一次请求的成本。
            </p>
          </div>
        </header>

        <LiteLLMFlow copyCommand={false} agentPrompt={false} />

        <QuickStartBox source="docs-home" />

        <AgentBand source="docs-home" />

        <UseCases source="docs-home" />

        <section className={styles.section}>
          <h2 className={styles.h2}>热门指南</h2>
          <Tiles items={POPULAR} columns={3} />
        </section>

        <SalesBand source="docs-home" />
      </main>
    </Layout>
  );
}
