---
title: '⚙️ 第 2 阶段 playbook——奠基与脚手架'
---

> **周期**：3-5 天 | **智能体**：6 个 | **守门人**：DevOps Automator + Evidence Collector

---

## 目标

构建后续所有工作都依赖的技术与运营地基。先让骨架立起来，再往上长肌肉。本阶段结束后，每个开发者都有可用的开发环境、可部署的流水线，以及一套可用来开发的设计系统。

## 前置条件

- [ ] 第 1 阶段质量关卡已通过（架构包获批准）
- [ ] 已收到第 1 阶段交接包
- [ ] 全部架构文档已定稿

## 智能体激活序列

### 工作流 A：基础设施（第 1-3 天，并行）

#### 🚀 DevOps Automator——CI/CD 流水线 + 基础设施
```
Activate DevOps Automator for infrastructure setup on [PROJECT].

Input: Backend Architect system architecture + deployment requirements
Deliverables required:
1. CI/CD Pipeline (GitHub Actions / GitLab CI)
   - Security scanning stage
   - Automated testing stage
   - Build and containerization stage
   - Deployment stage (blue-green or canary)
   - Automated rollback capability
2. Infrastructure as Code
   - Environment provisioning (dev, staging, production)
   - Container orchestration setup
   - Network and security configuration
3. Environment Configuration
   - Secrets management
   - Environment variable management
   - Multi-environment parity

Files to create:
- .github/workflows/ci-cd.yml (or equivalent)
- infrastructure/ (Terraform/CDK templates)
- docker-compose.yml
- Dockerfile(s)

Format: Working CI/CD pipeline with IaC templates
Timeline: 3 days
```

#### 🏗️ Infrastructure Maintainer——云基础设施 + 监控
```
Activate Infrastructure Maintainer for monitoring setup on [PROJECT].

Input: DevOps Automator infrastructure + Backend Architect architecture
Deliverables required:
1. Cloud Resource Provisioning
   - Compute, storage, networking resources
   - Auto-scaling configuration
   - Load balancer setup
2. Monitoring Stack
   - Application metrics (Prometheus/DataDog)
   - Infrastructure metrics
   - Custom dashboards (Grafana)
3. Logging and Alerting
   - Centralized log aggregation
   - Alert rules for critical thresholds
   - On-call notification setup
4. Security Hardening
   - Firewall rules
   - SSL/TLS configuration
   - Access control policies

Format: Infrastructure Readiness Report with dashboard access
Timeline: 3 days
```

#### ⚙️ Studio Operations——流程搭建
```
Activate Studio Operations for process setup on [PROJECT].

Input: Sprint Prioritizer plan + Project Shepherd coordination needs
Deliverables required:
1. Git Workflow
   - Branch strategy (GitFlow / trunk-based)
   - PR review process
   - Merge policies
2. Communication Channels
   - Team channels setup
   - Notification routing
   - Status update cadence
3. Documentation Templates
   - PR template
   - Issue template
   - Decision log template
4. Collaboration Tools
   - Project board setup
   - Sprint tracking configuration

Format: Operations Playbook
Timeline: 2 days
```

### 工作流 B：应用奠基（第 1-4 天，并行）

#### 🎨 Frontend Developer——项目脚手架 + 组件库
```
Activate Frontend Developer for project scaffolding on [PROJECT].

Input: UX Architect CSS Design System + Brand Guardian identity
Deliverables required:
1. Project Scaffolding
   - Framework setup (React/Vue/Angular per architecture)
   - TypeScript configuration
   - Build tooling (Vite/Webpack/Next.js)
   - Testing framework (Jest/Vitest + Testing Library)
2. Design System Implementation
   - CSS design tokens from UX Architect
   - Base component library (Button, Input, Card, Layout)
   - Theme system (light/dark/system toggle)
   - Responsive utilities
3. Application Shell
   - Routing setup
   - Layout components (Header, Footer, Sidebar)
   - Error boundary implementation
   - Loading states

Files to create:
- src/ (application source)
- src/components/ (component library)
- src/styles/ (design tokens)
- src/layouts/ (layout components)

Format: Working application skeleton with component library
Timeline: 3 days
```

