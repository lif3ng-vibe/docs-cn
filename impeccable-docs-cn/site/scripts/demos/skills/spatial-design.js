// Spatial Design skill demos
export default {
  id: 'spatial-design',
  tabs: [
    {
      id: 'grid',
      label: '网格系统',
      caption: '随手乱放 vs 有意图的网格对齐',
      before: `
        <div class="spatial-demo spatial-grid-before">
          <div class="spatial-card-item" style="width: 45%;">卡片一</div>
          <div class="spatial-card-item" style="width: 30%;">卡片二</div>
          <div class="spatial-card-item" style="width: 55%;">卡片三</div>
          <div class="spatial-card-item" style="width: 25%;">卡片四</div>
        </div>
      `,
      after: `
        <div class="spatial-demo spatial-grid-after">
          <div class="spatial-card-item">卡片一</div>
          <div class="spatial-card-item">卡片二</div>
          <div class="spatial-card-item">卡片三</div>
          <div class="spatial-card-item">卡片四</div>
        </div>
      `
    },
    {
      id: 'hierarchy',
      label: '视觉权重',
      caption: '权重均等 vs 清晰的视觉优先级',
      beforeClass: 'spatial-demo spatial-hierarchy-before',
      afterClass: 'spatial-demo spatial-hierarchy-after',
      before: `
        <div class="spatial-demo spatial-hierarchy-before">
          <div class="spatial-h-title">欢迎回来</div>
          <div class="spatial-h-subtitle">仪表盘</div>
          <div class="spatial-h-cta">查看报表</div>
          <div class="spatial-h-link">设置</div>
        </div>
      `,
      after: null // Uses CSS class toggle
    },
    {
      id: 'whitespace',
      label: '呼吸感',
      caption: '拥挤局促 vs 舒展的间距',
      beforeClass: 'spatial-demo spatial-whitespace-before',
      afterClass: 'spatial-demo spatial-whitespace-after',
      before: `
        <div class="spatial-demo spatial-whitespace-before">
          <div class="spatial-ws-title">高级版</div>
          <div class="spatial-ws-price">$29/月</div>
          <div class="spatial-ws-features">不限项目数 • 优先支持 • 高级分析</div>
          <button class="spatial-ws-btn">立即升级</button>
        </div>
      `,
      after: null // Uses CSS class toggle
    }
  ]
};



