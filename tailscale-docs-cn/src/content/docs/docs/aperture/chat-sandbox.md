---
title: "Chat sandbox"
description: "Run code, analyze data, and create downloadable files in an isolated Linux environment during a chat conversation."
---

Last validated Sep 28, 2026

> **Note:** Aperture chat sandbox is currently in alpha.

\[Missing snippet: contact\_account\_manager.mdx]

The chat sandbox gives the assistant a private Linux environment to run code, edit files, and share downloadable files during a conversation.

After Tailscale enables the sandbox for your Aperture gateway, it starts automatically on the first request that needs it. You do not need to launch a separate environment or select it for each conversation.

## What you can do with the sandbox

The sandbox supports a broad range of tasks:

* **Run code and shell commands**: Execute Python, Node.js, Go, or shell scripts. Install additional packages with pip, npm, or apt as needed.
* **Analyze data and create visualizations**: Upload a CSV or spreadsheet and ask the assistant to summarize it, compute statistics, or generate charts.
* **Generate documents**: Produce reports, presentations (PPTX), Word documents (DOCX), spreadsheets, or any file format the assistant can build with available tools.
* **Transform files**: Resize images, convert between formats, extract text from PDFs, or process uploaded files in other ways.
* **Develop and iterate**: Write code across multiple turns, fix errors, rebuild, and refine output.

## How the sandbox works

Each conversation has an isolated Linux environment with development tools, writable storage, and restricted internet access:

* **Starts on demand**: The environment starts when the assistant first runs a command or creates a file. The first sandbox action in a conversation might take a few extra seconds.
* **Provides temporary scratch space**: Scratch files and installed packages last only while the environment remains active. Saved uploads and output files remain associated with the conversation.
* **Separates conversations**: Each conversation has its own environment and cannot access another conversation's files or state.
* **Restricts outbound access**: The sandbox can reach only approved package registries and source hosts, such as PyPI, npm, Go, Maven, Ubuntu apt, and GitHub.
* **Is isolated from your network**: Sandbox code cannot access your tailnet or Aperture internal systems.

## Working with files

The sandbox organizes files into three areas with distinct roles:

### Files you upload

When you attach a file to a message, the assistant can read it inside the environment. Uploaded files are read-only from the assistant's perspective. If the assistant needs to modify an uploaded file, it copies the file to its working space first, then works on the copy.

### Working space

The assistant uses a private working directory for dependencies, draft scripts, and builds. You cannot view this scratch space, and its contents might disappear between turns.

### Output files

When the assistant finishes a deliverable, it places the file in an output directory and shares it with you. Shared files appear as file cards in the chat. You can preview supported file types inline or download any file.

> **Note:**
>
> If you upload two files with the same name in a single conversation, the second file replaces the first. Use distinct filenames to avoid overwriting.

## File preview support

When the assistant shares a file, the chat interface renders it based on its type. Some file types display inline, while others are available as downloads.

| File type                                              | Behavior                                         |
| ------------------------------------------------------ | ------------------------------------------------ |
| Images (PNG, JPG, GIF, WebP)                           | Inline image                                     |
| SVG                                                    | Inline image (scripts sandboxed)                 |
| PDF                                                    | Inline PDF viewer                                |
| HTML                                                   | Sandboxed inline preview (no external resources) |
| Markdown                                               | Rendered inline                                  |
| Text and code files                                    | Syntax-highlighted with line numbers             |
| Video                                                  | Inline playback                                  |
| Audio                                                  | Inline playback                                  |
| All other types (Office documents, archives, binaries) | Download only                                    |

Source files such as `.jsx`, `.tsx`, and `.mermaid` are shown as syntax-highlighted text. The chat interface does not execute React components or render Mermaid diagrams.

> **Warning:**
>
> HTML previews run in a restricted environment. They can execute inline scripts, but they cannot load external resources, use browser storage (`localStorage` or `sessionStorage`), or access data from other pages. If you need full interactivity, download the HTML file and open it in your browser.

## Limits

The following limits apply to the sandbox:

| Limit                        | Value                                                       |
| ---------------------------- | ----------------------------------------------------------- |
| Sandbox execution capacity   | 5 GiB combined uploads and outputs                          |
| Command timeout              | 10 minutes per command                                      |
| Output per command           | 1 MiB (truncated with notice if exceeded)                   |
| File upload size             | 25 MiB per file the model can read, 500 MiB for other files |
| Attachments per conversation | 20 uploaded files                                           |

Separate storage quotas can apply before the sandbox reaches its execution capacity:

* 500 MiB of saved files per conversation
* 1 GiB of new file storage per user over a rolling 24 hours
* 10 GiB of new file storage per gateway over a rolling 24 hours

Aperture rejects uploads that exceed a quota and might not save generated files. Refer to the [sandbox reference][docs-sandbox-reference] for details.

Upload limits depend on how the assistant reads the file:

* **25 MiB** for files sent to the model with your message: JPEG, PNG, GIF, WebP, PDF, plain text, and supported office documents.
* **500 MiB** for all other files, including video, audio, and archives. The model receives a placeholder and uses sandbox commands to work with the file.

The 20-attachment limit applies across the conversation, not per message. Uploading in smaller batches does not increase it. The next upload fails with `You can add at most 20 attachments to a conversation. Please select fewer attachments.`

The separate 20-path limit on `aperture_present_files` controls how many output files the assistant can share in one call.

## Known limitations

* **No state between conversations**: Each conversation starts with a fresh environment. The assistant cannot access files or packages from a previous conversation. If you need to continue work, upload the relevant files to a new conversation.
* **Large command output is truncated**: Commands that produce more than 1 MiB of output are truncated. The assistant can work around this by redirecting output to a file and inspecting specific sections.
* **HTML previews are restricted**: Previewed HTML files cannot load external scripts or stylesheets, use `localStorage` or `sessionStorage`, or access browser APIs that require a full origin. Interactive web applications that depend on these features will not work in the preview.
* **No GPU access**: The environment does not have GPU hardware. Tasks that require GPU acceleration, such as training large machine learning models, are not supported.

## Related

* [Enable the chat sandbox][docs-enable-sandbox] for step-by-step setup instructions.
* [Sandbox reference][docs-sandbox-reference] for tool parameters, size limits, timeouts, and error messages.
* [Manage sandbox operations][docs-manage-sandbox] for monitoring and other operational tasks.
* [Troubleshoot sandbox issues][docs-troubleshoot-sandbox] for diagnosing common problems.

[docs-enable-sandbox]: /docs/aperture/how-to/enable-sandbox

[docs-manage-sandbox]: /docs/aperture/how-to/manage-sandbox

[docs-sandbox-reference]: /docs/aperture/reference/sandbox

[docs-troubleshoot-sandbox]: /docs/aperture/troubleshooting/sandbox
