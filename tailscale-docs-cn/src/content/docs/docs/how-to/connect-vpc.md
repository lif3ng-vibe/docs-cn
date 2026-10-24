---
title: "Access your virtual private cloud (VPC)"
description: "Access your virtual private cloud (VPC) and configure a subnet router using Tailscale."
---

Last validated Jan 5, 2026

> **Note:**
>
> This topic is a quick guide for setting up a Linux [subnet router][docs-subnets] to access your virtual private cloud (VPC). You can also set up a subnet router on [Windows][docs-subnets-config-windows] or [macOS][docs-subnets-config-macos]. For more information, refer to [Connect to an AWS VPC using subnet routes][docs-install-aws].

## Prerequisites

* You need a [Tailscale account][docs-install].
* You need a Linux VM. The following topics provide details for setting up a Linux VM using common cloud providers:
  * [Create a Linux VM on Azure][xt-azure-vm].
  * [Create a Linux VM on AWS][xt-aws-ec2-get-started].
  * [Create a Linux VM on GCP][xt-google-linux-vm-create].
* You need [Tailscale installed on your Linux VM][docs-install-linux].
* You need [Tailscale installed on your local machine][co-download].

## Create a Tailscale subnet router

1. Start by jotting down the IP address of the private resources you want to access and determine the Classless Inter-Domain Routing (CIDR) notation that represents the subnet boundaries for those resources.
   For example, if you have a VM at `10.0.0.3` and another at `10.0.1.4`, you might consider using CIDR notations `10.0.0.0/24` and `10.0.1.0/24` to represent these subnets

   Cloud providers may also provide CIDR address spaces for your VPCs which you can just use out of the box. For example, here is a screenshot for AWS:

   *（图：The AWS VPC page listing available VPCs. Highlighting an IPv4 CIDR range.）*

   This is a screenshot for Azure:

   *（图：The Azure virtual network page with the details for a virtual network. Highlighting the IPv4 CIDR range.）*

2. Start by accessing your VM to start configuring your subnet router.

   > **Note:**
   >
   > This will most likely be the cloud-provided SSH mechanism and may require you to **temporarily** open up port `22` on that VM to your corporate network or the internet.

3. In a terminal window, run the following command to check if you have `sysctl.d` on your system:

   ```shell
   ls /etc | grep sysctl.d
   ```

4. If the command returns an output, it means `sysctl.d` is on your system, so you can run the following commands to set up IP forwarding on your router:

   \[Missing snippet: EnableIPForwarding.mdx]

5. If you have firewalld installed on your VM instance, you should also allow masquerading for your subnet router to work:

   ```shell
   firewall-cmd --permanent --add-masquerade
   ```

   If this command return an error that means you do not have `firewalld` installed and can skip to the next step.

6. Finally, run the [`tailscale set`][docs-cli-set] command to start advertising routes to your subnet (the routes you recorded in step 1):

   ```shell
   sudo tailscale set --advertise-routes=<subnet range 1>,<subnet range 2>,...
   ```

   Running this step will cause the VM to authenticate with Tailscale. You will be asked to login with your credentials and add the device to your tailnet. Here's an example of running the command with the subnet ranges we used in step 1:

   ```shell
   sudo tailscale set --advertise-routes=10.0.0.0/24,10.0.1.0/24
   ```

7. Open the [Access controls](https://console.tailscale.com/admin/acls) page of the Tailscale admin console and add the following lines to your tailnet policy file to allow connectivity through your subnet:

   ```json
   "grants": [
     {
       "src": ["john.doe@example.com"],
       "dst": ["<subnet-range-1>/24", "<subnet-range-2>/24"],
       "ip": ["*"]
     }
   ]
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

   This lets the designated subnets be reachable by you and to the ports that you designate in the rule. Here's an example of a rule based on subnets in step 1 which grants access to all ports in the subnet range to the user `john.doe@example.com`:

   ```json
   "grants": [
     {
       "src": ["john.doe@example.com"],
       "dst": ["10.0.0.0/24", "10.0.1.0/24"],
       "ip": ["*"]
     }
   ]
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

8. If you are using a Linux-based local machine (not your subnet router) to connect, you need to run the [`tailscale set`][docs-cli-set] command to accept the advertised routes. If you are not using a Linux-based local machine, you can skip this step.

   ```shell
   sudo tailscale set --accept-routes
   ```

## Use the subnet router

1. From step 1 in [Create a Tailscale subnet router][ar-create-a-tailscale-subnet-router], find the private IP addresses for the resources or machine that you are trying to reach.
2. On your local machine, in a terminal window, ping those private IPs.

   ```shell
   ping <your private vm ip address>

   ```

   Responses from them indicate that your subnet router is working as expected.

   For example, using private IPs in step 1:

   ```shell
   ping 10.0.0.3 -t 4
   ```

   If successful, a response from these private IP addresses displays similar to:

   ```shell
   PING 10.0.0.3 (10.0.0.3): 56 data bytes
   64 bytes from 10.0.0.3: icmp_seq=0 ttl=64 time=0.112 ms
   64 bytes from 10.0.0.3: icmp_seq=1 ttl=64 time=0.088 ms
   64 bytes from 10.0.0.3: icmp_seq=2 ttl=64 time=0.175 ms
   64 bytes from 10.0.0.3: icmp_seq=3 ttl=64 time=0.145 ms
   ```

[ar-create-a-tailscale-subnet-router]: #create-a-tailscale-subnet-router

[co-download]: https://tailscale.com/download

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-install-aws]: /docs/install/cloud/aws

[docs-install-linux]: /docs/install/linux

[docs-install]: /docs/how-to/quickstart

[docs-subnets]: /docs/features/subnet-routers

[docs-subnets-config-windows]: /docs/features/subnet-routers?tab=windows#connect-to-tailscale-as-a-subnet-router

[docs-subnets-config-macos]: /docs/features/subnet-routers?tab=macos#connect-to-tailscale-as-a-subnet-router

[xt-aws-ec2-get-started]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html

[xt-azure-vm]: https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu

[xt-google-linux-vm-create]: https://cloud.google.com/compute/docs/create-linux-vm-instance
