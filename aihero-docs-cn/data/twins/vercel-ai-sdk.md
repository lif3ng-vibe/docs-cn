---
title: "Vercel's AI SDK Future-proofs Your AI Stack"
slug: "vercel-ai-sdk"
type: "post"
description: "Future-proof your AI features with Vercel's AI SDK. Write once, run anywhere across OpenAI, Anthropic, and other LLM providers."
updatedAt: "2025-01-02T08:47:06.972Z"
---

The AI landscape changes weekly. Your code shouldn't need to.

That's why [Vercel's AI SDK](https://sdk.vercel.ai/docs/introduction) is **one of the first tools I reach for** when I'm building an AI-powered feature in TypeScript. It's so good that I'm planning to make it a **foundational building block of AI Hero**.

## Vendor Lock-In Sucks

**Every LLM provider ships its own API**, with slightly different features and quirks. If you build your app directly on top of one of these APIs, you're often too deeply integrated to easily switch.

While these API's (and SDK's) look similar enough on the surface, **switching between them is a pain** - you often need to write a lot of wrapper code to handle the differences between them.

Here's what some typical wrapper code for handling different providers looks like:

```ts
// This example is BAD - what code looks like without
// Vercel's AI SDK.

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// 1. Initialize both clients
const openai = new OpenAI({
  apiKey: "my_api_key",
});
const anthropic = new Anthropic({
  apiKey: "my_api_key",
});

// 2. Switch between them based on the client
const ask = async (
  question: string,
  client: "openai" | "anthropic",
) => {
  // If we're using OpenAI, use their SDK
  if (client === "openai") {
    return await openai.chat.completions.create({
      messages: [{ role: "user", content: question }],
      model: "gpt-4o",
    });
  } else {
    // If we're using Anthropic, use their SDK
    return await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: question }],
    });
  }
};
```

This only gets worse and worse as you add providers, especially if each provider has its own quirks and features. It makes it **especially hard to switch models** if a new model comes along - so your app can get stuck in vendor lock-in quicksand.

Check the appendices below for an even more horrible example - streaming.

## A Single, Unified API

Vercel's AI SDK solves this problem by providing a **single, unified API** that wraps around all the major LLM providers. Here's what the same code looks like with Vercel's AI SDK:

```ts
import { generateText, type LanguageModel } from "ai";

export const ask = async (
  prompt: string,
  model: LanguageModel,
) => {
  const { text } = await generateText({
    model,
    prompt,
  });

  return text;
};
```

Now, we can pass in _any_ model supported by the AI SDK into `ask`, and it'll work:

```ts
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

const prompt = `Tell me a story about your grandmother.`;

const anthropicResult = await ask(
  prompt,
  anthropic("claude-3-5-haiku-latest"),
);

const openaiResult = await ask(
  prompt,
  openai("gpt-4o-mini-2024-07-18"),
);
```

This makes it **_much easier_ to switch between models** - your entire app can be built on top of the AI SDK, and you can switch models with a single line of code.

It also means you get to **learn the API once** and use it across all your projects. This is a huge win for productivity, especially if you're building a lot of AI-powered features.

## Appendices

### Supported Providers

The AI SDK currently supports these providers, but [more are being added](https://sdk.vercel.ai/providers/ai-sdk-providers) all the time:

| Provider             | Models                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------ |
| OpenAI               | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-4`, `o1`, `o1-mini`, `o1-preview`             |
| Anthropic            | `claude-3-5-sonnet-20241022`, `claude-3-5-sonnet-20240620`, `claude-3-5-haiku-20241022`    |
| Mistral              | `pixtral-large-latest`, `mistral-large-latest`, `mistral-small-latest`, `pixtral-12b-2409` |
| Google Generative AI | `gemini-2.0-flash-exp`, `gemini-1.5-flash`, `gemini-1.5-pro`                               |
| Google Vertex        | `gemini-2.0-flash-exp`, `gemini-1.5-flash`, `gemini-1.5-pro`                               |
| xAI Grok             | `grok-2-1212`, `grok-2-vision-1212`, `grok-beta`, `grok-vision-beta`                       |
| Groq                 | `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`, `gemma2-9b-it`    |

### An Even More Horrible Example

Here's another example of the differences between providers: streaming completions. OpenAI's streaming responses look like this:

```ts
const stream = await openai.chat.completions.create({
  messages: [{ role: "user", content: prompt }],
  model: "gpt-4",
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    // Each chunk contains a delta of new content
    process.stdout.write(content);
  }
}
```

But Anthropic's look like this:

```ts
const stream = await anthropic.messages.create({
  messages: [{ role: "user", content: prompt }],
  model: "claude-3-sonnet",
  stream: true,
});

for await (const chunk of stream) {
  if (chunk.type === "content_block_delta") {
    // Anthropic uses a different structure with content blocks
    process.stdout.write(chunk.delta.text);
  }
}
```

Instead, with Vercel's AI SDK, you can just do this:

```ts
const ask = async (
  prompt: string,
  model: LanguageModel,
) => {
  const { textStream } = await streamText({
    model,
    prompt,
  });

  // The textStream is the same for all providers!
  for await (const chunk of textStream) {
    process.stdout.write(chunk);
  }
};
```

Fabulous.

### Links

- [OpenAI's Node SDK](https://github.com/openai/openai-node)
- [Anthropic's Node SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Vercel's AI SDK](https://sdk.vercel.ai/docs/introduction)
