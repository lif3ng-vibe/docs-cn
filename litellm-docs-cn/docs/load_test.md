import Image from '@theme/IdealImage';

# LiteLLM 代理 - Locust 负载测试

## 使用 Locust 对 LiteLLM 代理进行负载测试

1. 把 `fake-openai-endpoint` 添加到代理的 config.yaml 中，然后启动你的 litellm 代理。

LiteLLM 提供了一个免费托管的 `fake-openai-endpoint`，可以直接拿来跑负载测试。你也可以通过 [github.com/BerriAI/example_openai_endpoint](https://github.com/BerriAI/example_openai_endpoint) 自托管一个自己的模拟 OpenAI 代理服务器。

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
```

2. `uv add locust`

3. 在本地创建一个名为 `locustfile.py` 的文件，把 litellm 负载测试文件（见[这里](https://github.com/BerriAI/litellm/blob/main/.github/workflows/locustfile.py)）的内容复制进去

4. 启动 locust
  在与第 2 步的 `locustfile.py` 相同的目录下运行 `locust`

  ```shell
  locust
  ```

  终端输出
  ```
  [2024-03-15 07:19:58,893] Starting web interface at http://0.0.0.0:8089
  [2024-03-15 07:19:58,898] Starting Locust 2.24.0
  ```

5. 在 locust 上运行负载测试

  打开 http://0.0.0.0:8089 进入 locust 的 UI

  设置 Users=100、Ramp Up Users=10、Host=你的 LiteLLM 代理的 Base URL

  <Image img={require('../img/locust_load_test.png')} />

6. 预期结果

  `/health/readiness` 的响应时间应如下所示
  中位数 → /health/readiness 为 `150ms`

  平均值 → /health/readiness 为 `219ms`

  <Image img={require('../img/litellm_load_test.png')} />
