---
title: "Access Amazon S3 buckets using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] gives users [identity-based][docs-tailscale-identity] access to Amazon S3 without requiring you to distribute AWS credentials to each user."
---

Last validated Aug 17, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] gives users [identity-based][docs-tailscale-identity] access to Amazon S3 without requiring you to distribute AWS credentials to each user.

The Tailscale PAM [connector][docs-pam-connectors] authenticates to AWS and sends S3 API requests on the user's behalf. Users access S3 with their Tailscale identity, while Tailscale PAM [grants][docs-grants] in your tailnet access policy control which buckets, paths, and actions they're allowed to use.

Users can browse S3 from the Tailscale browser client or continue using familiar tools such as the AWS CLI and other S3-compatible clients. This gives users a simpler way to work with S3 while keeping AWS credentials with the connector and giving administrators centralized access control and visibility.

## How S3 access works

The PAM connector acts as a proxy between users and Amazon S3.

When a user makes an S3 request, Tailscale PAM checks whether the request is allowed by the user's PAM grants before the connector sends it to AWS. The connector's AWS identity must also have permission to do the requested operation.

This means two layers of access control apply:

* **AWS IAM** controls what the connector can do in S3.
* **Tailscale PAM grants** control what individual users and groups can do through the service.

Tailscale PAM can narrow the permissions available to users, but it can't provide access that the connector's AWS identity doesn't already have.

## Prerequisites

Before you begin, make sure you have:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed and online.
* An AWS identity the connector can use to access S3.
* The required AWS IAM permissions for the buckets and operations you want to make available.
* Permission to update your [tailnet policy file][docs-tailnet-policy-file].

## Create an Amazon S3 PAM service

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select **AWS S3**.

5. Select **Continue**.

6. Enter a name for the service.

7. (Optional) Enter a description.

8. Choose whether to enable session recording.

9. From **Connect via**, select one or more Tailscale PAM connectors.

   Choose a connector that can authenticate to AWS and reach the S3 API.

10. Select **Continue**.

11. (Optional) Configure the buckets available through the service and how the connector authenticates to AWS. Under **Bucket allowlist**, select **Add bucket** and enter a bucket name or pattern for each bucket setting you want to create. For example, you could use a bucket name like:

    ```shell
    production-artifacts
    ```

    You can also use wildcards in bucket patterns, such as:

    ```shell
    production-*
    ```

    If you leave the allowlist empty, the service can make available any S3 bucket accessible to the connector's AWS identity. The connector's AWS IAM permissions still apply.

    You can use Tailscale PAM grants later to apply more specific restrictions for individual users, including restrictions on paths within a bucket.

12. For **AWS authentication strategy**, choose how the connector authenticates to AWS. Select one of the following:

    * **Default credentials provider chain** uses credentials already available to the connector. If the connector runs in AWS, this can use the IAM role assigned to the instance or workload.
    * **AWS profile** uses an AWS profile available in the connector's environment.
    * **Static credentials** uses an AWS access key and secret access key configured for the service.

    Whichever method you choose, the AWS identity needs permission to do the S3 operations you want users to also do through the service.

13. Select **Save**.

## Grant access to S3

Use Tailscale PAM grants in your tailnet access policy to control who can use the service.

For example, the following grant gives the `group:engineering` group access to the S3 service:

```json
{
  "grants": [
    {
      "src": ["group:engineering"],
      "dst": ["svc:your-s3-service"],
      "ip": ["*"],
      "app": {
        "tailscale.com/cap/pam": [
          {
            "version": "v1",
            "permissions": {
              "aws_s3": {}
            }
          }
        ]
      }
    }
  ]
}
```

An unrestricted `aws_s3` permission makes the S3 operations available through the service and the connector's AWS identity.

For information about editing grants, refer to [Edit access control policies in your tailnet policy file][docs-manage-tailnet-policies].

### Control access by bucket, path, and action

For more granular access, S3 rules can restrict users by:

* Bucket.
* Object path.
* Action: `list`, `read`, `write`, or `delete`.

