# Docker 镜像安全指南

从 **v1.83.0** 起，LiteLLM 会使用 [cosign](https://docs.sigstore.dev/quickstart/quickstart-cosign/) 为发布到 GHCR 的每个 Docker 镜像签名。本页介绍如何验证签名、如何在 CI/CD 中强制校验，以及推荐的部署实践。

## 已签名的镜像

发布到 `ghcr.io/berriai/` 的所有镜像变体都用同一把 cosign 密钥签名：

| 镜像 | 说明 |
|---|---|
| `ghcr.io/berriai/litellm` | 核心代理镜像，包含用于 Postgres 的 Prisma 工具链 |
| `ghcr.io/berriai/litellm-non_root` | 非 root 变体 |
| `ghcr.io/berriai/litellm-spend_logs` | 花费日志 sidecar 镜像 |
| `ghcr.io/berriai/litellm-database` | `litellm` 的旧别名，为已有部署保留 |

:::note[`litellm-database` 是旧别名]
`ghcr.io/berriai/litellm-database` 曾是代理需要 Postgres 时的首选镜像，因为它捆绑了核心镜像所缺少的 Prisma 工具链。如今 `ghcr.io/berriai/litellm` 已内置同样的工具链、入口点和迁移脚本，两者之间不再有取舍的必要。`litellm-database` 仍在发布，并使用同一把密钥签名，固定使用它的部署照常工作，验证命令也完全相同。新部署请使用 `ghcr.io/berriai/litellm`；本页示例全程使用该镜像。
:::

签名密钥在 [commit `0112e53`](https://github.com/BerriAI/litellm/commit/0112e53046018d726492c814b3644b7d376029d0) 中引入，公钥存放在仓库的 [`cosign.pub`](https://github.com/BerriAI/litellm/blob/main/cosign.pub) 文件中。

:::info[企业版镜像]
企业版镜像（`litellm-ee`）遵循同样的签名流程。如需确认你所用的具体企业版镜像标签是否在内，请联系 [support@berri.ai](mailto:support@berri.ai)。
:::

## 验证镜像签名

按照[官方说明](https://docs.sigstore.dev/cosign/system_config/installation/)安装 cosign。

### 使用固定的 commit 哈希验证（推荐）

commit 哈希在密码学上不可篡改，因此这是最强的验证方式：

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/0112e53046018d726492c814b3644b7d376029d0/cosign.pub \
  ghcr.io/berriai/litellm:v1.89.4
```

将镜像引用换成任意已签名的变体即可：

```bash
# litellm-non_root
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/0112e53046018d726492c814b3644b7d376029d0/cosign.pub \
  ghcr.io/berriai/litellm-non_root:v1.89.4
```

### 使用 release 标签验证（便捷方式）

本仓库对标签做了保护，标签会解析到同一把密钥：

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/v1.89.4/cosign.pub \
  ghcr.io/berriai/litellm:v1.89.4
```

### 预期输出

```
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - The signatures were verified against the specified public key
```

## 在 CI/CD 中强制验证

### Kubernetes 上的 Sigstore Policy Controller

[Sigstore Policy Controller](https://docs.sigstore.dev/policy-controller/overview/) 会拒绝镜像未通过 cosign 验证的 Pod。

1. 安装控制器：

```bash
helm repo add sigstore https://sigstore.github.io/helm-charts
helm install policy-controller sigstore/policy-controller \
  -n cosign-system --create-namespace
```

2. 使用 LiteLLM 公钥创建一个 `ClusterImagePolicy`：

```yaml
apiVersion: policy.sigstore.dev/v1beta1
kind: ClusterImagePolicy
metadata:
  name: litellm-signed-images
spec:
  images:
    - glob: "ghcr.io/berriai/litellm*"
  authorities:
    - key:
        data: |
          -----BEGIN PUBLIC KEY-----
          MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEKi4ivqGpE231OGH50PKbqy1Y1Kkb
          POJC8+i2Wko82gBOUCe3M0Vw86H/4rhUhfoYEti4gdJ9wZbYmK0I2EE96g==
          -----END PUBLIC KEY-----
```

3. 给命名空间打标签以启用强制校验：

```bash
kubectl label namespace litellm policy.sigstore.dev/include=true
```

该命名空间中，任何使用未签名 `ghcr.io/berriai/litellm*` 镜像的 Pod 都会在准入阶段被拒绝。

### GCP 的 Binary Authorization

[Binary Authorization](https://cloud.google.com/binary-authorization/docs) 可以在 Cloud Run 和 GKE 上强制校验 cosign 签名。

1. 使用 LiteLLM 公钥创建基于 cosign 的证明者（attestor）：

```bash
# Import the public key into a Cloud KMS keyring or use a PGP/PKIX attestor.
# See: https://cloud.google.com/binary-authorization/docs/creating-attestors-console
```

2. 配置一条 Binary Authorization 策略，要求 `ghcr.io/berriai/litellm*` 镜像必须带有该证明者。

3. 在你的 Cloud Run 服务或 GKE 集群上启用该策略。

完整配置步骤参见 [GCP Binary Authorization 文档](https://cloud.google.com/binary-authorization/docs/setting-up)。

### AWS 的 ECS / ECR

AWS 在部署时不会原生校验 cosign 签名。常见做法：

- **CI/CD 门禁**：在部署流水线中运行 `cosign verify`，之后再推送到 ECR 或更新 ECS 任务定义；验证失败就让流水线失败。
- **EKS 上的 OPA/Gatekeeper**：如果运行在 EKS 上，请使用 Sigstore Policy Controller（与上文 Kubernetes 方案相同）。

### GitHub Actions 门禁

在所有部署 job 之前加一个验证步骤：

```yaml
- name: Verify LiteLLM image signature
  run: |
    cosign verify \
      --key https://raw.githubusercontent.com/BerriAI/litellm/0112e53046018d726492c814b3644b7d376029d0/cosign.pub \
      ghcr.io/berriai/litellm:${{ env.LITELLM_VERSION }}
```

## 推荐的部署实践

### 按 digest 固定

按 digest 固定镜像可以保证内容完全一致，不受标签变动影响：

```yaml
image: ghcr.io/berriai/litellm@sha256:<digest>
```

拉取之后这样获取 digest：

```bash
docker inspect --format='{{index .RepoDigests 0}}' \
  ghcr.io/berriai/litellm:v1.89.4
```

cosign 验证同样支持 digest：

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/0112e53046018d726492c814b3644b7d376029d0/cosign.pub \
  ghcr.io/berriai/litellm@sha256:<digest>
```

### 使用稳定的 release 标签

如果按 digest 固定对你的工作流来说过于死板，可以直接使用 semver / PEP 440 格式的 release 标签（如 `v1.86.2`）。这些是不可变的发布标签，不会被覆盖。

:::warning[`main-stable` 和 `main-latest` 已弃用]

LiteLLM 已改用 PEP 440 / semver 版本方案，稳定版现在以普通的 `vX.Y.Z` 标签（如 `v1.86.2`）发布，不再使用旧的 `vX.Y.Z-stable` 形式。滚动标签 `main-stable` 为兼容旧用法仍在更新，但已弃用，请改为固定到具体的 `vX.Y.Z` 标签（或 digest）。滚动标签 `main-latest` 已弃用且不再更新，请改用 `latest`。
:::

生产环境请避免使用 `latest`。这个滚动标签指向最近一次构建，两次部署之间可能发生变化。

### 安全升级清单

1. **验证新镜像**——对新 release 标签或 digest 运行 `cosign verify`。
2. **在预发环境测试**——把验证过的镜像部署到非生产环境。
3. **更新固定引用**——修改部署清单中的 digest 或标签。
4. **部署到生产**——按常规部署流程上线。
5. **监控 `/health`**——确认升级后代理运行正常。

## 延伸阅读

- [CI/CD v2 公告](https://docs.litellm.ai/blog/ci-cd-v2-improvements)——LiteLLM 签名基础设施的背景介绍
- [Docker 部署指南](./deploy.md)——完整的 Docker、Helm 与 Terraform 配置说明
- [cosign 文档](https://docs.sigstore.dev/quickstart/quickstart-cosign/)——cosign 用法与密钥管理
- [Sigstore Policy Controller](https://docs.sigstore.dev/policy-controller/overview/)——Kubernetes 准入控制
