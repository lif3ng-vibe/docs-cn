---
title: "Evalite v1 Preview: Fast Evals, Built-in Scorers"
slug: "evalite-v1-preview"
type: "post"
description: "Evalite v1 ships 10 production-ready scorers (string matching, RAG evaluation, agent testing) plus in-memory storage by default. Still in beta."
tags:
  - test-and-evaluate
updatedAt: "2025-11-28T10:00:39.836Z"
---

If you've built evals before, you know the pain. Every time you need to check if your LLM's output is correct, you're writing another custom scorer. Is the SQL valid? Did it hallucinate? Is the JSON well-formed?

Evalite v1 (still in beta) solves this with 10 production-ready scorers, plus a major architecture upgrade that makes getting started trivial.

Check out the full docs at [v1.evalite.dev](https://v1.evalite.dev).

## 10 Built-In Scorers

Evalite v1 ships with scorers for the most common eval scenarios. No more reinventing the wheel.

### String Scorers

These are deterministic scorers for simple text validation:

- **exactMatch** - checks if output exactly matches expected string
- **contains** - checks if output contains a substring
- **levenshtein** - fuzzy string matching using Levenshtein distance

The **levenshtein scorer** is particularly useful for SQL generation or code output where minor formatting differences shouldn't fail the eval:

```ts
scorers: [
  {
    scorer: ({ output }) =>
      levenshtein({
        actual: output,
        expected: "SELECT * FROM users WHERE id = 1",
      }),
  },
];
```

### RAG Scorers

These use LLM-as-a-judge to evaluate RAG pipelines:

- **faithfulness** - detects hallucinations by checking if output is grounded in context
- **answerSimilarity** - compares semantic similarity between output and expected answer
- **answerCorrectness** - evaluates factual correctness against ground truth
- **answerRelevancy** - checks if output actually answers the question
- **contextRecall** - measures if all relevant context was retrieved

Example using faithfulness to catch hallucinations:

```ts
scorers: [
  {
    scorer: ({ output, input }) =>
      faithfulness({
        question: input.question,
        answer: output,
        groundTruth: input.context, // Retrieved context
        model: yourModel,
      }),
  },
];
```

### Advanced Scorers

For specialized use cases:

- **toolCallAccuracy** - evaluates if agents called the right tools with correct arguments
- **noiseSensitivity** - tests prompt robustness by adding noise and checking consistency

Tool call accuracy is essential for agent evals:

```ts
scorers: [
  {
    scorer: ({ output }) =>
      toolCallAccuracy({
        actualCalls: output.toolCalls,
        expectedCalls: [{ toolName: "search", input: { query: "..." } }],
      }),
  },
];
```

## Mix and Match Scorers

The real power comes from combining scorers. A comprehensive RAG eval might use:

```ts
scorers: [
  {
    scorer: (opts) => faithfulness({ ...opts, model: yourModel }),
  },
  {
    scorer: (opts) => answerRelevancy({ ...opts, model: yourModel }),
  },
  {
    scorer: (opts) => contextRecall({ ...opts, model: yourModel }),
  },
];
```

Each scorer returns a 0-1 score. Evalite aggregates them to give you an overall eval score.

## In-Memory by Default

The biggest architectural change: **Evalite v1 uses in-memory storage by default**.

Previously, you needed to set up SQLite, which added friction for new users. Now you can run `npx evalite` and start evaluating immediately.

Want persistence? Switch to SQLite in your config:

```ts
// evalite.config.ts
import { defineConfig } from "evalite/config";

export default defineConfig({
  storage: {
    type: "sqlite",
    path: "./evalite.db",
  },
});
```

But for most development workflows, in-memory is simpler and removes a setup step.

## Deep Vercel AI SDK Integration

Evalite v1 is built around the [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction). Wrap any AI SDK model with `wrapAISDKModel()` to get automatic tracing and caching.

### Cache Everything

**Not just scorers** - cache your entire eval pipeline. Wrap models used in your task function, in scorers, anywhere:

```ts
import { wrapAISDKModel } from "evalite/ai-sdk";
import { openai } from "@ai-sdk/openai";

const model = wrapAISDKModel(openai("gpt-4"));

evalite("RAG Eval", {
  data: [...],
  task: async (input) => {
    // Cached automatically
    const result = await generateText({
      model,
      prompt: input.question,
    });
    return result.text;
  },
  scorers: [
    {
      // Also cached automatically
      scorer: (opts) => faithfulness({ ...opts, model }),
    },
  ],
});
```

This transforms watch mode. Change scorer logic, tweak thresholds, refactor eval structure - the expensive LLM calls stay cached. Only run what changed.

```bash
evalite watch
```

The wrapper works across all AI SDK methods: `generateText()`, `streamText()`, `generateObject()`, and `streamObject()`.

**Zero overhead in production** - `wrapAISDKModel()` is a no-op when called outside Evalite's context. Your production code runs exactly as before.

## DX Improvements

The biggest DX improvement is **auto .env support**. Environment variables load automatically.

The Evalite UI got several upgrades:

- **Dark mode** - Theme switcher for light/dark preferences
- **Table rendering** - Objects and arrays render as markdown tables instead of JSON trees
- **Rerun button** - Re-run evals in watch mode without restarting
- **AI SDK message UI** - Pass AI SDK messages directly and get custom UI rendering

## Getting Started

Evalite v1 is still in active development (beta). There's no formal migration guide yet as features are still evolving.

To try it:

```bash
pnpm install evalite@beta
```

Full documentation at [v1.evalite.dev](https://v1.evalite.dev).

## Feedback Welcome

Since v1 is still beta, your feedback shapes the final release. Found a bug? Want a scorer we're missing?

Join the discussion on [Discord](https://aihero.dev/discord) or open an issue on [GitHub](https://github.com/mattpocock/evalite).
