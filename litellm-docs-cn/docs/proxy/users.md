import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 预算与速率限制

:::info[**预算设置方式**]
**个人预算**：创建不带 team_id 的虚拟密钥（virtual key），设置个人花费限额

**团队预算**：在虚拟密钥上附加 team_id，使用团队的共享预算

**团队成员预算**：在团队共享预算之内为成员设置个人花费限额

**智能体预算**：为智能体设置速率限制（tpm/rpm）和会话级上限（迭代次数、美元预算）[**跳转**](#智能体agent)

***密钥属于某个团队时，只执行团队（及团队成员）预算，密钥所有者的个人预算不生效。`v1.94.0` 曾短暂地在 `skip_user_budget_on_team_key` 退出项之下同时执行个人预算；该执行逻辑与该标志均已在 `v1.95.0` 移除。***
:::

前提条件：

- 需要一个 PostgreSQL 数据库（例如 [Supabase](https://supabase.com/)、[Neon](https://neon.tech/) 等）[**查看配置**](./virtual_keys.md#设置)

:::warning[预算需要数据库]

本页的每种预算都依据从数据库读取的花费来执行，因此在[无数据库（DB-less）部署](./docker_quick_start.md#无数据库运行)上它们都起不到限制作用。`litellm_settings.max_budget` 在这种场景下是失效开放（fail open）而非报错：代理（proxy）的全局花费只在存在数据库客户端时才加载，没有总量可比对时，全局预算检查会被跳过，请求超过限额后仍会被继续服务。设置了预算却没有连接数据库时，启动阶段会记录一次警告，但请求时不会拦截。密钥、团队和用户预算出于同样原因不可用，因为没有数据库就无法解析虚拟密钥（`No connected db.`）。如果预算是你控制花费的手段之一，请务必带上数据库运行

:::


## 设置预算

### 全局代理

对代理上的所有调用统一应用一份预算

**第 1 步：修改 config.yaml**

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY

litellm_settings:
  # other litellm settings
  max_budget: 0 # (float) sets max budget as $0 USD
  budget_duration: 30d # (str) frequency of reset - You can set duration as seconds ("30s"), minutes ("30m"), hours ("30h"), days ("30d").
```

**第 2 步：启动代理**

```bash
litellm /path/to/config.yaml
```

**第 3 步：发送测试请求**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header "Autherization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
}'
```
### 团队

你可以：
- 为团队添加预算

:::info

**下面是在团队上设置与重置预算的分步教程（通过 API 或管理界面（Admin UI））**


#### 为团队添加预算
```shell 
curl --location 'http://localhost:4000/team/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "team_alias": "my-new-team_4",
  "members_with_roles": [{"role": "admin", "user_id": "5c4a0aa3-a1e1-43dc-bd87-3c2da8382a3a"}],
  "rpm_limit": 99
}' 
```

[**查看 Swagger**](https://docs.litellm.ai/api-reference/#/team%20management/new_team_team_new_post)

**响应示例**

```shell
{
    "team_alias": "my-new-team_4",
    "team_id": "13e83b19-f851-43fe-8e93-f96e21033100",
    "admins": [],
    "members": [],
    "members_with_roles": [
        {
            "role": "admin",
            "user_id": "5c4a0aa3-a1e1-43dc-bd87-3c2da8382a3a"
        }
    ],
    "metadata": {},
    "tpm_limit": null,
    "rpm_limit": 99,
    "max_budget": null,
    "models": [],
    "spend": 0.0,
    "max_parallel_requests": null,
    "budget_duration": null,
    "budget_reset_at": null
}
```

#### 为团队添加预算周期

`budget_duration`：预算会在指定周期结束时重置；不设置则永不重置。周期可按秒（"30s"）、分钟（"30m"）、小时（"30h"）、天（"30d"）设置。

```
curl 'http://0.0.0.0:4000/team/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "team_alias": "my-new-team_4",
  "members_with_roles": [{"role": "admin", "user_id": "5c4a0aa3-a1e1-43dc-bd87-3c2da8382a3a"}],
  "budget_duration": "30s",
}'
```

### 团队成员

当你想为团队成员在团队内的花费设置预算时使用


#### 第 1 步：创建用户

创建一个 `user_id=ishaan` 的用户

```shell
curl --location 'http://0.0.0.0:4000/user/new' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
        "user_id": "ishaan"
}'
```

#### 第 2 步：将用户加入现有团队并设置 `max_budget_in_team`

把用户加入团队时设置 `max_budget_in_team`。这里使用第 1 步中设置的同一个 `user_id`

```shell
curl -X POST 'http://0.0.0.0:4000/team/member_add' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{"team_id": "e8d1460f-846c-45d7-9b43-55f3cc52ac32", "max_budget_in_team": 0.000000000001, "member": {"role": "user", "user_id": "ishaan"}}'
```

#### 第 3 步：为第 1 步的团队成员创建密钥

设置第 1 步中的 `user_id=ishaan`

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
        "user_id": "ishaan",
        "team_id": "e8d1460f-846c-45d7-9b43-55f3cc52ac32"
}'
```
`/key/generate` 的响应

第 4 步会用到该响应中的 `key`
```shell
{"key":"sk-RV-l2BJEZ_LYNChSx2EueQ", "models":[],"spend":0.0,"max_budget":null,"user_id":"ishaan","team_id":"e8d1460f-846c-45d7-9b43-55f3cc52ac32","max_parallel_requests":null,"metadata":{},"tpm_limit":null,"rpm_limit":null,"budget_duration":null,"allowed_cache_controls":[],"soft_budget":null,"key_alias":null,"duration":null,"aliases":{},"config":{},"permissions":{},"model_max_budget":{},"key_name":null,"expires":null,"token_id":null}% 
```

#### 第 4 步：为团队成员发起 /chat/completions 请求

该请求使用第 3 步返回的密钥。发 2 到 3 次请求后，会看到如下报错 `ExceededBudget: Crossed spend within team` 


```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header 'Authorization: Bearer sk-RV-l2BJEZ_LYNChSx2EueQ' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "llama3",
    "messages": [
        {
        "role": "user",
        "content": "tes4"
        }
    ]
}'
```

#### 更新团队成员的预算

用 `/team/member_update` 更新已有团队成员的 `max_budget_in_team`。新预算从该成员的下一次请求开始生效

这样该成员就拥有了自己的预算，不再跟随团队的 `team_member_budget` 默认值，之后通过 `/team/update` 修改该默认值也不会影响到这个成员。想调整仍在使用默认值的全部成员的预算，应改为在 `/team/update` 上更新 `team_member_budget`

```shell
curl -X POST 'http://0.0.0.0:4000/team/member_update' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{"team_id": "e8d1460f-846c-45d7-9b43-55f3cc52ac32", "user_id": "ishaan", "max_budget_in_team": 10}'
```

成员在这个团队里已经累积的花费会计入新预算。参见[已有花费会计入后补的预算](#已有花费会计入后补的预算)

预算修改是永久性的。成员的 `budget_duration` 窗口滚动时，重置只会把其当前周期的花费归零并顺延下一次重置日期，因此调高后的 `max_budget_in_team` 在之后的每个周期都保持新值，不会回退到旧金额或团队默认值。通过 `/team/update` 调高 `team_member_budget` 时，仍在使用团队默认值的成员也是同样的行为

按这种方式给仍在团队默认值上的成员设置专属预算时，其当前重置窗口会延续，下一次重置日期与之前一致。如果在同一次 `/team/member_update` 调用里同时传入 `budget_duration`，则会从该时点开启一个新窗口

想临时调高某位成员的预算，可以在 `/team/member_update` 上同时传入 `temp_budget_increase` 与 `temp_budget_expiry`（一个 UTC 时间），也可以在 UI 中编辑该成员时填写 **临时预算上调**（美元）和**临时预算到期时间（UTC）**。上调额度会叠加在该成员的预算之上（若其仍在团队默认值上，则叠加在默认值之上），直到 `temp_budget_expiry` 自动失效，期间无需任何操作。失效时间就是到期那一刻，而不是等到下一次预算重置；如果只想让它覆盖当前周期，就把到期时间设为该成员的下一次重置时间。仅在团队默认值上获得临时上调的成员仍留在团队默认值上；对完全没有预算的成员，临时上调不起任何作用

```shell
curl -X POST 'http://0.0.0.0:4000/team/member_update' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{"team_id": "e8d1460f-846c-45d7-9b43-55f3cc52ac32", "user_id": "ishaan", "temp_budget_increase": 25, "temp_budget_expiry": "2026-11-01T00:00:00Z"}'
```

想让已有自定义预算的成员回到团队默认值，可以在团队的 **成员**标签页中点击其预算旁的**使用团队默认值**，或调用 `POST /team/{team_id}/member/{user_id}/reset_budget`。其花费会保留，之后 `/team/update` 对 `team_member_budget` 的修改会重新对其生效。此功能自 `v1.104.0` 起可用

#### 重置团队成员的花费

在不改动预算本身的前提下，重置成员团队内预算所追踪的花费。重置的是成员当前周期的花费，也就是与其预算比对的那个数值；其累计花费与日志均不受影响。代理管理员、该团队或其组织的管理员都可以调用。团队管理员不能重置自己的花费，这只有代理管理员能做

<Tabs>
<TabItem value="ui" label="UI">

1. 进入 **团队** 页并打开该团队
2. 打开 **成员** 标签页
3. 在成员所在行的 **操作**列中，点击**重置花费** 图标（位于编辑和删除图标之间的刷新图标）
4. **重置团队成员花费**对话框会显示该成员及其当前周期花费。点击**重置** 即可归零

该图标只对能编辑此团队的用户显示，且只在该行 **当前周期花费（美元）** 大于 $0 时出现。团队管理员在自己的行上看不到它，代理管理员则可以看到

</TabItem>
<TabItem value="api" label="API">

```shell
curl -X POST 'http://0.0.0.0:4000/team/e8d1460f-846c-45d7-9b43-55f3cc52ac32/member/ishaan/reset_spend' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{"reset_to": 0}'
```

`reset_to` 必须是不小于 0、且不大于该成员当前花费或其预算的数字

响应：

```shell
{"team_id":"e8d1460f-846c-45d7-9b43-55f3cc52ac32","user_id":"ishaan","spend":0.0,"previous_spend":3.495e-05,"max_budget":10.0}
```

团队管理员对自己操作时，该端点返回 403（`Cannot reset your own spend. Ask a proxy admin.`）；若用户在该团队中没有成员记录，则返回 404

</TabItem>
</Tabs>

重置在该成员的下一次请求上生效，且作用于每个代理实例。一次只能重置一名成员，没有批量接口，需要逐个成员执行

#### 已有花费会计入后补的预算

每个团队成员的花费都会被追踪，包括没有预算的成员。在团队的 **成员** 标签页中，**当前周期花费（美元）** 是与其预算比对的那个数值，成员的 `budget_duration` 窗口滚动时会归零；**累计花费（美元）** 则是累加值，从不重置。没有预算的成员没有预算窗口，因此其当前周期花费不会自动重置，会一直累积。旧版本只追踪有预算成员的花费，在这些版本上添加的成员，会在升级后的下一次请求开始被追踪

如果之后才给该成员配预算，其已累积的花费会立即计入。无论是通过 `/team/update` 为团队设置 `team_member_budget`（这会把团队成员预算关联到所有还没有预算的成员），还是通过 `/team/member_update` 为单个成员设置 `max_budget_in_team`，都是如此。例如某成员在没有预算的情况下花了 $500，管理员随后为其设置 $100 的成员预算，那么该成员的下一次请求就会因超出预算而被拒绝

有两种解法。如果新预算带有 `budget_duration`，成员的当前周期花费会在下一次重置时归零，无需任何操作即可恢复。如果没有 `budget_duration`，成员会一直被拦，直到有人在 UI 中或通过 API [重置其花费](#重置团队成员的花费)


### 内部用户

为内部用户（internal user，即密钥所有者）在代理上能发起的所有调用设置预算。

:::info

设置了 `team_id` 的密钥不执行这份个人预算，而是执行团队（及团队成员）预算。`v1.94.0` 曾通过 `skip_user_budget_on_team_key` 退出项在团队预算之外同时执行个人预算，`v1.95.0` 已把两者都移除。

想为团队内的用户设置预算，请使用团队成员预算。

:::

LiteLLM 提供 `/user/new` 端点用于创建这类预算。

你可以：
- 为用户添加预算 [**跳转**](#为用户添加预算)
- 添加预算周期以重置花费 [**跳转**](#为用户添加预算周期)

默认情况下 `max_budget` 为 `null`，密钥不做预算检查

#### 为用户添加预算
```shell 
curl --location 'http://localhost:4000/user/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"models": ["azure-models"], "max_budget": 0, "user_id": "krrish3@berri.ai"}' 
```

[**查看 Swagger**](https://docs.litellm.ai/api-reference/#/Internal%20User%20management/new_user_user_new_post)

**响应示例**

```shell
{
    "key": "sk-YF2OxDbrgd1y2KgwxmEA2w",
    "expires": "2023-12-22T09:53:13.861000Z",
    "user_id": "krrish3@berri.ai",
    "max_budget": 0.0
}
```

#### 为用户添加预算周期

`budget_duration`：预算会在指定周期结束时重置；不设置则永不重置。周期可按秒（"30s"）、分钟（"30m"）、小时（"30h"）、天（"30d"）设置。

```
curl 'http://0.0.0.0:4000/user/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "team_id": "core-infra", # [OPTIONAL]
  "max_budget": 10,
  "budget_duration": "30s",
}'
```

#### 为已有用户创建新密钥

现在只需带上该 user_id（即 krrish3@berri.ai）调用 `/key/generate`，并且：
- **预算检查**：该密钥会按 krrish3@berri.ai 的预算（即 $10）进行检查
- **花费追踪**：该密钥的花费也会计入 krrish3@berri.ai 的花费

```bash
curl --location 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data '{"models": ["azure-models"], "user_id": "krrish3@berri.ai"}'
```

### 虚拟密钥

为单个密钥设置预算。

你可以：
- 为密钥添加预算 [**跳转**](#为密钥添加预算)
- 添加预算周期以重置花费 [**跳转**](#为密钥添加预算周期)

**预期行为**
- 每个密钥的花费会自动写入 `LiteLLM_VerificationToken` 表
- 密钥超出其 `max_budget` 后，请求会失败
- 若设置了周期，花费会在周期结束时重置

默认情况下 `max_budget` 为 `null`，密钥不做预算检查

#### 为密钥添加预算

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "team_id": "core-infra", # [OPTIONAL]
  "max_budget": 10,
}'
```

密钥超出预算后，`/chat/completions` 的请求示例

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <generated-key>' \
  --data ' {
  "model": "azure-gpt-3.5",
  "user": "e09b4da8-ed80-4b05-ac93-e16d9eb56fca",
  "messages": [
      {
      "role": "user",
      "content": "respond in 50 lines"
      }
  ],
}'
```


密钥超出预算后，`/chat/completions` 的预期响应
```shell
{
  "detail":"Authentication Error, ExceededTokenBudget: Current spend for token: 7.2e-05; Max Budget for Token: 2e-07"
}   
```

#### 为密钥添加预算周期

`budget_duration`：预算会在指定周期结束时重置；不设置则永不重置。周期可按秒（"30s"）、分钟（"30m"）、小时（"30h"）、天（"30d"）设置。

```
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "team_id": "core-infra", # [OPTIONAL]
  "max_budget": 10,
  "budget_duration": "30s",
}'
```

#### 在密钥上设置多个预算窗口

在同一个密钥上同时施加多个不同时间尺度的预算上限，例如让一个密钥同时受 **每天 $10** 和 **每月 $100** 的约束。

**什么时候有用？**

单个 `budget_duration` 窗口无法避免某一天失控消耗掉整月额度。多个预算窗口可以让你：

- 在当天内拦住失控的用量尖峰，同时不影响正常的月度消耗。
- 为 Claude Code 的使用配一条日防护栏（`24h`）和一条月上限（`30d`），一次重度会话就不会耗光整月额度。
- 在每周上限之下，为突发型负载叠加更细粒度的小时限额。

:::info

想进一步了解预算如何作用于密钥、团队和用户，参见[用户预算文档](https://docs.litellm.ai/docs/proxy/users)。

:::

**通过 API**

以列表形式传入 `budget_limits`，元素为 `{budget_duration, max_budget}` 对象：

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "budget_limits": [
    {"budget_duration": "24h",  "max_budget": 10},
    {"budget_duration": "30d",  "max_budget": 100}
  ]
}'
```

