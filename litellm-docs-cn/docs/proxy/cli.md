# CLI 参数

本页汇总了 LiteLLM 代理服务器（proxy server）支持的全部命令行界面（CLI）参数。

## 服务器配置

### --host
   - **默认值**：`'0.0.0.0'`
   - 服务器监听的主机地址。
   - **用法**：
     ```shell
     litellm --host 127.0.0.1
     ```
   - **用法**（通过环境变量设置）：`HOST`
    ```shell
    export HOST=127.0.0.1
    litellm
    ```

### --port
   - **默认值**：`4000`
   - 服务器绑定的端口。
   - **用法**：
     ```shell
     litellm --port 8080
     ```
  - **用法**（通过环境变量设置）：`PORT`
    ```shell
    export PORT=8080
    litellm
    ```

### --num_workers
   - **默认值**：`1`；若设置了环境变量 `DEFAULT_NUM_WORKERS_LITELLM_PROXY`，则取其值
   - 要启动的 worker 进程数量（uvicorn、gunicorn 或 Granian 的 `--workers`）。
   - **用法**：
     ```shell
     litellm --num_workers 4
     ```
  - **用法**（通过环境变量设置）：`NUM_WORKERS`
    ```shell
    export NUM_WORKERS=4
    litellm
    ```

### --config
   - **短格式**：`-c`
   - **默认值**：`None`
   - 代理配置文件的路径（如 config.yaml）。
   - **用法**：
     ```shell
     litellm --config path/to/config.yaml
     ```

### --log_config
   - **默认值**：`None`
   - **类型**：`str`
   - uvicorn 日志配置文件的路径。
   - **用法**：
     ```shell
     litellm --log_config path/to/log_config.conf
     ```

### --keepalive_timeout
   - **默认值**：`None`
   - **类型**：`int`
   - 以秒为单位设置 uvicorn 的 keepalive 超时（对应 uvicorn 的 timeout_keep_alive 参数）。
   - **用法**：
     ```shell
     litellm --keepalive_timeout 30
     ```
  - **用法**（通过环境变量设置）：`KEEPALIVE_TIMEOUT`
    ```shell
    export KEEPALIVE_TIMEOUT=30
    litellm
    ```

### --timeout_worker_healthcheck
   - **默认值**：`None`（沿用 uvicorn 自身的默认值 5 秒）
   - **类型**：`int`
   - 以秒为单位设置 uvicorn 的 worker 健康检查超时（对应 uvicorn 的 `timeout_worker_healthcheck` 参数）。当以 `--num_workers` > 1 运行 uvicorn 时，监管进程会定期探测每个 worker；如果某个 worker 在该时间窗口内没有响应（例如其事件循环被同步任务阻塞），就会被 SIGKILL 杀死并替换。此时日志中会先出现 `Waiting for child process [<pid>]`，随后是 `Child process [<pid>] died`。如果发现健康的 worker 在长时间同步操作期间被回收，请调大该值。
   - 需要 `uvicorn>=0.37.0`。在更旧的 uvicorn 版本上该开关不生效：LiteLLM 启动时会打印 `Ignoring the flag` 警告，并沿用 uvicorn 内置的 5 秒超时。设置该开关后，请检查启动日志中是否有该警告，以确认其已生效。
   - 仅在直接运行 uvicorn 且 `--num_workers` > 1 时生效；使用 `--run_gunicorn` / `--run_hypercorn` 时会被忽略。
   - **用法**：
     ```shell
     litellm --num_workers 4 --timeout_worker_healthcheck 30
     ```
  - **用法**（通过环境变量设置）：`TIMEOUT_WORKER_HEALTHCHECK`
    ```shell
    export TIMEOUT_WORKER_HEALTHCHECK=30
    litellm
    ```

### --max_requests_before_restart
   - **默认值**：`None`
   - **类型**：`int`
   - worker 处理完该数量的请求后重启。有助于缓解内存随时间增长的问题。
   - uvicorn：映射到 `limit_max_requests`
   - gunicorn：映射到 `max_requests`
   - **用法**：
     ```shell
     litellm --max_requests_before_restart 10000
     ```
  - **用法**（通过环境变量设置）：`MAX_REQUESTS_BEFORE_RESTART`
    ```shell
    export MAX_REQUESTS_BEFORE_RESTART=10000
    litellm
    ```

