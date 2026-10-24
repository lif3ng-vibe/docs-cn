---
title: "Manage access"
description: "Manage access to your Tailscale resources."
---

Last validated May 7, 2025

Use Tailscale access features to control how users access resources in your Tailscale network, known as a tailnet. You also control how devices access other devices.

## Manage access policy

Access control lists (ACLs) and grants let you precisely define permissions for users and devices in your tailnet. Tailscale manages access rules for your network in the [tailnet policy file][docs-terminology-and-concepts-tailnet-policy-file].

[**Manage permissions using ACLs**](/docs/features/access-control/acls) — Configure access control lists (ACLs) in Tailscale to manage device permissions and secure your network.

[**Grants**](/docs/features/access-control/grants) — Grant access control permissions across both network connections and application permissions.

[**Syntax reference for the tailnet policy file**](/docs/reference/syntax/policy-file) — Reference syntax for the tailnet policy file.

[**Just-in-time access**](/docs/features/access-control/just-in-time-access) — Provide just-in-time access, also known as on-demand access, to your Tailscale network users.

## Manage devices

You control which devices are in your tailnet, including whether you want a tailnet admin to approve new devices before they are allowed access. You can also use device posture with mobile device management (MDM) solutions to enforce device rules.

[**Manage devices**](/docs/features/access-control/device-management) — Review and approve devices, rename a machine, and filter devices in the admin console.

## Manage users and user roles

You control which users are in your tailnet, how they are invited, and their access to your tailnet resources.

[**Manage users**](/docs/manage-users) — Invite users, assign or change user roles, remove users, and quickly switch between accounts.

## Manage domain ownership

When you create your tailnet, your user domain becomes part of your [Tailscale identity][docs-tailscale-identity].

[**Domain ownership**](/docs/concepts/domain-ownership) — Explore how your tailnet is tied to your domain.

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-terminology-and-concepts-tailnet-policy-file]: /docs/reference/glossary#tailnet-policy-file
