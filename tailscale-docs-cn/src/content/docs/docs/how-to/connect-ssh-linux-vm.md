---
title: "SSH into a Linux VM"
description: "Use Tailscale SSH to connect securely to a Linux VM."
---

Last validated Dec 8, 2025

This topic provides details about making an SSH session to a Linux VM on your Tailscale network (known as a tailnet).

## Prerequisites

* You need a [Tailscale account][docs-install]
* You need a Linux VM. The following topics provide details for setting up a Linux VM using common cloud providers:
  * [Create a Linux VM on Azure][xt-entra-vm]
  * [Create a Linux VM on AWS][xt-aws-ec2-get-started]
  * [Create a Linux VM on GCP][xt-google-linux-vm-create]
* You need [Tailscale installed on your Linux VM][docs-install-linux]
* You need [Tailscale installed on your local machine][co-download]

## Configure Tailscale SSH

1. Start by accessing your VM to install Tailscale.

   > **Note:**
   >
   > This will most likely be the cloud-provided SSH mechanism and may require you to **temporarily** open up port `22` on that VM to your corporate network or the internet.

2. In a terminal window on the VM, run the [`tailscale set`][docs-tailscale-up] command to advertise SSH for that VM:

   ```shell
   tailscale set --ssh
   ```

3. Open the [Access controls](https://console.tailscale.com/admin/acls) page of the Tailscale admin console and add the following lines to your tailnet policy file to allow network connectivity to the VM:

   ```json
   "grants": [
     {
       "src": ["<your tailscale username>"],
       "dst": ["<your vm's tailscale ip address>"],
       "ip": ["22"]
     }
   ]
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

   You can find your VM's Tailscale IP address on the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, and you can find your Tailscale username on the [Users](https://console.tailscale.com/admin/users) page. You don't need to replace existing access control policies if you have any, just add this new rule. Here's an example:

   ```json
   "grants": [
     {
       "src": ["john.doe@domain.com"],
       "dst": ["100.64.65.66"],
       "ip": ["22"]
     }
   ]
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

4. In the same tab, add the following rules to the SSH section of your tailnet policy file to allow SSH access to the VM:

   ```json
   "ssh": [
     { "action": "accept",
       "src": ["your tailscale username"],
       "dst": ["autogroup:self"],
       "users": ["root","autogroup:nonroot", "<your-local-username>"]
     }
   ],
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

5. If you have a local username (such as `local-user`) defined on the VM, you should add it to the `users` array in the `ssh` section. You don't need to replace existing SSH policies if you have any, just add this new rule. Here's an example:

   ```json
   "ssh": [
     { "action": "accept",
       "src": ["john.doe@example.com"],
       "dst": ["autogroup:self"],
       "users": ["root","autogroup:nonroot", "local-user"]
     }
   ],
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

## Use Tailscale SSH

1. In a terminal window on your local machine, SSH to your VM:

   ```shell
   ssh <your-vm-ip-address>
   ```

2. If you need to use your local account just reference it before the IP address (`user@IP`) when running the SSH command. You can also use the [MagicDNS][docs-magicdns] hostname of the machine. For example:

   ```shell
   ssh local-user@100.64.65.66
   ```

3. If you haven't already, you can close the SSH port on your cloud VM and re-run the Tailscale SSH command to verify it is working.

> **Note:**
>
> We strongly recommend that you do not keep the SSH port exposed for prolonged periods of time especially to the internet. If you need to open this port for this test, after you are done testing, make sure you close the port or delete your test VM.

[co-download]: https://tailscale.com/download

[docs-install-linux]: /docs/install/linux

[docs-install]: /docs/how-to/quickstart

[docs-magicdns]: /docs/features/magicdns

[docs-tailscale-up]: /docs/reference/tailscale-cli/up

[xt-aws-ec2-get-started]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html

[xt-entra-vm]: https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu

[xt-google-linux-vm-create]: https://cloud.google.com/compute/docs/create-linux-vm-instance
