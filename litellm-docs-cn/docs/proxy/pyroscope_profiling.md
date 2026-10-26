# Grafana Pyroscope CPU 性能分析

通过环境变量启用后，LiteLLM 代理（proxy）可以把持续的 CPU 性能分析数据（profile）发送到 [Grafana Pyroscope](https://grafana.com/docs/pyroscope/latest/)。该功能为可选项，默认关闭。

## 快速上手

1. **安装可选依赖**（仅启用 Pyroscope 时需要）：

   ```bash
   uv add pyroscope-io
   ```

   或者安装 proxy 附加依赖（extra）：

   ```bash
   uv add "litellm[proxy]"
   ```

2. **设置环境变量**，然后再启动代理：

   | 变量 | 是否必填 | 说明 |
   |----------|----------|-------------|
   | `LITELLM_ENABLE_PYROSCOPE` | 是（启用功能时） | 设为 `true` 以启用 Pyroscope 性能分析。 |
   | `PYROSCOPE_APP_NAME` | 是（启用后必填） | 在 Pyroscope UI 中显示的应用名称。 |
   | `PYROSCOPE_SERVER_ADDRESS` | 是（启用后必填） | Pyroscope 服务器 URL（例如 `http://localhost:4040`）。 |
   | `PYROSCOPE_SAMPLE_RATE` | 否 | 采样率（整数）。未设置时使用 pyroscope-io 库的默认值。 |
   | `PYROSCOPE_GRAFANA_USER` | 否 | Grafana Cloud Pyroscope 的用户/租户 ID。设置了 `PYROSCOPE_GRAFANA_API_TOKEN` 时必填。 |
   | `PYROSCOPE_GRAFANA_API_TOKEN` | 否 | Grafana Cloud 的 API/访问策略令牌（token）。用作 Pyroscope 基本认证（basic auth）密码。 |

3. **启动代理**；代理启动后性能分析会自动开始。

   ```bash
   export LITELLM_ENABLE_PYROSCOPE=true
   export PYROSCOPE_APP_NAME=litellm-proxy
   export PYROSCOPE_SERVER_ADDRESS=http://localhost:4040
   litellm --config config.yaml
   ```

   使用 Grafana Cloud Pyroscope 时，把 Profiles 端点作为 `PYROSCOPE_SERVER_ADDRESS`，并设置 Grafana Cloud 凭据：

   ```bash
   export LITELLM_ENABLE_PYROSCOPE=true
   export PYROSCOPE_APP_NAME=litellm-proxy
   export PYROSCOPE_SERVER_ADDRESS=https://profiles-prod-<region>.grafana.net
   export PYROSCOPE_GRAFANA_USER=<grafana-cloud-pyroscope-user>
   export PYROSCOPE_GRAFANA_API_TOKEN=<grafana-cloud-api-or-access-policy-token>
   litellm --config config.yaml
   ```

4. 在 Pyroscope（或 Grafana）UI 中**查看分析结果**，并选择你的 `PYROSCOPE_APP_NAME`。

## 注意事项

- **可选依赖**：`pyroscope-io` 是可选依赖。如果未安装且设置了 `LITELLM_ENABLE_PYROSCOPE=true`，代理会记录一条警告并继续运行，但不开启性能分析。
- **平台支持**：`pyroscope-io` 包依赖原生扩展，并非所有平台都可用（例如该包本身排除了 Windows）。
- **其他设置**：全部代理环境变量见 [配置设置](/docs/proxy/config_settings)。
