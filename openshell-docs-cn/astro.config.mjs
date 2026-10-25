// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// hub Pages 部署注入（无 env 时本地开发走根路径）
const DOCS_SITE = process.env.DOCS_SITE || 'http://localhost:4321';
const DOCS_BASE = (process.env.DOCS_BASE || '/').replace(/\/+$/, '') || '/';

export default defineConfig({
  site: DOCS_SITE,
  base: DOCS_BASE,
  integrations: [
    starlight({
      title: 'NVIDIA OpenShell',
      description: 'NVIDIA OpenShell 中文文档（非官方翻译）：自主 AI 智能体的安全私有运行时，以内核级隔离的沙箱运行智能体编队。',
      // 单语言中文：必须 root + lang（写 'zh' 会强制 /zh/ URL 前缀导致 slug 失配）
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      logo: {
        src: './src/assets/NVIDIA_symbol.svg',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/NVIDIA/OpenShell' },
      ],
      sidebar: [
        { label: '首页', slug: 'index' },
        {
          label: '关于 NVIDIA OpenShell',
          items: [
            { label: '概述', slug: 'about/overview' },
            { label: '架构', slug: 'about/architecture' },
            { label: '安装', slug: 'about/installation' },
            { label: '运行你的第一个智能体', slug: 'about/run-your-first-agent' },
            { label: '支持矩阵', slug: 'about/support-matrix' },
          ],
        },
        {
          label: '工作原理',
          items: [
            {
              label: '网关',
              items: [
                { label: '概述', slug: 'how-it-works/gateways/overview' },
                { label: '身份验证', slug: 'how-it-works/gateways/authentication' },
                { label: '配置', slug: 'how-it-works/gateways/configuration' },
                { label: '容器部署', slug: 'how-it-works/gateways/container-deployment' },
              ],
            },
            { label: '工作区', slug: 'how-it-works/workspaces' },
            {
              label: '沙箱',
              items: [
                { label: '概述', slug: 'how-it-works/sandboxes/overview' },
                { label: '模板', slug: 'how-it-works/sandboxes/templates' },
                { label: '运行时', slug: 'how-it-works/sandboxes/runtimes' },
              ],
            },
            {
              label: '提供商',
              items: [
                { label: '概述', slug: 'how-it-works/providers/overview' },
                { label: '配置档案', slug: 'how-it-works/providers/profiles' },
                { label: 'AWS', slug: 'how-it-works/providers/aws' },
                { label: 'Google', slug: 'how-it-works/providers/google' },
              ],
            },
            {
              label: '策略',
              items: [
                { label: '概述', slug: 'how-it-works/policies/overview' },
                { label: '网络规则', slug: 'how-it-works/policies/network-rules' },
                { label: '管理策略', slug: 'how-it-works/policies/manage-policies' },
                { label: '策略证明器', slug: 'how-it-works/policies/prover' },
                { label: '策略顾问', slug: 'how-it-works/policies/advisor' },
                { label: '默认策略', slug: 'how-it-works/policies/default-policy' },
                { label: '架构参考', slug: 'how-it-works/policies/schema' },
              ],
            },
            { label: '推理', slug: 'how-it-works/inference' },
          ],
        },
        {
          label: '可扩展性',
          items: [
            { label: '概述', slug: 'extensibility/overview' },
            {
              label: '监管中间件',
              items: [
                { label: '概述', slug: 'extensibility/supervisor-middleware' },
                { label: '配置', slug: 'extensibility/supervisor-middleware/configure' },
                { label: '支持的操作', slug: 'extensibility/supervisor-middleware/operations' },
              ],
            },
            { label: '网关拦截器', slug: 'extensibility/gateway-interceptors' },
            { label: '驱动', slug: 'extensibility/drivers' },
            { label: '隔离后端', slug: 'extensibility/isolation-backends' },
          ],
        },
        {
          label: '可观测性',
          items: [
            { label: '概述', slug: 'observability/overview' },
            { label: '追踪', slug: 'observability/traces' },
            { label: '网关指标', slug: 'observability/gateway-metrics' },
            { label: '访问日志', slug: 'observability/accessing-logs' },
            { label: '日志', slug: 'observability/logging' },
            { label: 'OCSF JSON 导出', slug: 'observability/ocsf-json-export' },
            { label: '遥测', slug: 'observability/telemetry' },
          ],
        },
        {
          label: 'Kubernetes',
          items: [
            { label: '安装', slug: 'kubernetes/setup' },
            { label: '工作区', slug: 'kubernetes/workspaces' },
            { label: '高可用性', slug: 'kubernetes/high-availability' },
            { label: '证书管理', slug: 'kubernetes/managing-certificates' },
            { label: 'Ingress', slug: 'kubernetes/ingress' },
            { label: '访问控制', slug: 'kubernetes/access-control' },
            { label: 'OpenShift', slug: 'kubernetes/openshift' },
            { label: '迁移网关配置', slug: 'kubernetes/migrate-gateway-config' },
          ],
        },
        {
          label: '教程',
          items: [
            { label: '概述', slug: 'tutorials' },
            { label: '使用 OpenRouter 运行 Pi', slug: 'tutorials/run-pi-with-openrouter' },
            { label: '第一个网络策略', slug: 'tutorials/first-network-policy' },
            { label: 'GitHub 推送访问', slug: 'tutorials/github-push-access' },
            { label: 'Microsoft Graph 凭据刷新', slug: 'tutorials/microsoft-graph-provider-refresh' },
          ],
        },
        {
          label: 'SDK 参考',
          items: [
            { label: 'Go SDK', slug: 'sdk/go' },
            { label: 'Rust SDK', slug: 'sdk/rust' },
            { label: 'Python SDK', slug: 'sdk/python' },
            { label: 'TypeScript SDK', slug: 'sdk/typescript' },
            { label: 'API 错误', slug: 'sdk/api-errors' },
            { label: 'Protobuf 时间类型', slug: 'sdk/protobuf-time-types' },
          ],
        },
        {
          label: '安全',
          items: [
            { label: '安全最佳实践', slug: 'security/best-practices' },
            { label: '校验镜像内容', slug: 'security/verify-image-contents' },
          ],
        },
        {
          label: '升级指南',
          items: [{ label: '0.1.0', slug: 'upgrade/0-1-0' }],
        },
        {
          label: '资源',
          items: [{ label: '许可证', slug: 'resources/license' }],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
