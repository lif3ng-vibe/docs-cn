---
title: "How To Use Claude Code Hooks To Enforce The Right CLI"
slug: "how-to-use-claude-code-hooks-to-enforce-the-right-cli"
type: "post"
description: "Learn how to use Claude Code hooks to prevent unwanted CLI commands and guide your AI coding agent to use the right tools instead of CLAUDE.md."
tags:
  - set-up-your-agent
updatedAt: "2026-02-25T10:51:12.741Z"
---

One of the most common questions I get about Claude Code is: how do I force it to use the right CLI command?

How do I get it to use `pnpm` instead of `npm`? How do I get it to call my wrapper script instead of using `npx` directly? How do I block it from running certain commands entirely?

## The Problem with CLAUDE.md

The obvious answer is to put an instruction in your `CLAUDE.md` file:

```
Use pnpm instead of npm for all package management tasks.
```

This works most of the time. But there are two problems.

**It wastes instruction budget.** This instruction is only relevant when Claude runs a package manager command. Putting it in `CLAUDE.md` makes it global context for every task in the repo. LLMs have a limited instruction budget—around 500 instructions before they start getting confused. You want that budget spent on the hard stuff: planning, implementation, architecture. Not reminders about which package manager to use.

**It's not deterministic.** Adding "don't use `git push`" to your `CLAUDE.md` _reduces_ the chance of a force push. It doesn't _prevent_ it. You're burning instruction budget on something that still isn't guaranteed.

## Claude Code Hooks: A Deterministic Solution

Hooks let you run deterministic code at specific points during Claude Code's execution cycle. They're configured in your `.claude/settings.json` file.

The hook we care about is `PreToolUse`. It fires before a tool call executes and can block it. If the hook exits with code `2`, the action is blocked and the error message is fed back to Claude so it can adjust.

Here's the structure of a `PreToolUse` hook that blocks a Bash command:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/enforce-pnpm.sh"
          }
        ]
      }
    ]
  }
}
```

The hook script receives JSON on stdin with the tool name and arguments. It checks the command, and either exits `0` to allow it or exits `2` to block it:

```sh
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

if echo "$COMMAND" | grep -qE "^npm "; then
  echo "Blocked: use pnpm instead of npm" >&2
  exit 2
fi

exit 0
```

Claude sees the "use pnpm instead of npm" message and retries with the correct command. No instruction budget wasted, and the wrong command is impossible to run.

## The Prompt

You don't need to write these hooks by hand. Claude Code already knows how to create them. Here's a prompt you can paste directly into Claude Code that converts your `CLAUDE.md` instructions into deterministic hooks:

````markdown
Take the instructions in your @CLAUDE.md file and turn them into
deterministic Claude Code hooks in this project directory.

Not all the instructions will be deterministic: only do the ones you can,
such as instructions to use one CLI command over another, or disallowing
certain CLI commands.

Hooks should be added to `.claude/settings.json` under the `hooks` key,
using the `PreToolUse` event with a `Bash` matcher.

Use separate bash scripts in `.claude/hooks/` for running the hooks:

```sh
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q "drop table"; then
  echo "Blocked: dropping tables is not allowed" >&2
  exit 2
fi

exit 0
```

First, confirm with the user which hooks will be created.

Second, implement the hooks.

Third, provide the user with instructions to test the newly created hooks
(by restarting Claude Code).
````

The prompt tells Claude to read your existing `CLAUDE.md`, identify which instructions can be enforced deterministically, and convert them into `PreToolUse` hook scripts. It asks for confirmation before creating anything, then walks you through testing.
