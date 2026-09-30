---
title: "Developing OpenRig — gates and lanes"
description: "This is the contributor-facing statement of which checks BLOCK a change and which are advisory. There is no external CI at this tip: the root package.json script chain IS the gate,"
source: "C:/Users/lif3n/AppData/Local/Temp/openrig-src/openrig/blob/99f3a35a6cd09153e84956114bb4e929bb7aeda8/docs/reference/developing.md"
---
:::note[Unofficial mirror]
This is an unofficial documentation mirror. [View the source on GitHub](C:/Users/lif3n/AppData/Local/Temp/openrig-src/openrig/blob/99f3a35a6cd09153e84956114bb4e929bb7aeda8/docs/reference/developing.md) · [Upstream repo](C:/Users/lif3n/AppData/Local/Temp/openrig-src/openrig)
:::

This is the contributor-facing statement of which checks BLOCK a change and which are
advisory. There is no external CI at this tip: the root `package.json` script chain IS
the gate, and the release checklists invoke it.

## Blocking gates (must pass before a candidate moves)

| Gate | Command | Covers |
|---|---|---|
| Typecheck | `npm run lint` | daemon + **ui** + cli + tui tsconfigs — UI typecheck STAYS blocking |
| Build | `npm run build` | all workspaces — the UI dist ships in the package, so its build STAYS blocking |
| Repo scripts | `npm run test:repo` | script self-tests, docs guard, skill mirror check |
| Unit tests | `npm run test:workspaces` | `packages/daemon` + `packages/cli` + `packages/tui` |

`npm test` runs `test:repo` and `test:workspaces` — the blocking set is readable in the
script itself.

## Advisory lane

| Lane | Command | Meaning |
|---|---|---|
| UI unit tests | `npm run test:ui` | runs `packages/ui` vitest at will; NOT part of `npm test` |

## The norm (web-UI freeze at 0.5.0)

Daemon API changes no longer require UI sync or UI verification; the contract mirrors
under `packages/ui/src/hooks/` are no longer proactively maintained; a new `test:ui`
failure signals a moved API contract, not a broken gate.

Browser/interaction testing of the web UI is not a contributor gate. (The packaged
starter-rig agent skills that exercise the UI are product content for user rigs, not
part of this repo's gates.)

## Wording rule

The web UI is **experimental**, in **maintenance mode**, supported **best-effort**;
**the CLI is primary**. There is no scheduled removal and PRs are welcome. Do not
describe the UI with stronger end-of-life language than this section uses.
