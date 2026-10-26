# MAX_CALLBACKS 限制

## 错误信息

```
Cannot add callback - would exceed MAX_CALLBACKS limit of 100. Current callbacks: 100
```

## 这意味着什么

为避免性能劣化，LiteLLM 对可注册的回调（callback）数量设了上限。每个回调都会在每次 LLM 请求时执行，回调过多会导致 CPU 占用呈指数级增长，拖慢代理的速度。当回调列表已经达到上限时，LiteLLM 会以警告形式记录这条信息，并跳过新增的回调。

默认上限为 **100 个回调**。

## 什么情况下会达到上限

- **大型企业部署**：团队众多，每个团队都有各自的防护栏（guardrails）
- **多套日志（logging）集成**：叠加自定义回调一起使用
- **按团队划分的回调配置**：在整个组织内不断累加

## 如何覆盖默认上限

设置环境变量 `LITELLM_MAX_CALLBACKS` 即可提高上限：

```bash
# Docker
docker run -e LITELLM_MAX_CALLBACKS=200 ...

# Docker Compose
environment:
  - LITELLM_MAX_CALLBACKS=200

# Kubernetes
env:
  - name: LITELLM_MAX_CALLBACKS
    value: "200"

# Direct
export LITELLM_MAX_CALLBACKS=200
litellm --config config.yaml
```

## 建议

1. **从保守值起步**——只按实际需要上调。如果有 150 个配置了防护栏的团队，可以先设 `LITELLM_MAX_CALLBACKS=175`，留出一点余量。

2. **关注性能表现**——回调越多，每个请求要做的处理就越多。上调上限后，留意 CPU 占用和响应延迟的变化。

3. **尽量合并**——如果多个团队用的是完全相同的防护栏，考虑改用共享的回调配置，而不是每个团队各存一份。

## 示例：大型企业场景

对于一个拥有 150 多个团队、每个团队各有一个防护栏回调的组织：

```yaml
# config.yaml
litellm_settings:
  callbacks: ["prometheus", "langfuse"]  # 2 global callbacks

# Each team adds 1 guardrail callback = 150+ callbacks
# Total: 152+ callbacks needed
```

设置环境变量：

```bash
export LITELLM_MAX_CALLBACKS=200
```
