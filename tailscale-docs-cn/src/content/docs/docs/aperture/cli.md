---
title: "Aperture CLI"
description: "Use the Aperture CLI to discover, configure, and run coding agents that connect through your Aperture gateway."
---

Last validated Sep 29, 2026

> **Note:** Aperture CLI is currently in alpha.

The Aperture CLI configures and runs coding agents to connect through your [Aperture gateway][docs-aperture]. It handles environment variables, configuration files, and [provider type][ar-provider-type] selection automatically, so you can start a coding session without editing configuration by hand.

## Use cases

The Aperture CLI addresses the following use cases:

* **Quick agent setup**: Launch a coding agent with the correct Aperture configuration in seconds, without manually editing environment variables or configuration files.
* **Multi-agent management**: Switch between the [supported agents][ar-supported-agents] and provider types from a single interface.
* **Bridge access**: Connect to Aperture from devices that do not have the Tailscale daemon installed.
* **Team onboarding**: Give team members a consistent way to connect their coding tools to the shared Aperture gateway.

## Prerequisites

Before you use the Aperture CLI, confirm you have the following:

* An Aperture gateway with at least one [configured provider][docs-set-up-providers].

- Network access to the Aperture gateway URL. Find your gateway details at [aperture.tailscale.com][xt-aperture-setup].

* At least one [supported coding agent][ar-supported-agents] installed on your device. If you don't have one, the Aperture CLI provides install commands for each agent.
* [Go][xt-go-install] v1.26.6 or later installed on the device where you plan to install `aperture-cli`.

## Install the Aperture CLI

You can install the Aperture CLI using `go install` or by building it from the [Aperture repository on GitHub][xt-gh-aperture-cli]. These instructions cover using `go install`.

1. Install the Aperture CLI using `go install`:

   ```shell
   go install github.com/tailscale/aperture-cli/cmd/aperture@latest
   ```

2. Verify the installation by running the Aperture CLI:

   ```shell
   aperture
   ```

   The Aperture CLI attempts to connect, then displays the main menu on success or a setup guide if the connection fails. If you receive a command-not-found error, confirm that your Go bin directory is in your `$PATH`.

## Connect to Aperture

The Aperture CLI connects to your Aperture gateway on startup and verifies your provider configuration.

1. Run the Aperture CLI:

   ```shell
   aperture
   ```

   The Aperture CLI connects to your saved endpoint automatically. If no endpoint is saved, it starts with `http://ai`. To use another URL, run `aperture -endpoint <url>`, or add or select an endpoint under **Settings** > **Aperture Endpoints**.

2. Wait for the connection check to complete.

   The Aperture CLI queries the Aperture gateway for its list of configured providers and their [API compatibility][docs-provider-compatibility]. If the host is unreachable, the setup guide offers options to edit the endpoint URL or retry.

3. After a successful connection, the Aperture CLI displays the main menu with your available coding agents.

   The Aperture CLI saves the connected host to your settings and uses it automatically on the next launch.

### If the connection fails

When the Aperture CLI cannot reach your Aperture endpoint, it shows a setup guide instead of the main menu. For a direct endpoint, the setup guide checks your system Tailscale status:

| Status                                       | What to do                                                                                         |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Tailscale not installed                      | Install Tailscale from [tailscale.com/download][co-download].                                      |
| Tailscale not running                        | Start the Tailscale app or service on your machine.                                                |
| Tailscale not connected                      | Log in with `tailscale up`.                                                                        |
| Tailscale connected but Aperture unreachable | Set up Aperture at [aperture.tailscale.com][xt-aperture-setup], or enter a different Aperture URL. |

From the setup guide you can:

* **Edit endpoint URL** to point the Aperture CLI at a different Aperture gateway.
* **Retry connection** to try the current endpoint again.
* **Connection options** to manage your list of endpoints.

### Manage multiple endpoints

You can configure multiple Aperture gateway URLs and switch between them.

1. From the main menu, press `s` to open settings.

2. Select **Aperture Endpoints**.

3. Add or remove endpoints. To switch endpoints, select an endpoint and then **Connect**. The Aperture CLI uses it on the next startup after the connection succeeds.

To delete an endpoint, highlight it and press `d`. Connect to another endpoint before deleting the active one. Removing the last endpoint that uses a bridge also removes that bridge and prompts for confirmation if its device must be logged out of the tailnet.

## Launch a coding agent

After the Aperture CLI connects to Aperture, select a coding agent and provider type to start a coding session.

### Select an agent

The main menu lists coding agents detected on your device. Use the arrow keys and `Enter` to select an agent, or press its number key.

