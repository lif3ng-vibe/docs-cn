// Responsive Design skill demos
export default {
  id: 'responsive-design',
  tabs: [
    {
      id: 'touch',
      label: '触控目标',
      caption: '小到难点中 vs 无障碍的触控区域',
      hasToggle: false, // Static comparison
      before: `
        <div class="resp-demo resp-touch-demo">
          <div class="resp-touch-row">
            <span class="resp-label">太小</span>
            <div class="resp-touch-targets resp-touch-bad">
              <button>×</button>
              <button>−</button>
              <button>+</button>
            </div>
          </div>
          <div class="resp-touch-row">
            <span class="resp-label">无障碍</span>
            <div class="resp-touch-targets resp-touch-good">
              <button>×</button>
              <button>−</button>
              <button>+</button>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'fluid',
      label: '流式布局',
      caption: '固定宽度摔坏 vs 流式自适应',
      hasToggle: false, // Static comparison
      before: `
        <div class="resp-demo resp-fluid-demo">
          <div class="resp-fluid-container">
            <div class="resp-fluid-fixed">
              <span>固定 400px</span>
              <div class="resp-fluid-bar" style="width: 400px; max-width: 100%;"></div>
            </div>
            <div class="resp-fluid-adaptive">
              <span>流式 80%</span>
              <div class="resp-fluid-bar" style="width: 80%;"></div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'adapt',
      label: '自适应内容',
      caption: '同一套布局 vs 按场景优化',
      hasToggle: false, // Static comparison
      before: `
        <div class="resp-demo resp-adapt-demo">
          <div class="resp-device resp-device-mobile">
            <div class="resp-device-screen">
              <div class="resp-block resp-header"></div>
              <div class="resp-block resp-content"></div>
            </div>
            <span>手机</span>
          </div>
          <div class="resp-device resp-device-tablet">
            <div class="resp-device-screen">
              <div class="resp-block resp-header"></div>
              <div class="resp-block-row">
                <div class="resp-block resp-content"></div>
                <div class="resp-block resp-content"></div>
              </div>
            </div>
            <span>平板</span>
          </div>
          <div class="resp-device resp-device-desktop">
            <div class="resp-device-screen">
              <div class="resp-block-row">
                <div class="resp-block resp-sidebar"></div>
                <div class="resp-block resp-content"></div>
              </div>
            </div>
            <span>桌面</span>
          </div>
        </div>
      `
    }
  ]
};