#### 🏗️ Backend Architect——数据库 + API 奠基
```
Activate Backend Architect for API foundation on [PROJECT].

Input: System Architecture Specification + Database Schema Design
Deliverables required:
1. Database Setup
   - Schema deployment (migrations)
   - Index creation
   - Seed data for development
   - Connection pooling configuration
2. API Scaffold
   - Framework setup (Express/FastAPI/etc.)
   - Route structure matching architecture
   - Middleware stack (auth, validation, error handling, CORS)
   - Health check endpoints
3. Authentication System
   - Auth provider integration
   - JWT/session management
   - Role-based access control scaffold
4. Service Communication
   - API versioning setup
   - Request/response serialization
   - Error response standardization

Files to create:
- api/ or server/ (backend source)
- migrations/ (database migrations)
- docs/api-spec.yaml (OpenAPI specification)

Format: Working API scaffold with database and auth
Timeline: 4 days
```

#### 🏛️ UX Architect——CSS 体系实现
```
Activate UX Architect for CSS system implementation on [PROJECT].

Input: Brand Guardian identity + own Phase 1 CSS Design System spec
Deliverables required:
1. Design Tokens Implementation
   - CSS custom properties (colors, typography, spacing)
   - Brand color palette with semantic naming
   - Typography scale with responsive adjustments
2. Layout System
   - Container system (responsive breakpoints)
   - Grid patterns (2-col, 3-col, sidebar)
   - Flexbox utilities
3. Theme System
   - Light theme variables
   - Dark theme variables
   - System preference detection
   - Theme toggle component
   - Smooth transition between themes

Files to create/update:
- css/design-system.css (or equivalent in framework)
- css/layout.css
- css/components.css
- js/theme-manager.js

Format: Implemented CSS design system with theme toggle
Timeline: 2 days
```

## 验证检查点（第 4-5 天）

### Evidence Collector 验证
```
Activate Evidence Collector for Phase 2 foundation verification.

Verify the following with screenshot evidence:
1. CI/CD pipeline executes successfully (show pipeline logs)
2. Application skeleton loads in browser (desktop screenshot)
3. Application skeleton loads on mobile (mobile screenshot)
4. Theme toggle works (light + dark screenshots)
5. API health check responds (curl output)
6. Database is accessible (migration status)
7. Monitoring dashboards are active (dashboard screenshot)
8. Component library renders (component demo page)

Format: Evidence Package with screenshots
Verdict: PASS / FAIL with specific issues
```

## 质量关卡检查清单

| # | 标准 | 证据来源 | 状态 |
|---|-----------|----------------|--------|
| 1 | CI/CD 流水线可构建、测试并部署 | 流水线执行日志 | ☐ |
| 2 | 数据库 schema 已部署，含全部表/索引 | 迁移成功输出 | ☐ |
| 3 | API 脚手架健康检查有响应 | curl 响应证据 | ☐ |
| 4 | 前端骨架可在浏览器中渲染 | Evidence Collector 截图 | ☐ |
| 5 | 监控仪表盘已展示指标 | 仪表盘截图 | ☐ |
| 6 | 设计系统令牌已实现 | 组件库演示 | ☐ |
| 7 | 主题切换可用（浅色/深色/跟随系统） | 切换前后截图 | ☐ |
| 8 | Git 工作流与流程已成文 | Studio Operations playbook | ☐ |

## 关卡决策

**需要双重签署放行**：DevOps Automator（基础设施）+ Evidence Collector（视觉证据）

- **PASS**：可运行的骨架 + 完整 DevOps 流水线 → 激活第 3 阶段
- **FAIL**：个别基础设施或应用问题 → 修复后重新验证

## 向第 3 阶段交接

```markdown
## Phase 2 → Phase 3 Handoff Package

### For all Developer Agents:
- Working CI/CD pipeline (auto-deploys on merge)
- Design system tokens and component library
- API scaffold with auth and health checks
- Database with schema and seed data
- Git workflow and PR process

### For Evidence Collector (ongoing QA):
- Application URLs (dev, staging)
- Screenshot capture methodology
- Component library reference
- Brand guidelines for visual verification

### For Agents Orchestrator (Dev↔QA loop management):
- Sprint Prioritizer backlog (from Phase 1)
- Task list with acceptance criteria (from Phase 1)
- Agent assignment matrix (from NEXUS strategy)
- Quality thresholds for each task type

### Environment Access:
- Dev environment: [URL]
- Staging environment: [URL]
- Monitoring dashboard: [URL]
- CI/CD pipeline: [URL]
- API documentation: [URL]
```

---

*当骨架应用已在运行、CI/CD 流水线已可用、且 Evidence Collector 已用截图验证全部奠基要素时，第 2 阶段即告完成。*