---
title: "Access an ECS container with AWS Systems Manager using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] lets you provide secure access to containers running in Amazon Elastic Container Service (ECS) using [Tailscale identity][docs-tailscale-identity]."
---

Last validated Aug 20, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] lets you provide secure access to containers running in Amazon Elastic Container Service (ECS) using [Tailscale identity][docs-tailscale-identity].

Users can connect to an ECS container without managing SSH keys, static passwords, or AWS credentials. Tailscale PAM authorizes the connection with the user's Tailscale identity, while the connector uses AWS Systems Manager to establish the upstream session.

Because the connection goes through AWS Systems Manager, you don't need to run an SSH server inside the container or expose port `22`.

This guide walks you through preparing an ECS task for access, configuring AWS permissions for the connector, creating the PAM service, and connecting to the container.

## Prerequisites

Before you begin, make sure you have the following:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed and online.
* Tailscale [installed][docs-install] and signed in on the device you'll use to connect, if you plan to use a native SSH client.
* An Amazon ECS cluster with a running task.
* ECS Exec enabled for the task.
* An ECS task role with the permissions required to communicate with AWS Systems Manager.
* An AWS identity available to the PAM connector with permission to access the ECS task.
* The AWS Region for the ECS cluster.

ECS Exec uses AWS Systems Manager Session Manager to establish a connection with the container. The required Systems Manager components are managed as part of ECS Exec, so you don't install a traditional SSH server or manage SSH credentials inside the container.

## Prepare the ECS task for access

Before Tailscale PAM can connect, make sure ECS Exec is enabled for the ECS service or standalone task.

You can enable ECS Exec when creating or updating an ECS service, or when starting a new standalone task. ECS Exec can't be enabled on an already-running task. New tasks must be started after the feature is enabled.

The task also needs a task IAM role that lets the managed Systems Manager agent communicate with the Systems Manager service.

Add the following permissions to the **task role**, not the task execution role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssmmessages:CreateControlChannel",
        "ssmmessages:CreateDataChannel",
        "ssmmessages:OpenControlChannel",
        "ssmmessages:OpenDataChannel"
      ],
      "Resource": "*"
    }
  ]
}
```

AWS requires these permissions for the managed SSM agent used by ECS Exec.

If the task doesn't have internet access and uses VPC endpoints, make sure it can reach the Systems Manager Session Manager `ssmmessages` endpoint.

Before continuing, confirm that ECS Exec works for the task using your normal AWS tooling. If you can successfully open an ECS Exec session to the container, the task is ready to use with Tailscale PAM.

## Give the connector permission to access ECS

The Tailscale PAM connector needs an AWS identity with permission to establish Systems Manager sessions to the ECS task and do the read-only ECS operations needed to identify ECS resources.

When possible, use an AWS IAM role instead of long-lived AWS access keys. For example, if the connector runs on an EC2 instance, you can attach an IAM role to that instance and use the **Default credentials provider chain** authentication strategy.

The following policy is a good starting point for giving the connector access to a specific ECS task:

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
        "arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:task/${ECS_TASK_ID}",
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
            "${ECS_TASK_ID}"
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
        "arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:task/${ECS_TASK_ID}",
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
        "arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeClusters",
        "ecs:DescribeContainerInstances",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeTasks",
        "ecs:ListClusters",
        "ecs:ListContainerInstances",
        "ecs:ListServices",
        "ecs:ListTaskDefinitionFamilies",
        "ecs:ListTaskDefinitions",
        "ecs:ListTasks"
      ],
      "Resource": [
        "arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:*"
      ]
    }
  ]
}
```

Replace:

* `${AWS_REGION}` with the AWS Region where the ECS workload is running.
* `${AWS_ACCOUNT_ID}` with your AWS account ID.
* `${ECS_TASK_ID}` with the ID of the ECS task.

This policy follows the permissions used by the existing integration while limiting resources to the configured AWS Region, account, and ECS task where possible.

The ECS read-only permissions let the connector discover and identify ECS clusters, services, task definitions, tasks, and containers. These permissions are required when connecting to ECS targets.

If the connector needs access to multiple ECS tasks, add the required task resources or broaden the resource scope as appropriate for your environment. Avoid using unrestricted wildcards unless the connector needs access across multiple Regions, accounts, or ECS resources.

## Create an AWS ECS PAM service

To create a Tailscale PAM services for the ECS workload:

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select **Secure Shell - AWS ECS via AWS SSM**.

5. Select **Continue**.

6. Enter a name for the service.

7. (Optional) Enter a description.

8. Choose whether to enable session recording.

9. From **Connect via**, select one or more Tailscale PAM connectors.

   The connector doesn't need SSH network connectivity to the ECS container, but it does need access to the AWS APIs required to establish the Systems Manager session.

10. Select **Continue**.

11. For **ECS cluster name**, enter the name of the ECS cluster that the task runs in.

12. For **ECS cluster name**, enter the name of the ECS service to connect to.

13. For **AWS region**, select the AWS Region where the instance is running.

