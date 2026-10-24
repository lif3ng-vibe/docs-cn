---
title: "Send Tailscale SSH session recordings to S3"
description: "By default, Tailscale SSH session recording will save recordings to the Docker host's filesystem. While this is a fast and straightforward way to deploy session recorders, you may want to use a more s"
---

Last validated Jan 9, 2026

By default, Tailscale SSH session recording will save recordings to the Docker host's filesystem. While this is a fast and straightforward way to deploy session recorders, you may want to use a more scalable and resilient storage solution like Amazon S3.

> **Note:** Tailscale SSH session recording is currently in beta.

> **Note:** Tailscale SSH session recording is available for [the Personal and Enterprise plans](https://tailscale.com/pricing).

You can configure session recorder nodes to send recordings to Amazon S3 or another S3-compatible object storage service such as MinIO, Wasabi, Google Cloud Storage, or [Cloudflare R2][ar-cloudflare-r2-compatibility].

If you deploy recorder nodes with the built-in web UI enabled, users can access recordings stored in S3 in the web UI.

## Configure S3 as storage for session recording nodes

### Prerequisites

To configure S3 as the backend storage for session recording, you must have access to an AWS account with permission to create:

* S3 buckets
* IAM policies

and *either*

* IAM users
* IAM user access keys

or

* an IAM role

### Create an IAM policy and user/role

[Create the following IAM policy][xt-aws-iam-create] in your AWS account. Replace `<bucket-name>` with the name of your S3 bucket on both lines of the `Resource` section.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::<bucket-name>/*",
        "arn:aws:s3:::<bucket-name>"
      ]
    }
  ]
}
```

If you are running the recorder nodes without the built-in web UI, you can omit `s3:GetObject` and `s3:ListBucket` from this policy. `s3:PutObject` and `s3:GetBucketLocation` are always required.

If you plan to use IAM access keys for permission to write to the bucket, assign this policy a new IAM user, and [create an access key][xt-aws-iam-create-key] for this user. If you plan to use an IAM role, [create an IAM role][xt-aws-iam-create-role] and attach the previously defined policy to the role.

### Deploy the recorder node

Deploying a recorder node with S3 as the storage backend is similar to the standard filesystem deployment. You'll need to add your IAM credentials or role, and the S3 bucket information.

#### Deploy with AWS access keys

For AWS access keys, specify the AWS access key and secret key:

```shell
docker run --name tsrecorder --rm -it \
  -e TS_AUTHKEY=$TS_AUTHKEY \
  -e AWS_ACCESS_KEY=$AWS_ACCESS_KEY \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -v $HOME/tsrecorder:/data \
  tailscale/tsrecorder:stable \
  /tsrecorder --dst='s3://s3.us-east-2.amazonaws.com' --statedir=/data/state \
  --bucket=$S3_BUCKET_NAME --ui \
```

#### Deploy with attached IAM roles

For IAM roles, the credentials are retrieved from the AWS metadata service. You'll need to assign an IAM role (and if using an EC2 instance, an [IAM instance profile][xt-aws-iam-instance-profile]) to the container.

```shell
docker run --name tsrecorder --rm -it \
  -e TS_AUTHKEY=$TS_AUTHKEY \
  -v $HOME/tsrecorder:/data \
  tailscale/tsrecorder:stable \
  /tsrecorder --dst='s3://s3.us-east-2.amazonaws.com' --statedir=/data/state \
  --bucket=$S3_BUCKET_NAME --ui \
```

> **Note:**
>
> If the instance you're provisioning the Docker container is using [Instance Metadata v2][xt-aws-configuring-instance-metadata-service], the default `PUT` response hop limit is 1 (that is, from the EC2 instance to the metadata service). For IAM instance profiles to work with Docker, you must first configure the limit to account for the extra hop through the EC2 instance, [so 2 at minimum][xt-aws-instance-metadata-hop-limit].

Required flags:

* `--dst` Specifies where recordings will be saved. Accepts a local file path or an S3 region URL. The value must begin with `s3://` if you intend to use S3 storage for storing the recordings. You can alternatively define the value as an environment variable, `TSRECORDER_DST`.
* `--statedir` Specifies where the recorder should store its internal state. Accepts a local file path.

Optional flags:

* `--hostname` Specifies a hostname to use for the recorder node. Defaults to `recorder`. You can alternatively define the value as an environment variable, `TSRECORDER_HOSTNAME`.
* `--access-key` The AWS access key for an IAM user that can upload recordings to an S3 bucket. Required when using S3 as a storage backend if no IAM role is passed to the instance. You can alternatively define the secret access key as an environment variable, `AWS_ACCESS_KEY_ID`.
* `--secret-key` The AWS secret access key for an IAM user that can upload recordings to an S3 bucket. Required when using S3 as a storage backend if no IAM role is passed to the instance. You can alternatively define the secret access key as an environment variable, `AWS_SECRET_ACCESS_KEY`.
* `--bucket` The name of the S3 bucket where the recorder should upload recordings. Required when using S3 as a storage backend. You can alternatively define the secret access key as an environment variable, `TSRECORDER_BUCKET`.
* `--state` Path to Tailscale state file, used to persist recorder state across container restarts. This can be a persistent volume or a Kubernetes [`Secret`][xt-kubernetes-secret]. You can alternatively define this value as an environment variable, `TS_STATE`.
  * To use a `Secret`, specify `kube:<secret-name>`. If set to use a `Secret` for state storage, the recorder must have permissions to read, update, and patch the `Secret`. If the `Secret` does not exist, the recorder will create it, and must have permissions to do so.
  * If `--state` is unset, the state will be stored in the directory set using `--statedir`.
* `--ui` Enables the recorder container web UI for viewing recorded SSH sessions. Defaults to `false` if this flag is not present. You can alternatively define this value as an environment variable, `TSRECORDER_UI`.
  * If you deploy the recorder with the UI, you must have HTTPS enabled in your tailnet.
  * If you enable the recorder container web UI, you should restrict access to port `443` on the recorder in your access control policies to prevent unauthorized members of your tailnet from viewing sensitive recordings.

There are multiple ways to define the AWS IAM credentials needed to connect to an S3 bucket. In order of precedence, they are:

1. Specify `--access-key` and `--secret-key`
2. Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
3. Specify none of the above, and be on an EC2 instance with the right permissions.

#### Cloudflare R2 Compatibility

Cloudflare R2 Storage provides an [S3-compatible API][xt-cloudflare-S3-API-compatibility]; however, an additional setting is needed due to differences in their implementation. To use Cloudflare R2 as the storage service for session recordings set the environment variable `S3_SEND_CONTENT_MD5` to `true` in addition to any environment variables you are already passing.

```shell
S3_SEND_CONTENT_MD5=true
```

[ar-cloudflare-r2-compatibility]: #cloudflare-r2-compatibility

[xt-aws-iam-create-role]: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create.html

[xt-aws-configuring-instance-metadata-service]: https://docs.aws.amazon.com/AWSEC2/latest/WindowsGuide/configuring-instance-metadata-service.html

[xt-aws-iam-instance-profile]: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html

[xt-aws-instance-metadata-hop-limit]: https://docs.aws.amazon.com/AWSEC2/latest/WindowsGuide/configuring-IMDS-existing-instances.html#modify-PUT-response-hop-limit

[xt-aws-iam-create-key]: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html

[xt-aws-iam-create]: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_create-console.html

[xt-cloudflare-S3-API-compatibility]: https://developers.cloudflare.com/r2/api/s3/api

[xt-kubernetes-secret]: https://kubernetes.io/docs/concepts/configuration/secret/
