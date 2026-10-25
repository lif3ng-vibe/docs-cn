---
title: "使用 Ansible 安装 Tailscale PAM 连接器"
description: "你可以使用 [Ansible][xt-ansible] 在 Linux 主机上创建并安装 [Tailscale PAM][docs-pam] [连接器][docs-pam-connectors]。Playbook 会通过 Tailscale PAM API 创建连接器资源及其凭证"
---

最后验证于 Sep 25, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

你可以使用 [Ansible][xt-ansible] 在 Linux 主机上创建并安装 [Tailscale PAM][docs-pam] [连接器][docs-pam-connectors]。该 playbook 会通过 Tailscale PAM API 创建连接器资源及其凭证、安装二进制文件，并将其作为 `systemd` 服务启动。

你只需提供 Tailscale PAM 服务账户令牌。Playbook 会为每个连接器自动创建并复用连接器令牌，因此你无需自己获取连接器令牌。

## 前提条件

开始之前，你需要具备以下条件：

* 可以访问 Tailscale PAM。
* 控制节点上安装了 Ansible，且能通过 HTTPS 访问 `api.border0.com`。
* 可以通过 SSH 访问 Linux 主机，且主机上具备以下条件：
  * Python 3
  * `systemd`
  * 出站互联网访问
  * 特权提升（`become: true`）

在本指南中，你将创建一个拥有 [**Member**][docs-pam-service-accounts-roles] 或更高角色的 Tailscale PAM 服务账户，并为该服务账户创建令牌。

## 创建服务账户

Ansible 使用 Tailscale PAM [服务账户][docs-pam-service-accounts]向 API 认证。

要创建服务账户：

