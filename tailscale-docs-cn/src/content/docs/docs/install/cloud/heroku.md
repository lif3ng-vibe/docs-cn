---
title: "Tailscale on Heroku"
description: "Heroku is a popular cloud-hosting platform for running applications without managing servers yourself. However, it can be difficult to use Tailscale on Heroku, since it doesn't provide a /dev/net/tun "
---

Last validated Dec 4, 2025

Heroku is a popular cloud-hosting platform for running applications without managing servers yourself. However, it can be difficult to use Tailscale on Heroku, since it doesn't provide a /dev/net/tun device that Tailscale needs.

You can use Tailscale's [userspace networking mode][docs-userspace-networking] to connect your apps to your Tailscale network.

## Step 1: Generate an auth key to authenticate your Heroku apps

First, we'll generate an [auth key][docs-auth-keys] to allow Heroku to authenticate our app to join our network.

Go to [Keys](https://console.tailscale.com/admin/settings/keys) of the admin console and create an auth key. We recommend using an [ephemeral key][docs-ephemeral-nodes] for this purpose, since it will automatically clean up devices after they shut down.

*（图：Tailscale's auth key generation page）*

> **Note:**

Next, go to your [Heroku app's settings][xt-heroku-apps] and then the configuration variables section. From here, add a new configuration variable named `TAILSCALE_AUTHKEY`, with the `tskey-<key>` value you just created.

*（图：Heroku's configuration variables interface）*

## Step 2: Configure your Dockerfile to install Tailscale

We recommend using a [multistage Dockerfile][xt-docker-multi-stage-builds] where the first stage builds your application, and the second stage pulls application code and Tailscale into the final image to be uploaded to Heroku.

Create a `Dockerfile` at the root of your app. In that `Dockerfile` add something like:

```docker
FROM golang:1.16.2-alpine3.13 as builder
WORKDIR /app
COPY . ./
# This is where one could build the application code as well.

# https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
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
/app/tailscale up --auth-key=${TAILSCALE_AUTHKEY} --hostname=heroku-app
echo Tailscale started
ALL_PROXY=socks5://localhost:1055/ /app/my-app
```

The next time your Heroku app deploys, it will be able to connect to your private Tailscale network.

## Remove ephemeral nodes from a tailnet

When an ephemeral node goes offline, it is automatically removed from your tailnet. You can also control ephemeral node removal using the [`tailscale logout`][docs-cli-logout] command to either manually force the removal or incorporate the command into the [`tailscaled`][docs-tailscaled] Tailscale daemon. For more information, refer to [Ephemeral nodes][docs-ephemeral-nodes-faq].

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-ephemeral-nodes-faq]: /docs/features/ephemeral-nodes#faq

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-tailscaled]: /docs/reference/tailscaled

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-docker-multi-stage-builds]: https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds

[xt-heroku-apps]: https://dashboard.heroku.com/apps
