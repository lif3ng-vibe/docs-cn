import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 快速上手

创建密钥、追踪花费、添加模型，无需操心配置或 CRUD 端点。

<Image img={require('../../img/litellm_ui_create_key.png')} dark={require('../../img/litellm_ui_create_key_dark.png')} alt="虚拟密钥页面及 Create New Key 按钮" />

## 快速上手

- 需要已设置代理主密钥（master key）
- 需要已连接数据库

按照[设置步骤](./virtual_keys.md#设置)操作

### 1. 启动代理

```bash
litellm --config /path/to/config.yaml

#INFO: Proxy running on http://0.0.0.0:4000
```

### 2. 访问 UI

```bash
http://0.0.0.0:4000/ui # <proxy_base_url>/ui
```

### 3. 在 Swagger 上获取 Admin UI 链接

代理的 Swagger 文档就在代理的根路径上：例如 `http://localhost:4000/`

<Image img={require('../../img/ui_link.png')} alt="Swagger 页面及 Admin UI 链接" />

### 4. 首次登录

开箱即用时，UI 接受来自环境变量的登录凭据：用户名为 `UI_USERNAME`（默认 `admin`），密码为 `UI_PASSWORD`。如果未设置 `UI_PASSWORD`，主密钥本身也可当作密码使用。任何人以此方式登录，都将获得代理管理员权限。

```shell
LITELLM_MASTER_KEY="sk-$(openssl rand -hex 32)" # 代理的主密钥；必须以 sk- 开头
UI_USERNAME=ishaan-litellm   # 在 UI 上登录的用户名
UI_PASSWORD=langchain        # 在 UI 上登录的密码
```

打开 LiteLLM UI 后，系统会提示你输入用户名和密码。

:::warning[环境变量凭据仅用于初始配置]
这种登录方式会在环境里保存一份永久、共享、明文的管理员凭据，既无法按人轮换，也无法分辨哪位管理员做过什么。登录之后，请按下面的步骤迁移到按人划分的账号，并停用这种方式。在此之前，仪表板会向每位管理员显示一条警告横幅。
:::

### 5. 创建自己的管理员账号并停用环境变量凭据登录

先用环境变量凭据登录，然后为自己创建一个 `proxy_admin` 用户：进入 `Internal Users` -> `+ Invite User`，把角色设为 `proxy_admin`，再打开生成的邀请链接设置密码。你也可以走 API 创建该用户：调用 `POST /user/new` 并把 `user_role` 设为 `proxy_admin`；参见[邀请用户](./self_serve.md)。继续之前，先退出登录，确认自己能用邮箱和新密码正常登录。

然后在 `config.yaml` 中关闭环境变量凭据登录路径，并重启代理：

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  disable_env_credential_login: true
```

重启之后，登录页会以 `401 Invalid credentials used to access UI` 拒绝 `UI_USERNAME`/`UI_PASSWORD` 和主密钥，警告横幅随之消失，只有数据库用户（以及已配置的 [SSO](./admin_ui_sso.md)）能够登录。此时你可以从环境中移除 `UI_USERNAME` 和 `UI_PASSWORD`。

:::note
如果在创建带密码的 `proxy_admin` 用户之前就启用 `disable_env_credential_login`，你将无法登录。遇到这种情况，可以用主密钥关闭 `disable_env_credential_login` 并重启代理，恢复访问。
:::

如果你使用 SSO，`disable_password_login_when_sso_enabled` 同样会挡住这条登录路径，因为一旦 SSO 提供商配置完成，它会拒绝所有用户名密码登录。参见 [Admin UI 的 SSO](./admin_ui_sso.md)。

### 6. 配置根路径重定向 URL

当 `DOCS_URL` 设置为 `"/"` 以外的值时，可以用 `ROOT_REDIRECT_URL` 配置根路径（`/`）重定向到哪里：

```shell
DOCS_URL="/docs"              # 把文档设到另一个路径
ROOT_REDIRECT_URL="/ui"       # 将根路径（/）重定向到 /ui
```

默认情况下 `DOCS_URL` 为 `"/"`，所以只有在你把 `DOCS_URL` 改成其他路径时才需要这个设置。

## 限制登录失败尝试

针对 Admin UI 的用户名密码登录失败会按来源地址计数。同一地址在 60 秒内跨所有用户名输错密码超过 10 次，该地址就会被封禁 5 分钟。账号本身永远不会被锁定：同一用户名仍可从其他地址登录。地址限额的一半（默认 5 次）是该地址上单个用户名的允许额度。一旦超出，只会封禁这一对地址与用户名的组合，且之后的失败不再计入地址限额，所以一个卡在某个账号上的脚本不会把共用同一办公地址的其他人全部挡在门外。

封禁生效期间，在检查密码之前，该地址或该组合的每一次登录尝试都会被拒绝，返回 `429 Too many failed sign-in attempts` 和 `Retry-After` 头。正确的密码、`UI_USERNAME`/`UI_PASSWORD`，以及在表单里输入的主密钥，都一样会被拒。被拒的尝试不会延长封禁。如果你被封禁又等不及，主密钥在 API 上仍可作为 bearer token 使用，登录限制并不覆盖 API。

代理配有 Redis 时，计数器存在 Redis 里，封禁因此对所有 worker 和 pod 生效。没有 Redis 时，各 worker 独立计数，实际限额等于配置值乘以 worker 数量；代理会在启动时对此发出警告。如果 Redis 变得不可达，代理会退回按 worker 计数，并继续接受登录。

要按地址计数，代理必须知道客户端地址是哪个。把 `general_settings.trusted_proxy_ranges` 设为 LiteLLM 前方负载均衡器或 ingress 的 CIDR 网段；此后客户端取这些网段之外的第一个 `X-Forwarded-For` 跳点。如果客户端直连 LiteLLM，就把它设为 `[]`，这样会使用对端地址并忽略 `X-Forwarded-For`。若完全不设置，代理无法区分客户端与共享 ingress，会在启动时发出警告，且只执行按用户名的限制。IPv6 地址按 /64 分组。

```yaml
general_settings:
  trusted_proxy_ranges: ["10.0.0.0/8"]        # 客户端直连时设为 []
  max_failed_login_attempts_per_source: 10    # 默认值；用户名额度为其一半
  failed_login_window_seconds: 60             # 默认值
  failed_login_block_seconds: 300             # 默认值
  max_failed_login_attempts_per_source_overrides:
    "203.0.113.7": 50                         # 多位管理员共用的 NAT 网关；此处用户名额度为 25
    "192.0.2.0/24": 100                       # 匹配最具体的网段生效
    "198.51.100.4": 0                         # 0 表示该地址豁免两项限制
```

覆盖项会同时提高该地址的两项限额，因为用户名额度跟随地址限额；设为 `0` 则让该地址完全豁免。`LITELLM_DISABLE_LOGIN_RATE_LIMIT=true` 会在所有位置关闭该限制；它在启动时读取一次。默认值背后的考量参见[安全最佳实践](./security_best_practices#限制管理界面登录失败次数)。

## 邀请其他用户

允许其他人创建或删除自己的密钥。

[**前往该页面**](./self_serve.md)

## 模型管理

Admin UI 提供以下模型管理能力：

- **添加模型**：通过 UI 添加新模型，无需重启代理
- **AI Hub**：把模型和智能体公开，让开发者发现有哪些可用
- **价格数据同步**：通过从 GitHub 同步，保持模型定价数据为最新

模型管理的详细说明参见[模型管理](./model_management.md)。

分享模型和智能体的信息参见 [AI Hub](./ai_hub.md)。

:::tip[同步模型定价数据]
[从 GitHub 同步模型定价数据](./sync_models_github.md)，让模型成本信息保持最新。
:::

## 停用 Admin UI

在环境变量中设置 `DISABLE_ADMIN_UI="True"` 即可停用 Admin UI。

如果你的安全团队对 UI 的使用有额外限制，这个选项会很有用。

**预期响应**

<Image img={require('../../img/admin_ui_disabled.png')} dark={require('../../img/admin_ui_disabled_dark.png')} alt="Admin UI 已停用提示" />
