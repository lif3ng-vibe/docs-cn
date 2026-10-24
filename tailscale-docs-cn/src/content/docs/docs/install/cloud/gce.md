---
title: "Access Google Compute Engine VMs privately using Tailscale"
description: "Google Cloud provides Linux virtual machines and you can use Tailscale to provide secure connectivity."
---

Last validated Dec 4, 2025

Google Cloud provides Linux virtual machines and you can use Tailscale to provide secure connectivity.

## Prerequisites

Before you begin this guide, you'll need a Tailscale network (known as a tailnet) set up and configured with at least one existing device. Read our [getting started guide][docs-install] if you need help with this.

## Step 1: Set up the Tailscale client for the VM

First, [create a Virtual Machine in the GCE Console][xt-google-vm-create-start].

When creating the instance select **Management, security, disks, networking, sole tenancy**, select **Networking**, and select the **Network Interface**. Because we're later going to enable subnet routing on this VM, we want to set **IP forwarding** to **On**.

*（图：The Network Interface configurations featuring the IP forwarding setting.）*

Once you create the VM, SSH to the system and follow the steps to [install Tailscale on Linux][docs-install-linux].

## Step 2: Allow UDP port 41641

If at least one side of a tunnel has "easy NAT," where Tailscale can determine the UDP port number on the far side of the NAT device, then it will make [direct connections to minimize latency.][bl-how-tailscale-works]. We ensure that GCE nodes can make direct connections by allowing UDP port `41641` to ingress through the firewall.

In **VPC Network** > **Firewall** we add two rules:

1. An ingress rule to allow `0.0.0.0/0` for UDP port `41641` to all instances.
2. An ingress rule to allow `::/0` for UDP port `41641` to all instances.

*（图：The firewall rule for an example project featuring Direction of traffic set to Ingress and Protocols and ports set to 41641.）*

## Step 3: Advertise routes from the VM

To enable connections from your tailnet to the GCP subnet, configure the VM to act as a [subnet router][docs-subnets].

First, enable IP forwarding on the VM.

\[Missing snippet: EnableIPForwarding.mdx]

After enabling IP forwarding, configure the VM to advertise routes for the subnet it sits on. For example, if the subnet address range is `10.182.0.0/24`, the command would be:

```shell
tailscale set --advertise-routes=10.182.0.0/24 --accept-dns=false
```

> **Note:**
>
> For GCE VMs it is generally best to let Google handle the DNS configuration, not have Tailscale override it, so we added `--accept-dns=false`.

## Step 4: Add GCE DNS for your tailnet

For the benefit of the *other* nodes in the tailnet we'll set up [split DNS][docs-dns-using-settings] to allow use of the same DNS names as the ones that are inside of GCE.

The hostnames inside of GCE are of the form:

```shell
<vm-name>.<gce-project-name>.internal
```

Use the Google Cloud CLI command [`gcloud dns policies create`][xt-google-dns-policies-create] to create a new [Cloud DNS][xt-google-cloud-dns] policy that lets inbound forwarding for your tailnet:

```shell
gcloud dns policies create inbound-dns \
  --project="YOUR_VPC_PROJECT" \
  --description="Expose DNS endpoints per subnet" \
  --networks="YOUR_VPC" \
  --enable-inbound-forwarding
```

where:

* `YOUR_VPC_PROJECT` is your Google Cloud [project ID][xt-google-reference-project].
* `YOUR_VPC` is the comma separated list of network names to associate with the policy.

Use the [`gcloud compute addresses list`][xt-google-compute-address-list] to verify that your tailnet recognizes the DNS resolver for your tailnet subnet:

```shell
gcloud compute addresses list \
  --project="YOUR_VPC_PROJECT" \
  --filter='purpose="DNS_RESOLVER"' \
  --format='csv(address, region, subnetwork)' \
  | grep YOUR_TAILNET_SUBNET
```

where:

* `YOUR_VPC_PROJECT` is your Google Cloud [project ID][xt-google-reference-project].
* `YOUR_TAILNET_SUBNET` is your subnet machine name.

Use the IP address returned from this command as a DNS resolver for your tailnet:

1. Open the [DNS](https://console.tailscale.com/admin/dns) page in the admin console.
2. Select **Add name server**.
3. Select **Custom**.
4. For **Nameserver**, enter the IP address from the `gcloud compute addresses list` command that you ran above. In this example, we use `10.243.117.59`.
5. Ensure **Restrict to search domain** is checked.
6. For **Search Domain**, enter **internal**.
7. Select **Save**.

   *（图：The Add nameserver configuration with an IP address and Search Domain set to internal.）*

Now the same hostnames which work between nodes running within GCE will also be available to all nodes in your tailnet.

## Step 5: Remove public SSH access

As we can now SSH to the system over the private Tailscale network, there is no reason to leave the SSH port open on a public IP address. You can delete the `default-allow-ssh` rule from **VPC network** > **Firewall**.

*（图：The firewall rule details for an example project highlighting a the Delete command in the top right.）*

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[docs-dns-using-settings]: /docs/reference/dns-in-tailscale#tailscale-dns-settings

[docs-install-linux]: /docs/install/linux

[docs-install]: /docs/how-to/quickstart

[docs-subnets]: /docs/features/subnet-routers

[xt-google-cloud-dns]: https://cloud.google.com/dns

[xt-google-compute-address-list]: https://cloud.google.com/sdk/gcloud/reference/compute/addresses/list

[xt-google-dns-policies-create]: https://cloud.google.com/sdk/gcloud/reference/dns/policies/create

[xt-google-reference-project]: https://cloud.google.com/sdk/gcloud/reference#--project

[xt-google-vm-create-start]: https://cloud.google.com/compute/docs/instances/create-start-instance
