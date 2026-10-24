---
title: "Access PiKVM from anywhere"
description: "Set up Tailscale on PiKVM."
---

Last validated Jan 5, 2026

PiKVM is a Raspberry Pi based KVM (keyboard, video, and mouse) over IP solution. It lets you connect to a computer remotely and use it as if you were in front of it. This guide shows you how to set up Tailscale on PiKVM.

To find out more about PiKVM, visit [`pikvm.org`][xt-pikvm].

> **Note:**
>
> The following related video provides additional context and examples.

[Remotely access any system with a PiKVM and Tailscale (video)](https://www.youtube.com/watch?v=Btqw56DFhro)

## Prerequisites

* A PiKVM device or a Raspberry Pi with PiKVM installed.
  * The PiKVM project [recommends][xt-pikvm-faq] a Pi 4. The Pi 5 provides little to no performance improvement for this use case.
* [A Tailscale account](https://login.tailscale.com/start)-the free [Personal plan][co-pricing] includes all you need to get started.

## Install Tailscale

1. Access your PiKVM through the web interface and open the web terminal.

   *（图：The pikvm web interface. Highlighting the 'Terminal' option.）*

2. Elevate to root.

   ```shell
   # default password is 'root'
   su -
   ```

3. Enable read-write mode.

   ```shell
   rw
   ```

> **Note:**
>
> If you reboot your PiKVM during this process, you will need to re-enable read-write mode.

4. Install the `tailscale-pikvm` package.

   ```shell
   pacman -Sy tailscale-pikvm
   ```

> **Note:**
>
> We recommend the `tailscale-pikvm` package as a result of [this issue][xt-issue2934]

5. Enable and start the Tailscale service.

   ```shell
   systemctl enable --now tailscaled
   ```

6. Log in to Tailscale.

   For more information on the available login options, refer to our [Command Reference][docs-cli-up].

   ```shell
   tailscale up
   ```

7. (Optional) Enable [Tailscale SSH][docs-ssh].

   ```shell
   tailscale set --ssh
   ```

8. Revert to read-only mode.

   ```shell
   ro
   ```

> **Note:**
>
> You might prefer to disable key expiry on your subnet nodes to avoid having to periodically reauthenticate. Refer to [key expiry][docs-key-expiry] for more information about machine keys and how to disable their expiry. If you use [tags][docs-tags], [key expiry is disabled by default][docs-tags-key-expiry].

## Access your PiKVM device

Once you have installed Tailscale on your PiKVM device, you can access it from anywhere using the Tailscale network.

Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and find your PiKVM device.

You can access the web interface by visiting `https://<your-pikvm>.<your-tailnet>.ts.net`. For example, if your PiKVM device is named `pikvm` and your Tailscale network is named `pango-lin`, you would visit `https://pikvm.pango-lin.ts.net`.

### Use Tailscale Serve to access your PiKVM device

You can set up Tailscale Serve to proxy your PiKVM's web interface. This provides a valid TLS certificate for your PiKVM device, preventing your browser from displaying a security warning.

To setup Tailscale Serve, follow the instructions below. You can also find more information on our [Use Tailscale Funnel and Serve][docs-funnel-examples] topic.

> **Note:**
>
> A Tailscale Serve server can only be accessed over your tailnet. It is not accessible from the public internet. Using [Tailscale Funnel][docs-funnel] would open your PiKVM device to the public internet, which is not recommended.

```shell
tailscale serve --bg https+insecure://localhost:443
```

After running the command above, you can access your PiKVM device, as before, by visiting `https://<your-pikvm>.<your-tailnet>.ts.net`. The difference is that the connection is proxied through your Tailscale Serve server, providing a valid TLS certificate for your PiKVM device.

> **Note:**
>
> The first request to your PiKVM device may take a few seconds to complete. This is because Tailscale Serve needs to fetch a valid TLS certificate for your PiKVM device. Subsequent requests will be much faster.

### Use your PiKVM node as an exit node or subnet router

Now that PiKVM is in your tailnet, you can configure it to do other useful things, such as functioning an [exit node][docs-exit-node] or a [subnet router][docs-subnet-router].

[co-pricing]: https://tailscale.com/pricing

[docs-tags-key-expiry]: /docs/features/tags#key-expiry

[docs-tags]: /docs/features/tags

[docs-cli-up]: /docs/reference/tailscale-cli#up

[docs-funnel-examples]: /docs/reference/examples/funnel

[docs-funnel]: /docs/features/tailscale-funnel

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-exit-node]: /docs/features/exit-nodes

[docs-ssh]: /docs/features/tailscale-ssh

[docs-subnet-router]: /docs/features/subnet-routers

[xt-issue2934]: https://github.com/tailscale/tailscale/issues/2934

[xt-pikvm]: https://pikvm.org

[xt-pikvm-faq]: https://docs.pikvm.org/faq/
