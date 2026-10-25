// ============================================
// DEMO RENDERER - Generic rendering for command and skill demos
// ============================================

import { getCommandDemo } from './demos/commands/index.js';
import { getSkillDemo } from './demos/skills/index.js';

/**
 * Initialize a command demo's JS after its HTML has been inserted into the DOM.
 * Call this after innerHTML is set and split compare is initialized.
 */
export function initCommandDemo(commandId, container) {
  const demo = getCommandDemo(commandId);
  if (demo && typeof demo.init === 'function') {
    const demoArea = container.querySelector('.split-after .split-content') || container;
    console.log('[initCommandDemo]', commandId, 'demoArea:', demoArea);
    demo.init(demoArea);
  }
}

/**
 * Render a command demo with split-screen comparison
 */
export function renderCommandDemo(commandId) {
  const demo = getCommandDemo(commandId);

  if (!demo) {
    // impeccable has multiple modes — show a usage guide
    if (commandId === 'impeccable') {
      return `
        <div class="demo-container">
          <div class="demo-viewport" style="padding: var(--spacing-lg); font-size: 13px; line-height: 1.6;">
            <div style="display: flex; flex-direction: column; gap: 16px; color: var(--color-ash);">
              <div style="font-size: 14px; color: var(--color-text); font-weight: 600;">/impeccable 的三种用法</div>
              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <code style="font-size: 12px; color: var(--spread-accent, var(--color-accent)); font-weight: 600; white-space: nowrap;">/impeccable</code>
                    <span style="opacity: 0.4; font-size: 11px;">自由模式</span>
                  </div>
                  <span style="padding-left: 0; opacity: 0.8;">用于任何任务。把完整的设计智能、反模式与参考知识载入当前上下文。</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <code style="font-size: 12px; color: var(--spread-accent, var(--color-accent)); font-weight: 600; white-space: nowrap;">/impeccable init</code>
                    <span style="opacity: 0.4; font-size: 11px;">一次性配置</span>
                  </div>
                  <span style="padding-left: 0; opacity: 0.8;">扫描代码库，就品牌与受众访谈你，保存一份所有命令共用的设计上下文，配置 Live Mode，并告诉你接下来该跑什么。</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <code style="font-size: 12px; color: var(--spread-accent, var(--color-accent)); font-weight: 600; white-space: nowrap;">/impeccable craft</code>
                    <span style="opacity: 0.4; font-size: 11px;">构建功能</span>
                  </div>
                  <span style="padding-left: 0; opacity: 0.8;">先跑 /shape 规划 UX，载入对应的参考资料，然后一边构建一边视觉迭代，直到结果令人满意。</span>
                </div>
              </div>
              <div style="font-size: 12px; opacity: 0.5; margin-top: 2px; font-style: italic;">每个项目先跑一次 <code style="font-size: 11px;">/impeccable init</code>，其余模式按需使用。</div>
            </div>
          </div>
        </div>
      `;
    }
    // craft is the full end-to-end flow, show the four stages
    if (commandId === 'craft') {
      return `
        <div class="demo-container">
          <div class="demo-viewport" style="padding: var(--spacing-lg); font-size: 13px; line-height: 1.6;">
            <div style="display: flex; flex-direction: column; gap: 16px; color: var(--color-ash);">
              <div style="font-size: 14px; color: var(--color-text); font-weight: 600;">规划、查参考、构建、迭代</div>
              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">1. 规划</span>
                  </div>
                  <span style="opacity: 0.8;">内部运行 <code style="font-size: 11px;">/impeccable shape</code>，通过需求澄清问题形成设计简报。此阶段不写代码。</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">2. 查参考</span>
                  </div>
                  <span style="opacity: 0.8;">按简报所需，为这个功能载入对应的参考文件（空间设计、字体排印、动效、色彩）。</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">3. 构建</span>
                  </div>
                  <span style="opacity: 0.8;">实现结构、间距、字体、色彩、状态、动效与响应式。每个决定都能追溯回简报。</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">4. 视觉迭代</span>
                  </div>
                  <span style="opacity: 0.8;">在浏览器里打开结果，对照简报与反模式清单逐一检查，反复精修直到达到高打磨标准。</span>
                </div>
              </div>
              <div style="font-size: 12px; opacity: 0.5; margin-top: 2px; font-style: italic;">一条命令跑完先规划后编码的完整流程。最适合全新功能。</div>
            </div>
          </div>
        </div>
      `;
    }
    // init sets up the project's design context, show the flow
    if (commandId === 'init') {
      return `
        <div class="demo-container">
          <div class="demo-viewport" style="padding: var(--spacing-lg); font-size: 13px; line-height: 1.6;">
            <div style="display: flex; flex-direction: column; gap: 16px; color: var(--color-ash);">
              <div style="font-size: 14px; color: var(--color-text); font-weight: 600;">一次性项目配置</div>
              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">1. 探索</span>
                  </div>
                  <span style="opacity: 0.8;">扫描代码库里的品牌素材、既有设计令牌、字体排印、组件与文档。</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">2. 访谈</span>
                  </div>
                  <span style="opacity: 0.8;">询问受众、品牌个性、审美方向与无障碍需求。能从代码推断的一律跳过。</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">3. 配置</span>
                  </div>
                  <span style="opacity: 0.8;">把用户、品牌与设计原则写进 <code style="font-size: 11px;">PRODUCT.md</code>，按需生成 <code style="font-size: 11px;">DESIGN.md</code> 视觉规范，并配好 Live Mode，开箱即用。</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">4. 建议</span>
                  </div>
                  <span style="opacity: 0.8;">根据扫描结果，推荐接下来最值得运行的命令。不用再猜从哪儿开始。</span>
                </div>
              </div>
              <div style="font-size: 12px; opacity: 0.5; margin-top: 2px; font-style: italic;">每个项目跑一次即可，然后忘掉它的存在。</div>
            </div>
          </div>
        </div>
      `;
    }
    // shape is a planning skill — show the process
    if (commandId === 'shape') {
      return `
        <div class="demo-container">
          <div class="demo-viewport" style="padding: var(--spacing-lg); font-size: 13px; line-height: 1.6;">
            <div style="display: flex; flex-direction: column; gap: 16px; color: var(--color-ash);">
              <div style="font-size: 14px; color: var(--color-text); font-weight: 600;">先设计，再动手</div>
              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">1. 需求澄清</span>
                  </div>
                  <span style="opacity: 0.8;">就目的、受众、内容、约束与反面目标访谈你，并根据你的回答调整问题。</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">2. 设计简报</span>
                  </div>
                  <span style="opacity: 0.8;">综合出一份九节简报：功能摘要、主要操作、设计方向、布局策略、关键状态、交互模型、内容需求、推荐参考，以及待定问题。</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">3. 交接</span>
                  </div>
                  <span style="opacity: 0.8;">确认后的简报会指导 <code style="font-size: 11px;">/impeccable craft</code> 或任何其他实现方式。不写代码，只留下让代码变好的思考。</span>
                </div>
              </div>
              <div style="font-size: 12px; opacity: 0.5; margin-top: 2px; font-style: italic;">可单独使用，也可作为 <code style="font-size: 11px;">/impeccable craft</code> 的第一步。</div>
            </div>
          </div>
        </div>
      `;
    }
    return `
      <div class="demo-container">
        <div class="demo-viewport">
          <div class="demo-placeholder">
            /${commandId} 的可视化演示即将上线
          </div>
        </div>
      </div>
    `;
  }

  // Use split-screen comparison
  return `
    <div class="demo-split-comparison" data-demo="command-${demo.id}">
      <div class="split-container">
        <div class="split-before">
          <div class="split-content">${demo.before}</div>
        </div>
        <div class="split-after">
          <div class="split-content">${demo.after || demo.before}</div>
        </div>
        <div class="split-divider"></div>
      </div>
      <div class="demo-caption">${demo.caption}</div>
    </div>
  `;
}

