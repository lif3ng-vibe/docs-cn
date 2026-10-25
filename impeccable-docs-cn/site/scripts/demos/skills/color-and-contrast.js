// Color and Contrast skill demos
export default {
  id: 'color-and-contrast',
  tabs: [
    {
      id: 'palette',
      label: '色彩和谐',
      caption: '互相打架的颜色 vs 和谐的配色',
      beforeClass: 'color-demo color-palette-before',
      afterClass: 'color-demo color-palette-after',
      before: `
        <div class="color-demo color-palette-before">
          <div class="color-swatch swatch-1"></div>
          <div class="color-swatch swatch-2"></div>
          <div class="color-swatch swatch-3"></div>
          <div class="color-swatch swatch-4"></div>
          <div class="color-swatch swatch-5"></div>
          <div class="color-card">
            <span class="card-title">标题</span>
            <span class="card-subtitle">副标题</span>
            <button class="card-btn">操作</button>
          </div>
        </div>
      `,
      after: null // Uses CSS class toggle
    },
    {
      id: 'accent',
      label: '有策略的强调色',
      caption: '单色的单调 vs 有策略的强调色',
      beforeClass: 'color-demo color-accent-before',
      afterClass: 'color-demo color-accent-after',
      before: `
        <div class="color-demo color-accent-before">
          <div class="color-accent-card">
            <div class="color-accent-title">高级版</div>
            <div class="color-accent-text">解锁全部功能，并获得优先支持。</div>
            <button class="color-accent-btn">立即升级</button>
          </div>
        </div>
      `,
      after: null // Uses CSS class toggle
    },
    {
      id: 'contrast',
      label: '对比度比率',
      caption: '无障碍不达标 vs 符合 WCAG',
      hasToggle: false, // Static comparison
      before: `
        <div class="color-demo color-contrast-static">
          <div class="contrast-example contrast-fail">
            <span class="contrast-badge">不达标 WCAG</span>
            <div class="contrast-text">难以阅读</div>
            <div class="contrast-ratio">2.5:1</div>
          </div>
          <div class="contrast-example contrast-pass">
            <span class="contrast-badge">达到 AAA</span>
            <div class="contrast-text">轻松阅读</div>
            <div class="contrast-ratio">12.6:1</div>
          </div>
        </div>
      `
    }
  ]
};



