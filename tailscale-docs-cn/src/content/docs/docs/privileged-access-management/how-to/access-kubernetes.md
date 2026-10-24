---
title: "Access a Kubernetes cluster using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] gives users identity-based access to Kubernetes clusters without requiring them to manage cluster credentials or maintain and distribute `kubeconfig` files."
---

Last validated Aug 19, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] gives users identity-based access to Kubernetes clusters without requiring them to manage cluster credentials or maintain and distribute `kubeconfig` files.

Users use their [Tailscale identity][docs-tailscale-identity] to access the Kubernetes cluster, and the PAM [connector][docs-pam-connectors] communicates with the Kubernetes API on their behalf. You can use Tailscale PAM [grants][docs-grants] in your tailnet access policy to control what each user or group is allowed to do, including which Kubernetes API operations, namespaces, and resources they can access.

Users can keep working with the Kubernetes tools they already use, including `kubectl`, Lens, K9s, and other Kubernetes clients. They can also use the Tailscale [Border0 web client](https://my.tailscale.com) to interact with the cluster directly from their browser.

## Supported Kubernetes service types

Tailscale PAM supports a few different ways to connect to Kubernetes. Choose the service type that matches where your connector runs and how it reaches the cluster:

* **Kubernetes - Standard**: Use this for a Kubernetes cluster that the connector can already reach and authenticate to. This works with self-managed Kubernetes as well as managed Kubernetes services.
* **Kubernetes - AWS EKS within cluster**: Use this when the PAM connector runs inside the EKS cluster you want to access. If the connector runs inside the cluster, it can use its in-cluster configuration and service account.
* **Kubernetes - AWS EKS outside cluster**: Use this when the PAM connector runs outside the EKS cluster and uses AWS credentials to discover and authenticate to it. If it runs outside the cluster, it needs a network path to the Kubernetes API and credentials that the cluster accepts.

## Prerequisites

Before you begin, make sure you have:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed and online.
* A connector that can communicate with the Kubernetes API for the cluster.
* A Kubernetes identity for the connector with the permissions required for the operations users will do.
* Tailscale installed and signed in on the device you'll use to connect, if you plan to use `kubectl` or another local Kubernetes client.
* A Tailscale PAM [grant][docs-grants] that gives users access to the Kubernetes PAM service.

For an EKS cluster with the connector running outside the cluster, the connector also needs an AWS identity that can discover and authenticate to the EKS cluster.

## Configure Kubernetes permissions for the connector

The PAM connector is what communicates with the Kubernetes API, so it needs enough Kubernetes permissions to do the operations you want users to be able to do.

Tailscale PAM grants sit on top of those permissions. They can narrow what a user or group is allowed to do, but they can't give the connector permissions that Kubernetes itself hasn't granted it.

For example, if you want Tailscale PAM to handle the per-user authorization, you can give the connector a broad `ClusterRole`:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: tailscale-pam-connector
rules:
  - apiGroups: ["*"]
    resources: ["*"]
    verbs: ["*"]
```

Bind the role to the Kubernetes identity used by your Tailscale PAM connector.

This gives the connector broad access to the cluster, while your Tailscale PAM grants determine what individual users and groups can do through the PAM service.

You don't have to give the connector full cluster access. If users only need access to a smaller set of Kubernetes resources, you can give the connector a more restrictive Kubernetes role instead.

## Use Kubernetes impersonation

You can also enable **impersonation** for the Kubernetes PAM service.

Without impersonation, Kubernetes sees requests as coming from the connector's Kubernetes identity, and Tailscale PAM grants provide the per-user authorization.

With impersonation enabled, Tailscale PAM sends the Kubernetes `Impersonate-User` and `Impersonate-Group` headers. This lets Kubernetes apply its own role-based access control (RBAC) rules to the impersonated user and groups, in addition to the access controls you define with Tailscale PAM.

This is useful if you already use Kubernetes RBAC and want to keep those permissions as part of the authorization decision.

The connector's Kubernetes identity needs permission to impersonate users and groups. For example:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: tailscale-pam-impersonator
rules:
  - apiGroups: [""]
    resources:
      - users
      - groups
    verbs:
      - impersonate
```

Bind this `ClusterRole` to the Kubernetes identity used by your PAM connector. You can then use your existing Kubernetes `Role`, `ClusterRole`, `RoleBinding`, and `ClusterRoleBinding` resources to control what impersonated users and groups are allowed to do.

To confirm impersonation is working, run:

```shell
kubectl auth whoami
```

The username should be your Tailscale login name rather than the connector's Kubernetes identity, and the groups should match your tailnet groups.

### Impersonate tailnet groups

The groups that Tailscale PAM impersonates are the connecting user's tailnet groups. These include [groups][docs-policy-file-groups] you define in your tailnet policy file and [groups synchronized][docs-user-group-provisioning] from your identity provider.

The Tailscale control plane does not send group membership to devices by default. To make it available to the connector, add the `tailscale.com/visible-groups` [node attribute][docs-policy-file-node-attributes] to your tailnet policy file and target the devices that run your PAM connectors. For more information, refer to [group visibility on Tailscale clients][docs-group-visibility-clients].

Until you add that node attribute, the connector has no group information and sends only the `Impersonate-User` header.

> **Note:**
>
> Tailscale PAM removes the `group:` prefix before it sends the header. A member of `group:engineering` is impersonated as the Kubernetes group `engineering`, so bind your Kubernetes RBAC to `engineering`.

A tagged device connects with a device identity rather than a user identity, so requests from a tagged device carry no groups.

## Create a Kubernetes PAM service

To create the Kubernetes PAM service:

1. Open the [Services](https://console.tailscale.com/admin/services) page of the admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Choose the appropriate Kubernetes service type:
   * **Kubernetes - Standard**
   * **Kubernetes - AWS EKS within cluster**
   * **Kubernetes - AWS EKS outside cluster**

5. Select **Continue**.

6. Enter a name for the service.

7. (Optional) Enter a description.

8. Choose whether to enable session recording.

9. (Optional) Enable **Enable impersonation** if you want Tailscale PAM to use Kubernetes impersonation.

10. From **Connect via**, select one or more PAM connectors.

    Every connector selected for the service must be able to reach and authenticate to the Kubernetes API.

11. Select **Continue**.

12. How you configure the Kubernetes target depends on the Kubernetes service type you selected.

    #### Kubernetes - Standard

    Use this option when the connector already has Kubernetes configuration for the target cluster.

    For a connector using its current Kubernetes context, configure values for the following:

    * **Configuration source:** Select **System's kubeconfig with current context**.
    * **Target selection strategy:** Select **Kubernetes context**.
    * **Authentication strategy:** Select **Kubernetes context**.

    This tells the connector to use its existing Kubernetes configuration to determine the API server and upstream authentication credentials.

    #### Kubernetes - AWS EKS within cluster

    Use this option when the PAM connector runs as a workload inside the EKS cluster.

    The connector can use Kubernetes's in-cluster configuration and its service account identity to communicate with the Kubernetes API.

    Make sure the connector's service account has the Kubernetes RBAC permissions required for the operations you want users to do.

    If you enable impersonation, also give the connector's service account the required Kubernetes impersonation permissions.

    #### Kubernetes - AWS EKS outside cluster

    Use this option when the PAM connector runs outside the EKS cluster.

    The connector needs:

    * Network connectivity to the EKS Kubernetes API endpoint.
    * An AWS identity that can discover the EKS cluster.
    * Authorization for that AWS identity to access the Kubernetes API.

    The connector's AWS identity needs permission to list and describe EKS clusters. For example:

    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "eks:ListClusters",
            "eks:DescribeCluster"
          ],
          "Resource": "*"
        }
      ]
    }
    ```

    The connector's AWS IAM identity must also be authorized to access the EKS cluster.

    You can use EKS access entries to associate the IAM identity with Kubernetes permissions or Kubernetes RBAC groups.

    For clusters that still use the `aws-auth` `ConfigMap`, you can instead map the connector's IAM role to the appropriate Kubernetes RBAC group.

    The Kubernetes permissions assigned to that identity still determine the maximum access available through the PAM service.

13. When you're finished configuring the Kubernetes target, select **Save**.

The Kubernetes service is ready to proxy requests to the cluster through the connector.

## Grant access to the Kubernetes service

Before users can connect, create a Tailscale PAM grant that gives them access to the Kubernetes service.

For example, an unrestricted Kubernetes permission looks like:

```json
{
  "src": ["*"],
  "dst": ["*"],
  "ip": ["*"],
  "app": {
    "tailscale.com/cap/pam": [
      {
        "version": "v1",
        "permissions": {
          "kubernetes": {}
        }
      }
    ]
  }
}
```

This gives the user access to the Kubernetes operations available through the service. The connector still can't do anything that its Kubernetes identity isn't allowed to do.

> **Warning:**
>
> This is a useful grant for getting started. In production, restrict `src` and `dst` so the grant applies only to the users, groups, devices, and Kubernetes services that need it.

For information about editing grants, refer to [Edit access control policies in your tailnet policy file][docs-manage-tailnet-policies].

### Control what users can do in Kubernetes

You don't have to give users unrestricted Kubernetes access. Tailscale PAM grants can control operations based on:

* Kubernetes verbs, such as `get`, `list`, `create`, or `delete`.
* Namespaces.
* Resource types, such as `pods`, `deployments`, and `services`.
* Resource names.
* Kubernetes API groups.

When you add Kubernetes rules, a request must match at least one rule to be allowed.

For example, the following grant limits access to the `staging` namespace:

```json
{
  "src": ["*"],
  "dst": ["*"],
  "ip": ["*"],
  "app": {
    "tailscale.com/cap/pam": [
      {
        "version": "v1",
        "permissions": {
          "kubernetes": {
            "rules": [
              {
                "api_groups": ["*"],
                "namespaces": ["staging"],
                "verbs": ["*"],
                "resources": ["*"],
                "resource_names": ["*"]
              }
            ]
          }
        }
      }
    ]
  }
}
```

This permits Kubernetes operations only when they match the `staging` namespace rule.

You can make this much more specific. For example, you could let developers `get`, `list`, and `watch` pods and deployments in `staging`, while preventing them from creating or deleting resources.

Tailscale PAM and Kubernetes RBAC work together. The PAM grant must allow the request, and the connector or impersonated Kubernetes identity must also have permission to do it.

For more Kubernetes grant examples and information about fine-grained Kubernetes access controls, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

## Connect to the Kubernetes cluster

Once a user has access, they can keep working with the Kubernetes tools they already use or connect directly from their browser.

1. Open the Tailscale client.
2. Select **Services**.
3. Select the Kubernetes service.
4. Choose **kubectl** or **Web client**.

### Use kubectl and other Kubernetes tools

Select **kubectl** to add the Kubernetes service to your local `kubeconfig`.

Tailscale automatically configures the cluster for you. You can also choose to make it your current Kubernetes context.

Once it's configured, use `kubectl` as you normally would:

```shell
kubectl get pods
```

For example:

```shell
kubectl get deployments -n staging
```

Because the cluster is added to your `kubeconfig`, other Kubernetes tools that use `kubeconfig`, such as Lens or K9s, can use the same configuration.

You don't need separate cluster credentials. Your requests are authorized using your Tailscale identity and the Kubernetes permissions in your PAM grants.

### Connect from the browser

Open the Tailscale PAM [Border0 web client](https://my.tailscale.com) to interact with the Kubernetes cluster directly from your browser.

You don't need to install `kubectl` or configure a local `kubeconfig`.

The same PAM grants apply whether you connect with `kubectl` or the web client, so users can only do the Kubernetes operations their access policy permits.

## Review Kubernetes sessions

Tailscale PAM gives you a central place to review who accessed your Kubernetes services and what happened during each session.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, and select a session that you want to inspect. From there, you can review details such as the Tailscale identity that connected, the originating device, the connection time, and the Kubernetes service that was accessed.

When session recording is enabled, Tailscale PAM also captures the activity that took place during the session.

For Kubernetes API activity, you can review each API call along with its HTTP response code. This gives you a detailed record of how the user interacted with the cluster and how Kubernetes responded.

Interactive activity is recorded as well. For example, if a user starts an interactive `kubectl exec` session in a pod, you can replay the recorded session and review what happened inside the container.

Together, the session details, Kubernetes API activity, and interactive session recordings give you a clear record of:

* Who accessed the cluster.
* What they did.
* What Kubernetes returned.

## Troubleshooting

If you can't connect to a Kubernetes service, start by checking that the PAM connector is online and can reach the Kubernetes API.

Then check that the connector can authenticate to the cluster and that its Kubernetes identity has permission to do the operation you're trying to run.

Also make sure your Tailscale PAM grant permits access to the service. If you've added Kubernetes rules, check that the requested verb, namespace, resource, resource name, and API group match one of those rules.

If impersonation is enabled, verify that:

* The connector's Kubernetes identity can impersonate the required users or groups.
* The impersonated identity has the appropriate Kubernetes `RoleBinding` or `ClusterRoleBinding`.
* Kubernetes RBAC permits the requested action.

If group-based RBAC rules don't apply, run `kubectl auth whoami` and check the groups it reports:

* If it reports no groups, the connector isn't receiving group membership. Confirm that the `tailscale.com/visible-groups` node attribute targets the device that runs the connector, and that it makes the groups you need visible.
* If it reports the groups you expect, check that your Kubernetes RBAC binds to the group name without the `group:` prefix.
* If you connect from a tagged device, requests carry no groups. Connect from a device signed in as a user instead.

If you use the **AWS EKS outside cluster** option, also verify that:

* The configured AWS credentials are valid.
* The connector can list and describe the EKS cluster.
* The connector's AWS IAM identity is authorized to access the EKS Kubernetes API.
* The connector can reach the EKS API endpoint.

If none of the troubleshooting steps mentioned above resolve your issue, review the connector logs and the details for the failed session in the Tailscale PAM [session logs][docs-pam-session-logs]. These can help you tell whether the request was blocked by Tailscale PAM, Kubernetes RBAC, impersonation, authentication, or connectivity.

[docs-grants]: /docs/features/access-control/grants

[docs-group-visibility-clients]: /docs/features/group-visibility-clients

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-policy-file-groups]: /docs/reference/syntax/policy-file#groups

[docs-policy-file-node-attributes]: /docs/reference/syntax/policy-file#node-attributes

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-user-group-provisioning]: /docs/features/user-group-provisioning
