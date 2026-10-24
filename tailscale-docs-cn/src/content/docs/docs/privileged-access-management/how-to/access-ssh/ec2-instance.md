---
title: "Access an EC2 instance with AWS EC2 Instance Connect using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] lets you provide SSH access to Amazon Elastic Compute Cloud (EC2) instances using [Tailscale identity][docs-tailscale-identity] instead of distributing and managing long-live"
---

Last validated Aug 20, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] lets you provide SSH access to Amazon Elastic Compute Cloud (EC2) instances using [Tailscale identity][docs-tailscale-identity] instead of distributing and managing long-lived SSH keys.

The Tailscale PAM [connector][docs-pam-connectors] acts as an SSH proxy. When a user starts an SSH session, Tailscale PAM applies the appropriate access controls, then the connector uses AWS EC2 Instance Connect to authenticate to the upstream EC2 instance on the user's behalf. EC2 Instance Connect works by temporarily adding an SSH public key to the instance metadata. The key remains available for 60 seconds, giving the connector enough time to establish the SSH connection. Users don't need access to the SSH key or AWS credentials used by the connector.

You can connect to an EC2 instance either directly over its public or private IP address, or through an EC2 Instance Connect Endpoint when you want to reach an instance over its private IP address.

## Prerequisites

Before you begin, make sure you have the following:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed and online.
* Tailscale [installed][docs-install] and signed in on the device you'll use to connect, if you plan to use a native SSH client.
* An EC2 Linux instance with EC2 Instance Connect installed.
* An AWS identity available to the connector with permission to use EC2 Instance Connect.
* Network connectivity from the connector to the EC2 instance, or an EC2 Instance Connect Endpoint that can reach the instance.

EC2 Instance Connect is already installed on several commonly used Amazon Machine Image (AMI) images, including Amazon Linux 2023, recent Amazon Linux 2 releases, and Ubuntu 20.04 or later. For other supported operating systems, you can install EC2 Instance Connect manually.

If you're connecting directly, make sure the EC2 instance's security group and other network controls allow SSH traffic from the network where the Tailscale PAM connector runs.

## Give the connector permission to use EC2 Instance Connect

The Tailscale PAM connector needs an AWS identity with permission to push an ephemeral SSH public key to the EC2 instance.

When possible, run the connector with an IAM role that provides the required permissions. For example, if the connector runs on an EC2 instance, you can attach an IAM role to that instance.

The connector can also use credentials available through the standard AWS credential provider chain, such as an AWS profile or static AWS credentials.

At minimum, the connector needs the `ec2-instance-connect:SendSSHPublicKey` permission for the EC2 instances it should be able to access.