The `[0] Quick select` shortcut repeats your previous launch when its saved selections remain valid and its endpoint is still active. Press `0`, or highlight the shortcut and press `Enter`, to relaunch it.

If an agent you expect is missing from the list, the Aperture CLI couldn't find its binary. Refer to the [troubleshooting section][ar-agent-binary-not-found] for resolution steps.

### Select a provider type

After selecting an agent, choose a provider type. This determines which API protocol the agent uses to reach models through the Aperture gateway. The CLI shows only [compatible provider types][docs-provider-compatibility].

### Automatic selection

When a provider, back-end, or model menu contains only one option, the Aperture CLI selects it automatically and proceeds to the next step. This behavior does not apply to the root menu, which lists all installed agents regardless of how many provider types each supports.

### What happens at launch

When you select an agent and provider type, the Aperture CLI:

1. Sets the environment variables the agent requires for the selected provider type. Some environment variable values include path suffixes (for example, `/v1` or `/bedrock`) appended to the Aperture host URL.
2. Configures the agent to use Aperture.
3. Appends skip-permissions flags if you've enabled YOLO mode (full-auto mode).
4. Saves your selection as the last-used combination.
5. Hands the full terminal to the coding agent.

When the agent exits, the Aperture CLI re-checks the Aperture connection and returns to the main menu.

## Supported agents

The Aperture CLI lists only provider types that match both the agent and your Aperture configuration. Refer to [Supported providers and clients][docs-provider-compatibility] for provider and client API requirements.

The Aperture CLI calls the Gemini Enterprise Agent Platform provider type **Google Vertex**. Its menus and environment variables use this earlier name.

### Claude Code

[Claude Code][xt-claude-code] is Anthropic's terminal coding agent for Claude models. For setup instructions, refer to [use Claude Code with Aperture][docs-use-claude-code].

* **Binary**: `claude`
* **Provider types**: [Anthropic API][docs-use-anthropic], [AWS Bedrock][docs-use-amazon-bedrock], [Google Vertex][docs-use-geap]
* **Install**: `curl -fsSL https://claude.ai/install.sh | bash`
* **Full-auto flag**: `--dangerously-skip-permissions`

The Aperture CLI sets the following environment variables based on the selected provider type:

| Provider type | Environment variables                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Anthropic API | `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_MODEL` (when you select a model)                                                                                            |
| AWS Bedrock   | `ANTHROPIC_BEDROCK_BASE_URL`, `CLAUDE_CODE_USE_BEDROCK`, `CLAUDE_CODE_SKIP_BEDROCK_AUTH`                                                                                             |
| Google Vertex | `CLOUD_ML_REGION`, `CLAUDE_CODE_USE_VERTEX`, `CLAUDE_CODE_SKIP_VERTEX_AUTH`, `ANTHROPIC_VERTEX_PROJECT_ID`, `ANTHROPIC_VERTEX_BASE_URL`, `ANTHROPIC_MODEL` (when you select a model) |

For the Anthropic API back end, the Aperture CLI sets `ANTHROPIC_AUTH_TOKEN` to `"-"` (a placeholder dash). Aperture handles authentication, so Claude Code does not need a real API key.

For the Google Vertex back end, the Aperture CLI sets `CLOUD_ML_REGION` and `ANTHROPIC_VERTEX_PROJECT_ID` to placeholder values (`_aperture_auto_vertex_region_` and `_aperture_auto_vertex_project_id_`). The Aperture gateway resolves these values to the actual region and project ID at request time.

When you select a specific model, the Aperture CLI sets `ANTHROPIC_MODEL` with the provider prefix stripped (for example, `anthropic/claude-sonnet-5-5` becomes `claude-sonnet-5-5`). This applies to the Anthropic API and Google Vertex back ends.

For the AWS Bedrock back end only, the Aperture CLI also sets model-tier variables (`ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_HAIKU_MODEL`) derived from the provider's model list by matching model names containing "opus", "sonnet", or "haiku". The Aperture CLI does not set these variables for the Anthropic API or Google Vertex back ends.

### Gemini CLI

[Gemini CLI][xt-gemini-cli] is Google's terminal coding agent for Gemini models. It uses native Google APIs, not OpenAI Chat Completions.

* **Binary**: `gemini`
* **Provider types**: [Google Vertex][docs-use-geap], [Gemini API][docs-use-google-gemini]
* **Install**: `npm install -g @google/gemini-cli`
* **Full-auto flag**: `--yolo`

