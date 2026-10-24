---
title: "Tailscale on Koyeb"
description: "[Koyeb][xt-koyeb] is a serverless platform for seamlessly deploying AI applications and databases on high-performance infrastructure, including CPUs, GPUs, and Accelerators around the world. You can a"
---

Last validated Jan 5, 2026

[Koyeb][xt-koyeb] is a serverless platform for seamlessly deploying AI applications and databases on high-performance infrastructure, including CPUs, GPUs, and Accelerators around the world.
You can add Tailscale to a Koyeb application to let your Koyeb Services communicate with other devices and services in your tailnet.

## Step 1: Generate an auth key to authenticate your Service on Koyeb

Start by [generating an auth key][docs-auth-keys] to let your Koyeb service join your tailnet.

Open the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console and select **Generate auth key**. It's best practice to use a reusable and pre-authorized [ephemeral key][docs-ephemeral-nodes] for this purpose because it automatically cleans up devices after they shut down.

*（图：Tailscale's auth key generation page）*

> **Note:**

Next, open a terminal and use the following command to create a [Koyeb Secret][xt-koyeb-secret] to securely store the auth key on Koyeb.

```shell
koyeb secrets create TAILSCALE_AUTHKEY -v "tskey-<key>"
```

Pass this Secret using an environment variable to your Koyeb Service to authenticate your application and join your tailnet.

## Step 2: Configure your Dockerfile to install Tailscale

Next, build a [multistage Dockerfile][xt-docker-multi-stage-builds] with two stages:

* The first stage compiles and builds your application code.
* The second stage pulls your application code and Tailscale into a final image that you can deploy to Koyeb.

In your `Dockerfile`:

```docker
FROM alpine:latest as builder
WORKDIR /app
COPY . ./
# This is where you build the application code as well.

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

The Dockerfile specifies the `/app/start.sh` script as the initial process to run. This script starts Tailscale, then runs the application binary. This is where you use the `TAILSCALE_AUTHKEY` variable you defined when you generated an auth key.

Create a new file named `start.sh` in the root directory of your application and add the following content to the file to start Tailscale and launch your app:

```shell
#!/bin/sh
# Start Tailscale
/app/tailscaled --state=/var/lib/tailscale/tailscaled.state --socket=/var/run/tailscale/tailscaled.sock &
/app/tailscale up --ssh --auth-key=${TAILSCALE_AUTHKEY} --hostname=tailscale-on-koyeb

# Start your app
/app/my-app
```

You pass the `--ssh` flag to `/app/tailscale up` to authorize SSH connections to the node. This will let you ensure everything is working as expected and let you connect to the node using SSH from your tailnet. Refer to [Tailscale SSH documentation][docs-tailscale-ssh] for more information.

Save the file. You're ready to deploy.

## Step 3: Deploy your app to Koyeb

To deploy the application on Koyeb, run the following command from your application's root directory. This command creates and deploys a new Koyeb service that connects to your tailnet:

```
koyeb deploy . myapp/main --instance-type small --region was --type worker --archive-builder docker --env TAILSCALE_AUTHKEY=@TAILSCALE_AUTHKEY --privileged
```

Run the following command to use SSH to confirm you can connect to the service:

```shell
tailscale ssh root@tailscale-on-koyeb
```

For more information about Koyeb, the Koyeb CLI, resources, service types, and deployment options, refer to the [Koyeb documentation][xt-koyeb-docs].

## Remove ephemeral nodes from a tailnet

When an ephemeral node goes offline, it is automatically removed from your tailnet. You can also control ephemeral node removal using the [`tailscale logout`][docs-cli-logout] command to either manually force the removal or incorporate the command into the [`tailscaled`][docs-tailscaled] Tailscale daemon. For more information, refer to [Ephemeral nodes][docs-ephemeral-nodes-faq].

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-ephemeral-nodes-faq]: /docs/features/ephemeral-nodes#faq

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-tailscaled]: /docs/reference/tailscaled

[xt-docker-multi-stage-builds]: https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds

[xt-koyeb]: https://www.koyeb.com

[xt-koyeb-docs]: https://www.koyeb.com/docs

[xt-koyeb-secret]: https://www.koyeb.com/docs/reference/secrets