/**
 * Render a skill demo (with tabs if multiple demos)
 */
export function renderSkillDemo(skillId) {
  const skill = getSkillDemo(skillId);

  if (!skill || !skill.tabs || skill.tabs.length === 0) {
    return `
      <div class="demo-container">
        <div class="demo-viewport">
          <div style="text-align: center; color: var(--color-ash); padding: var(--spacing-xl);">
            <p>${skillId.replace(/-/g, ' ')} 的演示即将上线</p>
          </div>
        </div>
      </div>
    `;
  }

  const showTabs = skill.tabs.length > 1;

  const tabs = showTabs ? skill.tabs.map((tab, i) => `
    <button class="demo-tab ${i === 0 ? 'active' : ''}" data-demo-tab="${tab.id}" data-skill="${skillId}">
      ${tab.label}
    </button>
  `).join('') : '';

  const panels = skill.tabs.map((tab, i) => `
    <div class="demo-panel ${i === 0 ? 'active' : ''}" data-demo-panel="${tab.id}">
      ${renderSkillTabDemo(skillId, tab)}
    </div>
  `).join('');

  return `
    <div class="demo-tabbed-container">
      ${showTabs ? `<div class="demo-tabs">${tabs}</div>` : ''}
      <div class="demo-panels">
        ${panels}
      </div>
    </div>
  `;
}

/**
 * Render a single skill tab demo
 */
function renderSkillTabDemo(skillId, tab) {
  const hasToggle = tab.hasToggle !== false;
  const demoId = `${skillId}-${tab.id}`;

  return `
    <div class="demo-container">
      <div class="demo-header">
        ${hasToggle ? `
          <div class="demo-toggle">
            <span class="demo-toggle-label active" id="${demoId}-before-label">改前</span>
            <button class="demo-toggle-switch" data-demo="${demoId}" role="switch" aria-checked="false" aria-labelledby="${demoId}-before-label ${demoId}-after-label"></button>
            <span class="demo-toggle-label" id="${demoId}-after-label">改后</span>
          </div>
        ` : ''}
      </div>
      <div class="demo-viewport" data-state="before" id="${demoId}-viewport">
        ${tab.before}
      </div>
      <div class="demo-caption">${tab.caption}</div>
    </div>
  `;
}

/**
 * Setup demo tab switching
 */
export function setupDemoTabs() {
  document.querySelectorAll('.demo-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.demoTab;
      const container = tab.closest('.demo-tabbed-container');

      container.querySelectorAll('.demo-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      container.querySelectorAll('.demo-panel').forEach(p => p.classList.remove('active'));
      container.querySelector(`[data-demo-panel="${tabId}"]`)?.classList.add('active');
    });
  });
}


