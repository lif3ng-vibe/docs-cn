// Typography skill demos
export default {
  id: 'typography',
  tabs: [
    {
      id: 'pairing',
      label: '字体搭配',
      caption: '平庸的系统字体 vs 有辨识度的搭配',
      beforeClass: 'typo-demo typo-pairing-before',
      afterClass: 'typo-demo typo-pairing-after',
      before: `
        <div class="typo-demo typo-pairing-before">
          <div class="typo-heading">欢迎来到未来</div>
          <div class="typo-body">体验前所未有的创新，我们的前沿平台为现代团队而生。</div>
        </div>
      `,
      after: null // Uses CSS class toggle
    },
    {
      id: 'hierarchy',
      label: '字阶与层级',
      caption: '字号拉平 vs 戏剧性的字阶对比',
      beforeClass: 'typo-demo typo-hierarchy-before',
      afterClass: 'typo-demo typo-hierarchy-after',
      before: `
        <div class="typo-demo typo-hierarchy-before">
          <div class="typo-h1">文章标题</div>
          <div class="typo-meta">2025 年 1 月发布</div>
          <div class="typo-p">这是文章的正文，承载着主要的内容与观点。</div>
        </div>
      `,
      after: null // Uses CSS class toggle
    }
  ]
};