每个窗口独立追踪，并按各自的时间表重置：

| `budget_duration` | 重置时机 |
|---|---|
| `1h`  | 每小时 |
| `24h` | 每天 UTC 零点 |
| `7d`  | 每周一 UTC 零点（或配置的重置时间） |
| `30d` | 每月 1 日 UTC 零点 |

**通过仪表板（Dashboard）**

打开 **虚拟密钥 → 创建密钥 → 可选设置 → 预算窗口**。

<Image img={require('../../img/key_budget_window_1.png')} dark={require('../../img/key_budget_window_1_dark.png')} alt="密钥表单中的预算窗口区域" />

点击 **+ 添加预算窗口** 新增一行，从下拉框中选择周期并填写花费上限。

<Image img={require('../../img/key_budget_window_2.png')} dark={require('../../img/key_budget_window_2_dark.png')} alt="包含周期与花费上限的预算窗口行" />

再添加一行设置另一个时间尺度（例如在每天 $10 之上再加每月 $100）。

<Image img={require('../../img/key_budget_window_3.png')} dark={require('../../img/key_budget_window_3_dark.png')} alt="两个不同周期的预算窗口" />

每个窗口的输入框下方都会显示重置时间表，花费何时重置一目了然。

<Image img={require('../../img/key_budget_window_4.png')} dark={require('../../img/key_budget_window_4_dark.png')} alt="每个预算窗口下方显示的重置时间表" />


