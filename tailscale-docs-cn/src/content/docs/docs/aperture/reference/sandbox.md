---
title: "Sandbox reference"
description: "The Aperture chat sandbox gives the assistant an isolated Linux environment for each conversation. It can run commands, read and search files, create and edit files, and present output files. Scratch "
---

Last validated Sep 28, 2026

> **Note:** Aperture chat sandbox is currently in alpha.

\[Missing snippet: contact\_account\_manager.mdx]

The Aperture chat sandbox gives the assistant an isolated Linux environment for each conversation. It can run commands, read and search files, create and edit files, and present output files. Scratch storage might disappear between turns. Uploaded files and presented output files remain associated with the conversation.

For an overview, refer to [Aperture chat sandbox][docs-sandbox-feature-guide]. For help using it, refer to [Manage sandbox operations][docs-manage-sandbox] or [Troubleshoot sandbox issues][docs-troubleshooting].

## Tools

Tool names appear in chat when the assistant invokes them.

### `aperture_bash`

Execute a shell command in the sandbox.

| Parameter | Type    | Required | Description                                                  |
| --------- | ------- | -------- | ------------------------------------------------------------ |
| `command` | string  | Yes      | Shell command to execute                                     |
| `timeout` | integer | No       | Maximum execution time in seconds. Default: 600 (10 minutes) |

Each call starts in `/home/aperture`. The tool truncates command output at 1 MiB (1,048,576 bytes). Each assistant turn has a 10-minute deadline. A larger `timeout` does not extend it.

### `aperture_read_file`

Read a file and return numbered lines. Directories return a listing and image files return a metadata line.

| Parameter    | Type                | Required | Description                                                                     |
| ------------ | ------------------- | -------- | ------------------------------------------------------------------------------- |
| `path`       | string              | Yes      | Absolute path to the file                                                       |
| `view_range` | array of 2 integers | No       | `[start_line, end_line]`, 1-indexed. Use `-1` for `end_line` to read to the end |

Output is truncated at 16,000 bytes. Use `view_range` to inspect a bounded section of a large file.

### `aperture_list_files`

List files in a directory, up to two levels deep.

| Parameter | Type   | Required | Description                    |
| --------- | ------ | -------- | ------------------------------ |
| `path`    | string | Yes      | Absolute path to the directory |

Listings contain at most 200 entries and tool output is truncated at 16,000 bytes.

### `aperture_grep`

Search a file or directory recursively for lines matching a regular expression. Results use `path:line:text` format.

| Parameter | Type   | Required | Description                                      |
| --------- | ------ | -------- | ------------------------------------------------ |
| `pattern` | string | Yes      | Regular expression to search for                 |
| `path`    | string | Yes      | Absolute path to the file or directory to search |

Output is truncated at 16,000 bytes.

### `aperture_write_file`

Create a file and its parent directories.

| Parameter   | Type   | Required | Description                  |
| ----------- | ------ | -------- | ---------------------------- |
| `path`      | string | Yes      | Path to the file to create   |
| `file_text` | string | Yes      | Content to write to the file |

Paths under `/mnt/workspace/uploads/` are read-only. The timeout is 30 seconds.

### `aperture_edit_file`

Replace a unique string in a text file.

| Parameter    | Type   | Required | Description                                                  |
| ------------ | ------ | -------- | ------------------------------------------------------------ |
| `path`       | string | Yes      | Path to the file to edit                                     |
| `old_string` | string | Yes      | String to replace. It must identify one location in the file |
| `new_string` | string | No       | Replacement string. Omit or leave empty to delete the match  |

The tool first tries an exact match, then a per-line whitespace-insensitive match. Paths under `/mnt/workspace/uploads/` are read-only. The timeout is 30 seconds.

### `aperture_present_files`

Make files visible for viewing and download in chat.

| Parameter | Type             | Required | Description                                                                      |
| --------- | ---------------- | -------- | -------------------------------------------------------------------------------- |
| `paths`   | array of strings | Yes      | Absolute paths under `/mnt/workspace/outputs/`. Put the most relevant file first |

