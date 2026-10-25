---
title: "Kubernetes Operator 的 Let's Encrypt 速率限制"
description: "Operator 会从 [Let's Encrypt][xt-letsencrypt] 为 `Ingress` 代理、API 服务器代理及其他 Operator 组件签发 TLS 证书。Let's Encrypt 对证书签发实施[速率限制（rate limits）][xt-letsen"
---

最后验证于 Jul 21, 2026

Operator 会从 [Let's Encrypt][xt-letsencrypt] 为 `Ingress` 代理、API 服务器代理及其他 Operator 组件签发 TLS 证书。Let's Encrypt 对证书签发实施[速率限制][xt-letsencrypt-rate-limit]，随着部署规模增长，这可能开始产生影响。

适用以下[速率限制][xt-letsencrypt-rate-limit]：

* **每周 50 张证书**：每个 tailnet 的唯一主机名。
* **每周 5 张重复证书**：跨不同集群的主机名。

触发速率限制不影响已有证书，但在限制窗口过去之前，新签发会失败。

## 避开速率限制

Operator 支持以下选项来高效利用证书签发额度。

> **注意：**
>
> 如果你需要的证书数量超过限额，可以向 Let's Encrypt[申请速率限制调整][xt-letsencrypt-rate-limit-form]。

### 使用暂存环境测试

测试 Operator 部署时，请使用 Let's Encrypt 暂存环境，这样测试证书就不会占用生产速率限制。通过 `ProxyClass` 配置：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyClass
metadata:
  name: letsencrypt-staging
spec:
  useLetsEncryptStagingEnvironment: true
```

客户端不信任暂存环境签发的证书，因此请仅在测试时使用暂存环境。

### 使用共享的 ACME 账户

证书续期免受速率限制，但前提是续期必须来自签发上一张证书的那个 ACME 账户。默认情况下每个代理都有自己的 ACME 账户，因此重建代理 Pod 会失去豁免。

改为让 Operator 在各代理之间共享一个 ACME 账户，续期就能在 Pod 重启、`ProxyGroup` 重建和集群迁移时保持豁免。Operator 会把共享账户密钥存储在其命名空间中名为 `tailscale-acme-accounts` 的 `Secret` 里。

要为所有 `ProxyGroup` 资源启用共享账户，请在 Operator 的 Helm chart 中设置以下值：

```yaml
operatorConfig:
  sharedACMEAccountKey: true
```

要为单个 `ProxyGroup` 控制共享账户，请设置 `tailscale.com/share-acme-account` 注解。该注解无论是否设置 Helm 值都有效，并且优先于 Helm 值，因此你可以在不必 Operator 范围内启用共享账户的情况下，让单个 `ProxyGroup` 资源选择加入：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: ingress-proxies
  annotations:
    tailscale.com/share-acme-account: "true"
spec:
  type: ingress
```

Operator 会在第一个选择加入的 `ProxyGroup` 调谐时创建 `tailscale-acme-accounts` `Secret`。代理会在下次签发或续期证书时填充账户密钥。

#### 在现有部署上启用

在运行中的部署上启用共享账户是安全的：它不会重新签发证书，也不会中断流量。Operator 会重启受影响的 `Ingress` 代理 Pod，每个 Pod 在重启期间会继续使用其现有证书服务。

证书按正常排期续期时逐步迁移到共享账户，而不是一次性全部迁移。豁免不具追溯性，因此要等到每张证书都在共享账户下完成至少一次续期后，速率限制才会完全缓解，这可能需要一张证书的整个生命周期。启用它除了你本来就要花费的续期额度之外，不会消耗额外的速率限制额度。

不要通过删除证书来强制迁移。那会立即触发重新签发，现在就消耗一个速率限制额度而不是留到下次计划续期时，如果你已处于限额边缘，还可能失败。

如果你已经触发速率限制，请尽快启用共享账户，以便在你的续期到期之前豁免已生效。

#### 删除保护

`tailscale-acme-accounts` `Secret` 带有 `tailscale.com/acme-account-protection` finalizer，因为丢失账户密钥会移除 tailnet 中所有证书的续期豁免。如果你删除该 `Secret`，它会停留在 `Terminating` 状态，数据仍可读取，直到你移除 finalizer。在此状态下，Operator 会在该 `Secret` 上发出警告事件。

Kubernetes 无法取消删除。如果你删除了该 `Secret`，请先备份其数据（如果尚未备份），然后移除 finalizer 让删除完成。Operator 会重建该 `Secret`，运行中的代理会在下次签发或续期证书时恢复账户密钥。

该 `Secret` 由 Operator 而不是 Helm chart 创建，因此 `helm uninstall` 不会删除它。保留它可以在你重新安装 Operator 时保持续期豁免。如果你想永久移除它，请在卸载后移除 finalizer 并删除它。

> **注意：**
>
> 你可以备份 `tailscale-acme-accounts` `Secret`，以便在丢失时恢复共享账户密钥。丢失密钥会移除 tailnet 中所有证书的续期豁免，迫使它们全部在新账户下重新签发。

### 逐步上线大规模部署

没有任何机制能让*首次*签发免受速率限制：每个新主机名都需要一张全新的证书，每张都计入每周 50 张的限制。一次性让大量 `Ingress` 资源上线的大规模部署——比如把 Operator 安装到一个已有数十个 HTTPS 工作负载的集群，或者批量 GitOps 同步——可能在所有证书签发完成之前就耗尽每周额度。一旦发生，剩余的证书在限制窗口过去之前都无法签发，期间这些工作负载无法提供 TLS。

为了保持在限额之内，请分批上线 HTTPS 工作负载，而不是一次性全部上线。让每周的新主机名保持在 50 张证书限额以下。例如，先公开一组 `Ingress` 资源，确认其证书已签发，然后在下周公开下一组。

如果你需要比限额允许的速度更快地上线大规模部署，请在开始前向 Let's Encrypt[申请速率限制调整][xt-letsencrypt-rate-limit-form]，并在规划批次时把更高的限额考虑进去。

> **注意：**
>
> 在开始分批上线之前，先启用[共享 ACME 账户][ar-use-a-shared-acme-account]。这样每张证书在签发时就加入共享账户，其后续续期从一开始就获得豁免，不会在之后的几周里与新签发竞争速率限制额度。

## 进一步探索

* 使用 [Ingress][docs-ingress] 公开集群工作负载。
* 为共享 TLS 证书的 `ProxyGroup` 资源配置[高可用][docs-ha]。

[ar-use-a-shared-acme-account]: #使用共享的-acme-账户

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-ingress]: /docs/kubernetes-operator/ingress

[xt-letsencrypt]: https://letsencrypt.org/

[xt-letsencrypt-rate-limit]: https://letsencrypt.org/docs/rate-limits

[xt-letsencrypt-rate-limit-form]: https://isrg.formstack.com/forms/rate_limit_adjustment_request