### ✨ 虚拟密钥（按模型）

为虚拟密钥可用的每个模型分别设置预算。例如同一个密钥可以有：

- `{{openai_large}}` 每天 $0.0000001 的预算
- `{{openai_small}}` 每 30 天 $10 的预算

<EnterpriseFeature />

`model_max_budget` 使用 **[`Dict[str, GenericBudgetInfo]`](#genericbudgetinfo)** 这一 schema。

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "model_max_budget": {"{{openai_large}}": {"budget_limit": "0.0000001", "time_period": "1d"}}
}'
```

**通过仪表板**

要给新密钥添加按模型预算，进入 **虚拟密钥 → 创建密钥 → 可选设置 → 按模型预算**。要更新已有密钥，打开该密钥的编辑页并使用同一区域。

![密钥表单上的按模型预算](https://raw.githubusercontent.com/yassin-berriai/litellm-pr-media/main/lit-5894/key-per-model-budget-empty.png)

点击 **+ 添加模型预算**，选择模型、设置花费上限并选择预算周期。每个模型都有独立的追踪和重置时间表，例如一个模型的日限额不影响另一个模型的月限额。限额可以小于 $0.01。

![填写完成的按模型预算](https://raw.githubusercontent.com/yassin-berriai/litellm-pr-media/main/lit-5894/key-per-model-budget-filled.png)

#### LiteLLM 如何匹配模型名

LiteLLM 会将预算与请求中的模型名及其带提供商前缀的形式进行匹配。例如为 `claude-opus-4-8` 设置的预算，对使用以下任意名称的请求都生效：

- `claude-opus-4-8`
- `anthropic/claude-opus-4-8`
- `bedrock/anthropic.claude-opus-4-8`
- `us.anthropic.claude-opus-4-8`

设置预算时使用 `model_list` 中配置的名称。如果同一个模型以多个名称路由，请使用不带前缀的模型系列名，这样一份预算即可覆盖所有受支持的变体。

#### 查看当前用量

`/key/info` 会在返回 `model_max_budget` 的同时返回 `model_max_budget_usage`。对每个设了预算的模型，它会报告当前预算周期内的花费金额。LiteLLM 用同一个用量数值执行预算检查，因此上报的用量与实际执行口径一致。

```bash
curl -X GET 'http://0.0.0.0:4000/key/info?key=sk-...' \
--header 'Authorization: Bearer <your-master-key>'
```

```json
{
  "info": {
    "model_max_budget": {"{{openai_large}}": {"budget_limit": 0.0001, "time_period": "30d"}},
    "model_max_budget_usage": {
      "{{openai_large}}": {"current_spend": 0.0002, "budget_limit": 0.0001, "time_period": "30d"}
    }
  }
}
```

如果某个模型的 `time_period` 缺失或非法，该模型不会出现在 `model_max_budget_usage` 中，而不是以零用量上报。

#### 测试预算

按上文设置的较小的 `{{openai_large}}` 预算，第一次请求应当成功；密钥超出限额后，第二次请求会被拒绝。

**[LangChain 与 OpenAI SDK 的用法示例](../proxy/user_keys#请求格式)**

<Tabs>
<TabItem label="成功调用" value="allowed">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <sk-generated-key>' \
--data ' {
      "model": "{{openai_large}}",
      "messages": [
        {
          "role": "user",
          "content": "testing request"
        }
      ]
    }
'
```

