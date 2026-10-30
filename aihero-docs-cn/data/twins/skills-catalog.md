---
title: "AI Skills for Real Engineers"
slug: "skills-catalog"
type: "list"
description: "A practical skill system for engineers who want to use AI without giving up their standards."
updatedAt: "2026-05-05T11:14:31.998Z"
---

These are the agent skills I lean on every day. They live in my `~/.claude` directory and ship as a public repo so anyone can install them, fork them, or open a PR with their own.

## What's a skill?

A skill is a focused, repeatable workflow an agent can run. It bundles a clear instruction set, the inputs it needs, and the outputs you should expect. Skills live as small markdown files that any Claude-compatible agent picks up.

The point isn't to wrap the agent in scaffolding. It's to write down the exact moves I'd make for a given problem so the agent runs them the same way I would, every time.

## Install

One command pulls the whole catalog into your global skills directory:

```sh
npx skills add mattpocock/skills -y -g
```

Drop `-g` to install into the current project only. Once installed, any agent that reads `~/.claude/skills` (Claude Code is the obvious one) can pick a skill from the catalog and run it.

You can also install individual skills if you don't want the whole set. Browse the source for slugs: [github.com/mattpocock/skills](https://github.com/mattpocock/skills).

## How I use them

Each skill below is a workflow I reach for in a specific moment: a vague spec to interrogate, a domain to model, a PRD to write, a backlog to break down, a feature to test-drive. They aren't "AI productivity hacks." They're how I keep my taste and standards intact while the agent does the work.

## Open source

The catalog lives at [github.com/mattpocock/skills](https://github.com/mattpocock/skills). If you've shaped a skill that's earned its place in your workflow, share it.