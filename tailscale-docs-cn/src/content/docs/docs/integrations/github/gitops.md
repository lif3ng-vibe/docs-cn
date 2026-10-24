---
title: "GitOps for Tailscale with GitHub Actions"
description: "[Access control policies][docs-access-control] define what users or devices are permitted to access in your Tailscale network (known as a tailnet). An alternative to managing the access control policy"
---

Last validated Dec 5, 2025

[Access control policies][docs-access-control] define what users or devices are permitted to access in your Tailscale network (known as a tailnet). An alternative to managing the access control policy changes in the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console is to use [GitOps][docs-gitops-acls] to manage the access control policy changes. This topic provides details on how to use [GitHub Actions][xt-gh-actions] to automatically apply and test access control policy changes to your tailnet.

> **Note:** GitOps for Tailscale is available for [all plans](https://tailscale.com/pricing).

## Prerequisites

In addition to already having your own Tailscale network, you need:

* A GitHub account.
* Working knowledge of GitHub, including committing changes, creating and merging pull requests.
* A private GitHub repository that will contain your tailnet policy file.

> **Warning:**
>
> Make sure this repository is private, as tailnet policy files contain personally identifiable information (PII), such as your users' email addresses.

* A Tailscale [federated identity][docs-workload-identity-federation], [OAuth client][docs-oauth], or [API access token][docs-api] for your tailnet. You can create a federated identity or an OAuth client in the [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) page of the admin console, or you can create an API access token in the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console. If you use a trust credential, the credential needs the `policy_file:read` scope to be able to read and validate the tailnet policy file, or the `policy_file` scope to be able to read, validate, and modify the tailnet policy file. For information about other scopes that are required when using the `policy_file:read` or the `policy_file` scopes, refer to the [trust credentials scopes][docs-trust-credentials-scopes] documentation.

## GitHub Action to sync Tailscale access control policies

Tailscale publishes a GitHub Action to [Sync Tailscale access control policies][xt-gh-acl-sync], available in the GitHub Actions Marketplace.

> **Note:**
>
> You do not need to use this GitHub Action to set up a GitOps pattern — you can also write your own Action or use another CI/CD tool.

### What this action does

On **pull requests** that target the `main` branch, the `Test ACL` step (action `test`) will send your tailnet policy file to Tailscale to determine whether the access control policy is valid and whether all [tests][docs-policy-syntax-tests] pass. Tailscale will provide your workflow with the result of those checks.

On **push** (merge) operations that target the `main` branch, the `Deploy ACL` step (action `apply`) will again check access control policy validity and run tests, with Tailscale reporting back the results to your workflow. If the tests succeed, the merge will complete and the workflow will automatically apply your access control policy changes to your tailnet. If the tests fail, an error will prevent the merge from continuing.

You can refer to the status of the workflow in the GitHub user interface's **Actions** tab for your pull request. Look for a workflow with the name you used in `.github/workflows/tailscale.yml`, **Tailscale ACL syncing**.

*（图：The GitHub Actions workflow interface. Listing a 'Sync Tailscale ACLs' workflow.）*

### Inputs

The following inputs apply to the Sync Tailscale ACLs action.

* `action` (Required): One of `test` or `apply`. If `test`, the action will run [ACL tests][docs-policy-syntax-tests] only—it won't update your ACLs in Tailscale. If `apply`, the action will run ACL tests and, if the ACL tests succeed, then update your ACLs in Tailscale. This enables you to use pull requests to make changes, with CI preventing you from pushing a bad change out to production.

* `oauth-client-id`/`audience`, or `oauth-client-id`/`oauth-secret`, or `api-key` (Required): A credential to allow the action to interact with your tailnet. You may use an `oauth-client-id` and `audience`, or an `oauth-client-id` and `oauth-secret`, or an `api-key`. You can create a trust credential in the [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) page of the admin console,
  or you can create an API access token in the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.

* `policy-file` (Optional): The path to your tailnet policy file in the repository. If not set this defaults to `policy.hujson` in the root of your repository.

* `tailnet` (Required): This is your organization, which you can find in the [General](https://console.tailscale.com/admin/settings/general) settings page of the admin console.

## Set up your GitOps configuration

1. In your GitHub repository, create a file named `policy.hujson`. Copy your tailnet policy file contents from the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console into this file.

   > **Note:**
   >
   > If you want to change the tailnet policy file name to something else, you will need to add the `policy-file` argument to the `with` blocks in your GitHub Actions configuration discussed below. Otherwise, the GitHub action will default to `policy.hujson` as the tailnet policy file.

2. Commit the tailnet policy file and push it to GitHub. For example, if you are using the command line:

   ```shell
   git add .
   git commit -sm "policy: import from admin console"
   git push -u origin main
   ```

3. Create the following [GitHub Actions secrets][xt-gh-secrets] in your repository's settings:

   > **Note:**
   >
   > You may either supply Tailscale OAuth client credentials or a Tailscale API key. If you supply both, the OAuth credentials will be used.

   * `TS_TAILNET`: Use your tailnet ID as the value. You can find your tailnet ID in the [General](https://console.tailscale.com/admin/settings/general) page of the admin console.
   * `TS_OAUTH_ID`: Use your Tailscale OAuth client ID as the value.
   * `TS_OAUTH_SECRET`: Use your Tailscale OAuth client secret as the value.
   * `TS_API_KEY`: Use your Tailscale API access token as the value.

   These secrets provide the configuration for the action.

4. Make a new GitHub Actions workflow that uses the [Sync Tailscale ACLs][xt-gh-acl-sync] GitHub Action.

   #### Federated identity

   Create a file named `.github/workflows/tailscale.yml`. Paste in the following YAML:

   ```yaml
   name: Sync Tailscale ACLs

   on:
     push:
       branches: [ "main" ]
     pull_request:
       branches: [ "main" ]

   jobs:
     acls:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v6

         - name: Deploy ACL
           if: github.event_name == 'push'
           id: deploy-acl
           uses: tailscale/gitops-acl-action@v1
           with:
             oauth-client-id: ${{ secrets.TS_OAUTH_ID }}
             audience ${{ secrets.TS_AUDIENCE }}
             tailnet: ${{ secrets.TS_TAILNET }}
             action: apply

         - name: Test ACL
           if: github.event_name == 'pull_request'
           id: test-acl
           uses: tailscale/gitops-acl-action@v1
           with:
             oauth-client-id: ${{ secrets.TS_OAUTH_ID }}
             audience: ${{ secrets.TS_AUDIENCE }}
             tailnet: ${{ secrets.TS_TAILNET }}
             action: test
   ```

   If you don't use the name `main` for your default branch, update the `branches` fields in the YAML.

   This workflow appropriately uses the `secrets.TS_OAUTH_ID`, `secrets.TS_AUDIENCE`, and `secrets.TS_TAILNET` environment variables to access your secrets.

   > **Warning:**
   >
   > Do not place your actual secret *values* in `.github/workflows/tailscale.yml`—use the environment values as depicted in the example.

   #### OAuth client

   Create a file named `.github/workflows/tailscale.yml`. Paste in the following YAML:

   ```yaml
   name: Sync Tailscale ACLs

   on:
     push:
       branches: [ "main" ]
     pull_request:
       branches: [ "main" ]

   jobs:
     acls:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v6

         - name: Deploy ACL
           if: github.event_name == 'push'
           id: deploy-acl
           uses: tailscale/gitops-acl-action@v1
           with:
             oauth-client-id: ${{ secrets.TS_OAUTH_ID }}
             oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
             tailnet: ${{ secrets.TS_TAILNET }}
             action: apply

         - name: Test ACL
           if: github.event_name == 'pull_request'
           id: test-acl
           uses: tailscale/gitops-acl-action@v1
           with:
             oauth-client-id: ${{ secrets.TS_OAUTH_ID }}
             oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
             tailnet: ${{ secrets.TS_TAILNET }}
             action: test
   ```

   If you don't use the name `main` for your default branch, update the `branches` fields in the YAML.

   This workflow appropriately uses the `secrets.TS_OAUTH_ID`, `secrets.TS_OAUTH_SECRET`, and `secrets.TS_TAILNET` environment variables to access your secrets.

   > **Warning:**
   >
   > Do not place your actual secret *values* in `.github/workflows/tailscale.yml`—use the environment values as depicted in the example.

   #### API key

   Create a file named `.github/workflows/tailscale.yml`. Paste in the following YAML:

   ```yaml
   name: Sync Tailscale ACLs

   on:
     push:
       branches: [ "main" ]
     pull_request:
       branches: [ "main" ]

   jobs:
     acls:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v6

         - name: Deploy ACL
           if: github.event_name == 'push'
           id: deploy-acl
           uses: tailscale/gitops-acl-action@v1
           with:
             api-key: ${{ secrets.TS_API_KEY }}
             tailnet: ${{ secrets.TS_TAILNET }}
             action: apply

         - name: Test ACL
           if: github.event_name == 'pull_request'
           id: test-acl
           uses: tailscale/gitops-acl-action@v1
           with:
             api-key: ${{ secrets.TS_API_KEY }}
             tailnet: ${{ secrets.TS_TAILNET }}
             action: test
   ```

   If you don't use the name `main` for your default branch, update the `branches` fields in the YAML.

   This workflow appropriately uses the `secrets.TS_API_KEY` and `secrets.TS_TAILNET` environment variables to access your secrets.

   > **Warning:**
   >
   > Do not place your actual secret *values* in `.github/workflows/tailscale.yml`—use the environment values as depicted in the example.

   For an example repository that has set up this workflow, refer to [`https://github.com/cetacean/tailscale-acls`][xt-gh-tailscale-acls].&#x20;

5. Commit and push `.github/workflows/tailscale.yml`.

   The main steps in the action are installing [gitops-pusher][xt-gh-tailscale-cmd-gitops-pusher], setting the correct environment variables and flags, and then running the workflow. For more information, refer to [GitHub Action configuration][xt-gh-tailscale-gitops-acl-config].

   With this setup, you have created a continuous integration (CI) that automatically tests and pushes your tailnet policy file changes to Tailscale!

6. Follow the instructions to [prevent others from accidentally modifying your tailnet policy file][ar-prevent-edits] in the admin console.

## Push changes to your tailnet policy file

Now that your configuration has been set up, any time you want to update your ACL, modify the tailnet policy file in your repository and use the typical GitHub authoring/review/merge flow. You can check the status of the ACL validity checks and ACL tests in the GitHub UI in the **Actions** tab for your pull request. Look for a workflow with the name you used in `.github/workflows/tailscale.yml`, **Sync Tailscale ACLs**.

## Prevent others from accidentally modifying your tailnet policy file

> **Note:**
>
> On June 3, 2025, we [announced the deprecation][co-changelog-gitops] of the GitOps code comment technique for locking the policy file editor in the admin console. Tailnets that were using this method were automatically migrated to use the setting in the admin console. The code comment is no longer effective for locking the policy file editor.

To prevent other admins in your organization from accidentally changing your tailnet policy file, you can lock the editor in the [Policy file management](https://console.tailscale.com/admin/settings/policy-file-management) page in the Tailscale admin console.

You must be an [Owner, Admin, or Network admin](/docs/reference/user-roles) of a tailnet to update tailnet policy file settings.

1. Open the [Policy file management](https://console.tailscale.com/admin/settings/policy-file-management) page in the Tailscale admin console.
2. If it is not already enabled, select **Prevent edits in the admin console** to prevent editing of the file.
3. For **External reference**, enter the URL of your repository. This lets other admins to know where the source of your policies is located.
4. Select **Save**.

Any [admin with permissions to edit the tailnet policy file][docs-user-roles-permissions-by-roles] can still edit it directly by selecting **Edit anyway**. This lets admins to quickly make changes in case of an emergency.

*（图：The warning given when trying to edit a tailnet policy file which is using GitOps.）*

The next time you use the GitOps flow, it overwrites the tailnet policy file changes made in the admin console.

## Revert the most recent change to your ACL

If you need to revert the most recent change, use the GitHub UI to [revert the merged pull request][xt-gh-revert-pr].

## Remove your GitOps configuration

1. Open the [Policy file management](https://console.tailscale.com/admin/settings/policy-file-management) page in the Tailscale admin console and disable the **Prevent edits in the admin console** toggle.

2. Optionally, delete the **External reference link** and select **Save**.

3. [Revoke][docs-auth-keys-revoke] any associated Tailscale API access tokens for this configuration.

4. Archive or delete the associated GitHub repository.

## Additional information

* Any manual tailnet policy file changes in the admin console won't be reflected in your GitHub version of the tailnet policy file. The next time you use the Sync Tailscale ACLs GitHub Action, any changes made in the Tailscale admin console will be overwritten.

* Tailscale [API access tokens expire][docs-api-authentication] and currently there is no mechanism to have them automatically renewed. To handle the expiration, create a new API access token and update the GitHub `TS_API_KEY` secret to use the new value.

  > **Warning:**
  >
  > Tailscale API access tokens expire after 90 days (or less if the key has a shorter expiry) but updating the GitHub secret monthly is a good practice.
  >
  > When you no longer need to use a Tailscale API access token, make sure you revoke it in the [Keys](https://console.tailscale.com/admin/settings/keys) page
  > of the admin console.

* Tailscale tailnet policy files are in [HuJSON][xt-nigeltao-hujson], a JSON format with trailing commas and comments. If you don't want to write your tailnet policy files in HuJSON directly, you can use a tool that lets you generate JSON in the same schema as the HuJSON format. Make sure your tool puts the file in the same place as the `policy-file` setting in the GitHub Action.

[ar-prevent-edits]: #prevent-others-from-accidentally-modifying-your-tailnet-policy-file

[co-changelog-gitops]: https://tailscale.com/changelog#2025-06-03

[docs-access-control]: /docs/features/access-control

[docs-api-authentication]: /docs/reference/tailscale-api#authentication

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys-revoke]: /docs/features/access-control/auth-keys#revoke-an-auth-key

[docs-gitops-acls]: /docs/gitops

[docs-oauth]: /docs/features/oauth-clients

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#tests

[docs-trust-credentials-scopes]: /docs/reference/trust-credentials#scopes

[docs-user-roles-permissions-by-roles]: /docs/reference/user-roles#permissions-managed-by-user-roles

[docs-workload-identity-federation]: /docs/features/workload-identity-federation

[xt-gh-acl-sync]: https://github.com/marketplace/actions/sync-tailscale-acls

[xt-gh-actions]: https://github.com/features/actions

[xt-gh-revert-pr]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/reverting-a-pull-request

[xt-gh-secrets]: https://docs.github.com/en/actions/security-guides/encrypted-secrets

[xt-gh-tailscale-acls]: https://github.com/cetacean/tailscale-acls

[xt-gh-tailscale-cmd-gitops-pusher]: https://github.com/tailscale/tailscale/tree/main/cmd/gitops-pusher

[xt-gh-tailscale-gitops-acl-config]: https://github.com/tailscale/gitops-acl-action/blob/main/action.yml

[xt-nigeltao-hujson]: https://nigeltao.github.io/blog/2021/json-with-commas-comments.html