</TabItem>
<TabItem label="被拒绝的调用" value="not-allowed">

再次发送同一请求。密钥超出其 `{{openai_large}}` 预算后，LiteLLM 会拒绝它。

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <sk-generated-key>' \
--data ' {
      "model": "{{openai_large}}",
      "messages": [
        {
          "role": "user",
          "content": "testing request"
        }
      ]
    }
'
```

预期响应：

```json
{
    "error": {
        "message": "LiteLLM Virtual Key: 9769f3f6768a199f76cc29xxxx, key_alias: None, exceeded budget for model={{openai_large}}",
        "type": "budget_exceeded",
        "param": null,
        "code": "400"
    }
}
```

</TabItem>
</Tabs>

按模型预算超限时，LiteLLM 默认返回 `budget_exceeded` 错误。想让请求改路由到其他模型，参见[预算回退](./budget_fallbacks)。

### ✨ 内部用户（按模型）

内部用户的按模型预算会把一条限制作用于该用户名下的所有密钥，防止用户通过另建密钥绕开限制。例如，在工程师持有多把密钥的情况下，用这个层级给每位工程师设置每月 $200 的 Opus 预算。

<EnterpriseFeature />

`model_max_budget` 使用与密钥级设置相同的 **[`Dict[str, GenericBudgetInfo]`](#genericbudgetinfo)** schema。可通过 `/user/new` 或 `/user/update` 配置。

```bash
curl 'http://0.0.0.0:4000/user/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "user_id": "engineer-1",
  "model_max_budget": {"{{anthropic_large}}": {"budget_limit": 200, "time_period": "1mo"}}
}'
```

`1mo` 表示自然月预算，每月 1 日重置。用户超出限额后，LiteLLM 会拒绝该用户任何密钥发起的请求：

```json
{
    "error": {
        "message": "LiteLLM User: engineer-1, exceeded budget for model={{anthropic_large}}",
        "type": "budget_exceeded",
        "param": null,
        "code": "429"
    }
}
```

`/user/info` 会在 `model_max_budget_usage` 中以与 `/key/info` 相同的格式返回各模型当前预算周期的花费。

**通过仪表板**

进入 **内部用户**，选择该用户，然后打开 **详情 → 编辑 → 按模型预算**。对每个已有预算，仪表板都会显示当前周期内的花费金额。

![内部用户上的按模型预算](https://raw.githubusercontent.com/yassin-berriai/litellm-pr-media/main/lit-5894/user-per-model-budget.png)

用户级与密钥级预算独立追踪。如果密钥有自己的按模型预算，每次请求会同时计入密钥预算和所有者的用户预算，任一限额超限都会被 LiteLLM 拒绝。


### 智能体（Agent）

可以为注册到 LiteLLM [Agent Gateway](../a2a.md) 的智能体（agent）设置预算和速率限制。可控制：
- **按智能体的速率限制**：智能体自身的 `tpm_limit` 和 `rpm_limit`
- **按会话的速率限制**：逐会话生效的 `session_tpm_limit` 和 `session_rpm_limit`
- **单会话迭代上限**：智能体 `litellm_params` 中的 `max_iterations`
- **单会话预算上限**：智能体 `litellm_params` 中的 `max_budget_per_session`

<Tabs>
<TabItem value="agent-rate-limits" label="智能体速率限制">

在智能体上设置 `tpm_limit` 和 `rpm_limit`，限制所有会话的总吞吐。

```bash
curl -X POST 'http://localhost:4000/v1/agents' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_name": "my-research-agent",
    "agent_card_params": {
      "name": "my-research-agent",
      "description": "A research agent",
      "url": "http://my-agent:8080",
      "version": "1.0.0"
    },
    "tpm_limit": 100000,
    "rpm_limit": 100
  }'
```

</TabItem>
<TabItem value="session-rate-limits" label="会话速率限制">

设置 `session_tpm_limit` 和 `session_rpm_limit`，限制单个会话的吞吐。

```bash
curl -X POST 'http://localhost:4000/v1/agents' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_name": "my-research-agent",
    "agent_card_params": {
      "name": "my-research-agent",
      "description": "A research agent",
      "url": "http://my-agent:8080",
      "version": "1.0.0"
    },
    "session_tpm_limit": 50000,
    "session_rpm_limit": 50
  }'
```

</TabItem>
<TabItem value="session-budgets" label="会话预算">

在智能体 `litellm_params` 中设置 `max_iterations` 和 `max_budget_per_session` 来限制单个会话。需要 `require_trace_id_on_calls_by_agent`，LiteLLM 才能按会话追踪调用。

```bash
curl -X POST 'http://localhost:4000/v1/agents' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_name": "my-research-agent",
    "agent_card_params": {
      "name": "my-research-agent",
      "description": "A research agent",
      "url": "http://my-agent:8080",
      "version": "1.0.0"
    },
    "litellm_params": {
      "require_trace_id_on_calls_by_agent": true,
      "max_iterations": 25,
      "max_budget_per_session": 5.00
    }
  }'