Gemini CLI 0.40 or later requires a custom gateway URL to use HTTPS and a fully qualified domain name. Use your Aperture gateway's full tailnet name, such as `https://<aperture-hostname>.<tailnet-name>.ts.net`, rather than a short name such as `http://ai` or `https://ai`. Set the URL in **Settings** > **Aperture Endpoints** before launch. The Aperture CLI checks these requirements before starting Gemini CLI.

The Aperture CLI sets the following environment variables based on the selected provider type:

| Provider type | Environment variables                                         |
| ------------- | ------------------------------------------------------------- |
| Google Vertex | `GOOGLE_VERTEX_BASE_URL`, `GOOGLE_API_KEY`                    |
| Gemini API    | `GEMINI_API_KEY`, `GEMINI_BASE_URL`, `GOOGLE_GEMINI_BASE_URL` |

For the Gemini API provider type, the Aperture CLI sets both `GEMINI_BASE_URL` and `GOOGLE_GEMINI_BASE_URL` for compatibility across Gemini CLI versions. Gemini CLI 0.40 or later reads `GOOGLE_GEMINI_BASE_URL`. Earlier versions use `GEMINI_BASE_URL`.

For the selected back end, the Aperture CLI sets `GOOGLE_API_KEY` or `GEMINI_API_KEY` to `"not-needed"`. These values are placeholders rather than upstream provider credentials. Aperture handles upstream authentication.

The Aperture CLI also sets `GEMINI_CLI_HOME` to point to its managed configuration directory.

The Aperture CLI writes a persistent settings file at `<config-dir>/aperture/gemini-home/.gemini/settings.json` with the authentication type for the selected provider type. This file persists between sessions. Refer to [persistent state][ar-persistent-state] for `<config-dir>` values by operating system.

### GitHub Copilot

[GitHub Copilot CLI][xt-github-copilot] is GitHub's terminal coding agent.

* **Binary**: `copilot`
* **Provider types**: [OpenAI Compatible][docs-use-openai-compatible-provider], [Anthropic API][docs-use-anthropic]
* **Install**: `npm install -g @github/copilot`

The Aperture CLI sets the following environment variables based on the selected back end:

| Back end                | Environment variables                                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OpenAI Chat Completions | `COPILOT_PROVIDER_TYPE=openai`, `COPILOT_PROVIDER_API_KEY`, `COPILOT_OFFLINE`, `COPILOT_PROVIDER_BASE_URL` (with `/v1` suffix), `COPILOT_PROVIDER_WIRE_API=completions`, `COPILOT_MODEL` (when you select a model) |
| OpenAI Responses        | `COPILOT_PROVIDER_TYPE=openai`, `COPILOT_PROVIDER_API_KEY`, `COPILOT_OFFLINE`, `COPILOT_PROVIDER_BASE_URL` (with `/v1` suffix), `COPILOT_PROVIDER_WIRE_API=responses`, `COPILOT_MODEL` (when you select a model)   |
| Anthropic Messages      | `COPILOT_PROVIDER_TYPE=anthropic`, `COPILOT_PROVIDER_API_KEY`, `COPILOT_OFFLINE`, `COPILOT_PROVIDER_BASE_URL` (no `/v1` suffix), `COPILOT_MODEL` (when you select a model)                                         |

GitHub Copilot supports two provider types (OpenAI Compatible and Anthropic API) with three back-end variants. The OpenAI Compatible provider type offers two wire-API modes: Chat Completions and Responses. The Aperture CLI presents all three back ends as options when a provider supports them.

The Aperture CLI does not pass a full-auto mode flag to GitHub Copilot.

### OpenCode

[OpenCode][xt-opencode] is a terminal coding agent that supports multiple AI providers. For setup instructions, refer to [use OpenCode with Aperture][docs-use-opencode].

* **Binary**: `opencode`
* **Install**: `curl -fsSL https://opencode.ai/install | bash`

The Aperture CLI configures OpenCode to route requests through Aperture for the duration of the session.

The Aperture CLI picks one of six AI SDK back ends automatically based on the provider's compatibility map:

| Provider API            | AI SDK package              |
| ----------------------- | --------------------------- |
| OpenAI Responses        | `@ai-sdk/openai`            |
| Anthropic Messages      | `@ai-sdk/anthropic`         |
| OpenAI Chat             | `@ai-sdk/openai-compatible` |
| Google Vertex (Gemini)  | `@ai-sdk/google-vertex`     |
| Amazon Bedrock Converse | `@ai-sdk/amazon-bedrock`    |
| Google Gemini           | `@ai-sdk/google`            |

