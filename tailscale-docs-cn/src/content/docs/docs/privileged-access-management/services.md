---
title: "Tailscale PAM services"
description: "Use Tailscale PAM services to manage privileged access to services on your Tailscale network."
---

Last validated Aug 17, 2026

> **Note:** Tailscale PAM is currently in beta.

Services are resources on your Tailscale network (known as a tailnet) that are made available through the Tailscale PAM platform. They let you manage privileged access to the services.

Tailscale PAM supports various service types:

* HTTP/HTTPS
* SSH
* Databases, such as:
  * Amazon RDS
  * Elasticsearch
  * Google Cloud SQL
  * Microsoft SQL Server
  * MongoDB
  * MySQL
  * PostgreSQL
* Kubernetes
* Remote Desktop Protocol (RDP)
* Virtual Network Computing (VNC)
* Any TCP port

*（图：Services are the core building blocks in Tailscale PAM）*

## Prerequisites

Before you begin, confirm you have the following:

* A [Tailscale PAM connector][docs-pam-connectors].

## Create a service

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.
2. Select **Add service**.
3. Select **PAM service**.
4. Select a service type for your use case, and then select **Continue**.
5. Follow the prompts to configure your new service. As part of your configuration, you are required to select a connector for the service.
6. When you have finished providing details about your new service, select **Save**.

## Update a service

1. Open the [Services](https://console.tailscale.com/admin/services) page.
2. Select the service that you want to update.
3. Select **Edit service**.
4. Make your changes.
5. Select **Save**.

## Delete a service

1. Open the [Services](https://console.tailscale.com/admin/services) page.
2. Select the service that you want to delete.
3. Select **Edit service**.
4. Select **Remove Service**.
5. When prompted, confirm that you want to delete the service.

[docs-pam-connectors]: /docs/privileged-access-management/connectors
