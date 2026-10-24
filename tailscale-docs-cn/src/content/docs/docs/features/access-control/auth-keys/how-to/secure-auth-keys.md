---
title: "Securely handle an auth key"
description: "Tailscale CLI commands such as [`tailscale login`][docs-cli-login] and [`tailscale up`][docs-tailscale-up] let you pass in a [pre-authentication key][docs-auth-keys] (auth key) so you can connect a ne"
---

Last validated Jul 23, 2025

Tailscale CLI commands such as [`tailscale login`][docs-cli-login] and [`tailscale up`][docs-tailscale-up] let you pass in a [pre-authentication key][docs-auth-keys] (auth key) so you can connect a new device without needing to sign in using a web browser. These commands use an `--auth-key` flag to specify the auth key. If you pass in the auth key directly to these commands, the auth key may persist in the shell history file. Any other process with access to the history file could reuse the key to add an unauthorized device to your Tailscale network. One way to mitigate this security risk is to use a [one-off auth key][docs-auth-key-one-off] instead of a [reusable auth key][docs-auth-key-reusable].

If you must use a reusable auth key, pass the auth key into the command by using an environment variable. For example, if you define an environment variable named `TS_AUTH_KEY` and set it to the auth key value, you can make a CLI call without disclosing the auth key:

```shell
tailscale login --auth-key=$TS_AUTH_KEY
```

You don't need to use `TS_AUTH_KEY` as the environment variable name although examples in this topic do.

> **Note:**
>
> Handling of environment variables themselves varies by platform and operating system version. The examples shown are for a recent version of Bash, available on many Linux and macOS systems. If you are not using Bash, consult your platform documentation for ways to use environment variables.

## Create the environment variable

Use the `export` command to create the environment variable.

This example shows how to set an environment variable without passing in the auth key value as an argument, meaning the auth key will not persist in history. When you [generate an auth key][docs-auth-keys-generate], you can copy its value to your clipboard. Once you have the auth key value in your clipboard, you can assign it to an environment variable by using standard input. Set the environment variable to `$(cat)`, and then press `Ctrl+v` (or `Cmd+v` on macOS), followed by `Ctrl+d`:

```shell
# Use standard input to prevent the auth key from appearing in history
export TS_AUTH_KEY=$(cat)
<Ctrl+v><Ctrl+d>
```

If you cannot use the `$(cat)` technique, you can assign the auth key value directly to the environment variable:

```shell
 export TS_AUTH_KEY=<your-auth-key>
```

If your [`HISTCONTROL`][xt-gnu-bash-variables] value includes `ignorespace` or `ignoreboth`, you can insert a space prior to the `export` command to prevent the auth key from appearing in your `history` file:

```shell
# Use a space in front of the command to prevent the command from appearing
# in history output.
 export TS_AUTH_KEY=<your-auth-key>
```

> **Warning:**
>
> Ensure you test the use of `HISTCONTROL` with `ignorespace` or `ignoreboth` on your device before relying on this technique to export your auth key. Specifically, test to ensure that a command that contains a preceding space does not appear in your `history` file.

If your platform or operating system version doesn't support omitting a command from the history file, or if you accidentally pass the auth key to a command, you can manually delete the command from your history. Possible ways include editing `~/.bash_history` or `~/.zsh_history` and then deleting the line that contains the auth key. In some cases you can also run `history` to determine the line number that shows the auth key, then running `history -d <line-number>`. Consult your platform documentation for ways to delete a line in your `history` file.

## Use the environment variable

Pass the environment variable to the command. For example:

```shell
tailscale login --auth-key=$TS_AUTH_KEY
```

## Remove the environment variable

If you no longer want to have the environment variable set to your auth key, run the following command:

```shell
unset TS_AUTH_KEY
```

If you no longer want to keep the auth key itself, you can [revoke the auth key][docs-auth-key-revoke].

[docs-auth-key-one-off]: /docs/features/access-control/auth-keys#authkey-one-off

[docs-auth-key-reusable]: /docs/features/access-control/auth-keys#authkey-reusable

[docs-auth-key-revoke]: /docs/features/access-control/auth-keys#revoke-an-auth-key

[docs-auth-keys-generate]: /docs/features/access-control/auth-keys#generate-an-auth-key

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-login]: /docs/reference/tailscale-cli#login

[docs-tailscale-up]: /docs/reference/tailscale-cli/up

[xt-gnu-bash-variables]: https://www.gnu.org/software/bash/manual/html_node/Bash-Variables.html
