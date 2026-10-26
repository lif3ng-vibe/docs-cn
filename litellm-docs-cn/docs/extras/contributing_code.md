# 贡献代码

## 提交 PR 前的检查清单

以下是向 LiteLLM 提交任何 PR 都需要满足的核心要求：

- [ ] 签署[贡献者许可协议（CLA）](#贡献者许可协议cla)
- [ ] 尽量让改动范围保持独立，一次只解决**一个具体问题**
- [ ] 遵循[提交与分支规范](#提交与分支规范)；PR 标题由 CI 强制校验

### 代理（后端）类 PR

- [ ] 补充测试。**至少 1 个测试是硬性要求**（[详情](#2-添加测试)）
- [ ] 确保你的 PR 通过以下检查：
  - [ ] [单元测试](#3-运行单元测试)：`make test-unit`
  - [ ] [格式化 / Lint 检查](#4-运行-lint-检查)：`make lint`

### UI 类 PR

- [ ] 确保 UI 构建成功：`npm run build`
- [ ] 确保 UI 单元测试全部通过：`npm run test`
- [ ] 如果新增**组件**或**逻辑**，请补充对应测试

## 贡献者许可协议（CLA）

在向 LiteLLM 贡献代码之前，你必须签署我们的[贡献者许可协议（Contributor License Agreement，CLA）](https://cla-assistant.io/BerriAI/litellm)。这是所有贡献合入主仓库的法律前提。CLA 明确界定了你的贡献所依据的条款，对你和项目双方都是一种保护。

**重要提示**：我们强烈建议你在开始动手之前**先**签署 CLA，以免拖慢评审进度。签署入口见[这里](https://cla-assistant.io/BerriAI/litellm)。

---

## 提交与分支规范

LiteLLM 强制执行两项社区规范：

- **提交**遵循 [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)：`<type>(<scope>)!: <description>`
- **分支**遵循 [Conventional Branches](https://conventional-branch.github.io/)：`<type>/<description>`

强制机制体现在两处：`.githooks/` 下自愿启用的本地 git 钩子，以及针对 PR 标题的必过 CI 检查（因为 squash 合并会把 PR 标题用作提交主题）。

### 提交信息格式

```
<type>(<optional scope>)!: <description>

<optional body>

<optional footer>
```

- `<type>` 取以下值之一：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`、`revert`。
- `<scope>` 可选，须为小写。
- `:` 前的 `!` 表示破坏性变更（breaking change）。
- `<description>` 必填，且**必须以小写字母开头**（用数字和符号也可以；只有 `A–Z` 会被拒绝）。

示例：

```text keep-python-version
feat(router): add weighted round-robin strategy
fix(bedrock): decouple STS region from aws_region_name
chore(deps): bump ruff to 0.15.0
refactor!: drop Python 3.8 support
```

PR 标题也必须遵循同一格式：squash 合并会把 PR 标题用作提交主题，而 **Conventional PR Title** 工作流会对其进行校验。

### 分支命名

格式为 `<type>/<short-description>`，其中 `<type>` 取 `feature`、`bugfix`、`hotfix`、`release`、`chore` 之一。

```
feature/weighted-round-robin
bugfix/streaming-empty-chunks
chore/bump-ruff
hotfix/auth-bypass
release/v1.45.0
```

以下分支始终放行（`pre-push` 钩子会跳过它们）：

- `main`
- `litellm_internal_staging`
- `dependabot/*`
- `gh-readonly-queue/*`

标签推送与分支删除同样会被跳过。

### 安装钩子

钩子位于 `.githooks/`，默认不启用，每个克隆只需运行一次：

```shell
make install-hooks
```

这条命令会把本地仓库的 `core.hooksPath` 设为 `.githooks`。之后：

- `git commit` 会运行 `commit-msg`，校验提交主题行。
- `git push` 会运行 `pre-push`，校验分支名。

在极少数紧急情况下，可以对单条命令绕过任一钩子：

```shell
git commit --no-verify -m "..."
git push   --no-verify
```

卸载方法：`git config --unset core.hooksPath`。

---

## 代理（后端）

### 1. 配置本地开发环境

第 1 步：克隆仓库

```shell
git clone https://github.com/BerriAI/litellm.git
```

第 2 步：安装开发依赖

```shell
uv sync --group dev --extra proxy
```

### 2. 添加测试

- 把你的测试放进 [`tests/test_litellm/` 目录](https://github.com/BerriAI/litellm/tree/main/tests/litellm)。
- 该目录与 `litellm/` 目录一一对应，且**只**应包含 mock 测试。
- **不要**在这个目录里发起真实的 LLM API 调用。

#### `tests/test_litellm/` 的文件命名规则

测试目录沿用了与 `litellm/` 一致的结构：

- `test_{filename}.py` 对应 `litellm/{filename}.py`
- `litellm/proxy/test_caching_routes.py` 对应 `litellm/proxy/caching_routes.py`

### 3. 运行单元测试

在 `litellm` 目录的根下运行以下命令：

```shell
make test-unit
```

### 4. 运行 Lint 检查

在 `litellm` 目录的根下运行以下命令：

```shell
make lint
```

LiteLLM 使用 `basedpyright` 做类型检查。CI 还会运行 `ruff format --check` 检查格式；本地可运行 `make format` 修复格式问题。

### 5. 提交 PR

- 把改动推送到你在 GitHub 上的 fork
- 从你的 fork 发起 Pull Request

---

## UI

### 1. 配置本地开发环境

第 1 步：克隆仓库

```shell
git clone https://github.com/BerriAI/litellm.git
```

第 2 步：进入 UI 仪表板目录

```shell
cd ui/litellm-dashboard
```

第 3 步：安装依赖

```shell
npm install
```

第 4 步：启动开发服务器

```shell
npm run dev
```

### 2. 添加测试

如果新增了**组件**或**逻辑**，必须补充对应的测试。

### 3. 运行 UI 单元测试

```shell
npm run test
```

### 4. 构建 UI

提交 PR 前，请确保 UI 能构建成功：

```shell
npm run build
```

### 5. 提交 PR

- 把改动推送到你在 GitHub 上的 fork
- 从你的 fork 发起 Pull Request

---

## 进阶

### 构建 LiteLLM Docker 镜像

如果你想自行构建并运行 LiteLLM 的 Docker 镜像，请按以下说明操作。

第 1 步：克隆仓库

```shell
git clone https://github.com/BerriAI/litellm.git
```

第 2 步：构建 Docker 镜像

使用 `Dockerfile.non_root` 构建：

```shell
docker build -f docker/Dockerfile.non_root -t litellm_test_image .
```

第 3 步：运行 Docker 镜像

确保根目录下存在 `config.yaml`，这是你的 LiteLLM 代理配置文件。

```shell
docker run \
    -v $(pwd)/proxy_config.yaml:/app/config.yaml \
    -e DATABASE_URL="postgresql://xxxxxxxx" \
    -e LITELLM_MASTER_KEY="sk-<paste-a-long-random-key>" \
    -p 4000:4000 \
    litellm_test_image \
    --config /app/config.yaml --detailed_debug
```

### 本地运行 LiteLLM 代理

1. 进入 `proxy/` 目录：

```shell
cd litellm/litellm/proxy
```

2. 运行代理：

```shell
python3 proxy_cli.py --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```
