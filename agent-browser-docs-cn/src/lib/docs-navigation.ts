// 与 content/docs/meta.json 的侧边栏顺序保持一致（llms.txt 生成用）。
export type NavItem = {
  name: string;
  href: string;
};

export type NavSection = {
  title: string | null;
  items: NavItem[];
};

export const navigation: NavSection[] = [
  {
    title: null,
    items: [
      { name: "简介", href: "/" },
      { name: "安装", href: "/installation" },
      { name: "快速开始", href: "/quick-start" },
      { name: "技能", href: "/skills" },
    ],
  },
  {
    title: "参考",
    items: [
      { name: "命令", href: "/commands" },
      { name: "配置", href: "/configuration" },
      { name: "插件", href: "/plugins" },
      { name: "选择器", href: "/selectors" },
      { name: "快照", href: "/snapshots" },
    ],
  },
  {
    title: "功能",
    items: [
      { name: "会话", href: "/sessions" },
      { name: "仪表盘", href: "/dashboard" },
      { name: "Diff 对比", href: "/diffing" },
      { name: "网络拦截", href: "/network" },
      { name: "CDP 模式", href: "/cdp-mode" },
      { name: "WebMCP", href: "/webmcp" },
      { name: "流式输出", href: "/streaming" },
      { name: "视频录制", href: "/recording" },
      { name: "WebGPU", href: "/webgpu" },
      { name: "调试", href: "/debugging" },
      { name: "性能分析器", href: "/profiler" },
      { name: "React 与 Web Vitals", href: "/react" },
      { name: "文件与剪贴板", href: "/files" },
      { name: "初始化脚本", href: "/init-scripts" },
      { name: "代理", href: "/proxy" },
      { name: "iOS 模拟器", href: "/ios" },
      { name: "安全", href: "/security" },
      { name: "Next.js 与 Vercel", href: "/next" },
      { name: "eve 扩展", href: "/eve" },
      { name: "原生模式", href: "/native-mode" },
    ],
  },
  {
    title: "提供商",
    items: [
      { name: "AgentCore", href: "/providers/agentcore" },
      { name: "Browser Use", href: "/providers/browser-use" },
      { name: "Browserbase", href: "/providers/browserbase" },
      { name: "Browserless", href: "/providers/browserless" },
      { name: "Kernel", href: "/providers/kernel" },
      {
        name: "远程 Agent Browser",
        href: "/providers/remote-agent-browser",
      },
    ],
  },
  {
    title: "引擎",
    items: [
      { name: "Chrome", href: "/engines/chrome" },
      { name: "Lightpanda", href: "/engines/lightpanda" },
      { name: "Obscura", href: "/engines/obscura" },
    ],
  },
  {
    title: null,
    items: [{ name: "更新日志", href: "/changelog" }],
  },
];

export const allDocsPages: NavItem[] = navigation.flatMap(
  (section) => section.items,
);
