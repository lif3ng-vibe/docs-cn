---
title: "AI Coding Crash Course"
slug: "ai-coding-crash-course"
type: "workshop"
description: "Ship faster than ever before by taking control of your code, with software engineering fundamentals."
updatedAt: "2026-08-18T12:54:10.450Z"
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
2. `course_outline` with `{ "course": "ai-coding-crash-course" }`: lessons and what is done.
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

<TeamWelcomeVideo resourceId="lichens-team-welcome-20260826" />

**We've all seen how AI coding can go wrong:** easier than ever to get started, but downhill from there.

Starting a new project feels like *magic*; but as you refine your ideas, fix bugs, or add features, your agent's bad code choices compound quickly and each change comes slower and worse.

Outsourcing small tasks feels _powerful_ and even fun; but bigger, more complex, and longer running tasks spiral beyond your control.

Worst of all, the agent never gets tired but you're more exhausted than ever. A robot can pile up lines of code far faster than you can review, meaning you must spend more time accepting, supervising, instructing, and repeating yourself, with less time for satisfying, creative work.

Through it all, you can practically feel the control slipping away, one prompt at a time.

Maybe it's happened to you. Or maybe you haven't tried it yet because you're concerned it will happen to you.

Either way, this isn't the job you signed up for. There has to be a better way.

The good news is: *there is a better way.*

My brand new **AI Coding Crash Course** will put the control back in your hands — through learning, analyzing, and most importantly, *building* with a better understanding of how these tools work.

<Testimonial authorName="Mario Zechner (@badlogicgames), creator of the Pi coding harness">
Matt Pocock is a true educator and I admire how he brings structure to this mess we are in.
</Testimonial>

The best way to get great results from your coding agent is to learn how it works, top to bottom:

1. How does a large language model work?
2. How does the harness work — whether it's Claude Code, Codex, or any other flavor?
3. How do you combine that knowledge to build an effective, repeatable software engineering loop?

<ThemeImage urls={{ light: "https://res.cloudinary.com/total-typescript/image/upload/v1786640502/workshops/ai-coding-crash-course/iceberg-light.png", dark: "https://res.cloudinary.com/total-typescript/image/upload/v1786640503/workshops/ai-coding-crash-course/iceberg-dark.png" }} width={480} height={600} alt="Iceberg diagram: great, reliable, predictable results above the waterline; how models work, how harnesses work, and your agent's environment beneath it" className="mx-auto my-8 w-full max-w-md rounded-md" />

You'll be able to answer all these questions for yourself — through practical experience — by the end of this self-paced crash course.

Even if you've never used a coding agent before. Even if you've never written software before.

<Callout>**This isn't a "vibe coding" course.** This is a ground-up approach to learning how to get the best results from your coding agents, so you can build high quality, production software using Real Engineering principles.</Callout>

<EnrollNow />

---

## Take control of your coding agent like a Real Engineer

My approach to AI coding combines classic Real Engineering principles with a step-by-step process to deeply understand every aspect of the tools, techniques, and workflows. Together, you'll use that understanding and practice to maintain a high bar for quality and consistency.

Here are just some of the things you'll learn:

- **Smart zone / dumb zone** — what the context window is, why it matters, and how to recognise when an agent is still reasoning sharply and when its context has degraded — and how to keep your work in the smart zone.
- **Managing context** — what's actually eating up the agent's context, why it fills up, how to keep it slim, and how to read its exact status instead of guessing.
- **Compaction vs. handoff** — three ways to continue past a full context, when to use each, and why mid-task compaction goes wrong.
- **Grilling** — how to recruit your agent to help you interrogate a fuzzy idea until the project requirements are sharp and clear, before writing a single line of code.
- **Codebase exploration** — how to help your agent understand an existing codebase so it uses the code that exists instead of reinventing and repeating.
- **AGENTS.md** — how to wield the instruction file that steers an agent's behaviour across a project, and what actually belongs in it.
- **Skills** — how to create and deploy reusable instructions as patterns and packages that your agent can pull in on demand, and how to write your own from prompts and workflows that you repeat.
- **Progressive disclosure** — structuring those instruction files so the agent loads only what it needs, keeping context lean.
- **Crystal clear requirements** — how to turn a grilling session into a clear spec the agent can build from, to deliver the results you actually want.
- **Decomposing complex work into session-sized chunks** — how to break down big projects into phases your agent can execute one at a time, and how (and when) to create a new session.
- **Handoffs** — how to leave a breadcrumb trail for your agent, so you can both pick up exactly where you left off — whether it's the next hour, or next week.
- **Subagents** — how to delegate exploration and other tasks to "child" sessions with fresh contexts, to keep your main session sharp — all without juggling multiple terminal windows.

