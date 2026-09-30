---
title: "RigBundle 参考"
---

版本：2（支持工作舱）
最后对照代码验证：2026-09-29（仅安装路径与 `--target`；其余章节最后核对于 2026-04-11）
事实来源：`packages/daemon/src/domain/bundle-types.ts`、`packages/daemon/src/domain/bundle-archive.ts`、`packages/daemon/src/domain/pod-bundle-assembler.ts`

`.rigbundle` 是一种自包含的可分发归档，它把 rig spec、所有被引用的 agent spec 及其资源（skills、guidance、启动文件）、文化文件、文档和一个完整性清单打包进单个文件。接收方无需原始源码树即可安装并启动该 rig。

---

## 归档格式

`.rigbundle` 文件是一个结构固定的 gzip 压缩 tar 归档（`.tar.gz`）。

### 文件扩展名

归档**必须**使用 `.rigbundle` 扩展名。打包器会拒绝不以 `.rigbundle` 结尾的输出路径。

### 伴生摘要文件

每个 `.rigbundle` 都有一个伴生的 `.rigbundle.sha256` 文件，包含归档的 SHA-256 十六进制摘要。它可以发现传输过程中的损坏。解包器在解压前会先校验这个摘要。

示例：
```
my-rig.rigbundle          — the archive
my-rig.rigbundle.sha256   — "a1b2c3d4..." (64-char hex SHA-256)
```

### 确定性

打包器的输出是确定性的：
- 文件按字母序排序
- 使用固定的 mtime（`2026-01-01T00:00:00Z`）
- 可移植模式会规范化 uid/gid/mode
- 最大 gzip 压缩（级别 9）

这意味着相同的输入总是产生相同的归档哈希。

---

## 归档布局

```
bundle.yaml                    — manifest (required)
rig.yaml                       — the RigSpec (required, may be rewritten)
CULTURE.md                     — culture file (if declared in rig spec)
SETUP.md                       — documentation (if declared in rig spec docs field)
agents/
  agent-name/
    agent.yaml                 — AgentSpec
    guidance/
      role.md                  — guidance files
    skills/
      skill-name/
        SKILL.md               — skill files
    startup/
      context.md               — startup files
```

### 关键规则

- `bundle.yaml` 是清单——始终存在，始终位于根目录
- `rig.yaml` 是 rig spec——组装时会将其中的 `agent_ref` 路径改写为随包收录（vendored）后的路径
- 各 agent 目录是原始 agent spec 及其全部资源的随包收录副本
- 导入引用会从原始的 `local:` 或 `path:` 路径改写为相对于 bundle 的 `local:` 路径
- 归档内所有文件路径都是安全相对路径（不允许 `..`，不允许绝对路径，不允许符号链接）

---

## 清单（`bundle.yaml`）

清单是归档根目录下的一个 YAML 文件，描述 bundle 的内容。

### Schema 版本 2（支持工作舱，当前版本）

```yaml
schema_version: 2
name: my-bundle
version: "0.1.0"
created_at: "2026-04-11T22:32:48.570Z"
rig_spec: rig.yaml
agents:
  - name: pm-lead
    version: "1.0"
    path: agents/pm-lead
    original_ref: "local:agents/pm-lead"
    hash: "ed4cff20..."
    import_entries: []
  - name: researcher
    version: "1.0"
    path: agents/researcher
    original_ref: "local:agents/researcher"
    hash: "11f8a077..."
    import_entries:
      - name: shared
        version: "1.0"
        path: agents/shared
        original_ref: "local:../../shared"
        hash: "abc123..."
culture_file: CULTURE.md
integrity:
  algorithm: sha256
  files:
    rig.yaml: "b80c0674..."
    CULTURE.md: "9354361b..."
    agents/pm-lead/agent.yaml: "ed4cff20..."
    # ... every file in the archive
```

