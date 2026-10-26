import Image from '@theme/IdealImage';

# PagerDuty 告警

<EnterpriseFeature feature="PagerDuty 告警" />

支持两类告警：
- LLM API 失败率过高。可配置 Y 秒内失败 X 次即触发告警。
- LLM 挂起请求数过多。可配置 Y 秒内挂起 X 次即触发告警。


## 快速上手

1. 在环境变量中设置 `PAGERDUTY_API_KEY="d8bxxxxx"`。

```
PAGERDUTY_API_KEY="d8bxxxxx"
```

2. 在配置文件中启用 PagerDuty 告警。

```yaml
model_list:
  - model_name: "openai/*"
    litellm_params:
      model: "openai/*"
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  alerting: ["pagerduty"]
  alerting_args:
    failure_threshold: 1  # Number of requests failing in a window
    failure_threshold_window_seconds: 10  # Window in seconds

    # Requests hanging threshold
    hanging_threshold_seconds: 0.0000001  # Number of seconds of waiting for a response before a request is considered hanging
    hanging_threshold_window_seconds: 10  # Window in seconds
```


3. 测试


启动 LiteLLM 代理服务器

```shell
litellm --config config.yaml
```

### LLM API 失败告警
尝试向代理发送一个错误请求

```shell
curl -i --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data ' {
      "model": "{{openai_large}}",
      "user": "hi",
      "messages": [
        {
          "role": "user",
          "bad_param": "i like coffee"
        }
      ]
    }
'
```

<Image img={require('../../img/pagerduty_fail.png')} />

### LLM 挂起告警

尝试向代理发送一个会挂起的请求

由于挂起阈值仅为 0.0000001 秒，你应该会看到一条告警。

```shell
curl -i --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data ' {
      "model": "{{openai_large}}",
      "user": "hi",
      "messages": [
        {
          "role": "user",
          "content": "i like coffee"
        }
      ]
    }
'
```

<Image img={require('../../img/pagerduty_hanging.png')} />
