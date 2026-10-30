---
title: "My Skill Makes Claude Code GREAT At TDD"
slug: "skill-test-driven-development-claude-code"
type: "post"
description: "Here's my TDD skill for getting Claude to write honest tests and real implementations using red-green-refactor and vertical slicing."
tags:
  - ship-solid-code
updatedAt: "2026-02-10T11:42:14.095Z"
---

For the last few weeks, I've been using a TDD skill I wrote to do most of my non-frontend work.

It solved a lot of the problems that I previously had experienced with LLMs and tests.

If you want to try it out, here it is:

```bash
npx skills add mattpocock/skills/tdd
```

For a longer breakdown, here you go:

## The Problem: Why LLMs Fail at Tests

When you ask an LLM to "write a feature," it tends to work in **horizontal slices**. It writes the entire feature first, then writes tests for that feature afterward. This is problematic because you're not really verifying that the tests are actually testing what they're supposed to.

Here's what happens in practice:

| Horizontal Slicing (❌ Bad) | Vertical Slicing (✅ Good) |
| --------------------------- | -------------------------- |
| RED: write all tests        | RED→GREEN: test1→impl1     |
| GREEN: write all code       | RED→GREEN: test2→impl2     |
| REFACTOR: cleanup           | RED→GREEN: test3→impl3     |

The core issue: **Tests written in bulk test imagined behavior, not observed behavior.**

When an LLM generates 10 tests upfront and then implements to pass them all, several bad things can happen:

- Tests verify mocks instead of real code paths
- Tests might not even run properly or have short circuits built in
- When the LLM's context is running low, it might just rewrite the test to make it pass instead of writing real implementation

Bad tests aren't just a review problem, they're a debt problem. Every test you create has to be maintained forever, just like code. Tests that aren't tied to actual behavior or are too coupled to implementation details become expensive liabilities.

## The Solution: Red-Green-Refactor Vertical Slices

My TDD skill constrains Claude to work in **vertical slices** using tracer bullets:

```
ONE test → ONE implementation → repeat
```

Each cycle responds to what you learned from the previous cycle. Because you just wrote the code, you know exactly what behavior matters and how to verify it.

### The Three Phases

**RED**: Write ONE test that fails. Just one.

**GREEN**: Write minimal code to pass that test only. Nothing speculative.

**REFACTOR**: After all tests pass, clean up duplications and simplify.

This constraint prevents cheating. If a test fails first, the LLM can't fake it, it has to write real implementation.

## How the Skill Changes What Claude Builds

When you use this approach on a real feature, something interesting happens: the tests become a **conversation Claude is having with its own code**.

Each test asks a different question about the implementation:

- "Does this observable behavior work?"
- "How does the system handle edge cases?"
- "What happens when conditions change?"

This interrogation means Claude discovers things about its own implementation as it goes, rather than just checking boxes. And sometimes, a test that you write will pass immediately, not because it's a wasted test, but because the implementation is already robust enough to handle it.

## What Makes a Test Good (vs Bad)

I've included details in the skill about good and bad tests - here's what I described:

### Good Tests

Good tests exercise real code paths through **public interfaces**, not implementation details. They describe WHAT the system does, not HOW it does it.

```typescript
// GOOD: Tests observable behavior through the interface
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

A good test reads like a specification: "user can checkout with valid cart" tells you exactly what capability exists. These tests survive complete internal refactors because they don't care about internal structure.

### Bad Tests

Bad tests are **coupled to implementation**. They mock internal collaborators, test private methods, or verify through external means instead of using the interface.

```typescript
// BAD: Tests implementation detail (mocking internals)
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});

// BAD: Bypasses interface to verify (queries DB directly)
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});
```

The warning sign: your test breaks when you refactor, but the behavior hasn't changed. If you rename an internal function and tests fail, those tests were testing implementation, not behavior.

### The Key Difference

| Good Tests                                   | Bad Tests                                               |
| -------------------------------------------- | ------------------------------------------------------- |
| Exercise real code through public interfaces | Mock internal collaborators                             |
| Describe WHAT the system does                | Test HOW it's implemented                               |
| Survive internal refactors unchanged         | Break on refactoring without behavior change            |
| Read like specifications                     | Test the shape of data structures                       |
| Focus on user-facing behavior                | Verify through external means (DB queries, call counts) |

## The Planning Phase (Before Any Code)

In the skill, I found that using a planning phase before any code was written was extremely important. I decided to implement it using these questions:

- **What interface changes are needed?** What functions, methods, or APIs are being added or modified?
- **Which behaviors matter most?** You can't test everything. Prioritize critical paths and complex logic over edge cases.
- **Can we design for deep modules?** A deep module has a small interface but handles complex logic internally. This makes testing simpler and the API cleaner.
- **Can we design for testability?** Functions should accept dependencies rather than create them. They should return results instead of producing side effects.

The better answers the user provided to these questions, the higher the code quality got.


<SkillsCta
	heading="TDD is one. There are more."
	subtitle="The full skill set I run with Claude Code, day in and day out."
	cta="See the skill set"
/>

## Why This Matters for Claude Code Users

The skill isn't about perfect tests. It's about **honest tests through forced constraints**.

By structuring Claude's work as one test, one implementation, repeat, you prevent it from:

- Writing imagined behavior instead of observed behavior
- Mocking internals and faking test passes
- Over-engineering the solution upfront
- Writing tests that are coupled to implementation details

The tests become trustworthy. You can delegate large parts of your work to Claude, not just code review but actual feature building, because you know the tests are honest.

And when you can trust the tests, you can trust the code.
