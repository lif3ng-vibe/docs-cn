---
title: "Configuration audit logging"
description: "Configuration audit logs let you identify *who* did *what*, and *when*, in your tailnet. Configuration audit logs record actions that modify a tailnet's configuration, including the type of action, th"
---

Last validated Jan 5, 2026

Configuration audit logs let you identify *who* did *what*, and *when*, in your tailnet. Configuration audit logs record actions that modify a tailnet's configuration, including the type of action, the actor, the target resource, and the time.

You can export logs for long-term storage and/or for security analysis, threat detection, and incident investigation. You can also stream logs to a security information and event management ([SIEM][ln-security-info-event-management]) system.

For changes to the tailnet policy file, the log includes a full diff of the previous and new files.

> **Note:** Configuration audit logs are available for [all plans](https://tailscale.com/pricing).

All [users who have access to the admin console][docs-user-roles] can find configuration audit logs in the [Logs](https://console.tailscale.com/admin/logs) page of the admin console, and can filter these logs to find specific events.

Configuration audit logs are enabled by default for all tailnets, and are available for the most recent 90 days.

## Log structure

Logs include several components:

* **Timestamp**: When the event happened. This is displayed in your browser's local time.
* **Action**: What action happened. For example, approve a device, or modify the tailnet policy file.
* **Actor**: Which user or process completed the action. If the action is made by a user, this value is the user's name. The user's email or GitHub username, as well as their name, is available in the events returned by the API. If the action is made by the Tailscale control plane, this value is the Tailscale service. For a list of actions made by the Tailscale control plane, refer to [Service events][ar-service-events].
* **Target**: Which resource the action applied to. For example, for an action modifying a user's role, the target is the user. For an action approving a device, the target is the device. Where the action is a tailnet-wide configuration, the target is the tailnet.
* **Diff**: The old and the new values provided, if relevant. For example, if you renamed a node's machine name, or updated a list of tags, you will find both the old and new values. For access control policy changes, you'll find a full diff of the previous and updated versions, including non-substantive changes like comments. For re-authenticating a node, you'll find the old node key expiry and the new key expiry.

*（图：The Logs page of the admin console listing example configuration logs.）*

## Enabling configuration audit logging

Configuration audit logs are always enabled for all tailnets and cannot be disabled.

Configuration audit logs are a subset of the logs that Tailscale uses to provide the service, in line with our [privacy policy][co-privacy-policy-collect].

## Accessing configuration audit logs

Configuration audit logs can be accessed in the [Logs](https://console.tailscale.com/admin/logs) page of admin console or by using the API.

### Viewing configuration audit logs in the admin console

All [users who have access to the admin console][docs-user-roles] can access configuration audit logs in the [Logs](https://console.tailscale.com/admin/logs) page of the admin console, and can filter these logs to find specific events.

Logs are shown in the order that events occurred, starting with the most recent.

#### Filtering configuration audit logs

Events in the [Logs](https://console.tailscale.com/admin/logs) page of the admin console can be filtered to more easily find events meeting certain criteria.

Filters can be used on time, action, and actor. Multiple filters can be applied simultaneously to find events meeting all the filtering criteria.

*（图：The 'Action' dropdown expanded with filters. Several example filters have checkmarks.）*

#### Time

Use the **Timeframe** filter to show only logs between two specified dates.

#### Type of action

Use the **Action** filter to show only logs that match the selected actions. For example, you can review all events that include an update to your tailnet policy file.

#### Actor

Use the **Actor** filter to show only logs where actions were taken by the selected users.

### Accessing configuration audit logs using the Tailscale API

You can export configuration audit logs from the Tailscale [API][docs-api]. You need an [API access token][docs-api-authentication] with the `logs:configuration:read` scope to access configuration audit logs.

The response to the `logs` API call is in the form of the `TailnetLogsResponse` struct:

```go
type TailnetLogsResponse struct {
	Version string        `json:"version"`
	Tailnet dbx.TailnetID `json:"tailnetId"`

	Logs []Log `json:"logs"` // Ordered chronologically
}
```

You can use the following query parameters with the API:

* `start`: Required. Start of the timeframe, in [RFC3339][xt-rfc-3339] timestamp format, for the logs to retrieve. For example: `2022-07-20T00:00:00Z`.
* `end`: Required. End of the timeframe, in RFC3339 timestamp format, for the logs to retrieve. For example, `2022-07-21T00:00:00Z`.

`start` and `end` times are inclusive within nanosecond resolution.

This example assumes you have set up the following variables to use for your API call:

* `$ACCESS_TOKEN`: An [API access token][docs-api-authentication] to use when calling the Tailscale API. You can create an API access token in the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.
* `$TAILNET_ID`: The [tailnet ID][docs-tailnet-name-tailnet-id]. You can find your tailnet ID in the [General](https://console.tailscale.com/admin/settings/general) page of the admin console.
* `$START`: The start of the timeframe for the logs to retrieve.
* `$END`: The end of the timeframe for the logs to retrieve.

```shell
export ACCESS_TOKEN=tskey-api-k123456CNTRL-0123456789abcdef
export TAILNET_ID=example.com
export START=2022-07-20T00:00:00Z
export END=2022-07-21T00:00:00Z
```

```shell
curl -u  $ACCESS_TOKEN:  -X GET \
  "https://api.tailscale.com/api/v2/tailnet/{$TAILNET_ID}/logging/configuration?start={$START}&end={$END}"
```

Optionally, use `json_pp` to prettify the JSON output:

```shell
curl -u  $ACCESS_TOKEN: -X GET \
  "https://api.tailscale.com/api/v2/tailnet/{$TAILNET_ID}/logging/configuration?start={$START}&end={$END}" \
  | json_pp
```

The output will look like:

```json
{
	"logs": [
		{
			"action": "UPDATE",
			"actor": {
				"displayName": "Alice Architect",
				"id": "123456CNTRL",
				"loginName": "alice@example.com",
				"type": "USER"
			},
			"deferredAt": "0001-01-01T00:00:00Z",
			"eventGroupID": "12345",
			"eventTime": "2022-07-20T20:13:30.136022207Z",
			"new": "2023-01-14T20:13:30.134350003Z",
			"old": "0001-01-01T00:00:00Z",
			"origin": "NODE",
			"target": {
				"id": "654321CNTRL",
				"name": "node1.yak-bebop.ts.net",
				"property": "KEY_EXPIRY_TIME",
				"type": "NODE"
			},
			"type": "CONFIG"
		},
		{
			"action": "CREATE",
			"actor": {
				"displayName": "Alice Architect",
				"id": "123456CNTRL",
				"loginName": "alice@example.com",
				"type": "USER"
			},
			"deferredAt": "0001-01-01T00:00:00Z",
			"eventGroupID": "23456",
			"eventTime": "2022-07-20T18:40:58.838529518Z",
			"new": {
				"capabilities": ["CONTROL_API_SCOPE_ALL_READ", "CONTROL_API_SCOPE_ALL"],
				"expires": "2022-10-18 18:40:58.653877012 +0000 UTC"
			},
			"origin": "ADMIN_UI",
			"target": {
				"id": "789123CNTRL",
				"name": "Control API key",
				"type": "API_KEY"
			},
			"type": "CONFIG"
		},
		{
			"action": "UPDATE",
			"actor": {
				"displayName": "Bob Builder",
				"id": "987654CNTRL",
				"loginName": "bob@example.com",
				"type": "USER"
			},
			"deferredAt": "0001-01-01T00:00:00Z",
			"eventGroupID": "34567",
			"eventTime": "2022-07-20T22:35:19.590021877Z",
			"new": ["...", "...", "10.0.0.0/24", "10.0.1.0/24"],
			"old": ["...", "..."],
			"origin": "ADMIN_UI",
			"target": {
				"id": "876543CNTRL",
				"name": "bob-workstation.yak-bebop.ts.net",
				"property": "ALLOWED_IPS",
				"type": "NODE"
			},
			"type": "CONFIG"
		}
	],
	"tailnetId": "example.com",
	"version": "1.1"
}
```

Currently, there is no pagination support and no maximum page size for the API. All events in the specified timeframe are returned.

When [multiple events occur for a single operation][ar-multiple-events-single-operation], the actions have the same value for `eventGroupID`.

## Reverting access control policies from audit logs

> **Note:**
>
> This option is not available if you are using [GitOps for Tailscale][docs-gitops-acls].

You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) of a tailnet to revert a [tailnet policy file][docs-tailnet-policy-file] from audit logs.

You can revert your tailnet policy file from a previous date and time.

1. Open the [Configuration logs](https://console.tailscale.com/admin/logs) page of the admin console.

2. Locate and expand the log entry containing the policy file change you want to revert to, then select **Revert to previous version**. In the confirmation dialog, select **Revert**.

   *（图：The policy file change display. Highlighting 'Revert to previous version'.）*

3. Open the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console and verify the policy file was reverted with the expected changes.

## Events

Configuration audit logs include write actions that change the configuration of a tailnet, including changes that a user can make in the admin console or by using the Tailscale API.

Any successfully completed event will create a corresponding log entry.

Events included in configuration audit logs are:

| **Target**              | **Action**                                      | **Description**                                                                                                                                                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tailnet                 | Create tailnet                                  | Tailnet was created.                                                                                                                                                                                                                                                                                                 |
|                         | Update policy file for tailnet                  | [Tailnet policy file][docs-acls] was modified. This includes changes to [tests][docs-policy-syntax-tests], [`tagOwners`][docs-policy-syntax-tag-owners], [autoApprovers][docs-policy-syntax-autoapprovers], and [Tailscale SSH][docs-policy-syntax-ssh] configurations.                                              |
|                         | Update max key duration for tailnet             | [Key expiry][docs-key-expiry] was modified.                                                                                                                                                                                                                                                                          |
|                         | Update DNS configuration for tailnet            | [DNS][docs-dns] configuration was updated. This includes adding global or restricted nameservers (Split DNS) and changes to MagicDNS.                                                                                                                                                                                |
|                         | Enable device approval for tailnet              | [Device approval][docs-device-approval] was enabled.                                                                                                                                                                                                                                                                 |
|                         | Disable device approval for tailnet             | Device approval was disabled.                                                                                                                                                                                                                                                                                        |
|                         | Enable user approval for tailnet                | [User approval][docs-user-approval] was enabled.                                                                                                                                                                                                                                                                     |
|                         | Disable user approval for tailnet               | User approval was disabled.                                                                                                                                                                                                                                                                                          |
|                         | User joined external tailnet                    | A user in your tailnet joined [another tailnet][docs-invite-any-user].                                                                                                                                                                                                                                               |
|                         | User left external tailnet                      | A user in your tailnet left another tailnet.                                                                                                                                                                                                                                                                         |
|                         | Enable MagicDNS for tailnet                     | [MagicDNS][docs-magicdns] was enabled.                                                                                                                                                                                                                                                                               |
|                         | Disable MagicDNS for tailnet                    | MagicDNS was disabled.                                                                                                                                                                                                                                                                                               |
|                         | Enable Mullvad VPN for tailnet                  | [Mullvad Exit Nodes][docs-mullvad-exit-nodes] were enabled.                                                                                                                                                                                                                                                          |
|                         | Disable Mullvad VPN for tailnet                 | Mullvad Exit Nodes were disabled.                                                                                                                                                                                                                                                                                    |
|                         | Enable Taildrop for tailnet                     | [Taildrop][docs-taildrop] was enabled.                                                                                                                                                                                                                                                                               |
|                         | Disable Taildrop for tailnet                    | Taildrop was disabled.                                                                                                                                                                                                                                                                                               |
|                         | Enable services collection for tailnet          | [Services collection][docs-services] was enabled.                                                                                                                                                                                                                                                                    |
|                         | Disable services collection for tailnet         | Services collection was disabled.                                                                                                                                                                                                                                                                                    |
|                         | Enable HTTPS domain for tailnet                 | [HTTPS][docs-enabling-https] was enabled.                                                                                                                                                                                                                                                                            |
|                         | Disable HTTPS domain for tailnet                | HTTPS was disabled.                                                                                                                                                                                                                                                                                                  |
|                         | Update tailnet DNS name                         | [Tailnet DNS name][docs-tailnet-name-tailnet-dns] was changed.                                                                                                                                                                                                                                                       |
|                         | Enable user and group provisioning for tailnet  | [User and group provisioning][docs-user-group-provisioning] was enabled.                                                                                                                                                                                                                                             |
|                         | Disable user and group provisioning for tailnet | User and group provisioning was disabled.                                                                                                                                                                                                                                                                            |
|                         | Update account email for tailnet                | [Account email][docs-contact-preferences-change-email] was updated.                                                                                                                                                                                                                                                  |
|                         | Verify account email for tailnet                | Account email was verified.                                                                                                                                                                                                                                                                                          |
|                         | Update configuration email for tailnet          | [Configuration email][docs-contact-preferences-config-issues-email] was updated.                                                                                                                                                                                                                                     |
|                         | Verify configuration email for tailnet          | Configuration email was verified.                                                                                                                                                                                                                                                                                    |
|                         | Update security email for tailnet               | [Security email][docs-contact-preferences-security-issues-email] was updated.                                                                                                                                                                                                                                        |
|                         | Verify security email for tailnet               | Security email was verified.                                                                                                                                                                                                                                                                                         |
|                         | Join waitlist for feature                       | A waitlist for an [invite only feature][docs-invite-only-feature] was joined.                                                                                                                                                                                                                                        |
|                         | Accept invite for feature                       | An invitation to an invite only feature was accepted.                                                                                                                                                                                                                                                                |
|                         | Create logstream endpoint for tailnet           | A log streaming endpoint was created.                                                                                                                                                                                                                                                                                |
|                         | Update logstream endpoint for tailnet           | A log streaming endpoint destination was updated.                                                                                                                                                                                                                                                                    |
|                         | Delete logstream endpoint for tailnet           | A log streaming endpoint was deleted.                                                                                                                                                                                                                                                                                |
|                         | Enable network flow logging for tailnet         | [Network flow logs][docs-network-flow-logs] were enabled.                                                                                                                                                                                                                                                            |
|                         | Disable network flow logging for tailnet        | Network flow logs were disabled.                                                                                                                                                                                                                                                                                     |
|                         | Enable tailnet lock                             | [Tailnet Lock][docs-tailnet-lock] was enabled.                                                                                                                                                                                                                                                                       |
|                         | Disable tailnet lock                            | Tailnet Lock was disabled.                                                                                                                                                                                                                                                                                           |
|                         | Sign node key for tailnet lock                  | A node's key was signed by a trusted Tailnet Lock key.                                                                                                                                                                                                                                                               |
|                         | Add trusted key to tailnet lock                 | A trusted key was added to Tailnet Lock.                                                                                                                                                                                                                                                                             |
|                         | Remove trusted key from tailnet lock            | A trusted key was removed from Tailnet Lock.                                                                                                                                                                                                                                                                         |
|                         | Update tailnet lock trusted key                 | A trusted Tailnet Lock key was updated.                                                                                                                                                                                                                                                                              |
|                         | Create webhook endpoint                         | A [webhook][docs-webhooks] was created.                                                                                                                                                                                                                                                                              |
|                         | Delete webhook endpoint                         | A webhook was deleted.                                                                                                                                                                                                                                                                                               |
|                         | Update secret for webhook endpoint              | The [secret][docs-webhooks-webhook-secret] for a webhook was updated.                                                                                                                                                                                                                                                |
|                         | Update subscribed events for webhook endpoint   | The set of subscribed [events][docs-webhooks-events] for a webhook was updated.                                                                                                                                                                                                                                      |
|                         | Enable posture identity collection              | Collection of [device posture identifiers][docs-device-identity-collection] (for example, serial numbers) was enabled.                                                                                                                                                                                               |
|                         | Disable posture identity collection             | Collection of device posture identifiers was disabled.                                                                                                                                                                                                                                                               |
|                         | Create posture integration                      | A new [device posture integration][docs-crowdstrike-zta] was added.                                                                                                                                                                                                                                                  |
|                         | Update posture integration                      | A device posture integration was updated.                                                                                                                                                                                                                                                                            |
|                         | Remove posture integration                      | A device posture integration was removed.                                                                                                                                                                                                                                                                            |
| Billing                 | Create billing subscription for tailnet         | Subscription was created.                                                                                                                                                                                                                                                                                            |
|                         | Update billing subscription for tailnet         | Subscription was modified. This includes changes to the [selected plan][co-pricing] and limits. *Note that the log will not include diffs for subscriptions. Information on the current subscription is available on the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console.* |
|                         | Cancel billing subscription for tailnet         | Subscription was canceled.                                                                                                                                                                                                                                                                                           |
|                         | Update billing address for tailnet              | [Billing address][docs-billing-information-name-and-address] was modified. This includes physical address and name.                                                                                                                                                                                                  |
|                         | Update billing email for tailnet                | [Billing email][docs-billing-information-billing-email] was modified.                                                                                                                                                                                                                                                |
|                         | Update billing payment information for tailnet  | [Billing payment information][docs-billing-information] was modified, including payment method and [tax IDs][docs-billing-information-tax-ids].                                                                                                                                                                      |
| User                    | Create user                                     | User joined the tailnet.                                                                                                                                                                                                                                                                                             |
|                         | Invite user to join tailnet                     | User is either sent or resent an [invite][docs-invite-team-members] to join a tailnet.                                                                                                                                                                                                                               |
|                         | Approve user                                    | User [was approved][docs-user-approval].                                                                                                                                                                                                                                                                             |
|                         | Update role for user                            | User's [role][docs-user-roles] was changed.                                                                                                                                                                                                                                                                          |
|                         | Suspend user                                    | User was [suspended][docs-remove-team-members-suspending-users] from the tailnet.                                                                                                                                                                                                                                    |
|                         | Restore user                                    | User was [restored][docs-remove-team-members-restoring-users] to the tailnet.                                                                                                                                                                                                                                        |
|                         | Delete user                                     | User was [deleted][docs-remove-team-members-deleting-users] from the tailnet.                                                                                                                                                                                                                                        |
|                         | Push user                                       | User attributes were updated for a user [provisioned][docs-user-group-provisioning] in a [SCIM-integrated][ln-what-is-scim] identity provider.                                                                                                                                                                       |
| Group                   | Push group                                      | A group was provisioned in a SCIM-integrated identity provider.                                                                                                                                                                                                                                                      |
| Node                    | Create node                                     | Node was added. For tailnets with [device approval][docs-device-approval] enabled, it may not yet be approved.                                                                                                                                                                                                       |
|                         | Log in node                                     | User logged in to or re-authenticated on a node. This includes re-authentication as part of [Tailscale SSH check mode][docs-tailscale-ssh-check-mode].                                                                                                                                                               |
|                         | Approve node                                    | Node was [approved][docs-device-approval].                                                                                                                                                                                                                                                                           |
|                         | Update name for node                            | [Node name][docs-machine-names] updated.                                                                                                                                                                                                                                                                             |
|                         | Enable key expiry for node                      | Node [key expiry][docs-key-expiry] was enabled.                                                                                                                                                                                                                                                                      |
|                         | Disable key expiry for node                     | Node key expiry was disabled.                                                                                                                                                                                                                                                                                        |
|                         | Update key expiry time for node                 | User re-authenticated the node, extending the node key validity, or node key expiry was [temporarily extended][docs-key-expiry-renew-for-expired].                                                                                                                                                                   |
|                         | Expire node key                                 | Node key expired.                                                                                                                                                                                                                                                                                                    |
|                         | Update approved routes for node                 | [Routes][docs-subnets] for this node were manually updated.                                                                                                                                                                                                                                                          |
|                         | Update auto approved routes for node            | Routes for this node were automatically updated based on [auto approvers][docs-policy-syntax-autoapprovers].                                                                                                                                                                                                         |
|                         | Update exit settings for node                   | [Exit node][docs-exit-nodes] advertised by the node updated.                                                                                                                                                                                                                                                         |
|                         | Update tags for node                            | Node [tags][docs-tags] updated.                                                                                                                                                                                                                                                                                      |
|                         | Update device attribute                         | A [device posture attribute][docs-device-posture-custom-via-api] was changed on the node.                                                                                                                                                                                                                            |
|                         | Update node posture identity                    | [Device posture identity][docs-device-identity-collection] for the node was changed.                                                                                                                                                                                                                                 |
|                         | Log out node                                    | User logged out of node.                                                                                                                                                                                                                                                                                             |
|                         | Delete node                                     | Node was deleted.                                                                                                                                                                                                                                                                                                    |
| Admin console           | Log in to admin console                         | [Authorized user][docs-user-roles-permission-matrix] logged in to the admin console.                                                                                                                                                                                                                                 |
|                         | Log out of admin console                        | Authorized user logged out of the admin console.                                                                                                                                                                                                                                                                     |
| login.tailscale.com     | Log in using web interface                      | [Member][docs-user-roles-member] user logged in to the web interface.                                                                                                                                                                                                                                                |
|                         | Log out using web interface                     | Member user logged out of the web interface.                                                                                                                                                                                                                                                                         |
| Invite                  | Create invite for node share                    | Node [share invite][docs-sharing] was created by sharer tailnet. The invite target is the label entered when creating the invite.                                                                                                                                                                                    |
|                         | Accept invite for node share                    | Node share invite was accepted by sharee tailnet.                                                                                                                                                                                                                                                                    |
|                         | Delete invite for node share                    | Node share invite was revoked by sharer tailnet.                                                                                                                                                                                                                                                                     |
| Share                   | Create node share                               | Shared node was added to sharee's tailnet.                                                                                                                                                                                                                                                                           |
|                         | Update node share                               | Shared node was updated. This occurs when a shared node is shared with a sharee who already has the shared node.                                                                                                                                                                                                     |
|                         | Delete node share                               | Shared node was deleted from sharee's tailnet. This could be an action by either the sharer (to revoke access to the shared node) or the sharee (to remove the shared node from their tailnet).                                                                                                                      |
| API                     | Failed request                                  | API call attempted with insufficient permission.                                                                                                                                                                                                                                                                     |
| API key                 | Create API key                                  | [API access token][docs-api] was generated.                                                                                                                                                                                                                                                                          |
|                         | Revoke API key                                  | API access token was revoked.                                                                                                                                                                                                                                                                                        |
|                         | API key expired                                 | API access token expired.                                                                                                                                                                                                                                                                                            |
| Auth key                | Create API key                                  | [Auth key][docs-auth-keys] was generated. This includes tags and if the key is reusable, ephemeral, pre-approved.                                                                                                                                                                                                    |
|                         | Revoke API key                                  | Auth key was revoked.                                                                                                                                                                                                                                                                                                |
|                         | API key expired                                 | Auth key expired.                                                                                                                                                                                                                                                                                                    |
| OAuth client            | Create API key                                  | [OAuth client][docs-oauth-clients] was created.                                                                                                                                                                                                                                                                      |
|                         | Update API key                                  | OAuth client scopes, tags, or description were updated.                                                                                                                                                                                                                                                              |
|                         | Revoke API key                                  | OAuth client was revoked.                                                                                                                                                                                                                                                                                            |
| OIDC federated identity | Create API key                                  | [OIDC federated identity][docs-wif] was created.                                                                                                                                                                                                                                                                     |
|                         | Update API key                                  | OIDC federated identity settings were updated.                                                                                                                                                                                                                                                                       |
|                         | Revoke API key                                  | OIDC federated identity was revoked.                                                                                                                                                                                                                                                                                 |
| OAuth access token      | Create OAuth access token                       | OAuth access token was generated by an OAuth client or OIDC federated identity.                                                                                                                                                                                                                                      |
|                         | Revoke OAuth access token                       | OAuth access token was revoked.                                                                                                                                                                                                                                                                                      |

Note that failed login attempts are not included in Tailscale events—these should be seen in your identity provider logs, not Tailscale logs.

## Multiple events for a single operation

Multiple events that occur as part of the same operation are logged individually. For example, when a user is deleted, there are log entries for deleting each of their nodes and each of their API access tokens, as well as deleting the user themselves. When a node is added to your tailnet, there are log entries for updating the name for a node, creating a node, updating the key expiry time for a node, logging into a node, and if applicable, approving the node.

| **Operation**                  | **Events**                                                                                                                                                                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A user is added to the tailnet | (If user was [sent an invite][docs-invite-team-members]) Invite user to join tailnetCreate user(If [user approval][docs-user-approval] is enabled) Approve user                                                              |
| A user is deleted              | Delete node, for each node Delete user                                                                                                                                                                                       |
| A node is added to the tailnet | Update name for node (name set from blank to node name)Create nodeUpdate key expiry time for node (key expiry set for current time + expiry period)Log in nodeShortly afterwards, if device approval is enabled:Approve node |
| A node is logged out           | Enable key expiry for node (key expiry is enabled)Update key expiry time for node (key expiry is set to the current time)Log out node                                                                                        |
| A node is re-authenticated     | Update key expiry time for nodeLog in node                                                                                                                                                                                   |
| MagicDNS is enabled            | Enable MagicDNS for tailnetUpdate DNS configuration for tailnet                                                                                                                                                              |
| MagicDNS is disabled           | Disable MagicDNS for tailnetUpdate DNS configuration for tailnet                                                                                                                                                             |

## Events for shared nodes

When using [link-based node sharing][docs-sharing], some events are logged in both the sharer and sharee tailnets. Events related to invites are only logged in the sharer tailnet, and events related to the shared node are logged in both the sharer and sharee tailnets.

| **Target** | **Action**                   | **Actor**                    | **Logged by sharer tailnet?** | **Logged by sharee tailnet?** |
| ---------- | ---------------------------- | ---------------------------- | ----------------------------- | ----------------------------- |
| Invite     | Create invite for node share | Sharer admin                 | ✅                             | ❌                             |
|            | Accept invite for node share | Sharee admin                 | ✅                             | ❌                             |
|            | Delete invite for node share | Sharer admin                 | ✅                             | ❌                             |
| Share      | Create node share            | Sharee admin                 | ✅                             | ✅                             |
|            | Update node share            | Sharee admin                 | ✅                             | ✅                             |
|            | Delete node share            | Sharer admin or Sharee admin | ✅                             | ✅                             |

## Service events

The log includes service events, which are actions performed by the Tailscale service, not performed by users directly. Service events include:

| **Target**          | **Action**      | **Actor**                                      | **Description**                                                                                                                    |
| ------------------- | --------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Tailnet             | Suspend user    | Tailscale service: user and group provisioning | User deactivated or unassigned from the Tailscale app for tailnets using [user & group provisioning][docs-user-group-provisioning] |
| Tailnet             | Restore user    | Tailscale service: user and group provisioning | User reactivated or assigned the Tailscale app for tailnets using user & group provisioning                                        |
| Node                | Delete node     | Tailscale service: remove ephemeral node       | Remove inactive [ephemeral node][docs-ephemeral-nodes]                                                                             |
| API key or Auth key | API key expired | Tailscale service: expire API key              | [Expire][docs-api] key after 90 days                                                                                               |

## Events not included

Changes to a tailnet that were initiated by a request to Tailscale's support team are currently not included. This includes:

* Update [identity provider][docs-sso-providers-change]
* Complete identity provider configuration for [Okta][docs-sso-okta-steps] or [OneLogin][docs-sso-onelogin]
* Update [tailnet ID][docs-tailnet-name-tailnet-id]
* Update custom [HTTPS domain][docs-enabling-https]
* Delete tailnet
* Allowlist tailnet for alpha feature

Changes that would have been included if performed by a user, but were instead initiated by a Support request are also not included:

* Update the [tailnet ID][docs-tailnet-name-tailnet-id]
* Update role for user
* Delete user
* Create billing subscription for tailnet
* Update billing subscription for tailnet
* Cancel billing subscription for tailnet
* Update billing address for tailnet
* Update billing email for tailnet
* Update billing payment information for tailnet
* Update key expiry time for node
* Enable device approval for tailnet
* Disable device approval for tailnet

## Configuration audit logs streaming

Log streaming lets you stream network flow logs into a security information and event management ([SIEM][ln-security-info-event-management]) system. For more information, refer to [Log streaming][docs-log-streaming].

## Limitations

* Configuration audit logs only include actions that modify a tailnet's configurations. Read-only actions, such as a user viewing the admin console, are not included.
* Changes to a tailnet that were initiated by Tailscale's support team are not currently included.
* Configuration audit logs only include changes to configuration of a tailnet. Information about connections within a tailnet (data plane audit logs), such as network flow logs, are not included in configuration logs. You can use [Network flow logs][docs-network-flow-logs] to log information about connections with a tailnet.
* Configuration audit logs are available as part of the admin console, exportable using the API, and as a [streaming source][docs-log-streaming] for SIEM systems.
* There is currently no guarantee for a maximum delay between an event taking place and its inclusion in the audit logs. In practice, this occurs within seconds.
* The period of time that configuration logs are stored cannot be configured. Configuration logs are stored for 90 days.
* [Devices with the same node key][docs-troubleshooting-same-ip-address] will appear in logs as the same node target.
* When a user is suspended, the suspension of the user's nodes, API access tokens, and auth keys are not logged.
* When a user is deleted, the deletion of the user's API access tokens and auth keys are not logged.

[ar-multiple-events-single-operation]: #multiple-events-for-a-single-operation

[ar-service-events]: #service-events

[co-pricing]: https://tailscale.com/pricing

[co-privacy-policy-collect]: https://tailscale.com/privacy-policy#the-information-we-collect

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-policy-syntax-ssh]: /docs/reference/syntax/policy-file#ssh

[docs-policy-syntax-tag-owners]: /docs/reference/syntax/policy-file#tag-owners

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#tests

[docs-tags]: /docs/features/tags

[docs-acls]: /docs/features/access-control/acls

[docs-api-authentication]: /docs/reference/tailscale-api#authentication

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-billing-information-billing-email]: /docs/account/billing/modify-billing#change-the-billing-email-address

[docs-billing-information-name-and-address]: /docs/account/billing/modify-billing#change-the-billing-name-and-address

[docs-billing-information-tax-ids]: /docs/account/billing/modify-billing#manage-tax-ids

[docs-billing-information]: /docs/account/billing/modify-billing

[docs-contact-preferences-change-email]: /docs/reference/contact-preferences#setting-the-account-changes-email

[docs-contact-preferences-config-issues-email]: /docs/reference/contact-preferences#setting-the-configuration-issues-email

[docs-contact-preferences-security-issues-email]: /docs/reference/contact-preferences#setting-the-security-issues-email

[docs-crowdstrike-zta]: /docs/integrations/crowdstrike-zta

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-device-identity-collection]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture-custom-via-api]: /docs/features/device-posture/postures-and-attributes#posture-attributes-api

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-gitops-acls]: /docs/gitops

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-invite-only-feature]: /docs/reference/invite-only-feature

