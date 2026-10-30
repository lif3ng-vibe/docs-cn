---
title: "v1.3: /implement-spec, /pr, /retro, and GLOSSARY.md"
slug: "skills-changelog-v13-implement-spec-pr-retro-and-glossary-md"
type: "post"
description: "Skills v1.3: /implement-spec builds a whole spec, /pr writes reviewable PR bodies, /retro improves your agent's environment, and CONTEXT.md becomes GLOSSARY.md."
updatedAt: "2026-10-05T10:57:45.922Z"
---

Version 1.3 of my skills is out. Writing code got cheap. Reading it did not. So this release is about everything around the code: three skills graduate out of `in-progress/` into the **Engineering** bucket, one skill is deleted, and one file rename needs you to act.

The full changeset is in the [v1.3.1 release](https://github.com/mattpocock/skills/releases/tag/v1.3.1). This page covers what changes for you.

## How to update

If you installed with `/plugin install`, updates come down automatically. Otherwise:

```bash
npx skills update
```

Then look in your skills folder. If `resolving-merge-conflicts` is still there, delete it. Earlier updates did not always remove deleted skills.

## Breaking: `CONTEXT.md` → `GLOSSARY.md`

The domain-doc convention is renamed everywhere the skills read and write it: `CONTEXT.md` is now `GLOSSARY.md`, and `CONTEXT-MAP.md` is now `GLOSSARY-MAP.md`. The skills look for the new names only. If `/grill-with-docs` or `/domain-modeling` made one for you, move it:

```bash
git mv CONTEXT.md GLOSSARY.md
git mv CONTEXT-MAP.md GLOSSARY-MAP.md
```

On a team, do this in one commit that everyone pulls. If one person updates the skills before the file moves, their agent starts a new, empty `GLOSSARY.md` beside the old one.

The old name came from DDD's **bounded context**. I still do DDD in all but name, but `CONTEXT.md` was too vague. It did not make the agent pull the file in at the right moments, and it confused people. Over time the file also shrank until it was only a glossary. So now the name says what it is. No behaviour changes. It is only the file name.

The skills that change: `domain-modeling`, `grill-with-docs`, `improve-codebase-architecture`, `setup-matt-pocock-skills`, `triage`, `tdd`, `diagnosing-bugs`, `ask-matt`, `codebase-design`, `wait-what` and `pr`.

## The loop

The front half of the main flow is unchanged: `/grill-with-docs` → `/to-spec` → `/to-tickets`. It ends with a **spec** and a set of **tickets**. The three new skills are the back half:

- **`/implement-spec`** takes the spec and the tickets, and builds all of it.
- **`/pr`** takes the result and writes a PR body that a human can review fast.
- **`/retro`** looks back at the session and changes the repo, so the next run is better.

## New: `/implement-spec`

`/implement` is still there. It does one ticket, and you are the dispatcher. `/implement-spec` (user-invoked) builds the whole spec in one run, on one **integration branch**: one branch where the work of each ticket lands, one ticket after another, before any of it goes near main.

There are three ways to work through a set of tickets:

1. **The manual loop.** You say "implement ticket one", wait, clear the context, say "implement ticket two". You are the for loop. It is not much fun.
2. **The deterministic loop.** A script reads each ticket and runs `/implement` on it. This is what I recommend for most people. It runs the same way every time, it is reliable, and it is cheap. But it takes patience to set up and tune. [Sandcastle](https://github.com/mattpocock/sandcastle) is one.
3. **The agent loop.** An agent does the babysitting instead of a human. This is `/implement-spec`.

The agent loop is worse than a deterministic loop. But it is a good way to start with AFK work before your software factory is dialled in, and I reach for it much more than I thought I would. It is possible now because subagents can spawn their own subagents.

The tickets are not a list of steps. They are **a task graph with blocking relationships**, and `/to-tickets` writes those relationships. So there is always a **frontier**: the tickets that nothing blocks. The run:

1. Reads the spec and the tickets, and explores the codebase in its own subagent.
2. Creates the integration branch.
3. Starts one implementer subagent for each frontier ticket, each in its own worktree. Each one builds its ticket with `/tdd`.
4. A merger subagent lands each finished ticket on the integration branch. The frontier moves, and new tickets get implementers.
5. When the graph is done, it calls `/code-review` on the full integration branch and starts a fixer.

The goal is the integration branch, not a PR. A draft PR opens only when your issue tracker closes work through PRs, or when you ask for one.

Two rough edges. The result is **one big branch**, and there is no good answer to that yet. You could use stacked PRs, but I do not want to make it GitHub-specific. And worktrees do not remove collisions, they move them to merge time: two tickets can add the same field under two names.

Treat it as a basic version of how you might implement a spec, and build your own on top of it.

## New: `/pr`

PRs are still the main bottleneck for work that gets to main. `/pr` (model-invoked) makes human review as fast and as simple as possible. All it does is give the agent a template for the PR body, in three sections.

**Summary** is a picture, not a paragraph: the smallest visual that makes the change clear. Pseudocode, a call tree, a file tree, Mermaid, or a diff sketch. The visuals come from Dex Horthy's `show-me` skill, credited in the skill's `CREDITS.md`.

**Evidence** is a **before** and an **after**: a test that failed, and now passes. Without a request for hard evidence, it is easy for an agent to say "that probably works, I read the code". When you ask for it, the agent often runs an extra test or takes an extra screenshot. Evidence is how you learn to trust your agent's output.

**Merge Danger** answers two questions:

- **One-way door or two-way door?** A two-way door is a change you can walk back through: revert the commit, and you are where you started. A one-way door does something out in the world. A migration drops a column. A rollback does not unsend a batch of emails.
- **Blast radius.** How much goes wrong if it goes wrong? One button, or every consumer of your library.

Merge Danger tells you where to spend review time. A two-way door with a small blast radius: skim it. A one-way door: read it slowly. Give the agent the spec, not only the diff, so it can make this call well.

The [v1.3 release PR](https://github.com/mattpocock/skills/pull/1120) was written with this skill.

It is one of the most reliable model-invoked skills I have seen. On Opus 5.5 it loads each time the agent writes a PR body, and you do not have to think about it. If you already have a PR body skill, take what you like from this one.

## New: `/retro`

My skills ask a lot of you. Over time, you were the one who had to improve the repo: keep `AGENTS.md` lean, keep the skills sharp, add good lint rules, keep the code easy to navigate. I was doing this by hand on my own repos, so I bundled it into a skill.

`/retro` (user-invoked) is short for retrospective. Run it on a coding session, the current one or older ones, and it suggests changes to the agent's **environment**, not the code. It reads the real session, so it sees the problems the agent hides from you. The agent does not complain as much as it should. It pushes on, and the feature gets built anyway.

It looks in seven places:

- How easy is the codebase to navigate?
- Can an **automated check** catch this?
- Is there a **coding standard** for the reviewer to enforce?
- How healthy is the global `AGENTS.md`?
- Is the tool economy good, or does a tool waste tokens?
- Are there **no-ops** in the instructions and steering files? ("Write clean, readable code" changes nothing. Delete it.)
- Does the agent have all the information it needs?

The two that matter most are checks and standards. A **mechanical** violation gets a deterministic check, full stop: a custom lint rule, a pre-commit hook, or a CI job. `CODING_STANDARDS.md` is kept for **judgement calls** only. A check can fail. A sentence in a Markdown file cannot. A repo with no guardrail at all is a finding of its own.

So the loop is: find a mistake, run `/retro`, and make the mistake impossible next time. Your `AGENTS.md` gets shorter over time, not longer.

`/retro` is human-in-the-loop. It changes nothing until you pick from its list, most serious first. Use your judgement: some findings will not matter to you. Most people ask me how to automate it. Do not. An automated retro finds false positives, keeps fixing them, and takes your repo somewhere it should not go. Instead, run it on a sample of sessions when you have a free moment, or on a session where the agent did something odd.

`/ask-matt` now puts `/retro` as the last step of the main flow, after `/code-review`. It also sends you to `/retro` after `/diagnosing-bugs`, to ask what would have prevented the bug.

## Removed: `/resolving-merge-conflicts`

Merge conflict resolution is a harness concern, not a skill concern. Nobody opts out of it, and the agent can work through an in-progress merge or rebase conflict without a dedicated skill. Nothing replaces it. It leaves the Claude Code plugin, the README and `/ask-matt`.

On a weaker model you may still want it. The [archived docs page](https://aihero.dev/skills-resolving-merge-conflicts) is still up. Copy the skill into your repo.

## Changed: skills call the Skill tool

When one skill uses another, it now says `Call the Skill tool with "grilling"`, not "run the `/grilling` skill". A skill that names another skill in prose does not reliably load it. This was the cause of the most-reported problem with `/grill-with-docs`. The new wording is also harness-neutral, because it does not assume Claude Code's `/` syntax.

A skill cannot call a user-invoked skill. So where a skill needs `/setup-matt-pocock-skills`, it now tells you to run it.

## Changed: smaller items

- **Six skills install again.** An unquoted colon in the `description` of `to-spec`, `code-review`, `setup-matt-pocock-skills`, `writing-fragments`, `writing-shape` and `wait-what` made invalid YAML, so `npx skills` skipped them. Fixed.
- **No more em-dashes.** Every em-dash in the repo is hand-rewritten.
- **`/grilling`** puts a horizontal rule between the questions in a round.
- **`/domain-modeling`** triggers when you discuss codebase terminology, or edit a `GLOSSARY.md` or an ADR.
- **`/diagnosing-bugs`** no longer hands off to `/improve-codebase-architecture` at the end. That step rarely fired. Phase 6 is now cleanup only.
- **`/wait-what`** follows `GLOSSARY-MAP.md` to the right `GLOSSARY.md` in a repo with more than one context.
