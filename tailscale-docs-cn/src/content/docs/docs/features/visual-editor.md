---
title: "Visual policy editor"
description: "Update your tailnet policy file with the visual policy editor."
---

Last validated Mar 13, 2026

The visual policy editor is an alternative way to edit the [human JSON (HuJSON)][xt-gh-hujson] syntax of the tailnet policy file with an interactive graphical user interface. You can switch between the visual editor and the JSON editor anytime. Changes you make using the visual editor sync with the JSON editor when you save them.

You can use the visual policy editor for the following tailnet policy file features:

* Access control policies ([grants][docs-grants])
* [Tailscale SSH][docs-tailscale-ssh] access rules
* [Tests][docs-policy-syntax-tests] and [SSH Tests][docs-policy-syntax-tests-ssh]
* [Groups][docs-policy-syntax-groups]
* [Tags][docs-tags]
* [IP sets][docs-policy-syntax-ipsets]
* [Hosts][docs-policy-syntax-hosts]
* [Node attributes][docs-policy-syntax-nodeattrs]
* [Device posture][docs-device-posture-postures]
* [Auto approvers][docs-policy-syntax-autoapprovers]

> **Note:**
>
> To make changes to the [network policy options][docs-policy-syntax-network-options] of the tailnet policy (such as `derpMap`, `disableIPv4`, `OneCGNATRoute`, and `randomizeClientPort`) you must use the JSON editor.

