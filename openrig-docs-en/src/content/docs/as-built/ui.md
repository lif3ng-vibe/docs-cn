---
title: "ui.md was reorganized into the modular as-built tree"
description: "--- kind: as-built title: ui.md — Reorganized into the Modular As-Built Tree (Redirect Stub) status: superseded topics: [knowledge-and-context] domains: [engineering-advisor, opera"
source: "C:/Users/lif3n/AppData/Local/Temp/openrig-src/openrig/blob/99f3a35a6cd09153e84956114bb4e929bb7aeda8/docs/as-built/ui.md"
---
:::note[Unofficial mirror]
This is an unofficial documentation mirror. [View the source on GitHub](C:/Users/lif3n/AppData/Local/Temp/openrig-src/openrig/blob/99f3a35a6cd09153e84956114bb4e929bb7aeda8/docs/as-built/ui.md) · [Upstream repo](C:/Users/lif3n/AppData/Local/Temp/openrig-src/openrig)
:::
---
kind: as-built
title: ui.md — Reorganized into the Modular As-Built Tree (Redirect Stub)
status: superseded
topics: [knowledge-and-context]
domains: [engineering-advisor, operating-advisor, product-advisor]
applies-when: |
  You followed an old reference to docs/as-built/ui.md. The monolith was
  reorganized (slice-08, context-architecture-v1) into the ui/ module folder.
  Go to README.md (map of territory) or codemap.md (use-case lookup), then the
  named ui/ module.
siblings: [README.md, codemap.md, architecture.md]
prerequisite-reads: []
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---

# ui.md was reorganized into the modular as-built tree

This single-file UI monolith was split into a folder of independently-loadable,
frontmatter-tagged thematic modules (slice-08, `context-architecture-v1`). The
canonical as-built description of the shipped operator UI now lives in `ui/`.
This stub is a forwarding pointer so old references still resolve.

**Start here:**

- [`./README.md`](/as-built/README/) — the map of territory and full module index.
- [`./codemap.md`](/as-built/codemap/) — navigation index: use-case lookup table and
  source-root pointers. Use this when you know *what* you need but not *which*
  module.

## Where the major content went

The UI content is now the **4 modules under `ui/`**:

| Module | What moved here |
|---|---|
| [`ui/shell-and-routing.md`](/as-built/ui/shell-and-routing/) | Package shape, the `AppShell` shell model (rail / Explorer / center workspace / drawer / preview stack), the route tree, design primitives, the shared detail-drawer/viewer system, event/activity consumption. |
| [`ui/topology.md`](/as-built/ui/topology/) | The topology surface — host hybrid graph, table/terminal views, the activity-ring / hot-potato visual language, terminal-preview popovers, navigation/overlay contracts. |
| [`ui/project-and-for-you.md`](/as-built/ui/project-and-for-you/) | The operator destination surfaces — Project observability (workspace/mission/slice scope tabs), the For-You attention feed (5-card classifier + queue actions), the Dashboard landing on the vellum brand system. |
| [`ui/library-specs-and-design-system.md`](/as-built/ui/library-specs-and-design-system/) | The Library (`/specs`) UI — specs/applications/skills surfaces, the graphics layer, the current design constraints, and the design-system pointer to `../DESIGN.md`. |

The brand/design rules still live at `docs/DESIGN.md` (repo `docs/` root, by
design — see `ui/library-specs-and-design-system.md`).