[docs-invite-team-members]: /docs/features/sharing/how-to/invite-team-members

[docs-key-expiry-renew-for-expired]: /docs/features/access-control/key-expiry#renewing-keys-for-an-expired-device

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-log-streaming]: /docs/features/logging/log-streaming

[docs-machine-names]: /docs/concepts/machine-names

[docs-magicdns]: /docs/features/magicdns

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes

[docs-network-flow-logs]: /docs/features/logging/network-flow-logs

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-remove-team-members-deleting-users]: /docs/features/sharing/how-to/remove-team-members#deleting-users

[docs-remove-team-members-restoring-users]: /docs/features/sharing/how-to/remove-team-members#restoring-users

[docs-remove-team-members-suspending-users]: /docs/features/sharing/how-to/remove-team-members#suspending-users

[docs-services]: /docs/features/services

[docs-sharing]: /docs/features/sharing

[docs-sso-okta-steps]: /docs/integrations/identity/okta#steps

[docs-sso-onelogin]: /docs/integrations/identity/onelogin

[docs-sso-providers-change]: /docs/integrations/identity#changing-identity-providers

[docs-subnets]: /docs/features/subnet-routers

[docs-taildrop]: /docs/features/taildrop

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailnet-name-tailnet-dns]: /docs/concepts/tailnet-name#tailnet-dns-name

[docs-tailnet-name-tailnet-id]: /docs/concepts/tailnet-name#tailnet-id

[docs-tailscale-ssh-check-mode]: /docs/features/tailscale-ssh#configure-tailscale-ssh-with-check-mode

[docs-tailnet-policy-file]: /docs/reference/glossary#tailnet-policy-file

[docs-troubleshooting-same-ip-address]: /docs/reference/troubleshooting/network-configuration/multiple-devices-same-100-x-ip-address

[docs-user-approval]: /docs/features/access-control/user-approval

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[docs-user-roles-member]: /docs/reference/user-roles#member

[docs-user-roles-permission-matrix]: /docs/reference/user-roles#permission-matrix

[docs-user-roles]: /docs/reference/user-roles

[docs-webhooks-events]: /docs/features/webhooks#events

[docs-webhooks-webhook-secret]: /docs/features/webhooks#webhook-secret

[docs-webhooks]: /docs/features/webhooks

[docs-wif]: /docs/features/workload-identity-federation

[ln-security-info-event-management]: https://tailscale.com/learn/security-information-and-event-management

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim

[xt-rfc-3339]: https://www.rfc-editor.org/rfc/rfc3339.html
