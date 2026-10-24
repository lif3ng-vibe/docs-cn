---
title: "Generate a bug report"
description: "Generate a bug report to help troubleshoot issues with your tailnet."
---

Last validated Jan 5, 2026

The Tailscale support team can help troubleshoot certain issues based on diagnostic logs. If you are working
with the support team to troubleshoot an issue, you might be asked to create a bug report. A bug report
is a random indicator that marks a section of the diagnostic logs to give us better visibility into
what is occurring at a specific time, which can help make triage easier.

To generate a bug report, you must be directly using the device—a bug report cannot be generated remotely.

A bug report looks like this:

```shell
BUG-1b7641a16971a9cd75822c0ed8043fee70ae88cf05c52981dc220eb96a5c49a8-20210427151443Z-fbcd4fd3a4b7ad94
```

The bug report identifier shares no personally-identifiable information, and is
unused unless you share the bug report with our team.
You can generate a bug report by using the Tailscale client applications, or the [`bugreport`][docs-cli-bugreport]
command in the [Tailscale CLI][docs-cli].

After you generate a bug report, copy and paste the value that you can then share when you [contact support][co-contact-support-form].

## Generating a bug report by using the client application

#### macOS

There are two ways of sending us information to help resolve an issue.

You can copy a bug report identifier string that the Tailscale support team can use for diagnosing general connectivity issues. To generate a bug report identifier:

1. Select the Tailscale icon in the menu bar.
2. Select **Settings**, **About**, then **Report an Issue**.
3. Copy the bug report identifier string and paste it into your correspondence to the Tailscale support team.

The Tailscale support team might also ask you to generate a configuration report that contains more in-depth information. To generate and export a configuration report:

1. Select the Tailscale icon in the menu bar.
2. Select **Settings**, **About**, then **Report an Issue**.
3. Select the **Export Configuration Report**.
4. After the report generation is complete, the folder where it has been saved will open in the Finder. Copy and paste it into your correspondence to the Tailscale support team.

The configuration report is a `tar.gz` file that includes information gathered by various diagnostic tools on your Mac, such as `netstat`, `ifconfig`, `lsappinfo`, and `systemextensionsctl`. Sharing this report with the support team will speed up the troubleshooting process because it gives them a detailed look at what might be causing the issue.

> **Note:**
>
> Since many Tailscale issues stem from conflicts with other software installed on your Mac, the report also includes a list of installed third-party applications and system/kernel extensions. While the Tailscale support team strives to handle your personal information carefully, it's a good idea to check the configuration report yourself before sending it to ensure you're not accidentally disclosing any sensitive information.

#### Windows

1. Hold the `CTRL` key and right-click the Tailscale icon in the menu bar.
2. Select **Debug** and then select **Bug report**.
3. Select **Copy report ID** to copy the bug report and paste it into your correspondence to the Tailscale support team.

#### Android

1. Select **Bug report** from the application menu.
2. Tap on the clipboard icon to copy the bug report ID and paste it into your correspondence to the Tailscale support team.

#### iOS

1. Tap on **Bug Report** in the Settings menu of the app.
2. Tap on the clipboard icon to copy the bug report ID and paste it into your correspondence to the Tailscale support team.

#### tvOS

1. Scroll down the home screen of the app, and select **About Tailscale for tvOS**.
2. Select **Report an Issue**.
3. Record the bug report identifier or scan the QR code using your phone and paste it into your correspondence to the Tailscale support team.

## Generating a bug report by using the CLI

The [Tailscale CLI][docs-cli] is supported only for Linux (including Synology and QNAP), macOS, and Windows.

Run the [`bugreport`][docs-cli-bugreport] command:

```shell
tailscale bugreport
```

If you are using macOS and you haven't [set your system path][docs-cli-macos-using-the-cli] to include the Tailscale command executable,
you need to specify the path to `tailscale`. For example:

```shell
/Applications/Tailscale.app/Contents/MacOS/Tailscale bugreport
```

You can use the following flags with the `bugreport` command:

* `--diagnose` Prints additional verbose information about the system to the
  Tailscale logs after generating a bug report identifier, which can then be
  viewed by our support team. Defaults to false.
* `--record` Pause and then write another bug report. Use this flag to create an initial bug report identifier. During the pause,
  perform the action that reproduces your issue. Then, press Enter to create a second bug report identifier. Share
  both bug identifiers with our team. Defaults to false.

## What is shared in a bug report

The components of the bug report identifier are:

* `BUG` to signal that this is a bug report
* The public key for your device's logs, used by Tailscale support to locate
  the correct logs
* The time that the bug report was created
* A random number, used by Tailscale support to locate the correct location
  within the log

When a bug report is generated, the bug report identifier is written to the
[client logs][docs-log-mesh-traffic-client-logs], along with current health status, the current network
map supplied by the coordination server, and some additional OS-dependent
information that we have found useful to collect when responding to support
requests, such as:

* Windows registry settings relating to the Tailscale application
* Windows page file settings, DLL versions, a list of installed security
  applications, and network interface information
* Some additional details about internal state are also recorded if the bug
  report is generated using the CLI with the `--diagnose` option.

The bug report details are recorded in the [client logs][docs-log-mesh-traffic-client-logs]. You can
review exactly what was sent by reading those logs. You can also
[inspect the code][xt-gh-tailscale-opn-localapi] that generates the bug reports in GitHub,
search for `serveBugReport`.

If [client logging is disabled][docs-log-mesh-traffic-opt-out] then bug reports are not generated
even when using the `tailscale bugreport` command and nothing is sent to
Tailscale.

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[docs-cli-macos-using-the-cli]: /docs/reference/tailscale-cli?tab=macos#using-the-tailscale-cli

[docs-cli-bugreport]: /docs/reference/tailscale-cli#bugreport

[docs-cli]: /docs/reference/tailscale-cli

[docs-log-mesh-traffic-client-logs]: /docs/features/logging#client-logs

[docs-log-mesh-traffic-opt-out]: /docs/features/logging#opt-out-of-client-logging

[xt-gh-tailscale-opn-localapi]: https://github.com/tailscale/tailscale/blob/main/ipn/localapi/localapi.go
