---
title: "Filter logs by header"
description: "Aperture stores request and response headers in captures as compressed data. By default, it does not index them. Index specific headers to filter requests by their presence or value on supported admin"
---

Last validated Sep 28, 2026

\[Missing snippet: aperture\_terms.mdx]

Aperture stores request and response headers in captures as compressed data. By default, it does not index them. Index specific headers to filter requests by their presence or value on supported admin dashboard pages.

The steps below edit the configuration JSON directly. You can also use **Administration** > **Reporting** at `/admin/settings/reporting` in the [admin dashboard][docs-aperture-dashboard-admin]. Each step includes instructions for both methods.

## Prerequisites

Before you begin, you need:

* An [Aperture gateway][docs-aperture-get-started] with at least one provider configured.
* Admin access to the [Aperture configuration][docs-aperture-configuration], through either `/admin/settings/reporting`, the **Reporting** page, or `/admin/settings/config`, the raw configuration editor.

The configuration is written in HUJSON, which is JSON that also permits comments and trailing commas. Standard JSON is valid HUJSON.

## How header filtering works

Header filtering has two parts:

* The `filterable` list controls which headers Aperture indexes by name and value. It starts empty. Headers outside this list remain available only in captures.
* The filter controls on supported [admin dashboard][docs-aperture-dashboard-admin] pages query those indexes.

Indexing a header does not by itself let anyone filter on it. A caller, including an admin, can use an indexed header as a filter on supported Aperture admin dashboard pages, but only when a grant assigns them that header through the `filterable_headers` capability.

Indexed header values are retained past the capture retention period. Capture retention only limits how far back Aperture can backfill a newly configured header. When you add a header, it becomes filterable for new requests immediately, and Aperture backfills history from captures that are still within the capture retention window. Requests whose captures have already been purged cannot be backfilled.

Header values are scrubbed before storage as a safeguard against durably storing a secret. Aperture always redacts values that match a built-in set of credential patterns, and this set cannot be extended. To keep a header's value out of storage entirely, mark it presence-only. Refer to [Store a header as presence-only][ar-store-a-header-as-presence-only].

The following steps use `x-request-id` to trace requests across your logs. Index the header, grant access to it, then filter **Logs** for matching requests.

## Step 1: Choose the headers to index

Decide which headers you want to filter on. Good candidates are low-cardinality, stable headers that identify or classify a request, such as `user-agent`, a routing or trace identifier, or a header your gateway adds. Avoid per-request unique headers such as `date`, which are not useful as filters.

## Step 2: Add the headers to your configuration

\[Missing snippet: aperture\_admin\_nav.mdx] Add a `headers` block inside the top-level `database` object, listing each header as an object under `filterable`:

```json
"database": {
  "headers": {
    "filterable": [
      { "name": "user-agent" },
      { "name": "x-request-id" },
    ],
  },
}
```

Header names are case-insensitive and apply to both the request and response hops. After you save, Aperture indexes the listed headers for new requests and backfills recent history.

You can also manage this list without editing JSON. At `/admin/settings/reporting`, on the **Administration** > **Reporting** page, under **Stored filterable headers**, select **Add header**, type the header name, then select **Save header filtering**. Use the trash icon next to a row to stop indexing that header. The page reports how many headers are configured, and its **Header backfill status** panel shows how much closed-day history Aperture has indexed.

## Step 3: Grant filter access

Indexing a header does not let anyone filter on it, not even an admin, until a grant assigns it. In the grant that covers the users who should filter logs, add a `filterable_headers` capability listing the header names:

```json
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "filterable_headers": ["user-agent", "x-request-id"] },
      ],
    },
  },
]
```

Use `["*"]` to grant every indexed header. For those users, the granted headers appear as options in the **Header** filter on supported Aperture admin dashboard pages. For the full grant structure, refer to [grants][docs-aperture-grants].

You can also create and manage these grants without editing JSON:

* At `/admin/settings/reporting`, on the **Administration** > **Reporting** page, under **Header filter grants**, select **Add assignment**. Set **Source** to the users, groups, or tags that should filter logs, such as `alice@example.com`, `group:eng`, `tag:api`, or `*`. List the header names under **Filterable headers**, then select **Save assignment**. The table below lists every existing assignment with its sources and headers, and each row has controls to edit or delete it. The header field suggests the headers you configured in Step 2 and rejects a name that is not one of them, so save the header list first.
* At `/admin/settings/grants`, on the **Administration** > **Grants** page, a grant that already carries the capability shows a **Filterable headers** field you can edit in place. Use the **Reporting** page or the configuration editor to add the capability to a grant that does not have it yet.

## Step 4: Store a header as presence-only (optional)

By default Aperture stores each indexed header's value, after redaction, so you can match on a substring or an exact value. To index a header for presence checks only and never store its value, set `redact_values` on that header:

```json
"database": {
  "headers": {
    "filterable": [
      { "name": "user-agent" },
      { "name": "authorization", "redact_values": true },
    ],
  },
}
```

A presence-only header supports the **Present** match only. **Contains** and **Is exactly** are unavailable for it. Use it for headers whose values are sensitive or too high-cardinality to store durably.

Set `redact_values` on the **Administration** > **Configuration** page. The **Reporting** page honors this field but does not edit it.

## Step 5: Filter the Logs page

Open [**Logs**][docs-aperture-dashboard-admin] at `/admin/logs` and select **Filter +** > **Header**. For each header filter, set:

* The hop: **Req** to match the request header, **Resp** to match the response header, or **Any** to match either.
* The header name, chosen from the headers you are granted.
* The match: **Present** (the header exists), **Contains** (the value contains a substring), or **Is exactly** (the value equals the string you enter). **Contains** and **Is exactly** match case-insensitively, and are unavailable for presence-only headers.

The filter pill summarizes your choice, reading `Req x-request-id contains abc`, `Req x-request-id is exactly abc`, or `Any x-request-id present`.

To match one header against several values, select **+ header** within the filter to add an OR condition. The pill joins the conditions with `OR`, for example `Req x-request-id contains abc OR Req x-request-id contains def`.

To narrow further, add more **Header** filters. Conditions within a single pill combine with `OR`. Separate **Header** filters, together with any other active filters such as user or date, combine with `AND`. A request must match every pill to appear.

If no headers are available, the **Header** filter says so instead of listing options and links to the **Reporting** page.

## Reference

For the full field descriptions, refer to the [`database.headers`][docs-aperture-configuration-headers] configuration reference.

[ar-store-a-header-as-presence-only]: #step-4-store-a-header-as-presence-only-optional

[docs-aperture-configuration-headers]: /docs/aperture/configuration#databaseheaders-fields

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-dashboard-admin]: /docs/aperture/reference/dashboard-admin

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-grants]: /docs/aperture/configuration#grants
