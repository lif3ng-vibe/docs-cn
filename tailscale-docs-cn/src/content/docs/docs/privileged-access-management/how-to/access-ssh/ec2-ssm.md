---
title: "Access an EC2 instance with AWS Systems Manager Session Manager using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] lets you to provide secure access to Amazon EC2 instances through AWS Systems Manager Session Manager using [Tailscale identity][docs-tailscale-identity]."
---

Last validated Aug 20, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] lets you to provide secure access to Amazon EC2 instances through AWS Systems Manager Session Manager using [Tailscale identity][docs-tailscale-identity].

Users can connect to an EC2 instance without managing SSH keys, static passwords, or AWS credentials. Tailscale PAM authorizes the connection with the user's Tailscale identity, while the connector uses AWS Systems Manager to establish the upstream session.

Because the connection goes through Systems Manager, you don't need to expose port 22 or provide a direct network path from the connector to the EC2 instance.

This guide walks you through preparing an EC2 instance for Session Manager, configuring AWS permissions for the connector, creating the PAM service, and connecting to the instance.

## Prerequisites

Before you begin, make sure you have the following:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed and online.
* Tailscale [installed][docs-install] and signed in on the device you'll use to connect, if you plan to use a native SSH client.
* An Amazon EC2 instance configured as an AWS Systems Manager managed node.
* SSM Agent installed and running on the EC2 instance.
* An AWS identity available to the PAM connector with permission to start Systems Manager sessions.
* The EC2 instance ID and AWS Region.

The PAM connector doesn't need direct network connectivity to the EC2 instance. The managed instance communicates with AWS Systems Manager using outbound HTTPS connections. AWS requires the managed node to be able to reach the Systems Manager service endpoints.

The PAM connector doesn't need direct network connectivity to the EC2 instance. The managed instance communicates with AWS Systems Manager using outbound HTTPS connections. AWS requires the managed node to be able to reach the Systems Manager service endpoints.

## Prepare the EC2 instance for Session Manager

Before Tailscale PAM can connect, make sure you can access the EC2 instance using AWS Systems Manager Session Manager.

The instance must have SSM Agent installed and running and the permissions required to register as a Systems Manager managed node.

For EC2 instances, you can provide these permissions using an IAM instance profile with the AWS-managed `AmazonSSMManagedInstanceCore` policy.

AWS also supports Default Host Management Configuration, which can provide the necessary Systems Manager permissions at the account level.

You can verify the instance from the AWS Systems Manager console. If the instance appears as a managed node and you can start a Session Manager session to it, it's ready to use with Tailscale PAM.

## Give the connector permission to use Session Manager

The Tailscale PAM connector needs an AWS identity that can start and manage Systems Manager sessions for the EC2 instance.

When possible, use an IAM role instead of long-lived AWS access keys. For example, if the PAM connector runs on an EC2 instance, you can attach an IAM role to the connector instance and use the Default credentials provider chain authentication strategy.

