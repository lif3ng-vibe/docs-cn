---
title: "Connect devices outside your tailnet"
description: "Connect devices that are not in your tailnet to your Aperture gateway using an Aperture CLI bridge or ts-unplug."
---

Last validated Sep 29, 2026

An Aperture gateway resides in a [tailnet][docs-tailnet], and devices in that tailnet can reach it directly. But not every device that needs LLM access can join the tailnet. CI/CD runners, contractor machines, personal devices, and devices in a different tailnet can all connect to Aperture through an embedded Tailscale device that joins your tailnet and proxies local traffic to Aperture. The device does not need Tailscale installed.

There are two ways to do this:

* **[An Aperture CLI bridge][ar-connect-bridge]** (recommended). The Aperture CLI creates the embedded node for you and launches your coding agent already pointed at it. Use this for interactive coding sessions.
* **[`ts-unplug`][ar-connect-ts-unplug]**. A standalone proxy from the [ts-plug repository][xt-gh-ts-plug] that listens on a local port you choose. Use this when you need a fixed local endpoint for tools the Aperture CLI does not launch, such as scripts, CI jobs, or custom API clients.

Both methods authenticate requests using the embedded node's Tailscale identity, not a shared API key. If each person runs their own instance, Aperture attributes activity to individual users.

> **Note:**
>
> `ts-unplug` is also referred to as bridge mode or standalone mode. Despite the name, bridge mode is the `ts-unplug` workflow, not the Aperture CLI bridge feature.

## Use cases

Connect from outside the tailnet when devices cannot or should not join your tailnet directly.

* **CI/CD runners**: Ephemeral environments like GitHub Actions runners that need LLM access during builds. Use an [auth key][docs-auth-keys] to skip interactive approval.
* **Contractor or vendor machines**: External collaborators who need Aperture access without joining your organization's tailnet.
* **Personal devices**: Team members who prefer not to install Tailscale on personal hardware.
* **Cross-tailnet access**: Devices in a different tailnet that need to reach your Aperture gateway.

For devices that are already in your tailnet, connecting directly requires fewer steps and provides the same per-user identity. Refer to [set up LLM clients][docs-use-your-tools] for connection instructions.

## Connect using an Aperture CLI bridge

A bridge is an embedded Tailscale node that runs inside the Aperture CLI. When you activate a bridge endpoint, the Aperture CLI joins your tailnet, opens a local proxy, and configures the coding agent it launches to use that proxy.

### Prerequisites

Before you begin, confirm you have the following:

