---
title: "Orca skills registry &amp; MCP"
description: "Install Orca agent skills with npx skills add. Hybrid stubs stay thin; orca skills get serves the version-matched guide. Orca can update skills in the background."
source: "https://www.onorca.dev/docs/cli/skills"
---

# Orca skills registry & MCP

Install Orca agent skills with npx skills add. Hybrid stubs stay thin; orca skills get serves the version-matched guide. Orca can update skills in the background.

Orca ships **skills** that agents install into their skill directories. Public install packages are **hybrid discovery stubs**: short `SKILL.md` files that tell the agent *when* to engage Orca and how to load the full guide from the running CLI. Command flags live in the binary so they cannot drift from the app version.

## Installable Orca skills

Use `npx skills add` with the public Orca repo and the skill name. Default agent setup usually installs `orca-cli`, `computer-use`, and `orchestration`.

| Skill | Install | Use it for |
| --- | --- | --- |
| [`orca-cli`](#orca-cli) | `npx skills add https://github.com/stablyai/orca --skill orca-cli --global` | Worktrees, terminals, files, automations, embedded browser. |
| [`orchestration`](#orchestration) | `npx skills add https://github.com/stablyai/orca --skill orchestration --global` |

## Hybrid stubs vs the live guide

After `npx skills add`, agents see a short stub that says:

1. Resolve the CLI executable for this session (`ORCA_CLI_COMMAND`, `orca-dev`, Linux `orca-ide`, else `orca`).
2. Load the full guide: `orca skills get <topic>` (or `--full` for the long guide).
3. Prefer `--json` and do not invent flags from memory.

```
orca skills list
orca skills get orca-cli
orca skills get orchestration --full
orca skills get orca-linear --json
```

Add `--json` when an agent needs deterministic output for automation. `skills show` is an alias for `skills get`.

## Keep skills up to date

When Orca ships a newer skill package than the one installed globally, the app can:

- Show an **update available** nudge (and **Needs attention** when a copy is out of date somewhere the updater cannot safely rewrite).
- Open **Update skills** — list of placements and skip reasons, then run **`npx --yes skills update <names> --global -y`** headlessly (no embedded terminal).
- Keep the run in the **background**: closing the dialog does not cancel it. A status-bar segment shows progress (spinner while running, brief success check, persistent failure until you act). Click the segment to reopen the dialog.
- Surface freshness on **Settings → Agents** for installed skills (global install rail), including **Details** when a row needs review.

Manual equivalent (desktop Settings still shows the same `npx` form):

```
npx skills update orca-cli orchestration computer-use --global
```

On headless hosts (SSH, containers, CI, `orca serve`) with no Settings UI, use the local CLI wrappers — they resolve the same `npx` commands, add non-interactive flags, and do **not** need a running Orca runtime:

```
orca skills install # list installable names
orca skills install --skill orca-cli --skill orchestration
orca skills install --skill orca-cli --agent claude-code,codex
orca skills install --all --dry-run
orca skills update --all
orca skills update --skill orca-cli --dry-run
```

- Default scope is **global** (`--global`); pass `--local` for the current project only.
- `install` targets agents Orca detects on the host (plus the shared `.agents/skills` directory). Use `--agent <name>[,<name>…]` or `--agent universal` to override; if no agent is detected, `--agent` is required.
- `update` only refreshes skills that are already installed.
- `--dry-run` prints the resolved command; `--json` is only valid with listing / `--dry-run`.

Prefer the in-app updater when Orca offers it so the same global placements the app scanned get rewritten. Rows marked **Skipped** explain why that skill cannot be updated automatically (for example missing source registration) — fix the placement, then re-check.

## orca-cli

```
npx skills add https://github.com/stablyai/orca --skill orca-cli --global
```

After install, load the version-matched command guide with `orca skills get orca-cli`. See [Orca CLI](/cli/overview).

## orchestration

```
npx skills add https://github.com/stablyai/orca --skill orchestration --global
```

Use this when an agent should coordinate other agents through Runs, tasks, supervised workers, and decision gates. See [Orchestration](/cli/orchestration). Always load `orca skills get orchestration --full` before mutating orchestration state — the legacy `orchestration run` command is retired.

## computer-use

```
npx skills add https://github.com/stablyai/orca --skill computer-use --global
```

Use this when an agent needs to inspect and operate local desktop app windows. See [Computer use](/cli/computer-use).

## orca-linear

```
npx skills add https://github.com/stablyai/orca --skill orca-linear --global
```

Agents should load `orca skills get orca-linear` before mutating tickets. Covers `issue --full`, `save-issue`, `list-issues`, relations, completion attach+comment flow, and untrusted-ticket rules. Existing `linear-tickets` installs still resolve. See [CLI reference → Linear](/cli/reference#linear).

## orca-emulator

```
npx skills add https://github.com/stablyai/orca --skill orca-emulator --global
```

Use this when an agent should control an iOS Simulator from inside Orca through `orca emulator` commands.

## orca-emulator-android

```
npx skills add https://github.com/stablyai/orca --skill orca-emulator-android --global
```

Use for adb-connected Android AVDs/devices: list/boot, tap/swipe/type, hardware buttons, install/launch, permissions, accessibility tree, logcat. Load details with `orca skills get orca-emulator-android`.

## orca-per-workspace-env

```
npx skills add https://github.com/stablyai/orca --skill orca-per-workspace-env --global
```

Use when setting up or debugging per-workspace environment recipes in `orca.yaml`. See [Ways to run Orca](/ways-to-run#4-cloud-vms-per-workspace-environments).

## Discovery sources

Orca's skill UI scans installed skill homes for Claude, Codex, Agent Skills, and **OMP** (`~/.omp/agent/skills`), so skills placed there show up without a manual symlink.

## Add your own skills

Any repo with a `skills/<name>/SKILL.md` file can be installed via `npx skills add`. Point your agent at internal repos to give it company-specific powers.

## MCP servers

Model Context Protocol (MCP) servers expose external tools to compatible agents. Register MCP endpoints under [Settings → Integrations → MCP](/settings); those tools appear inside agent CLIs that support MCP.
