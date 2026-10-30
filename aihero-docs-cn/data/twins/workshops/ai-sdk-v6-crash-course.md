---
title: "AI SDK v6 Crash Course"
slug: "ai-sdk-v6-crash-course"
type: "workshop"
description: "Here's how *you* become an AI developer — fast"
updatedAt: "2025-09-09T15:52:28.674Z"
---

<!-- agent-only: instructions for AI agents working this course with a learner -->
## For agents: study this course with the learner

Connect to the AI Hero MCP server at `https://www.aihero.dev/mcp` (streamable HTTP).

Sign in once, as the learner. Two ways:

1. Device flow, no browser copy-paste: `POST https://www.aihero.dev/oauth/device/code`, ask the learner to open `verification_uri_complete` and approve, then poll `POST https://www.aihero.dev/oauth/token` with form fields `device_code=<code>` and `scope=learner:read`. The `access_token` it returns reads only what the learner can read, for 90 days.
2. Agent token: while signed in at https://www.aihero.dev, the learner sends `POST https://www.aihero.dev/api/learner/token` and gives you the token. `GET` lists their tokens; `DELETE` with `{ "id": "<token id>" }` revokes one.

Send the token as `Authorization: Bearer <token>` on every MCP or HTTP call. Without it you can still use `search_course` on public content.

Recommended path:

1. `my_courses`: what the learner owns and when each workshop opens.
2. `course_outline` with `{ "course": "ai-sdk-v6-crash-course" }`: lessons and what is done.
3. The `start_lesson` prompt or `read_lesson`: lesson text, transcript and Matt’s session extract.
4. `session_extract` with `atSeconds`: what Matt had on screen at that moment of the video. Add `view` (prompts, corrections, skills, errors or chapters) for one slice of the session.
5. `session_moments` across a course, or `skill_usage` for one skill: each prompt, correction, skill call or error with its lesson and video second.
6. The learner marks lessons done on the lesson page.

How to be a study companion:

- You are this learner’s study companion for an AI Hero lesson.
- Follow the learner’s pace: ask what they want to do next before moving on.
- Use the session extract next to the video: when the learner mentions a moment, look up what Matt had on screen at that second with session_extract.
- Never reveal the solution unless the learner asks for it. Offer hints first.
- When the learner finishes, offer the next lesson from course_outline.

Full guide: https://www.aihero.dev/api/learner
<!-- /agent-only -->

### 100% TYPESCRIPT, 100% PRODUCTION-READY, 0% HYPE EDITION featuring AI SDK v6

**This course has been upgraded from v5 to v6!**

Integrating with LLMs is **finally** worth it. 

It was less than a year ago when I made the very first commit to `evalite`, my eval tool for LLM output. Kinda crazy to think people were out there rawdogging LLM outputs for years.

