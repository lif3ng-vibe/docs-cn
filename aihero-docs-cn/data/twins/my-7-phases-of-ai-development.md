---
title: "My 7 Phases Of AI Development"
slug: "my-7-phases-of-ai-development"
type: "post"
description: "Master the 7 phases of AI-assisted development with Claude Code. Learn how to ship production-quality code using research, prototyping, PRDs, and more."
tags:
  - think-like-an-ai-engineer
  - level-up-your-workflow
updatedAt: "2026-03-16T10:27:14.263Z"
---

I've identified seven phases of development with AI that consistently lead to shipping great work. These phases apply whether you're using [Ralph loops](https://www.aihero.dev/getting-started-with-ralph), [GSD](https://github.com/gsd-build/get-shit-done), [Spec Kit](https://github.com/github/spec-kit), or any other AI coding approach.

The specific implementation is up to you, but these seven phases represent a common pattern across successful AI-assisted development workflows.

This guide is for engineers who believe that fundamentals matter in the AI age. It's not for vibe coders, it's for people serious about AI engineering and building applications that are built to last.

## Phase 1: The Idea

Every project starts with an idea - the reason you're invoking this process. This could be:

- An entire app you want to build
- A specific feature or bug fix
- A codebase refactor

The idea can be as large or small as you need. This process scales from massive projects to narrow, focused tasks.

### Refining Your Idea

Before moving to research or prototyping, refine your idea iteratively. I use a [`/grill-me` skill](https://github.com/mattpocock/skills) that walks through questions to flesh out the concept and make it more concrete.

This early refinement helps clarify requirements and uncover assumptions before investing time in research or prototypes.

## Phase 2: Research (Optional)

If your idea involves external dependencies or difficult exploration phases, include a research phase.

For example, if you're integrating with Stripe or an uncommon API, create a `RESEARCH.md` asset that caches all relevant information inside your repo where agents can access it.

### Why Research Matters

Agents often work in fresh context windows. If exploration is difficult (external APIs, hard-to-access documentation), caching that information in a `research.md` file saves repeated exploration and improves agent performance.

**Important:** Research assets typically live only for the duration of this sprint or feature development. Research can go out of date or cause agents to take wrong turns if kept too long.

## Phase 3: Prototyping

Prototyping is essential when you need to impose your taste on the outcome. At this stage, you're still exploring what you're building and how it should work.

Create multiple variations on a throwaway route, letting the LLM show you different approaches. Iterate through a couple of sessions to find the best option.

This applies to:

- UI design and behavior
- Software architecture decisions
- Testing external service integrations

Prototyping early lets you commit the winning design to your codebase, making it available to agents during implementation. By the time you write the PRD, concrete examples are more valuable than abstract descriptions.

## Phase 4: Product Requirements Document (PRD)

With research and prototyping complete, it's time to properly describe the destination. You should now understand the end state clearly.

Focus on what users will see and how it will behave, not implementation details. The PRD (Product Requirements Document) describes the end state, not the journey.

During PRD creation, hammer out the design by prompting the agent to grill you on every decision point. Walk through your entire decision tree to uncover edge cases and requirements. I use a [`/write-a-prd` skill](https://github.com/mattpocock/skills) that is purpose-built for this process.


<SkillsCta
	heading="Phases are the map. Skills walk it."
	subtitle="What I actually run through each phase to keep agents on the rails."
	cta="See the skill set"
/>

## Phase 5: Implementation Planning (Kanban Board)

Break down the PRD into an implementation plan. A Kanban board is a list of tickets with blocking relationships that describes all the work needed.

While you could create a single sequential plan, Kanban boards enable effective parallelization. Find all non-blocking tickets and spin up an agent for each one. I use a [`/prd-to-issues` skill](https://github.com/mattpocock/skills) to automate this breakdown.

GitHub issues works well for both PRDs and Kanban boards, though it lacks built-in blocking relationships. [Linear](https://linear.app) is a better option if you need that feature.

## Phase 6: Execution

Run a coding agent to execute all tickets on the Kanban board. This is where the actual code gets written.

Most times, a sequential agent working through each ticket is sufficient. However, with a well-structured Kanban board, you can parallelize by running multiple agents on non-blocking tickets simultaneously.

I use [Ralph loops](https://www.aihero.dev/getting-started-with-ralph), which work effectively with this setup. Ralph loops allow agents to work autonomously while maintaining code quality through automated testing and validation.

### Running Away From Keyboard (AFK)

With proper setup (research, prototype, Kanban board, and PRD), you can run the execution loop away-from-keyboard and get excellent results.

The key is ensuring your agents have all the context they need:

- Research assets for external dependencies
- Prototype code for design patterns
- Clear PRD for requirements
- Well-defined tickets with acceptance criteria

When these pieces are in place, agents can make informed decisions without constant human intervention.

## Phase 7: Quality Assurance

Once execution completes, have the agent create a QA plan for human review. This plan should outline specific test scenarios, edge cases, and acceptance criteria to verify.

QA typically uncovers issues or improvement opportunities, resulting in more Kanban tickets and another execution loop. This is expected and healthy - you'll iterate through phases 5-7 multiple times until you reach a polished product.

Each iteration should bring you closer to production quality:

1. Agent creates QA plan
2. Human reviews and tests the implementation
3. Human identifies bugs, UX issues, or improvements
4. New tickets are created
5. Return to execution phase

### Code Review and Human Involvement

QA involves humans reading the generated code to ensure quality, maintainability, and correctness. This may not always be necessary (especially with gray box architectures), but it's an important quality gate for production systems.

Look for:

- Logic errors or edge cases
- Security vulnerabilities
- Performance issues
- Code maintainability and readability
- Adherence to project patterns

These seven phases form the core framework for working effectively with AI agents.

## Summary

| Phase                   | Purpose                         | Key Deliverable             |
| ----------------------- | ------------------------------- | --------------------------- |
| 1. Idea                 | Define what you want to build   | Problem statement           |
| 2. Research (optional)  | Explore external dependencies   | `research.md` asset         |
| 3. Prototype (optional) | Test design and UX ideas        | Working prototype           |
| 4. PRD                  | Document the end state          | Product requirements        |
| 5. Kanban Board         | Break down work into tickets    | Task list with dependencies |
| 6. Execution            | Build the actual implementation | Working code                |
| 7. QA                   | Verify the completed work       | `QA` plan and feedback      |

This framework will likely evolve as new patterns emerge. Code review deserves special attention - it could be integrated into the execution flow or expanded within the QA phase.
