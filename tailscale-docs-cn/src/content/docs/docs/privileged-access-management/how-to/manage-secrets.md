---
title: "使用 Tailscale PAM 管理密钥与凭证"
description: "某些 [Tailscale PAM][docs-pam] [服务][docs-pam-services]需要凭证，以便[连接器][docs-pam-connectors]能向上游资源进行身份验证。例如，数据库服务可能需要上游用户名和密码，SSH 服务可能需要上游 SSH 服务器的凭证。"
---

最后验证于 Aug 14, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

某些 [Tailscale PAM][docs-pam] [服务][docs-pam-services]需要凭证，以便[连接器][docs-pam-connectors]能向上游资源进行身份验证。例如，数据库服务可能需要上游用户名和密码，SSH 服务可能需要上游 SSH 服务器的凭证。

与其把这些凭证直接存储在 Tailscale PAM 服务配置中，我们建议把它们存储在外部密钥来源中，并在服务配置里引用该密钥。

Tailscale PAM 连接器会在需要凭证时，在运行时于本地解析该密钥。这意味着服务配置中保存的是对密钥的引用，而不是密钥值本身。

使用密钥引用可以让你：

* 把上游凭证保留在你现有的密钥管理系统中。
* 避免把密钥值直接存储在 Tailscale PAM 配置里。
* 把密钥读取限定在连接器运行的环境中。
* 在密钥来源中轮换凭证而无需更改服务配置，只要密钥引用保持不变。

## 密钥引用的工作原理

动态密钥引用以 `from:` 开头。

配置 PAM 服务时：

1. 把凭证存储到一个受支持的密钥来源中。
2. 确保 Tailscale PAM 连接器有读取该密钥的权限。
3. 在服务配置的相关字段中填入 `from:` 引用，而不是直接填入凭证。
4. 当连接器需要该凭证时，它会解析引用并从所配置的来源取回值。

例如，不直接输入数据库密码：

```shell
my-secret-password
```

而是引用存储在 AWS Systems Manager Parameter Store 中的值：

```shell
from:aws:ssm:/production/database/password
```

## 受支持的密钥来源

Tailscale PAM 支持以下密钥来源。

| 密钥来源                            | 引用格式                         | 示例                                           |
| ----------------------------------- | -------------------------------- | ---------------------------------------------- |
| 环境变量                            | `from:env:<VARIABLE>`            | `from:env:DB_USERNAME`                         |
| 文件                                | `from:file:<PATH>`               | `from:file:/etc/database_username`             |
| AWS Systems Manager Parameter Store | `from:aws:ssm:<PATH>`            | `from:aws:ssm:/production/database/password`   |
| AWS Secrets Manager                 | `from:aws:secretsmanager:<PATH>` | `from:aws:secretsmanager:/production/database` |
| Keeper Secrets Manager              | `from:keeper:<RECORD>:<FIELD>`   | `from:keeper:database:password`                |

### 环境变量

使用 `from:env:` 从 Tailscale PAM 连接器可用的环境变量中取值。

例如：

```shell
from:env:DB_USERNAME
```

连接器在需要该凭证时会读取 `DB_USERNAME` 环境变量的值。

### 文件

使用 `from:file:` 从连接器主机上的文件中取值。

例如：

```shell
from:file:/etc/database_password
```

连接器会从 `/etc/database_password` 读取该值。

请确保运行 Tailscale PAM 连接器的账户有读取该文件的权限，并使用适当的文件系统权限保护该文件。

### AWS Systems Manager Parameter Store

使用 `from:aws:ssm:` 从 AWS Systems Manager Parameter Store 中取值。

例如：

```shell
from:aws:ssm:/production/database/password
```

连接器必须具有读取所引用参数的 AWS IAM 权限。

只要可能，请只授予连接器访问其管理的 PAM 服务所需参数的权限。

### AWS Secrets Manager