For example, the following rule gives users read-only access to objects under `development/` in the `company-data` bucket:

```json
"aws_s3": {
  "rules": [
    {
      "buckets": ["company-data"],
      "paths": ["development/*"],
      "actions": ["list", "read"]
    }
  ]
}
```

This is useful when multiple teams or environments share a bucket. The connector can have the AWS permissions it needs to access the bucket, while Tailscale PAM grants determine which parts of the bucket each user can access.

When S3 rules are configured, an operation must match at least one rule. Rules are additive and support wildcards for matching buckets and paths.

For more information about grants, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

## Access S3

Users can access the service from the Tailscale browser client or with an S3-compatible client.

### Use the Tailscale browser client

Open the S3 service from the Tailscale PAM [Border0 web client](https://my.tailscale.com) to browse the buckets and objects available to your Tailscale identity.

The file browser gives users a familiar way to browse S3 without needing to configure AWS credentials or use the AWS CLI. What each user can read and do is limited by their Tailscale PAM grants and the AWS permissions available to the connector. The original S3 service was designed to support both a browser-based file explorer and native S3 tooling.

### Use the AWS CLI

You can configure the AWS CLI (`aws`) to send S3 requests through the Tailscale PAM service.

Create a profile similar to:

```ini
[profile private-s3]
aws_access_key_id = unused_placeholder
aws_secret_access_key = unused_placeholder
endpoint_url = http://<your-service-hostname-or-ip>
addressing_style = path
```

Replace `<your-service-hostname-or-ip>` with the endpoint for your S3 PAM service.

The access key and secret key values are unused placeholders but aren't used for authentication. The AWS CLI expects credentials to be present before it sends the request, but the connector uses the AWS credentials configured for the PAM service when communicating with S3.

Use the profile with normal AWS CLI commands:

```shell
aws --profile private-s3 s3 ls
```

Or:

```shell
AWS_PROFILE=private-s3 aws s3 ls
```

You can continue using normal S3 commands. Whether an operation succeeds depends on both the user's PAM permissions and the connector's AWS IAM permissions.

## Review S3 sessions

Tailscale PAM gives you a central place to review who accessed your S3 services.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, then select an S3 session to review information about the user, originating device, connection time, and service that was accessed.

When session recording is enabled, you can also review the S3 activity performed through the service. This gives you an audit trail of who accessed S3 and what S3 operations were performed. This lets you review what files were accessed by whom.

## Troubleshooting

If you can't access an S3 service, check that the connector can authenticate to AWS and that its AWS identity can do the requested operation.

If you can't access a specific bucket but can access the S3 service:

* Verify that you added a bucket by using the **Bucket allowlist** option.
* Verify that the user's Tailscale PAM grant permits the requested bucket, path, and action.

### AWS CLI can't find credentials

If the AWS CLI returns:

```shell
Unable to locate credentials. You can configure credentials by running "aws configure".
```

Make sure your local profile contains placeholder values for both fields:

```ini
aws_access_key_id = unused_placeholder
aws_secret_access_key = unused_placeholder
```

The AWS CLI requires credentials to be configured before sending the request, even though the `unused_placeholder` values aren't used to authenticate to the upstream S3 service.

### Objects under a bucket prefix aren't visible

If you use prefixes within a bucket to separate environments or teams, make sure the connector has enough AWS IAM permission to list the bucket.

You can then use Tailscale PAM grants to restrict the paths individual users can access. For example:

```json
"paths": ["development/*"]
```

This lets the connector list the bucket while Tailscale PAM limits the objects exposed to each user.

If the expected objects still don't appear, check both the connector's AWS permissions and the bucket and path patterns in the user's grant.

### An S3 operation is denied

Both authorization layers must allow the operation.

For example, a Tailscale PAM grant that permits `write` operations doesn't permit uploads if the connector's AWS identity lacks the required S3 write permission. Likewise, broad AWS IAM permissions on the connector don't override a more restrictive Tailscale PAM grant.

[docs-grants]: /docs/features/access-control/grants

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam]: /docs/privileged-access-management

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies
