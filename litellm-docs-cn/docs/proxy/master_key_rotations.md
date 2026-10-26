# 轮换主密钥

主密钥（master key）是代理的管理凭据，既为管理 API 调用鉴权，也用于登录管理界面（Admin UI）。在某些部署中，它还兼任数据库内凭据的静态加密密钥：代理对存储的数据（模型的 `litellm_params`、凭据、MCP 服务器凭据、存库的环境变量）做加密签名时，设置了 `LITELLM_SALT_KEY` 就用盐密钥（salt key），只有没配盐密钥时才回退到主密钥。主密钥怎么轮换，取决于它实际承担哪个角色；搞错了可能让已存的凭据彻底无法解密，因此执行任何操作之前，请先读完与你的部署形态相符的那一种情况。

:::warning

如果设置了[盐密钥](./prod.md#设置-salt-key)，代理会用盐密钥（而不是主密钥）解密已存储的凭据。在这种配置下，不要用 `POST /key/regenerate` 加 `new_master_key` 来轮换主密钥。这条流程会把所有数据用新主密钥重新加密，而运行中的代理仍用盐密钥解密，结果就是每一条存储凭据都无法解密，整个部署可能直接瘫痪。请改按下文的盐密钥一节操作。

:::

两种流程执行前都要先备份数据库。模型重新加密采用删除再重建行的方式，而非原地更新；凭据重新加密则会跳过失败的行，因此一旦部分失败，数据可能被搁浅在中间状态。有了备份才能干净地回退。

虚拟密钥（virtual key）以哈希而非加密形式存储，因此无论哪种轮换方式都不影响它们继续可用。只有存入数据库的模型（`store_model_in_db`）会被重新加密流程处理；定义在配置文件里的模型不受影响。该功能开源版即可用，主密钥轮换并不锁在企业版后面。管理界面上刻意没有提供这条流程；轮换要么走 API，要么在启动时完成。

## 如果使用了盐密钥（推荐配置）

设置了 `LITELLM_SALT_KEY` 时，存储凭据的加密和解密都由盐密钥负责，主密钥只是鉴权凭据。轮换主密钥不会碰到任何静态加密的数据，因此没有什么需要重新加密。

生成一个新的主密钥值，更新它实际存放的位置（`LITELLM_MASTER_KEY` 环境变量，或配置中的 `general_settings.master_key`），然后重启每一个代理实例，让它们加载新值。此处不要调用 `POST /key/regenerate` 传 `new_master_key`；那会把你的凭据重新加密到一个代理解密时根本不会用的密钥之下。

不要轮换 `LITELLM_SALT_KEY` 本身。添加过模型之后它就不能再变；盐密钥轮换没有原地迁移方案，否则每一条存储凭据都得重新注册。

## 如果主密钥就是加密密钥

没有设置盐密钥时，主密钥同时充当静态加密密钥，轮换它就得重新加密存储的数据。

:::tip[建议改用专用盐密钥]
轮换之前，不妨先设置一个固定的 `LITELLM_SALT_KEY`，让今后的主密钥轮换都变成上文那种无需迁移的流程。先把盐密钥设成当前主密钥的值（这样已有数据仍能解密），之后主密钥就可以随意轮换了。
:::

你可以在代理运行期间用 `POST /key/regenerate` 完成，下文会讲；也可以在启动时用 `LITELLM_MIGRATE_FROM_MASTER_KEY` 完成，它不需要代理在运行，而且[覆盖的存储值更多](#boot-time-migration)。

调用 `POST /key/regenerate`，`key` 传当前主密钥，`new_master_key` 传新密钥。只有当 `key` 是当前主密钥时，代理才会执行主密钥轮换；传其他值一律按普通的虚拟密钥重新生成处理。

```bash
curl -L -X POST 'http://localhost:4000/key/regenerate' \
-H "Authorization: Bearer $LITELLM_MASTER_KEY" \
-H 'Content-Type: application/json' \
-d '{
  "key": "sk-<current-master-key>",
  "new_master_key": "sk-<your-master-key>"
}'
```

它会用新主密钥重新加密存储的模型、配置表中保存的 `environment_variables`、凭据表，以及 MCP 服务器、用户和每用户环境凭据表，并返回新密钥：

```json
{
  "key": "sk-<your-master-key>",
  "token": "sk-<your-master-key>",
  "key_name": "sk-<your-master-key>",
  "expires": null
}
```

运行中的进程不会自行采用新密钥，所以要等下面的步骤做完，它才能解密自己刚刚重新加密的数据。

## 轮换之后

把旧主密钥存放过的每个地方都更新掉：`LITELLM_MASTER_KEY` 环境变量、你的密钥管理器（secret manager），以及配置里的 `general_settings.master_key`（如果你在那里也设过）。两处同时存在时，`general_settings.master_key` 优先于环境变量，务必确保它拿到的是新值。

重启每一个代理实例，让它们加载新密钥。然后做验证：用新主密钥登录 Admin UI，并用一个 LiteLLM 密钥（新主密钥或虚拟密钥）向一个存库模型发起请求，确认请求成功。

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_MASTER_KEY" \
-d '{
    "model": "{{openai_small}}",
    "messages": [
        {
            "content": "Hey, how'\''s it going",
            "role": "user"
        }
    ]
}'
```

如果 UI 能打开，存储的模型和凭据都能正常解析，轮换就完成了。

## 主密钥为已知不安全值时代理拒绝启动 {#proxy-refuses-to-start}

当代理解析出的主密钥未设置、为空或只有空白字符、或是公开已知的不安全值时，代理会在启动时以非零状态退出，并打印修复方法。没有主密钥，代理就在无鉴权状态下运行，接受所有请求。那个已知不安全值曾在 LiteLLM 自己的文档和教程里被广泛引用，任何能访问到代理的人都能猜到它。

接下来怎么办，取决于旧密钥有没有加密过数据库里的内容。代理会替你判断：配置了数据库且未设置 `LITELLM_SALT_KEY` 时，它会在拒绝启动的过程中连上数据库，统计能用不安全密钥解开的存储值数量，打印出的步骤随统计结果而不同。

### 没有数据用旧密钥加密

统计为 0、没有配置数据库、或设置了 `LITELLM_SALT_KEY` 时就是这种情况。没有需要迁移的内容，所以报错只会让你换掉密钥。如果密钥来自 `general_settings.master_key`，它会先提醒你确保配置从环境读取密钥。设置新密钥的具体步骤，取决于代理环境中是否已经设置了 `LITELLM_MASTER_KEY`。

变量完全未设置时，报错会打印一条生成密钥并保存到 `.env` 的命令。[新密钥放在哪里](#新密钥放在哪里) 一节覆盖了不读取 `.env` 文件的部署形态。

```bash
echo "LITELLM_MASTER_KEY=sk-$(openssl rand -hex 32)" | tee -a .env
```

变量已经设成了已知不安全值、或设成了空值时，报错只打印一条生成密钥的命令。把新密钥放到当前设置 `LITELLM_MASTER_KEY` 的位置替换原值：可能是 shell 的 export、容器或部署环境，也可能是 `.env` 里那一行。不要只是往 `.env` 追加一行。代理加载 `.env` 时不会覆盖已存在的变量，环境里已导出的值优先，追加的行永远不会生效。

```bash
echo "sk-$(openssl rand -hex 32)"
```

然后再次启动代理。这与[用盐密钥轮换](#如果使用了盐密钥推荐配置)一样，都是换值加重启。设置了 `LITELLM_SALT_KEY` 的情况下，不要调用 `POST /key/regenerate` 传 `new_master_key`。正如页面顶部的警告所说，那样会让存储的凭据无法解密。

### 数据库中有用旧密钥加密的值

没有盐密钥时，主密钥同样负责加密数据库里的凭据，因此只换密钥会让它们无法解密。报错会说明这一点，并给出找到的值的数量：

```text
Your database holds 6 value(s) encrypted with this master key,
which encrypts stored credentials while LITELLM_SALT_KEY is not set. Replacing the key alone makes them
unreadable, so also tell the proxy which key to migrate from:
```

如果拒绝启动期间连不上数据库，第一行会换成 "Your database could not be checked for values encrypted with this master key,"，后续步骤相同。无论哪种情况照做都安全，因为没有可迁移的内容时，迁移什么都不会做。

通过 `LITELLM_MIGRATE_FROM_MASTER_KEY` 告诉代理从哪个密钥迁移，下次启动时它就会用新主密钥重新加密存储的值。不需要代理在运行，不需要本地开发专用的覆写配置，也不需要调用 `POST /key/regenerate`。和本页所有轮换操作一样，先备份数据库。如果旧密钥来自 `general_settings.master_key`，报错的第一步就是让配置改为从环境读取密钥，见[新密钥放在哪里](#新密钥放在哪里)。

1. 把 `LITELLM_MIGRATE_FROM_MASTER_KEY` 设为旧密钥，位置与 `LITELLM_MASTER_KEY` 相同：shell 的 export、容器或部署环境，或 `.env`。旧密钥本来是空值时，就用空值 `LITELLM_MIGRATE_FROM_MASTER_KEY=`。

   ```bash
   export LITELLM_MIGRATE_FROM_MASTER_KEY="$LITELLM_MASTER_KEY"
   ```

2. 生成一个新密钥，设为 `LITELLM_MASTER_KEY`。变量已有值时，用新密钥替换当前值。

   ```bash
   echo "sk-$(openssl rand -hex 32)"
   ```

   如果还没有任何地方设置 `LITELLM_MASTER_KEY`（旧密钥是 `config.yaml` 里的字面量时会出现这种情况），先从密钥当前的来源把旧值加载进 shell。随后报错会打印把两个值都保存到 `.env` 的命令。

   ```bash
   printf 'LITELLM_MIGRATE_FROM_MASTER_KEY=%s\n' "$LITELLM_MASTER_KEY" | tee -a .env
   printf 'LITELLM_MASTER_KEY=sk-%s\n' "$(openssl rand -hex 32)" | tee -a .env
   ```

3. 再次启动代理。数据库一连上、流量还未开始处理时，代理就会重新加密所有能用旧密钥解开的存储值。这一过程以 WARNING 级别记录日志，默认日志级别下就能看到，出现在日志最前面的几行里。

   ```text
   Re-encrypting 6 stored value(s) from the LITELLM_MIGRATE_FROM_MASTER_KEY key to the new master key.
   Done re-encrypting 6 stored value(s) with the new master key. You may now delete the LITELLM_MIGRATE_FROM_MASTER_KEY environment variable.
   ```

4. 删除 `LITELLM_MIGRATE_FROM_MASTER_KEY`，然后按[轮换之后](#轮换之后)的说明验证。留着这个变量也无害，只是每次启动都会多出一条提示："LITELLM_MIGRATE_FROM_MASTER_KEY is still set, but nothing in the database is left to migrate from that key. You may now delete LITELLM_MIGRATE_FROM_MASTER_KEY."

`LITELLM_MIGRATE_FROM_MASTER_KEY` 只有在主密钥本身安全的情况下才会生效。如果设置它时 `LITELLM_MASTER_KEY` 仍未设置、为空、或是已知不安全值，代理会再次拒绝启动。

迁移过程中如果某个存储值恰好被编辑，该值会保持原样，日志提示 "Re-encrypted N stored value(s), but M are still encrypted with the previous key because they changed during the migration. Keep LITELLM_MIGRATE_FROM_MASTER_KEY set and restart the proxy to migrate them."。按提示操作，再重启一次即可。

迁移中遇到数据库错误会中断启动，因此 worker 绝不会带着读不了的存储值对外服务。代理以 WARNING 级别记录日志，随后以非零状态退出：

```text
Could not migrate stored values from the LITELLM_MIGRATE_FROM_MASTER_KEY key (<ErrorType: message>). Values still encrypted with the previous key cannot be read until the migration succeeds. Keep LITELLM_MIGRATE_FROM_MASTER_KEY set and restart the proxy once the database is reachable.
```

修好数据库的问题，带着同样的两个变量再次启动代理。下次启动会从上次失败处继续：如果上次已迁移 6 个值中的 2 个，这次就会先打印 "Re-encrypting 4 stored value(s)"，再打印 "Done" 那一行。唯一的例外遵循代理启动时对数据库连接的既有规则：当 `general_settings.allow_requests_on_db_unavailable` 为 true 且错误是连接中断时，启动会继续，仍用旧密钥加密的值将保持不可读状态，直到之后再完成一次迁移。

这些步骤期间不要添加 `LITELLM_SALT_KEY`。设置了盐密钥后，代理会假定存储值都是用盐密钥加密的，于是跳过迁移并记录没有任何内容可迁移，仍用旧密钥加密的值就永远解不开了。迁移完成后，可以考虑改用专用盐密钥，如[如果主密钥就是加密密钥](#如果主密钥就是加密密钥)一节的提示所述，让以后的轮换只是换值加重启。

### 启动时迁移覆盖哪些内容 {#boot-time-migration}

这套迁移适用于任何旧主密钥，不限于不安全值，因此也可以作为 `POST /key/regenerate` 加 `new_master_key` 的离线替代：设置新的 `LITELLM_MASTER_KEY`，把 `LITELLM_MIGRATE_FROM_MASTER_KEY` 指向旧密钥，然后重启。它是幂等的，多个 worker 或副本同时启动也安全，因为每行只有在仍保持读到的原值时才会被更新。即使配置了读副本，它也通过主库读写。旧表结构上不存在的表或列会被跳过，因此在表结构升级前后都能运行。虚拟密钥不受影响，因为它们以哈希而非加密形式存储。未连接数据库时，代理会记录没有迁移任何内容。

它重新加密的范围比 regenerate 调用更广：存库的模型（`litellm_params`）、凭据、`LiteLLM_Config` 中的值（环境变量、CloudZero 和 Vantage 设置等）、SSO 设置、缓存设置、配置覆写、MCP 服务器凭据、静态请求头与环境变量、MCP OAuth 客户端凭据、每用户 MCP 凭据与环境变量、SSO 身份断言，以及团队、密钥、用户元数据里的加密回调变量，包括已删除团队和已删除密钥表。

### 新密钥放在哪里

新密钥必须以 `LITELLM_MASTER_KEY` 环境变量的形式传给代理。只有当你从仓库检出目录直接运行代理，或通过 Docker Compose 的 `env_file` 加载时，工作目录下的 `.env` 文件才会被读取。用 pip 安装、裸 `docker run` 或 Kubernetes 部署时，请直接把变量传给进程或容器。

如果 `LITELLM_MASTER_KEY` 已经在某处设置，比如 shell 的 export、容器或部署环境、或 `.env` 里的一行，请直接在那个位置替换值，而不是往 `.env` 追加新行。代理加载 `.env` 时不会覆盖环境里已有的变量，导出的值优先于文件。

如果旧密钥是写在 `general_settings.master_key` 下的字面量，请确保 `config.yaml` 改为从环境读取密钥，因为配置里的字面量优先于环境变量。

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

更换主密钥会让所有人从 Admin UI 掉线，因为 UI 会话令牌正是用它签名的。请用新密钥重新登录。