### 清单字段

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `schema_version` | number | 是 | 支持工作舱的 bundle 必须为 `2`。 |
| `name` | string | 是 | bundle 名称。 |
| `version` | string | 是 | bundle 版本。 |
| `created_at` | string | 是 | 创建时间的 ISO-8601 时间戳。 |
| `rig_spec` | string | 是 | rig spec 在归档内的相对路径。安全相对路径。 |
| `agents` | AgentEntry[] | 是 | 随包收录的智能体条目数组。 |
| `culture_file` | string | 否 | 文化文件的相对路径（如存在）。 |
| `integrity` | Integrity | 否 | 用于内容校验的逐文件 SHA-256 校验和。 |

### 智能体条目字段

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `name` | string | 是 | 智能体名称（来自 agent.yaml）。 |
| `version` | string | 否 | 智能体版本。 |
| `path` | string | 是 | 随包收录的智能体目录的相对路径。安全相对路径。 |
| `original_ref` | string | 是 | 改写前的原始 `agent_ref`。 |
| `hash` | string | 是 | agent.yaml 内容的 SHA-256 哈希。 |
| `import_entries` | ImportEntry[] | 是 | 该智能体的随包收录导入项（可以为空）。 |

### 导入条目字段

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `name` | string | 是 | 被导入智能体的名称。 |
| `version` | string | 是 | 被导入智能体的版本。 |
| `path` | string | 是 | 随包收录的导入项在归档内的相对路径。 |
| `original_ref` | string | 是 | 改写前的原始导入引用。 |
| `hash` | string | 是 | 被导入 agent.yaml 的 SHA-256 哈希。 |

### 完整性部分

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `algorithm` | string | 是 | 必须为 `sha256`。 |
| `files` | map<string, string> | 是 | 归档内相对文件路径 → SHA-256 十六进制哈希的映射。归档中的每个文件（`bundle.yaml` 自身除外）都应列出。 |

---

## 安全模型

bundle 完整性提供的是**自一致性校验，而不是真实性认证**。

- 伴生的 `.sha256` 文件可以发现传输过程中的损坏
- 逐文件的完整性哈希可以发现归档内单个文件被篡改
- 两种机制都不能认证 bundle 作者

能够同时改写整个 bundle 与摘要的攻击者可以绕过校验。用户必须信任自己获取 bundle 的来源。这与未签名的 npm 包和 Docker 镜像的信任模型相同。

未来增强方向：用加密签名（Ed25519）做作者认证。

---

## 安全保障

解包器在解压前强制执行以下安全规则：

1. **不允许符号链接或硬链接**——`SymbolicLink` 与 `Link` 条目会被拒绝
2. **不允许绝对路径**——以 `/` 开头的条目会被拒绝
3. **不允许路径穿越**——包含 `..` 段的条目会被拒绝
4. **摘要校验**——归档 SHA-256 必须与伴生的 `.sha256` 文件一致
5. **内容完整性**——解压后，逐文件哈希会对照清单进行校验

任何一项检查失败，解压都会中止并抛出错误。

---

## CLI 命令面

### 路径

`rig bundle create`、`inspect` 与 `install` 会把你给出的每个路径（`<spec-path>`、`-o`、`--rig-root`、`<bundle-path>`、`--target`）先按**你的**当前目录解析为绝对路径，再发送请求。守护进程随后在**它自己的主机**上读写这些路径：不会有任何上传，因此这些文件必须已经存在于守护进程运行的地方。

### 创建 bundle

```bash
rig bundle create <spec-path> -o <output.rigbundle> [--rig-root <dir>] [--name <name>] [--bundle-version <ver>]
```

| 标志 | 必填 | 默认值 | 说明 |
|------|----------|---------|-------------|
| `<spec-path>` | 是 | — | rig spec YAML 文件的路径。 |
| `-o, --output` | 是 | — | 输出路径。必须以 `.rigbundle` 结尾。 |
| `--rig-root` | 否 | spec 所在目录 | 解析 `agent_ref` 及其他相对路径所用的根目录。 |
| `--name` | 否 | `my-bundle` | 清单中的 bundle 名称。 |
| `--bundle-version` | 否 | `0.1.0` | 清单中的 bundle 版本。 |