For Amazon Bedrock providers, the Aperture CLI also sets placeholder environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`) since Aperture handles authentication upstream.

The CLI has two limitations for OpenCode:

* **Bedrock**: The back end uses the Converse SDK even if a provider advertises only InvokeModel. Enable `bedrock_converse` and select a model that supports Converse.
* **Google Vertex**: The back end uses the Google publisher path. Select a Gemini model, not Google-hosted Anthropic.

The [gateway-generated configuration][docs-gateway-setup] also has model-aware back ends for Claude InvokeModel and Google-hosted Anthropic.

The Aperture CLI does not pass a full-auto mode flag to OpenCode. Select models inside OpenCode.

### OpenAI Codex

[OpenAI Codex][xt-openai-codex] is OpenAI's terminal coding agent. For setup instructions, refer to [use Codex with Aperture][docs-use-codex].

* **Binary**: `codex`
* **Provider types**: [OpenAI Responses][docs-use-openai]
* **Install**: `curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh` on macOS and Linux, or `npm install -g @openai/codex` on Windows
* **Full-auto flag**: `--dangerously-bypass-approvals-and-sandbox`

The Aperture CLI configures Codex for each launch without replacing `CODEX_HOME` or rewriting your existing Codex configuration:

* Passes `--config` overrides that select the `tailscale_aperture_cli` provider and set its `base_url` to the Aperture host with `/v1` appended.
* Sets `APERTURE_CODEX_API_KEY` to `"not-needed"` in the Codex process environment and configures the provider to read that variable.
* Passes your selected model with `--model`.
* When it prepares a temporary model catalog, passes its path with `--config model_catalog_json=...` and removes the catalog after Codex exits.

### Claude Cowork

The Aperture CLI lists [Claude Desktop][docs-use-claude-desktop] as **Claude Cowork**. This setup configures the desktop app's Anthropic Messages inference connection, not every desktop feature. Unlike the CLI agents above, it has no binary in `$PATH`, no environment variables, and no full-auto mode flag.

* **Platform availability**: macOS, Windows (not available on Linux)
* **Install**: The Aperture CLI opens the Claude download page in your browser. Install the app, then return to the Aperture CLI.
* **Configuration**: The Aperture CLI configures Claude Desktop to use the Aperture gateway.
  * On macOS, this uses `defaults write` to set the `com.anthropic.claude` domain.
  * On Windows, this writes to the `HKCU\SOFTWARE\Policies\Claude` registry key.
  * The Aperture CLI writes three settings: `inferenceProvider=gateway`, `inferenceGatewayApiKey=-`, and `inferenceGatewayBaseUrl={url}`.
* **HTTPS requirement**: Claude Desktop requires HTTPS for the gateway URL. The Aperture CLI automatically converts HTTP URLs to HTTPS. The URL must present a certificate your operating system trusts.
* **No provider selection**: This connection uses the Aperture gateway's Anthropic Messages endpoint, not native Bedrock InvokeModel or Converse. The Aperture CLI does not offer back-end or model selection. Select models inside Claude Desktop.

### Pi

The Aperture CLI configures and launches Pi, an extensible terminal coding agent.

* **Binary**: `pi`
* **Provider types**: OpenAI Responses, Anthropic Messages, OpenAI Chat Completions, Google Vertex (Gemini)
* **Install**: `npm install -g --ignore-scripts @earendil-works/pi-coding-agent`

Install Pi, run `aperture`, and select **Pi** from the main menu. Select the provider, back end, and model when prompted. The Aperture CLI generates a temporary provider extension and loads it with `-e`. Your existing Pi settings and session history stay unchanged.

The Google Vertex back end uses Gemini, not Google-hosted Anthropic. Select a Gemini model even if a mixed provider lists Claude models. The launcher does not offer a Bedrock back end. Pi has no tool-confirmation flag for the Aperture CLI's YOLO mode to set.

### Oh My Pi

The Aperture CLI configures and launches Oh My Pi, a fork of the Pi coding agent.

* **Binary**: `omp`
* **Provider types**: OpenAI Responses, Anthropic Messages, OpenAI Chat Completions, Google Vertex (Gemini)
* **Install**: `bun install -g @oh-my-pi/pi-coding-agent`
* **Full-auto flag**: `--auto-approve`

Install Oh My Pi, run `aperture`, and select **Oh My Pi** from the main menu. Select the provider, back end, and model when prompted. The Aperture CLI loads a temporary provider extension with `-e`. Your existing settings and session history stay unchanged.

As with Pi, the Google Vertex back end requires a Gemini model, not Google-hosted Anthropic. The launcher does not offer a Bedrock back end.

### Hermes Agent

The Aperture CLI configures and launches Hermes Agent.

* **Binary**: `hermes`
* **Provider type**: OpenAI Chat Completions
* **Install**: `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`
* **Full-auto flag**: `--yolo`

Install Hermes Agent, run `aperture`, and select **Hermes Agent** from the main menu. Select a compatible provider and model when prompted. The launcher sets the following parameters without replacing your existing Hermes configuration:

| Parameter                | Value                                         |
| ------------------------ | --------------------------------------------- |
| `--provider`             | `custom`                                      |
| `CUSTOM_BASE_URL`        | Aperture host with `/v1` appended             |
| `HERMES_INFERENCE_MODEL` | Selected model ID without the provider prefix |

This launcher uses Chat Completions, not OpenAI Responses or Anthropic Messages. To use those APIs with Hermes, follow the [gateway-generated configuration][docs-gateway-setup] instructions instead.

## Bridges

Bridges let you access Aperture without running the Tailscale daemon (`tailscaled`) on your machine.

### When to use bridges

Use a bridge when:

* Your machine does not have Tailscale installed system-wide.
* You need to connect to Aperture from an environment where you cannot or prefer not to run the Tailscale daemon, such as a CI runner or a container. For an alternative that does not require the Aperture CLI, refer to [connect using ts-unplug][docs-connect-outside-tailnet-ts-unplug].
* You need a separate Tailscale identity for Aperture access.

If you already have Tailscale running and connected, you do not need bridges. Direct endpoints work without any additional setup.

### How bridges work

A bridge gives the Aperture CLI a separate Tailscale identity for reaching an Aperture endpoint. The coding agent connects through the bridge without requiring a system Tailscale connection. The first connection requires Tailscale authentication. The bridge saves its Tailscale state for later connections.

### Create a bridge

1. From the main menu, press `s` to open settings.
2. Select **Bridges**.
3. Press `a` to add a new bridge.
4. Enter a name for the bridge (for example, `work` or `ci-runner`).

The Aperture CLI generates a unique ID for the bridge and saves it to your settings.

### Assign a bridge to an endpoint

After creating a bridge, connect it to an Aperture endpoint:

1. Go to **Settings** > **Aperture Endpoints**.
2. Press `a` to add a new endpoint.
3. Select **Bridge** (instead of **Direct**).
4. Choose the bridge to use. The Aperture CLI starts connecting through it to `http://ai`.
5. If your gateway uses a different URL, type it on the connection screen and press `Enter`. If the default URL has already connected, return to **Aperture Endpoints**, select the connection, and select **Change URL**.

