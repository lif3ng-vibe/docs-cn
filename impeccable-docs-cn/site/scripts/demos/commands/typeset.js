// Typeset command demo - shows flat, hierarchyless text becoming intentional typography
export default {
  id: 'typeset',
  caption: '没有字级层级 → 清晰、有意图的字体排印',

  before: `
    <div style="width: 100%; max-width: 240px; padding: 16px; font-family: Arial, sans-serif;">
      <div style="font-size: 14px; font-weight: bold; color: #444; margin-bottom: 8px;">项目动态</div>
      <div style="font-size: 14px; color: #444; margin-bottom: 8px;">Q1 设计冲刺</div>
      <div style="font-size: 14px; color: #444; line-height: 1.4; margin-bottom: 8px;">团队完成了仪表盘的改版设计。所有组件均已通过相关方的评审与确认。</div>
      <div style="font-size: 14px; color: #444;">更新于 2 小时前</div>
    </div>
  `,

  after: `
    <div style="width: 100%; max-width: 240px; padding: 16px; font-family: 'Instrument Sans', sans-serif;">
      <div style="font-size: 0.625rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-ash); margin-bottom: 6px;">项目动态</div>
      <div style="font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 600; color: var(--color-ink); line-height: 1.1; margin-bottom: 12px;">Q1 设计冲刺</div>
      <p style="font-size: 0.8125rem; color: color-mix(in oklch, var(--color-ink) 65%, transparent); line-height: 1.65; margin: 0 0 14px; max-width: 30ch;">团队完成了仪表盘改版。所有组件均已评审并通过。</p>
      <div style="font-size: 0.6875rem; color: var(--color-ash); font-variant-numeric: tabular-nums;">更新于 2 小时前</div>
    </div>
  `
};
