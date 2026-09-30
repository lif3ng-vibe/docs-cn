---
title: "architecture.md was reorganized into the modular as-built tree"
description: "--- kind: as-built title: architecture.md — Reorganized into the Modular As-Built Tree (Redirect Stub) status: superseded topics: [knowledge-and-context] domains: [engineering-advi"
source: "C:/Users/lif3n/AppData/Local/Temp/openrig-src/openrig/blob/99f3a35a6cd09153e84956114bb4e929bb7aeda8/docs/as-built/architecture.md"
---
:::note[Unofficial mirror]
This is an unofficial documentation mirror. [View the source on GitHub](C:/Users/lif3n/AppData/Local/Temp/openrig-src/openrig/blob/99f3a35a6cd09153e84956114bb4e929bb7aeda8/docs/as-built/architecture.md) · [Upstream repo](C:/Users/lif3n/AppData/Local/Temp/openrig-src/openrig)
:::
---
kind: as-built
title: architecture.md — Reorganized into the Modular As-Built Tree (Redirect Stub)
status: superseded
topics: [knowledge-and-context]
domains: [engineering-advisor, operating-advisor, product-advisor]
applies-when: |
  You followed an old reference to docs/as-built/architecture.md. The monolith
  was reorganized (slice-08, context-architecture-v1) into a folder of thematic
  modules. Go to README.md (map of territory) or codemap.md (use-case lookup),
  then the named module.
siblings: [README.md, codemap.md, ui.md]
prerequisite-reads: []
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---

# architecture.md was reorganized into the modular as-built tree

This single-file monolith was split into a folder of independently-loadable,
frontmatter-tagged thematic modules (slice-08, `context-architecture-v1`). The
canonical as-built description of the shipped daemon/runtime now lives in
`architecture/`. This stub is a forwarding pointer so old references still
resolve.

**Start here:**

- [`./README.md`](/as-built/README/) — the map of territory and full module index.
- [`./codemap.md`](/as-built/codemap/) — navigation index: use-case lookup table and
  source-root pointers. Use this when you know *what* you need but not *which*
  module.

## Where the major content went

The architecture content is now the **14 modules under `architecture/`**
(13 from the slice-08 reorg + `living-notes-review.md`, added v0.4.4):

| Module | What moved here |
|---|---|
| [`architecture/daemon-core.md`](/as-built/architecture/daemon-core/) | Daemon boot, `createDaemon` wiring, the SQLite schema/migration set, the route-mount surface, system overview, package boundaries. |
| [`architecture/adapters-and-runtimes.md`](/as-built/architecture/adapters-and-runtimes/) | The five-method RuntimeAdapter contract; Claude/Codex/Terminal adapters; the **Resume honesty** layer (§ Resume honesty). |
| [`architecture/coordination-primitive.md`](/as-built/architecture/coordination-primitive/) | PL-004 Phase A stream/queue/inbox/outbox; the hot-potato closure contract; durable handoff. |
| [`architecture/workflow-runtime.md`](/as-built/architecture/workflow-runtime/) | PL-004 Phase D Workflow Runtime — spec cache, instance state, step trails, transactional-scribe, watchdog policies. |
| [`architecture/mission-control.md`](/as-built/architecture/mission-control/) | PL-005 Mission Control / Queue Observability — the `/api/mission-control/*` surface, seven views, seven write verbs, action audit, bearer-token middleware. |
| [`architecture/agent-spec-and-startup.md`](/as-built/architecture/agent-spec-and-startup/) | AgentSpec/RigSpec types, profile resolution, additive startup layering, StartupOrchestrator, whoami/materialize/bind/adopt. |
| [`architecture/lifecycle-snapshot-restore.md`](/as-built/architecture/lifecycle-snapshot-restore/) | Snapshot capture, honest restore (resume vs rebuild vs fresh), the verbatim restore-honesty rules, restore-check / restore-packet probes. |
| [`architecture/transport-and-transcripts.md`](/as-built/architecture/transport-and-transcripts/) | rig send/capture/broadcast over tmux, transcript capture + search, durable SQLite chat, `rig ask`, MCP-name vs tmux-key. |
| [`architecture/workspace-primitive.md`](/as-built/architecture/workspace-primitive/) | The PL-007 typed workspace declaration, migrations 038/039, per-item repo-scope gating, file-backed missions/slices indexing. |
| [`architecture/content-surfaces.md`](/as-built/architecture/content-surfaces/) | The operator-allowlisted file browser, atomic conflict-checked writes + edit audit, the PROGRESS.md tree indexer, the Steering composer. |
| [`architecture/plugin-agent-image-context-pack.md`](/as-built/architecture/plugin-agent-image-context-pack/) | Plugin discovery, agent images, context packs, the Claude auto-compaction enforcer. |
| [`architecture/packaging-bootstrap-bundles.md`](/as-built/architecture/packaging-bootstrap-bundles/) | Bundle assembly (schema-v2 + legacy v1), bundle create/inspect/install + `/api/up`, the staged BootstrapOrchestrator, legacy install seams. |
| [`architecture/architecture-rules-and-event-system.md`](/as-built/architecture/architecture-rules-and-event-system/) | The cross-cutting invariants — the 25 architecture rules (incl. **rule 15**, restore honesty), the RigEvent union + SSE delivery, intentional compatibility limits. |
| [`architecture/living-notes-review.md`](/as-built/architecture/living-notes-review/) | **Added v0.4.4** (not part of the original monolith): the Living Notes review surface — the one intent→plan→delivered projection, staged-approval locks, proof artifacts, freeze export, ranged media serving. |

The UI half of the old `### UI architecture` section is now the **4 modules
under `ui/`** (see [`ui.md`](/as-built/ui/), also a redirect stub, and the `ui/` index
in [`./README.md`](/as-built/README/)).
