---
title: "Solutions"
description: "Explore how to use Tailscale in various scenarios through hands-on guides."
---

Last validated Jul 3, 2026

## VPN

[**Secure your internet traffic on public Wi-Fi using an Apple TV**](/docs/solutions/secure-traffic-public-wifi-appletv) — Route Tailscale traffic through your Apple TV for secure, private browsing and access to region-locked content.

[**Block ads on all your devices from anywhere using a Raspberry Pi**](/docs/solutions/block-ads-all-devices-anywhere-using-raspberry-pi) — Increase privacy, security, and browsing performance in a cost-effective way by using a Raspberry Pi with Pi-hole to block ads.

[**Access remote desktops using Windows RDP**](/docs/solutions/access-remote-desktops-using-windows-rdp) — Access a Windows PC securely from anywhere using Remote Desktop and Tailscale. Connect devices on your private tailnet without port forwarding or public IPs.

[**Access remote desktops using RustDesk**](/docs/solutions/access-remote-desktops-with-rustdesk) — Set up secure remote desktop access using RustDesk and Tailscale for connecting devices directly over your private tailnet, no servers needed.

[**Host a website using a tailnet device**](/docs/features/tailscale-funnel/how-to/host-websites) — Host a website from a device in your tailnet.

[**Set up a dog camera with Tailscale, Raspberry Pi, and Motion**](/docs/solutions/set-up-dogcam) — Set up a dog camera that you can securely access from anywhere.

## Development

[**Create a secure connection to MongoDB Atlas**](/docs/solutions/create-a-secure-connection-to-mongodb-atlas) — Securely connect to a MongoDB Atlas database and permit access only to your Tailscale network.

[**Connect GitHub CI/CD workflows to private infrastructure without public exposure**](/docs/solutions/connect-github-cicd-workflows-to-private-infrastructure-without-public-exposure) — Connect GitHub-hosted runners to private infrastructure without public exposure using Tailscale's ephemeral, authenticated connections.

[**Route AI code reviews through Aperture**](/docs/solutions/route-ai-code-reviews-through-aperture) — Centralize API key management, usage tracking, and cost control for AI-powered code reviews by routing Claude Code GitHub Action requests through Aperture by Tailscale.

[**Reduce AI token spend without changing your applications**](/docs/solutions/reduce-aperture-token-costs-with-tsheadroom) — Add tsheadroom to Aperture to compress bulky AI request bodies before they reach your provider, cutting token spend across all of your traffic with no changes to your client applications.

[**Code on iPad using Visual Studio Code, Caddy, and code-server**](/docs/solutions/code-on-ipad-vscode-caddy-code-server) — Code from your iPad from anywhere with a secure private connection to your own remote coding environment.

## Manage infrastructure

[**Manage multi-cluster Kubernetes deployments with ArgoCD**](/docs/solutions/manage-multi-cluster-kubernetes-deployments-argocd) — Set up secure multi-cluster Kubernetes management with ArgoCD using Tailscale's private network to connect clusters across regions without complex networking.

[**Sync Kubernetes secrets across clusters with External Secrets Operator**](/docs/solutions/sync-kubernetes-secrets-across-clusters-external-secrets) — Distribute secrets between Kubernetes clusters using External Secrets Operator and Tailscale's private network, eliminating the need to store credentials in Git or expose API servers to the internet.

[**Connect Kubernetes pods to your tailnet using a sidecar**](/docs/solutions/connect-kubernetes-pods-to-tailnet-using-sidecar) — Run the Tailscale container image as a sidecar in Kubernetes with persistent state, DNS configuration, authentication, and routing guidance.

[**Use ufw to lock down an Ubuntu server**](/docs/how-to/secure-ubuntu-server-with-ufw) — Accept connections from Tailscale and ignore internet traffic to a server.

[**Access PiKVM from anywhere**](/docs/integrations/pikvm) — Set up Tailscale on PiKVM.

[**Run a private Minecraft server with Tailscale**](/docs/solutions/set-up-minecraft) — Share a Minecraft server with the people you want from anywhere.

[**Tailscale on NixOS: A New Minecraft Server in Ten Minutes**](/docs/solutions/set-up-nixos-minecraft) — Set up a Minecraft server on NixOS.

[**Connect to external services with IP block lists**](/docs/concepts/ip-blocklist-relays) — Control access to SaaS applications hosted on servers that aren't running Tailscale.

[**Infrastructure as code**](/docs/integration-infrastructure-as-code) — Infrastructure as Code integrations let you deploy infrastructure programmatically.
