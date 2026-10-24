---
title: "Scanning for exposed Tailscale secrets"
description: "Find out how Tailscale partners scan for exposed Tailscale secrets and provide notifications to help prevent fraudulent access."
---

Last validated Jan 5, 2026

Tailscale provides a variety of [keys][docs-key-prefixes] that are used for automation and integration. Treat these keys as secrets and handle them securely. If they are leaked, someone could take harmful action on your Tailscale network (known as a tailnet). To help mitigate accidental disclosure and prevent fraudulent use, Tailscale partners with the following companies to provide secret scanning of source code repositories and other data sources to find leaked Tailscale keys:

* [GitGuardian][xt-gitguardian]
* [GitHub][xt-github]
* [GitLab][xt-gitlab]
* [TruffleHog][xt-trufflesecurity-trufflehog]

This topic describes the scanning performed by these companies, and the actions taken when they believe they have discovered an exposed Tailscale secret.

The types of Tailscale keys that are in scope for secret scanning are:

* [API access tokens][docs-api-authentication] (also known as "API keys")
* [OAuth clients][docs-oauth-clients]
* [Pre-authentication keys][docs-auth-keys] (also known as "auth keys")
* [System for Cross-domain Identity Management (SCIM) keys][ln-what-is-scim]
* [Webhook keys][docs-webhooks-webhook-secret]

If you are notified or otherwise believe that one of your Tailscale keys has been compromised, refer to [Key and secret management][docs-key-secret-management] for recommended actions.

> **Note:** Secret scanning is available for [all plans](https://tailscale.com/pricing).

## GitGuardian

[GitGuardian][xt-gitguardian] scans across your platforms to look for leaked secrets. If it detects a possible Tailscale secret, GitGuardian makes an API call to a Tailscale endpoint to determine whether the secret is an actual active secret. If the secret is active, GitGuardian contacts the user whose data source contains the secret.

The GitGuardian API call to the Tailscale endpoint does not modify your tailnet, it merely checks if a secret is an active Tailscale key.

GitGuardian does not notify Tailscale about any potentially exposed Tailscale secrets that GitGuardian detects.

## GitHub

[GitHub][xt-github] automatically scans all public repositories (including issues, pull requests, comments, and wikis) and all public npm packages. If GitHub finds a Tailscale secret in those sources, GitHub makes an API call to a Tailscale endpoint to determine whether the secret is an active secret. If it is an active secret, Tailscale will revoke the secret and send an email to the [security issues contact][docs-security-contact] for the tailnet to which the leaked secret belongs.

If you have configured GitHub to scan your private repositories and issues and GitHub finds a Tailscale secret in those sources, GitHub makes an API call to a Tailscale endpoint to determine whether the secret is an active secret. If it is an active secret, Tailscale will revoke secret and send an email to the security issues contact for the tailnet to which the leaked secret belongs. Additionally, GitHub will report the leaked secret as an alert on the **Security** tab of the GitHub repository. GitHub's scanning of a private repository's issues includes scanning the titles, descriptions, and comments in open and historical issues.

For more information about GitHub secret scanning, refer to the GitHub [About secret scanning][xt-github-secret-scanning] topic.

## GitLab

[GitLab][xt-gitlab] provides GitLab Secret Detection, which [when enabled][xt-gitlab-secret-detection-enable] scans all text files in your GitLab repository to find leaked secrets. GitLab uses a regular expression (also known as a regex) provided by Tailscale as the scan criteria for leaked secrets. If a secret that is believed to be a Tailscale secret is discovered, GitLab will report the leaked secret in a [GitLab artifact report][xt-gitlab-artifact-report] for the GitLab repository. GitLab does not notify Tailscale about any potentially exposed Tailscale secrets in GitLab repositories. For more information about GitLab secret scanning, refer to the GitLab [Secret Detection][xt-gitlab-secret-detection] topic.

## TruffleHog

[TruffleHog][xt-trufflesecurity-trufflehog] scans across your platforms to look for leaked secrets. If it detects a possible Tailscale secret, TruffleHog makes an API call to a Tailscale endpoint to determine whether the secret is an actual active secret. If the secret is active, TruffleHog contacts the user whose data source contains the secret.

The TruffleHog API call to the Tailscale endpoint does not modify your tailnet, it merely checks if a secret is an active Tailscale key.

When Tailscale receives notice of an exposed secret from TruffleHog, Tailscale does **not** automatically revoke the secret.

[docs-api-authentication]: /docs/reference/tailscale-api#authentication

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-key-prefixes]: /docs/reference/key-prefixes

[docs-key-secret-management]: /docs/reference/key-secret-management

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-webhooks-webhook-secret]: /docs/features/webhooks#webhook-secret

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim

[xt-gitguardian]: https://www.gitguardian.com

[xt-gitlab-artifact-report]: https://docs.gitlab.com/ee/ci/yaml/artifacts_reports.html

[xt-gitlab-secret-detection-enable]: https://docs.gitlab.com/user/application_security/secret_detection/secret_push_protection/#enable-secret-push-protection-in-a-project

[xt-gitlab-secret-detection]: https://docs.gitlab.com/user/application_security/secret_detection/

[xt-gitlab]: https://about.gitlab.com

[xt-trufflesecurity-trufflehog]: https://trufflesecurity.com/trufflehog

[xt-github-secret-scanning]: https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning

[xt-github]: https://github.com

[docs-security-contact]: /docs/reference/contact-preferences#setting-the-security-issues-email
