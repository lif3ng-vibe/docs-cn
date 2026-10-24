---
title: "Logging, streaming, and events"
description: "Explore Tailscale's logging features and events for webhooks."
---

Last validated Feb 5, 2025

Manage the logs and events within your Tailscale network, known as a tailnet.

## Capture logs and events

You can capture configuration changes to your tailnet as well as network traffic flow.

[**Configuration audit logging**](/docs/features/logging/audit-logging) — Identify who did what, and when, to your tailnet configuration.

[**Network flow logs**](/docs/features/logging/network-flow-logs) — View networking telemetry for nodes in your Tailscale network.

## Stream logs and events to a SIEM or storage bucket

Stream configuration audit logs and network flow logs to your preferred log streaming integration, such as a security information and event management (SIEM) system and Amazon S3 or S3-compatible storage buckets. You can also stream Tailscale SSH session recordings to another node in your tailnet or storage buckets.

[**Log streaming**](/docs/features/logging/log-streaming) — Stream Tailscale logs to a security information and event management (SIEM) system, Amazon S3, and S3-compatible service.

[**Tailscale SSH session recording**](/docs/features/tailscale-ssh/tailscale-ssh-session-recording) — Use Tailscale SSH session recording to collect end-to-end encrypted recordings of Tailscale SSH sessions.

[**Send Tailscale SSH session recordings to S3**](/docs/features/tailscale-ssh/how-to/session-recording-s3) — Configure an S3 backend for SSH session recording.

## Integrate log events with your infrastructure

Use webhooks to integrate log events with your infrastructure, such as with apps like Slack.

[**Webhooks**](/docs/features/webhooks) — Set up a webhook to receive notification of events on your Tailscale network.
