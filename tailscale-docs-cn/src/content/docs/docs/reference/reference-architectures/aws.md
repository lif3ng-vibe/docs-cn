---
title: "AWS reference architecture"
description: "This document details best practices and a reference architecture for Tailscale deployments on Amazon Web Services (AWS). The following guidance applies for all Tailscale modes of operation—devices, e"
---

Last validated Oct 7, 2026

This document details best practices and a reference architecture for Tailscale deployments on Amazon Web Services (AWS). The following guidance applies for all Tailscale modes of operation—devices, exit nodes, subnet routers, and the like.

> **Note:**
>
> For the purposes of this document, **Tailscale device** can refer to a Tailscale node, exit node, subnet router, and the like. Refer to [Terminology and concepts][docs-terminology-and-concepts] for additional terms.

## High-level architecture

*（图：Potential deployments of Tailscale to access AWS resources）*

## Ways to deploy Tailscale to connect to and from AWS resources

Tailscale provides a few options for connecting to resources within AWS. At a high-level they are:

* **[Agent-to-Agent connectivity][ar-agent-to-agent-connectivity]**—connect to "static" resources such as Amazon Elastic Compute Cloud (EC2) instances. This is recommended where you can install and run Tailscale directly on the resource you wish to connect to.
* **[IP-based connectivity with a Tailscale subnet router][ar-subnet-router-ip-connect]**—connect to managed AWS resources such as Amazon's Relational Database Service (AWS RDS) or Amazon Redshift. This is recommended where you cannot run Tailscale on the resource you are connecting to, or want to expose an existing [subnet][docs-subnets] or services in a VPC to your tailnet.
* **[DNS-based routing with a Tailscale app connector][ar-dns-routing-with-app-connector]**—connect to software as a service (SaaS) applications or other resources over your tailnet with DNS-based routing.
* **[Kubernetes services and auth proxy with the Tailscale Kubernetes Operator][ar-services-and-api-proxy]**—expose services in your Amazon Elastic Kubernetes Service (EKS) cluster and your EKS cluster control plane directly to your Tailscale network. This is recommended where you are connecting to resources running in a Kubernetes cluster, or to a Kubernetes cluster's control plane.
* **[Lambda and other container services][ar-lambda-and-other-container-services]**—access resources in your tailnet from Lambda functions and other container solutions.

### Agent-to-agent connectivity

We recommend [installing the Tailscale agent][docs-installation] wherever possible—for example, [setting up servers][docs-set-up-servers] on EC2 instances. This generally provides the best and most scalable connectivity while enabling Tailscale agent-based functionality such as Tailscale SSH.

### IP-based connectivity with subnet router

For managed resources where you cannot install the Tailscale agent, such as AWS RDS, Amazon Redshift, and similar services, you can run a [subnet router][docs-subnets] within your VPC to access these resources from Tailscale. Subnet routers can also be used to connect to resources by using AWS PrivateLink and VPC endpoints.

Refer to [Access AWS RDS privately using Tailscale][docs-aws-rds] for a general guide.

### DNS-based routing with an app connector

[App connectors][docs-app-connectors] proxy DNS queries for configured domains and advertise routes for the returned IP addresses. For applications that use IP allowlists, add the app connectors' egress IP addresses to the allowlist. Client traffic then reaches the applications from an allowed address.

### Kubernetes services and API server proxy with Tailscale Kubernetes Operator

The [Tailscale Kubernetes Operator][docs-kubernetes-operator] lets you expose services in your Kubernetes cluster to your Tailscale network, and use an API server proxy for secure connectivity to the Kubernetes control plane.

### Lambda and other container services

Tailscale supports [userspace networking][docs-userspace-networking] where processes in the container can connect to other resources on your Tailscale network by using a SOCKS5 or HTTP proxy. This lets [AWS Lambda][docs-aws-lambda], [AWS App Runner][docs-aws-app-runner], [AWS Lightsail][docs-aws-lightsail] and other container-based solutions connect to the Tailscale network with minimal configuration needed.

## Production best practices

