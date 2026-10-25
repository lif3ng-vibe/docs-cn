// Adapt command demo - shows desktop-only design becoming responsive
export default {
  id: 'adapt',
  caption: '固定布局 → 全设备响应式',

  before: `
    <div style="width: 100%; max-width: 280px; display: flex; gap: 12px; align-items: flex-end;">
      <div style="text-align: center;">
        <div style="width: 48px; height: 80px; background: #f5f5f5; border: 2px solid #ddd; border-radius: 6px; padding: 4px; box-sizing: border-box;">
          <div style="height: 100%; display: flex; flex-direction: column; gap: 2px; overflow: hidden;">
            <div style="height: 16px; background: #ccc; border-radius: 2px;"></div>
            <div style="height: 8px; background: #e0e0e0; border-radius: 1px; width: 80%;"></div>
            <div style="height: 8px; background: #e0e0e0; border-radius: 1px; font-size: 6px; color: #999; overflow: hidden;">字太小了…</div>
          </div>
        </div>
        <div style="font-size: 9px; color: #999; margin-top: 4px;">手机</div>
        <div style="font-size: 8px; color: #cc0000;">坏了 ✗</div>
      </div>
      <div style="text-align: center;">
        <div style="width: 100px; height: 70px; background: #f5f5f5; border: 2px solid #ddd; border-radius: 4px; padding: 6px; box-sizing: border-box;">
          <div style="display: flex; gap: 4px; height: 100%;">
            <div style="width: 25%; background: #ccc; border-radius: 2px;"></div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
              <div style="height: 12px; background: #e0e0e0; border-radius: 2px;"></div>
              <div style="flex: 1; background: #eee; border-radius: 2px;"></div>
            </div>
          </div>
        </div>
        <div style="font-size: 9px; color: #999; margin-top: 4px;">桌面</div>
        <div style="font-size: 8px; color: #22c55e;">正常 ✓</div>
      </div>
    </div>
  `,

  after: `
    <div style="width: 100%; max-width: 280px; display: flex; gap: 12px; align-items: flex-end;">
      <div style="text-align: center;">
        <div style="width: 48px; height: 80px; background: var(--color-paper); border: 2px solid var(--color-mist); border-radius: 6px; padding: 4px; box-sizing: border-box;">
          <div style="height: 100%; display: flex; flex-direction: column; gap: 3px;">
            <div style="height: 12px; background: var(--color-ink); border-radius: 2px;"></div>
            <div style="flex: 1; background: var(--color-mist); border-radius: 2px;"></div>
            <div style="height: 14px; background: var(--color-accent); border-radius: 2px;"></div>
          </div>
        </div>
        <div style="font-size: 9px; color: var(--color-ash); margin-top: 4px;">手机</div>
        <div style="font-size: 8px; color: #22c55e;">纵向堆叠 ✓</div>
      </div>
      <div style="text-align: center;">
        <div style="width: 72px; height: 56px; background: var(--color-paper); border: 2px solid var(--color-mist); border-radius: 4px; padding: 4px; box-sizing: border-box;">
          <div style="height: 100%; display: flex; flex-direction: column; gap: 2px;">
            <div style="height: 10px; background: var(--color-ink); border-radius: 2px;"></div>
            <div style="flex: 1; display: flex; gap: 2px;">
              <div style="flex: 1; background: var(--color-mist); border-radius: 2px;"></div>
              <div style="flex: 1; background: var(--color-mist); border-radius: 2px;"></div>
            </div>
          </div>
        </div>
        <div style="font-size: 9px; color: var(--color-ash); margin-top: 4px;">平板</div>
        <div style="font-size: 8px; color: #22c55e;">双栏 ✓</div>
      </div>
      <div style="text-align: center;">
        <div style="width: 100px; height: 64px; background: var(--color-paper); border: 2px solid var(--color-mist); border-radius: 4px; padding: 4px; box-sizing: border-box;">
          <div style="display: flex; gap: 3px; height: 100%;">
            <div style="width: 20%; background: var(--color-charcoal); border-radius: 2px;"></div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
              <div style="height: 10px; background: var(--color-ink); border-radius: 2px;"></div>
              <div style="flex: 1; display: flex; gap: 2px;">
                <div style="flex: 1; background: var(--color-mist); border-radius: 2px;"></div>
                <div style="flex: 1; background: var(--color-mist); border-radius: 2px;"></div>
                <div style="flex: 1; background: var(--color-mist); border-radius: 2px;"></div>
              </div>
            </div>
          </div>
        </div>
        <div style="font-size: 9px; color: var(--color-ash); margin-top: 4px;">桌面</div>
        <div style="font-size: 8px; color: #22c55e;">带侧栏 ✓</div>
      </div>
    </div>
  `
};
