// Interaction Design skill demos
export default {
  id: 'interaction-design',
  tabs: [
    {
      id: 'states',
      label: '按钮状态',
      caption: '状态缺失 vs 完整的交互反馈',
      // This demo shows both states side-by-side, no toggle needed
      hasToggle: false,
      before: `
        <div class="int-demo int-states-demo">
          <div class="int-state-row">
            <span class="int-state-label">差</span>
            <button class="int-btn int-btn-poor">点我</button>
          </div>
          <div class="int-state-row">
            <span class="int-state-label">好</span>
            <button class="int-btn int-btn-good">点我</button>
          </div>
        </div>
      `
    },
    {
      id: 'affordance',
      label: '可供性',
      caption: '操作不明 vs 可点性一目了然',
      beforeClass: 'int-demo int-affordance-before',
      afterClass: 'int-demo int-affordance-after',
      before: `
        <div class="int-demo int-affordance-before">
          <div class="int-aff-item int-aff-poor">
            <span>了解更多</span>
          </div>
          <div class="int-aff-item int-aff-poor">
            <span>设置</span>
          </div>
        </div>
      `,
      after: null // Uses CSS class toggle
    },
    {
      id: 'feedback',
      label: '反馈',
      caption: '操作无响应 vs 即时确认',
      before: `
        <div class="int-demo int-feedback-before">
          <button class="int-fb-btn int-fb-silent">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
          <span class="int-fb-label">点一下——毫无反应</span>
        </div>
      `,
      after: `
        <div class="int-demo int-feedback-after">
          <button class="int-fb-btn int-fb-active" data-action="like">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
          <span class="int-fb-label">点一下试试！</span>
        </div>
      `,
      onAfterRender: () => {
        // Setup interactive like button
        document.querySelectorAll('.int-fb-active[data-action="like"]').forEach(btn => {
          btn.addEventListener('click', () => {
            btn.classList.toggle('liked');
            const label = btn.nextElementSibling;
            if (label) {
              label.textContent = btn.classList.contains('liked') ? '已点赞！' : '点一下试试！';
            }
          });
        });
      }
    }
  ]
};