* **The Aperture CLI.** Refer to [install the Aperture CLI][docs-aperture-cli-install].
* **The URL of your Aperture gateway.** By default, this is `http://<aperture-hostname>.<tailnet-name>.ts.net`. Find your tailnet DNS name in the [DNS](https://console.tailscale.com/admin/dns) page of the admin console.
* **Permission to approve devices.** You must be an [Owner, Admin, or Network admin](/docs/reference/user-roles) to approve the bridge node in the admin console, unless you use an [auth key][docs-auth-keys] to authenticate automatically.

### Step 1: Create a bridge

1. Run `aperture`, then press `s` to open settings.

2. Select **Bridges**, press `a`, and enter a name for the bridge, such as `ci-runner`.

### Step 2: Assign the bridge to an endpoint

1. Return to the settings menu and select **Aperture Endpoints**.

2. Press `a`, select **Bridge**, and choose the bridge you created. The Aperture CLI starts connecting through it to `http://ai`.

   If your gateway uses a different URL, type it on the connection screen and press `Enter`. If the default URL has already connected, return to **Aperture Endpoints**, select the connection, and select **Change URL**.

### Step 3: Activate the endpoint

1. Complete the connection started when you selected the bridge.

   The first activation opens a Tailscale authentication URL in your browser and displays it at the bottom of the connection screen. If the browser does not open, press `Ctrl+Y` to copy the URL and open it yourself. Authenticate the node, then approve the device in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console for the tailnet hosting Aperture if your tailnet requires device approval.

2. After the connection check passes, select a coding agent from the main menu.

   The Aperture CLI starts the agent with the bridge proxy as its base URL.

For more detail on how bridges work, refer to [bridges][docs-aperture-cli-bridges].

## Connect using ts-unplug

`ts-unplug` creates a lightweight tailnet node and opens a local port that forwards traffic to Aperture. Unlike an Aperture CLI bridge, the port is one you choose and stays fixed, so any tool on the device can use it as a base URL.

> **Note:**
>
> The `ts-plug` and `ts-unplug` tools are under active development. Refer to the [ts-plug repository][xt-gh-ts-plug] for the latest status and release information.

### Prerequisites

Before you begin, confirm you have the following:

* **Go toolchain.** `ts-unplug` is built from source. Install [Go][xt-go-install] 1.21 or later.
* **Git.** Required to clone the [ts-plug repository][xt-gh-ts-plug].
* **The FQDN of your Aperture gateway.** By default, this is `<aperture-hostname>.<tailnet-name>.ts.net`. Find your tailnet DNS name in the [DNS](https://console.tailscale.com/admin/dns) page of the admin console.
* **Permission to approve devices.** You must be an [Owner, Admin, or Network admin](/docs/reference/user-roles) to approve the `ts-unplug` node in the admin console, unless you use an [auth key][docs-auth-keys] to authenticate automatically.

### Step 1: Build ts-unplug

Clone the [ts-plug repository][xt-gh-ts-plug] and build `ts-unplug`:

```shell
git clone https://github.com/tailscale/ts-plug.git
cd ts-plug
make ts-unplug
```

This creates the binary at `./build/ts-unplug`.

### Step 2: Start ts-unplug

Run `ts-unplug` and point it at your Aperture gateway. Replace `<tailnet-name>` with your tailnet DNS name and choose a local port:

```shell
./build/ts-unplug -dir ./state -port 8080 <aperture-hostname>.<tailnet-name>.ts.net
```

On the first run, `ts-unplug` prints a URL to authenticate the new node. Open the URL in a browser to complete authentication.

### Step 3: Approve the device

Approve the new device in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console for the tailnet hosting Aperture.

After approval, `ts-unplug` displays `HTTP proxy listening` and you can access Aperture at `http://localhost:8080`.

### Step 4: Verify the connection

After `ts-unplug` is running, confirm the connection works by sending a test request:

```shell
curl -s http://localhost:8080/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-5-5",
    "max_tokens": 25,
    "messages": [{"role": "user", "content": "respond with: hello"}]
  }'
```

If the request succeeds, open **Sessions** at `http://localhost:8080/sessions` to find the request in your personal history.

## Next steps

* **Configure tools to use the `ts-unplug` proxy**

  After you confirm the connection works, configure your tools to use `http://localhost:<port>` as the base URL for API requests. For tool-specific configuration, refer to [set up LLM clients][docs-use-your-tools] and replace `http://<aperture-hostname>` with `http://localhost:<port>` in any configuration example. Agents launched by the Aperture CLI are configured automatically and need no changes.

* **Manage your instances**

  Stop the proxy when it's not in use, remove devices from your tailnet when they're no longer needed, and run multiple `ts-unplug` instances with separate state directories if multiple users need access. To remove a bridge, refer to [delete a bridge][docs-aperture-cli-bridge-delete].

## Limitations

The following limitations apply to these connection methods:

* The Aperture CLI bridge proxy listens on a random local port and configures the agents the Aperture CLI launches. Use `ts-unplug` when you need a fixed port for other tools.
* `ts-unplug` must be built from source. Pre-built binaries are not available.
* `ts-unplug` listens on `localhost` only. Other devices on the same network cannot access the proxy.
* Each bridge or `ts-unplug` instance creates a separate tailnet node. If you need many instances, consider using [auth keys][docs-auth-keys] with appropriate tags and access control policies.

[ar-connect-bridge]: #connect-using-an-aperture-cli-bridge

[ar-connect-ts-unplug]: #connect-using-ts-unplug

[docs-aperture-cli-bridge-delete]: /docs/aperture/cli#delete-a-bridge

[docs-aperture-cli-bridges]: /docs/aperture/cli#bridges

[docs-aperture-cli-install]: /docs/aperture/cli#install-the-aperture-cli

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-tailnet]: /docs/concepts/tailnet

[docs-use-your-tools]: /docs/aperture/use-your-tools

[xt-gh-ts-plug]: https://github.com/tailscale/ts-plug

[xt-go-install]: https://go.dev/doc/install