After a successful connection to a custom URL, the endpoint appears in your endpoint list with a label such as `https://ai.example.com via work`.

### Activate a bridge endpoint

To reconnect to a saved bridge endpoint, select it from the Aperture Endpoints list, then select **Connect** or **Reconnect**. The Aperture CLI:

1. Shows a connecting status: `Connecting bridge work to https://ai.example.com ...`
2. Displays bridge connection logs as they arrive.
3. Runs the preflight check against the local proxy once connected.
4. Shows the main menu on success.

The first activation for a new bridge requires Tailscale authentication. The Aperture CLI opens the login URL in your browser and displays it at the bottom of the connection screen. Follow that URL to authorize the node in your [tailnet][docs-tailnet]. Press `Ctrl+Y` to copy the URL if you need to open it yourself.

### Delete a bridge

1. Go to **Settings** > **Bridges**.
2. Use the arrow keys to highlight the bridge to remove.
3. Press `d` to remove it. If the bridge has joined a tailnet, review the confirmation and press `y` to log its device out and discard the saved login.

You cannot delete a bridge from this menu while an endpoint still uses it. Remove the corresponding connection from **Aperture Endpoints** instead. Removing the last connection through a bridge also removes the bridge.

### Connection types

| Endpoint type | Requires Tailscale daemon | How it connects                                                                 |
| ------------- | ------------------------- | ------------------------------------------------------------------------------- |
| Direct        | Yes                       | The agent connects to the Aperture URL through the system Tailscale connection. |
| Bridge        | No                        | The agent connects to the Aperture URL through a bridge.                        |

## Configure settings

Press `s` from the main menu to open the settings screen.

### Manage bridges

Add and remove bridges for connecting to Aperture without the system Tailscale daemon. For details on when to use them, refer to [bridges][ar-bridges].

1. Select **Bridges** from the settings menu.
2. Press `a` to add a new bridge and enter a name.
3. To delete an unused bridge, highlight it and press `d`. Confirm the logout if prompted.

### Manage Aperture endpoints

Add and remove Aperture gateway URLs. The active endpoint is the host the Aperture CLI connects to on startup.