For example:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ec2-instance-connect:SendSSHPublicKey",
      "Resource": [
        "arn:aws:ec2:<aws-region>:<aws-account-id>:instance/<ec2-instance-id>"
      ],
      "Condition": {
        "StringEquals": {
          "ec2:osuser": "ubuntu"
        }
      }
    }
  ]
}
```

Replace `<aws-region>`, `<aws-account-id>`, and `<ec2-instance-id>` with the values required for your environment.

The `ec2:osuser` condition lets you restrict which operating system user the connector can use. For example, you can permit connections as `ubuntu` without allowing connections as `root`. If `unbuntu` is not appropriate for your environment, update as needed.

Use least-privilege AWS IAM permissions and limit the connector to the EC2 instances and operating system users it needs to access.

## Create an SSH PAM service

To create a PAM service for the EC2 instance:

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select **Secure Shell - AWS EC2 via Inst. Connect**.

5. Select **Continue**.

6. Enter a name for the service.

7. (Optional) Enter a description.

8. Choose whether to enable session recording.

9. From **Connect via**, select one or more Tailscale PAM connectors.

   Select a connector that can reach the EC2 instance, or that can use the EC2 Instance Connect Endpoint you plan to configure.

10. Select **Continue**.

11. For **Upstream hostname or IP**, provide the hostname or IP address of the upstream SSH server.

12. For **Port**, enter the SSH port. The default is `22`.

13. For **EC2 instance ID**, enter the instance ID of the EC2 instance.

14. For **AWS region**, enter the AWS Region where the instance is running.

15. (Optional) For **EC2 Instance Connect endpoint ID**, enter the endpoint ID if you're connecting through an EC2 Instance Connect Endpoint.

16. For **Username**, enter the username the connector should use to connect to the EC2 instance.

17. For **AWS authentication strategy**, choose how the connector authenticates to AWS.

    #### Default credentials provider chain

    Select **Default credentials provider chain** to use AWS credentials already available to the connector through the standard AWS credential provider chain.

    This is a good option when the connector runs on an EC2 instance with an AWS IAM role attached to it.

    #### AWS profile

    Select **AWS profile** to use a specific AWS profile configured on the device running the connector.

    Enter the name of the AWS profile the connector should use.

    #### Static credentials

    Select **Static credentials** to provide AWS credentials directly. Enter values for the following:

    * **AWS access key ID**: The access key ID for the AWS identity.
    * **AWS secret access key**: The corresponding secret access key.

    AWS credentials are sensitive.

    > **Warning:**
    >
    > For production environments, prefer an AWS IAM role or another short-lived credential source when possible.

18. Select **Save**.

Your SSH PAM service that use EC2 Instance Connect has been created. You can access it in the [Services](https://console.tailscale.com/admin/services) page.

## Use an EC2 Instance Connect Endpoint

If the connector doesn't have a direct network path to the EC2 instance's private IP address, you can use an EC2 Instance Connect Endpoint.

An EC2 Instance Connect Endpoint creates a tunnel to the private address of an EC2 instance without requiring the instance to have a public IP address.

When configuring the Tailscale PAM service:

* Use the instance's private IP address or private DNS name as the upstream hostname.
* Enter the EC2 instance ID.
* Enter the AWS Region.
* Enter the EC2 Instance Connect Endpoint ID.
* Use port `22`, unless your SSH server listens on another port.

The AWS identity used by the connector needs both permission to push the SSH public key and permission to open the EC2 Instance Connect Endpoint tunnel.

For example:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ec2-instance-connect:SendSSHPublicKey",
      "Resource": [
        ""arn:aws:ec2:<aws-region>:<aws-account-id>:instance/<ec2-instance-id>""
      ],
      "Condition": {
        "StringEquals": {
          "ec2:osuser": "ubuntu"
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": "ec2-instance-connect:OpenTunnel",
      "Resource": [
        "arn:aws:ec2:<aws-region>::<aws-account-id>:instance-connect-endpoint/<instance-connect-endpoint-id>"
      ]
    }
  ]
}
```

Replace `<aws-region>`, `<aws-account-id>`, `<ec2-instance-id>`, and `<instance-connect-endpoint-id>` with the values required for your environment.

If `unbuntu` is not appropriate for your environment, update as needed.

AWS also lets you restrict `OpenTunnel` permissions based on properties such as the remote port, destination private IP address, and maximum tunnel duration. Consider using these conditions when you want more restrictive IAM permissions.

## Grant access to the SSH service

Before users can connect, make sure a Tailscale PAM [grant][docs-grants] gives them access to the SSH service.

SSH permissions can independently control interactive shell access, exec requests, SFTP, usernames, and TCP forwarding. You can also restrict SSH exec requests to specific commands.

For example, the SSH permissions for a broad grant can allow shell, exec, and SFTP access:

```json
"permissions": {
  "ssh": {
    "shell": {},
    "exec": {},
    "sftp": {}
  }
}
```

> **Warning:**
>
> This is useful for getting started. In a production environment, restrict the source and destination of the grant so that only the appropriate users, groups, devices, or tags can access the EC2 SSH service.

If the service is configured to **Prompt Client for Username**, you can also use SSH PAM permissions to restrict the usernames users are allowed to request.

For more SSH grant examples and information about fine-grained SSH access controls, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

## Connect to the EC2 instance

The primary way to connect is through the Tailscale client, which can launch your preferred SSH client. You can also connect entirely from your browser using the Tailscale browser client.

