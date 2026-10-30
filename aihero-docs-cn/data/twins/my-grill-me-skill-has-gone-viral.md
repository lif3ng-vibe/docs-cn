---
title: "My 'Grill Me' Skill Went Viral"
slug: "my-grill-me-skill-has-gone-viral"
type: "post"
description: "Learn the "Grill Me" AI skill—a powerful technique to deeply explore coding plans, requirements, and ideas through structured AI conversations."
tags:
  - get-better-results
updatedAt: "2026-03-23T13:35:30.437Z"
---

This is an intro to the `/grill-me` skill, separate from my video on [my top 5 skills](https://aihero.dev/5-agent-skills-i-use-every-day). It's the most flexible skill I've ever created, and one I use outside of coding too.

## The Skill

Here is the skill in all its glory:

```md
---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until
we reach a shared understanding. Walk down each branch of the design
tree resolving dependencies between decisions one by one.

If a question can be answered by exploring the codebase, explore
the codebase instead.

For each question, provide your recommended answer.
```

This skill is incredibly short - just a few lines that pack a powerful punch.

I recently added the "provide your recommended answer" line. When the AI asks a question with an obviously good answer, it now recommends that answer.

This speeds up the conversation significantly - instead of explaining everything, you can just say "yes" to the recommendation.

## What It Does

The AI asks you question after question until you reach a shared understanding, then provides a summary of what you've covered.

This is fantastic in the early phase of coding, because you need to discover all of the requirements by talking them through.

Before AI came along, devs called this **rubber ducking** - talking through your idea until you figured out all the permutations.

It's also great for non-coding use cases. I've used it for figuring out what course to build next, generating interesting discussions where the AI interviews me.

For non-coding, I slightly modify the skill:

```
Interview me relentlessly about every aspect of this until
we reach a shared understanding. Walk down each branch of the design
tree resolving dependencies between decisions one by one.
For each question, provide your recommended answer.
```

This setup is usually enough to have a detailed, in-depth conversation with the AI.

## The Results

These grilling sessions often last about 45 minutes. By the end, you have a rich conversation full of context, your actual ideas, and answers to difficult questions.

That's why `grill-me` is so powerful - it's a universal tool you need in many different situations.

You can start with a fully fleshed out idea, or just a vague couple of sentences about what you want to build or figure out.

<PromoCard
	variant="skill"
	title="Install /grill-me"
	description="Stress-test your plan before you build. One command to install — and the skill page tracks every update."
	href="/skills-grill-me"
	ctaLabel="View the skill"
	duration="2 min setup"
/>

## Getting Started

Install it using:

```bash
npx skills@latest add mattpocock/skills
```

Or visit [the skills repo on GitHub](https://github.com/mattpocock/skills) to get started.