使用 `from:aws:secretsmanager:` 从 AWS Secrets Manager 中取回密钥。

例如：

```shell
from:aws:secretsmanager:/production/database/password
```

连接器必须具有读取所引用密钥的 AWS IAM 权限。

### Keeper Secrets Manager

使用 `from:keeper:` 从 Keeper Secrets Manager 记录中取回某个字段。

格式为：

```shell
from:keeper:<record>:<field>
```

例如：

```shell
from:keeper:database:password
```

Keeper 集成使用 `ksm` CLI。该 CLI 必须安装在连接器主机上，并且在其 `PATH` 中可用。

## 在服务配置中引用密钥

配置 Tailscale PAM 服务时，在受支持的上游配置字段中，你可以使用 `from:` 引用而不是直接输入值。

常见的例子包括：

| 服务类型 | 配置字段                                       |
| ------------ | ---------------------------------------------- |
| SSH          | 上游用户名、上游密码                           |
| 数据库       | 上游用户名、上游密码、主机名                   |
| AWS          | AWS 访问密钥 ID、AWS 秘密访问密钥              |

连接器在需要该值连接上游服务时会解析引用。

例如，一个数据库服务可以为其上游用户名使用环境变量，并为其密码使用 AWS Systems Manager Parameter Store：

```shell
Username:
from:env:RDS_USERNAME

Password:
from:aws:ssm:/rdsdata/password
```

在这个例子中，连接器从自己的环境读取 `RDS_USERNAME`，并从 AWS Systems Manager Parameter Store 取回密码。

一个 SSH 服务也可以类似地从本地文件取回用户名，并从 AWS Secrets Manager 取回密码：

```shell
Username:
from:file:/etc/ssh_username

Password:
from:aws:secretsmanager:/staging/sshpassword
```

## 从 JSON 密钥中提取字段

密钥有时会以包含多个值（例如用户名和密码）的 JSON 对象形式存储。

你可以使用 `jq_exp` 选项从 JSON 密钥中提取单个值。该表达式使用类似 `jq` 的基本点号表示法。

格式为：

```shell
from:<source>:<path>,jq_exp=<expression>
```

例如，假设一个 AWS Secrets Manager 密钥包含：

```json
{
  "username": "database-user",
  "password": "secret-password",
  "database": {
    "token": "secret-token"
  }
}
```

你可以取回各个字段：

```shell
from:aws:secretsmanager:production-database,jq_exp=.username

from:aws:secretsmanager:production-database,jq_exp=.password

from:aws:secretsmanager:production-database,jq_exp=.database.token
```

`jq_exp` 可用于受支持的密钥来源，包括 AWS Secrets Manager、AWS Systems Manager Parameter Store、环境变量和文件。

## 保护对密钥的访问

Tailscale PAM 连接器需要权限才能取回其管理的服务所引用的任何密钥。

授予这类访问时，请使用必要的最小权限。例如，如果你使用 AWS Secrets Manager 或 Systems Manager Parameter Store，请配置连接器的 IAM 权限，使它只能读取其 PAM 服务所需的密钥或参数。

对于基于文件的密钥，请把文件系统权限限制在运行连接器的账户。对于环境变量，请确保连接器主机上的其他进程或用户无法访问敏感值。

只要可能，请使用外部密钥管理器，而不是把上游凭证直接存储在 Tailscale PAM 服务配置里。

### 密钥何时刷新

Tailscale PAM 不会持续轮询外部密钥来源。连接器会在以下时机读取被引用的密钥：

* 连接器启动时。
* 服务初次开通时。
* 服务配置被保存或更新时。

如果你在外部密钥来源中轮换了密钥但没有更新服务，连接器会继续使用之前加载的值。

要加载新值，请重启连接器，或者重新保存一次服务配置。你不需要更改任何设置。保存服务本身就足以触发连接器重新取回密钥。

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-services]: /docs/privileged-access-management/services

[docs-pam]: /docs/privileged-access-management
