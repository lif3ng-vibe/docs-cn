---
title: 快速上手
description: 一条命令或一次点击即可启动 LiteLLM，约五分钟从零发出第一个网关请求；启动之后的一切操作都在管理界面里完成。
---

import Image from '@theme/IdealImage';
import ThemedVideo from '@site/src/components/ThemedVideo';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import QuickStartBox from '@site/src/components/QuickStartBox';
import {OneClickDeploy} from '@site/src/components/Conversion';

# 快速上手

LiteLLM 本身就是一个开箱即用的网关（gateway）。用一条命令（或一次点击）启动它，剩下的操作全在浏览器里完成：接入提供商（provider）、添加模型、创建密钥，并在内置的管理界面（Admin UI）里发送测试请求。本指南不需要任何配置文件。

<QuickStartBox variant="gateway" showTitle={false} heading="一分钟内跑起来" source="docker-quickstart">

命令跑完后，打开管理界面，接着就可以[添加你的模型](#3-添加第一个模型)、[创建虚拟密钥](#5-创建虚拟密钥)，并[从应用里调用网关](#6-从应用调用网关)。

</QuickStartBox>

详细的安装步骤见指南的后续部分。读完本页，你会得到一个运行在 `http://localhost:4000` 的 LiteLLM：模型已接好、虚拟密钥（virtual key）已签发，还有一个请求已经通过网关处理成功。

## 1. 启动 LiteLLM

```bash
curl -sSLO https://github.com/BerriAI/litellm/raw/main/docker/docker-compose.quickstart.yml
printf 'LITELLM_MASTER_KEY=sk-%s\nLITELLM_SALT_KEY=sk-%s\n' "$(openssl rand -hex 32)" "$(openssl rand -hex 32)" > .env
docker compose -f docker-compose.quickstart.yml up -d
```

这条命令会在 4000 端口拉起网关，同时启动一个 Postgres 数据库，用来存放你的模型、密钥和花费日志。这份 [compose 文件](https://github.com/BerriAI/litellm/blob/main/docker/docker-compose.quickstart.yml)只定义了这两个服务，现在就躺在你的工作目录里：启动前可以先读一遍，之后也可以编辑它来固定某个发布版本。

第二条命令会生成主密钥（master key），也就是下文每个请求都要用的凭证；没有它，代理服务器会拒绝启动。请保留 `.env` 文件：重新生成 `LITELLM_SALT_KEY` 会让数据库里已存的凭证全部无法读取。

<OneClickDeploy source="docker-quickstart" />

:::warning[两个密钥各自做什么]
本地运行时，上面的命令已经把这两个密钥写进了 `.env`，compose 文件缺了它们就起不来。一键部署时，请在提供商的环境中设置这两个变量。

`LITELLM_MASTER_KEY` 是网关的根凭证：每一次管理 API 调用都由它授权，默认还兼任管理界面的登录密码。任何拿到它的人都等于拿到完整管理权限，所以要像对待 root 密码一样保管它，不要提交进版本库，一旦泄露立即轮换。生成值里的 `sk-` 前缀只是约定，不是硬性要求。

`LITELLM_SALT_KEY` 负责加密你在界面里添加的提供商 API 密钥。它不支持原地轮换，请保管好生成值：日后改动会让所有已存储的凭证无法读取，只能重新录入。两个密钥的关系详见[密钥轮换](./master_key_rotations)。
:::

## 2. 登录管理界面

打开 [http://localhost:4000/ui](http://localhost:4000/ui)。用户名是 `admin`，密码是你的 `LITELLM_MASTER_KEY` 值，也就是刚生成的 `.env` 文件里的那个。

<Image img={require('../../img/ui_quickstart_login.png')} dark={require('../../img/ui_quickstart_login_dark.png')} alt="LiteLLM 管理界面登录页" />

## 3. 添加第一个模型

进入 **Models + Endpoints**，打开 **Add Model** 标签页，选择你的提供商和想开放的模型，再粘贴提供商的 API 密钥。LiteLLM 内置了各家提供商的模型目录，选模型就行，不用手动输入。

<Image img={require('../../img/ui_quickstart_add_model.png')} dark={require('../../img/ui_quickstart_add_model_dark.png')} alt="Add Model 表单，已选中 OpenAI 提供商和 gpt-5.5" />

点击 **Test Connect** 到提供商那边验证密钥，然后点 **Add Model**。新模型会出现在 **Deployed Models** 列表里，价格映射也已就绪：

<Image img={require('../../img/ui_quickstart_models_list.png')} dark={require('../../img/ui_quickstart_models_list_dark.png')} alt="Deployed Models 列表，显示新添加的模型及其成本数据" />

:::tip[不要把提供商密钥填进界面]
如果你更习惯用环境变量管理提供商密钥，可以下载 compose 文件，把密钥加到 `litellm` 服务里（例如 `OPENAI_API_KEY: ${OPENAI_API_KEY}`），然后在 API key 输入框填 `os.environ/OPENAI_API_KEY`，而不是明文密钥。
:::

## 4. 发送测试消息

进入 **Playground**，选中你的模型，发一条消息。请求经网关发往提供商，响应返回时带上了延迟和 Token 统计：

<Image img={require('../../img/ui_quickstart_playground.png')} dark={require('../../img/ui_quickstart_playground_dark.png')} alt="Playground 显示模型的实时响应，含延迟与 Token 指标" />

到这里网关已经全链路跑通。Playground 里的 **Get Code** 按钮能生成与你所用语言等价的 API 调用代码。

## 5. 创建虚拟密钥

虚拟密钥是交给应用和同事用的，用来替代原始的提供商密钥。每个密钥可以带上自己的预算、速率限制和可访问的模型，其全部花费会被自动追踪。

进入 **Virtual Keys**，点击 **+ Create New Key**，给它起个名字，再点 **Create Key**：

<Image img={require('../../img/ui_quickstart_create_key.png')} dark={require('../../img/ui_quickstart_create_key_dark.png')} alt="Save your Key 弹窗，显示新建的虚拟密钥" />

现在就把密钥复制下来，它只会显示这一次。

## 6. 从应用调用网关

网关兼容 OpenAI 接口，任何 OpenAI SDK 只要把地址指向 `http://localhost:4000`、用你的虚拟密钥做认证即可。

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl http://localhost:4000/v1/chat/completions \
  -H 'Authorization: Bearer sk-<your-virtual-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Say hello in five words."}]
  }'
```

预期响应：

```json
{
  "id": "chatcmpl-DzGKiNRbQ4fe9Mgt8HSHFQ6ApfRJi",
  "model": "{{openai_large}}",
  "object": "chat.completion",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "Hello, nice to meet you.",
        "role": "assistant"
      }
    }
  ],
  "usage": {
    "completion_tokens": 70,
    "prompt_tokens": 12,
    "total_tokens": 82
  }
}
```

</TabItem>
<TabItem value="python" label="OpenAI Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-<your-virtual-key>",
)

response = client.chat.completions.create(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Say hello in five words."}],
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="js" label="OpenAI JS SDK">

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:4000",
  apiKey: "sk-<your-virtual-key>",
});

const response = await client.chat.completions.create({
  model: "{{openai_large}}",
  messages: [{ role: "user", content: "Say hello in five words." }],
});
console.log(response.choices[0].message.content);
```