create 命令会：
1. 校验 rig spec
2. 解析所有 `agent_ref` 路径及其导入
3. 把所有 agent spec、资源与启动文件随包收录进一个暂存目录
4. 把 `agent_ref` 路径改写为相对于 bundle 的 `local:` 引用
5. 收集文化文件、文档文件与 rig 级启动文件
6. 计算逐文件完整性哈希
7. 写入清单（`bundle.yaml`）
8. 打包为确定性的 `.tar.gz`
9. 写入伴生的 `.sha256` 摘要

### 检查 bundle

```bash
rig bundle inspect <bundle-path> [--json]
```

展示清单、摘要有效性与完整性校验结果。inspect 会把归档解压到一个临时目录中做安全校验，然后清理该目录。它不安装、不启动任何东西。

### 安装 bundle

```bash
rig bundle install <bundle-path> [--plan] [--yes] [--target <root>] [--json]
```

| 标志 | 必填 | 默认值 | 说明 |
|------|----------|---------|-------------|
| `<bundle-path>` | 是 | — | `.rigbundle` 文件的路径。 |
| `--plan` | 否 | `false` | 预览而不安装、不启动。并非无副作用：它会运行预检（preflight）——执行各成员运行时的 `--version` 探测——并记录一次引导（bootstrap）运行。它不向目标写入任何内容。 |
| `--yes` | 否 | `false` | 在 apply 模式期间自动批准可信动作。 |
| `--target <root>` | apply 模式下必填 | — | bundle 安装到其中并从其启动的目录。除非使用 `--plan`，否则必填。 |
| `--json` | 否 | `false` | 输出机器可读的 JSON。 |

install 会**启动 rig**，而不只是解包。它把 bundle 解压到临时目录、校验完整性，然后引导启动 rig。在 apply 模式下，守护进程要求 `targetRoot`，因此除非使用 `--plan` 运行，`rig bundle install` 必须给出 `--target <root>`。

对支持工作舱（schema 版本 2）的 bundle，apply 会把解压出的内容（`bundle.yaml`、`rig.yaml`、`agents/`、文化与文档文件）复制进目标目录并从那里启动，然后删除临时解压目录。于是：

- 目标目录成为 rig 根目录：`agent_ref` 路径在其中解析，`cwd: "."`（或未设 `cwd`）的成员直接在目标目录中启动；
- 成员的绝对 `cwd` 保持原样，而 `rig up --cwd <dir>` 仍然会覆盖每个成员的 cwd；
- 如果目标目录在任一 bundle 路径上已存在内容**不同**的文件（例如它自己的 `rig.yaml`），install 会以 `target_conflict` 拒绝且不写入任何内容。内容完全相同的文件会被接受，因此把同一个 bundle 重装到同一目标目录是可行的。请使用空目录或专用目录作为目标。

旧式（schema 版本 1）bundle 保持原行为：`--target` 只是包的安装位置。

### 直接启动

```bash
rig up <bundle-path> [--target <root>] [--cwd <dir>]
```

`rig up` 会自动识别 `.rigbundle` 文件，并把它们路由到 bundle 引导启动路径。

- `--target <root>` 是上文所述的安装目标（对 schema 版本 2 的 bundle，就是 bundle 被复制进去并从其启动的目录）
- 对 `.rigbundle` 省略 `--target` 时，CLI 默认把安装目标设为当前工作目录，bundle 的文件就会写到那里
- `rig up` 与 `rig bundle install` 一样，会在发送前把相对的 `--target` 按你的当前目录解析；使用 `--host` 时，`--target` 按原样发送，且必须是该主机上存在的路径
- `--cwd <dir>` **不会**改变安装目标；它只覆盖该次运行中被启动成员的工作目录

---

## 组装流程

`rig bundle create` 运行时，`PodBundleAssembler` 会执行以下步骤：

1. **解析并校验** rig spec
2. **收集 rig 级文件**：
   - 文化文件（若设置了 `culture_file`）
   - 文档文件（若设置了 `docs` 数组）——**必填：缺少文档会导致组装失败**
   - rig 级启动文件
   - 工作舱级与成员级启动文件