1. Select **Aperture Endpoints** from the settings menu.
2. Press `a` to add a new endpoint. Choose **Direct** to enter a URL directly, or **Bridge** to connect without the system Tailscale daemon.
3. To switch to a different endpoint, select it from the list, then select **Connect**.
4. To delete an endpoint, highlight it and press `d`. You must connect to another endpoint before removing the active one. Removing the last connection through a bridge also removes the bridge, with confirmation if its device must be logged out.

### YOLO mode

YOLO mode appends skip-permissions flags when launching agents. When enabled, agents run without asking for confirmation before executing commands or making changes.

The following agents support YOLO mode flags:

| Agent        | Flag                                         |
| ------------ | -------------------------------------------- |
| Claude Code  | `--dangerously-skip-permissions`             |
| Gemini CLI   | `--yolo`                                     |
| OpenAI Codex | `--dangerously-bypass-approvals-and-sandbox` |
| Oh My Pi     | `--auto-approve`                             |
| Hermes Agent | `--yolo`                                     |

The Aperture CLI does not set YOLO mode flags for Pi, OpenCode, GitHub Copilot, or Claude Cowork.

To toggle YOLO mode:

1. Select **YOLO mode** from the settings menu.
2. Toggle the setting on or off.

The setting persists across sessions.

> **Warning:**
>
> YOLO mode grants agents broad permissions to execute commands and modify files without confirmation.

### Install and uninstall agents

To install a coding agent:

1. Press `i` from the main menu.
2. Select the agent to install.
3. Review the install command and press `y` to run it in the current terminal.
4. When installation finishes, the Aperture CLI checks for the agent binary and refreshes the menu. For Claude Cowork, complete the desktop installation from the download page that opens in your browser.

To uninstall an agent:

1. Open settings and select **Uninstall**.
2. Select the agent to remove.
3. Confirm with `y`.

The uninstall action depends on the agent:

| Agent          | Uninstall action                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| Claude Code    | Removes `~/.local/bin/claude` and `~/.local/share/claude`.                                                        |
| Gemini CLI     | Runs `npm uninstall -g @google/gemini-cli`.                                                                       |
| GitHub Copilot | Runs `npm uninstall -g @github/copilot`.                                                                          |
| OpenCode       | Runs `opencode uninstall --force` and removes `~/.opencode/bin`.                                                  |
| OpenAI Codex   | On macOS and Linux, removes a detected standalone installation. Otherwise, runs `npm uninstall -g @openai/codex`. |
| Claude Cowork  | Prompts you to uninstall Claude through your operating system's app manager.                                      |
| Pi             | Runs `npm uninstall -g @earendil-works/pi-coding-agent`.                                                          |
| Oh My Pi       | Runs `bun uninstall -g @oh-my-pi/pi-coding-agent`.                                                                |
| Hermes Agent   | Runs `hermes uninstall --yes`.                                                                                    |

## Keyboard shortcuts

The following keyboard shortcuts are available in the Aperture CLI:

| Key                       | Action                                                   |
| ------------------------- | -------------------------------------------------------- |
| `Up`/`Down` or `j`/`k`    | Move cursor                                              |
| `Left`/`Right` or `h`/`l` | Move between columns (in two-column layout)              |
| `Enter` or number key     | Select item                                              |
| `s`                       | Open settings (from the main menu)                       |
| `i`                       | Install agents (from the main menu)                      |
| `a`                       | Add an endpoint or bridge (in the corresponding menu)    |
| `d`                       | Delete an endpoint or bridge (in the corresponding menu) |
| `y`/`n`                   | Confirm or cancel (in confirmation prompts)              |
| `Esc`                     | Go back                                                  |
| `q`                       | Quit from the main menu, or go back from a sub-menu      |
| `Ctrl+C`                  | Quit from any screen                                     |
| `Ctrl+Y`                  | Copy the bridge login URL while it is displayed          |

## Persistent state

The Aperture CLI stores settings and state in the OS default configuration directory under `aperture/`:

* **macOS**: `~/Library/Application Support/aperture/`
* **Linux**: `$XDG_CONFIG_HOME/aperture/` if set, otherwise `~/.config/aperture/`
* **Windows**: `%APPDATA%\aperture\`

| File or directory   | Purpose                                                                    |
| ------------------- | -------------------------------------------------------------------------- |
| `settings.json`     | Aperture endpoint URLs, bridges, and YOLO mode preference                  |
| `launcher.json`     | Last-used agent, provider type, provider ID, and model selection           |
| `bridges/<suffix>/` | Tailscale state for each bridge, with `bridge-` removed from the bridge ID |
| `gemini-home/`      | Managed Gemini configuration, including `.gemini/settings.json`            |

The Aperture CLI creates these files automatically on first use.

The `settings.json` file stores endpoints (with optional `bridgeId` references), bridge definitions, and the YOLO mode setting:

```json
{
  "bridges": [
    {
      "id": "bridge-a1b2c3",
      "name": "work"
    }
  ],
  "endpoints": [
    {
      "url": "https://ai.example.com"
    },
    {
      "url": "https://ai-staging.example.com",
      "bridgeId": "bridge-a1b2c3"
    }
  ],
  "yoloMode": false
}
```

## Limitations

The Aperture CLI has the following limitations:

* **Installation requires Go**: Installing the Aperture CLI with `go install` or building it from source requires Go v1.26.6 or later.
* **Terminal-based interface only**: The Aperture CLI runs in the terminal. There is no graphical interface.
* **No concurrent agents**: You can run one coding agent at a time per Aperture CLI session. To run multiple agents simultaneously, open separate terminal sessions.
* **Claude Cowork not available on Linux**: The Claude Cowork desktop agent is available on macOS and Windows only.
* **No connector management**: Manage connectors and MCP gateway settings in **Administration** > **Connectors** in the [admin dashboard][docs-web-dashboard-admin] or in the [JSON configuration][docs-aperture-configuration]. Refer to [Connectors][docs-aperture-connectors] for setup instructions.

## Troubleshoot the Aperture CLI

If the Aperture CLI doesn't behave as expected, check the following common issues. For general Aperture issues, refer to [troubleshooting Aperture][docs-troubleshooting].

### Aperture host unreachable

If the Aperture CLI can't connect to the Aperture host during the preflight check:

* Verify that your device can reach the Aperture gateway.
* Confirm the host URL is correct.
* Check your network connection, firewall rules, and tailnet policy file rules.

Select **Edit endpoint URL** in the setup guide to try a different URL.

### Agent binary not found

If a coding agent doesn't appear in the main menu:

* Verify the agent binary is installed by running `which <binary-name>` (for example, `which claude`).
* Confirm the binary is in your `$PATH`, or in one of the directories the Aperture CLI checks: `~/.local/bin`, `~/bin`, `~/.npm-global/bin`, or `~/.opencode/bin/` (OpenCode only). The additional directories checked vary by agent. Include system directories such as `/usr/local/bin` or `/opt/homebrew/bin` in your `$PATH` so all agents installed there can be found.
* Press `i` from the main menu to access install commands for each agent.

### No compatible provider types available

If a coding agent appears but offers no provider type options:

* Verify that your Aperture gateway has providers configured with the [API types the agent requires][docs-provider-compatibility].
* Check the **Administration** > **Providers** page of the [Aperture admin dashboard][docs-web-dashboard-admin] to confirm provider configuration.

### Agent exits immediately

If a coding agent launches but exits immediately:

* Run the Aperture CLI with the `-debug` flag to display the environment variables the Aperture CLI sets before launch:

  ```shell
  aperture -debug
  ```

* Check the agent's own logs for error messages.

* Verify the Aperture gateway forwards requests correctly for the selected provider type.

### Gemini CLI host validation fails

Gemini CLI 0.40 or later requires a custom gateway URL to use HTTPS and a fully qualified domain name (FQDN). If the Aperture CLI reports a host validation error when launching Gemini CLI:

* Confirm the Aperture endpoint uses `https://` (not `http://`).
* Use your gateway's full tailnet name (for example, `https://<aperture-hostname>.<tailnet-name>.ts.net`) rather than a short hostname like `ai`.
* Update the endpoint in **Settings** > **Aperture Endpoints**.

The Aperture CLI's Gemini launcher rejects short hostnames and HTTP URLs. Other clients have their own URL requirements, such as Claude Desktop's HTTPS requirement.

### Conflicting environment variables in Claude Code settings

If the Aperture CLI reports conflicting environment variables when launching Claude Code:

* Open `~/.claude/settings.json` and check the `env` section.

* Remove the variables listed in the error message. These can include:

  * `ANTHROPIC_BASE_URL`
  * `ANTHROPIC_MODEL`
  * `ANTHROPIC_AUTH_TOKEN`
  * `ANTHROPIC_BEDROCK_BASE_URL`
  * `CLAUDE_CODE_USE_BEDROCK`
  * `CLAUDE_CODE_SKIP_BEDROCK_AUTH`
  * `CLOUD_ML_REGION`
  * `CLAUDE_CODE_USE_VERTEX`
  * `CLAUDE_CODE_SKIP_VERTEX_AUTH`
  * `ANTHROPIC_VERTEX_PROJECT_ID`
  * `ANTHROPIC_VERTEX_BASE_URL`
  * `ANTHROPIC_DEFAULT_OPUS_MODEL`
  * `ANTHROPIC_DEFAULT_SONNET_MODEL`
  * `ANTHROPIC_DEFAULT_HAIKU_MODEL`
  * `API_TIMEOUT_MS`
  * `ANTHROPIC_API_KEY`

