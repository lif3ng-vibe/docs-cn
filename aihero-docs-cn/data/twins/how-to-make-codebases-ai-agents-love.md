---
title: "How To Make Codebases AI Agents Love"
slug: "how-to-make-codebases-ai-agents-love"
type: "post"
description: "Learn how deep modules and proper codebase architecture make AI coding more effective. Master software design principles for AI-ready codebases."
tags:
  - level-up-your-workflow
  - set-up-your-agent
updatedAt: "2026-02-26T10:09:15.742Z"
---

AI is not a super-powered developer. It's a new starter with no memory. Every time you spawn an agent, it's like the guy from Memento stepping into your codebase going, "Okay, I'm here, what am I doing?"

Your codebase, way more than your prompt or your `AGENTS.md` file, is the biggest influence on AI's output. If it's designed wrong, it costs you in three ways.

**Poor feedback loops.** The AI doesn't receive feedback fast enough, so it doesn't know if what it changed actually did what it intended.

**Hard to navigate.** The AI finds it super hard to make sense of things, find files, and work out how to test things.

**Cognitive burnout.** You end up trying to hold together AI and your codebase, patching it all up manually.

### What AI Actually Sees

Imagine this is your codebase:

![](https://res.cloudinary.com/total-typescript/image/upload/v1772100427/ai-hero-images/fowryjzju9yyefcquhpw.png)

Each square is a module that exports some functionality — a function, a variable, a component. Inside, you have vague groupings: a thumbnail editor, a video editor, authentication, CRUD forms.

You understand this mental map. But the AI doesn't. What it sees is this:

![](https://res.cloudinary.com/total-typescript/image/upload/v1772100428/ai-hero-images/alyzcymusoj0qby2wfhc.png)

A bunch of disparate modules that can all import from each other. No groupings, no relationships. And the file system doesn't help — it's all jumbled together.

You're spawning 20+ new starters a day to look at your codebase and make changes. Your codebase needs to be friendly and navigable for them.

## The Solution: Deep Modules

The file system and design of your codebase needs to match the internal map you have of it. The best way I've found to do that is with **deep modules**.

Deep modules comes from "A Philosophy of Software Design." The idea is simple: lots of implementation controlled by a simple interface.

Instead of many small modules:

![](https://res.cloudinary.com/total-typescript/image/upload/v1772100429/ai-hero-images/ik0zge6zd8iljkpot3ge.png)

You end up with big chunks of functionality with simple, controllable interfaces. Any exports have to come through that interface.

### Grey Box Modules

Deep modules create a natural seam in your codebase. You carefully control and design the interface. The implementation inside? Delegate that to AI.

Write tests that lock down the module's behavior. Then you don't need to look inside. You can if you want to — to apply taste, influence the outcome, or improve performance — but as long as the tests pass, you don't need to care.

These are **grey box modules**. You own the interface. AI owns the implementation. Tests keep it honest.

### Improved Navigability

Give each module its own folder with a clear public interface. The AI can see all the services on the file system, read their types, and understand what they do — without digging into the implementation.

**We've designed our codebase for progressive disclosure of complexity.** The interface sits at the top and explains what the module does. When we need to, we can look inside.

### Reduced Cognitive Burnout

Instead of holding hundreds of interrelated modules in your head, you keep seven or eight chunks. The AI manages what's inside each one. You only worry about designing the interfaces and how they fit together.

This is still a million miles from vibe coding. You need to apply taste at the boundaries — deciding what goes into which module. But the mental map is radically simpler.

### Good Practice Remains Good Practice

This is nothing new. This is how good codebases have been designed for 20 years. What works for humans is also great for AI.

<PromoCard
	variant="skill"
	title="Make it agent-friendly, automatically"
	description="/improve-codebase-architecture audits and refactors toward the patterns this article describes."
	href="/skills-improve-codebase-architecture"
	ctaLabel="Get the skill"
/>

## Summary

Your codebase is probably not ready for AI. Instead of deep modules, you've got a web of interconnected shallow modules:

![](https://res.cloudinary.com/total-typescript/image/upload/v1772100430/ai-hero-images/ht6pvgjykcliwinioaxx.png)

These are hard to navigate, hard to test, and hard to keep in your head.

The fix is deep modules with clear interfaces and strong tests. Think about module boundaries from your PRDs through to your implementation issues. Tests and feedback loops are essential — they're how your AI new starters know if their changes work.

Some languages make this easier than others. In TypeScript, it's not easy to enforce these boundaries — I've been using Effect more and more because it makes modularizing your codebase simple.
