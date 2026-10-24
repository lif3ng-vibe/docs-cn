---
title: "Store Tailscale PAM session recordings in S3"
description: "By default, [Tailscale PAM][docs-pam] stores session recordings for you. If you prefer to control where your recording data is stored, you can configure Tailscale PAM to use an Amazon S3 bucket that y"
---

Last validated Aug 21, 2026

> **Note:** Tailscale PAM is currently in beta.

> **Note:** Custom recording storage is available for [the Premium plan](https://tailscale.com/pricing).

By default, [Tailscale PAM][docs-pam] stores session recordings for you. If you prefer to control where your recording data is stored, you can configure Tailscale PAM to use an Amazon S3 bucket that you own and manage.

Using your own S3 bucket gives you control over the storage location, retention, and access to your session recordings. Tailscale PAM accesses your bucket using a cross-account Amazon Web Services (AWS) IAM role, so you don't need to provide AWS access keys or other long-lived AWS credentials to Tailscale.

Currently, Amazon S3 is the only supported custom recording storage location.

> **Note:**
>
> Changing your recording storage location doesn't migrate existing recordings. Recordings stored in the previous storage location will no longer be available for replay in the Tailscale admin console after you switch. New recordings will be stored in the configured S3 bucket.

## How recording storage works

When you configure your own S3 bucket:

1. A Tailscale PAM session recorder captures activity for a session.
2. Recording data is sent to the Tailscale PAM API.
3. The Tailscale PAM API assumes the IAM role you configure in your AWS account.
4. The Tailscale PAM API writes the recording to your S3 bucket.

Your S3 bucket is the storage location for the recording, and you retain ownership and control of the bucket and its access policy.

> **Note:**
>
> Using your own S3 bucket changes where session recordings are stored, but recordings still pass through the Tailscale PAM API before they are written to your bucket. Recordings aren't uploaded directly from the PAM connector to your S3 bucket.
>
> We recommend allowing Tailscale PAM to read recordings from the bucket as well as write them. Read access lets Tailscale PAM display session recordings and replays in the Tailscale admin console. If you remove read access, Tailscale PAM won't be able to display those recordings in the admin console.

## Prerequisites

Before you begin, you need:

* An AWS account.
* An S3 bucket to store session recordings.
* Permission to create IAM policies and roles in your AWS account.
* A role of [Owner or Admin](/docs/reference/user-roles) for your tailnet so you can configure the PAM recording storage settings.

You need to create:

* An S3 bucket for the recordings.
* An IAM policy that grants access to the bucket.
* An IAM role with the policy attached that Tailscale PAM can assume.

## Create an S3 bucket

Create an S3 bucket in your AWS account to store Tailscale PAM session recordings.

For example, create a bucket named `my-pam-recordings`.

You control the bucket configuration, including retention, encryption, lifecycle rules, and any additional access controls you want to apply.

## Create an IAM policy

Create an IAM policy that lets Tailscale PAM store and retrieve recordings from the bucket.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::${BUCKET_NAME}",
        "arn:aws:s3:::${BUCKET_NAME}/*"
      ],
      "Effect": "Allow",
      "Sid": "AllowAccessS3Bucket"
    }
  ]
}
```

Replace `${BUCKET_NAME}` with the name of your S3 bucket.

The `s3:GetObject` permission lets Tailscale PAM retrieve recordings so they can be replayed from the Tailscale admin console.

## Create an IAM role

Create an AWS IAM role and attach the policy you created in the previous step.

Configure the role's trust policy so that the Tailscale PAM AWS account can assume it:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "arn:aws:iam::235487987553:root"
        ]
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "${EXTERNAL_ID}"
        }
      }
    }
  ]
}
```

Replace `${EXTERNAL_ID}` with an external ID of your choice.

Using an external ID is optional, but recommended. If you configure one in the IAM role, you must provide the same external ID when configuring recording storage in Tailscale PAM.

After creating the role, copy its Amazon Resource Name (ARN). It will look similar to:

* `arn:aws:iam::123456789012:role/pam-recordings`

## Configure recording storage in Tailscale PAM

After creating the AWS resources:

1. Open the [PAM](https://console.tailscale.com/admin/settings/pam) page of the Tailscale admin console.
2. In the **Recording storage** section, select **Configure storage**.
3. Enter the name of your S3 bucket.
4. Enter the ARN of the IAM role Tailscale PAM should assume.
5. If you configured an external ID for the role, enter it in **External ID**.
6. (Optional) Enter the AWS region containing the bucket.
7. Select **Save**.

Tailscale PAM will use the configured IAM role when storing session recordings in your S3 bucket.

## Verify recording storage

To verify the configuration:

1. Connect to a PAM service that has session recording enabled.
2. Do some activity during the session.
3. End the session.
4. Confirm that the recording was written to your S3 bucket.
5. Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the Tailscale admin console.
6. Open the session and verify that its recording or replay is available.

If Tailscale PAM can write recordings to the bucket but can't display them of the admin console, check that the IAM role has permission to read objects from the bucket.

[docs-pam]: /docs/privileged-access-management