Below are general recommendations and best practices for running Tailscale in production environments. Much of what is listed below is explained in greater detail throughout this document:

* When possible deploy [subnet routers][docs-subnets], [exit nodes][docs-exit-nodes], [app connectors][docs-app-connectors], and the like, to public subnets with public IP addresses to ensure [direct connections][docs-connection-types] and optimal performance.
* Run subnet routers, exit nodes, app connectors, and the like, separately from the systems you are administering with Tailscale—for example, run your subnet routers outside of your Amazon EKS clusters.
* Deploy dynamically scaled resources (for example, containers or serverless functions) as [ephemeral nodes][docs-ephemeral-nodes] to automatically clean up devices after they shut down.

### High availability and route selection

* Run multiple [subnet routers][docs-subnets] and [app connectors][docs-app-connectors] across AWS availability zones for [high availability][docs-high-availability]. For deployments across regions, compare the [route selection options][docs-route-selection].
* Run multiple Tailscale SSH session recorder nodes across AWS availability zones for [recorder node failover][docs-multiple-recorder-nodes].

## Performance best practices

For general recommendations, refer to [Performance best practices][docs-performance-best-practices].

### In-region load balancing

With regional routing, deploy overlapping subnet routers or app connectors in the same [DERP][docs-derp-servers] region for [in-region load balancing][docs-high-availability-region-load-balancing] and redundancy. Tailscale distributes clients on a best-effort basis.

### Recommended instance sizing

When choosing an EC2 instance size, consider whether the device will function as a normal device, or a device running as a subnet router, exit node, or app connector.

#### Normal usage

When installing Tailscale on an EC2 instance as a "normal" Tailscale device (for example, not a subnet router or exit node), you likely have already sized that instance to a suitable instance type for its workload and running Tailscale on it will likely add negligible resource usage.

#### Subnet routers, exit nodes, and app connectors

There are many variables that affect performance and workloads vary widely so we do not have specific size recommendations, but we do have general guidance for selecting an instance type for an EC2 instance running as a [subnet router][docs-subnets], [exit node][docs-exit-nodes], or [app connector][docs-app-connectors]:

* In general, higher CPU clock speed is more important than more cores.
* In general, instances with ARM-based AWS Graviton processors are quite cost effective for packet forwarding
* Use a non-burstable instance type to achieve consistent virtual CPU (vCPU) and network performance.
  * Per the AWS [Burstable performance instances][xt-aws-ec2-cpu-burst] topic, burstable performance instances (such as `T4g`, `T3a`, `T2`, and the like) use a CPU credit mechanism which can result in poor performance with more than a single concurrent connection. Therefore, they should only be used for testing. The `m8g.medium` instance is a good place to start for production routers.
* Use an instance type with greater than 16 vCPUs. For example, use at least 24 vCPUs to ensure consistent network performance.
  * Per the AWS [Amazon EC2 instance network bandwidth][xt-aws-network-bandwidth] topic, instances with 16 vCPUs or less use a network I/O credit mechanism to burst beyond baseline bandwidth. This provides a marginal performance increase except for very high-load resources.
* In certain workloads that are sensitive to throughput, and that require several concurrent high-speed connections, you may realize better network performance by choosing a subnet router instance with dedicated network capacity, which is limited to those with more than 16 vCPUs. We recommend discussing your requirements with our solutions team if you feel this applies to you.

## Using Tailscale with AWS

Depending on how you are using AWS and Tailscale, there are considerations for your security groups and subnets.

### Security groups

Tailscale uses various [NAT traversal techniques][bl-how-nat-traversal-works] to safely connect to other Tailscale nodes without manual intervention. Usually, you do not need to open any [firewall ports][docs-firewalls] for Tailscale. However, if your VPC and security groups are overly restrictive about internet-bound egress traffic, refer to [What firewall ports should I open to use Tailscale?][docs-firewall-ports]

### Public vs private subnets

Tailscale devices deployed to a public subnet with a public IP address will benefit from [direct connections][docs-connection-types] between nodes for the best performance.

