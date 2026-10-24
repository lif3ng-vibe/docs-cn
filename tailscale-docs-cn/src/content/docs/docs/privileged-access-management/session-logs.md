---
title: "Tailscale PAM session logs"
description: "Get insight into the privileged access sessions in your Tailscale network."
---

Last validated Aug 20, 2026

> **Note:** Tailscale PAM is currently in beta.

Tailscale PAM session logs give administrators visibility into access to PAM services across their tailnet. A PAM session records an attempt by a [Tailscale identity][docs-tailscale-identity] to connect to a PAM service, including successful and denied connections.

Session logs help you answer questions such as:

* Who connected to a PAM service?
* Which service did they connect to?
* Which device did they connect from?
* When did the connection occur?
* Was access allowed or denied?
* What happened during the session?

Depending on the type of service and its recording configuration, Tailscale PAM can also capture activity within the session, such as SSH activity, database queries, Kubernetes API requests, or Amazon S3 API requests.

## Review PAM sessions

To review PAM sessions:

1. Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the Tailscale admin console.
2. (Optional) Use the **Sessions** page filters to find a session, such as for a specific service or user.
3. Select a session.

The **PAM sessions** page lists sessions across your tailnet. For each session, you can review information including:

* The actor who initiated the session.
* The PAM service they attempted to access.
* The date and time of the session.
* The source device.
* Whether the session was successful or denied.

You can filter the session list by:

* Timeframe
* Service
* Actor
* Status

For example, you can filter for denied sessions to investigate attempts where a user wasn't authorized to access a PAM service.

## Review session details

Select a session to review more information about it.

Session details include:

* The Tailscale identity that initiated the session.
* The date and time of the session.
* The source device.
* The source IP address.
* The session duration.
* The session status.

For successful or denied connections, you can also review authorization details to understand why access was allowed or denied, including the Tailscale grants that were evaluated for the connection.

This can be useful when troubleshooting access and determining which grants allowed a connection or why a connection was denied.

## Review activity within a session

The information available for a session depends on the type of PAM service.

### Database sessions

For database services, Tailscale PAM records database activity in the **Query log**.

For each query, you can review information including:

* The date and time.
* The database.
* The query that was executed.
* The query duration.
* The number of rows returned.
* The number of rows affected.
* Query errors, when applicable.

This gives administrators a record of database activity performed through Tailscale PAM.

### HTTP sessions

When recording is enabled for supported HTTP sessions, you can review a replay of the browser activity that occurred during the session.

### Kubernetes sessions

For Kubernetes services, session activity can include requests made to the Kubernetes API.

When applicable, activity from interactive `exec` sessions can also be recorded and replayed.

### S3 sessions

For S3 services, session activity can include the S3 API requests made during the session. This provides a record of the operations performed against the S3 service.

### SSH sessions

When session recording is enabled for an SSH service, you can review what happened during the session.

Depending on the session, you can use:

* **Video replay** to replay the terminal session.
* **Full text** to review a text representation of the session.
* **Events** to inspect additional session and protocol metadata.

For example, SSH events can identify activity such as opening a shell or creating a TCP/IP forwarding channel.

## Review session events

Sessions also include an **Events** tab with additional information about activity during the connection.

The information available depends on the service and protocol. Events can include details such as:

* Authorization events.
* Client information and version.
* Protocol-specific events.
* Connection and session metadata.

The Events tab can be especially useful when troubleshooting a denied connection or investigating specific activity within a session.

## Session recordings

Session recordings provide additional visibility into what occurred after a user connected to a PAM service.

The type of recording depends on the service. For example, an SSH session can provide a replay and text transcript, while a database session provides a structured log of the queries that were executed.

Recording availability also depends on the service type and whether session recording is enabled for that service.

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