1. 打开 Tailscale 管理控制台的 [PAM](https://console.tailscale.com/admin/settings/pam) 页面。
2. 在 **Service accounts** 部分，选择 **Add service account**。
3. 输入服务账户的 **Name**（名称），例如 `ansible`。
4. （可选）输入描述。
5. 选择 **Member** 角色。这会赋予服务账户管理连接器和服务所需的权限。
6. 选择 **Add service account**。

更多信息参见 Tailscale PAM [服务账户][docs-pam-service-accounts]。

## 创建服务账户令牌

创建服务账户后，为 `ansible` 创建令牌：

1. 打开 [PAM](https://console.tailscale.com/admin/settings/pam) 页面。
2. 在 **Service accounts** 部分找到该服务账户，选择其菜单，然后选择 **Edit**。
3. 选择 **Create token**。
4. 输入令牌名称，例如 `ansible-token`。
5. 选择令牌有效期。尽可能使用会过期的令牌，并选择能满足你的自动化的最短有效期。
6. 选择 **Save**。
7. 复制该令牌并妥善保存。离开该页面后将无法再次获取令牌值。

> **注意：**
>
> 把服务账户令牌当作机密对待。每个令牌都继承其服务账户的权限。

## 创建 inventory

把主机保存到名为 `inventory` 的文件中：

```ini
[pam_connectors]
<your-connector-1> ansible_host=<your-connector-1-address>
<your-connector-2> ansible_host=<your-connector-2-address>
```

把占位符替换为你主机的 inventory 别名和地址。每个 inventory 别名会成为连接器名称，因此请使用小写字母、数字和连字符。例如：

```ini
[pam_connectors]
connector-1 ansible_host=10.0.1.10
connector-2 ansible_host=10.0.1.11
```

根据你的环境配置 SSH 用户和特权提升凭证。

## 运行 playbook

把[完整 playbook][ar-complete-playbook] 保存为 `playbook-api.yaml`，与 inventory 放在一起。

在 Bash 中读取服务账户令牌（不回显、不写入 shell 历史），然后运行 playbook：

```shell
read -rsp "Service account token: " BORDER0_AUTH_TOKEN; printf '\n'
export BORDER0_AUTH_TOKEN
ansible-playbook -i inventory playbook-api.yaml --limit pam_connectors
```

对 Tailscale PAM API 的请求在控制节点上执行。每个目标主机只会收到它自己的连接器凭证，凭证保存在 `/etc/border0/tailzero.env` 中，权限为 `0600`。服务账户令牌不会写入目标主机。

## 验证连接器正在运行

在目标主机上，确认 `tailzero` 服务处于活动状态：

```shell
systemctl is-active tailzero
```

该连接器也应显示为在线，位于 Tailscale 管理控制台的 [Connectors](https://console.tailscale.com/admin/connectors) 页面。

## 重新运行 playbook

重新运行 playbook 会复用现有连接器和主机上已有的凭证。它还会检查最新的稳定版二进制文件。未发生变化的运行中安装不会重启。新的二进制文件或配置变更可能触发重启。

## 完整 playbook

```yaml
---
- name: Install Tailscale PAM connector
  hosts: all
  become: true

  vars:
    tailzero_hostname: "{{ inventory_hostname }}"
    border0_service_account_token: "{{ lookup('env', 'BORDER0_AUTH_TOKEN') }}"
    border0_api_base: "https://api.border0.com/api/v1"
    tailzero_connector_name: >-
      {{ inventory_hostname | regex_replace('[^a-z0-9-]', '-') }}

  handlers:
    - name: Restart connector
      systemd:
        name: tailzero
        state: restarted
        daemon_reload: true

  tasks:
    - name: Read existing connector token from host
      slurp:
        src: /etc/border0/tailzero.env
      register: tailzero_env
      failed_when: false
      changed_when: false
      no_log: true

    - name: List connectors in the organization
      uri:
        url: "{{ border0_api_base }}/connectors"
        headers:
          Authorization: "Bearer {{ border0_service_account_token }}"
        return_content: true
      register: border0_connectors
      become: false
      delegate_to: localhost

    - name: Find existing connector and token
      set_fact:
        tailzero_existing_token: >-
          {{ ((tailzero_env.content | default('') | b64decode)
              | regex_findall('^BORDER0_TOKEN=(\S+)') | first) | default('') }}
        tailzero_connector_id: >-
          {{ ((border0_connectors.json.list
              | selectattr('name', 'equalto', tailzero_connector_name)
              | map(attribute='connector_id') | first) | default('')) }}

    - name: Create connector
      uri:
        url: "{{ border0_api_base }}/connector"
        method: POST
        body:
          name: "{{ tailzero_connector_name }}"
        body_format: json
        status_code: [200, 201]
        headers:
          Authorization: "Bearer {{ border0_service_account_token }}"
      register: border0_connector_create
      when: tailzero_connector_id == ''
      become: false
      delegate_to: localhost

    - name: Create connector token
      uri:
        url: "{{ border0_api_base }}/connector/token"
        method: POST
        body:
          connector_id: >-
            {{ border0_connector_create.json.connector_id
            | default(tailzero_connector_id) }}
          name: "{{ tailzero_connector_name }}-ansible"
        body_format: json
        status_code: [200, 201]
        headers:
          Authorization: "Bearer {{ border0_service_account_token }}"
      register: border0_token_create
      when: >-
        tailzero_existing_token == ''
        or border0_connector_create is not skipped
      no_log: true
      become: false
      delegate_to: localhost

    - name: Determine connector architecture
      set_fact:
        tailzero_arch: >-
          {{ 'amd64' if ansible_facts['architecture'] == 'x86_64'
             else 'arm64' if ansible_facts['architecture']
             in ['aarch64', 'arm64']
             else 'arm' if ansible_facts['architecture'] == 'armv7l'
             else 'amd64' }}

    - name: Fetch latest connector version
      uri:
        url: "https://tailscale.border0.com/tailzero/stable/latest_version.txt"
        return_content: true
      register: tailzero_version_response

    - name: Set connector version
      set_fact:
        tailzero_version: "{{ tailzero_version_response.content | trim }}"

    - name: Create connector directories
      file:
        path: "{{ item }}"
        state: directory
        owner: root
        group: root
        mode: "0755"
      loop:
        - /etc/border0
        - /var/lib/tailzero

    - name: Download connector binary
      get_url:
        url: >-
          https://tailscale.border0.com/tailzero/stable/tailzero_{{
          tailzero_version }}_{{ ansible_facts['system'] | lower }}_{{
          tailzero_arch }}
        dest: /usr/local/bin/tailzero
        mode: "0755"
        force: true
      notify: Restart connector

    - name: Write connector credentials
      copy:
        dest: /etc/border0/tailzero.env
        mode: "0600"
        content: >-
          BORDER0_TOKEN={{ border0_token_create.json.token
          | default(tailzero_existing_token) }}
      no_log: true
      notify: Restart connector

    - name: Install connector systemd unit
      copy:
        dest: /etc/systemd/system/tailzero.service
        mode: "0644"
        content: |
          [Unit]
          Description=Tailscale PAM connector
          After=network-online.target
          Wants=network-online.target

          [Service]
          Type=simple
          ExecStart=/usr/local/bin/tailzero \
              -hostname={{ tailzero_hostname }} \
              -statedir=/var/lib/tailzero
          EnvironmentFile=/etc/border0/tailzero.env
          Restart=on-failure
          RestartSec=5

          [Install]
          WantedBy=multi-user.target
      notify: Restart connector

    - name: Enable and start connector
      systemd:
        name: tailzero
        enabled: true
        state: started
        daemon_reload: true
```

## 后续步骤

在 Tailscale 管理控制台中创建 [PAM 服务][docs-pam-services]并配置[谁可以访问它们][docs-pam-manage-access]，或使用 [Terraform][docs-pam-manage-resources-terraform]。此 playbook 只负责供应连接器，不负责服务或访问策略。

[ar-complete-playbook]: #完整-playbook

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-manage-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-manage-resources-terraform]: /docs/privileged-access-management/how-to/manage-resources-terraform

[docs-pam-service-accounts-roles]: /docs/privileged-access-management/service-accounts#service-account-roles

[docs-pam-service-accounts]: /docs/privileged-access-management/service-accounts

[docs-pam-services]: /docs/privileged-access-management/services

[docs-pam]: /docs/privileged-access-management

[xt-ansible]: https://www.ansible.com/