#### AWS NAT Gateway

Tailscale uses both [direct and relayed connections][docs-connection-types], opting for direct connections where possible. AWS NAT Gateway is a [Hard NAT][docs-device-connectivity-hard-nat] and will prevent direct connections causing connections to use [DERP relay servers][docs-derp-servers]. This can lead to lower throughput and performance than direct connections.

Tailscale [Peer Relays][docs-peer-relays] let you use devices in your tailnet as high-throughput relay servers when direct connections aren't possible due to network conditions such as being in a private subnet behind an AWS NAT Gateway. To bypass AWS NAT Gateway, follow the steps to deploy and [configure a peer relay][docs-peer-relays-get-started] to a public subnet in your VPC, with a public IP address, and allow incoming UDP traffic to the relay port.

#### Egress-only internet gateway

An egress-only IPv6 gateway attached to a private subnet will allow direct connections to peers that have IPv6 addresses. Nodes which only have IPv4 available will be reachable by [DERP relay][docs-connection-types] which have both IPv4 and IPv6 connections.

### VPC DNS resolution

Private hosted zones and private addresses for AWS resources can only be resolved using private Route 53 Resolvers. The private Route 53 Resolvers can be accessed through a subnet router. To enable this:

1. [Deploy a subnet router][docs-subnets-set-up-a-subnet-router] to your VPC.
2. Enable access to the private Route 53 Resolver by configuring [access controls][docs-access-control] to allow TCP and UDP access on port `53` to the VPC+2 IP address of your VPC. For example, if your VPC's CIDR is `10.0.96.0/20`, your VPC+2 IP address is `10.0.96.2`.
3. Forward queries for internal AWS domains to the [Amazon Route 53 Resolver][xt-aws-r53-resolver] by configuring [split DNS][docs-aws-rds-add-aws-dns] to the VPC+2 IP address that is now reachable by your subnet router. If you have multiple VPCs, [associate additional VPCs with a private hosted zone][xt-aws-r53-vpc-associations] to enable DNS resolution across all of them.

### VPC peering and transit VPCs

[VPC peering][xt-aws-vpc-peering] and [transit VPCs][xt-aws-vpc-transit] are a common strategy for connecting multiple VPCs together. You can deploy a subnet router (or a set for high availability) within a VPC to allow access to multiple VPCs.

If you have VPCs or subnets with overlapping IPv4 addresses, use [4via6 subnet routers][docs-4via6-subnets] to access resources with unique IPv6 addresses for each overlapping subnet.

### Subnet routers

Consider where you run subnet routers relative to the AWS resources they provide access to.

#### Operating a subnet router within Amazon EKS or Amazon ECS

Oftentimes organizations are using Tailscale to connect to and administer their EKS clusters, Amazon Elastic Container Service (ECS) deployments, and the like. While Tailscale can [run within a container][docs-userspace-networking] and be deployed to EKS or ECS, we recommend running your [subnet routers][docs-subnets] externally to these clusters to ensure connectivity is available in the event your cluster is having issues. In other words, run your subnet router on dedicated EC2 instances or an EKS cluster separate from the cluster you're administering.

### Tailscale SSH session recording

Deploy [multiple session recorder instances][docs-multiple-recorder-nodes] across multiple availability zones to improve resiliency against zone failures. If your organization operates across multiple regions, consider deploying SSH session recording nodes in each region you operate and [configure SSH access rules][docs-tailscale-ssh-session-turn-on] to send recording information to the local region for your nodes.

#### S3 for recording persistence

Configure [Tailscale SSH session recording][docs-tailscale-ssh-session-recording] to persist recordings to an Amazon S3 bucket to reduce operational concerns such as available storage space, durability, [access controls][docs-access-control], and similar services.

##### Minimum-required IAM policy

[Create an IAM policy with the minimum-required permissions][docs-session-recording-s3-create-policy] to store and access (for the recorder web UI) recordings with an S3 bucket.

##### Storage bucket locations

