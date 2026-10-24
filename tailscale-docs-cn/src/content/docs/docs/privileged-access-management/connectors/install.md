---
title: "Install a Tailscale PAM connector"
description: "You need to install a [Tailscale PAM connector][docs-pam-connectors] to provide secure sessions between a client and a protected resource on your Tailscale network."
---

Last validated Aug 17, 2026

> **Note:** Tailscale PAM is currently in beta.

You need to install a [Tailscale PAM connector][docs-pam-connectors] to provide secure sessions between a client and a protected resource on your Tailscale network.

You can choose between installing a connector from the Tailscale admin console or by installing a connector manually.

## Prerequisites

The following prerequisites are required for any device that you use to run as a Tailscale PAM connector.

* **Device compatibility**: The device must run either Linux or macOS.

* **Network reachability to Tailscale PAM**: Your connector must have the ability to egress its network and reach the Tailscale PAM API and proxies through the internet.

* **Connector authentication**: Depending on your preferred installation method, you are required to create a connector token for the connector to authenticate. If you don't provide this token when required, the connector will not authenticate itself with your tailnet, preventing the connector from being online. Any [service][docs-pam-services] that is associated only with this connector will not be available to your tailnet users.

The following prerequisites are use-case specific.

* **Network reachability to service origins**: Your connector must be able to reach the target services (at the hostname and port configured in the upstream configuration) through the network, with the exception of AWS SSM targets. For example, if you have a connector running in a private network with no way of connecting to a target service in a different private network, this connector will not be able to establish a connection to the upstream service.

* **Third-party service authentication**: Depending on the upstream configuration of your connector's services, you may need additional credentials or configuration to authenticate against third-party services. Specifically, if any of the services are connected to by using the AWS EC2 Instance Connect or AWS SSM options, you need to make sure your connector's runtime has access to the appropriate AWS credentials that allow connecting with those methods.

  * For help with AWS credentials for connecting to AWS EC2 Instance Connect targets, refer to the [AWS credentials][xt-border0-aws-ec2] topic on the Tailscale PAM site.
  * For help with AWS credentials for connecting to AWS SSM targets, refer to the [AWS EC2 / ECS With SSM (Session Manager)][xt-border0-aws-ec2-with-ssm] topic on the Tailscale PAM site.

## Install the connector binary

The connector binary, `tailzero`, is a [`tsnet`][docs-tsnet] binary with a single auto-detecting installation script. `tailzero` provides the connector capability to let your users securely access services in your tailnet. How you install the connector binary depends on which platform you are using.

#### Linux/macOS

### Install with an invite code

Use an invite code if you want to download, create, and install the connector binary in one step. You can get an invite code from the Tailscale admin console.

1. Open the [Connectors](https://console.tailscale.com/admin/connectors) page.

2. Select **Add connector**.

3. Select the **Linux** option. Use the **Linux** option for macOS also.

4. Copy the command, replacing the placeholder with your actual invite code:

   ```shell
   sh <(curl -fsSL https://tailscale.border0.com/tailzero/install.sh) --invite <your-invite-code>
   ```

5. At a command prompt on the device that you want to use for the connector, run the command that you copied.

6. Follow the prompts to authenticate the device to your tailnet.

#### Docker

### Install with an invite code

Use an invite code if you want to download, create, and install the connector binary in one step. You can get an invite code from the Tailscale admin console.

1. Open the [Connectors](https://console.tailscale.com/admin/connectors) page.

2. Select **Add connector**.

3. Select the **Docker** option.

4. Copy the command, and replace the values for your particular needs:

   ```shell
   docker run -ti --name tailzero-connector \
   --volume tailzero-volume:/var/lib/tailzero \
   ghcr.io/borderzero/tailzero \
   --border0-invite-code <your-invite-code>
   ```

5. At a command prompt on the device that you want to use for the connector, run the command that you copied.

6. Follow the prompts to authenticate the device to your tailnet.

#### Kubernetes

1. Open the [Connectors](https://console.tailscale.com/admin/connectors) page of the admin console.
2. Select **Add connector**.
3. Select the **Kubernetes** option.
4. Specify values for the namespace and release name. You can optionally choose to create the namespace.
5. At a command prompt on the device that you want to use for the connector, run the commands that are shown in the **Launch New Connector** page.

#### AWS EC2

1. Open the [Connectors](https://console.tailscale.com/admin/connectors) page of the admin console.
2. Select **Add connector**.
3. Select the **AWS EC2** option.
4. Follow the instructions that are shown in the **Launch New Connector** page.

This starts the connector process as a system service on your operating system, ensuring it runs after reboots. In the **Connectors** page, your connector should appear as **online**.

Once installed, you can create services, which will appear in your Tailscale client, letting your tailnet users securely access them without requiring an additional login on the client.

## Manage the connector service

You can use the command line to manage the connector service.

### Manage the connector service on Linux

To check the current status of the PAM connector service:

```shell
sudo systemctl status tailzero
```

To stop the PAM connector service:

```shell
sudo systemctl stop tailzero
```

To start the PAM connector service:

```shell
sudo systemctl start tailzero
```

To restart the PAM connector service:

```shell
sudo systemctl restart tailzero
```

To check the connector logs:

```shell
journalctl -fu tailzero
```

### Manage the connector service on macOS

To stop the PAM connector service:

```shell
sudo launchctl unload /Library/LaunchDaemons/tailzero.plist
```

To start the PAM connector service:

```shell
sudo launchctl load /Library/LaunchDaemons/tailzero.plist
```

## Update the connector binary

You have two ways to update the connector binary.

You can run the `tailzero version upgrade` command:

```shell
sudo tailzero version upgrade
```

Alternatively, for Linux and macOS, run the same command as used to install the binary:

```shell
sh <(curl -fsSL https://tailscale.border0.com/tailzero/install.sh)
```

To determine which version you are running, run:

```shell
tailzero version
```

## Configure your connector

Once you have installed and started your connector, it should show up in the [Connectors](https://console.tailscale.com/admin/connectors) page. The connector provides several built-in services that can be enabled or disabled by configuring the connector details. By default the connector is configured to run a built-in SSH server, which lets you open an SSH shell on the connector host.

For more information about connectors, refer to [PAM connectors][docs-pam-connectors].

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-services]: /docs/privileged-access-management/services

[docs-tsnet]: /docs/features/tsnet

[xt-border0-aws-ec2-with-ssm]: https://docs.border0.com/docs/aws-ec2-with-ssm#aws-credentials-for-border0-connector

[xt-border0-aws-ec2]: https://docs.border0.com/docs/aws-ec2-instance-connect#aws-credentials
