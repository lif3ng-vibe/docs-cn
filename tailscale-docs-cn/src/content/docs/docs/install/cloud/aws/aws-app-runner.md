---
title: "Tailscale on AWS App Runner"
description: "AWS App Runner is a fully managed means of running container workloads on AWS. Deployment in App Runner can make it difficult to use Tailscale, since it doesn't provide a /dev/net/tun device that Tail"
---

Last validated Jan 5, 2026

AWS App Runner is a fully managed means of running container workloads on AWS. Deployment in App Runner can make it difficult to use Tailscale, since it doesn't provide a /dev/net/tun device that Tailscale needs.

You can use Tailscale's [userspace networking mode][docs-userspace-networking] to connect your AWS App Runner containers to your Tailscale network.

## Step 1: Generate an auth key to authenticate your AWS App Runner containers

First, we'll [generate an auth key][docs-auth-keys] to allow AWS App Runner to authenticate our container to join our network.

Open the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console and select **Generate auth key**. We recommend using an [ephemeral key][docs-ephemeral-nodes] for this purpose, since it will automatically clean up devices after they shut down.

*（图：Tailscale's auth key generation page）*

> **Note:**

Next, [select the AWS App Runner][xt-aws-console] Services list, and create a new service. In the **Configuration** tab, scroll down to **Service Settings** and look for **Environment Variables**. Add a variable with key `TAILSCALE_AUTHKEY` and a value of the `tskey-<key>` string generated earlier.

## Step 2: Configure your Dockerfile to install Tailscale

Next, we'll use a [multistage Dockerfile][xt-docker-multi-stage-builds], where the first stage builds your application, and the second stage pulls application code and Tailscale into the final image to be uploaded to AWS.

In your `Dockerfile`:

```docker
FROM alpine:latest as builder
WORKDIR /app
COPY . ./
# This is where one could build the application code as well.

FROM alpine:latest
# Copy binary to production image.
COPY --from=builder /app/bootstrap /var/runtime/bootstrap

# Copy Tailscale binaries from the tailscale image on Docker Hub.
COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscaled /var/runtime/tailscaled
COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscale /var/runtime/tailscale
RUN mkdir -p /var/run && ln -s /tmp/tailscale /var/run/tailscale && \
    mkdir -p /var/cache && ln -s /tmp/tailscale /var/cache/tailscale && \
    mkdir -p /var/lib && ln -s /tmp/tailscale /var/lib/tailscale && \
    mkdir -p /var/task && ln -s /tmp/tailscale /var/task/tailscale

# Run on container startup.
ENTRYPOINT ["/var/runtime/bootstrap"]
```

The Dockerfile specifies `/var/runtime/bootstrap` as the initial process to run. This script needs to bring Tailscale up and then start the application binary. This is where we can use the `TAILSCALE_AUTHKEY` variable we defined earlier.

Then, create a file named `bootstrap` at the root of your app:

```shell
#!/bin/sh

mkdir -p /tmp/tailscale
/var/runtime/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &
/var/runtime/tailscale up --auth-key=${TAILSCALE_AUTHKEY} --hostname=aws-apprunner-app
echo Tailscale started
ALL_PROXY=socks5://localhost:1055/ /var/runtime/my-app
```

When your AWS App Runner container deploys, it will be able to connect to your private Tailscale network.

## Remove ephemeral nodes from a tailnet

When an ephemeral node goes offline, it is automatically removed from your tailnet. You can also control ephemeral node removal using the [`tailscale logout`][docs-cli-logout] command to either manually force the removal or incorporate the command into the [`tailscaled`][docs-tailscaled] Tailscale daemon. For more information, refer to [Ephemeral nodes][docs-ephemeral-nodes-faq].

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-ephemeral-nodes-faq]: /docs/features/ephemeral-nodes#faq

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-tailscaled]: /docs/reference/tailscaled

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-aws-console]: https://console.aws.amazon.com

[xt-docker-multi-stage-builds]: https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
