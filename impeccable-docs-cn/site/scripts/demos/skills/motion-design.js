// Motion Design skill demos
export default {
  id: 'motion-design',
  tabs: [
    {
      id: 'stagger',
      label: '错落显现',
      caption: '瞬间出现 vs 有编排的显现',
      before: `
        <div class="motion-demo motion-stagger-demo">
          <div class="motion-list-item"><span class="motion-dot"></span>仪表盘</div>
          <div class="motion-list-item"><span class="motion-dot"></span>数据分析</div>
          <div class="motion-list-item"><span class="motion-dot"></span>设置</div>
          <div class="motion-list-item"><span class="motion-dot"></span>个人资料</div>
        </div>
      `,
      after: null, // CSS animation triggered by data-state
      onToggle: (viewport, isAfter) => {
        if (isAfter) {
          // Re-trigger animation by cloning elements
          const items = viewport.querySelectorAll('.motion-list-item');
          items.forEach(item => {
            const clone = item.cloneNode(true);
            item.parentNode.replaceChild(clone, item);
          });
        }
      }
    },
    {
      id: 'micro',
      label: '微交互',
      caption: '静态按钮 vs 有回应的反馈',
      before: `
        <div class="motion-demo motion-micro-demo">
          <button class="motion-btn motion-btn-before">加入购物车</button>
        </div>
      `,
      after: `
        <div class="motion-demo motion-micro-demo">
          <button class="motion-btn motion-btn-after">加入购物车</button>
        </div>
      `
    },
    {
      id: 'transition',
      label: '状态变化',
      caption: '生硬切换 vs 平滑过渡',
      before: `
        <div class="motion-demo motion-transition-demo">
          <div class="motion-card motion-card-before">
            <div class="motion-card-icon">📦</div>
            <div class="motion-card-text">订单已提交</div>
          </div>
        </div>
      `,
      after: `
        <div class="motion-demo motion-transition-demo">
          <div class="motion-card motion-card-after">
            <div class="motion-card-icon">✓</div>
            <div class="motion-card-text">订单已确认</div>
          </div>
        </div>
      `
    }
  ]
};



