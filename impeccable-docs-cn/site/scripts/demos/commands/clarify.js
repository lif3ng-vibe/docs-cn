// Clarify command demo - shows confusing UX copy becoming clear
export default {
  id: 'clarify',
  caption: '令人费解的文案 → 清晰、可行动的语言',

  before: `
    <div style="width: 100%; max-width: 260px; display: flex; flex-direction: column; gap: 12px;">
      <div style="padding: 12px; background: #f5f5f5; border-radius: 6px;">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">处理状态</div>
        <div style="font-size: 12px; color: #666;">您的请求正在处理中。请等待我们完成该操作。实际耗时可能因多种因素而有所不同。</div>
      </div>
      <div style="padding: 12px; background: #fff8e1; border-radius: 6px;">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">⚠️ 警告</div>
        <div style="font-size: 12px; color: #666;">继续执行此操作可能会对您的数据和设置配置造成不可逆的后果。</div>
      </div>
      <button style="padding: 10px; background: #333; color: white; border: none; border-radius: 4px; font-size: 13px;">提交请求</button>
    </div>
  `,

  after: `
    <div style="width: 100%; max-width: 260px; display: flex; flex-direction: column; gap: 12px;">
      <div style="padding: 12px; background: var(--color-paper); border: 1px solid var(--color-mist); border-radius: 6px;">
        <div style="font-size: 0.8125rem; font-weight: 600; color: var(--color-ink); margin-bottom: 4px;">正在保存更改…</div>
        <div style="font-size: 0.75rem; color: var(--color-ash);">大约还需 10 秒</div>
        <div style="margin-top: 8px; height: 4px; background: var(--color-mist); border-radius: 2px; overflow: hidden;">
          <div style="width: 60%; height: 100%; background: var(--color-accent);"></div>
        </div>
      </div>
      <div style="padding: 12px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px;">
        <div style="font-size: 0.8125rem; font-weight: 600; color: #92400e; margin-bottom: 4px;">删除这个项目？</div>
        <div style="font-size: 0.75rem; color: #854d0e; line-height: 1.5;">将永久删除 23 个文件，此操作无法撤销。</div>
      </div>
      <button style="padding: 10px; background: var(--color-ink); color: var(--color-paper); border: none; border-radius: 6px; font-size: 0.8125rem; font-weight: 500;">保存并继续 →</button>
    </div>
  `
};
