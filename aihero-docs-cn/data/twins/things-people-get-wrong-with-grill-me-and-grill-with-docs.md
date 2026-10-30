---
title: "9 Things People Get Wrong With /grill-me and /grill-with-docs"
slug: "things-people-get-wrong-with-grill-me-and-grill-with-docs"
type: "post"
description: "Master the 9 most common mistakes when using /grill-me or /grill-with-docs. Learn scope management, model selection, and planning strategies."
tags:
  - get-better-results
updatedAt: "2026-05-25T13:34:56.674Z"
---

The `/grill-with-docs` skill has become a popular replacement for plan mode in agent workflows. However, many people struggle with using it effectively. The skill works by asking you relentless questions until you reach a shared understanding, but **this requires good planning skills on your part**.

These skills aren't meant to replace engineers - they're designed to aid you. The goal of this guide is to help you master them by understanding the nine most common failure modes.

## Understanding Questions: Low vs High Fidelity

When you enter a grilling session, your goal is to answer questions about the thing you're going to build. But not all questions are equal.

![Illustration showing questions at different levels of fidelity](https://res.cloudinary.com/total-typescript/image/upload/v1779715889/ai-hero-images/qkcmn8yccs0rrbu5og3k.png)

| Question Type     | Definition                                                             | Example                                        | Grillable? |
| ----------------- | ---------------------------------------------------------------------- | ---------------------------------------------- | ---------- |
| **Low Fidelity**  | Questions that don't require detailed prototypes or images to answer   | "What URL should this route live on?"          | ✓ Yes      |
| **High Fidelity** | Questions that need zoomed-in, detailed images or prototypes to answer | "How should this UI feel when we're using it?" | ✗ No       |

Form field layout is a good example of a high-fidelity question. Should you split form fields across multiple pages, or use one enormous form? You really need to see a prototype or build the whole thing to answer that properly.

### Handling Ungrillable Questions

The first major failure mode is trying to answer high-fidelity questions during a grilling session.

When you hit an ungrillable question, something that needs higher fidelity to understand, use the **handoff** pattern:

1. Continue grilling low-fidelity questions in your first session (the blue session)
2. When you hit a high-fidelity question, hand off to a prototyping session
3. Build or prototype in that separate session to understand the question better
4. Hand back off to your original grilling session to continue with grillable questions

This pattern looks like: **grill → prototype → grill again**. It lets you answer high-fidelity questions without breaking your grilling flow.

![Diagram showing the handoff pattern between grilling and prototyping sessions](https://res.cloudinary.com/total-typescript/image/upload/v1779715889/ai-hero-images/dkks1wlw7mkpjr0slii2.png)

## Choosing the Right Scope

Scope, how large a thing you're grilling, is absolutely critical.

If your scope is too large, two problems emerge:

**Problem 1: Hidden high-fidelity questions**
It's always easier to build off something you know works rather than endlessly planning into the future. When people try to schedule days of tasks for their AI to work on, they often end up with poor results because they're not building on a solid foundation they understand.

**Problem 2: Context window limits**
You might start with a nearly empty context window, but as you keep grilling and grilling, you'll hit the model's "dumb zone" - around 120k tokens for most state-of-the-art models. Once you pass this threshold, the model's attention relationships get strained and it starts making worse decisions.

![Visual showing context window filling up and hitting the dumb zone](https://res.cloudinary.com/total-typescript/image/upload/v1779715890/ai-hero-images/yxo684qm8iwlvyx18ip1.png)

### Breaking Down Large Scopes

Instead of grilling on one massive scope, ask the agent upfront to break it down:

1. Start with a large scope
2. Have the agent break it into smaller, grillable chunks
3. Grill on each smaller scope individually
4. Answer all the questions across those separate sessions

This keeps you comfortably within the "smart zone" and avoids hitting the context window wall mid-session.

![Breaking down large scope into smaller, manageable scopes](https://res.cloudinary.com/total-typescript/image/upload/v1779715891/ai-hero-images/efw0w7wzr3xzzh6taokc.png)

## Being Active, Not Passive

Many long grilling sessions fail because people are too passive with their agent. Remember: **it's a conversation, not an interview**.

The agent asks questions, but _you_ need to:

- Figure out where you're going
- Understand the scope
- Keep things on track
- Steer the conversation actively

If you're too passive, the agent will bombard you with 540 questions and explode the scope with requests about things that are way too low-fidelity.

But there's a balance. Being too active means grilling endlessly on low-fidelity details when you should actually be writing code. If you're just planning and planning without building, you're over-grilling.

**Find the middle ground**: Be actively involved in steering the session while knowing when to stop planning and start implementing.

![Spectrum showing passive vs active engagement with the agent](https://res.cloudinary.com/total-typescript/image/upload/v1779715891/ai-hero-images/yrglde19tasebulnsabm.png)

## Preserving Your Design Decisions

This is a critical but often overlooked failure mode. When you grill, you create an incredibly valuable artifact: **a context window full of design decisions**.

By the time you finish grilling, you've made hundreds of tokens worth of choices about how your system should work. This is pure gold.

Your options:

- **If you have context budget left**: Implement directly in the same session without handing off
- **If you're running out of context**: Create a PRD (product requirements document) using the `/2PRD` skill as a handoff artifact

**Do not** clear the context and start fresh just to write a PRD. That's throwing away all your design work. Every decision in that grilling session has value and should either become code or be documented in a handoff artifact.

![Warning against clearing context before creating a PRD](https://res.cloudinary.com/total-typescript/image/upload/v1779715892/ai-hero-images/zja4advhqmfkig5eorns.png)

## Using Smart Models for Grilling

Using a "dumb" model for grilling is a common mistake. Here's why it matters:

When you grill, you rely on two sources of knowledge:

| Knowledge Type | Source                                   | Reliability                 | When It Matters      |
| -------------- | ---------------------------------------- | --------------------------- | -------------------- |
| **Contextual** | Files you pass, prompts, tool results    | Very reliable               | Implementation phase |
| **Parametric** | The model's training data and parameters | Less reliable, but creative | Grilling phase       |

During grilling, you're relying on the model's **parametric knowledge** - its innate understanding of systems and applications to suggest things you might not have considered. If you had thought of them, you would have passed them in as context.

**A dumb model won't give you good ideas.** You need a model with lots of parameters - usually the big frontier models - to get creative suggestions and thought-provoking questions.

However, for implementation, you can use a smaller model since most information there is contextual (your detailed plan, the codebase, etc.).

![Diagram showing contextual vs parametric knowledge sources](https://res.cloudinary.com/total-typescript/image/upload/v1779715892/ai-hero-images/qwbrfqpigkqevehpb3mn.png)

## Running Parallel Grilling Sessions

Finally, one simple but powerful technique: **grill multiple sessions in parallel**.

Here's how it works:

1. You're grilling in session A
2. The agent asks you a question
3. You answer it
4. While the agent is thinking, switch to session B
5. Answer the question there
6. Session A is ready; switch back
7. Repeat

This is just like managing two Slack threads at once. You're not actually context-switching heavily - you're managing separate conversations.

**Benefits:**

- You double your throughput
- You get more planning done in less time
- You can keep multiple design decisions flowing

Most people max out at two sessions comfortably. If one session is doing a long-running task like research, you might handle three. As you get better at grilling, you can increase parallelism.

![Illustration of bouncing between two parallel grilling sessions](https://res.cloudinary.com/total-typescript/image/upload/v1779715893/ai-hero-images/zvlogainpdjwt6bjv9cy.png)

<Callout intent="skill">
New to the grilling workflow? Start with [/grill-with-docs](/grill-with-docs) — align on the docs before you build.
</Callout>

## Key Takeaways

- **Grilling is about questions.** Low-fidelity questions are grillable; high-fidelity ones require prototyping
- **Scope matters.** Choose smaller scopes to avoid blowing through your context window
- **Be active.** Guide the conversation while knowing when to stop planning and start coding
- **Preserve value.** Every decision you make in grilling should be recorded somewhere
- **Use smart models.** You need parametric knowledge to get creative suggestions
- **Run in parallel.** Once you understand what each session does, flip between them efficiently

The better you understand these failure modes, the more effectively you can use grilling sessions to design before you code.