Learn and practice ALL of these concepts and more. Marathon it all within a few days, or spread it out to fit your life's schedule or pace.

<EnrollNow />

---

## From "say and pray" to a process you can trust for great results

You'll start with the core concepts you need to know. You'll learn how to work with a harness (like the Claude Code command-line interface) like a pro.

You'll learn how to clearly specify work for your agent to execute — to be sure you're building the right thing — as well as how to enforce code quality standards so your codebase will be easy to expand in the future.

By the end, you'll be able to take on work that's too big for a single prompt, and stay in control of your codebase while you do it.

<Testimonial authorName="Stéphane M">
I recommend learning from Matt Pocock morning, noon and night. ZERO SLOP in my projects, my repos are clean.
</Testimonial>

## Get ready for hands-on learning

Together, you'll learn how to inspect the inner workings of your AI coding harness, which lets you truly understand exactly what's going on behind the scenes.

Once equipped with that understanding, you'll be guided through the full build process for several real features end-to-end. This practice cements everything you've learned through real experience.

<CheckList>

- In total, nearly **60 lessons** broken down into **6 sections**
- Each lesson includes **video instruction** so you can follow along with me on screen
- Each video lesson is accompanied by **detailed written guides**, step-by-step commands and prompts to try and adapt on your own, and **quizzes** to test your understanding

</CheckList>

Everything lives in my custom learning environment, designed to help you keep track of your progress and know where to focus your efforts next.

<Testimonial authorName="Alfred S." authorAvatar="https://res.cloudinary.com/total-typescript/image/upload/v1782387604/workshops/ai-skills-for-real-engineers/testimonials/alfredsimon.jpg">
I don't often buy courses, but @mattpocockuk's are a godsend. Even though I'm not a dev by training, I used what I learned to build a full Google Ads management system on top of Claude Code.
</Testimonial>

When you enroll, you get instant access to everything — and you get to keep it.

This Crash Course is completely self-paced, you can go as fast or slow as you like, and work on the material anytime and from anywhere you have an internet connection.

Whether you tackle the material over a long weekend (about 3 days), or spread it out to a couple of hours a day over the course of a week or so, I've designed this Crash Course to focus your learning experience on the essentials. Everything you need to take charge of your AI coding experience, with zero hype or distractions.

So if you've tried AI coding, but couldn't get past the uneven results or nasty surprises, this course will help you create a solid mental framework and a reliable, reusable process.

And if you've been thinking about trying out AI coding as a non-programmer, this course will show you how you can get started on the right foot, saving you from lots of expensive and painful mistakes. Plus, you'll learn how your coding agent can help you understand the code it's writing, and you'll have a better sense of how to ensure its answers are trustworthy.

## Pricing

The full price for this deep and thorough training is <strong><PricingInline type="original" /></strong>.

<HasDiscount>

But if you enroll by <strong><DiscountDeadline /></strong>, you'll pay only ~~<PricingInline type="original" />~~ <strong><PricingInline type="discounted" /></strong>.

</HasDiscount>

(And if you previously took my Cohort, just **$99**!)

Check out the full course curriculum below. But if you want to get the best price, don't wait too long!

<WorkshopContentList />

<EnrollNow />

---

## Learn with your team for compounding wins

A solo developer can do more now than ever before, but when your entire team is equipped with this knowledge and practice, the results are incredible.

Everything designed to get you and your agent aligned and on the same page helps teams do the same thing. Plus, each stage of the AI Coding loop can be adapted to your team's unique requirements and standards.

On-demand team licensing is available, or contact our support team at [team@aihero.dev](mailto:team@aihero.dev) for purchases over 100 seats.

<Testimonial authorName="@shadcn" authorAvatar="https://res.cloudinary.com/total-typescript/image/upload/v1782387492/workshops/ai-skills-for-real-engineers/testimonials/shadcn.jpg">
every company now needs their own Matt Pocock
</Testimonial>

---

## Frequently Asked Questions

### Is this self-paced or live?
Self-paced. Work through it on your own schedule, in your own codebase, and revisit whenever the skills get an update.

### Do I need a specific AI coding tool?
The skills are markdown any Claude-compatible agent can read (Claude Code is the obvious one). The _practice_ transfers to any capable agent — the workflow is the durable part, not the tool.

### I'm new to agent coding. Will I keep up?
Yes. You need to be curious and willing to build, not an AI specialist. Each lesson is small enough to work through in one sitting, and the method builds up one piece at a time.

### What's your refund policy?
30-day refund policy. Contact team@aihero.dev.

### More questions?
For pricing, PPP, team seats, invoices, gifting, and platform questions, see [aihero.dev/faq](https://www.aihero.dev/faq). Or email [team@aihero.dev](mailto:team@aihero.dev).