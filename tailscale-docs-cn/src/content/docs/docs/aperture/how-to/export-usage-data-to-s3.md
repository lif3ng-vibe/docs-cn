---
title: "Export usage data to S3"
description: "The [Aperture admin dashboard][docs-aperture-dashboard] shows recent organization-wide usage data at `/admin/adoption`, but it is not a long-term capture archive. You can set a [retention policy][docs"
---

Last validated Oct 1, 2026

The [Aperture admin dashboard][docs-aperture-dashboard] shows recent organization-wide usage data at `/admin/adoption`, but it is not a long-term capture archive. You can set a [retention policy][docs-aperture-retention] to control how long Aperture keeps captured content locally. Export retained usage records to S3-compatible storage for cost analysis, record-keeping, and custom reporting. Zero retention without export gating does not archive captured content.

When `require_export` is `true` in the [retention configuration][docs-aperture-retention], Aperture removes local captured content only after three events: the capture exports to S3, its retention window passes, and the local purge runs.

Aperture's S3 exporter periodically writes usage records to the bucket you configure as CBOR-encoded, zstd-compressed files. It works with Amazon S3 and other S3-compatible storage, such as Google Cloud Storage.

## Prerequisites

Before you begin, ensure you have the following:

* An [Aperture gateway][docs-aperture-get-started] with at least one provider configured.
* Admin access to the [Aperture configuration][docs-aperture-configuration].
* An S3-compatible bucket with write access. You need the bucket name, region, and credentials (access key ID and secret).

## Configure the S3 exporter

\[Missing snippet: aperture\_admin\_nav.mdx] Add an `exporters` section to your configuration. Replace the example bucket name, region, and credential placeholders with values for your bucket:

```json
"exporters": {
  "s3": {
    "bucket_name": "aperture-exports",
    "region": "us-east-1",
    "access_key_id": "<aws-access-key-id>",
    "access_secret": "<aws-secret-access-key>"
  }
}
```

Setting `bucket_name` to a non-empty value enables the S3 exporter after you save the configuration.

### Use a non-Amazon S3-compatible service

Aperture also supports S3-compatible storage services beyond AWS. For Google Cloud Storage or any other service with an S3-compatible API, you can use the same configuration with the addition of an `endpoint` field.

For services other than Amazon S3 (such as Google Cloud Storage), add the `endpoint` field with the service's S3-compatible API URL:

```json
"exporters": {
  "s3": {
    "endpoint": "https://storage.googleapis.com",
    "bucket_name": "aperture-exports",
    "region": "us-east-1",
    "access_key_id": "<access-key-id>",
    "access_secret": "<secret-key>"
  }
}
```

The `region` field is required even for non-AWS services because the AWS SDK validates it.

### Customize export behavior

You can adjust how frequently Aperture exports data and how many records it includes per batch using the `every` and `limit` fields:

```json
"exporters": {
  "s3": {
    "bucket_name": "aperture-exports",
    "region": "us-east-1",
    "access_key_id": "<aws-access-key-id>",
    "access_secret": "<aws-secret-access-key>",
    "prefix": "prod",
    "every": 1800,
    "limit": 2000
  }
}
```

The following table summarizes these fields:

| Field    | Default | Description                                                                   |
| -------- | ------- | ----------------------------------------------------------------------------- |
| `prefix` | `""`    | (Optional) Path prefix for S3 objects. Must not end with `/`.                 |
| `every`  | `3600`  | Seconds between export cycles. The previous example exports every 30 minutes. |
| `limit`  | `1000`  | Maximum records per export batch. Aperture caps this at `10000`.              |

Replace any example bucket name and credentials in the option you selected, then save the configuration. Aperture starts exporting usage records on the next export cycle.

## Export file format

Aperture exports usage data as [CBOR][xt-cbor]-encoded, [zstd][xt-zstd]-compressed files. CBOR is a binary encoding, similar to JSON, that supports binary data such as images and audio from multimodal LLM requests.

Each export file is named `ts-aperture-export-<unix-timestamp>.cbor.zstd` and contains a sequence of CBOR-encoded records. Each record includes the following top-level fields:

| Field            | Type      | Description                                                                                                                               |
| ---------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | integer   | Record identifier.                                                                                                                        |
| `ver`            | integer   | Schema version. `2`.                                                                                                                      |
| `timestamp`      | timestamp | When the LLM request occurred.                                                                                                            |
| `identity`       | object    | User and node identification: login name, stable node ID, and tags.                                                                       |
| `model`          | string    | LLM model name.                                                                                                                           |
| `api_type`       | string    | API type, such as `oai_completions` or `ant_messages`.                                                                                    |
| `usage`          | object    | Token counts: input, output, cached, and reasoning tokens.                                                                                |
| `estimated_cost` | object    | Estimated dollar cost of the request. Omitted if unavailable.                                                                             |
| `duration_ms`    | integer   | Request duration in milliseconds.                                                                                                         |
| `capture_id`     | string    | Unique identifier for this capture.                                                                                                       |
| `session_id`     | string    | Session grouping identifier.                                                                                                              |
| `path`           | string    | API endpoint path.                                                                                                                        |
| `status_code`    | integer   | HTTP response status code.                                                                                                                |
| `capture`        | object    | Captured request and response data, including headers, processed JSON bodies, tool use data, and optional raw request and response bytes. |