```

会话超出限制时，请求会收到 **429 Too Many Requests** 响应。

完整细节参见[智能体迭代预算](../a2a_iteration_budgets)指南。

</TabItem>
</Tabs>

:::info

也可以用 `PATCH /v1/agents/{agent_id}` 更新已有智能体的速率限制：

```bash
curl -X PATCH 'http://localhost:4000/v1/agents/<agent_id>' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "tpm_limit": 200000,
    "rpm_limit": 200,
    "session_tpm_limit": 50000,
    "session_rpm_limit": 50
  }'
```

:::


### 客户

用它来给传给 `/chat/completions` 的 `user` 设预算，**无需为每个用户都创建密钥**

**第 1 步：创建预算**

```shell
curl --location 'http://0.0.0.0:4000/budget/new' \
        --header "Authorization: Bearer $LITELLM_API_KEY" \
        --header 'Content-Type: application/json' \
        --data '{
        "budget_id": "default-customer-budget",
        "max_budget": 0.0001
        }'
```

**第 2 步：在 config.yaml 中把 `max_end_user_budget_id` 指向该预算**

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY

litellm_settings:
  max_end_user_budget_id: "default-customer-budget" # applied to any 'user' without their own budget
```

这份预算对所有没有自己预算的客户生效，包括数据库里还不存在的客户。LiteLLM 会缓存预算对象 60 秒，因此对它的修改最多需要一分钟才会生效。浮点数配置 `max_end_user_budget` 已不再生效；如果配置里还有它，请按上面的方式替换为 `max_end_user_budget_id`。

3. 发起一次 /chat/completions 调用并传入 'user'，第一次调用成功 
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header 'Authorization: Bearer sk-zi5onDRdHGD24v0Zdn7VBA' \
        --data ' {
        "model": "azure-gpt-3.5",
        "user": "ishaan3",
        "messages": [
            {
            "role": "user",
            "content": "what time is it"
            }
        ]
        }'
```

4. 再发起一次 /chat/completions 调用并传入 'user'，这次调用失败，因为 'ishaan3' 已超预算
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header 'Authorization: Bearer sk-zi5onDRdHGD24v0Zdn7VBA' \
        --data ' {
        "model": "azure-gpt-3.5",
        "user": "ishaan3",
        "messages": [
            {
            "role": "user",
            "content": "what time is it"
            }
        ]
        }'
```

报错：
```shell
{"error":{"message":"ExceededBudget: End User=ishaan3 over budget. Spend=0.0008869999999999999, Budget=0.0001","type":"auth_error","param":"None","code":401}}%
```

客户预算在每个部署内全局有效。花费只按客户 id 归集，因此同一客户在所有虚拟密钥和团队之间共享同一个预算，客户预算也无法单独限定到某个密钥或团队。

## 重置预算

可为密钥/内部用户/团队/客户重置预算

`budget_duration`：预算在指定时长结束时重置。不设置则永不重置。时长可以用秒（"30s"）、分钟（"30m"）、小时（"30h"）、天（"30d"）为单位。

<Tabs>
<TabItem value="users" label="内部用户">

```bash
curl 'http://0.0.0.0:4000/user/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "max_budget": 10,
  "budget_duration": "30s", # 👈 KEY CHANGE
}'
```
</TabItem>
<TabItem value="keys" label="密钥">

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "max_budget": 10,
  "budget_duration": "30s", # 👈 KEY CHANGE
}'
```

</TabItem>
<TabItem value="teams" label="团队">

```bash
curl 'http://0.0.0.0:4000/team/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "max_budget": 10,
  "budget_duration": "30s", # 👈 KEY CHANGE
}'
```
</TabItem>
</Tabs>

**注意**：默认情况下，为减少数据库调用，服务器每 10 分钟检查一次是否需要重置。

如需调整，可设置 `proxy_budget_rescheduler_min_time` 和 `proxy_budget_rescheduler_max_time`

例如：每 1 秒检查一次
```yaml
general_settings: 
  proxy_budget_rescheduler_min_time: 1
  proxy_budget_rescheduler_max_time: 1
```

## 回退到"免费"模型

当密钥/用户/团队已到预算上限时，配置了 `input_cost_per_token: 0` 和 `output_cost_per_token: 0` 的模型仍可正常请求。零成本模型完全跳过预算检查。

这样可以把免费或自托管模型配置成兜底选项，让预算耗尽的密钥仍然有模型可用。

要把模型标记为免费，在 `config.yaml` 中把两个成本字段都显式设为 `0`：

```yaml
model_list:
  - model_name: my-free-model
    litellm_params:
      model: ollama/llama3
      input_cost_per_token: 0
      output_cost_per_token: 0
```

**注意**：成本字段必须显式设为 `0`。如果未设置（`null` 或缺省），模型不会被当作免费模型，预算检查照常生效。

## 预算预留

预算预留（budget reservation）默认开启。它在提供商处理请求之前先为请求记账，帮助在并发流量下管住预算。

### 工作原理

1. LiteLLM 根据请求体和模型定价估算请求的最大成本。
2. 在适用的预算中临时预留这笔金额。
3. 如果预留会超出预算，LiteLLM 在请求发往提供商之前就将其拒绝。
4. 响应定价完成后，LiteLLM 用实际成本替换预留额。

请求带 `max_tokens` 或 `max_completion_tokens` 时，LiteLLM 用该值参与估算；否则使用模型已配置的上限。对于没有 Token 定价的路由（部分图像和音频路由），LiteLLM 无法预留成本，改为按已记录的花费执行预算。

### 关闭预算预留

只有当未冲销的预留导致请求完成后仍出现意外的 `BudgetExceededError` 响应时，才把关闭预留当作临时缓解手段：

```yaml
general_settings:
  disable_budget_reservation: true
