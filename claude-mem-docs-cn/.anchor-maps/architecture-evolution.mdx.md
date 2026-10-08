# architecture-evolution.mdx 锚点映射

原英文标题 | 中文标题 | 新锚点（github-slugger 规则）

# Architecture Evolution | 架构演进 | 架构演进

## The Problem We Solved | 我们解决的问题 | 我们解决的问题

## v5.x: Maturity and User Experience | v5.x：成熟度与用户体验 | v5x成熟度与用户体验

### v5.1.2: Theme Toggle (November 2025) | v5.1.2：主题切换（2025 年 11 月） | v512主题切换2025-年-11-月

### v5.1.1: Worker Startup Fix (November 2025) - Now Deprecated | v5.1.1：worker 启动修复（2025 年 11 月，现已弃用） | v511worker-启动修复2025-年-11-月现已弃用

### v5.1.0: Web-Based Viewer UI (October 2025) | v5.1.0：网页端查看器 UI（2025 年 10 月） | v510网页端查看器-ui2025-年-10-月

### v5.0.3: Smart Install Caching (October 2025) | v5.0.3：智能安装缓存（2025 年 10 月） | v503智能安装缓存2025-年-10-月

### v5.0.2: Worker Health Checks (October 2025) | v5.0.2：worker 健康检查（2025 年 10 月） | v502worker-健康检查2025-年-10-月

### v5.0.1: Stability Improvements (October 2025) | v5.0.1：稳定性改进（2025 年 10 月） | v501稳定性改进2025-年-10-月

### v5.0.0: Hybrid Search Architecture (October 2025) | v5.0.0：混合检索架构（2025 年 10 月） | v500混合检索架构2025-年-10-月

## MCP Architecture Simplification (December 2025) | MCP 架构简化（2025 年 12 月） | mcp架构简化2025-年-12-月

### The Problem: Complex MCP Implementation | 问题：过于复杂的 MCP 实现 | 问题过于复杂的-mcp-实现

### The Solution: 3-Layer Workflow | 方案：三层工作流 | 方案三层工作流

### Migration: Skill-Based Search Removed | 迁移：移除基于 skill 的搜索 | 迁移移除基于-skill-的搜索

### Key Architectural Changes | 关键架构变更 | 关键架构变更

### Impact | 影响 | 影响

### Design Philosophy | 设计哲学 | 设计哲学

## v1-v2: The Naive Approach | v1-v2：朴素的做法 | v1-v2朴素的做法

### The First Attempt: Dump Everything | 第一次尝试：全量倾倒 | 第一次尝试全量倾倒

## v3: Smart Compression, Wrong Architecture | v3：聪明的压缩，错误的架构 | v3聪明的压缩错误的架构

### The Breakthrough: AI-Powered Compression | 突破：AI 驱动的压缩 | 突破ai-驱动的压缩

## The Key Realizations | 关键认识 | 关键认识

### Realization 1: Progressive Disclosure | 认识一：渐进式披露 | 认识一渐进式披露

### Realization 2: Session ID Chaos | 认识二：会话 ID 混乱 | 认识二会话-id-混乱

### Realization 3: Graceful vs Aggressive Cleanup | 认识三：优雅清理与激进清理 | 认识三优雅清理与激进清理

### Realization 4: One Session, Not Many | 认识四：一个会话，而非多个 | 认识四一个会话而非多个

## v4: The Architecture That Works | v4：真正跑通的架构 | v4真正跑通的架构

### The Core Design | 核心设计 | 核心设计

### The Five Hook Architecture | 五大 Hook 架构 | 五大-hook-架构

### Database Schema Evolution | 数据库 schema 演进 | 数据库-schema-演进

### Worker Service Redesign | worker 服务重设计 | worker-服务重设计

## Critical Fixes Along the Way | 一路上的关键修复 | 一路上的关键修复

### Fix 1: Context Injection Pollution (v4.3.1) | 修复 1：上下文注入污染（v4.3.1） | 修复-1上下文注入污染v431

### Fix 2: Double Shebang Issue (v4.3.1) | 修复 2：重复 shebang 问题（v4.3.1） | 修复-2重复-shebang-问题v431

### Fix 3: FTS5 Injection Vulnerability (v4.2.3) | 修复 3：FTS5 注入漏洞（v4.2.3） | 修复-3fts5-注入漏洞v423

### Fix 4: NOT NULL Constraint Violation (v4.2.8) | 修复 4：NOT NULL 约束冲突（v4.2.8） | 修复-4not-null-约束冲突v428

## Performance Improvements | 性能优化 | 性能优化

### Optimization 1: Prepared Statements | 优化 1：预编译语句 | 优化-1预编译语句

### Optimization 2: FTS5 Indexing | 优化 2：FTS5 索引 | 优化-2fts5-索引

### Optimization 3: Index Format Default | 优化 3：默认索引格式 | 优化-3默认索引格式

## What We Learned | 我们的收获 | 我们的收获

### Lesson 1: Context is Precious | 心得一：上下文很宝贵 | 心得一上下文很宝贵

### Lesson 2: Session State is Complicated | 心得二：会话状态很复杂 | 心得二会话状态很复杂

### Lesson 3: Graceful Beats Aggressive | 心得三：优雅胜过激进 | 心得三优雅胜过激进

### Lesson 4: AI is the Compressor | 心得四：AI 就是压缩器 | 心得四ai-就是压缩器

### Lesson 5: Progressive Everything | 心得五：一切渐进式 | 心得五一切渐进式

## The Road Ahead | 未来路线 | 未来路线

### Planned: Adaptive Index Size | 规划中：自适应索引大小 | 规划中自适应索引大小

### Planned: Relevance Scoring | 规划中：相关性评分 | 规划中相关性评分

### Planned: Multi-Project Context | 规划中：跨项目上下文 | 规划中跨项目上下文

### Planned: Collaborative Memory | 规划中：协作记忆 | 规划中协作记忆

## Migration Guide: v3 → v5 | 迁移指南：v3 → v5 | 迁移指南v3--v5

### Step 1: Backup Database | 第 1 步：备份数据库 | 第-1-步备份数据库

### Step 2: Update Plugin | 第 2 步：更新插件 | 第-2-步更新插件

### Step 3: Update Plugin | 第 3 步：更新插件 | 第-3-步更新插件

### Step 4: Test | 第 4 步：测试 | 第-4-步测试

### Step 5: Explore New Features | 第 5 步：体验新功能 | 第-5-步体验新功能

## Key Metrics | 关键指标 | 关键指标

### v3 Performance | v3 性能 | v3-性能

### v4 Performance | v4 性能 | v4-性能

### v5 Performance | v5 性能 | v5-性能

## Conclusion | 结语 | 结语

## Further Reading | 延伸阅读 | 延伸阅读

## 跨页锚点

本页内没有 `#锚点` 形式的页内链接，无需重算页内锚点。

指向其他页面的链接（原文均不含 `#锚点` 部分，路径原样保留）：

- [Progressive Disclosure](progressive-disclosure) → progressive-disclosure
- [Hooks Architecture](hooks-architecture) → hooks-architecture
- [Context Engineering](context-engineering) → context-engineering
- [Worker Service](/architecture/worker-service) → /architecture/worker-service