* The Aperture CLI sets these variables for you based on the selected provider type. This check is specific to Claude Code and its `~/.claude/settings.json` file.

### Bridge fails to connect

If the Aperture CLI shows a connecting status for a bridge endpoint and then fails:

* **First-time auth required**: The first time a bridge connects, it needs to authenticate with Tailscale. The Aperture CLI opens the login URL in your browser and displays it at the bottom of the connection screen. If the browser does not open, press `Ctrl+Y` to copy the URL and open it yourself.
* **Bridge not authorized in your tailnet**: Check that the bridge's node has been approved in your Tailscale admin console.
* **Network issues**: The bridge needs outbound internet access to connect to Tailscale.

### Bridge cannot be deleted

If pressing `d` on a bridge shows an error that the bridge is in use by an endpoint:

* Go to **Settings** > **Aperture Endpoints** and delete or reassign the endpoint that references this bridge first, then delete the bridge.

### Quick select not showing

If the main menu does not show the `[0]` quick select option even though you launched an agent before:

* The agent you last used was uninstalled.
* The provider you last used is no longer available from Aperture.
* The model you last used is no longer listed by the provider.
* The back end is no longer compatible with the provider.
* The endpoint used for the previous launch was removed or is no longer active.

The Aperture CLI only shows quick select when it can fully validate the previous launch state. Go through the normal selection flow to create a new launch record.

## Command-line reference

The Aperture CLI accepts the following flags:

| Flag        | Default | Description                                                                                                      |
| ----------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `-version`  | `false` | Print version and exit                                                                                           |
| `-debug`    | `false` | Enable bridge diagnostics and display launch environment variables and arguments                                 |
| `-endpoint` | `""`    | Open the specified Aperture URL instead of the saved endpoint. Uses `APERTURE_ENDPOINT` when the flag is omitted |
| `-bridge`   | `""`    | Connect through the named bridge, creating it if needed. Uses `APERTURE_BRIDGE` when the flag is omitted         |

An explicit `-endpoint` or `-bridge` flag takes precedence over its environment variable, even when the flag value is empty.

If a bridge is specified without an endpoint URL, the Aperture CLI looks for Aperture at `http://ai` through that bridge. Specify both `-bridge` and `-endpoint` to use a different URL.

[ar-agent-binary-not-found]: #agent-binary-not-found

[ar-bridges]: #bridges

[ar-persistent-state]: #persistent-state

[ar-provider-type]: #select-a-provider-type

[ar-supported-agents]: #supported-agents

[co-download]: https://tailscale.com/download

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture]: /docs/aperture

[docs-connect-outside-tailnet-ts-unplug]: /docs/aperture/connect-outside-tailnet#connect-using-ts-unplug

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-tailnet]: /docs/concepts/tailnet

[docs-troubleshooting]: /docs/aperture/troubleshooting

[docs-use-amazon-bedrock]: /docs/aperture/how-to/use-amazon-bedrock

[docs-use-anthropic]: /docs/aperture/how-to/use-anthropic

[docs-use-claude-code]: /docs/aperture/how-to/use-claude-code

[docs-use-claude-desktop]: /docs/aperture/how-to/use-claude-desktop

[docs-use-codex]: /docs/aperture/how-to/use-codex

[docs-use-google-gemini]: /docs/aperture/how-to/use-google-gemini

[docs-use-openai]: /docs/aperture/how-to/use-openai

[docs-use-opencode]: /docs/aperture/how-to/use-opencode

[docs-use-geap]: /docs/aperture/how-to/use-gemini-enterprise-agent-platform

[docs-web-dashboard-admin]: /docs/aperture/reference/dashboard-admin

[xt-aperture-setup]: https://aperture.tailscale.com/

[xt-claude-code]: https://docs.anthropic.com/en/docs/claude-code

[xt-gemini-cli]: https://geminicli.com/

[xt-gh-aperture-cli]: https://github.com/tailscale/aperture-cli

[xt-github-copilot]: https://github.com/github/copilot-cli

[xt-go-install]: https://go.dev/doc/install

[xt-openai-codex]: https://github.com/openai/codex

[xt-opencode]: https://opencode.ai

[docs-gateway-setup]: /docs/aperture/use-your-tools#gateway-generated-configuration

[docs-use-openai-compatible-provider]: /docs/aperture/how-to/use-openai-compatible-provider