```

:::warning

关闭预留后，并发请求可能超出已配置的预算，因为每个请求只对照已记录的花费来评估。

:::

预算已经耗尽时请求仍会被拒绝。预留关闭期间，LiteLLM 也会为每个请求记录一条警告。

如果预算在 Redis 不可用或数据过期时也必须是硬上限，请保持预留开启，并同时配置 [`fail_closed_budget_enforcement`](#硬性预算强制执行fail-closed)。

### 批处理请求

预算预留无法估算批处理作业的完整成本。`POST /batches` 请求携带的是 `input_file_id` 而不是文件里的提示词，LiteLLM 因此无法在提交时给整个工作负载定价。提交时的预留会在提交响应后释放，LiteLLM 在批处理完成时记录最终成本。

用[批处理速率限制](../batches#batches-api-限流的工作方式)控制批处理吞吐，并监控已完成批处理的成本用于预算报表。

## 硬性预算强制执行（fail closed）

预算检查从 Redis 中的跨 Pod 计数器读取当前花费，这保证了各个 worker 和副本之间的执行既快又一致。热路径上以计数器为准，数据库在后台对账。如果 Redis 重启后加载了较旧的快照，计数器可能低于数据库中已记录的花费；热路径会信任这个过期值，密钥因此可能在计数器被纠正之前持续花费、突破 `max_budget`。

如果部署要求配置的预算在 Redis 降级期间也必须是硬上限，设置 `fail_closed_budget_enforcement`：

```yaml
general_settings:
  fail_closed_budget_enforcement: true
```

开启后，每个涉及预算的请求在放行前都会对照权威数据库校验花费（覆盖密钥、团队、用户、组织、终端用户、标签以及多时间窗口预算），过期或缺失的 Redis 计数器因此无法低报花费。数据库读取会合并并在进程内缓存几秒，额外开销被限制在每个 worker 每个缓存窗口内每个预算实体大约一次读取，而不是每个请求读一次。如果 Redis 和数据库都无法核实当前花费，请求会被拒绝并返回 `503`，而不是在无法核实的预算上放行。

保持该设置关闭（默认）可以让预算内的正常流量完全不碰数据库；默认模式下，只要计数器读数低于调用方最近一次已记录的花费，仍会与数据库交叉核对，无需逐请求读库就能覆盖常见的计数器过期场景。

## 设置速率限制

可以设置：
- tpm 上限（每分钟 Token 数）
- rpm 上限（每分钟请求数）
- 最大并行请求数
- 针对某个密钥或团队按模型设置 rpm / tpm 上限

### TPM 速率限制类型（输入/输出/总量）

默认情况下，TPM（每分钟 Token 数）速率限制按 **总 Token 数**（输入 + 输出）计算。你也可以改为只统计输入 Token 或只统计输出 Token。

在 `config.yaml` 中设置 `token_rate_limit_type`：

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  token_rate_limit_type: "output"  # Options: "input", "output", "total" (default)
```

| 取值 | 说明 |
|-------|-------------|
| `total` | 统计总 Token 数（提示词 + 补全），**默认行为** |
| `input` | 只统计提示词/输入 Token |
| `output` | 只统计补全/输出 Token |

该设置全局生效，作用于所有 TPM 速率限制检查（密钥、用户、团队等）。

### 预估输出 Token（未带 `max_tokens` 的请求）

TPM 上限的执行方式是调用前预留 Token、调用后按实际用量对账。请求不带 `max_tokens` / `max_completion_tokens` 时，LiteLLM 只能猜测要预留多少输出 Token，而内置猜测是一个静态估算值，所有密钥、团队和模型共用。

这个猜测双向都会出错。如果模型实际输出多于估算值，并发请求会都按偏小的预留放行，等它们跑完，窗口就突破了上限。如果实际输出远小于估算值，偏大的预留又会挡住本可服务的请求。

用 `default_estimated_output_tokens`（单一值）和 `default_estimated_output_tokens_per_model`（模型名到值的映射）声明模型实际的输出规模。两者都可以在密钥和团队上设置。

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
  "team_id": "my-prod-team",
  "tpm_limit": 1000000,
  "default_estimated_output_tokens": 2048,
  "default_estimated_output_tokens_per_model": {
    "{{openai_large}}": 4096,
    "{{openai_small}}": 1024
  }
}'
```

同样两个字段也适用于 `/team/new` 和 `/team/update`，并且都能在管理界面（Admin UI）的密钥和团队设置页里编辑。

```shell
curl --location 'http://0.0.0.0:4000/team/update' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
  "team_id": "my-prod-team",
  "default_estimated_output_tokens": 4096,
  "default_estimated_output_tokens_per_model": {"{{openai_large}}": 8192}
}'
```

预留输出预算的 **解析顺序**，命中即止：

| 优先级 | 来源 |
| --- | --- |
| 1 | 请求中的 `max_tokens` 或 `max_completion_tokens` |
| 2 | 密钥的 `default_estimated_output_tokens_per_model[model]` |
| 3 | 密钥的 `default_estimated_output_tokens` |
| 4 | 团队的 `default_estimated_output_tokens_per_model[model]` |
| 5 | 团队的 `default_estimated_output_tokens` |
| 6 | 内置静态估算 |

取值必须是正整数，管理端点会用 `422` 拒绝其他任何值，并指出出错的字段。取值缺失，或者因为被直接写进 `metadata` 而不是通过这些字段设置而格式不对时，会落到下一层级，未做任何声明的密钥行为与现在完全一致。嵌入请求不受影响，因为它们不产生输出 Token。

:::tip
估算值应参考该模型实际输出分布（大约取 p95），而不是按最大上下文取。偏大偏小都有代价：

- 声明得比模型实际输出 **多**，会限流本可服务的流量。如果声明值加上输入估算超过了请求所对照的上限，这类请求会被全部拒绝，代理会在 debug 级别记录预留值和上限值，方便你排查原因。
- 声明得比模型实际输出 **少**，比不声明更糟：预留额因此小于内置估算，在实际用量落账之前会有更多并发请求被放行。
:::

:::note
对最小适用 TPM 上限低于 4096 的租户，代理已经会注入该上限四分之一的 `max_tokens` 来硬性截断生成。声明值大于这个上限时会把上限抬高，因此截断点不会低于你声明的模型输出规模。声明值小于该上限则被忽略，因为估算值描述的是典型响应，不能悄悄截掉长尾。
:::


<Tabs>
<TabItem value="per-team" label="按团队">

使用 `/team/new` 或 `/team/update`，为团队设置跨多个密钥持久生效的速率限制。


```shell
curl --location 'http://0.0.0.0:4000/team/new' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{"team_id": "my-prod-team", "max_parallel_requests": 10, "tpm_limit": 20, "rpm_limit": 4}' 
```

[**查看 Swagger**](https://docs.litellm.ai/api-reference/#/team%20management/new_team_team_new_post)

**预期响应**

```json
{
    "key": "sk-sA7VDkyhlQ7m8Gt77Mbt3Q",
    "expires": "2024-01-19T01:21:12.816168",
    "team_id": "my-prod-team"
}
```

</TabItem>
<TabItem value="per-team-model" label="按团队按模型">

**为团队设置按模型的速率限制**

用 `model_rpm_limit` 和 `model_tpm_limit` 为团队下所有密钥设置按模型的速率限制。这类限制作用于团队内全部密钥，密钥会自动继承，除非在密钥级别另行覆盖。

使用 `/team/new` 或 `/team/update`，把 `model_rpm_limit` 和 `model_tpm_limit` 设为模型名到上限值的字典：

```shell
curl --location 'http://0.0.0.0:4000/team/new' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
  "team_id": "my-prod-team",
  "model_rpm_limit": {"{{openai_large}}": 100, "{{openai_small}}": 200},
  "model_tpm_limit": {"{{openai_large}}": 10000, "{{openai_small}}": 20000}
}'
```

**用按模型上限更新已有团队：**

```shell
curl --location 'http://0.0.0.0:4000/team/update' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
  "team_id": "my-prod-team",
  "model_rpm_limit": {"{{openai_large}}": 100, "{{openai_small}}": 200},
  "model_tpm_limit": {"{{openai_large}}": 10000, "{{openai_small}}": 20000}
}'
```

**替代方式：使用 metadata**

也可以通过 `metadata` 字段传入按模型上限：

```shell
curl --location 'http://0.0.0.0:4000/team/update' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
  "team_id": "my-prod-team",
  "metadata": {
    "model_rpm_limit": {"{{openai_large}}": 100, "{{openai_small}}": 200},
    "model_tpm_limit": {"{{openai_large}}": 10000, "{{openai_small}}": 20000}
  }
}'
```

**解析顺序**：密钥属于团队时，速率限制按 **密钥 metadata > 密钥 model_max_budget > 团队 metadata** 解析。密钥可以用自己的 `model_rpm_limit` 或 `model_tpm_limit` 覆盖团队级按模型上限。

#### 按模型速率限制与回退

默认情况下，当请求超出密钥或团队的 `model_rpm_limit` / `model_tpm_limit`，且 `router_settings.fallbacks` 中有该模型的回退条目时，LiteLLM 会在回退模型上重试该请求。按模型上限不作用于回退模型，客户端会从回退模型拿到 200。

要让密钥、团队、组织和项目级的按模型上限变成返回 429 的硬上限，设置：

```yaml
general_settings:
  disable_fallbacks_on_per_model_rate_limits: true