The visual editor translates your configuration choices into the underlying HuJSON policy file format. You can switch between the visual editor and the JSON editor at any time to work with policies in the format that best suits your needs. The bidirectional synchronization ensures that changes in either editor immediately reflect in the other. For a comprehensive understanding of the underlying policy syntax, refer to [Tailscale's policy syntax documentation][docs-policy-syntax].

Go to the [Access controls](https://console.tailscale.com/admin/acls) page of the Tailscale admin console to access the visual editor. The editor displays with the **Visual editor** tab selected by default.

## Editor modes

The visual policy editor supports three distinct operating modes that serve different workflow preferences and requirements. Each mode maintains full compatibility with the underlying [policy file format][docs-policy-syntax] while offering different interaction patterns.

* **Visual editor** lets you manage policies interactively through a graphical user interface. All changes sync immediately with the underlying JSON representation. This mode works best when you need to make targeted changes to specific rules or when you're learning the policy syntax.
* **JSON editor** gives you direct access to the HuJSON policy file with syntax highlighting. This mode suits users who prefer working directly with code or need to make bulk changes. The JSON editor provides full control over policy structure and lets you use advanced features that might not yet have visual interfaces. The JSON editor also includes a **Convert to grants** button that automatically converts your `acls` section to equivalent [grants][docs-grants]. Refer to [Migrate from ACLs to grants][docs-migrate-acls-grants] for more information.
* **GitOps** mode is when you [manage your tailnet policy file through GitOps][docs-gitops]. In this mode, you can search, filter, and preview potential changes but cannot save modifications. Your version control system remains the single source of truth for policy changes. This mode ensures that all policy modifications go through your established review and approval processes.

> **Warning:**
>
> To prevent users from editing policies on the admin console when using GitOps, you must lock the editor. To do this, go to [Policy file management](https://console.tailscale.com/admin/settings/policy-file-management) > **Lock editor**, then enable **Prevent edits in the admin console**.

## General access rules

General access rules let you manage access between devices in your tailnet using [grants syntax][docs-grants].

[Manage general access rules using the visual editor][docs-visual-editor-reference-general-access-rules].

## Tailscale SSH

[Tailscale SSH rules][docs-tailscale-ssh] let you control SSH access to devices in your tailnet without managing SSH keys.

[Manage Tailscale SSH rules using the visual editor][docs-visual-editor-reference-tailscale-ssh].

## Groups

[Groups][docs-targets] let you organize users into logical groups for access control management. There are three types of groups: user-defined groups, synced groups from your identity provider, and built-in autogroups.

[Manage groups using the visual editor][docs-visual-editor-reference-groups].

## Tags

[Tags][docs-tags] provide a way to authenticate and organize non-user devices like servers into functional groups for use in access control policies.

[Manage tags using the visual editor][docs-visual-editor-reference-tags].

## IP sets

[IP sets][docs-policy-syntax-ipsets] let you create collections of IP addresses, hosts, and subnets to use in access control policies.

[Manage IP sets using the visual editor][docs-visual-editor-reference-ip-sets].

## Hosts

[Hosts][docs-policy-syntax-hosts] are a way to create friendly names for IP addresses and CIDR ranges to improve policy readability by replacing numeric addresses with meaningful identifiers.

[Manage hosts using the visual editor][docs-visual-editor-reference-hosts].

## Node attributes

[Node attributes][docs-policy-syntax-nodeattrs] let you apply settings and attributes to device to do things like control feature availability and device behavior across your tailnet.

[Manage node attributes using the visual editor][docs-visual-editor-reference-node-attributes].

## Device posture

[Device posture][docs-device-posture] rules let you specify the requirements a device must meet before it can access sensitive resources.

[Manage device posture rules using the visual editor][docs-visual-editor-reference-device-posture].

## Auto approvers

[Auto approvers][docs-policy-syntax-autoapprovers] let you create policies to pre-approve specific operations for devices, such as advertising subnet routes or exit nodes, without manual intervention.

[Manage auto approvers using the visual editor][docs-visual-editor-reference-auto-approvers].

## Tests

[Tests][docs-policy-syntax-tests] validate that access control changes meet expected behavior before saving.

[Manage tests using the visual editor][docs-visual-editor-reference-tests].

## Data synchronization

Changes in the visual editor immediately sync to the JSON editor after you save them. This bidirectional synchronization ensures consistency regardless of which editor you use.

GitOps mode prevents modifications to maintain version control as the source of truth. In this mode, use the visual editor to preview and validate changes before committing them to your repository. The read-only mode indicates when GitOps manages your configuration. For GitOps implementation examples, refer to the documentation for [GitHub Actions][docs-gitops-acls-github], [GitLab CI][docs-gitops-acls-gitlab], and [Bitbucket][docs-gitops-acls-bitbucket].

> **Note:**
>
> When you use the visual editor, it automatically converts ACL syntax to grants syntax on the backend. Grants syntax supports all the same capabilities as ACL syntax with additional features like [route filtering][docs-via] and [app capabilities][docs-grants-app-capabilities]. Refer to [grants versus ACLs][docs-grants-vs-acls] for more information.

### Finding and filtering

All major sections include search fields that filter content in real time. Search works across every visible column in a section. You can find configurations using any identifying information without switching search modes.

The dropdown list arrow in search fields provides additional filtering options:

* Filter by user, group, device, or tag.
* Search by port or IP address.
* Apply multiple filters simultaneously.

Real-time filtering helps manage large policy files efficiently. Type any part of a configuration to display only matching items. This approach eliminates manual scrolling through hundreds of entries.

### Configuration validation

The visual editor validates your input as you work. This approach lets you work through complex configurations without interruption. Required fields appear without optional labels because they represent the baseline requirement.

Field-specific validation errors appear near the relevant fields, while validation errors that aren't field-specific appear at the top of the page. Examples of these include failed general tests and failed SSH tests.

### JSON output previews

Most configurations include JSON preview panels showing the HuJSON syntax your selections generate. These previews update immediately as you modify fields. The preview helps you understand how visual selections translate to policy file syntax.

The JSON preview serves several purposes:

* Explore policy file syntax without leaving the visual editor.
* Verify that configurations produce expected output.
* Copy snippets for documentation or team discussions.
* Debug complex configurations by examining generated code.
* Share exact configurations with team members.

The copy button lets you copy the policy JSON to your clipboard for use in version control, documentation, or team collaboration. This feature connects visual and code-based configuration workflows.

> **Tip:**
>
> JSON previews are available even when the policy file is locked because it's managed through GitOps. You can still view and copy generated HuJSON snippets for reference.

## Feedback

The visual editor continues to evolve with regular feature additions. Your feedback helps prioritize improvements and identify issues.

Select **Give feedback** from the top of the [Visual editor](https://console.tailscale.com/admin/acls/visual) page to submit suggestions, report bugs, or request features. The product team reviews all submissions and uses them to guide development priorities.

Include specific use cases and workflows in your feedback. The more context you provide, the better the team can understand and address your needs. Screenshots and detailed descriptions help communicate complex issues or feature requests.

[docs-device-posture-postures]: /docs/features/device-posture/postures-and-attributes

[docs-device-posture]: /docs/features/device-posture

[docs-gitops-acls-bitbucket]: /docs/integrations/bitbucket/gitops

[docs-gitops-acls-github]: /docs/integrations/github/gitops

[docs-gitops-acls-gitlab]: /docs/integrations/gitlab/gitops

[docs-gitops]: /docs/gitops

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-vs-acls]: /docs/reference/grants-vs-acls

[docs-grants]: /docs/features/access-control/grants

[docs-migrate-acls-grants]: /docs/reference/migrate-acls-grants

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#auto-approvers

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#groups

[docs-policy-syntax-hosts]: /docs/reference/syntax/policy-file#hosts

[docs-policy-syntax-ipsets]: /docs/features/tailnet-policy-file/ip-sets

[docs-policy-syntax-network-options]: /docs/reference/syntax/policy-file#network-policy-options

[docs-policy-syntax-nodeattrs]: /docs/reference/syntax/policy-file#node-attributes

[docs-policy-syntax-tests-ssh]: /docs/reference/syntax/policy-file#ssh-tests

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#tests

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-tags]: /docs/features/tags

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-targets]: /docs/reference/targets-and-selectors

[docs-via]: /docs/features/access-control/grants/grants-via

[docs-visual-editor-reference-auto-approvers]: /docs/reference/visual-editor#auto-approvers

[docs-visual-editor-reference-device-posture]: /docs/reference/visual-editor#device-posture

[docs-visual-editor-reference-general-access-rules]: /docs/reference/visual-editor#general-access-rules

[docs-visual-editor-reference-groups]: /docs/reference/visual-editor#groups

[docs-visual-editor-reference-hosts]: /docs/reference/visual-editor#hosts

[docs-visual-editor-reference-ip-sets]: /docs/reference/visual-editor#ip-sets

[docs-visual-editor-reference-node-attributes]: /docs/reference/visual-editor#node-attributes

[docs-visual-editor-reference-tags]: /docs/reference/visual-editor#tags

[docs-visual-editor-reference-tailscale-ssh]: /docs/reference/visual-editor#tailscale-ssh

[docs-visual-editor-reference-tests]: /docs/reference/visual-editor#tests

[xt-gh-hujson]: https://github.com/tailscale/hujson
