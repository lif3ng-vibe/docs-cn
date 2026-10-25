// Normalize command demo - shows inconsistent styles becoming systematic
export default {
  id: 'normalize',
  caption: '各自为政的样式 → 体系化的设计令牌',

  before: `
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 260px;">
      <div style="padding: 12px 16px; background: #f0f0f0; border-radius: 6px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">卡片一</div>
        <div style="font-size: 13px; color: #888;">这里是一段描述文字</div>
      </div>
      <div style="padding: 18px 12px; background: #e8e8e8; border-radius: 12px;">
        <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">卡片二</div>
        <div style="font-size: 14px; color: #666;">间距和样式都不一样</div>
      </div>
      <div style="padding: 10px 20px; background: #f5f5f5; border-radius: 4px;">
        <div style="font-size: 15px; font-weight: 700; margin-bottom: 2px;">卡片三</div>
        <div style="font-size: 12px; color: #999;">又是一种变体</div>
      </div>
    </div>
  `,

  after: `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-sm); width: 100%; max-width: 260px;">
      <div style="padding: var(--spacing-md); background: var(--color-paper); border: 1px solid var(--color-mist); border-radius: 6px;">
        <div style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 4px; color: var(--color-ink);">卡片一</div>
        <div style="font-size: 0.8125rem; color: var(--color-ash);">一致的描述文字</div>
      </div>
      <div style="padding: var(--spacing-md); background: var(--color-paper); border: 1px solid var(--color-mist); border-radius: 6px;">
        <div style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 4px; color: var(--color-ink);">卡片二</div>
        <div style="font-size: 0.8125rem; color: var(--color-ash);">相同的间距和样式</div>
      </div>
      <div style="padding: var(--spacing-md); background: var(--color-paper); border: 1px solid var(--color-mist); border-radius: 6px;">
        <div style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 4px; color: var(--color-ink);">卡片三</div>
        <div style="font-size: 0.8125rem; color: var(--color-ash);">统一的设计系统</div>
      </div>
    </div>
  `
};