```

其他本地速率限制（例如密钥的整体 `rpm_limit`）保持原有的回退行为

**验证**：发起一次 `/chat/completions` 请求，检查响应头 `x-litellm-key-remaining-requests-{model}` 和 `x-litellm-key-remaining-tokens-{model}` 中的模型专属上限。

[**查看 Swagger**](https://docs.litellm.ai/api-reference/#/team%20management/new_team_team_new_post)

</TabItem><TabItem value="per-user" label="按内部用户">

使用 `/user/new` 或 `/user/update`，为内部用户设置跨多个密钥持久生效的速率限制。


```shell
curl --location 'http://0.0.0.0:4000/user/new' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{"user_id": "krrish@berri.ai", "max_parallel_requests": 10, "tpm_limit": 20, "rpm_limit": 4}' 
```

[**查看 Swagger**](https://docs.litellm.ai/api-reference/#/Internal%20User%20management/new_user_user_new_post)

**预期响应**

```json
{
    "key": "sk-sA7VDkyhlQ7m8Gt77Mbt3Q",
    "expires": "2024-01-19T01:21:12.816168",
    "user_id": "krrish@berri.ai"
}
```

</TabItem>
<TabItem value="per-key" label="按密钥">

如果只想对单个密钥生效，使用 `/key/generate`。

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{"max_parallel_requests": 10, "tpm_limit": 20, "rpm_limit": 4}' 
```

**预期响应**

```json
{
    "key": "sk-ulGNRXWtv7M0lFnnsQk0wQ",
    "expires": "2024-01-18T20:48:44.297973",
    "user_id": "78c2c8fc-c233-43b9-b0c3-eb931da27b84"  // 👈 auto-generated
}
```

</TabItem>
<TabItem value="per-key-model" label="按 API 密钥按模型">

**为每个 API 密钥按模型设置速率限制**

设置 `model_rpm_limit` 和 `model_tpm_limit`，为每个 API 密钥按模型设速率限制

这里 `{{openai_large}}` 是 [litellm config.yaml](configs.md) 中设置的 `model_name`

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{"model_rpm_limit": {"{{openai_large}}": 2}, "model_tpm_limit": {"{{openai_large}}": 1000}}' 
```

**预期响应**

```json
{
    "key": "sk-ulGNRXWtv7M0lFnnsQk0wQ",
    "expires": "2024-01-18T20:48:44.297973"
}
```

**验证该密钥的模型速率限制是否设置正确**

**发起 /chat/completions 请求，检查是否返回了 `x-litellm-key-remaining-requests-gpt-5.6-terra`**

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-ulGNRXWtv7M0lFnnsQk0wQ" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "Hello, Claude!ss eho ares"}
    ]
  }'
```


**预期响应头**

```shell
x-litellm-key-remaining-requests-gpt-5.6-terra: 1
x-litellm-key-remaining-tokens-gpt-5.6-terra: 179
```

这两个响应头表示：

- 密钥 key=`sk-ulGNRXWtv7M0lFnnsQk0wQ` 在 gpt-5.6-terra 模型上还剩 1 个请求
- 密钥 key=`sk-ulGNRXWtv7M0lFnnsQk0wQ` 在 gpt-5.6-terra 模型上还剩 179 个 Token

</TabItem>
<TabItem value="per-agent" label="按智能体">

为注册到 [Agent Gateway](../a2a.md) 的智能体设置速率限制。

**智能体级上限** 限制所有会话的总吞吐：

```shell
curl -X POST 'http://0.0.0.0:4000/v1/agents' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{"agent_name": "my-agent", "agent_card_params": {"name": "my-agent", "description": "My agent", "url": "http://my-agent:8080", "version": "1.0.0"}, "tpm_limit": 100000, "rpm_limit": 100}'
```

**会话级上限** 限制单个会话的吞吐：

```shell
curl -X POST 'http://0.0.0.0:4000/v1/agents' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{"agent_name": "my-agent", "agent_card_params": {"name": "my-agent", "description": "My agent", "url": "http://my-agent:8080", "version": "1.0.0"}, "session_tpm_limit": 50000, "session_rpm_limit": 50}'
```

还可以通过 `litellm_params` 为每个会话设置 **max_iterations**（调用次数上限）和 **max_budget_per_session**（金额上限）。详见 [Agent Iteration Budgets](../a2a_iteration_budgets)。

</TabItem>
<TabItem value="per-end-user" label="面向客户">