</TabItem>
</Tabs>

## 全流程演示

<ThemedVideo
  src={require('../../img/ui_quickstart_flow.mp4')}
  dark={require('../../img/ui_quickstart_flow_dark.mp4')}
  poster={require('../../img/ui_quickstart_flow_poster.png')}
  darkPoster={require('../../img/ui_quickstart_flow_poster_dark.png')}
  title="操作演示：添加模型、在 Playground 里测试、创建虚拟密钥"
/>

## 无数据库运行

如果你只需要 OpenAI 兼容接口（不需要管理界面的模型管理、虚拟密钥和花费追踪），也可以用配置文件直接运行原生 `litellm` 镜像：

```yaml
# litellm_config.yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

```bash
docker run \
  -v $(pwd)/litellm_config.yaml:/app/config.yaml \
  -e OPENAI_API_KEY=<your-openai-key> \
  -e LITELLM_MASTER_KEY=sk-<paste-a-long-random-key> \
  -p 4000:4000 \
  docker.litellm.ai/berriai/litellm:latest \
  --config /app/config.yaml
```

请求用主密钥认证。配置文件支持的全部选项见[完整配置参考](./configs.md)。

:::warning[无数据库时预算不会生效]

在这条路径上，`litellm_settings.max_budget` 起不到花费上限的作用。读取代理的全局花费需要数据库客户端，没有它，累计花费始终未知，全局预算检查也就永远不会触发；配置了 `max_budget: 100` 的代理在花费超过 $100 后照样处理请求，不报错，也不发预算告警。预算已配置但未连接数据库时，代理会在启动时记录一条一次性警告，这条启动日志是你能得到的唯一信号。

密钥和团队预算在这里也帮不上忙，因为虚拟密钥本身就依赖数据库（携带虚拟密钥的请求会直接报 `No connected db.`），于是主密钥成了唯一的凭证，而它自己没有预算约束。

如果预算是你控制花费的手段之一，请按本页开头的做法让 LiteLLM 连接数据库运行。不连数据库的话，就改在上游设限，靠提供商自身的消费限额兜底。

:::

## 后续步骤

准备上生产环境：[生产部署指南](./deploy.md)介绍在 AWS、GCP 和 Azure 上用 Helm、Terraform 和 Kubernetes 部署，[生产检查清单](./prod.md)覆盖加固与调优。完整的容器与数据库选项（包括 Redis 和 Prometheus）见仓库里的 [docker-compose.yml](https://github.com/BerriAI/litellm/blob/main/docker-compose.yml)。