If `database.save_raws` is enabled, decoded CBOR `capture` mappings can contain `rawRequestBody` and `rawResponseBody` byte fields. If a response fails JSON parsing, Aperture can also keep its raw bytes when the retention policy permits it, even with `save_raws` disabled. Aperture omits these fields when they are empty. Dashboard capture and **Logs** views show parsed JSON bodies only. To access retained raw bytes, use S3 exports. With `duration: "0"` and `require_export: false`, Aperture stores no raw bodies, even if `save_raws` is enabled or JSON parsing fails. Turning `save_raws` off does not remove raw bytes that Aperture already captured. The retention policy removes them.

To read export files, decompress with a zstd library, then decode the CBOR sequence. Common libraries include `cbor2` and `zstandard` for Python, `fxamacker/cbor` and `klauspost/compress` for Go, and the `zstd` CLI tool for decompression.

## Verify the export

Send a known, non-sensitive test request so you can find its record among other exports. If your gateway has an OpenAI Chat Completions-compatible model, run the following command from a device in your tailnet. Replace `<aperture-hostname>` and `<model-name>` with your values:

```shell
curl -i -sS http://<aperture-hostname>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"<model-name>","messages":[{"role":"user","content":"Reply with hello."}]}'
```

Confirm that the gateway returns a 2xx status. Note the approximate time and the model you requested. If your model uses a different API format, use the corresponding [test request][docs-aperture-get-started] with equally non-sensitive content instead.

After the next export cycle, find a new `ts-aperture-export-<unix-timestamp>.cbor.zstd` object in the configured bucket and prefix. The object name alone does not show whether the object contains your request. Use your storage service's console or an S3-compatible client to download the object as `export.cbor.zstd`.

To inspect only non-sensitive record fields, install the Python `cbor2` and `zstandard` packages with `python3 -m pip install cbor2 zstandard`. Then run the following command in the directory that contains the downloaded object. The command prints top-level metadata and does not read the captured body:

```shell
python3 - export.cbor.zstd <<'PY'
import sys

import cbor2
import zstandard

with open(sys.argv[1], "rb") as source:
    with zstandard.ZstdDecompressor().stream_reader(source) as stream:
        decoder = cbor2.CBORDecoder(stream)
        while True:
            try:
                record = decoder.decode()
            except cbor2.CBORDecodeEOF:
                break
            print(record["timestamp"], record["model"], record["status_code"], record["path"])
PY
```

Match the approximate time, request path, and 2xx status to your test request. If you requested a [model alias][docs-aperture-model-aliases], the exported `model` can be the model that Aperture routed the request to instead of the name you requested. Do not require an exact model-name match. If several requests share those values, repeat the test at a quieter time. Do not treat an ambiguous match as proof. If the request is absent, check later export objects and the exporter configuration before you conclude that the export failed.

This check verifies the record in S3. It does not verify that Aperture removed the local capture. With `require_export: true`, local captured content remains until the export succeeds, the retention window passes, and the local purge runs. For the zero-duration archive-then-scrub posture, refer to [Configure zero-retention mode][docs-aperture-zero-retention] to check the same request's capture after export. Do not infer local removal from an S3 object alone.

## Next steps

* [Configure zero-retention mode][docs-aperture-zero-retention] to avoid storing captured content on the gateway. Requiring export instead keeps a copy in S3 before Aperture removes local captured content.
* Refer to [Privacy and data retention][docs-aperture-privacy] for the full overview of Aperture's retention and data controls.
* [Build a custom webhook][docs-aperture-build-custom-webhook] to send real-time event data to your own services.
* Review the [Aperture admin dashboard reference][docs-aperture-dashboard] for details on the built-in usage views.
* Refer to the [exporters configuration reference][docs-aperture-exporters] for the complete field reference.

[docs-aperture-build-custom-webhook]: /docs/aperture/how-to/build-custom-webhook

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-dashboard]: /docs/aperture/reference/dashboard-admin

[docs-aperture-exporters]: /docs/aperture/configuration#exporters

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-model-aliases]: /docs/aperture/model-aliases

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-aperture-retention]: /docs/aperture/configuration#database

[docs-aperture-zero-retention]: /docs/aperture/how-to/configure-zero-retention

[xt-cbor]: https://cbor.io/

[xt-zstd]: https://facebook.github.io/zstd/
