---
title: "This Hook Stops Claude Code Running Dangerous Git Commands"
slug: "this-hook-stops-claude-code-running-dangerous-git-commands"
type: "post"
description: "Learn how to block dangerous git commands in Claude Code using a PreToolUse hook. Prevent accidental data loss with git guardrails."
tags:
  - set-up-your-agent
updatedAt: "2026-02-10T14:25:36.457Z"
---

I've put together a skill to allow you to prevent Claude code from ever running dangerous git commands. Add it via `npx skills add`:

```bash
npx skills add mattpocock/skills/skills/misc/git-guardrails-claude-code
```

Claude will guide you through the setup - choose whether to install it for your current project or globally across all projects, then customize which git commands you want to block.

## Why This Skill Exists

### The Docker Sandbox Story

I've been experimenting with [Ralph-style workflows](https://www.aihero.dev/getting-started-with-ralph) recently, and the most powerful way I've found to get Claude to run autonomously is via [Docker Sandbox](https://docs.docker.com/ai/sandboxes/).

It lets Claude Code run in YOLO without asking permission for every command. And it protects your system by running it inside a microVM. You can let your agent work unattended while you check in every few minutes.

The tradeoff? Docker Sandbox doesn't restrict _what_ commands Claude can run, it just isolates _where_ they run.

### The Gap Docker Sandbox Leaves

Here's the problem: your git history lives inside that sandboxed folder.

Docker Sandbox prevents Claude from reaching outside the project directory, but it can't stop Claude from running destructive git commands _within_ that directory. A single `git reset --hard` or `git push --force` can wipe out weeks of work.

This skill fills that gap with a hard guardrail - preventing Claude Code from running dangerous commands.

## What Gets Blocked

The skill blocks these dangerous patterns by default:

- `git push` (all variants, including `--force`)
- `git reset --hard`
- `git clean -f` / `git clean -fd`
- `git branch -D`
- `git checkout .` / `git restore .`

These aren't "never allow" rules, they're "safe by default" rules.

You can customize the blocked patterns during installation, or edit them anytime. If your workflow legitimately needs Claude to push to a remote PR, you can allow it.

## How It Works: The Hook System

The skill uses a `PreToolUse` hook that intercepts bash commands before Claude executes them.

Here's the filtering script:

```bash
#!/bin/bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

DANGEROUS_PATTERNS=(
  "git push"
  "git reset --hard"
  "git clean -fd"
  "git clean -f"
  "git branch -D"
  "git checkout \."
  "git restore \."
  "push --force"
  "reset --hard"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches dangerous pattern '$pattern'. The user has prevented you from doing this." >&2
    exit 2
  fi
done

exit 0
```

The script reads the incoming command, checks it against the danger list, and blocks execution if it matches.

### What Claude Sees

When Claude tries to run a blocked command, it sees a clear message:

```
BLOCKED: 'git push origin main' matches dangerous pattern 'git push'.
The user has prevented you from doing this.
```

Claude understands the constraint and adapts. It's a hard guardrail, not a suggestion buried in prose.

## Verify It's Working

After installation, test the guardrail:

1. Clear your conversation context
2. Ask Claude to run `git push`
3. Watch it fail and see the blocked message

This confirms the hook is active and Claude can't accidentally bypass it.

## Conclusion

Enjoy! These kinds of skills are great fun to put together, and if you're looking for more of them, join my newsletter.
