---
title: "Troubleshoot custom domains with Kubernetes Gateway API and Tailscale"
description: "If your custom domain doesn't resolve correctly, check the following:"
---

Last validated Jan 5, 2026

## DNS resolution fails

If your custom domain doesn't resolve correctly, check the following:

* **Verify split DNS configuration**: Go to the [DNS](https://console.tailscale.com/admin/dns) page of the admin console and confirm that your custom domain is configured correctly with the internal DNS resolver IP address and that **Restrict to search domain** is enabled.
* **Check DNS resolver accessibility**: From a Tailscale device, verify that your internal DNS resolver is accessible. If your DNS resolver is on a different subnet, ensure you have a [subnet router][docs-subnets] configured and advertised.
* **Confirm DNS records exist**: Check that ExternalDNS has created the authoritative DNS record in your DNS resolver. The exact method depends on your DNS provider (for Pi-hole, check the web interface under Local DNS > CNAME Records).
* **Review ExternalDNS logs**: Check for errors that might indicate why DNS records aren't being created:

```shell
kubectl logs -n tailscale deployment/external-dns
```

Common issues include incorrect credentials, connectivity problems to the DNS server, or misconfigured domain filters.

## TLS certificate issues

If you encounter certificate-related errors, try these steps:

* **Check cert-manager logs**: Review logs for certificate provisioning errors:

```shell
kubectl logs -n cert-manager deployment/cert-manager
```

* **Verify ClusterIssuer configuration**: Ensure your ClusterIssuer is properly configured and ready:

```shell
kubectl get clusterissuer
```

The status should show `Ready: True`.

* **Check certificate status**: Verify that the certificate has been issued successfully:

```shell
kubectl get certificate -A
```

Look for the certificate referenced in your Gateway's `certificateRefs`. It should show `Ready: True`.

* **Check certificate Secret**: Ensure the certificate Secret exists in the expected namespace:

```shell
kubectl get secret app-example-com-tls -n tailscale
```

If the Secret is missing, check the Certificate resource's events for errors:

```shell
kubectl describe certificate app-example-com-tls -n tailscale
```

## Gateway not receiving traffic

If the Gateway is not receiving requests from your tailnet, verify the following:

* **Check Tailscale IP assignment**: Confirm the Envoy service has a Tailscale IP address assigned:

```shell
kubectl get svc -n tailscale -l gateway.envoyproxy.io/owning-gateway-name
```

The `EXTERNAL-IP` field should show a Tailscale IP address (typically in the `100.x.x.x` range).

* **Verify LoadBalancer status**: Check that the LoadBalancer service shows as ready:

```shell
kubectl get svc -n tailscale
```

Look for the Envoy Gateway service and ensure it has an external IP assigned.

* **Review ACL policies**: Verify that your Tailscale ACL policies allow traffic between your devices and the Gateway. Check the [Access controls](https://console.tailscale.com/admin/acls) in the admin console and ensure there are rules permitting traffic on ports 443 (and 80 if using HTTP redirect).

* **Check Gateway status**: Verify the Gateway is programmed correctly:

```shell
kubectl describe gateway custom-domain-gateway -n tailscale
```

Look for any error conditions in the status section.

* **Test connectivity from tailnet**: From a device in your tailnet, try connecting directly to the Gateway's Tailscale IP:

```shell
curl https://<gateway-tailscale-ip>
```

If this works but the custom domain doesn't, the issue is likely with DNS resolution rather than Gateway connectivity.

## `HTTPRoute` not working

If your `HTTPRoute` isn't routing traffic correctly:

* **Verify `HTTPRoute` is accepted**: Check the status of your `HTTPRoute`:

```shell
kubectl get httproute -n default app-route -o yaml
```

Look for conditions indicating whether the route was accepted by the Gateway.

* **Check namespace permissions**: If using cross-namespace routing, ensure the `HTTPRoute`'s namespace has the correct labels matching the Gateway's `allowedRoutes` selector.

* **Verify backend service**: Ensure your backend service exists and is ready:

```shell
kubectl get svc app-service -n default
```

Check that pods backing the service are running:

```shell
kubectl get pods -n default -l <service-selector>
```

## ExternalDNS not creating records

If ExternalDNS isn't creating DNS records:

* **Verify Gateway labels**: Ensure your Gateway has the label that ExternalDNS is filtering for:

```shell
kubectl get gateway custom-domain-gateway -n tailscale -o yaml | grep "external-dns"
```

The label should be `external-dns: enabled` (or match whatever filter you configured).

* **Check ExternalDNS configuration**: Verify ExternalDNS is watching the correct sources and domain:

```shell
kubectl get deployment external-dns -n tailscale -o yaml
```

Look for the `--source`, `--domain-filter`, and `--gateway-label-filter` arguments.

* **Review ExternalDNS permissions**: If using RBAC, ensure ExternalDNS has permission to read Gateway and `HTTPRoute` resources:

```shell
kubectl auth can-i list gateways.gateway.networking.k8s.io \
  --as=system:serviceaccount:tailscale:external-dns
```

[docs-subnets]: /docs/features/subnet-routers
