import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# [旧版代理 👉 [新版代理文档](./simple_proxy)] 本地 LiteLLM 代理服务器

一个快速、轻量的 OpenAI 兼容服务器，可调用 100 多个 LLM API。

:::info

本文档已过时。新文档 👉 [见此](./simple_proxy)

:::

## 用法
```shell
uv tool install 'litellm[proxy]'
```
```shell
$ litellm --model ollama/codellama

#INFO: Ollama running on http://0.0.0.0:4000
```

### 测试
新开一个终端，运行：
```shell
$ litellm --test
```

### 替换 OpenAI base

```python
import openai

openai.api_base = "http://0.0.0.0:4000"

print(openai.ChatCompletion.create(model="test", messages=[{"role":"user", "content":"Hey!"}]))
```

#### 其他支持的模型：
<Tabs>
<TabItem value="vllm-local" label="VLLM">
假设你在本地运行 vllm

```shell
$ litellm --model vllm/facebook/opt-125m
```
</TabItem>
<TabItem value="openai-proxy" label="OpenAI 兼容服务器">

```shell
$ litellm --model openai/<model_name> --api_base <your-api-base>
```
</TabItem>
<TabItem value="huggingface" label="Huggingface">

```shell
$ export HUGGINGFACE_API_KEY=my-api-key #[OPTIONAL]
$ litellm --model {{anthropic}}
```

</TabItem>

<TabItem value="anthropic" label="Anthropic">

```shell
$ export ANTHROPIC_API_KEY=my-api-key
$ litellm --model {{anthropic}}
```

</TabItem>

<TabItem value="together_ai" label="TogetherAI">

```shell
$ export TOGETHERAI_API_KEY=my-api-key
$ litellm --model together_ai/lmsys/vicuna-13b-v1.5-16k
```

</TabItem>

<TabItem value="replicate" label="Replicate">

```shell
$ export REPLICATE_API_KEY=my-api-key
$ litellm \
  --model replicate/meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3
```

</TabItem>

<TabItem value="petals" label="Petals">

```shell
$ litellm --model petals/meta-llama/Llama-2-70b-chat-hf
```

</TabItem>

<TabItem value="palm" label="Palm">

```shell
$ export PALM_API_KEY=my-palm-key
$ litellm --model palm/chat-bison
```

</TabItem>

<TabItem value="azure" label="Azure OpenAI">

```shell
$ export AZURE_API_KEY=my-api-key
$ export AZURE_API_BASE=my-api-base

$ litellm --model azure/my-deployment-name
```

</TabItem>

<TabItem value="ai21" label="AI21">

```shell
$ export AI21_API_KEY=my-api-key
$ litellm --model j2-light
```

</TabItem>

<TabItem value="cohere" label="Cohere">

```shell
$ export COHERE_API_KEY=my-api-key
$ litellm --model command-nightly
```

</TabItem>

</Tabs>

### 教程：配合多个 LLM 及 LibreChat/Chatbot-UI/Auto-Gen/ChatDev/Langroid 等使用
<Tabs>
<TabItem value="multiple-LLMs" label="多个 LLM">

替换 openai 的 base 地址：
```python
import openai

openai.api_key = "any-string-here"
openai.api_base = "http://0.0.0.0:4000" # your proxy url

# call openai
response = openai.ChatCompletion.create(model="{{openai_small}}", messages=[{"role": "user", "content": "Hey"}])

print(response)

# call cohere
response = openai.ChatCompletion.create(model="command-nightly", messages=[{"role": "user", "content": "Hey"}])

print(response)
```
</TabItem>
<TabItem value="librechat" label="LibreChat">

#### 1. 克隆仓库

```shell
git clone https://github.com/danny-avila/LibreChat.git
```


#### 2. 修改 `docker-compose.yml`
```yaml
OPENAI_REVERSE_PROXY=http://host.docker.internal:4000/v1/chat/completions
```

#### 3. 在 `.env` 中保存假的 OpenAI 密钥
```env
OPENAI_API_KEY=sk-<your-api-key>
```

#### 4. 运行 LibreChat：
```shell
docker compose up
```
</TabItem>
<TabItem value="smart-chatbot-ui" label="SmartChatbotUI">

#### 1. 克隆仓库
```shell
git clone https://github.com/dotneet/smart-chatbot-ui.git
```

#### 2. 安装依赖
```shell
npm i
```