14. For **AWS authentication strategy**, choose how the connector authenticates to AWS.

    #### Default credentials provider chain

    Select **Default credentials provider chain** to use AWS credentials already available to the connector through the standard AWS credential provider chain.

    This is the preferred option when the connector runs with an IAM role, such as an IAM role attached to an EC2 instance.

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

15. Select **Save**.

Your SSH PAM service that uses AWS Systems Manager to provide access to the ECS container has been created. You can access it in the [Services](https://console.tailscale.com/admin/services) page.

## Grant access to the ECS service

Before users connect, make sure a Tailscale PAM [grant][docs-grants] gives them access to the service.

Because the service is presented to users as an SSH service, you can use the SSH permissions in a Tailscale PAM grant to control the capabilities available during the session.

For example, the following broad grant permits interactive shell sessions and SSH exec requests:

```json
"grants": [
  {
    "src": ["*"],
    "dst": ["*"],
    "ip": ["*"],
    "app": {
      "tailscale.com/cap/pam": [
        {
          "version": "v1",
          "permissions": {
            "ssh": {
              "shell": {},
              "exec": {}
            }
          }
        }
      ]
    }
  }
]
```

> **Warning:**
>
> This is a broad grant that's useful for getting started. In a production environment, restrict the `src` and `dst` fields to control who can access specific ECS services.

Tailscale PAM grants can independently control SSH capabilities such as interactive shell access and command execution.

Because the upstream session uses AWS Systems Manager, users don't need an upstream SSH username, password, or private key.

For more SSH grant examples and information about fine-grained SSH access controls, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

## Connect to the ECS container

The primary way to connect is through the Tailscale client, which can launch your preferred SSH client. You can also connect entirely from your browser using the Tailscale browser client.

### Connect with your preferred SSH client

Use the Tailscale client to quickly open the SSH service with a compatible SSH client already installed on your device.

1. Open the Tailscale client.
2. Open **Services**.
3. Select your ECS service.
4. Choose the SSH client you want to use.

The Tailscale client scans your device for well-known SSH clients and shows the ones it can find. Selecting one establishes the PAM session and launches that client for you.

You aren't limited to the SSH clients shown in the Tailscale client. If your preferred client isn't listed, open it directly and use the PAM service name as the hostname.

If the service has a fixed SSH username configured, you can connect with:

```shell
ssh your-service-name
```

Tailscale PAM uses your Tailscale identity to authorize the connection. The connector then establishes the upstream session to the ECS container using its AWS identity and AWS Systems Manager.

You don't need an SSH key, password, or AWS credentials for the ECS workload.

### Connect from the browser

Alternatively, you can connect entirely from your browser using the Tailscale SSH browser client.

1. Open [Services](https://console.tailscale.com/admin/services) of the Tailscale admin console.
2. Select the ECS service you want to access.
3. Select **Connect**, and the Tailscale SSH browser client opens.
4. If prompted, authenticate with your Tailscale identity.

You can now use an interactive SSH session on the ECS instance directly from your browser.

The browser client runs a Tailscale client in the browser using WebAssembly (Wasm) and appears as a new [ephemeral][docs-ephemeral-nodes] device in your tailnet. If [device approval][docs-device-approval] is enabled for the tailnet, an admin must approve the browser device before it can connect.

## Review SSH sessions

Tailscale PAM gives you visibility into connections to your ECS service.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, then select a session for your ECS service. You can review information such as:

* The Tailscale identity that connected.
* The originating device.
* The connection time.
* The service that was accessed.

When session recording is enabled, you can also review the recorded session.

This gives you a direct answer to two useful questions: who accessed the container, and what did they do while they were connected?

AWS also provides its own auditing for ECS Exec activity through AWS CloudTrail, and ECS Exec can be configured to send command output to CloudWatch Logs or Amazon S3.

## Troubleshooting

If you can't connect to the ECS container, first verify that the Tailscale PAM connector is online.

Next, make sure ECS Exec is available for the target task.

Verify that:

* ECS Exec is enabled for the task.
* The task is currently running.
* The configured AWS Region is correct.
* The cluster, task, and container information identify the workload you want to access.
* The task IAM role has the required `ssmmessages` permissions.
* The AWS identity used by the PAM connector has the required Systems Manager and ECS permissions.
* The task can communicate with the Systems Manager Session Manager service.

If ECS Exec was enabled after the task was started, start a new task. AWS doesn't support enabling ECS Exec on an existing running task.

If you're using an AWS profile or static credentials, verify that the credentials are valid and have the required permissions.

A useful troubleshooting step is to confirm that you can open an ECS Exec session to the same task and container using the AWS identity available to the connector. AWS also provides an ECS Exec Checker for validating whether a cluster and task satisfy the ECS Exec prerequisites.

If none of the troubleshooting steps mentioned above resolve your issue, review the connector logs and the details for the failed session in the Tailscale PAM [session logs][docs-pam-session-logs]. These can help narrow down whether the problem is the AWS credentials, IAM permissions, ECS Exec configuration, Systems Manager connectivity, or the ECS task itself.

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
