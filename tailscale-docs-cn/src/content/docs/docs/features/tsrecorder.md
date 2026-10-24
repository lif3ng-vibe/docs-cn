---
title: "tsrecorder"
description: "Use tsrecorder for session recording with Tailscale SSH and the Tailscale Kubernetes Operator."
---

Last validated Jun 12, 2026

> **Deprecation:**
>
> Tailscale no longer offers session recording through `tsrecorder`. Support for existing users is scheduled to end on August 2027. For session recording and privileged access management, use [Tailscale PAM][docs-tailscale-pam] or contact [Tailscale Sales][co-contact-sales].

When accessing sensitive infrastructure through your tailnet, you might need a record of what happened during those sessions. Compliance frameworks might require it, security teams want it for incident investigation, and audits go faster when you can replay exactly what a user did. `tsrecorder` provides this record.

`tsrecorder` is a node that joins your tailnet and receives recordings of terminal sessions from other devices. It works the same way regardless of what kind of session it records. A device hosting a session streams session data to `tsrecorder` over the tailnet, and `tsrecorder` writes it to storage. Because the stream travels over the tailnet, it is end-to-end encrypted like any other tailnet traffic.

## What you can record

`tsrecorder` supports two recording scenarios:

* **Tailscale SSH sessions**: Devices running Tailscale SSH stream their sessions to `tsrecorder`. For more information, refer to [Tailscale SSH session recording][docs-ssh-session-recording].
* **Kubernetes sessions**: Kubernetes API server proxy streams all Kubernetes API calls to `tsrecorder`, including endpoints for interactive sessions such as `kubectl exec` and `kubectl attach`. For more information, refer to [Record kubectl sessions][docs-kubectl-recording].

In both scenarios, recordings capture terminal output (`stdout` and `stderr`) along with session metadata such as timestamps, the source device, and the user who started the session. Kubernetes session recordings do not capture `stdin`, which prevents sensitive input such as passwords from appearing in recordings. `tsrecorder` stores sessions in `asciinema` format, which lets you replay them later as they appeared in the terminal.

[Tailscale PAM][docs-tailscale-pam] supports recording additional session types, such as SSH, Kubernetes, and database sessions.

## How recording is controlled

Recording is policy-driven. You deploy `tsrecorder` with a tag, such as `tag:recorder`, then reference that tag in a `recorder` field on the general access rules that govern the sessions you want to record. When a session matches a rule with a `recorder` field, recording starts automatically. Sessions that do not match a recording rule are not recorded.

By default, session recording "fails open". If the recorder node is unreachable, Tailscale still lets the session connect. If your compliance requirements demand that every session is recorded, you can "fail closed" instead by setting `enforceRecorder` to `true`. With enforcement on, Tailscale blocks the session if it cannot reach a recorder.

## Where recordings are stored

`tsrecorder` writes recordings to one of two destinations:

* A local file path, such as a mounted volume
* An S3-compatible object storage bucket

To configure object storage, refer to [Send session recordings to S3][docs-session-recording-s3].

## Set up tsrecorder

Setup follows the same shape for every scenario. You deploy the `tsrecorder` container, point it at a storage destination, and reference its tag in your tailnet policy file. The scenario-specific topics walk through each configuration:

* To record Tailscale SSH sessions, refer to [Tailscale SSH session recording][docs-ssh-session-recording].
* To record `kubectl` sessions, refer to [Kubernetes session recording][docs-kubectl-recording].
* To deploy `tsrecorder` on a Kubernetes cluster, the operator's `Recorder` custom resource handles the deployment for you. For more information, refer to [Deploy a session recorder in your Kubernetes cluster][docs-deploy-tsrecorder].

## View recordings

You can review recordings in the Tailscale admin console or retrieve them directly from your storage backend. `tsrecorder` also includes an optional web UI for browsing and replaying recorded sessions. If you enable the UI, configure your [tailnet policy file][docs-tailnet-policy-file] to restrict access to port `443` on the recorder so that only authorized users can view recordings. For more information about configuring the web UI including tailnet policy file examples, refer to [Deploy a session recorder in your Kubernetes cluster][docs-deploy-tsrecorder].

[co-contact-sales]: https://tailscale.com/contact/sales

[docs-deploy-tsrecorder]: /docs/kubernetes-operator/recorder/deploy-tsrecorder

[docs-kubectl-recording]: /docs/kubernetes-operator/recorder/kubectl-session-recording

[docs-session-recording-s3]: /docs/features/tailscale-ssh/how-to/session-recording-s3

[docs-ssh-session-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-pam]: /docs/privileged-access-management/session-logs