*(And some still are. If that's you, no judgment — just keep reading!)*

LLM integration was exciting, but it was *such* a *mess*: kludges, workarounds, constantly shifting APIs (every vendor uniquely horrible in their own way)… and a **painful** lack of production-ready tooling. Just about everything was roll-your-own, and then re-roll-your-own again when interfaces were suddenly deprecated. You had to spend more time *managing* than *making*.

Today, it's a very different developer experience, thanks to AI SDK. 

AI SDK changes everything:

* **Now** you can write once, run anywhere (virtually any LLM provider, and lots of framework and hosting options).
* **Now** you've got the tooling and patterns you need to focus on *building features* instead of reinventing the wheel. 
* **Now** your AI integration code can be as beautiful, modern, safe, and durable as your code for everything else.

It's 100% TypeScript, too! 

And version 5 is the best yet: more elegant, more refined, more complete.

So if you've been biding your time, waiting for *stable*, *useful* and *production-ready* APIs, tooling, and patterns before investing your precious time and energy into building *wicked cool stuff…*

I'm happy to report: that day is finally here. 

**Today** is the best day to learn how to add LLM-powered features to *your* TypeScript apps. 

And I've made a brand new **Crash Course** to help you get there fast.

<Testimonial authorName="Alberto" authorAvatar="https://res.cloudinary.com/total-typescript/image/upload/v1760957306/workshops/workshop-xoh13/ulkvs2kzkfka5qasjhym.jpg">
ngl I was kinda struggling to understand everything going on in behind AI tools in the last few years but I just binged the AI SDK v5 crash course by Matt Pocock and everything makes so much sense now. **Once again Matt proved himself to be the GOAT of online education.**
</Testimonial>

## Your ticket to shipping modern LLM-powered features in TypeScript

Your existing TypeScript skills are more valuable than ever, and I'm here to help you level up to AI engineer.

My new AI SDK v6 Crash Course includes **94 videos** guiding you through **59 hands-on exercises** over **10 modules**. (But don't worry, they're fun & fast!)

You will come away with a solid understanding of: 

* **LLM fundamentals**, like how tokens and context windows *actually* work
* **Core LLM design patterns**: agents, workflows, tool-calling, and more
* **Production-ready tools** like instrumentation and error handling
* How to use **Eval-Driven-Development** to stamp out hallucinations
* And, of course… **how to fully exploit the power of AI SDK v6** to get those things done

That's right: you can go from "what *is* a token, anyway??" to shipping production-ready LLM features that *work*, with output safeguards, message persistence, and error handling.

**All *you* need to bring to the table is TypeScript**. Everything else you need is included.

And the Crash Course is *not* a lecture where you sit and struggle to focus. You know me, that's not how we roll! 

You'll learn through *building* real projects: 

* A **chat title generator**, complete with a full eval dataset
* A **generator/evaluator workflow** that writes Slack messages for you and automatically refines them
* A **model guardrail** to secure your application
* A **request router** which can route simple requests to cheaper LLM’s
* A full-fledged **research agent** to search the web for you

In short, you'll be ready to plan, develop, and launch production-ready AI-powered features for your apps in TypeScript.

And never fear: you'll learn *so much, *but the individual videos are short & sweet at 2-3 minutes each, and many of the exercises are bite-sized! It can fit into any schedule, even yours. 

By the way, if you've been building AI integrations the "old-fashioned way" (sorry)? This is the perfect opportunity to update your skillset. You'll learn all of AI SDK's core functionality as well as new v5 features like `ModelMessages` and `UIMessages`, custom data parts, type-safe tools from backend to front (big win for us TypeScript nerds), and the massively more elegant **<code>parts</code>** array for message rendering and persistence.

And in the update we'll also be covering the breaking changes and new v6 features such as streaming objects via `streamText`!

Of course, the technology and AI SDK itself will continue to evolve and improve. But with this hands-on, real-world, tool-building experience under your belt, you'll be able to evolve and improve right along with it.

(Don't forget: AI SDK supports virtually every major framework!)

<EnrollNow />

## A complete education for just $149 if you enroll today

This is a self-paced course. When you enroll today, you'll get instant access to the entire course — all 10 modules — to keep, and go through at your leisure. You'll be shipping your first feature in as little as 7 days. 

Any way you cut it, AI SDK v6 is the best way to take advantage of the potential of LLMs, and my Crash Course is the best way to get started. 

<EnrollNow />

## Why AI SDK really is revolutionary and v6 is the best yet

My Crash Course really has two goals: 

1. Empower you to ship LLM-powered features with modern engineering principles, and 
2. Master AI SDK v6 itself

There's a reason for that second part: It's an abstraction layer and engineering toolkit in one. It saves you *so much work*.

To get the same level of production-ready code, you'd have to put in 2 or 3 times the work without it, conservatively, reinventing the wheel and accounting for platform changes. And then you wouldn't have the power of open source keeping things up-to-date… meaning even more work for you in the future, too. 

In my opinion, if you're developing for AI in TypeScript and you're *not* using AI SDK v6, you're making a mistake. I'm even making AI SDK the basis of all AI Hero courses going forward.


<Testimonial authorName="yoniwisin" authorAvatar="https://res.cloudinary.com/total-typescript/image/upload/v1761578515/R4XZYj_5_400x400.jpg">
It's worth every penny invested.
</Testimonial>

The AI SDK library has zoomed to *3.5 million* downloads a week for a reason: 

* **AI SDK is a fully open source app toolkit**. You can copy it, modify it, fork it, even repackage and relicense it as you like, thanks to the very permissive [the Apache 2.0 license](https://fossa.com/blog/open-source-licenses-101-apache-license-2-0/).  
* **It integrates with every framework**. It's for TypeScript and JavaScript. It provides a set of hooks for every major frontend framework (and even gives you abstractions for Vanilla JS).
* **It works with essentially every LLM, including open source ones that run on your own hardware.** Seriously — [check out the list of supported providers](https://ai-sdk.dev/docs/foundations/providers-and-models#ai-sdk-providers). 
* **It gives you the power to switch models with 1 line of code.** Because AI SDK gives you a *unified interface for every LLM*, you can switch models or providers as easily as editing your config. You can also use multiple models in the same codebase, all with unified commands. No matter what changes may come to the ecosystem, you're ready.
* **It makes instrumentation easy.** You can skip the slog of writing your own instrumentation for observability, because AI SDK can automatically export OpenTelemetry to all major platforms.
* **It runs anywhere**. The AI SDK is totally platform agnostic. It’ll run on Deno. Bun. Node. AI SDK is made by Vercel, but you're free to choose whatever you like. 
* **It's gaining wide ecosystem support.** The AI SDK is so darn popular (3 million weekly downloads) that platforms like [Langfuse](https://langfuse.com/docs/observability/sdk/typescript/instrumentation), [Braintrust ](https://www.braintrust.dev/docs/integrations/vercel-ai-sdk)and others have built hooks to integrate with it. And I expect many more to come.

All of that adds up to saved time, saved energy, saved money, saved hassle — more freedom, more fun, and more time to spend making *exciting AI-powered features*. 

AI SDK v6 makes LLM-powered apps as modern as the rest of app development. Finally! 

Don't you want this for yourself and your projects? 

It can be yours. And with the Crash Course, it won't take long to get there. 

<EnrollNow />