The timeout is 30 seconds for the call. A call accepts at most 20 paths. Each path must be under `/mnt/workspace/outputs/` and cannot contain `..` segments.

## File system layout

The sandbox uses three directories:

```text
/home/aperture/              # Working directory (assistant's scratch space)
/mnt/workspace/
    uploads/                 # User-uploaded files (read-only)
    outputs/                 # Output files (downloadable by user)
```

**`/home/aperture/`** is the default working directory for commands. It is scratch space for scripts, temporary data, packages, and build artifacts. Scratch files might disappear between later turns.

**`/mnt/workspace/uploads/`** contains files that users attach to the conversation. This directory is read-only in the sandbox. To modify an uploaded file, the assistant must copy it to `/home/aperture/` first.

**`/mnt/workspace/outputs/`** holds final deliverables. Only files in this directory are available through `aperture_present_files` for preview and download.

## Size limits and quotas

| Limit                                                   | Value                                                                   | Behavior when exceeded                                         |
| ------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| File upload size                                        | 25 MiB per file sent to the model, 500 MiB per sandbox-only file        | Upload rejected                                                |
| Attachments per conversation                            | 20 uploaded files, across all messages                                  | Upload rejected                                                |
| Saved conversation files, when storage quotas apply     | 500 MiB combined uploads and outputs                                    | Uploads rejected with HTTP 429, new outputs might not be saved |
| New file storage per user, when storage quotas apply    | 1 GiB over a rolling 24 hours                                           | Uploads rejected with HTTP 429, new outputs might not be saved |
| New file storage per gateway, when storage quotas apply | 10 GiB over a rolling 24 hours                                          | Uploads rejected with HTTP 429, new outputs might not be saved |
| Sandbox execution capacity                              | 5 GiB combined uploads and outputs                                      | Commands and file mutations fail with a capacity error         |
| Command output                                          | 1 MiB (1,048,576 bytes)                                                 | Output truncated with notice                                   |
| Read, list, or search output                            | 16,000 bytes                                                            | Output truncated with notice                                   |
| Command timeout (`aperture_bash`)                       | 10 minutes by default, subject to the 10-minute assistant turn deadline | Command terminated                                             |
| Other tool timeout                                      | 30 seconds                                                              | Tool call fails                                                |
| Files per `aperture_present_files` call                 | 20                                                                      | Error returned                                                 |
| Directory listing                                       | 200 entries                                                             | Listing truncated                                              |

Storage quotas depend on the sandbox service available to your gateway. They can reject uploads or prevent generated files from being saved before the separate 5 GiB execution capacity is reached. Contact Tailscale support if you need higher limits. For the corresponding errors and recovery steps, refer to [storage limit exceeded][docs-storage-limit].

## Supported file types for preview

When the assistant presents output files, the chat interface renders them according to their file type:

| File type       | Extensions                                                                                | Preview behavior                                            |
| --------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Images          | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.bmp`, `.ico`, `.avif`                         | Inline image                                                |
| SVG             | `.svg`                                                                                    | Inline image (handled as a separate kind for script safety) |
| PDF             | `.pdf`                                                                                    | Inline PDF viewer                                           |
| HTML            | `.html`, `.htm`                                                                           | Sandboxed inline preview (no external resources)            |
| Markdown        | `.md`                                                                                     | Rendered inline                                             |
| Text and code   | `.txt`, `.py`, `.js`, `.jsx`, `.ts`, `.tsx`, `.go`, `.csv`, `.json`, `.yaml`, and similar | Syntax-highlighted with line numbers                        |
| Video           | `.mp4`, `.webm`, `.mov`, `.m4v`, `.mkv`, `.avi`                                           | Inline playback                                             |
| Audio           | `.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a`, `.aac`, `.opus`                                  | Inline playback                                             |
| All other types | Any                                                                                       | Download only                                               |

Source files such as `.jsx`, `.tsx`, and `.mermaid` are shown as syntax-highlighted text. The chat interface does not execute React components or render Mermaid diagrams.

HTML files are served with a restrictive Content-Security-Policy that prevents loading external resources. Inline scripts and styles are permitted, but the page runs in a sandboxed iframe with an opaque origin. This means HTML output files cannot fetch data from external URLs or load external scripts. Because the iframe omits `allow-same-origin`, the page runs with a null origin and cannot read or write `localStorage` or `sessionStorage`, or reach the parent page's cookies, storage, or DOM.

## Error messages

The following table lists user-visible error messages that may appear in the chat interface or as tool results:

| Error message                                                                                                                  | Cause                                                                          | Resolution                                                           |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `This conversation's attached files exceed the sandbox capacity (5 GiB combined). Archive or remove some files and try again.` | Files exceed the sandbox execution capacity                                    | Start a new conversation                                             |
| `Conversation storage limit reached. You can contact support to request a limit increase.`                                     | Saved uploads and outputs reach the conversation quota                         | Start a new conversation with fewer files or contact support         |
| `Storage limit reached. Try again later or contact support.`                                                                   | A rolling user or gateway storage quota is reached                             | Wait before retrying or contact support                              |
| `... output truncated (exceeded 1 MiB) ...`                                                                                    | Command produced more than 1 MiB of output                                     | Redirect output to a file, then read specific sections               |
| `... output truncated ...`                                                                                                     | File view produced more than 16,000 bytes of output                            | Use `view_range` to read a specific line range                       |
| `Error: string not found in {path}`                                                                                            | The `old_string` text was not found in the file                                | The assistant re-reads the file and retries with the correct text    |
| `Error: string appears N times in {path} (must be unique)`                                                                     | The `old_string` text appears more than once in the file                       | The assistant uses more surrounding context to make the match unique |
| `too many paths (max 20, got N)`                                                                                               | More than 20 paths passed to `aperture_present_files`                          | The assistant splits the files across multiple calls                 |
| `path must be absolute and under /mnt/workspace/outputs/`                                                                      | An `aperture_present_files` path is not under the outputs directory            | The assistant moves the file to `/mnt/workspace/outputs/` first      |
| `file not found`                                                                                                               | A file passed to `aperture_present_files` does not exist at the specified path | The assistant creates the file before presenting it                  |
| `command is required`                                                                                                          | The `aperture_bash` tool was called without a command                          | The assistant retries with a command                                 |
| `Exit code: N` (followed by output)                                                                                            | A shell command exited with a non-zero status                                  | The assistant reads the error output and adjusts its approach        |

These errors appear as tool results in the chat. In most cases the assistant handles them automatically by retrying or adjusting its approach. If the assistant cannot resolve an error, it explains the issue in its response.

For admin-facing errors (HTTP status codes from the download endpoint, sandbox connectivity issues), refer to [troubleshoot sandbox issues][docs-troubleshooting].

## Configuration

Sandbox tools are available through the user portal when the sandbox service is available and **Code Sandbox** is selected for the conversation. A user or project tool policy can disable the sandbox.

Portal access is available by default. To make matching non-admin users API-only, set `enable_portal` to `false` in a grant. This disables the entire user portal, including sandbox access. Admins always retain portal access, and an explicit `enable_portal: true` in any matching grant overrides a matching `false`.

Tailscale manages sandbox availability for your Aperture gateway. For setup instructions, refer to [enable the chat sandbox][docs-sandbox-setup].

[docs-manage-sandbox]: /docs/aperture/how-to/manage-sandbox

[docs-sandbox-feature-guide]: /docs/aperture/chat-sandbox

[docs-sandbox-setup]: /docs/aperture/how-to/enable-sandbox

[docs-troubleshooting]: /docs/aperture/troubleshooting/sandbox

[docs-storage-limit]: /docs/aperture/troubleshooting/sandbox#storage-limit-exceeded
