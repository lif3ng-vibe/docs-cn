---
title: "Group visibility on Tailscale clients"
description: "Get group membership information for applications running in your Tailscale network."
---

Last validated Jun 10, 2026

You can configure devices on your Tailscale network (known as a tailnet) to receive group membership information from the Tailscale [control plane][docs-control-data-planes-control-plane]. The group information includes both [groups][docs-policy-file-groups] defined in the tailnet policy file and [groups synchronized][docs-user-group-provisioning] from identity providers by using System for Cross-domain Identity Management (SCIM). Once a Tailscale client has been configured to receive group information, that information is available by using the [Tailscale CLI][docs-tailscale-cli], the [`tsnet`][docs-tsnet] library, and [LocalAPI][xt-go-tailscale-ipn-localapi].

> **Note:** This feature is currently in alpha.

## Requirements

Before you can receive group information in clients, ensure you meet these requirements.

* You can edit your tailnet policy file. You need to be an [Owner, Admin, or Network admin](/docs/reference/user-roles) to edit a tailnet policy file.
* The devices that you want to receive group membership information are running Tailscale v1.97.8 or later.
* (Optional) You can assign a [tag][docs-tags] to devices that need to receive group membership information.

## Use cases

* **Group-specific functionality**

  Applications can use group membership information to enable or disable features without requiring additional user authorization. For example, you can turn on additional features if a user is in a group for beta testers or in a group for a paid plan.

* **Visibility into group usage**

  Applications can log group membership as part of their logs and audit trails. This might be useful for adoption analysis, cost tracking, and incident investigation.

## How it works

Some applications need information based on [Tailscale identity][docs-tailscale-identity] for the connecting user so the application can communicate that information to a user interface (UI) or its own clients. To support this, the Tailscale control plane sends each device the following information if the user has access to the device:

* user name
* user login
* user profile picture URL

By default, the Tailscale control plane does not send group membership information to devices. To enable this, use the node-attr-visible-groups [node attribute][docs-policy-file-node-attributes] as an application capability, apply it to a set of devices, and specify which groups those devices have access to.

An application running on a device that contains the `node-attr-visible-groups` attribute can then retrieve the group membership information from the device by using the [`tsnet`][docs-tsnet] library or [LocalAPI][xt-go-tailscale-ipn-localapi].

## Update your tailnet policy file

Configure your [tailnet policy file][docs-tailnet-policy-file] to update the Tailscale control plane with which devices can receive group information. You need to make the following updates to your tailnet policy file:

* (Optional) Create a tag to identify which devices will have the capability to receive group membership information.
* Create a node attribute to identify which groups will be visible to the devices.

You need to be an [Owner, Admin, or Network admin](/docs/reference/user-roles) to edit a tailnet policy file.

### (Optional) Create a tag

Create a tag so that you can apply the tag to the devices for which you want to receive group information. For purposes of this example, name the tag `prod`.

1. Go to the [Access controls](https://console.tailscale.com/admin/acls/file) page of the admin console.

2. If you don't already have a `tagOwners` field in your tailnet policy file, create it.

   ```json {2-4}
   {
     "tagOwners": {

     },
   }
   ```

3. Within the `tagOwners` field, create a `tag` named `prod` and assign `autogroup:admin` as the tag owner.

   ```json {3}
   {
     "tagOwners": {
        "tag:prod": ["autogroup:admin"],
     },
   }
   ```

   This lets any admin of your tailnet assign the `prod` tag to devices.

### Create the node attribute

Add a [node attribute][docs-policy-file-node-attributes] (`nodeAttrs`) that grants application layer access of the `tailscale.com/visible-groups` capability for devices that you target.

1. Create a `nodeAttr` field.
2. Within the `nodeAttr` field, create a `target` field, and assign its array value. If you created a tag, assign that as the value. Otherwise, assign a set of users, hosts, or IP addresses.
3. Also within the `nodeAttr` field, create an `app` field.
4. Within the `app` field, create a `tailscale.com/visible-groups` field, which is the app capability you are going to assign to your devices.
5. Within the `tailscale.com/visible-groups` field, create a `groups` array and assign it the set of groups that you want to make visible to your devices. The set of groups can be a single wildcard entry \[`"*"`] to make all groups visible, or can be a list of groups.

   > **Note:**
   >
   > The tailnet policy file validation does not check whether any of the groups exist in your tailnet.

Your entry for the node attribute should be similar to:

```json
"nodeAttrs": [
  {
    "target": ["tag:prod"],
	// If not using a tag, use the following format for the target instead:
	// "target": ["my-prod-app", "100.123.123.123", ...],
      "app": {
      "tailscale.com/visible-groups": [
        {
	      // "groups": ["*"] // to match all groups
          "groups": [
            "group:engineering",        # group defined in policy file
            "group:sales@example.com",  # synced group
            "group:support@example.com" # synced group
          ]
        }
      ]
	}
  }
]
```

## Verify group visibility using the Tailscale CLI

On a device that has the `node-attr-visible-groups` node attribute, you can verify group visibility by running the [`tailscale status`][docs-tailscale-cli-status] command:

```shell
tailscale status -json
```

The output contains a `Groups` field that lists a user's group membership:

```json {10-13}
{
  [...]

  "User": {
    "1234567890": {
      "ID": 1234567890,
      "LoginName": "amelie@example.com",
      "DisplayName": "Amelie Pangolin",
      "ProfilePicURL": "https://example.com/a/1122334455",
      "Groups": [
        "group:engineering",
        "group:sales@example.com"
      ]
    },

    [...]
  },

[...]
}
```

## Verify group visibility using tsnet

[`tsnet`][docs-tsnet] is a library that lets you embed Tailscale inside a Go program. You can modify the [Hello tsnet][docs-create-basic-tsnet-app] example to also report group membership.

```go {15}
[...]

log.Fatal(http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
  who, err := lc.WhoIs(r.Context(), r.RemoteAddr)
    if err != nil {
      http.Error(w, err.Error(), 500)
			return
    }
    fmt.Fprintf(w, "<html><body><h1>Hello, world!</h1>\n")
    fmt.Fprintf(w, "<p>You are <b>%s</b> from <b>%s</b> (%s)</p>",
      html.EscapeString(who.UserProfile.LoginName),
	  html.EscapeString(who.UserProfile.LoginName),
      html.EscapeString(firstLabel(who.Node.ComputedName)),
        r.RemoteAddr)
    fmt.Fprintf(w, "<p><strong>Your Groups:</strong> %s</p>", strings.Join(who.UserProfile.Groups, ", "))

[...]
```

[docs-control-data-planes-control-plane]: /docs/concepts/control-data-planes#control-plane

[docs-create-basic-tsnet-app]: /docs/features/tsnet/how-to/create-basic-tsnet-app

[docs-policy-file-groups]: /docs/reference/syntax/policy-file#groups

[docs-policy-file-node-attributes]: /docs/reference/syntax/policy-file#node-attributes

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-cli-status]: /docs/reference/tailscale-cli#status

[docs-tailscale-cli]: /docs/reference/tailscale-cli

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-tsnet]: /docs/features/tsnet

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[xt-go-tailscale-ipn-localapi]: https://pkg.go.dev/tailscale.com/ipn/localapi