3. **对每个成员的 `agent_ref`**：
   - 把引用解析到一个 agent spec 目录
   - 复制该 agent spec 及其全部资源（skills、guidance、hooks、startup、runtime resources）
   - 递归解析并复制导入
   - 把该智能体条目连同其哈希记录进清单
   - 把引用改写为相对于 bundle 的 `local:` 路径
4. **把改写后的 rig spec 写入**暂存目录
5. **计算完整性**——暂存目录中每个文件的 SHA-256
6. **写入清单**（`bundle.yaml`），包含全部条目与完整性信息
7. **打包**暂存目录为确定性的 tar.gz

### 终端节点

带 `agent_ref: "builtin:terminal"` 的成员是 bundle 原生的哨兵节点。它们不做随包收录——运行时直接处理它们。

### 去重

如果多个成员引用同一个 agent spec（解析后的路径相同），该 spec 只随包收录一次，所有成员的引用都会改写到同一个相对于 bundle 的路径。

### 导入解析

当 agent spec 带有 `imports` 时，每个导入都会被解析、随包收录进 bundle，随包收录后的 agent.yaml 中的导入引用会改写为相对于 bundle 的 `local:` 路径。导入条目会记录在清单的智能体条目中。

---

## 校验规则小结

### 清单校验（schema 版本 2）

1. `schema_version` 必须为 `2`
2. `name` 是必填的非空字符串
3. `version` 是必填的非空字符串
4. `created_at` 是必填的非空字符串
5. `rig_spec` 为必填，且必须是安全相对路径
6. `agents` 必须是数组
7. 每个智能体条目必须有 `name`、`path`（安全相对路径）与 `hash`
8. 完整性的 `algorithm` 必须为 `sha256`
9. 完整性的 `files` 必须是非空映射：安全相对路径 → 64 位十六进制哈希

### 归档安全（解包时强制）

1. 不允许符号链接或硬链接
2. 不允许绝对路径
3. 不允许 `..` 路径穿越
4. 归档摘要必须与伴生的 `.sha256` 一致
5. 逐文件内容哈希必须与完整性小节一致

### 组装校验

1. rig spec 必须能通过校验
2. 所有 `agent_ref` 路径都必须能解析到有效的 agent spec
3. 所有声明的 `docs` 文件都必须在磁盘上存在（缺少文档会导致组装失败）
4. 文化文件与启动文件按尽力而为的方式收集（缺失即跳过）

---

## 旧版 bundle（Schema 版本 1）

Schema 版本 1 的 bundle 是 reboot 之前的旧格式，使用扁平节点的 rig spec 与基于包的打包方式。出于向后兼容它们仍受支持，但不应为新的 rig 创建。

与 v2 的主要差异：
- 清单中 `schema_version: 1`
- 用 `packages` 数组而不是 `agents` 数组
- 包条目用 `original_source` 而不是 `original_ref`
- 包条目中没有 `import_entries`
- 旧式 rig spec 格式（扁平节点，而非工作舱）

---

## 示例：创建并使用 bundle

### 创建

```bash
# From the rig directory
rig bundle create rig.yaml -o my-team.rigbundle --rig-root . --name my-team --bundle-version 1.0.0
```

输出：
```
Bundle created: my-team.rigbundle
  Name: my-team v1.0.0
  Hash: a1b2c3d4e5f6...
```

### 检查

```bash
rig bundle inspect my-team.rigbundle
```

输出：
```
Bundle: my-team v1.0.0
Digest valid: true
Integrity: PASS
```

### 安装并启动

```bash
cd ~/projects/my-project
rig up /path/to/my-team.rigbundle
```

等价的显式形式：

```bash
rig up /path/to/my-team.rigbundle --target ~/projects/my-project
```

bundle 会先解压到临时目录并校验完整性。随后，schema 版本 2 的 bundle 会被复制进目标根目录（若目标在相同路径上存有不同文件则拒绝），并从那里启动 rig，带上 bundle 中的全部智能体与资源。如果你还想让这次运行中的智能体以别的工作目录启动，请另外传入 `--cwd <dir>`。
