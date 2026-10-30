---
title: "5 Agent Skills I Use Every Day"
slug: "5-agent-skills-i-use-every-day"
type: "post"
description: "Master AI code quality with proven engineering skills: prompt techniques, TDD, architecture design, and spec workflows for Claude Code agents."
tags:
  - score-first-wins
  - code-with-ai-agents
updatedAt: "2026-03-16T15:38:31.720Z"
---

I've been an engineer for nearly a decade. Right now, process has never been more important.

You have access to a fleet of middling to good engineers that you can deploy at any time. But these engineers have a critical flaw: they have no memory. They don't remember things they've done before.

This means you need extremely strict and well-defined processes to get them to do useful work. As a developer, you're constantly steering your agents, keeping them on the right track.

My way of fixing this has been to create a LOT of agent skills. Each skill I've designed helps me encode my process so that AI has a strict path to follow every single time:

![Repository of engineer skills and processes](https://res.cloudinary.com/total-typescript/image/upload/v1773675111/ai-hero-images/pgyy6kr82bhjliy774jx.png)

The result? The code quality that AI produces has shot up dramatically.


**The kit:** [grill-me](/skills-grill-me) · [to-spec](/skills-to-spec) · [to-tickets](/skills-to-tickets) · [tdd](/skills-tdd) · improve-codebase-architecture · [see all skills →](/skills)

## 1. `/grill-me`: Flesh Out an Idea

[Read the guide](/skills-grill-me) · [GitHub](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me)

```bash
npx skills@latest add mattpocock/skills
```

This is my favorite skill. It's only three sentences long, but it's incredibly impactful.

**The Grill Me Skill:**

> Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one by one. And finally, if a question can be answered by exploring the code base, explore the code base instead.

The concept of a "design tree" comes from _The Design of Design_ by Frederick P. Brooks. It's the idea that as you're designing something, you need to walk down all of the branches of a design tree.

For example, you might be designing a search page and need to decide between an advanced search interface or a simple text box. If you choose advanced search, you need to figure out all the filters and sorting methods. You keep walking down the tree until you've fully understood your design before committing to code.

![Claude asking clarifying questions about a feature](https://res.cloudinary.com/total-typescript/image/upload/v1773675112/ai-hero-images/p1coswbfzivaglbxkose.png)

When I invoke this skill, I want to reach a shared understanding with the LLM. Claude Code tends to spit out a plan really early when in plan mode, creating a document before we've truly understood each other. But the grill me skill forces that conversation.

In one conversation about adding a feature to my course video editor, Claude asked me 16 questions. And that was a relatively short grilling session. I've had sessions lasting nearly half an hour with 30, 40, or even 50 questions on really complex features.

![16 interview questions displayed in the conversation](https://res.cloudinary.com/total-typescript/image/upload/v1773675113/ai-hero-images/a0vvhui4lkubi5b2aqq9.png)

**The key takeaway: Skills don't have to be long to be impactful. You just need to choose the right words at the right time.**

## 2. `/to-spec`: From Conversation to Document

[Read the guide](/skills-to-spec) · [GitHub](https://github.com/mattpocock/skills/tree/main/skills/engineering/to-spec)

```bash
npx skills@latest add mattpocock/skills
```

_(This skill used to be called `/to-prd`. Same job, clearer name.)_

Once I've reached a shared understanding with the LLM, I invoke my next skill: `/to-spec`.

This skill asks the LLM to write that understanding up as a spec — the document you might know as a PRD. Crucially, it does _not_ interview you. The grilling already happened, so `/to-spec` just synthesizes what's already in the conversation.

The workflow:

- Explore the repo to ground the spec in the current state of the code
- Sketch out the seams at which the feature will be tested, and check they match your expectations
- Write the spec from a template and publish it to the project's issue tracker

The important part of any spec is the user stories. These describe the desired behavior of your system in language, drawing from Agile methodology.

![User stories section of a spec](https://res.cloudinary.com/total-typescript/image/upload/v1773675114/ai-hero-images/mpombfwy8uz2rr1xy1yi.png)

## 3. `/to-tickets`: Breaking Down the Destination into a Journey

[Read the guide](/skills-to-tickets) · [GitHub](https://github.com/mattpocock/skills/tree/main/skills/engineering/to-tickets)

```bash
npx skills@latest add mattpocock/skills
```

_(Formerly `/to-issues`.)_

The spec describes your destination. But what you really need is the journey to get there.

That's what the `/to-tickets` skill does. It takes a spec and turns it into a Kanban board of independently grabbable tickets.

The process:

1. Gather context — the conversation you've just had, or a spec you point it at
2. Explore the code base
3. **Draft vertical slices** - break the spec into tickets that flush out unknown unknowns quickly

The [tracer bullet](https://www.aihero.dev/tracer-bullets) analogy applies here. Each ticket is a thin vertical slice cutting through all integration layers, not a horizontal slice of one layer.

The skill also establishes blocking relationships between tickets. For instance, one ticket might not be blocked by anything, so it can be picked up independently. This is useful if you have parallel agent setups where multiple agents can work simultaneously.

![Four GitHub issues created as vertical slices](https://res.cloudinary.com/total-typescript/image/upload/v1773675116/ai-hero-images/qaodyngpkcdpfwdvi1do.png)


<SkillsCta
	heading="There are more where these came from"
	subtitle="grill-with-docs, domain-modeling, and triage round out the kit — plus a changelog of updates as it evolves."
	cta="See the skill set"
/>

## 4. `/tdd`: Increasing Code Quality

[Read the guide](/skills-tdd) · [GitHub](https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd)

```bash
npx skills@latest add mattpocock/skills
```

How do you execute on a skill? How do you make the implementation rock solid and increase code quality?

You use a TDD skill. TDD stands for Test-Driven Development, and it forces (or rather, encourages) the agent to follow a red-green-refactor loop.

This skill is substantial. It includes philosophy on refactoring, mocking, and what deep modules are. **Doing really good TDD has been the most consistent way to improve agent outputs.**

The workflow starts with confirming what interface changes are needed. When an AI looks at a bad codebase, it sees many tiny, undifferentiated modules. But if you restructure it into larger modules with thin interfaces on top, the AI can navigate it much more easily.

The skill then:

- Confirm which behaviors to test
- Design interfaces for testability
- Write one test at a time (test first)
- Implement code to make the test pass
- Look for refactoring candidates

Red-green-refactor with agents is incredible. It creates a loop that continues until complete.

![TDD workflow diagram showing the red-green-refactor cycle](https://res.cloudinary.com/total-typescript/image/upload/v1773675117/ai-hero-images/lz08tqnibbua15wpkq2n.png)

## 5. `/improve-codebase-architecture`: Making Your Code Agent-Friendly

[View on GitHub](https://github.com/mattpocock/skills/tree/main/skills/engineering/improve-codebase-architecture)

```bash
npx skills@latest add mattpocock/skills
```

TDD demands a lot of your codebase. In a badly structured code base, test boundaries are unclear. Where should you test? At which layer?

When your code base has clear module boundaries, testing becomes much easier.

The `/improve-codebase-architecture` skill explores your codebase naturally, looking for confusions:

- Where does understanding one concept require bouncing between many small files?
- Where have pure functions been extracted just for testability, but real bugs hide in how they're called?
- Where do tightly coupled modules create integration risk?

Then it presents candidates for deepening opportunities - chances to deepen shallow modules into deeper ones.

![Three different interface designs presented side-by-side](https://res.cloudinary.com/total-typescript/image/upload/v1773675118/ai-hero-images/xcsyngiu3zdojvugipqz.png)

Do this once a week or after a surge of development. As you keep refining your codebase, you'll notice the quality of the agent's output goes up.

**If you have a garbage code base, the AI will produce garbage within that code base.**


That's five of seven. The rest — grill-with-docs, domain-modeling, triage — and a changelog of updates live at [/skills](/skills).

## Why This Matters: Treating AI Like Engineers

The most successful way to get code quality up from agents is to treat them like humans. Humans with weird constraints, sure - humans with no memory who are cloned and go right to work. But humans nonetheless.

[Check out the skills repository](https://github.com/mattpocock/skills) to get started.

<SkillsNewsletterCta
	heading="The kit keeps evolving"
	subtitle="Get the next skill or guide the moment Matt ships it."
/>
