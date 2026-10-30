---
title: "Anthropic thinks you should build agents like this"
slug: "building-effective-agents"
type: "post"
description: "Learn how agents differ from workflows and why to start AI projects with LLM APIs, not frameworks."
tags:
  - think-like-an-ai-engineer
updatedAt: "2024-12-27T14:41:50.709Z"
---

In December 2024, Anthropic dropped an article on [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents). It really clarified a few concepts for me. Here's my summary:

## Agents vs Workflows

It defines **Agents** as different from **Workflows**.

Workflows use "predefined code paths", whereas agents "dynamically direct their own processes". The difference between them, then, is the degree of autonomy. Agents have more autonomy, workflows run on pre-defined rails.

This still feels to me like a gradient - but having the scale be "degree of autonomy" is something I've not seen much before.

## Don't Use Frameworks By Default

The article repeatedly warns against using frameworks as a first port of call. They "often create extra layers of abstraction that can obscure the underling prompts and responses".

They mention [LangGraph](https://langchain-ai.github.io/langgraph/), [Amazon Bedrock Agents](https://aws.amazon.com/bedrock/agents/), [Rivet](https://rivet.ironcladapp.com/) and [Vellum](https://www.vellum.ai/). These frameworks "make it tempting to add complexity when a simpler setup would suffice".

Instead, using LLM API's directly is what they recommend to start with. You should only use a framework when "you understand the underlying code".

This sounds right to me - the primitives of building good AI workflows don't sound that difficult to manage. Putting them in a framework prematurely feels odd. Note that I don't consider something like Vercel's [AI SDK](https://sdk.vercel.ai/docs/introduction) a framework - it's just a compatibility library.

## Many Workflow Patterns, One Agentic Pattern

The most wonderful part of this article is how it describes different workflows. Far from building effective agents, this article really describes how to build effective workflows. It describes:

- Prompt chaining, where "each LLM call processes the output of the previous one"
- Routing, where an LLM router "classifies an input and directs it to a specialized followup task"
- Parallelization, where LLM calls are run in parallel.
- Orchestrator-workers, where a "central LLM dynamically breaks down tasks" and "delegates them to worker LLM's".
- Evaluator-optimizer, where "one LLM call generates a response while another provides evaluation" in a loop.

Finally, it defines a single pattern it would define as agentic. Agents:

- "Plan and operate independently, potentially returning to the human for further information or judgement"
- "Gain ground truth from the environment at each step", using tool call results or code execution
- Terminate upon completion, or using a "stopping condition (such as a maximum number of iterations)"

In summary, agents are "typically just LLMs using tools based on environmental feedback in a loop".

I really dig this definition - it demystifies agents nicely.