:::info 

也可以在界面的"Rate Limits"标签页下为客户创建预算 id。

:::

用它为传给 `/chat/completions` 的 `user` 设置速率限制，无需为每个用户创建密钥

#### 第 1 步：创建预算

在预算上设置 `tpm_limit`（需要的话也可以传 `rpm_limit`）

两者都是可选的；两个都没设的预算不会对其客户施加任何 LiteLLM TPM 或 RPM 上限，只有提供商自身的速率限制生效

```shell
curl --location 'http://0.0.0.0:4000/budget/new' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "budget_id" : "free-tier",
    "tpm_limit": 5
}'
```


#### 第 2 步：创建带预算的 `Customer`

创建这个新客户时使用第 1 步的 `budget_id="free-tier"`

```shell
curl --location 'http://0.0.0.0:4000/customer/new' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "user_id" : "palantir",
    "budget_id": "free-tier"
}'
```


#### 第 3 步：在 `/chat/completions` 请求中传入 `user_id`

把第 2 步的 `user_id` 以 `user="palantir"` 的形式传入

```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "llama3",
    "user": "palantir",
    "messages": [
        {
        "role": "user",
        "content": "gm"
        }
    ]
}'
```


</TabItem>
</Tabs>

## 为所有内部用户设置默认预算

用它为你要发密钥的用户设置默认预算。

当用户带有 [`user_role="internal_user"`](./self_serve.md#可用角色) 时生效（通过 `/user/new` 或 `/user/update` 设置）。

如果密钥带有 team_id，这条默认预算不生效（此时适用团队预算）。[欢迎告诉我们哪里可以改进！](https://github.com/BerriAI/litellm/issues)

1. 在 config.yaml 中定义预算上限

```yaml
model_list: 
  - model_name: "{{openai_small}}"
    litellm_params:
      model: {{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  max_internal_user_budget: 0 # amount in USD
  internal_user_budget_duration: "1mo" # reset every month
```

2. 为用户创建密钥 

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{}'
```

预期响应： 

```bash
{
  ...
  "key": "sk-X53RdxnDhzamRwjKXR4IHg"
}
```

3. 测试一下！ 

```bash
curl -L -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-X53RdxnDhzamRwjKXR4IHg' \
-d '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user", "content": "Hey, how's it going?"}]
}'
```

预期响应： 

```bash
{
    "error": {
        "message": "ExceededBudget: User=<user_id> over budget. Spend=3.7e-05, Budget=0.0",
        "type": "budget_exceeded",
        "param": null,
        "code": "400"
    }
}
```

### 多实例速率限制


**重要提示**：
- 只要设置了 `tpm_limit`、`rpm_limit` 或 `max_parallel_requests`，任何密钥、用户或团队都会受速率限制约束，与角色无关。主密钥除非你专门配置，否则没有限制。
- 测试速率限制时，使用带显式上限的虚拟密钥，让限流器有据可依。

变更点：
- 更新当前请求数/Token 数时，改用 async_increment 而不是 async_set_cache。
- 内存缓存每 0.01 秒与 Redis 同步一次，避免每个请求都调用 Redis。
- 测试发现这比原来的实现快 2 倍，高流量下（3 个实例共 100 RPS）预期与实际失败次数的偏差最多 10 个请求。

### 硬性速率限制强制执行（fail closed）

多实例部署中，tpm、rpm 和 max_parallel_requests 计数器保存在 Redis（`general_settings.coordination_redis` 或 `REDIS_*` 环境变量）里，每个实例执行的是同一份限制。Redis 不可达时，各实例退回自己内存里的计数器并继续服务，`rpm_limit: 2` 的密钥此时每个实例最多放行 2 个请求，N 个实例就是上限的 N 倍，直到 Redis 恢复

如果部署要求配置的速率限制在 Redis 宕机期间也必须是硬上限，设置 `fail_closed_rate_limit_enforcement`：

```yaml
general_settings:
  fail_closed_rate_limit_enforcement: true
```

开启后，无法对照 Redis 核实计数器的请求会被拒绝并返回 `503`，而不是按单实例计数器放行。用 `503` 而不是 `429`，是为了让客户端和负载均衡器能区分 Redis 故障与速率限制。Redis 正常时该设置没有任何影响，不带速率限制的请求不受影响，请求后的记账仍是尽力而为，已放行的请求不会事后被判失败

保持该设置关闭（默认）可以在 Redis 故障期间按单实例限制继续服务。没有 Redis 时该设置不起作用：开启它启动但没有配置 Redis 的代理会记录一条警告，然后按单实例执行限制。通过 `LEGACY_MULTI_INSTANCE_RATE_LIMITING=true` 启用的旧版限流器同样忽略该设置


## 授予新模型的访问权限

用模型访问组让用户能访问选定的模型，之后再把新模型加进同一个组（如 mistral、llama-2 等）。

用 `/key/generate` 和用 `/user/new` 做这件事有什么区别？在 `/user/new` 上设置后，该用户后续生成的多个密钥都会沿用。

**第 1 步：在 config.yaml 中为模型分配访问组**

```yaml
model_list:
  - model_name: text-embedding-ada-002
    litellm_params:
      model: azure/azure-embedding-model
      api_base: "os.environ/AZURE_API_BASE"
      api_key: "os.environ/AZURE_API_KEY"
      api_version: "2023-07-01-preview"
    model_info:
      access_groups: ["beta-models"] # 👈 Model Access Group
```

**第 2 步：用访问组创建密钥**

```bash
curl --location 'http://localhost:4000/user/new' \
-H 'Authorization: Bearer <your-master-key>' \
-H 'Content-Type: application/json' \
-d '{"models": ["beta-models"], # 👈 Model Access Group
			"max_budget": 0}'
```


## 为已有内部用户创建新密钥

只需在 `/key/generate` 请求中带上 user_id。

```bash
curl --location 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data '{"models": ["azure-models"], "user_id": "krrish@berri.ai"}'
```


## API 规范

### `GenericBudgetInfo`

一个 Pydantic 模型，用时间周期和上限来定义预算信息。

```python
class GenericBudgetInfo(BaseModel):
    budget_limit: float  # The maximum budget amount in USD
    time_period: str    # Duration string like "1d", "30d", etc.
```

#### 字段
- `budget_limit`（float）：预算上限，单位为美元
- `time_period`（str）：指定预算时间周期的时长字符串。支持的格式：
  - 秒："30s"
  - 分钟："30m" 
  - 小时："30h"
  - 天："30d"

#### 示例
```json
{
  "budget_limit": "0.0001",
  "time_period": "1d"
}
```
