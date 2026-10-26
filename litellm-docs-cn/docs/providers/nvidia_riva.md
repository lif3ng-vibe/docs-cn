import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nvidia Riva（语音转文本）

LiteLLM 通过 `/audio/transcriptions` 端点支持 NVIDIA Riva 的语音转文本（speech-to-text），既能对接 **NVCF 托管**的 Riva 端点（例如 `build.nvidia.com` 上的 Parakeet），也支持**自托管**的 Riva 部署。

| 属性 | 说明 |
|-------|-------|
| 描述 | Riva 是 NVIDIA 的 GPU 加速语音 AI。LiteLLM 通过 gRPC 把音频流式传输给 Riva，并返回与 OpenAI 兼容的转写文本。 |
| LiteLLM 提供商路由 | `nvidia_riva/` |
| 提供商文档 | [Riva ASR 文档 ↗](https://docs.nvidia.com/deeplearning/riva/user-guide/docs/asr/asr-overview.html) |
| 传输方式 | gRPC（非 HTTP） |
| 支持的 OpenAI 端点 | `/audio/transcriptions` |

:::info[可选安装]

`nvidia_riva` 需要 gRPC 客户端和音频解码库，安装命令：

```bash
pip install 'litellm[stt-nvidia-riva]'
```

这条命令会一并装上 `nvidia-riva-client`、`soundfile`、`audioread` 和 `numpy`。它们都是懒加载的，即使不装，LiteLLM 其余功能也不受影响。

:::

## 快速上手

```python
from litellm import transcription
import os

os.environ["NVIDIA_RIVA_API_KEY"] = "nvapi-..."   # your nvapi key

audio_file = open("/path/to/audio.mp3", "rb")

response = transcription(
    model="nvidia_riva/nvidia/parakeet-ctc-1_1b-asr",
    file=audio_file,
    api_base="grpc.nvcf.nvidia.com:443",
    nvcf_function_id="1598d209-5e27-4d3c-8079-4751568b1081",  # NVCF function id
)

print(response.text)
```

LiteLLM 会在流式传输前把音频重采样为 16 kHz 单声道 LINEAR_PCM（Riva 要求的线上格式），所以 mp3 / wav / flac / ogg 可以直接发送，无需自行预处理。

## 部署模式

Riva 有两种差别很大的运行形态。`nvcf_function_id` 是否存在，是 LiteLLM 推断 `use_ssl` 默认值的依据，但你随时可以显式覆盖。

### NVCF（NVIDIA 托管）

```yaml
model_list:
  - model_name: parakeet-asr
    litellm_params:
      model: nvidia_riva/nvidia/parakeet-ctc-1_1b-asr
      api_base: grpc.nvcf.nvidia.com:443
      api_key: os.environ/NVIDIA_RIVA_API_KEY     # nvapi-...
      nvcf_function_id: 1598d209-5e27-4d3c-8079-4751568b1081
```

设置 `nvcf_function_id` 后，LiteLLM 会：
- 启用 TLS（`use_ssl=True`）
- 附加 `function-id` gRPC 元数据
- 附加 `authorization: Bearer <api_key>`

### 自托管（无 TLS）

```yaml
model_list:
  - model_name: parakeet-asr
    litellm_params:
      model: nvidia_riva/nvidia/parakeet-ctc-1_1b-asr
      api_base: localhost:50051
```

### 自托管（前置 TLS 入口）

```yaml
model_list:
  - model_name: parakeet-asr
    litellm_params:
      model: nvidia_riva/nvidia/parakeet-ctc-1_1b-asr
      api_base: riva.internal.company.com:443
      use_ssl: true
```

## LiteLLM 代理用法

### 1. 将模型加入配置

```yaml
model_list:
  - model_name: parakeet-asr
    litellm_params:
      model: nvidia_riva/nvidia/parakeet-ctc-1_1b-asr
      api_base: grpc.nvcf.nvidia.com:443
      api_key: os.environ/NVIDIA_RIVA_API_KEY
      nvcf_function_id: 1598d209-5e27-4d3c-8079-4751568b1081
    model_info:
      mode: audio_transcription

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 2. 启动代理

```bash
litellm --config /path/to/config.yaml

# 已在 http://0.0.0.0:4000 上运行
```

### 3. 发送请求

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl --location 'http://0.0.0.0:4000/v1/audio/transcriptions' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --form 'file=@"/path/to/speech.mp3"' \
  --form 'model="parakeet-asr"'
```

</TabItem>
<TabItem value="openai" label="OpenAI SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000",
)

