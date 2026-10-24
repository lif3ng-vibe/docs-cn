---
title: "Access an SSH server (or shell) using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] lets you provide users with secure access to SSH servers using their [Tailscale identity][docs-tailscale-identity] instead of distributing SSH keys or sharing static password"
---

Last validated Aug 17, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] lets you provide users with secure access to SSH servers using their [Tailscale identity][docs-tailscale-identity] instead of distributing SSH keys or sharing static passwords.

Users can connect with the SSH tools they already use or connect directly from their browser. Tailscale PAM gives you centralized control over who can access each SSH service, which usernames and SSH capabilities they can use, and a record of SSH session activity.

## How SSH access works

SSH access is provided through a Tailscale PAM [connector][docs-pam-connectors].

The connector runs in your environment and can provide SSH access in two ways:

* Use the SSH server built into the connector itself.
* Proxy connections to other SSH servers that the connector can reach.

For remote SSH servers, the connector handles the connection to the upstream server on the user's behalf. Users authenticate with their Tailscale identity, while the connector handles the upstream SSH authentication.

This means you don't need to distribute the upstream SSH password or private key to every user who needs access. Users just use their Tailscale identity.

## Ways to access SSH servers

Tailscale PAM supports several ways to provide SSH access.

### Built-in SSH server

Every Tailscale PAM connector includes a built-in SSH server.

This is the quickest way to get started. There's no separate SSH service to install or configure on the connector host, and users can connect to the host using their Tailscale identity.

The built-in SSH server listens only on the connector's Tailscale interface. It doesn't expose a new SSH listener to the public internet or interfere with another SSH server already listening on port `22`.

For more information, refer to [Access the built-in SSH server][docs-pam-ssh-built-in].

### Remote SSH server

Use the connector as an SSH proxy for another server that it can reach.

Tailscale PAM can authenticate from the connector to the upstream SSH server using several authentication methods, including:

* Username and password.
* SSH private key.
* SSH certificate.

Users still authenticate to Tailscale PAM with their Tailscale identity and don't need access to the upstream credentials.

For more information, refer to [Access a remote SSH server][docs-pam-ssh-remote].

### Amazon EC2 Instance Connect

Tailscale PAM can use Amazon EC2 Instance Connect to access EC2 instances without maintaining long-lived SSH keys for the upstream instance.

The connector uses its AWS identity to request an ephemeral SSH key and then proxies the authorized SSH session to the EC2 instance.

For more information, refer to  [Access an EC2 instance with AWS EC2 Instance Connect][docs-pam-ssh-ec2-instance].

### EC2 instance with AWS Systems Manager Session Manager

You can use Tailscale PAM with AWS Systems Manager Session Manager to provide SSH access to supported AWS workloads.

This lets the connector establish the upstream session through AWS SSM instead of requiring a directly reachable SSH listener on the instance.

For more information, refer to [Access an EC2 instance with AWS Systems Manager Session Manager][docs-pam-ssh-ec2-ssm].

### ECS container with AWS Systems Manager Session Manager

You can use Tailscale PAM with AWS Systems Manager Session Manager to provide SSH access to containers running in Amazon Elastic Container Service (ECS).

Users can connect to an ECS container without managing SSH keys, static passwords, or AWS credentials. Tailscale PAM authorizes the connection with the user's Tailscale identity, while the connector uses AWS Systems Manager to establish the upstream session.

For more information, refer to [Access an ECS container with AWS Systems Manager][docs-pam-ssh-ecs-ssm].

## Control SSH access

Tailscale PAM policies control who can connect to an SSH service and what they can do after connecting.

SSH permissions can control interactive shell access, SSH exec requests, SFTP, requested usernames, and TCP forwarding. You can also restrict exec access to specific commands using regular expressions.

For example, you can give one group full interactive SSH access while allowing another group to run only a small set of operational commands.

For SSH grant examples and information about fine-grained SSH permissions, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

## Review SSH sessions

Tailscale PAM gives you centralized visibility into SSH access.

To review SSH access activity, open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, then select a session for your SSH service. You can review information such as:

When session recording is enabled, you can also review the recorded session.

This gives you a direct answer to two useful questions: who accessed the server, and what did they do while they were connected.

For more information, refer to [Tailscale PAM session logs][docs-pam-session-logs].

[docs-pam-ssh-built-in]: /docs/privileged-access-management/how-to/access-ssh/built-in-ssh

[docs-pam-ssh-ec2-instance]: /docs/privileged-access-management/how-to/access-ssh/ec2-instance

[docs-pam-ssh-ec2-ssm]: /docs/privileged-access-management/how-to/access-ssh/ec2-ssm

[docs-pam-ssh-ecs-ssm]: /docs/privileged-access-management/how-to/access-ssh/ecs-ssm

[docs-pam-ssh-remote]: /docs/privileged-access-management/how-to/access-ssh/remote-ssh

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam]: /docs/privileged-access-management
