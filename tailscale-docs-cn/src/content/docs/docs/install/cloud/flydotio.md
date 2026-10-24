---
title: "Tailscale on Fly.io"
description: "[Fly.io][xt-flyio] is a popular service to deploy full stack apps and databases all over the world, with Fly handling operations and scaling in each region according to demand. Adding Tailscale to a f"
---

Last validated Dec 4, 2025

[Fly.io][xt-flyio] is a popular service to deploy full stack apps and databases all over the world, with Fly handling operations and scaling in each region according to demand. Adding Tailscale to a fly.io application is straightforward, allowing the App on Fly to communicate with other nodes and services in your tailnet.

## Step 1: Generate an auth key to authenticate your App on Fly

First, we'll [generate an auth key][docs-auth-keys] to allow fly.io to authenticate our app to join our network.

Open the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console and select **Generate auth key**. We recommend using a reusable and pre-authorized [ephemeral key][docs-ephemeral-nodes] for this purpose, since it will automatically clean up devices after they shut down.

*（图：Tailscale's auth key generation page）*

> **Note:**

Next, use `flyctl secrets set TAILSCALE_AUTHKEY="tskey-<key>"` to securely store the auth key for the App on Fly to use.

## Step 2: Configure your Dockerfile to install Tailscale

Next, we'll use a [multistage Dockerfile][xt-docker-multi-stage-builds], where the first stage builds your application, and the second stage pulls application code and Tailscale into the final image to be uploaded to Fly.

In your `Dockerfile`:

```docker
FROM alpine:latest as builder
WORKDIR /app
COPY . ./
# This is where one could build the application code as well.

# https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
FROM alpine:latest
RUN apk update && apk add ca-certificates iptables ip6tables && rm -rf /var/cache/apk/*

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

/app/tailscaled --state=/var/lib/tailscale/tailscaled.state --socket=/var/run/tailscale/tailscaled.sock &
/app/tailscale up --auth-key=${TAILSCALE_AUTHKEY} --hostname=fly-app
/app/my-app
```

The next time your App on Fly deploys, it will be able to connect to your private Tailscale network.

> **Note:**
>
> If you are using an Alpine base image and an existing Fly machine, you may need to update the machine to ensure that it has kernel support for nftables. For more information, refer to [Fly community post][xt-flyio-nftables] and [Tailscale issue #10540][xt-gh-tailscale-issue-10540].

## Remove ephemeral nodes from a tailnet

When an ephemeral node goes offline, it is automatically removed from your tailnet. You can also control ephemeral node removal using the [`tailscale logout`][docs-cli-logout] command to either manually force the removal or incorporate the command into the [`tailscaled`][docs-tailscaled] Tailscale daemon. For more information, refer to [Ephemeral nodes][docs-ephemeral-nodes-faq].

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-ephemeral-nodes-faq]: /docs/features/ephemeral-nodes#faq

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-tailscaled]: /docs/reference/tailscaled

[xt-docker-multi-stage-builds]: https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds

[xt-flyio-nftables]: https://community.fly.io/t/kernel-nftables-support/17669

[xt-flyio]: https://fly.io

[xt-gh-tailscale-issue-10540]: https://github.com/tailscale/tailscale/issues/10540
