---
title: "Localization and geo-specific testing by simulating traffic from different global locations"
description: "Testing localization and geo-specific behavior typically requires deploying infrastructure in multiple regions or relying on third-party proxy services. Both approaches add cost and complexity, and pr"
---

Last validated May 18, 2026

> **Note:**
>
> Featured reference:
>
> [**Exit nodes (route all traffic)**](/docs/features/exit-nodes) — Route all internet traffic through a specific device on your network.

Testing localization and geo-specific behavior typically requires deploying infrastructure in multiple regions or relying on third-party proxy services. Both approaches add cost and complexity, and proxy-based testing often produces unreliable results because commercial proxies share IP ranges that many services flag or block.

Tailscale [exit nodes][docs-exit-nodes] let you route traffic from your test machine through a device in any geographic location in your tailnet. By deploying exit nodes in the regions you need to test, you can simulate real user traffic from those locations. Combined with [Siege][xt-siege], a command-line load testing tool, you can generate realistic traffic patterns to validate localization, geo-routing, and region-specific content delivery.

## Set up exit nodes in target regions

Configure Linux servers in at least two geographic regions (for example, US East and EU West) as exit nodes so your test machine can route traffic through them. Each server needs Tailscale installed and running. Follow the [Install Tailscale on Linux][docs-install-linux] instructions if needed.

1. On each regional server, enable IP forwarding:

   ```bash
   echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
   echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
   sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
   ```

2. Advertise each server as an exit node:

   ```bash
   sudo tailscale set --advertise-exit-node
   ```

3. Approve each exit node in the admin console. This requires [Admin](/docs/reference/user-roles) privileges.
   1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
   2. Find the regional server, select the  button, then select **Set up exit node**.
   3. Select **Use as exit node**, then select **Save**.

4. Verify the exit nodes are available from your test machine:

   ```bash
   tailscale exit-node list
   ```

   You'll find your regional servers in the output.

> **Tip:**
>
> Name your machines descriptively (for example, `exit-us-east` and `exit-eu-west`) so they are easy to identify when switching between regions.

## Grant access to exit nodes

1. Add a [grant][docs-grants] to your [tailnet policy file][docs-tailnet-policy-file] that lets your test machines use the exit nodes. Tag your exit node servers with `tag:exit-node` and grant your test group access:

   ```json
   "tagOwners": {
   "tag:exit-node": ["group:qa"]
   },
   "grants": [
   {
       "src": ["group:qa"],
       "dst": ["tag:exit-node"],
       "app": {
       "tailscale.com/cap/node-exit": [{}]
       }
   }
   ]
   ```

\[Missing snippet: visual\_policy\_editor.mdx]

1. Assign the tag to each exit node server:

   ```bash
   sudo tailscale set --advertise-tags=tag:exit-node
   ```

## Install Siege on your test machine

Install [Siege][xt-siege] on the machine you will use to generate test traffic.

#### Linux

Install Siege with your package manager. On Ubuntu and Debian systems, use `apt`:

```bash
sudo apt install siege
```

#### macOS

Install Siege with Homebrew:

```bash
brew install siege
```

Verify the installation:

```bash
siege --version
```

## Run geo-specific load tests with Siege

With your traffic routed through a regional exit node and Siege installed, generate load against your application to validate its localization behavior.

1. On your test machine, select the exit node for the region you want to test. For example, to route traffic through your US East server:

   ```bash
   sudo tailscale set --exit-node=exit-us-east
   ```

2. Confirm that your traffic is routing through the exit node by checking your public IP address:

   ```bash
   curl -s https://ifconfig.me
   ```

   The output displays the public IP address of the exit node server, not your local machine.

3. Run a basic load test through the US East exit node:

   ```bash
   sudo tailscale set --exit-node=exit-us-east
   siege -c 10 -r 50 -H "Accept-Language: en-US" https://your-app.example.com
   ```

   This sends 50 rounds of requests with 10 concurrent users, each including the `en-US` language header. Your application will serve US-localized content based on the geographic origin of the traffic.

4. To verify that your application returns region-specific content, use Siege in verbose mode and inspect the responses:

   ```bash
   sudo tailscale set --exit-node=exit-eu-west
   siege -c 1 -r 1 -v -H "Accept-Language: de-DE" https://your-app.example.com
   ```

   Check the response headers and content to confirm the application returns the expected localized version.

5. Once you've finished testing, turn off the exit node on your test machine so traffic routes normally:

   ```bash
   sudo tailscale set --exit-node=
   ```

6. Verify your traffic is no longer routed through the exit node:

   ```bash
   curl -s https://ifconfig.me
   ```

   The output displays your local machine's public IP address.

## Test multiple regions sequentially

Create a script that switches exit nodes and runs Siege against each region:

```bash
#!/bin/bash

REGIONS=("exit-us-east" "exit-eu-west")
LANGUAGES=("en-US" "de-DE")
TARGET="https://your-app.example.com"

for i in "${!REGIONS[@]}"; do
  echo "Testing region: ${REGIONS[$i]} with language: ${LANGUAGES[$i]}"
  sudo tailscale set --exit-node="${REGIONS[$i]}"
  sleep 5

  siege -c 10 -r 50 \
    -H "Accept-Language: ${LANGUAGES[$i]}" \
    --log="/tmp/siege-${REGIONS[$i]}.log" \
    "$TARGET"

  echo "Completed: ${REGIONS[$i]}"
done

sudo tailscale set --exit-node=
echo "All region tests complete."
```

The script cycles through regions, sets the exit node, runs Siege using the language for that region, and then turns off the exit node at the end.

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-install-linux]: /docs/install/linux

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-siege]: https://github.com/JoeDog/siege
