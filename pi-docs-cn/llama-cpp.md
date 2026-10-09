---
title: "使用 llama.cpp 的本地模型"
---

Pi 支持 [llama.cpp](https://github.com/ggml-org/llama.cpp) 路由器服务器。该路由器会发现多个 GGUF 模型，并按需加载或卸载。

请使用带路由器支持的较新 llama.cpp 构建。可按照[构建说明](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md)自行编译，或安装适合你平台的[预构建发行版](https://github.com/ggml-org/llama.cpp/releases)。

## 启动路由器

启动 `llama-server` 时不要带 `--model` 或 `-m`。传入模型会进入单模型模式，而非路由器模式。

```bash
llama-server \
  --models-dir ~/models \
  --no-models-autoload \
  --jinja \
  --host 127.0.0.1 \
  --port 8080 \
  -ngl 999 \
  -c 32768
```

重要选项：

- `--models-dir ~/models` 发现本地 GGUF 文件。
- `--no-models-autoload` 让加载只能通过 `/llama` 显式进行。
- `--jinja` 启用兼容的对话模板与工具调用。
- `-ngl 999` 把尽可能多的层卸载到 GPU。
- `-c 32768` 为每个已加载模型设置上下文窗口。省略它则使用模型原生上下文，这可能需要多得多的内存。

单文件模型可以直接放在模型目录中。多模态与多分片模型请放入各自的子目录：

```text
~/models/
├── llama-3.2-1b-Q4_K_M.gguf
├── gemma-3-4b-it-Q4_K_M/
│   ├── gemma-3-4b-it-Q4_K_M.gguf
│   └── mmproj-F16.gguf
└── large-model-Q4_K_M/
    ├── large-model-Q4_K_M-00001-of-00003.gguf
    ├── large-model-Q4_K_M-00002-of-00003.gguf
    └── large-model-Q4_K_M-00003-of-00003.gguf
```

手动添加文件后请重启路由器。要为单个模型设置上下文大小等选项，使用 [llama.cpp 模型预设](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md#model-presets)。

## 配置 Pi

启动 Pi 并配置该提供商：

```text
/login llama.cpp
```

输入路由器 URL 和可选的 API 密钥。默认 URL 为 `http://127.0.0.1:8080`。

如果你用 `--no-models-autoload` 启动路由器，`/login llama.cpp` 只保存连接信息。先运行 `/llama` 加载模型，再用 `/model` 为当前会话选择该模型。

也可以不通过 `/login`，用环境变量配置相同的值：

```bash
export LLAMA_BASE_URL=http://127.0.0.1:8080
export LLAMA_API_KEY=optional-secret
pi
```

如果服务器使用 API 密钥，启动 `llama-server` 时带上匹配的 `--api-key` 值。仅限本地访问时保持 `--host 127.0.0.1`。

## 管理模型

运行：

```text
/llama
```

- 选择未加载的模型即可加载它。
- 选择已加载的模型即可卸载它。
- 选择 **Download model…**，搜索 Hugging Face，然后选择仓库与量化版本。直接输入准确的 `owner/repository[:quant]` 值也可以。
- 加载或下载过程中按 Escape 可确认取消。

Hugging Face 搜索在设置了 `HF_TOKEN` 时使用它，否则依次检查 `$HF_TOKEN_PATH`、`$HF_HOME/token`、`$XDG_CACHE_HOME/huggingface/token` 与 `~/.cache/huggingface/token`。不认证也能搜索，但速率限制更低。下载受限（gated）仓库前，Pi 会给出警告并链接到其访问页面。下载由 llama.cpp 服务器执行，因此当所选仓库需要访问权限时，其进程也必须持有 `HF_TOKEN`。

如果已有其他模型在加载，Pi 会询问是先卸载它们还是保持加载。Pi 不会静默卸载模型，也从不删除模型文件。路由器可能与其他客户端共享，因此 `/llama` 始终显示路由器的当前状态。

已加载与休眠中的模型都会出现在 `/model` 中。休眠模型被选中时会自动唤醒。启用路由器自动加载时，未加载的预设模型也会出现并在选中时加载。使用 `--no-models-autoload` 时，请先通过 `/llama` 加载模型再选择它。

路由器断开连接时，`/llama` 会显示 **Retry** 和 **Close**。Retry 会重新连接并刷新模型状态，但不会重放被中断的操作。

## 分类

分类模型回答关于 JSON 状态的类型化 `choice`、`bool` 与 `score` 问题，类似 TypeSafe 的 Jev 模型。模型通过 [`codemode`](cli#%E5%90%AF%E7%94%A8-codemode) 脚本访问它们，扩展则通过 `ctx.modelRegistry.classify()`；参见[分类模型](models#%E4%BD%BF%E7%94%A8%E5%88%86%E7%B1%BB%E6%A8%A1%E5%9E%8B)。Pi 以两种方式把 llama.cpp 模型列为分类器：

- **决策模型**（如 [Julia-1、Laya、Kev、lev 与 OpenJev](https://huggingface.co/collections/ggml-org/decision-models-6abf80cca3c83f127060a769)）通过 llama.cpp 的 `/v1/systemone` 端点原生作答。它们只以分类器身份出现，使用 `typesafe-system-one` API，不出现在 `/model` 中。
- **对话模型**也会以相同 ID 和 `llama-cpp-classify` API 被列为分类器，该 API 从下一个 token 的概率中读取答案，如下文所述。

llama.cpp 0.6.0 及更高版本会在路由器的模型列表中标注决策模型：其 `architecture.output_modalities` 包含 `decisions`。路由器无需加载模型即可从 GGUF 元数据中读取这一点，因此 Pi 也能识别未加载与休眠中的决策模型。较旧的 llama.cpp 构建不会上报该信息，Pi 会把它们的决策模型列为对话模型。

### 作为分类器的对话模型

模型不会生成一段回答。每个问题会成为一条对话提示词：状态、请求中的每个问题、再次出现的状态，以及带单 token 标签答案的问题本身。标签在选择题中是字母（最多 62 个选项），是非题中是 `Yes`/`No`，评分题中是数字（最多 10 级）。状态会带着全部问题再次被读取，这一做法在 JevBench 上提升了小模型的准确率。Pi 把这些标签作为下一个 token 的概率读取并归一化。选择题返回每个选项的概率与置信度 `(n * peak - 1) / (n - 1)`；评分题返回期望等级。

- 原始标签概率通常过度自信。每请求的 `temperature` 选项会在归一化前先除以标签 logits；大于 1 的值会让分布更平缓。它不会改变答案。
- 问题依次执行。对于同一请求的所有问题，最后一个问题之前的内容完全相同，因此服务器的提示词缓存只需计算一次。状态出现两次，因此在上下文中需要占据其两倍大小。
- 小模型可能会遵循写在状态内部的指令。提示词会要求模型把状态当作数据来评判，但这并非保证。
- Qwen3.5 等混合模型在没有上下文检查点时无法回退到部分缓存的提示词。如果每个问题都要重新处理整个状态，请用 `--ctx-checkpoints 32 --checkpoint-min-step 0` 启动路由器。

## 故障排查

检查路由器是否可达：

```bash
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:8080/models
```

- **`/llama` 中没有模型**：检查 `--models-dir` 与目录结构，并重启路由器。
- **使用 `--no-models-autoload` 时模型不在 `/model` 中**：先用 `/llama` 加载它。
- **加载失败或内存占用过高**：调低 `-c` 或卸载另一个模型。
- **服务器未处于路由器模式**：启动时不要带 `--model`、`-m` 或 `-hf`。

要移除 `llama.cpp` 提供商和 `/llama`，可在 `pi config` 的 Built-in 下禁用 `llama.cpp`，或在[设置](settings#%E8%B5%84%E6%BA%90)中设置 `"extensions": ["-builtin:llama.cpp"]`。