#### 3. 创建 env 文件
```shell
cp .env.local.example .env.local
```

#### 4. 设置 API 密钥与 Base
```env
OPENAI_API_KEY="my-fake-key"
OPENAI_API_HOST="http://0.0.0.0:4000
```

#### 5. 用 docker compose 运行
```shell
docker compose up -d
```
</TabItem>
<TabItem value="autogen" label="AutoGen">

```bash
uv add pyautogen
```

```python
from autogen import AssistantAgent, UserProxyAgent, oai
config_list=[
    {
        "model": "my-fake-model",
        "api_base": "http://0.0.0.0:4000",  #litellm compatible endpoint
        "api_type": "open_ai",
        "api_key": "NULL", # just a placeholder
    }
]

response = oai.Completion.create(config_list=config_list, prompt="Hi")
print(response) # works fine

llm_config={
    "config_list": config_list,
}

assistant = AssistantAgent("assistant", llm_config=llm_config)
user_proxy = UserProxyAgent("user_proxy")
user_proxy.initiate_chat(assistant, message="Plot a chart of META and TESLA stock price change YTD.", config_list=config_list)
```

本教程由 [@victordibia](https://github.com/microsoft/autogen/issues/45#issuecomment-1749921972) 提供。
</TabItem>
<TabItem value="multi-LLM AutoGen" label="AutoGen 多模型">


```python
from autogen import AssistantAgent, GroupChatManager, UserProxyAgent
from autogen.agentchat import GroupChat
config_list = [
    {
        "model": "ollama/mistralorca",
        "api_base": "http://0.0.0.0:4000",  # litellm compatible endpoint
        "api_type": "open_ai",
        "api_key": "NULL",  # just a placeholder
    }
]
llm_config = {"config_list": config_list, "seed": 42}

code_config_list = [
    {
        "model": "ollama/phind-code",
        "api_base": "http://0.0.0.0:4000",  # litellm compatible endpoint
        "api_type": "open_ai",
        "api_key": "NULL",  # just a placeholder
    }
]

code_config = {"config_list": code_config_list, "seed": 42}

admin = UserProxyAgent(
    name="Admin",
    system_message="A human admin. Interact with the planner to discuss the plan. Plan execution needs to be approved by this admin.",
    llm_config=llm_config,
    code_execution_config=False,
)


engineer = AssistantAgent(
    name="Engineer",
    llm_config=code_config,
    system_message="""Engineer. You follow an approved plan. You write python/shell code to solve tasks. Wrap the code in a code block that specifies the script type. The user can't modify your code. So do not suggest incomplete code which requires others to modify. Don't use a code block if it's not intended to be executed by the executor.
Don't include multiple code blocks in one response. Do not ask others to copy and paste the result. Check the execution result returned by the executor.
If the result indicates there is an error, fix the error and output the code again. Suggest the full code instead of partial code or code changes. If the error can't be fixed or if the task is not solved even after the code is executed successfully, analyze the problem, revisit your assumption, collect additional info you need, and think of a different approach to try.
""",
)
planner = AssistantAgent(
    name="Planner",
    system_message="""Planner. Suggest a plan. Revise the plan based on feedback from admin and critic, until admin approval.
The plan may involve an engineer who can write code and a scientist who doesn't write code.
Explain the plan first. Be clear which step is performed by an engineer, and which step is performed by a scientist.
""",
    llm_config=llm_config,
)
executor = UserProxyAgent(
    name="Executor",
    system_message="Executor. Execute the code written by the engineer and report the result.",
    human_input_mode="NEVER",
    llm_config=llm_config,
    code_execution_config={"last_n_messages": 3, "work_dir": "paper"},
)
critic = AssistantAgent(
    name="Critic",
    system_message="Critic. Double check plan, claims, code from other agents and provide feedback. Check whether the plan includes adding verifiable info such as source URL.",
    llm_config=llm_config,
)
groupchat = GroupChat(
    agents=[admin, engineer, planner, executor, critic],
    messages=[],
    max_round=50,
)
manager = GroupChatManager(groupchat=groupchat, llm_config=llm_config)


admin.initiate_chat(
    manager,
    message="""
""",
)
```

本教程由 [@Nathan](https://gist.github.com/CUexter) 提供。
</TabItem>
<TabItem value="chatDev" label="ChatDev">

### 设置 ChatDev（[文档](https://github.com/OpenBMB/ChatDev#%EF%B8%8F-quickstart)）
```shell
git clone https://github.com/OpenBMB/ChatDev.git
cd ChatDev
conda create -n ChatDev_conda_env python={{python_version}} -y
conda activate ChatDev_conda_env
uv add -r requirements.txt
```
### 通过代理运行 ChatDev
```shell
export OPENAI_API_KEY="sk-<your-api-key>"
```

```shell
export OPENAI_BASE_URL="http://0.0.0.0:4000"
```
```shell
python3 run.py --task "a script that says hello world" --name "hello world"
```
</TabItem>
<TabItem value="langroid" label="Langroid">

```bash
uv add langroid
```

```python
from langroid.language_models.openai_gpt import OpenAIGPTConfig, OpenAIGPT

# configure the LLM
my_llm_config = OpenAIGPTConfig(
    # where proxy server is listening
    api_base="http://0.0.0.0:4000",
)

# create llm, one-off interaction
llm = OpenAIGPT(my_llm_config)
response = mdl.chat("What is the capital of China?", max_tokens=50)

# Create an Agent with this LLM, wrap it in a Task, and
# run it as an interactive chat app:
from langroid.agent.base import ChatAgent, ChatAgentConfig
from langroid.agent.task import Task

agent_config = ChatAgentConfig(llm=my_llm_config, name="my-llm-agent")
agent = ChatAgent(agent_config)

task = Task(agent, name="my-llm-task")
task.run()
```

本教程由 [@pchalasani](https://github.com/pchalasani) 与 [Langroid](https://github.com/langroid/langroid) 提供。
</TabItem>
</Tabs>

## 本地代理

下面演示如何用本地代理，在不同的 GitHub 仓库中测试 codellama/mistral 等模型：

```shell
uv add litellm
```

```shell
$ ollama pull codellama # OUR Local CodeLlama

$ litellm --model ollama/codellama --temperature 0.3 --max_tokens 2048
```

### 教程：配合多个 LLM 及 Aider/AutoGen/Langroid 等使用
<Tabs>
<TabItem value="multiple-LLMs" label="多个 LLM">

```shell
$ litellm

#INFO: litellm proxy running on http://0.0.0.0:4000
```

#### 向代理发送请求
```python
import openai

openai.api_key = "any-string-here"
openai.api_base = "http://0.0.0.0:4000" # your proxy url

# call {{openai_small}}
response = openai.ChatCompletion.create(model="{{openai_small}}", messages=[{"role": "user", "content": "Hey"}])

print(response)

# call ollama/llama2
response = openai.ChatCompletion.create(model="ollama/llama2", messages=[{"role": "user", "content": "Hey"}])

print(response)
```

</TabItem>
<TabItem value="continue-dev" label="ContinueDev">

Continue-Dev 把 ChatGPT 带进了 VSCode。安装方法见[此](https://continue.dev/docs/quickstart)。

在 [config.py](https://continue.dev/docs/reference/Models/openai) 中，把它设为默认模型。
```python
  default=OpenAI(
      api_key="IGNORED",
      model="fake-model-name",
      context_length=2048, # customize if needed for your model
      api_base="http://localhost:4000" # your proxy server url
  ),
```

本教程由 [@vividfog](https://github.com/ollama/ollama/issues/305#issuecomment-1751848077) 提供。
</TabItem>
<TabItem value="aider" label="Aider">

```shell
$ uv add aider

$ aider --openai-api-base http://0.0.0.0:4000 --openai-api-key fake-key
```
</TabItem>
<TabItem value="autogen" label="AutoGen">

```bash
uv add pyautogen
```

```python
from autogen import AssistantAgent, UserProxyAgent, oai
config_list=[
    {
        "model": "my-fake-model",
        "api_base": "http://localhost:4000",  #litellm compatible endpoint
        "api_type": "open_ai",
        "api_key": "NULL", # just a placeholder
    }
]

response = oai.Completion.create(config_list=config_list, prompt="Hi")
print(response) # works fine

llm_config={
    "config_list": config_list,
}

assistant = AssistantAgent("assistant", llm_config=llm_config)
user_proxy = UserProxyAgent("user_proxy")
user_proxy.initiate_chat(assistant, message="Plot a chart of META and TESLA stock price change YTD.", config_list=config_list)
```

本教程由 [@victordibia](https://github.com/microsoft/autogen/issues/45#issuecomment-1749921972) 提供。
</TabItem>
<TabItem value="multi-LLM AutoGen" label="AutoGen 多模型">


```python
from autogen import AssistantAgent, GroupChatManager, UserProxyAgent
from autogen.agentchat import GroupChat
config_list = [
    {
        "model": "ollama/mistralorca",
        "api_base": "http://localhost:4000",  # litellm compatible endpoint
        "api_type": "open_ai",
        "api_key": "NULL",  # just a placeholder
    }
]
llm_config = {"config_list": config_list, "seed": 42}

code_config_list = [
    {
        "model": "ollama/phind-code",
        "api_base": "http://localhost:4000",  # litellm compatible endpoint
        "api_type": "open_ai",
        "api_key": "NULL",  # just a placeholder
    }
]

code_config = {"config_list": code_config_list, "seed": 42}

admin = UserProxyAgent(
    name="Admin",
    system_message="A human admin. Interact with the planner to discuss the plan. Plan execution needs to be approved by this admin.",
    llm_config=llm_config,
    code_execution_config=False,
)


engineer = AssistantAgent(
    name="Engineer",
    llm_config=code_config,
    system_message="""Engineer. You follow an approved plan. You write python/shell code to solve tasks. Wrap the code in a code block that specifies the script type. The user can't modify your code. So do not suggest incomplete code which requires others to modify. Don't use a code block if it's not intended to be executed by the executor.
Don't include multiple code blocks in one response. Do not ask others to copy and paste the result. Check the execution result returned by the executor.
If the result indicates there is an error, fix the error and output the code again. Suggest the full code instead of partial code or code changes. If the error can't be fixed or if the task is not solved even after the code is executed successfully, analyze the problem, revisit your assumption, collect additional info you need, and think of a different approach to try.
""",
)
planner = AssistantAgent(
    name="Planner",
    system_message="""Planner. Suggest a plan. Revise the plan based on feedback from admin and critic, until admin approval.
The plan may involve an engineer who can write code and a scientist who doesn't write code.
Explain the plan first. Be clear which step is performed by an engineer, and which step is performed by a scientist.
""",
    llm_config=llm_config,
)
executor = UserProxyAgent(
    name="Executor",
    system_message="Executor. Execute the code written by the engineer and report the result.",
    human_input_mode="NEVER",
    llm_config=llm_config,
    code_execution_config={"last_n_messages": 3, "work_dir": "paper"},
)
critic = AssistantAgent(
    name="Critic",
    system_message="Critic. Double check plan, claims, code from other agents and provide feedback. Check whether the plan includes adding verifiable info such as source URL.",
    llm_config=llm_config,
)
groupchat = GroupChat(
    agents=[admin, engineer, planner, executor, critic],
    messages=[],
    max_round=50,
)
manager = GroupChatManager(groupchat=groupchat, llm_config=llm_config)


admin.initiate_chat(
    manager,
    message="""
""",
)
```

本教程由 [@Nathan](https://gist.github.com/CUexter) 提供。
</TabItem>
<TabItem value="chatDev" label="ChatDev">

### 设置 ChatDev（[文档](https://github.com/OpenBMB/ChatDev#%EF%B8%8F-quickstart)）
```shell
git clone https://github.com/OpenBMB/ChatDev.git
cd ChatDev
conda create -n ChatDev_conda_env python={{python_version}} -y
conda activate ChatDev_conda_env
uv add -r requirements.txt
```
### 通过代理运行 ChatDev
```shell
export OPENAI_API_KEY="sk-<your-api-key>"
```

```shell
export OPENAI_BASE_URL="http://0.0.0.0:4000"
```
```shell
python3 run.py --task "a script that says hello world" --name "hello world"
```
</TabItem>
<TabItem value="langroid" label="Langroid">

```bash
uv add langroid
```

```python
from langroid.language_models.openai_gpt import OpenAIGPTConfig, OpenAIGPT

# configure the LLM
my_llm_config = OpenAIGPTConfig(
    #format: "local/[URL where LiteLLM proxy is listening]
    chat_model="local/localhost:4000",
    chat_context_length=2048,  # adjust based on model
)

# create llm, one-off interaction
llm = OpenAIGPT(my_llm_config)
response = mdl.chat("What is the capital of China?", max_tokens=50)

# Create an Agent with this LLM, wrap it in a Task, and
# run it as an interactive chat app:
from langroid.agent.base import ChatAgent, ChatAgentConfig
from langroid.agent.task import Task

agent_config = ChatAgentConfig(llm=my_llm_config, name="my-llm-agent")
agent = ChatAgent(agent_config)

task = Task(agent, name="my-llm-task")
task.run()
```

本教程由 [@pchalasani](https://github.com/pchalasani) 与 [Langroid](https://github.com/langroid/langroid) 提供。
</TabItem>
<TabItem value="gpt-pilot" label="GPT-Pilot">
GPT-Pilot 帮你用 AI 智能体搭建应用。[了解更多](https://github.com/Pythagora-io/gpt-pilot)

在你的 .env 里，把 openai 端点指向你的本地服务器。

```
OPENAI_ENDPOINT=http://0.0.0.0:4000
OPENAI_API_KEY=my-fake-key
```
</TabItem>
<TabItem value="guidance" label="guidance">
guidance 是一门用于控制大语言模型的语言。
https://github.com/guidance-ai/guidance

**注意**：Guidance 会发送 `stop_sequences` 这类额外参数，如果模型不支持，可能会导致调用失败。

**解决方法**：启动代理时加上 `--drop_params` 标志

```shell
litellm --model ollama/codellama --temperature 0.3 --max_tokens 2048 --drop_params
```

```python
import guidance

# set api_base to your proxy
# set api_key to anything
gpt4 = guidance.llms.OpenAI("{{openai_large}}", api_base="http://0.0.0.0:4000", api_key="anything")

experts = guidance('''
{{#system~}}
You are a helpful and terse assistant.
{{~/system}}

{{#user~}}
I want a response to the following question:
{{query}}
Name 3 world-class experts (past or present) who would be great at answering this?
Don't answer the question yet.
{{~/user}}

{{#assistant~}}
{{gen 'expert_names' temperature=0 max_tokens=300}}
{{~/assistant}}
''', llm=gpt4)

result = experts(query='How can I be more productive?')
print(result)
```
</TabItem>
</Tabs>

:::note
**参与贡献** 你也在某个项目里用这个服务器？欢迎把你的教程[贡献到这里](https://github.com/BerriAI/litellm)。

:::

## 高级

### 日志

代理会把请求和响应日志打印到 stdout。启动时加上 `--debug` 可以看到请求级日志，加上 `--detailed_debug` 可以看到更详细的日志。要持久化日志，可以在配置中通过 `litellm_settings.success_callback` 接入日志集成，参见 [日志记录](./proxy/logging)。

### 配置代理

如果你需要：
* 保存 API 密钥
* 设置 litellm 参数（例如丢弃未映射的参数、设置回退模型等）
* 设置模型专属参数（max tokens、temperature、api base、提示词模板）

这些配置既可以只在当前会话生效（通过 CLI），也可以跨重启持久保留（通过配置文件）。

#### 保存 API 密钥

CLI 不会存储 API 密钥。请在启动代理前把密钥设为环境变量，或者在配置文件中用 `os.environ/` 引用：

```shell
$ export OPENAI_API_KEY=sk-...
$ litellm --model {{openai_large}}
```

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

```shell
$ litellm --config config.yaml
```

LiteLLM 代理支持 litellm 支持的所有 API 密钥。各家提供商需要的环境变量见 [提供商](./providers/)，完整的配置文件参考见 [代理配置](./proxy/configs)。

例如：设置 api base、max tokens 和 temperature。

**仅当前会话生效**：
```shell
litellm --model ollama/llama2 \
  --api_base http://localhost:11434 \
  --max_tokens 250 \
  --temperature 0.5

# OpenAI-compatible server running on http://0.0.0.0:4000
```

### 性能

我们使用 [wrk](https://github.com/wg/wrk) 对 FastAPI 服务器做了 1 分钟的 50 万 HTTP 连接压测。

结果如下：

```shell
Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   156.38ms   25.52ms 361.91ms   84.73%
    Req/Sec    13.61      5.13    40.00     57.50%
  383625 requests in 1.00m, 391.10MB read
  Socket errors: connect 0, read 1632, write 1, timeout 0
```


## 支持与创始人交流

- [预约演示 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [社区 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 我们的邮箱 ✉️ ishaan@berri.ai / krrish@berri.ai