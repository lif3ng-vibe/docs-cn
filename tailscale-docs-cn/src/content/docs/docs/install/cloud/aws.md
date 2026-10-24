---
title: "Connect to an AWS VPC using subnet routes"
description: "This guide describes steps to deploy a [Tailscale subnet router][docs-subnets] to an [Amazon Virtual Private Cloud (Amazon VPC)][xt-aws-vpc] to enable direct access to [Amazon Elastic Compute Cloud (A"
---

Last validated Dec 4, 2025

## Overview

This guide describes steps to deploy a [Tailscale subnet router][docs-subnets] to an [Amazon Virtual Private Cloud (Amazon VPC)][xt-aws-vpc] to enable direct access to [Amazon Elastic Compute Cloud (Amazon EC2)][xt-aws-ec2] instances running Tailscale. The subnet router enables access to additional Amazon EC2 instances in the Amazon VPC. The deployment takes approximately 15 minutes and is supported in all AWS regions.

In the steps below, we'll set up a fresh Amazon VPC with Amazon Managed
NAT Gateway, then configure a Tailscale relay to offer secure access to that
Amazon VPC. We'll create a new Amazon VPC from scratch, but once you're comfortable, you
can adapt these instructions to set up Tailscale on an existing Amazon VPC.

The steps in this guide deploy a single subnet router to a single availability zone. Multiple subnet routers can be deployed across multiple availability zones and configured to advertise the same routes to achieve [high availability failover][docs-high-availability].

## Prerequisites

### Technical requirements

Tailscale works seamlessly with [Linux][docs-install-linux], [Windows][docs-install-windows], [macOS][docs-install-linux], and more. No database is required and the only storage needed is for the Tailscale node key and node state. You can [configure where node state is stored][docs-tailscaled-flags-to-tailscaled].

### Specialized knowledge

This guide assumes familiarity with Amazon VPC, Amazon EC2, Linux, and SSH.

### Tailscale account

If you don't already have a Tailscale account, create one at [`https://login.tailscale.com/start/`](https://login.tailscale.com/start).

### AWS account

If you don't already have an AWS account, create one at [`https://aws.amazon.com`][xt-aws].

## Architecture

*（图：Amazon VPC with Tailscale subnet router）*

As shown in the diagram above, the deployment steps set up the following:

* An Amazon VPC with public and private subnets, configured with the Amazon VPC Wizard
* In a public subnet, an Amazon EC2 instance running Tailscale as a subnet router
* In a private subnet, an Amazon EC2 instance

All devices in a tailnet maintain a connection with the [Tailscale coordination server][docs-terminology-and-concepts-coordination-server] to exchange metadata such as encryption keys, network topology changes, and access policy changes. The coordination server is part of the control plane only, not the data plane—it is not responsible for relaying traffic between devices.

## Costs and licenses

You will be billed for any AWS services or resources deployed in the steps below. The estimated AWS costs are $100 USD per month.

Tailscale services or resources deployed in the steps below are available in all Tailscale plans, including Personal. For an overview of Tailscale's pricing plans, including paid plans, refer to [Pricing][co-pricing].

### AWS service limits

If necessary, request [service quota increases][xt-aws-console-quota-us-east2] for the following resources:

Resource
This deployment uses

VPCs
1

NAT Gateway
1

Security groups
2

EC2 Instances
2

## Security considerations

### EC2 key pairs

Make sure that at least one [Amazon EC2 key pair][xt-aws-ec2-keypair] exists in your AWS account in the region where you plan to deploy Tailscale. Make note of the key pair name to use in the deployment steps below. To create a key pair, refer to [Amazon EC2 key pairs and Linux instances][xt-aws-ec2-keypair]. This key will be used to connect to Amazon EC2 instances to install and configure Tailscale.

### IAM permissions

You must sign in to the AWS Management Console with IAM permissions to deploy the resources included in this guide. The `AdministratorAccess` managed policy within IAM provides sufficient permissions, although your organization may choose to use a custom policy with more restrictions. For more information, refer to [AWS managed policies for job functions][xt-aws-iam-access-policies].

## Deployment steps

### Step 1: Sign in to your AWS account

[Sign in to your AWS account][xt-aws-console] using an IAM user with the [necessary IAM permissions][ar-iam-permissions]. Do not use the AWS account root user for any deployment or operations.

### Step 2: Create a VPC

Use the [**VPC wizard**][xt-aws-console-vpc-create] to create a VPC:

1. Under **Resources to create** select **VPC and more**.
2. Under **Name tag auto-generation** give your VPC a descriptive name or leave the default value.
3. Under **NAT gateways** select **In 1 AZ**.
4. Select **Create VPC**

### Step 3: Create an EC2 instance for the Tailscale subnet router

Use the [**Launch an instance wizard**][xt-aws-ec2-launch] to create an Amazon EC2 instance:

1. Under **Application and OS Images** select **Amazon Linux** or another [supported Linux distribution][docs-install-linux].
2. Under **Instance type** select an instance type that meets your computing, memory, networking, or storage needs. A `t2.micro` or any [AWS Free Tier][xt-aws-free-tier]-eligible instance type will be sufficient for testing this deployment.
3. Under **Key pair (login)** select a key pair to use for SSH.
4. Under **Network settings** select the VPC you created above.
5. Assign the instance to a public subnet of the VPC, and enable **Auto-assign public IP**.
6. Create a security group and allow Inbound SSH. (We'll need
   this during initial setup, but you can turn it off later.)
7. Name the security group something distinctive, like `tailscale-subnet-router`.
8. Select **Launch instance**.

### Step 4: Enable IP forwarding

IP forwarding is required to use a Linux device as a subnet router. SSH into the EC2 instance and run the commands below.