If your organization operates across multiple AWS regions, consider deploying SSH session recording nodes in each region you operate and [configure SSH access rules][docs-tailscale-ssh-session-turn-on] to send recording information to the local region for your nodes.

##### Storage bucket policy

Given the sensitive nature of SSH session recordings, follow the [AWS security best practices for Amazon S3][xt-aws-s3-security].

##### Storage lifecycle rules

Configure [S3 lifecycle rules][xt-aws-s3-lifecycle] so that recording files transition to another storage class and/or expire and delete after a time period that meets your organization's requirements.

## Limitations

These AWS networking constraints can affect Tailscale connectivity and performance.

### AWS NAT Gateway

AWS NAT Gateway is a [hard NAT][ar-aws-nat-gateway]. All devices and services behind an AWS NAT Gateway will connect using [DERP relay servers][docs-derp-servers]. For best performance, put devices in a [public subnet][ar-public-vs-private-subnets] to facilitate direct connections.

### AWS single-flow bandwidth limitation

\[Missing snippet: aws\_single\_flow\_bandwidth\_limitation.mdx]

[ar-agent-to-agent-connectivity]: #agent-to-agent-connectivity

[ar-aws-nat-gateway]: #aws-nat-gateway

[ar-dns-routing-with-app-connector]: #dns-based-routing-with-an-app-connector

[ar-lambda-and-other-container-services]: #lambda-and-other-container-services

[ar-public-vs-private-subnets]: #public-vs-private-subnets

[ar-services-and-api-proxy]: #kubernetes-services-and-api-server-proxy-with-tailscale-kubernetes-operator

[ar-subnet-router-ip-connect]: #ip-based-connectivity-with-subnet-router

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-4via6-subnets]: /docs/features/subnet-routers/4via6-subnets

[docs-access-control]: /docs/features/access-control

[docs-app-connectors]: /docs/features/app-connectors

[docs-aws-app-runner]: /docs/install/cloud/aws/aws-app-runner

[docs-aws-lambda]: /docs/install/cloud/aws/aws-lambda

[docs-aws-lightsail]: /docs/install/cloud/aws/aws-lightsail

[docs-aws-rds-add-aws-dns]: /docs/install/cloud/aws/aws-rds#step-3-add-aws-dns-for-your-tailnet

[docs-aws-rds]: /docs/install/cloud/aws/aws-rds

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-connectivity-hard-nat]: /docs/reference/device-connectivity#hard-nat

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-firewalls]: /docs/integrations/firewalls

[docs-high-availability-region-load-balancing]: /docs/features/route-selection#regional-routing

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-installation]: /docs/install

[docs-kubernetes-operator]: /docs/kubernetes-operator

[docs-multiple-recorder-nodes]: /docs/reference/multiple-recorder-nodes

[docs-peer-relays-get-started]: /docs/features/peer-relay#get-started

[docs-peer-relays]: /docs/features/peer-relay

[docs-performance-best-practices]: /docs/reference/best-practices/performance

[docs-route-selection]: /docs/features/route-selection

[docs-session-recording-s3-create-policy]: /docs/features/tailscale-ssh/how-to/session-recording-s3#configure-s3-as-storage-for-session-recording-nodes

[docs-set-up-servers]: /docs/how-to/set-up-servers

[docs-subnets-set-up-a-subnet-router]: /docs/features/subnet-routers#set-up-a-subnet-router

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ssh-session-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-tailscale-ssh-session-turn-on]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording#turn-on-session-recording-in-your-tailnet-policy-file

[docs-terminology-and-concepts]: /docs/reference/glossary

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-aws-ec2-cpu-burst]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-performance-instances.html

[xt-aws-network-bandwidth]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-network-bandwidth.html

[xt-aws-r53-resolver]: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver.html

[xt-aws-r53-vpc-associations]: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/hosted-zone-private-associate-vpcs.html

[xt-aws-s3-lifecycle]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html

[xt-aws-s3-security]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html

[xt-aws-vpc-peering]: https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html

[xt-aws-vpc-transit]: https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/transit-vpc-option.html
