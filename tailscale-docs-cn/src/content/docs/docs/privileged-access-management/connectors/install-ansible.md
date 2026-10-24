---
title: "Install a Tailscale PAM connector with Ansible"
description: "You can use [Ansible][xt-ansible] to create and install [Tailscale PAM][docs-pam] [connectors][docs-pam-connectors] on Linux hosts. The playbook creates the connector resource and its credentials thro"
---

Last validated Sep 25, 2026

> **Note:** Tailscale PAM is currently in beta.

You can use [Ansible][xt-ansible] to create and install [Tailscale PAM][docs-pam] [connectors][docs-pam-connectors] on Linux hosts. The playbook creates the connector resource and its credentials through the Tailscale PAM API, installs the binary, and starts it as a `systemd` service.

You provide a Tailscale PAM service account token. The playbook automatically creates and reuses a connector token for each connector, so you don't need to get a connector token yourself.

## Prerequisites

Before you begin, you need the following:

* Access to Tailscale PAM.
* Ansible on your control node, with HTTPS access to `api.border0.com`.
* SSH access to Linux hosts with the following available:
  * Python 3
  * `systemd`
  * Outbound internet access
  * Privilege escalation (`become: true`)

As part of this guide, you will create a Tailscale PAM service account with the [**Member**][docs-pam-service-accounts-roles] role or higher, and create a token for that service account.

## Create a service account

Ansible authenticates to the API using a Tailscale PAM [service account][docs-pam-service-accounts].

To create a service account:

1. Open the [PAM](https://console.tailscale.com/admin/settings/pam) page of the Tailscale admin console.
2. In the **Service accounts** section, select **Add service account**.
3. Enter a **Name** for the service account, such as `ansible`.
4. (Optional) Enter a description.
5. Select the **Member** role. This gives the service account the permissions needed to manage connectors and services.
6. Select **Add service account**.

For more information, refer to Tailscale PAM [service accounts][docs-pam-service-accounts].

## Create a service account token

After creating the service account, create a token for `ansible`:

1. Open the [PAM](https://console.tailscale.com/admin/settings/pam) page.
2. In the **Service accounts** section, find the service account, select the   menu, and then select **Edit**.
3. Select **Create token**.
4. Enter a name for the token, such as `ansible-token`.
5. Select the token lifetime. When possible, use an expiring token and choose the shortest lifetime that works for your automation.
6. Select **Save**.
7. Copy the token and store it securely. You won't be able to get the token value again after you leave the page.

> **Note:**
>
> Treat service account tokens as secrets. Each token inherits the permissions of its service account.

## Create the inventory

Save the hosts in a file named `inventory`:

```ini
[pam_connectors]
<your-connector-1> ansible_host=<your-connector-1-address>
<your-connector-2> ansible_host=<your-connector-2-address>
```

Replace the placeholders with the inventory aliases and addresses for your hosts. Each inventory alias becomes the connector name, so use lowercase letters, numbers, and dashes. For example:

```ini
[pam_connectors]
connector-1 ansible_host=10.0.1.10
connector-2 ansible_host=10.0.1.11
```

Configure the SSH user and privilege escalation credentials for your environment.

## Run the playbook

Save the [complete playbook][ar-complete-playbook] as `playbook-api.yaml` next to the inventory.

In Bash, read the service account token without displaying it or saving it in shell history, then run the playbook:

```shell
read -rsp "Service account token: " BORDER0_AUTH_TOKEN; printf '\n'
export BORDER0_AUTH_TOKEN
ansible-playbook -i inventory playbook-api.yaml --limit pam_connectors
```

Requests to the Tailscale PAM API run on the control node. Each target host receives only its connector credential, which is stored in `/etc/border0/tailzero.env` with mode `0600`. The service account token is not written to the target host.

## Verify a connector is running

On a target host, confirm that the `tailzero` service is active:

```shell
systemctl is-active tailzero
```

The connector should also appear online on the [Connectors](https://console.tailscale.com/admin/connectors) page of the Tailscale admin console.

## Rerun the playbook

Rerunning the playbook reuses the existing connector and the credential already on the host. It also checks for the latest stable binary. An unchanged, running installation does not restart. A new binary or changed configuration can trigger a restart.

## Complete playbook

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

## Next steps

Create the [PAM services][docs-pam-services] and configure [who can access them][docs-pam-manage-access] in the Tailscale admin console, or use [Terraform][docs-pam-manage-resources-terraform]. This playbook provisions connectors, not services or access policies.

[ar-complete-playbook]: #complete-playbook

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-manage-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-manage-resources-terraform]: /docs/privileged-access-management/how-to/manage-resources-terraform

[docs-pam-service-accounts-roles]: /docs/privileged-access-management/service-accounts#service-account-roles

[docs-pam-service-accounts]: /docs/privileged-access-management/service-accounts

[docs-pam-services]: /docs/privileged-access-management/services

[docs-pam]: /docs/privileged-access-management

[xt-ansible]: https://www.ansible.com/