audio_file = open("speech.mp3", "rb")
transcript = client.audio.transcriptions.create(
    model="parakeet-asr",
    file=audio_file,
)
print(transcript.text)
```

</TabItem>
</Tabs>

## 支持的参数

可以无缝映射到 Riva 的 OpenAI 参数：

| OpenAI 参数 | 行为 |
|---|---|
| `language` | 映射到 Riva 的 `language_code`。`en` 这类裸代码会归一化为 `en-US`；`de-DE` 这类 BCP-47 代码则原样透传。 |
| `response_format` | `json`（默认）返回 `{ "text": "..." }`；`verbose_json` 额外返回 `duration` 和 `words`（时间戳单位为秒）。 |
| `timestamp_granularities` | 传入 `["word"]` 即可启用词级时间戳。 |

Riva 专属参数，可在 `litellm_params` 中设置（或直接传给 `transcription(...)`）：

| 参数 | 默认值 | 用途 |
|---|---|---|
| `nvcf_function_id` | 未设置 | NVCF 函数 ID。设置后会默认 `use_ssl=True`，并附加 NVCF 元数据。 |
| `use_ssl` | 设置了 `nvcf_function_id` 时为 `True`，否则为 `False` | 强制开启或关闭 TLS。自托管 Riva 前置 TLS 入口时很有用。 |
| `riva_model_name` | `""`（自动选择） | 覆盖 Riva 内部模型名。留空时 Riva 会根据 `language_code` + `sample_rate_hertz` 自动挑选。除非你明确知道自己要什么，否则建议保持留空。 |
| `enable_automatic_punctuation` | `True` | Riva 的标准开关。 |
| `endpointing_config` | 未设置 | 传入一个与 Riva `EndpointingConfig` 对应的字典（`start_threshold`、`stop_threshold`、`stop_history`、`stop_history_eou` 等）。 |
| `chunking_strategy` | 未设置 | OpenAI 风格的 VAD 配置（`{"type": "server_vad", "threshold": 0.5, "silence_duration_ms": 700, "prefix_padding_ms": 250}`），LiteLLM 会将其转换为 Riva 的 `EndpointingConfig`。 |

### 为什么 `riva_model_name` 默认留空？

`parakeet-1.1b-en-US-asr-streaming-silero-vad-sortformer` 这类 Riva 内部部署名是 NVIDIA 的部署标识，会随 NIM 版本、区域和自托管构建而变化。把 `RecognitionConfig` 里的 `model=""` 留空，Riva 就会根据 `language_code` 和 `sample_rate_hertz` 自动选择正确的部署，这几乎总是你想要的结果。只有在确有需要固定某个已部署模型时，才设置 `riva_model_name`。

## 音频格式

LiteLLM 用 `soundfile` 解码传入的音频（wav / flac / ogg），遇到 `mp3` / `m4a` / `mp4` / `webm` 时回退到 `audioread`。随后音频会被重采样为 16 kHz 单声道 LINEAR_PCM，再流式发送给 Riva。

如果解码失败（比如冷门编码、DRM 保护，或未安装 `audioread`），LiteLLM 会抛出明确的错误，提示你先在上游完成转换：

```bash
ffmpeg -i input.mp3 -ac 1 -ar 16000 -sample_fmt s16 output.wav
```

## 环境变量

| 变量 | 用途 |
|---|---|
| `NVIDIA_RIVA_API_KEY` | 以 `authorization: Bearer ...` 形式发送的 API 密钥。NVCF 要求使用 `nvapi-...` 格式。 |
| `NVIDIA_RIVA_API_BASE` | gRPC 端点的默认 `host:port`。效果等同于在 `litellm_params` 中设置 `api_base`。 |
| `NVIDIA_NIM_API_KEY` | 作为 `NVIDIA_RIVA_API_KEY` 的回退，因为大多数用户会在多个 NVCF 服务间复用同一个 `nvapi-...` 密钥。 |

## 注意事项与限制

- 传输层是 gRPC 流式。NVCF 目前只支持流式 ASR，因此即便是很短的文件也会以流的形式发送。
- 说话人分离（diarization，`diarization_config`）和 `srt` / `vtt` 响应格式尚未接入，如有需要请提 issue。
- 成本计算：Riva 不返回 token 用量。LiteLLM 会把音频时长存入 `_hidden_params["audio_transcription_duration"]`，便于在外部推算成本。
