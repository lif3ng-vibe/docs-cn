---
title: "Let's Encrypt rate limits with the Kubernetes Operator"
description: "The operator provisions TLS certificates from [Let's Encrypt][xt-letsencrypt] for `Ingress` proxies, the API server proxy, and other operator components. Let's Encrypt enforces [rate limits][xt-letsen"
---

Last validated Jul 21, 2026

The operator provisions TLS certificates from [Let's Encrypt][xt-letsencrypt] for `Ingress` proxies, the API server proxy, and other operator components. Let's Encrypt enforces [rate limits][xt-letsencrypt-rate-limit] on certificate issuance, which can start to matter as your deployment grows.

The following [rate limits][xt-letsencrypt-rate-limit] apply:

* **50 certificates per week**: Unique hostnames per tailnet.
* **5 duplicate certificates per week**: Hostnames across different clusters.

Hitting the rate limit doesn't affect existing certificates, but new issuance fails until the limit window passes.

## Avoid the rate limits

The operator supports the following options for making efficient use of certificate issuance.

> **Note:**
>
> If you need more certificates than the limits provide, you can [request a rate limit adjustment][xt-letsencrypt-rate-limit-form] from Let's Encrypt.

### Test with the staging environment

When testing operator deployments, use the Let's Encrypt staging environment so that test certificates don't count against production rate limits. Configure it through a `ProxyClass`:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyClass
metadata:
  name: letsencrypt-staging
spec:
  useLetsEncryptStagingEnvironment: true
```

Clients don't trust certificates issued by the staging environment, so use staging only for testing.

### Use a shared ACME account

Certificate renewals are exempt from rate limits, but only when the renewal comes from the ACME account that issued the previous certificate. By default each proxy has its own ACME account, so recreating a proxy Pod loses the exemption.

Configure the operator to share one ACME account across proxies instead, and renewals keep their exemption across Pod restarts, `ProxyGroup` recreation, and cluster migrations. The operator stores the shared account key in a `Secret` named `tailscale-acme-accounts` in its namespace.

To enable the shared account for all `ProxyGroup` resources, set the following value in the operator's Helm chart:

```yaml
operatorConfig:
  sharedACMEAccountKey: true
```

To control the shared account for an individual `ProxyGroup`, set the `tailscale.com/share-acme-account` annotation. The annotation works with or without the Helm value and takes precedence over it, so you can opt individual `ProxyGroup` resources in without enabling the shared account operator-wide:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: ingress-proxies
  annotations:
    tailscale.com/share-acme-account: "true"
spec:
  type: ingress
```

The operator creates the `tailscale-acme-accounts` `Secret` when the first opted-in `ProxyGroup` reconciles. Proxies populate the account key when they next issue or renew a certificate.

#### Enable on an existing deployment

Enabling the shared account on a running deployment is safe: it doesn't reissue certificates or interrupt traffic. The operator restarts the affected `Ingress` proxy Pods, and each keeps serving its existing certificate across the restart.

Certificates move onto the shared account as they renew on their normal schedule, not all at once. The exemption isn't retroactive, so full rate-limit relief lands once every certificate has renewed at least once under the shared account, which can take up to a certificate lifetime. Enabling it costs no extra rate-limit budget beyond the renewals you'd already spend.

Don't delete certificates to force the migration. That triggers an immediate reissue, spending a rate-limit slot now instead of at the next scheduled renewal, and if you're at the limit, it can fail.

If you're already hitting the rate limit, enable the shared account as soon as possible so the exemption is in place before your renewals come due.

#### Deletion protection

The `tailscale-acme-accounts` `Secret` carries the `tailscale.com/acme-account-protection` finalizer because losing the account key removes the renewal exemption for every certificate in the tailnet. If you delete the `Secret`, it remains in a `Terminating` state and its data stays readable until you remove the finalizer. The operator emits a warning event on the `Secret` while it is in this state.

Kubernetes cannot cancel a deletion. If you delete the `Secret`, back up its data first if you haven't already, then remove the finalizer to let the deletion complete. The operator recreates the `Secret`, and running proxies restore the account key on their next certificate issuance or renewal.

The operator creates the `Secret` rather than the Helm chart, so `helm uninstall` leaves it in place. Keeping it preserves your renewal exemptions if you reinstall the operator. If you want to remove it permanently, remove the finalizer and delete it after uninstalling.

> **Note:**
>
> You can back up the `tailscale-acme-accounts` `Secret` so you can restore the shared account key if it's lost. Losing the key removes the renewal exemption for every certificate in the tailnet, forcing them all to reissue under a new account.

### Roll out large deployments gradually

Nothing exempts *initial* issuance from rate limits: every new hostname needs a brand-new certificate, and each one counts against the 50-certificates-per-week limit. A large deployment that brings many `Ingress` resources online at once, such as installing the operator into a cluster that already has dozens of HTTPS workloads, or a bulk GitOps sync, can exhaust the weekly budget before every certificate is issued. When that happens, the remaining certificates fail to issue until the limit window passes, and those workloads serve no TLS in the meantime.

To stay within the limit, bring HTTPS workloads online in batches rather than all at once. Keep each week's new hostnames under the 50-certificate limit. For example, expose one group of `Ingress` resources, confirm their certificates have issued, then expose the next group the following week.

If you need to bring a large deployment online faster than the limit provides, [request a rate limit adjustment][xt-letsencrypt-rate-limit-form] from Let's Encrypt before you start, and account for the higher limit when planning your batches.

> **Note:**
>
> Enable the [shared ACME account][ar-use-a-shared-acme-account] before you begin a staged rollout. Each certificate then joins the shared account as it's issued, so its future renewals are exempt from the start and don't compete with new issuance for rate-limit budget in later weeks.

## Further exploration

* Expose cluster workloads with [Ingress][docs-ingress].
* Configure [high availability][docs-ha] for `ProxyGroup` resources that share TLS certificates.

[ar-use-a-shared-acme-account]: #use-a-shared-acme-account

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-ingress]: /docs/kubernetes-operator/ingress

[xt-letsencrypt]: https://letsencrypt.org/

[xt-letsencrypt-rate-limit]: https://letsencrypt.org/docs/rate-limits

[xt-letsencrypt-rate-limit-form]: https://isrg.formstack.com/forms/rate_limit_adjustment_request
