---
title: "Streaming In 'Next Question Suggestions' With Vercel's AI SDK"
slug: "streaming-in-next-question-suggestions-with-the-ai-sdk"
type: "post"
description: "Stream AI-powered next question suggestions with the AI SDK."
updatedAt: "2025-08-24T12:17:16.084Z"
---

One extremely common pattern for AI-powered apps is to provide suggested next questions for the user to ask. This lets users who are not familiar with these interfaces get started quickly.

Let's look at a basic implementation where when we initiate a conversation, it suggests next questions that stream in as the user requests them.

## High-Level Overview

The implementation involves a POST request to `/api/chat`, receiving UI messages from the body. These UI messages get converted into model messages before the main processing begins.

The flow consists of two streams combined into one parent stream:
1. The first stream for our initial response
2. The second stream for follow-up suggestions

To compose these streams together, we create a parent stream with `createUIMessageStream`, which exposes a writer:

```typescript
const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    // Stream initial response
    const messagesFromResponse = await streamInitialResponse(modelMessages, writer);

    // Generate follow-up suggestions
    const followupSuggestions = generateFollowupSuggestions([
      ...modelMessages,
      ...messagesFromResponse,
    ]);

    // Stream the suggestions to frontend
    await streamFollowupSuggestionsToFrontend(followupSuggestions, writer);
  },
});
```

## Streaming the Initial Response

Here's how the initial response is streamed:

```typescript
const streamInitialResponse = async (
  modelMessages: ModelMessage[],
  writer: UIMessageStreamWriter<MyMessage>,
) => {
  // 1. Stream the initial response - can be any
  // streamText call with tool calls, etc.
  const streamTextResult = streamText({
    model: mainModel,
    messages: modelMessages,
  });

  // 2. Merge the stream into the UIMessageStream
  writer.merge(streamTextResult.toUIMessageStream());

  // 3. Consume the stream - this waits until the
  // stream is complete
  await streamTextResult.consumeStream();

  // 4. Return the messages from the response, to
  // be used in the followup suggestions
  return (await streamTextResult.response).messages;
};
```

This function calls `streamText` using the Gemini 2.0 Flash model (though you could use any model with the AI SDK). The stream is merged into the UI message stream using `writer.merge`, and we wait for the stream to complete with `streamTextResult.consumeStream()`.

Finally, we return the messages produced by the call, which will be used in the next function.

## Generating Follow-Up Suggestions

After getting the initial response, we pass both the original messages and the response messages to `generateFollowupSuggestions`:

```typescript
const generateFollowupSuggestions = (
  modelMessages: ModelMessage[],
) =>
  // 1. Call streamObject, which allows us to stream
  // structured outputs to the frontend
  streamObject({
    model: suggestionsModel,
    // 2. Pass in the full message history
    messages: [
      ...modelMessages,
      // 3. And append a request for followup suggestions
      {
        role: 'user',
        content:
          'What question should I ask next? Return an array of suggested questions.',
      },
    ],
    // 4. These suggestions are made type-safe by
    // this Zod schema
    schema: z.object({
      suggestions: z.array(z.string()),
    }),
  });
```

This function uses `streamObject` with a Zod schema that defines an array of strings for suggestions. We could add a system prompt and further context engineering here, but this simple approach works well enough.

## Streaming Suggestions to the Frontend

The follow-up suggestions get piped into `streamFollowupSuggestionsToFrontend`:

```typescript
const streamFollowupSuggestionsToFrontend = async (
  // 1. This receives the streamObject result from
  // generateFollowupSuggestions
  followupSuggestionsResult: ReturnType<
    typeof generateFollowupSuggestions
  >,
  writer: UIMessageStreamWriter<MyMessage>,
) => {
  // 2. Create a data part ID for the suggestions - this
  // ensures that only ONE data-suggestions part will
  // be visible in the frontend
  const dataPartId = crypto.randomUUID();

  // 3. Read the suggestions from the stream
  for await (const chunk of followupSuggestionsResult.partialObjectStream) {
    // 4. Write the suggestions to the UIMessageStream
    writer.write({
      id: dataPartId,
      type: 'data-suggestions',
      data:
        chunk.suggestions?.filter(
          // 5. Because of some AI SDK type weirdness,
          // we need to filter out undefined suggestions
          (suggestion) => suggestion !== undefined,
        ) ?? [],
    });
  }
};
```

The suggestions are treated as a custom part of the message. We define the type of this message by specifying a `UIMessage`, passing `never` as the first parameter and `suggestions: string[]` as the second.

## Type Safety for Custom Message Parts

We declare our custom message type to ensure type safety:

```typescript
export type MyMessage = UIMessage<
  never,
  {
    suggestions: string[];
  }
>;
```

This makes our code type-safe when writing to streams - we can only pass in a string array to the `data-suggestions` part.

## Frontend Implementation

In the frontend, we use the `useChat` hook with our custom message type:

```tsx
const { messages, sendMessage } = useChat<MyMessage>({});

const [input, setInput] = useState(``);

const latestSuggestions = messages[
  messages.length - 1
]?.parts.find(
  (part) => part.type === 'data-suggestions',
)?.data;
```

We extract the latest suggestions from the most recent message's parts. These might be undefined if we have no messages yet or if suggestions haven't started streaming.

The suggestions are then rendered as buttons:

```tsx
<ChatInput
  suggestions={
    messages.length === 0
      ? [
          'What is the capital of France?',
          'What is the capital of Germany?',
        ]
      : latestSuggestions
  }
  input={input}
  onChange={(text) => setInput(text)}
  onSubmit={(e) => {
    e.preventDefault();
    sendMessage({
      text: input,
    });
    setInput('');
  }}
/>
```

We also provide default suggestions if there are no messages yet. When a user clicks a suggestion button, it populates the input field.

## Summary

This pattern allows us to stream suggestions to the frontend in the same API endpoint as the rest of our content, creating a seamless experience for users. The suggestions update in real-time as they become available, helping users navigate the conversation more easily.

The key components are:
- A unified stream combining initial response and suggestions
- Type-safe message parts for structured data
- Real-time streaming of suggestions to the frontend

This approach creates a more guided, user-friendly experience for AI conversations.