### --max_requests_before_restart_jitter
   - **默认值**：`None`
   - **类型**：`int`
   - 为每个 worker 的 `--max_requests_before_restart` 增加一个 `[0, jitter]` 范围内的随机量，让各 worker 在不同请求数上错峰回收，而不是同时重启。未设置 `--max_requests_before_restart` 时无效。
   - uvicorn：映射到 `limit_max_requests_jitter`（需要 `uvicorn>=0.41.0`；更旧的版本会忽略该开关并给出警告）
   - gunicorn：映射到 `max_requests_jitter`
   - **用法**：
     ```shell
     litellm --max_requests_before_restart 10000 --max_requests_before_restart_jitter 1000
     ```
  - **用法**（通过环境变量设置）：`MAX_REQUESTS_BEFORE_RESTART_JITTER`
    ```shell
    export MAX_REQUESTS_BEFORE_RESTART=10000
    export MAX_REQUESTS_BEFORE_RESTART_JITTER=1000
    litellm
    ```

## 服务器后端选项

### --run_gunicorn
   - **默认值**：`False`
   - **类型**：`bool`（开关）
   - 用 gunicorn 而非 uvicorn 启动代理。在生产环境中管理多个 worker 时更合适。
   - **用法**：
     ```shell
     litellm --run_gunicorn
     ```

### --run_hypercorn
   - **默认值**：`False`
   - **类型**：`bool`（开关）
   - 用 hypercorn 而非 uvicorn 启动代理。支持 HTTP/2。
   - **用法**：
     ```shell
     litellm --run_hypercorn
     ```

