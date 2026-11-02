// verify-hydration.mjs —— 客户端装配健康判据（唯一可靠的 export 健康检测）
// 塌陷形态：React 流式装配静默卡死 → UI 壳（aside/h1/main 结构）缺失、内容区变窄。
// 判据：1920 视口硬导航 quickstart 页，等待装配后 main 宽 ≥800 且 aside 存在。
// 退出码 0=健康 1=塌陷。用法: node verify-hydration.mjs <base-url>
import { chromium } from 'playwright';

const base = process.argv[2];
const browser = await chromium.launch();
try {
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(base + '/docs-cn/ollama/quickstart/', { waitUntil: 'load', timeout: 30000 });
  await p.waitForTimeout(3000);
  const r = await p.evaluate(() => ({
    aside: !!document.querySelector('aside'),
    mainW: Math.round((document.querySelector('main') || document.body).getBoundingClientRect().width),
    h1: (document.querySelector('h1') || {}).textContent || '',
  }));
  console.log(JSON.stringify(r));
  const ok = r.aside && r.mainW >= 800 && /[一-龥]/.test(r.h1);
  process.exit(ok ? 0 : 1);
} finally {
  await browser.close();
}