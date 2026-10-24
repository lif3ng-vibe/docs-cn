---
title: "GitOps for Tailscale with GitLab CI"
description: "[Access control policies][docs-access-control] define what users or devices are permitted to access in your Tailscale network (known as a tailnet). An alternative to managing the access control policy"
---

Last validated Dec 4, 2025

[Access control policies][docs-access-control] define what users or devices are permitted to access in your Tailscale network (known as a tailnet). An alternative to managing the access control policy changes in the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console is to use [GitOps for Tailscale][docs-gitops-acls] to manage the access control policy changes. This topic provides details on how to use [GitLab CI/CD][xt-gitlab-get-started] to automatically apply and test access control policy changes to your tailnet.

> **Note:** GitOps for Tailscale is available for [all plans](https://tailscale.com/pricing).

## Prerequisites

In addition to already having your own Tailscale network, you need:

* A GitLab account.
* Working knowledge of GitLab procedures including committing changes, creating merge requests, and merging requests.
* A private GitLab repository that will contain your tailnet policy file.

> **Warning:**
>
> Make sure this repository is private, as tailnet policy files contain personally identifiable information (PII), such as users email addresses.

* A Tailscale [API access token][docs-api] for your tailnet. You can create an API access token in the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.

## GitLab CI file to sync Tailscale access control policies

Tailscale publishes a GitLab CI Template to [Sync Tailscale access control policies][xt-gitlab-tailscale-gitops-acls], available to include in your own CI file.

> **Note:**
>
> You do not need to use this GitLab CI Template to set up a GitOps pattern — you can also write your own or use another CI/CD tool.

### What this template does

On merge requests that target the `main` branch, the `test` stage will send your tailnet policy file to Tailscale to determine whether the ACL is valid and whether all [tests][docs-policy-syntax-tests] pass. Tailscale will provide your workflow with the result of those checks.

On push (merge) operations that target the `main` branch, the `apply` stage will again check access control policy validity and run tests, with Tailscale reporting back the results to your workflow. If the tests succeed, the merge will complete and the workflow will automatically apply your access control policy changes to your tailnet. If the tests fail, an error will prevent the merge from continuing.

You can refer to the status of the workflow in the GitLab CI/CD tab for your project. Look for a job with the name `test` or `apply`.

*（图：The GitLab CI workflow interface. Listing 'test' and 'apply' jobs.）*

### Inputs

The following inputs apply to the Sync Tailscale ACLs CI.

* **`api-key`** (Required): An [API access token][docs-api] authorized for your tailnet. You can create an API access token in the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.

* **`policy-file`** (Optional): The path to your tailnet policy file in the repository. If not set this defaults to `policy.hujson` in the root of your repository.

* **`tailnet`** (Required): This is your organization, which you can find in the [General](https://console.tailscale.com/admin/settings/general) settings page of the admin console.

## Set up your GitOps configuration

1. In your GitLab repository, create a file named `policy.hujson`. Copy your tailnet policy file contents from the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console into this file.

   > **Note:**
   >
   > If you want to change the tailnet policy file name to something else, you will need to add the `policy-file` argument to the `with` blocks in your GitLab CI configuration discussed below. Otherwise, the template will default to `policy.hujson` as the tailnet policy file.

2. Commit the tailnet policy file and push it to GitLab. For example, if you are using the command line:

   ```shell
   git add .
   git commit -sm "policy: import from admin console"
   git push -u origin main
   ```

3. Create the following [GitLab CI secrets][xt-gitlab-ci-secrets] in your repository's settings:

   * `TS_API_KEY`: Use your Tailscale API access token as the value.
   * `TS_TAILNET`: Use your tailnet ID as the value. You can find your tailnet ID in the [General](https://console.tailscale.com/admin/settings/general) page of the admin console.

   These secrets provide the configuration for the CI Job. For both of these secrets, within the GitLab CI secrets UI, enable the **Expand variable reference** option. For more information about GitLab CI environment variable expansion, refer to [GitLab CI/CD variables][xt-gitlab-ci-secrets].

4. Make a new GitLab CI job that uses the [Sync Tailscale ACLs][xt-gitlab-tailscale-gitops-acls] template.

   Create a file named `.gitlab-ci.yml` and paste in the following:

   ```yaml
   include:
     - project: 'tailscale-dev/gitops-acl-ci'
       ref: main
       file: 'acls.gitlab-ci.yaml'
       inputs:
         api-key: $TS_API_KEY
         tailnet: $TS_TAILNET

   stages:
     - test
     - apply

   test:
     rules:
       - if: '$CI_PIPELINE_SOURCE == "merge_request_event" && $CI_MERGE_REQUEST_TARGET_BRANCH_NAME == $CI_DEFAULT_BRANCH'

   apply:
     rules:
       - if: '$CI_PIPELINE_SOURCE == "push" && $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
   ```

   This workflow appropriately uses the `TS_API_KEY` and `TS_TAILNET` environment variables to access your secrets.

   > **Warning:**
   >
   > Do not place your actual secret *values* in `.gitlab-ci.yml`—use the environment values as depicted in the example.

   For an example that has set up this workflow, refer to the [GitLab CI to Sync Tailscale ACLs][xt-gitlab-tailscale-gitops-acls] repository.

5. Commit and push `.gitlab-ci.yml`.

6. Follow the instructions to [prevent others from accidentally modifying your tailnet policy file][ar-prevent-edits] in the admin console.

The main steps in the CI are installing [gitops-pusher][xt-gh-tailscale-cmd-gitops-pusher],
setting the correct environment variables and flags, and then running the workflow. For more information, refer to [GitLab CI Template][xt-gitlab-tailscale-gitops-acls-template].

With this setup, you have created a continuous integration (CI) that automatically tests and pushes your tailnet policy file changes to
Tailscale!

## Push changes to your tailnet policy file

Now that your configuration has been set up, any time you want to update your tailnet policy file, modify the tailnet policy file in your repository and use the typical GitLab authoring/review/merge flow. You can check the status of the access control policy validity checks and tests in the GitLab UI in the **Actions** tab for your pull request. Look for a job with the names `test` or `apply`.

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

## Revert the most recent change to your tailnet policy file

If you need to revert the most recent change, use the GitLab UI to [revert the merged pull request][xt-gitlab-revert-changes].

## Remove your GitOps configuration

1. Open the [Policy file management](https://console.tailscale.com/admin/settings/policy-file-management) page in the Tailscale admin console and disable the **Prevent edits in the admin console** toggle.

2. Optionally, delete the **External reference link** and select **Save**.

3. [Revoke][docs-auth-keys-revoke] any associated Tailscale API access tokens for this configuration.

4. Archive or delete the associated GitLab repository.

## Additional information

* Any manual tailnet policy file changes in the admin console won't be reflected in your GitLab version of the tailnet policy file. The next time you use the Sync Tailscale ACLs GitLab CI, any changes made in the Tailscale admin console will be overwritten.

* Tailscale [API access tokens expire][docs-api-authentication] and currently there is no mechanism to have them automatically renewed. To handle the expiration, create a new API access token and update the GitLab `TS_API_KEY` secret to use the new value.

  > **Warning:**
  >
  > Tailscale API access tokens expire after 90 days (or less if the key has a shorter expiry) but updating the GitLab secret monthly is a good practice.
  >
  > When you no longer need to use a Tailscale API access token, make sure you revoke it in the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.

* Tailscale tailnet policy files are in [HuJSON][xt-nigeltao-hujson], a JSON format with trailing commas and comments. If you don't want to write your tailnet policy files in HuJSON directly, you can use a tool that lets you generate JSON in the same schema as the HuJSON format. Make sure your tool puts the file in the same place as the `policy-file` setting in the GitLab CI.

[ar-prevent-edits]: #prevent-others-from-accidentally-modifying-your-tailnet-policy-file

[co-changelog-gitops]: https://tailscale.com/changelog#2025-06-03

[docs-access-control]: /docs/features/access-control

[docs-api-authentication]: /docs/reference/tailscale-api#authentication

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys-revoke]: /docs/features/access-control/auth-keys#revoke-an-auth-key

[docs-gitops-acls]: /docs/gitops

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#tests

[docs-user-roles-permissions-by-roles]: /docs/reference/user-roles#permissions-managed-by-user-roles

[xt-gh-tailscale-cmd-gitops-pusher]: https://github.com/tailscale/tailscale/tree/main/cmd/gitops-pusher

[xt-gitlab-ci-secrets]: https://docs.gitlab.com/ee/ci/variables

[xt-gitlab-get-started]: https://docs.gitlab.com/ee/ci

[xt-gitlab-revert-changes]: https://docs.gitlab.com/ee/user/project/merge_requests/revert_changes.html

[xt-gitlab-tailscale-gitops-acls-template]: https://gitlab.com/tailscale-dev/gitops-acl-ci/-/blob/main/acls.gitlab-ci.yaml

[xt-gitlab-tailscale-gitops-acls]: https://gitlab.com/tailscale-dev/gitops-acl-ci

[xt-nigeltao-hujson]: https://nigeltao.github.io/blog/2021/json-with-commas-comments.html