### --run_granian
   - **默认值**：`False`
   - **类型**：`bool`（开关）
   - **状态**：Beta。想要更高的网关吞吐量时可以选用；默认仍是 uvicorn。
   - 用 [Granian](https://github.com/emmett-framework/granian)（基于 Rust 的 ASGI 服务器）而非 uvicorn 启动代理。支持 HTTP/1 和 HTTP/2。
   - **为什么选它**：Granian 把 HTTP 层从 Python 移到了 Rust 运行时，在处理并发代理流量时通常比单用 uvicorn 更平稳、更可预期。在 LiteLLM 的负载测试中，Granian 比同等配置的 uvicorn 多 worker 部署有 **10–20 RPS 的提升**，持续负载下**稳定性更好、请求失败更少**。
   - **环境要求**：Python {{python_min_version}}+ 以及 `granian` 包（已包含在 `litellm[proxy]` 中）。
   - **使用 Granian 的限制**：
     - 不支持 `--max_requests_before_restart`（Granian 使用以秒计的 `workers_lifetime`，而不是按请求数限制）。
     - `--ciphers` 不生效。
     - `--keepalive_timeout` 和 `--log_config` 仅对 uvicorn 有效。
   - **用法**：
     ```shell
     litellm --config config.yaml --run_granian --num_workers 4
     ```

### --skip_server_startup
   - **默认值**：`False`
   - **类型**：`bool`（开关）
   - 完成初始化后不启动服务器（只在只做数据库迁移时有用）。
   - **用法**：
     ```shell
     litellm --skip_server_startup
     ```

## SSL/TLS 配置

### --ssl_keyfile_path
   - **默认值**：`None`
   - **类型**：`str`
   - SSL 私钥文件的路径。启动代理时需要提供 SSL 证书的场景可以使用该参数。
   - **用法**：
     ```shell
     litellm --ssl_keyfile_path /path/to/key.pem --ssl_certfile_path /path/to/cert.pem
     ```
  - **用法**（通过环境变量设置）：`SSL_KEYFILE_PATH`
    ```shell
    export SSL_KEYFILE_PATH=/path/to/key.pem
    litellm
    ```

### --ssl_certfile_path
   - **默认值**：`None`
   - **类型**：`str`
   - SSL 证书文件的路径。启动代理时需要提供 SSL 证书的场景可以使用该参数。
   - **用法**：
     ```shell
     litellm --ssl_certfile_path /path/to/cert.pem --ssl_keyfile_path /path/to/key.pem
     ```
  - **用法**（通过环境变量设置）：`SSL_CERTFILE_PATH`
    ```shell
    export SSL_CERTFILE_PATH=/path/to/cert.pem
    litellm
    ```

### --ciphers
   - **默认值**：`None`
   - **类型**：`str`
   - SSL 配置使用的加密套件。仅配合 `--run_hypercorn` 使用。
   - **用法**：
     ```shell
     litellm --run_hypercorn --ssl_keyfile_path /path/to/key.pem --ssl_certfile_path /path/to/cert.pem --ciphers "ECDHE+AESGCM"
     ```

## 模型配置

### --model 或 -m
   - **默认值**：`None`
   - 传给 LiteLLM 的模型名称。
   - **用法**：
     ```shell
     litellm --model {{openai_small}}
     ```

### --alias
   - **默认值**：`None`
   - 模型的别名，便于用户引用。可以用它给 LiteLLM 模型名（如 "huggingface/codellama/CodeLlama-7b-Instruct-hf"）起一个更好记的名字（"codellama"）。
   - **用法**：
     ```shell
     litellm --alias my-gpt-model
     ```

### --api_base
   - **默认值**：`None`
   - LiteLLM 要调用的模型的 API 基础地址。
   - **用法**：
     ```shell
     litellm --model huggingface/tinyllama --api_base https://k58ory32yinf1ly0.us-east-1.aws.endpoints.huggingface.cloud
     ```

### --api_version
   - **默认值**：`litellm.AZURE_DEFAULT_API_VERSION`（当前为 `2025-02-01-preview`）
   - 用于 Azure 服务时指定 API 版本。
   - **用法**：
     ```shell
     litellm --model azure/gpt-deployment --api_version 2023-08-01 --api_base https://<your api base>"
     ```

### --headers
   - **默认值**：`None`
   - API 调用携带的请求头（JSON 字符串形式）。
   - **用法**：
     ```shell
     litellm --model my-model --headers '{"Authorization": "Bearer token"}'
     ```

### --add_key
   - **默认值**：`None`
   - 向模型配置中添加一个密钥。
   - **用法**：
     ```shell
     litellm --add_key my-api-key
     ```

### --save
   - **类型**：`bool`（开关）
   - 保存该模型专属的配置。
   - **用法**：
     ```shell
     litellm --model {{openai_small}} --save
     ```

## 模型参数

### --temperature
   - **默认值**：`None`
   - **类型**：`float`
   - 设置模型的采样温度（temperature）。
   - **用法**：
     ```shell
     litellm --temperature 0.7
     ```

### --max_tokens
   - **默认值**：`None`
   - **类型**：`int`
   - 设置模型输出的最大 Token 数。
   - **用法**：
     ```shell
     litellm --max_tokens 50
     ```

### --request_timeout
   - **默认值**：`None`
   - **类型**：`int`
   - 以秒为单位设置补全（completion）调用的超时时间。
   - **用法**：
     ```shell
     litellm --request_timeout 300
     ```

### --max_budget
   - **默认值**：`None`
   - **类型**：`float`
   - 设置 API 调用的预算上限。适用于 OpenAI、TogetherAI、Anthropic 等托管模型。
   - **用法**：
     ```shell
     litellm --max_budget 100.0
     ```

### --drop_params
   - **类型**：`bool`（开关）
   - 丢弃所有未映射的参数。
   - **用法**：
     ```shell
     litellm --drop_params
     ```

### --add_function_to_prompt
   - **类型**：`bool`（开关）
   - 当传入的函数不受支持时，将其作为提示词的一部分传递。
   - **用法**：
     ```shell
     litellm --add_function_to_prompt
     ```

## 数据库配置

### --iam_token_db_auth
   - **默认值**：`False`
   - **类型**：`bool`（开关）
   - 使用短期有效的 IAM 令牌（而非存储的密码）对 Amazon RDS 或 Amazon Aurora 上的 PostgreSQL 进行身份验证。
   - LiteLLM 通过 boto3 生成该令牌，并在过期前自动刷新。
   - 该选项仅支持 AWS。Azure Database for PostgreSQL 请改用 [`--azure_postgresql_auth`](#--azure_postgresql_auth)。Google Cloud SQL 则需要带上 `--auto-iam-authn` 运行 Cloud SQL Auth Proxy，再把 `DATABASE_URL` 配置为使用本地代理连接。不要在 Cloud SQL 上启用此开关。
   - **必需的环境变量**：
     - `DATABASE_HOST` - RDS 数据库主机地址
     - `DATABASE_PORT` - 数据库端口
     - `DATABASE_USER` - 数据库用户
     - `DATABASE_NAME` - 数据库名称
     - `DATABASE_SCHEMA`（可选）- 数据库 schema
   - **用法**：
     ```shell
     litellm --iam_token_db_auth
     ```
  - **用法**（通过环境变量设置）：`IAM_TOKEN_DB_AUTH`
    ```shell
    export IAM_TOKEN_DB_AUTH=True
    export DATABASE_HOST=mydb.us-east-1.rds.amazonaws.com
    export DATABASE_PORT=5432
    export DATABASE_USER=mydbuser
    export DATABASE_NAME=mydb
    litellm
    ```

#### Amazon ECS 设置

对于运行在 Amazon ECS 上的 LiteLLM：

1. 在 Amazon RDS 或 Aurora PostgreSQL 实例上启用 IAM 数据库身份验证。
2. 为 IAM 身份验证配置 PostgreSQL 用户。
3. 授权 ECS 任务角色（task role）以该用户身份连接数据库。
4. 在 ECS 任务定义中设置 `IAM_TOKEN_DB_AUTH=True` 以及所需的 `DATABASE_*` 变量。

LiteLLM 使用任务角色的 AWS 凭证生成并刷新数据库令牌，无需静态数据库密码。

这些配置在 LiteLLM 启动时从任务环境中读取。要修改该开关或连接参数，需要部署新的任务定义或重启代理任务。令牌刷新不需要重启。

### --azure_postgresql_auth
   - **默认值**：`False`
   - **类型**：`bool`（开关）
   - 使用短期有效的 Microsoft Entra ID 访问令牌（而非存储的密码）对 Azure Database for PostgreSQL Flexible Server 进行身份验证。
   - LiteLLM 通过 Azure Identity 库为 `https://ossrdbms-aad.database.windows.net/.default` 作用域请求令牌，并在过期前自动刷新。
   - 该选项仅支持 Azure，且不能与 `--iam_token_db_auth` 同时启用。两者同时开启时，代理会在启动时退出。
   - **必需的环境变量**：
     - `DATABASE_HOST` - 服务器主机，如 `myserver.postgres.database.azure.com`
     - `DATABASE_USER` - 对应 PostgreSQL 角色的 Microsoft Entra 主体，如托管标识名称或用户主体名称（UPN）
     - `DATABASE_NAME` - 数据库名称
     - `DATABASE_PORT`（可选）- 数据库端口，默认 `5432`
     - `DATABASE_SCHEMA`（可选）- 数据库 schema
   - **用法**：
     ```shell
     litellm --azure_postgresql_auth
     ```
  - **用法**（通过环境变量设置）：`AZURE_POSTGRESQL_AUTH`
    ```shell
    export AZURE_POSTGRESQL_AUTH=True
    export DATABASE_HOST=myserver.postgres.database.azure.com
    export DATABASE_USER=litellm-proxy
    export DATABASE_NAME=litellm
    litellm
    ```

#### 选择 Azure 身份

LiteLLM 从环境中读取凭证，因此同一个开关可以覆盖所有托管形态。

| 身份类型 | 选择方式 |
| --- | --- |
| 用户分配的托管标识 | 将 `AZURE_CLIENT_ID` 设置为该标识的客户端 ID。 |
| 系统分配的托管标识 | 宿主环境已附加该标识时无需额外设置。 |
| AKS 上的工作负载标识 | 由工作负载标识 Webhook 向 Pod 注入 `AZURE_CLIENT_ID`、`AZURE_TENANT_ID`、`AZURE_AUTHORITY_HOST` 和 `AZURE_FEDERATED_TOKEN_FILE`。 |
| 服务主体 | 设置 `AZURE_CLIENT_ID`、`AZURE_TENANT_ID` 和 `AZURE_CLIENT_SECRET`。 |
| 本地开发 | 运行 `az login`，LiteLLM 会使用该会话。 |

#### 设置 DATABASE_USER

`DATABASE_USER` 中要填入 PostgreSQL 所识别的主体名称，原样保留其中的 `@`。形如 `litellm@contoso.onmicrosoft.com` 的用户主体名称直接填入即可，LiteLLM 会在拼装连接 URL 时做百分号编码。如果值本身已经过百分号编码（如 `litellm%40contoso.onmicrosoft.com`），则会原样透传，因此从 RDS IAM 身份验证迁移过来的部署可以继续使用。

#### Azure Kubernetes Service 设置

对于在 AKS 上使用工作负载标识运行的 LiteLLM：

1. 在 Azure Database for PostgreSQL Flexible Server 上启用 Microsoft Entra 身份验证。
2. 为工作负载标识创建 PostgreSQL 角色，可以将其添加为 Microsoft Entra 管理员，也可以由现有管理员运行 `pgaadauth_create_principal`。
3. 为该角色授予 LiteLLM 所需的数据库权限。
4. 在 LiteLLM 服务账号上注解该标识的客户端 ID，并为 Pod 添加工作负载标识标签。
5. 在部署中设置 `AZURE_POSTGRESQL_AUTH=True` 以及所需的 `DATABASE_*` 变量。

LiteLLM 使用 Pod 的联合令牌请求并刷新数据库令牌。由于无需静态数据库密码，服务器可以继续保持密码身份验证关闭。

这些配置在 LiteLLM 启动时从环境中读取。要修改该开关或连接参数，需要重启代理。令牌刷新不需要重启。

#### 使用 Helm Chart 部署

Chart 会按数据库端点分别启用该开关。设置 `database.writer.useAzureEntraAuth` 后会生成 `AZURE_POSTGRESQL_AUTH=true` 并省略 `DATABASE_PASSWORD`，因此 writer 的 Secret 中不需要密码。用户名仍来自 `passwordSecret.usernameKey`。

```yaml
database:
  writer:
    host: myserver.postgres.database.azure.com
    dbname: litellm
    useAzureEntraAuth: true
    passwordSecret:
      name: litellm-writer-secret
      usernameKey: username
```

只读副本在 `database.reader` 下使用同样的键，并且要求 writer 也启用 Entra 身份验证，因为代理读取的是一个全局开关。在同一个端点上同时设置 `useIAMAuth` 和 `useAzureEntraAuth` 会导致渲染失败，错误信息会同时点名这两个键。

### --use_prisma_db_push
   - **默认值**：`False`
   - **类型**：`bool`（开关）
   - 数据库 schema 更新时使用 `prisma db push` 而非 `prisma migrate`。适合想快速同步数据库 schema、又不想生成迁移文件的场景。
   - **用法**：
     ```shell
     litellm --use_prisma_db_push
     ```

## 调试

### --debug
   - **默认值**：`False`
   - **类型**：`bool`（开关）
   - 为输入开启调试模式。
   - **用法**：
     ```shell
     litellm --debug
     ```
  - **用法**（通过环境变量设置）：`DEBUG`
    ```shell
    export DEBUG=True
    litellm
    ```

### --detailed_debug
   - **默认值**：`False`
   - **类型**：`bool`（开关）
   - 开启详细调试模式，查看详尽的调试日志。
   - **用法**：
     ```shell
     litellm --detailed_debug
     ```
  - **用法**（通过环境变量设置）：`DETAILED_DEBUG`
    ```shell
    export DETAILED_DEBUG=True
    litellm
    ```

### --local
   - **默认值**：`False`
   - **类型**：`bool`（开关）
   - 用于本地调试。
   - **用法**：
     ```shell
     litellm --local
     ```

## 测试与健康检查

### --test
   - **类型**：`bool`（开关）
   - 对代理的对话补全 URL 发起一次测试请求。
   - **用法**：
     ```shell
     litellm --test
     ```

### --test_async
   - **默认值**：`False`
   - **类型**：`bool`（开关）
   - 调用异步端点 `/queue/requests` 和 `/queue/response`。
   - **用法**：
     ```shell
     litellm --test_async
     ```

### --num_requests
   - **默认值**：`10`
   - **类型**：`int`
   - 向异步端点发送的请求数量（配合 `--test_async` 使用）。
   - **用法**：
     ```shell
     litellm --test_async --num_requests 100
     ```

### --health
   - **类型**：`bool`（开关）
   - 对 config.yaml 中的所有模型执行健康检查。
   - **用法**：
     ```shell
     litellm --health
     ```

## 其他选项

### --version
   - **短格式**：`-v`
   - **类型**：`bool`（开关）
   - 打印 LiteLLM 版本并退出。
   - **用法**：
     ```shell
     litellm --version
     ```

### --use_queue
   - **默认值**：`False`
   - **类型**：`bool`（开关）
   - 为异步端点使用 celery worker。
   - **用法**：
     ```shell
     litellm --use_queue
     ```
