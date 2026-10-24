---
title: "Access your tailnet from CodeSandbox"
description: "Privately access CodeSandbox repositories."
---

Last validated Jan 5, 2026

[CodeSandbox][xt-codesandbox] is an online code editor and IDE for rapid web development.

Tailscale can be installed within a CodeSandbox Repository environment to be able to access private resources securely.
You can develop your application as if it were hosted in the same network as your other services, without
compromising security.

Tailscale works in CodeSandbox Repository environments by adding a container to a Dockerized application setup (for
example, using `docker-compose`). The additional container runs the Tailscale client and provides networking for the other
containers.

## Integration

Follow the [CodeSandbox instructions for getting Tailscale working in a CodeSandbox Repository][xt-codesandbox-tailscale].

You'll need to:

1. Create an [auth key][docs-auth-keys] in the [Keys](https://console.tailscale.com/admin/settings/keys) page of the Tailscale admin console. The [key type][docs-auth-keys-types]
   should be reusable, ephemeral, and pre-authorized. You may also want to make the key type tagged, so your CodeSandbox
   environments are automatically labeled and granted access that is controlled by using [Tailscale access control policies][docs-access-control].

2. Add the auth key as a [CodeSandbox environment variable][xt-codesandbox-secrets], named `TS_AUTHKEY`.

3. Add the [`tailscale/tailscale` Docker image][xt-docker-tailscale] as an additional service beside your application.

## Authorization

Authenticate to Tailscale from your workspace by referencing the `TS_AUTHKEY` environment variable in your Docker tasks
when you start Tailscale. For example:

```shell
docker-compose exec tailscale tailscale up \
  --auth-key=${TS_AUTHKEY} --accept-routes --hostname=csb-${HOSTNAME}
```

\[Missing snippet: visual\_policy\_editor.mdx]

[docs-access-control]: /docs/features/access-control

[docs-auth-keys-types]: /docs/features/access-control/auth-keys#types-of-auth-keys

[docs-auth-keys]: /docs/features/access-control/auth-keys

[xt-codesandbox-secrets]: https://codesandbox.io/docs/learn/environment/secrets

[xt-codesandbox-tailscale]: https://codesandbox.io/docs/learn/integrations/tailscale

[xt-codesandbox]: https://codesandbox.io

[xt-docker-tailscale]: https://hub.docker.com/r/tailscale/tailscale
