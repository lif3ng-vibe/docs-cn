---
title: '多智能体工作流：落地页冲刺（sprint）'
---

# 多智能体工作流：落地页冲刺（sprint）

> 用 4 个智能体在一天内交付一个转化优化的落地页。

## 场景

你要为一个新产品发布做落地页。它要好看、能转化访客，并且当天就要上线。

## 智能体团队

| 智能体 | 在本工作流中的职责 |
|-------|---------------------|
| Content Creator | 撰写文案 |
| UI Designer | 设计布局与组件规范 |
| Frontend Developer | 实现页面 |
| Growth Hacker | 优化转化 |

## 工作流

### 上午：文案 + 设计（并行）

**步骤 1a——激活 Content Creator**

```
Activate Content Creator.

Write landing page copy for "FlowSync" — an API integration platform
that connects any two SaaS tools in under 5 minutes.

Target audience: developers and technical PMs at mid-size companies.
Tone: confident, concise, slightly playful.

Sections needed:
1. Hero (headline + subheadline + CTA)
2. Problem statement (3 pain points)
3. How it works (3 steps)
4. Social proof (placeholder testimonial format)
5. Pricing (3 tiers: Free, Pro, Enterprise)
6. Final CTA

Keep it scannable. No fluff.
```

**步骤 1b——同时激活 UI Designer（并行）**

```
Activate UI Designer.

Design specs for a SaaS landing page. Product: FlowSync (API integration platform).
Style: clean, modern, dark mode option. Think Linear or Vercel aesthetic.

Deliver:
1. Layout wireframe (section order + spacing)
2. Color palette (primary, secondary, accent, background)
3. Typography (font pairing, heading sizes, body size)
4. Component specs: hero section, feature cards, pricing table, CTA buttons
5. Responsive breakpoints (mobile, tablet, desktop)
```

### 中午：实现

**步骤 2——激活 Frontend Developer**

```
Activate Frontend Developer.

Build a landing page from these specs:

Copy: [paste Content Creator output]
Design: [paste UI Designer output]

Stack: HTML, Tailwind CSS, minimal vanilla JS (no framework needed).
Requirements:
- Responsive (mobile-first)
- Fast (no heavy assets, system fonts OK)
- Accessible (proper headings, alt text, focus states)
- Include a working email signup form (action URL: /api/subscribe)

Deliver a single index.html file ready to deploy.
```

### 下午：优化

**步骤 3——激活 Growth Hacker**

```
Activate Growth Hacker.

Review this landing page for conversion optimization:

[paste the HTML or describe the current page]

Evaluate:
1. Is the CTA above the fold?
2. Is the value proposition clear in under 5 seconds?
3. Any friction in the signup flow?
4. What A/B tests would you run first?
5. SEO basics: meta tags, OG tags, structured data

Give me specific changes, not general advice.
```

## 时间线

| 时间 | 事项 | 智能体 |
|------|----------|-------|
| 9:00 | 文案 + 设计同时启动（并行） | Content Creator + UI Designer |
| 11:00 | 开始实现 | Frontend Developer |
| 14:00 | 第一版就绪 | — |
| 14:30 | 转化评审 | Growth Hacker |
| 15:30 | 落实反馈 | Frontend Developer |
| 16:30 | 上线 | 部署到 Vercel/Netlify |

## 关键模式

1. **并行启动**：文案和设计互不依赖，同时开工
2. **汇合点**：Frontend Developer 必须等两边的产出齐了再动工
3. **反馈循环**：Growth Hacker 评审，Frontend Developer 落实修改
4. **时间盒**：每一步都有明确的时间盒，防止范围蔓延