// UX Writing skill demos
export default {
  id: 'ux-writing',
  tabs: [
    {
      id: 'errors',
      label: '报错信息',
      caption: '技术黑话 vs 有人味、可操作的指引',
      before: `
        <div class="uxw-demo uxw-error-before">
          <div class="uxw-error-icon">⚠</div>
          <div class="uxw-error-title">错误 403</div>
          <div class="uxw-error-text">访问被拒绝。发生身份验证失败。</div>
        </div>
      `,
      after: `
        <div class="uxw-demo uxw-error-after">
          <div class="uxw-error-icon">🔐</div>
          <div class="uxw-error-title">你没有访问权限</div>
          <div class="uxw-error-text">你的会话可能已过期。请重新登录以继续。</div>
          <div class="uxw-error-action">重新登录 →</div>
        </div>
      `
    },
    {
      id: 'buttons',
      label: '按钮标签',
      caption: '含糊的标签 vs 清晰、具体的操作',
      before: `
        <div class="uxw-demo uxw-buttons-before">
          <div class="uxw-button-context">永久删除账号？</div>
          <div class="uxw-button-row">
            <button class="uxw-btn uxw-btn-primary">提交</button>
            <button class="uxw-btn uxw-btn-secondary">取消</button>
          </div>
        </div>
      `,
      after: `
        <div class="uxw-demo uxw-buttons-after">
          <div class="uxw-button-context">永久删除账号？</div>
          <div class="uxw-button-row">
            <button class="uxw-btn uxw-btn-danger">删除我的账号</button>
            <button class="uxw-btn uxw-btn-secondary">保留账号</button>
          </div>
        </div>
      `
    },
    {
      id: 'empty',
      label: '空状态',
      caption: '一片空白 vs 有帮助、有引导的提示',
      before: `
        <div class="uxw-demo uxw-empty-before">
          <div class="uxw-empty-icon">📁</div>
          <div class="uxw-empty-title">暂无内容</div>
        </div>
      `,
      after: `
        <div class="uxw-demo uxw-empty-after">
          <div class="uxw-empty-icon">📝</div>
          <div class="uxw-empty-title">还没有项目</div>
          <div class="uxw-empty-text">创建你的第一个项目，开始上手。</div>
          <div class="uxw-empty-action"><button class="uxw-btn uxw-btn-primary">创建项目</button></div>
        </div>
      `
    }
  ]
};