\[Missing snippet: EnableIPForwarding.mdx]

### Step 5: Install Tailscale on your EC2 instance

SSH into the EC2 instance and install Tailscale by following [the installation instructions for your distro][docs-install-linux].

Once installed, enable the Tailscale systemd service and advertise the desired routes for your subnets:

```shell
sudo systemctl enable --now tailscaled
sudo tailscale set --advertise-routes=10.0.0.0/16
```

You will be prompted to authenticate the device to your Tailscale network by visiting a link in your browser. Once you're familiar with Tailscale concepts, we recommend using [pre-authentication keys][docs-auth-keys] ("auth keys" for short) to register new devices. This is most useful when provisioning devices using infrastructure-as-code systems like AWS CloudFormation.

> **Note:**
>
> `tailscale set --advertise-routes` requires IP forwarding to be enabled. If an error displays about IP forwarding, [follow these steps][docs-troubleshooting-error-with-advertised-routes].

### Step 6: Configure your Tailscale network

Visit the Tailscale [admin console](https://console.tailscale.com/admin) and perform the following actions:

1. [Disable key expiry][docs-key-expiry-disabling-key-expiry] on the subnet router so that you don't need to
   reauthenticate the server periodically.
2. Authorize subnet routes on the device, so that Tailscale
   distributes the `10.0.0.0/16` route to the rest
   of your Tailscale network.

### Step 7: Verify your connection

Check that you can ping the EC2 instance's Tailscale IP address from your
personal Tailscale device such as Windows and macOS. You can find the Tailscale IP
in the [admin console](https://console.tailscale.com/admin), or by running `tailscale ip -4` on
the EC2 instance.

### Step 8: Close off your firewall

Now that your EC2 instance is available over Tailscale you can disable the open port in your public-facing firewall.

1. In the [Security Groups panel of the Amazon EC2 console][xt-aws-ec2-security-groups] find and select the `tailscale-subnet-router` security group.
2. Select **Edit inbound rules** and delete the rule allowing SSH access.
3. Select **Save rules**.

### Step 9: Create another EC2 instance to relay to

Back in the [**Launch an instance wizard**][xt-aws-ec2-launch] create a second Amazon EC2 instance that we will connect to through the Tailscale subnet router:

1. Under **Application and OS Images** select **Amazon Linux** or another [supported Linux distribution][docs-install-linux].
2. Under **Instance type** select the same instance type as before.
3. Under **Key pair (login)** select a key pair to use for SSH.
4. Under **Network settings** select the VPC you created above.
5. Assign the instance to a private subnet of the VPC, and leave **Auto-assign public IP** set to **Disable**.
6. Create a security group and allow all traffic inbound from the `tailscale-subnet-router` security group.
7. Select **Launch instance**.

### Step 10: Verify your connection

SSH to your newly created private EC2 instance, using its private
IP. The SSH session will flow through your Tailscale subnet router
and into the private subnet.

### Customer responsibility

After deployment, confirm that your resources and services are updated and configured—including patching the firmware and operating system of those devices. For more information, refer to the [shared responsibility model][docs-shared-responsibility].

### Support

Tailscale offers multiple [support options][docs-support-options] with varying SLAs for response times. [Contact support][co-contact-support-form] if you have any issues related to Tailscale setup or configuration.

### Next steps

#### Server setup

If you're setting up servers on Tailscale, we recommend you [use an auth key to provision the server, and a tag][docs-set-up-servers] to restrict its access.

#### High availability

Multiple subnet routers can be deployed across multiple availability zones and configured to advertise the same routes to achieve [high availability failover][docs-high-availability].

#### 4via6 subnet routers

If your network has subnets with overlapping IPv4 addresses, you can use the [4via6 subnet routers][docs-4via6-subnets]
feature to ensure traffic from each node in your tailnet is routed to the correct device.

[ar-iam-permissions]: #iam-permissions

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[co-pricing]: https://tailscale.com/pricing

[docs-4via6-subnets]: /docs/features/subnet-routers/4via6-subnets

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-install-linux]: /docs/install/linux

[docs-install-windows]: /docs/install/windows

[docs-key-expiry-disabling-key-expiry]: /docs/features/access-control/key-expiry#disabling-key-expiry

[docs-set-up-servers]: /docs/how-to/set-up-servers

[docs-shared-responsibility]: /docs/concepts/shared-responsibility

[docs-subnets]: /docs/features/subnet-routers

[docs-support-options]: /docs/reference/support-options

[docs-tailscaled-flags-to-tailscaled]: /docs/reference/tailscaled#flags-to-tailscaled

[docs-terminology-and-concepts-coordination-server]: /docs/reference/glossary#coordination-server

[docs-troubleshooting-error-with-advertised-routes]: /docs/reference/troubleshooting/network-configuration/ip-forwarding-errors-advertise

[xt-aws-console-quota-us-east2]: https://console.aws.amazon.com/servicequotas/home?region=us-east-2#!

[xt-aws-console-vpc-create]: https://console.aws.amazon.com/vpc/home#CreateVpc:createMode=vpcWithResources

[xt-aws-console]: https://console.aws.amazon.com

[xt-aws-ec2-keypair]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html

[xt-aws-ec2-launch]: https://console.aws.amazon.com/ec2/home#LaunchInstances:

[xt-aws-ec2-security-groups]: https://console.aws.amazon.com/ec2/home#SecurityGroups:

[xt-aws-ec2]: https://docs.aws.amazon.com/ec2

[xt-aws-free-tier]: https://aws.amazon.com/free

[xt-aws-iam-access-policies]: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_job-functions.html

[xt-aws-vpc]: https://docs.aws.amazon.com/vpc/index.html

[xt-aws]: https://aws.amazon.com