### Connect with your preferred SSH client

Use the Tailscale client to quickly open the SSH service with a compatible SSH client already installed on your device.

1. Open the Tailscale client.
2. Open **Services**.
3. Select your EC2 SSH service.
4. Choose the SSH client you want to use.

The Tailscale client scans your device for well-known SSH clients and shows the ones it can find. Selecting one establishes the PAM session and launches that client for you.

You aren't limited to the SSH clients shown in the Tailscale client. If your preferred client isn't listed, open it directly and use the PAM service name as the hostname.

If the service has a fixed SSH username configured, you can connect with:

```shell
ssh your-service-name
```

If the service uses **Prompt Client for Username**, specify the upstream username you want to use:

```shell
ssh your-username@your-service-name
```

Port `22` is the default, so you don't need to specify it unless your PAM service uses a different port.

If you selected **Username and Password** or **SSH Private Key** authentication, any username supplied by the SSH client is ignored. Tailscale PAM uses the username configured for the service. A client supplied username is only used with certificate-based authentication when **Prompt Client for Username** is selected.

Tailscale PAM uses your Tailscale identity to authorize the connection. The connector then uses EC2 Instance Connect to provide the temporary SSH key and establish the upstream SSH connection on your behalf.

You don't need access to the upstream SSH key or the connector's AWS credentials.

### Connect from the browser

Alternatively, you can connect entirely from your browser using the Tailscale SSH browser client.

1. Open [Services](https://console.tailscale.com/admin/services) of the Tailscale admin console.
2. Select the EC2 SSH service you want to access.
3. Select **Connect**, and the Tailscale SSH browser client opens.
4. If prompted, authenticate with your Tailscale identity.

If the service uses **Prompt Client for Username**, enter the operating system username you want to use.

You can now use an interactive SSH session on the EC2 instance directly from your browser.

The browser client runs a Tailscale client in the browser using WebAssembly (Wasm) and appears as a new [ephemeral][docs-ephemeral-nodes] device in your tailnet. If [device approval][docs-device-approval] is enabled for the tailnet, an admin must approve the browser device before it can connect.

## Review SSH sessions

Tailscale PAM gives you visibility into connections to your EC2 SSH service.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, then select a session for your SSH service. You can review information such as:

* The Tailscale identity that connected.
* The originating device.
* The connection time.
* The SSH service that was accessed.
* The requested SSH username.

When session recording is enabled, you can also review the recorded SSH session.

This gives you a direct answer to two useful questions: who accessed the EC2 server, and what did they do while they were connected?

## Troubleshooting

If you can't connect to the EC2 instance, first confirm that the Tailscale PAM connector is online.

Next, verify the EC2 Instance Connect configuration.

Make sure EC2 Instance Connect is installed on the instance. If the instance's SSH configuration overrides `AuthorizedKeysCommand` or `AuthorizedKeysCommandUser`, EC2 Instance Connect might not be able to provide the temporary SSH key.

Verify that:

* The instance ID and AWS Region configured for the PAM service are correct.
* The requested SSH username exists on the EC2 instance.
* The connector's AWS identity has `ec2-instance-connect:SendSSHPublicKey` permission.
* The AWS IAM policy permits the requested value of `ec2:osuser`.
* The connector can reach the upstream SSH server on port `22`.

If you're connecting directly, verify that the EC2 security group, network ACLs, routing, and other network controls permit SSH traffic from the connector.

If you're using an EC2 Instance Connect Endpoint, also verify that:

* The endpoint ID is correct.
* The endpoint is available and can reach the EC2 instance.
* The connector's AWS identity has `ec2-instance-connect:OpenTunnel` permission for the endpoint.
* The private IP address configured for the PAM service matches the instance you want to reach.

If none of the troubleshooting steps mentioned above resolve your issue, review the connector logs and the details for the failed session in the Tailscale PAM [session logs][docs-pam-session-logs]. These can help narrow down whether the problem is AWS IAM permissions, network connectivity, the requested operating system username, EC2 Instance Connect configuration, or the SSH server itself.

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
