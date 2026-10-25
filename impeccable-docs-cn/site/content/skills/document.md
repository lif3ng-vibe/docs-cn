---
tagline: "生成一份符合规范的 DESIGN.md，记录你的视觉系统，让每个 AI 智能体都保持品牌一致。"
---

<div class="docs-viz-hero">
  <div class="docs-viz-file">
    <div class="docs-viz-file-header">
      <span class="docs-viz-file-name">DESIGN.md</span>
      <span class="docs-viz-file-status">Google Stitch 格式</span>
    </div>
    <div class="docs-viz-designmd-section">
      <div class="docs-viz-designmd-head">
        <span class="docs-viz-designmd-num">01</span>
        <span class="docs-viz-designmd-title">Overview</span>
      </div>
      <p class="docs-viz-designmd-note">创意北极星：<em>"The Editorial Sanctuary"</em>。安静的字体、慷慨的留白、一个坚决的强调色。</p>
    </div>
    <div class="docs-viz-designmd-section">
      <div class="docs-viz-designmd-head">
        <span class="docs-viz-designmd-num">02</span>
        <span class="docs-viz-designmd-title">Colors</span>
      </div>
      <div class="docs-viz-designmd-swatches" aria-hidden="true">
        <span class="docs-viz-designmd-swatch" style="background:#1a1a1a"></span>
        <span class="docs-viz-designmd-swatch" style="background:#f5f3ef"></span>
        <span class="docs-viz-designmd-swatch" style="background:oklch(60% 0.22 30)"></span>
        <span class="docs-viz-designmd-swatch" style="background:oklch(90% 0.02 30)"></span>
      </div>
    </div>
    <div class="docs-viz-designmd-section">
      <div class="docs-viz-designmd-head">
        <span class="docs-viz-designmd-num">03</span>
        <span class="docs-viz-designmd-title">Typography</span>
      </div>
      <div class="docs-viz-designmd-type">
        <span class="docs-viz-designmd-type-display">Aa</span>
        <span class="docs-viz-designmd-type-body">Cormorant Garamond &middot; Instrument Sans</span>
      </div>
    </div>
    <div class="docs-viz-designmd-section">
      <div class="docs-viz-designmd-head">
        <span class="docs-viz-designmd-num">04</span>
        <span class="docs-viz-designmd-title">Elevation</span>
      </div>
      <p class="docs-viz-designmd-note">默认扁平。阴影只在对状态作出响应时出现。</p>
    </div>
    <div class="docs-viz-designmd-section">
      <div class="docs-viz-designmd-head">
        <span class="docs-viz-designmd-num">05</span>
        <span class="docs-viz-designmd-title">Components</span>
      </div>
      <div class="docs-viz-designmd-comps" aria-hidden="true">
        <span class="docs-viz-designmd-btn">订阅</span>
        <span class="docs-viz-designmd-chip">筛选</span>
        <span class="docs-viz-designmd-card">卡片</span>
      </div>
    </div>
    <div class="docs-viz-designmd-section">
      <div class="docs-viz-designmd-head">
        <span class="docs-viz-designmd-num">06</span>
        <span class="docs-viz-designmd-title">Do's and Don'ts</span>
      </div>
      <div class="docs-viz-designmd-rules">
        <span class="docs-viz-designmd-do">中性色向强调色色相偏 tint。</span>
        <span class="docs-viz-designmd-dont">用渐变文字做强调。</span>
      </div>
    </div>
  </div>
  <p class="docs-viz-caption">六个章节是固定的：顺序固定、名称也固定。同时还会生成 <code>.impeccable/design.json</code>，作为机器可读的 sidecar 文件，供需要结构化设计元数据的工具使用。</p>
</div>

## 什么时候用

一旦视觉系统积累到值得记录的程度，就运行 `/impeccable document`：有颜色、有排版，至少有一个按钮和一张卡片。该命令扫描你的代码库，提取找到的令牌与组件模式，并在项目根目录写一份遵循 [Google Stitch DESIGN.md 格式](https://stitch.withgoogle.com/docs/design-md/overview/)的 `DESIGN.md`——六个章节、固定顺序，与所有识别 DESIGN.md 的工具互通。

在这些时候用它：

- **你刚跑完 `/impeccable init`**，`PRODUCT.md` 已经就位。document 就是与之配套的视觉侧文件。
- **有命令提醒你去生成**。Live、craft 和 polish 都会读 DESIGN.md。如果文件缺失，技能会建议先跑 document。
- **设计已经漂移**，旧 DESIGN.md 不再描述当前实际运行的系统。
- **大型重设计之前**，记录当前状态，作为下一个方向的参照。

对还没有代码的项目（刚跑完 `init`，什么都没建），有一种种子模式：`/impeccable document --seed` 问五个快速的战略问题（颜色策略、字体方向、动效风格、参照对象、反面参照），然后写出一个脚手架。有了代码之后，用扫描模式重跑一次。

## 工作原理

扫描轮按优先级寻找设计资产：CSS 自定义属性、Tailwind 配置、CSS-in-JS 主题、设计令牌文件、组件源码、全局样式表，最后是浏览器可用时从真实渲染输出中取到的计算样式。它能自动提取的都自动提取，然后对需要创意输入的部分提出一组归类的问题：**创意北极星**（Creative North Star，为整个系统起一个具名的隐喻，比如 "The Editorial Sanctuary"）、描述性颜色名、海拔哲学，以及组件性格。

输出的 DESIGN.md 恰好六个章节：Overview、Colors、Typography、Elevation、Components、Do's and Don'ts。章节标题逐字符固定，保证文件能被其他工具解析。同时写出 `.impeccable/design.json` 作为机器可读的 sidecar。它让 Live Mode 和设计感知的检测规则能结构化地访问本项目的实际调色板、字体、圆角、组件片段和叙事。

其他所有命令在调用时都会读取 DESIGN.md。变体、打磨、审计和新功能无需叮嘱就能继承视觉系统。DESIGN.md 与 PRODUCT.md 和 `.impeccable/design.json` 的关系见[设计上下文](/docs-cn/impeccable/docs/context))。

## 试一试

```
/impeccable document
```

在已定义令牌的项目上，这大约花两分钟：扫描找到你的调色板和字体栈，你从 2 到 3 个选项里挑一个北极星，确认描述性颜色名（"Deep Muted Teal-Navy"，而不是 "blue-800"），文件就落在项目根目录。

在全新项目上：

```
/impeccable document --seed
```

五个问题，大约五分钟。文件是一个脚手架，带有 `<!-- SEED -->` 注释标记，如实说明自己的身份。等你实现令牌之后，去掉该参数重跑。

## 常见陷阱

- **跑得太早**。在没有已实现令牌的项目上，种子模式才是正解。不要编造代码撑不起的完整规范。假的 DESIGN.md 比没有 DESIGN.md 更糟。
- **把 DESIGN.md 只当成人读的文档**。它首先是写给 AI 的。其他所有命令都会读它。这种格式强硬的措辞（"never"、"always"、具名规则）是有意为之。
- **添加 Layout / Motion / Responsive 顶层章节**。规范只有六个章节，顺序固定、名称固定。把布局或动效内容并入 Overview（哲学级规则）或 Components（逐组件行为）。
- **悄悄覆盖已有的 DESIGN.md**。document 总是先确认。如果你想推倒重来，先把现有文件改名挪开，或者明确告诉技能允许覆盖。
