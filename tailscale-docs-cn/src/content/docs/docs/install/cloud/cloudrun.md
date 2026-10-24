---
title: "Tailscale on Google Cloud Run"
description: "Google Cloud Run is a popular method of deploying application using containers, rather than managing servers yourself. However, it can be difficult to use Tailscale on Google Cloud Run, since it doesn"
---

Last validated Jan 5, 2026

Google Cloud Run is a popular method of deploying application using containers, rather than managing servers yourself. However, it can be difficult to use Tailscale on Google Cloud Run, since it doesn't provide a /dev/net/tun device that Tailscale needs.

You can use Tailscale's [userspace networking mode][docs-userspace-networking] to connect your Cloud Run apps to your Tailscale network.

## Step 1: Generate an auth key to authenticate your Cloud Run containers

First, we'll [generate an auth key][docs-auth-keys] to allow Cloud Run to authenticate our container to join our network.

Open the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console and select **Generate auth key**. We recommend using an [ephemeral key][docs-ephemeral-nodes] for this purpose, since it will automatically clean up devices after they shut down.

*（图：Tailscale's auth key generation page）*

> **Note:**

Next, [go to Cloud Run's][xt-google-console-run] **Edit & Deploy New Revision** page and select the **Variables & Secrets** tab. From here, add a new secret, use **Environment variable** as the reference method, and name it `TAILSCALE_AUTHKEY`. Use the `tskey-<key>` value as the secret.

## Step 2: Configure your Dockerfile to install Tailscale

Next, we'll use a [multistage Dockerfile][xt-docker-multi-stage-builds], where the first stage builds your application, and the second stage pulls application code and Tailscale into the final image to be uploaded to Google.

In your `Dockerfile`:

```docker
FROM golang:1.16.2-alpine3.13 as builder
WORKDIR /app
COPY . ./
# This is where one could build the application code as well.

FROM alpine:latest
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*

# Copy binary to production image.
COPY --from=builder /app/start.sh /app/start.sh

# Copy Tailscale binaries from the tailscale image on Docker Hub.
COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscaled /app/tailscaled
COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscale /app/tailscale
RUN mkdir -p /var/run/tailscale /var/cache/tailscale /var/lib/tailscale

# Run on container startup.
CMD ["/app/start.sh"]
```

The Dockerfile specifies `/app/start.sh` as the initial process to run. This script needs to bring Tailscale up and then start the application binary. This is where we can use the `TAILSCALE_AUTHKEY` variable we defined earlier.

Then, create a file named `start.sh` at the root of your app:

```shell
#!/bin/sh

/app/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &
/app/tailscale up --auth-key=${TAILSCALE_AUTHKEY} --hostname=cloudrun-app
echo Tailscale started
ALL_PROXY=socks5://localhost:1055/ /app/my-app
```

The next time your Cloud Run container deploys, it will be able to connect to your private Tailscale network.

## Remove ephemeral nodes from a tailnet

When an ephemeral node goes offline, it is automatically removed from your tailnet. You can also control ephemeral node removal using the [`tailscale logout`][docs-cli-logout] command to either manually force the removal or incorporate the command into the [`tailscaled`][docs-tailscaled] Tailscale daemon. For more information, refer to [Ephemeral nodes][docs-ephemeral-nodes-faq].

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-ephemeral-nodes-faq]: /docs/features/ephemeral-nodes#faq

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-tailscaled]: /docs/reference/tailscaled

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-docker-multi-stage-builds]: https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds

[xt-google-console-run]: https://console.cloud.google.com/run
