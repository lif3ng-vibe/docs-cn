# ChatGPT 订阅

借助 OAuth 设备码流程（device code flow）认证，通过 LiteLLM 使用包含 Codex 的 ChatGPT 订阅（各套餐从 Plus、Pro 到 Business、Enterprise，详见 OpenAI 的 [Codex 定价](https://developers.openai.com/codex/pricing)）。

| 属性 | 详情 |
|-------|-------|
| 描述 | 通过 ChatGPT 后端 API 访问 ChatGPT 订阅（Codex + GPT-5.3/5.4 系列） |
| LiteLLM 提供商路由 | `chatgpt/` |
| 支持的端点 | `/responses`、`/chat/completions`（支持的模型会桥接到 Responses） |
| API 参考 | https://chatgpt.com |

ChatGPT 订阅访问原生基于 Responses API。对支持的模型（例如 `chatgpt/gpt-5.4`），Chat Completions 请求会被桥接到 Responses。

注意事项：
- ChatGPT 订阅后端会拒绝 token 上限字段（`max_tokens`、`max_output_tokens`、`max_completion_tokens`）和 `metadata`。LiteLLM 会为该提供商自动剥离这些字段。
- `/v1/chat/completions` 支持 `stream`。当 `stream` 为 false（默认值）时，LiteLLM 会把 Responses 流聚合成单个 JSON 响应。

## 认证

ChatGPT 订阅访问采用 OAuth 设备码流程。LiteLLM Python SDK 在首次需要 token 时会自动执行该流程，前提是它从主线程的同步脚本中被调用：SDK 会打印一个验证 URL 和一个设备码，你打开该 URL、登录并输入设备码，之后 token 会存入 `~/.config/litellm/chatgpt/auth.json` 以便复用。异步代码、notebook、工作线程以及 LiteLLM 代理都无法响应这个提示（旧版本会一直阻塞，新版本则报错 `ChatGPT device-code login needs a human`），因此使用代理时要先完成登录，再把生成的文件挂载进去，参见[启动代理前先登录](#启动代理前先登录)。

账号必须先允许设备码登录：个人套餐在 ChatGPT 的安全设置中开启；Business 和 Enterprise 套餐由工作区管理员在工作区权限中开启（参见 [OpenAI 文档](https://learn.chatgpt.com/docs/auth)）。

## 用法 - LiteLLM Python SDK

### Responses（推荐用于 Codex 模型）

```python showLineNumbers title="ChatGPT Responses"
import litellm

response = litellm.responses(
    model="chatgpt/gpt-5.3-codex",
    input="Write a Python hello world"
)

print(response)
```

### Chat Completions（桥接到 Responses）

```python showLineNumbers title="ChatGPT Chat Completions"
import litellm

response = litellm.completion(
    model="chatgpt/gpt-5.4",
    messages=[{"role": "user", "content": "Write a Python hello world"}]
)

print(response)
```

## 用法 - LiteLLM 代理

### 启动代理前先登录

代理无法完成设备码流程：它运行在工作进程里，没有终端可以把设备码交给用户。如果磁盘上没有 `auth.json`，旧版本会由某个工作进程打印设备码，并在每个 `chatgpt/` 部署上挂起启动、等待有人输入（从前台终端可以做到，每个工作进程一次，期间启动一直挂起；从服务或容器日志则没人能输入）；新版本会拒绝初始化该部署，并在每个工作进程中对每个部署记录一次日志 `ChatGPT device-code login needs a human and cannot run inside a running event loop or a worker thread`。无论哪种情况，之后对这些模型的每个请求都会返回 HTTP 400 `There are no healthy deployments for this model`。正确做法是在终端里先登录一次：

```bash showLineNumbers title="在代理外登录一次"
python -c "from litellm.llms.chatgpt.authenticator import Authenticator; Authenticator().get_access_token()"
```

打开打印出的 URL，登录并输入设备码。token 会写入 `~/.config/litellm/chatgpt/auth.json`（`CHATGPT_TOKEN_DIR` 和 `CHATGPT_AUTH_FILE` 可改变存放位置）；如果上一次尝试半途而废，五分钟内再次运行会等完剩余的时间窗口才打印新设备码。把文件放到代理主机的相同路径，或者把 `CHATGPT_TOKEN_DIR` 设为该文件所在目录（`litellm-non_root` 镜像以 uid 65534 运行，因此 bind-mount 进去的文件必须归该 uid 所有或对其可写，即执行 `chown 65534 auth.json`，否则首次刷新会因下面的写入错误而失败），然后再启动代理：`model_list` 中的部署在启动时创建，所以启动时缺文件的代理在文件就位后需要重启。

访问 token 的有效期约为十天。过期后，代理会用刷新 token 换取新的一对 token 并写回 `auth.json`，而每个刷新 token 只能用一次，因此该文件必须可写：只读副本会记录日志 `Failed to write ChatGPT auth file`，并在首次刷新时失效。出于同样的原因，所有代理进程必须共享同一份文件。代理每次请求都会重新读取该文件，所以哪个工作进程或 pod 先完成刷新，其余的就由它服务；而各自持有一份副本则会在首次刷新时分道扬镳，除一份外全部失效，直到重新登录。两个工作进程同时撞上过期时会尝试同一个刷新 token，落空的那个会记录日志 `ChatGPT refresh token failed, re-login required`：新版本只让那一个请求失败，下个请求就会用上新 token；旧版本则会让该工作进程先在设备码轮询中阻塞长达十五分钟。

在 Kubernetes 上，给代理提供一份可写、能跨重启保留且被所有副本共享的文件：用一个 PersistentVolumeClaim（多副本时需要 `ReadWriteMany`）挂载到 `CHATGPT_TOKEN_DIR`，卷第一次为空时由 init 容器从 Secret 播种。`ReadWriteMany` 需要支持它的存储类（GKE 上的 Filestore、EKS 上的 EFS、AKS 上的 Azure Files）；默认磁盘存储类只支持 `ReadWriteOnce`，用这种存储类的 PVC 会一直 Pending，所有副本卡在 ContainerCreating。如果只有这类存储类，可以只跑一个副本，或把所有副本固定到同一个节点，同一节点上的所有 pod 仍能共享一个 `ReadWriteOnce` 卷。Secret 卷是只读的；每个 pod 独立的 `emptyDir` 每次重启都会从最初的登录结果重新播种，两种方案都会在首次刷新时出问题。代理重写文件时是就地覆盖而非原子替换，因此某个副本恰好在另一副本写入途中读取该文件时，会记录日志 `Invalid ChatGPT auth file`，并表现得像完全没登录过：发生在启动时会导致部署被丢弃、副本需要重启；发生在请求时，下一个请求会重新读取文件。`chown` 是把文件交给官方 `litellm-non_root` 镜像的运行用户（65534）；root 镜像不需要 chown，自定义镜像则用它自己的 uid。在受限 pod 安全策略下 init 容器不能以 root 运行时，在 pod 上设置 `fsGroup: 65534` 使卷对组可写，让 init 容器以 `runAsUser: 65534` 运行，并去掉 `chown`。init 容器只在卷为空时复制，因此重新登录后要先更新 Secret 并从卷中删除 `auth.json`（`kubectl exec <pod> -c litellm -- rm /tokens/chatgpt/auth.json`）再重启 pod，否则它们会继续用旧文件并记录日志 `ChatGPT refresh token failed, re-login required`。

```bash showLineNumbers title="用本地登录结果创建 Secret"
kubectl create secret generic litellm-chatgpt-auth --from-file=auth.json=$HOME/.config/litellm/chatgpt/auth.json
```

```yaml showLineNumbers title="共享 token 卷"
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: litellm-chatgpt-tokens
spec:
  accessModes: ["ReadWriteMany"]
  resources:
    requests:
      storage: 1Mi
```

```yaml showLineNumbers title="Pod 规格节选"
spec:
  initContainers:
    - name: chatgpt-token
      image: busybox:1.37
      command:
        - sh
        - -c
        - "test -f /tokens/chatgpt/auth.json || cp /secrets/chatgpt/auth.json /tokens/chatgpt/auth.json && chown 65534 /tokens/chatgpt/auth.json"
      volumeMounts:
        - name: chatgpt-secret
          mountPath: /secrets/chatgpt
          readOnly: true
        - name: chatgpt-tokens
          mountPath: /tokens/chatgpt
  containers:
    - name: litellm
      env:
        - name: CHATGPT_TOKEN_DIR
          value: /tokens/chatgpt
      volumeMounts:
        - name: chatgpt-tokens
          mountPath: /tokens/chatgpt
  volumes:
    - name: chatgpt-secret
      secret:
        secretName: litellm-chatgpt-auth
    - name: chatgpt-tokens
      persistentVolumeClaim:
        claimName: litellm-chatgpt-tokens
```

### 配置并启动代理

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: chatgpt/gpt-5.4
    model_info:
      mode: responses
    litellm_params:
      model: chatgpt/gpt-5.4
  - model_name: chatgpt/gpt-5.4-pro
    model_info:
      mode: responses
    litellm_params:
      model: chatgpt/gpt-5.4-pro
  - model_name: chatgpt/gpt-5.3-codex
    model_info:
      mode: responses
    litellm_params:
      model: chatgpt/gpt-5.3-codex
  - model_name: chatgpt/gpt-5.3-codex-spark
    model_info:
      mode: responses
    litellm_params:
      model: chatgpt/gpt-5.3-codex-spark
  - model_name: chatgpt/gpt-5.3-instant
    model_info:
      mode: responses
    litellm_params:
      model: chatgpt/gpt-5.3-instant
  - model_name: chatgpt/gpt-5.3-chat-latest
    model_info:
      mode: responses
    litellm_params:
      model: chatgpt/gpt-5.3-chat-latest
```

```bash showLineNumbers title="启动 LiteLLM 代理"
litellm --config config.yaml
```

## 凭证范围与用量归属

一个代理只使用一个 ChatGPT 登录：即 `CHATGPT_TOKEN_DIR` 中的 `auth.json`，它对整个进程只设置一次。对 `chatgpt/` 模型的每个请求都以该文件中的访问 token 和从中取出的 `ChatGPT-Account-Id` 发往上游，与调用用的是哪个虚拟密钥（virtual key）无关，客户端发来的任何 ChatGPT token 都会被 LiteLLM 忽略。因此，所有能调用 `chatgpt/` 模型的密钥、用户和团队都共用同一个 ChatGPT 账号和工作区，用户也无法通过该提供商使用自己的 ChatGPT 订阅。要服务多个 ChatGPT 账号，每个账号需要一个独立的代理部署。

与其他模型一样，LiteLLM 会把 `chatgpt/` 请求归到发起调用的虚拟密钥、用户和团队名下，并记录 token 数。这些模型在成本映射中没有价格，因此记录的花费为 $0，`max_budget` 限制永远不会触发；请改用密钥和团队上的 `rpm_limit` 或 `tpm_limit` 来限制用量。在 OpenAI 一侧，所有用量都会计入登录的账号。

## 刷新失败与吊销

只有当存储的访问 token 已过期时，LiteLLM 才会刷新。如果 token 尚未过期，ChatGPT 后端返回的 401 会原样返回给调用方，不会触发刷新，例如会话在 OpenAI 一侧被登出的情况。当刷新 token 被拒绝时，代理会记录日志 `ChatGPT refresh token failed, re-login required`，请求则以 HTTP 400 `ChatGPT device-code login needs a human` 失败；此时需在代理外重新登录并替换 `auth.json`。

LiteLLM 没有为该提供商提供登出或吊销调用。要让代理停止使用该账号，删除 `auth.json`（在 Kubernetes 上还要删除作为其种子的 Secret）并重启代理。要让 token 本身失效，请在 ChatGPT 账号的安全设置中登出该会话。

## 配置

### 环境变量

- `CHATGPT_TOKEN_DIR`：自定义 token 存储目录（默认：`~/.config/litellm/chatgpt`）
- `CHATGPT_AUTH_FILE`：认证文件名（默认：`auth.json`）
- `CHATGPT_API_BASE`：覆盖 API 基地址（默认：`https://chatgpt.com/backend-api/codex`）
- `OPENAI_CHATGPT_API_BASE`：`CHATGPT_API_BASE` 的别名
- `CHATGPT_ORIGINATOR`：覆盖 `originator` 请求头的值
- `CHATGPT_USER_AGENT`：覆盖 `User-Agent` 请求头的值
- `CHATGPT_USER_AGENT_SUFFIX`：追加到 `User-Agent` 请求头末尾的可选后缀