The following policy is a good starting point for giving the connector access to a specific EC2 instance:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:StartSession"
      ],
      "Resource": [
        "arn:aws:ec2:${AWS_REGION}:${AWS_ACCOUNT_ID}:instance/${EC2_INSTANCE_ID}",
        "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:document/SSM-SessionManagerRunShell"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:TerminateSession"
      ],
      "Resource": [
        "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:session/*"
      ],
      "Condition": {
        "StringLike": {
          "ssm:resourceTag/aws:ssmmessages:target-id": [
            "${EC2_INSTANCE_ID}"
          ]
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:SendCommand"
      ],
      "Resource": [
        "arn:aws:ec2:${AWS_REGION}:${AWS_ACCOUNT_ID}:instance/${EC2_INSTANCE_ID}",
        "arn:aws:ssm:*::document/AWS-RunShellScript",
        "arn:aws:ssm:*::document/AWS-RunPowerShellScript"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetCommandExecution"
      ],
      "Resource": [
        "arn:aws:ec2:${AWS_REGION}:${AWS_ACCOUNT_ID}:*"
      ]
    }
  ]
}
```

Replace `${AWS_REGION}`, `${AWS_ACCOUNT_ID}`, and `${EC2_INSTANCE_ID}` with the AWS Region, AWS account ID, and EC2 instance ID for your environment.

This example limits access to the configured AWS account, Region, and EC2 instance where the underlying AWS actions support that level of resource scoping. If the connector needs to access multiple EC2 instances, add the required resources rather than replacing them with broad wildcards whenever possible.

## Create an EC2 PAM service

To create a PAM service for the EC2 instance:

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select **Secure Shell - AWS EC2 via AWS SSM**.

5. Select **Continue**.

6. Enter a name for the service.

7. (Optional) Enter a description.

8. Choose whether to enable session recording.

9. From **Connect via**, select one or more Tailscale PAM connectors.

   The connector doesn't need SSH network connectivity to the EC2 instance, but it does need access to the AWS APIs required to establish the Systems Manager session.

10. Select **Continue**.

11. For **EC2 instance ID**, enter the instance ID of the EC2 instance.

12. For **AWS region**, enter the AWS Region where the instance is running.

13. For **AWS authentication strategy**, choose how the connector authenticates to AWS.

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

14. Select **Save**.

Your SSH PAM service that uses AWS Systems Manager Session Manager has been created. You can access it in the [Services](https://console.tailscale.com/admin/services) page.

## Grant access to the SSH service

Before users can connect, make sure a Tailscale PAM [grant][docs-grants] gives them access to the SSH service.

Tailscale PAM grants can control interactive shell access, command execution, SFTP, and other SSH capabilities. For example, you can allow full SSH access for one group or restrict another group to specific non-interactive commands.

Because the upstream connection uses AWS Systems Manager rather than a traditional SSH login, there is no upstream SSH username, password, or private key for users to manage.

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
> This is useful for getting started. In a production environment, restrict the source and destination of the grant so that only the appropriate users, groups, devices, or tags can access the EC2 SSH service that uses AWS Systems Manager Session Manager

For more SSH grant examples and information about fine-grained SSH access controls, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

## Connect to the EC2 instance

The primary way to connect is through the Tailscale client, which can launch your preferred SSH client. You can also connect entirely from your browser using the Tailscale browser client.

### Connect with your preferred SSH client

Use the Tailscale client to quickly open the SSH service with a compatible SSH client already installed on your device.

1. Open the Tailscale client.
2. Open **Services**.
3. Select your EC2 SSM service.
4. Choose the SSH client you want to use.

The Tailscale client scans your device for well-known SSH clients and shows the ones it can find. Selecting one establishes the PAM session and launches that client for you.

You aren't limited to the SSH clients shown in the Tailscale client. If your preferred client isn't listed, open it directly and use the PAM service name as the hostname.

If the service has a fixed SSH username configured, you can connect with:

```shell
ssh your-service-name
```

Tailscale PAM uses your Tailscale identity to authorize the connection. The connector then starts the upstream Systems Manager session using its AWS identity.

You don't need an SSH key, password, or AWS credentials for the EC2 instance.

### Connect from the browser

Alternatively, you can connect entirely from your browser using the Tailscale SSH browser client.

1. Open [Services](https://console.tailscale.com/admin/services) of the Tailscale admin console.
2. Select the EC2 SSM service you want to access.
3. Select **Connect**, and the Tailscale SSH browser client opens.
4. If prompted, authenticate with your Tailscale identity.

You can now use an interactive SSH session on the EC2 instance directly from your browser.

The browser client runs a Tailscale client in the browser using WebAssembly (Wasm) and appears as a new [ephemeral][docs-ephemeral-nodes] device in your tailnet. If [device approval][docs-device-approval] is enabled for the tailnet, an admin must approve the browser device before it can connect.

## Review SSH sessions

Tailscale PAM gives you visibility into connections to your EC2 SSM service.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, then select a session for your service. You can review information such as:

* The Tailscale identity that connected.
* The originating device.
* The connection time.
* The service that was accessed.

When session recording is enabled, you can also review the recorded SSH session.

This gives you a direct answer to two useful questions: who accessed the EC2 instance, and what did they do while they were connected?

## Troubleshooting

If you can't connect to the EC2 instance, first verify that the PAM connector is online.

Next, make sure the EC2 instance is available through AWS Systems Manager. The instance must have SSM Agent installed and running and must have the required Systems Manager permissions.

Verify that:

* The EC2 instance ID is correct.
* The configured AWS Region matches the instance.
* The AWS identity used by the connector has permission to start a Session Manager session for the instance.
* The instance appears as a Systems Manager managed node.
* SSM Agent is running on the instance.
* The instance can make outbound HTTPS connections to the required Systems Manager endpoints.
* If you're using an AWS profile or static credentials, verify that the credentials are valid and have the required permissions.
* A useful troubleshooting step is to use the same AWS identity as the connector and confirm that you can start a Session Manager session to the instance directly through AWS.

If none of the troubleshooting steps mentioned above resolve your issue, review the connector logs and the details for the failed session in the Tailscale PAM [session logs][docs-pam-session-logs]. These can help narrow down whether the problem is the AWS credentials, IAM permissions, Systems Manager configuration, or the EC2 instance itself.

## Access an ECS task through AWS SSM

Tailscale PAM also supports access to Amazon ECS tasks through AWS Systems Manager.

To configure an ECS target, create a separate Tailscale PAM service and select **Secure Shell - AWS ECS via AWS SSM**.

Amazon ECS uses Systems Manager to establish ECS Exec sessions. ECS Exec must be enabled for the task, and the task needs an AWS IAM role with the required `ssmmessages` permissions.

For the complete setup, refer to [Access an Amazon ECS task with AWS Systems Manager][docs-pam-ssh-ecs-ssm].

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam-ssh-ecs-ssm]: /docs/privileged-access-management/how-to/access-ssh/ecs-ssm

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
