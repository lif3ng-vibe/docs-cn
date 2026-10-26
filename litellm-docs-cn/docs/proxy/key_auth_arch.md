# 密钥鉴权的工作原理

本文说明代理（proxy）如何判定一个虚拟密钥（virtual key）能调用哪些模型。重点有两个：密钥带 `team_id` 与不带 `team_id` 时 `models` 字段分别如何求值，以及 `SpecialModelNames` 中那些会覆盖常规解析逻辑的哨兵值（sentinel）。配置方法参见 [虚拟密钥](./virtual_keys.md) 与 [模型访问组](./model_access_groups.md)。

## `models` 字段

每条虚拟密钥记录都带有一个 `models` 列表，列表中的条目分为四类：

| 条目 | 含义 |
|---|---|
| 具体模型组 | 来自 `config.yaml` 中 `model_name` 的名称（`gpt-4`、`azure-gpt-3.5`） |
| 通配符 | 与 `model_name` 匹配的提供商前缀模式（`openai/*`、`openai/o1-*`） |
| 访问组 | 在 `model_info.access_groups` 或 `/access_group/new` 下声明的标签；请求时会展开为打上该标签的全部模型 |
| 哨兵值 | `SpecialModelNames` 中保留的特殊字符串（见下文） |

对密钥或团队求值时，空列表与字面量 `*` 含义相同：都表示"代理上的所有模型"。

## 哨兵值

这些字符串在 `litellm.proxy._types.SpecialModelNames` 中被保留为枚举值，会直接短路常规匹配流程。

| 哨兵值 | 所属位置 | 效果 |
|---|---|---|
| `all-proxy-models` | 密钥、团队或用户的 `models` 列表 | 授予代理上所有模型的访问权。出现在团队上时，等同于空的 `models` 列表；出现在用户上时，直接放开对所有非团队部署（deployment）的访问。 |
| `all-team-models` | 仅限密钥的 `models` 列表 | 请求时继承所属团队的 `models` 列表。若密钥没有 `team_id`，该检查会解析为空限制列表，即密钥不受限（可访问代理上所有模型）；如果密钥必须保持受限，就应为其挂载 `team_id` 或改用明确的模型列表。 |
| `no-default-models` | 仅限用户的 `models` 列表 | 在用户路径上直接拒绝，迫使用户经由团队发起请求。通过 `default_internal_user_params.models` 设置，防止 SSO 注册的用户凭空创建拥有全代理访问权限的独立密钥。 |

在所有哨兵值中，`all-team-models` 最容易被误当成空列表。空列表表示"所有模型"，`all-team-models` 表示"听团队的"；在没有挂载团队时，它同样会解析为所有模型，而不是拒绝访问。

## 解析：有无 team_id 的区别

两条规则即可覆盖所有情形。独立密钥（不带 `team_id`）仅凭自身的 `models` 列表完成鉴权；挂载团队的密钥则要同时通过两道检查：先对照自身列表，再对照 `team.models` 复查一次。调用方真正能触达的是两者的交集，因此一个持有 `["{{openai_large}}"]` 的密钥，挂在一个只含 `["azure-gpt-3.5"]` 的团队下时，什么模型都调不了。

两道检查被拒时的报错格式相同：`{object_type} not allowed to access model. This {object_type} can only access models=[...]. Tried to access <model>`，其中 `object_type` 可以是 `key`、`team`、`user` 或 `org`，看前缀就能判断是哪一步拒绝了请求。另有一条独立的团队配置校验路径会抛出 `Invalid model for team <team_id>: <model>. Valid models for team are: [...]`（参见 [按 team_id 限制模型](./model_access.md#按-team_id-限制模型)）。

这些哨兵值会改变两道检查的形态：团队上配置了 `all-proxy-models`，团队这一步会直接通过，但密钥自身仍需匹配；密钥上配置了 `all-team-models`，则跳过密钥这一步、以团队检查为准（没有挂载团队时解析为代理的完整模型列表）。

## 访问组与通配符

访问组的意义在于：把模型加入某个组，所有挂着该组的密钥即刻获得访问权，无需逐条修改密钥记录。标签本身存储在密钥或团队上；鉴权检查时才做展开，查找哪些部署在 `model_info.access_groups` 中带有这个标签。通配符的解析方式相同，只是匹配对象是 `model_name` 而非标签；通配符自身也可以加入访问组，从而把某个子系列单独划出（`openai/*` 属于 `default-models`，`openai/o1-*` 属于 `restricted-models`，于是只持有 `default-models` 的密钥无法调用 `o1` 系列）。参见 [模型访问组](./model_access_groups.md)。

## 主密钥会跳过哪些检查

主密钥（master key）在内存中以明文比对，不写入 `LiteLLM_VerificationToken` 表，也没有 `models` 列表，会绕过上文的所有检查。请把它当作运维人员的凭据看待：一旦泄露，无论团队、访问组还是哨兵值如何配置，代理上的所有模型都会暴露。参见 [主密钥轮换](./master_key_rotations.md)。

## 相关文档

[模型访问](./model_access.md) · [模型访问组](./model_access_groups.md) · [虚拟密钥](./virtual_keys.md) · [多租户架构](./multi_tenant_architecture.md)
