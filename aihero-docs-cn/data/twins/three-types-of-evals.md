---
title: "The Three Types Of Evals"
slug: "three-types-of-evals"
type: "post"
description: "Learn about deterministic evals, human feedback, and LLM-as-a-judge."
tags:
  - test-and-evaluate
updatedAt: "2024-11-26T15:54:16.049Z"
---

## Deterministic Evals

- Deterministic evals are evals that return a pass/fail result. They seek to extract determinism from a probabilistic system.
- They are the "most useful kind of eval" according to [Ian Webster](https://www.youtube.com/watch?v=OrtBEBLMXdM). These evals should be fast, and developer focused.
- A brilliant example is from Discord's [Ian Webster](https://www.youtube.com/watch?v=OrtBEBLMXdM), where they checked that their AI bot, Clyde, always replied with a lowercase letter at the beginning of its messages. This meant that their bot was imitating the behavior of a Gen-Z user.

## LLM-as-a-Judge

- Some evaluations can be done via LLM's.
- [autoevals](https://github.com/braintrustdata/autoevals/tree/main/templates) templates are a good example of various types of these evals. [Humor](https://github.com/braintrustdata/autoevals/blob/main/templates/humor.yaml) judges if something is funny. [Battle](https://github.com/braintrustdata/autoevals/blob/main/templates/battle.yaml) compares two responses to find which one is better.
- You can even use LLM's to check factuality, by providing a ground truth statement to check the response against.
- Failing a LLM-as-a-judge evaluator is often a good indicator that a human should take a look. So, it's more like a smoke test than a real test (personal opinion).

## Human Feedback

- Some evals can only be usefully evaluated by humans. These involve long-form text generation and certain types of factuality.
- Human oversight is needed for any type of LLM app.
