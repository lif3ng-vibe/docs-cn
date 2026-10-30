---
title: "What Are Tokens?"
slug: "what-are-tokens"
type: "post"
description: "Discover how tokens power LLMs, affecting costs and efficiency. Learn about encoding, decoding, and vocabulary size for optimized text processing."
tags:
  - learn-how-llms-think
  - understand-the-basics
updatedAt: "2025-09-30T09:47:04.967Z"
---

Tokens are the fundamental building blocks that help Large Language Models (LLMs) process text. Understanding them is essential, especially since you're billed based on token usage.

## What Are Tokens?

Tokens are simply numbers that represent how the LLM "thinks" about the text you provide. The process of converting text into tokens is called **encoding**.

The tokenization process works in two parts:

1. The tokenizer splits text into tokens it recognizes
2. These tokens are converted into numbers

![Encoding](https://res.cloudinary.com/total-typescript/image/upload/v1759238445/ai-hero-images/vqsgrg2rv79rqgxhvsmc.png)

Decoding is the reverse process:

1. Numbers are converted back into text tokens
2. The tokens are joined together to form the output

![Decoding](https://res.cloudinary.com/total-typescript/image/upload/v1759238446/ai-hero-images/t4k9fszkfkcbm1mrthwj.png)

## The LLM Process Flow

The complete LLM process looks like this:

1. Tokenizer encodes your input text into tokens
2. LLM processes your tokens
3. LLM produces output tokens
4. Output tokens are decoded back into readable text

![LLM Process Flow](https://res.cloudinary.com/total-typescript/image/upload/v1759238447/ai-hero-images/hs0gx3ozagimhl5xunxn.png)

To clarify, input tokens include:

- Your conversation history with the LLM
- System prompts
- Tool definitions

Output tokens are what the LLM sends back as a response.

You're billed for both input and output tokens, typically at different rates. One way to save money is to design your prompts to generate fewer output tokens.

## How Tokens Are Created

The tokenization process starts with a large corpus of text - similar to what's used to train the LLM itself. Let's imagine a tiny corpus consisting of just one sentence: "the cat sat on the mat."

![Tokenization](https://res.cloudinary.com/total-typescript/image/upload/v1759238448/ai-hero-images/ekv9gq9bvk9efycqow1p.png)

First, all individual characters are extracted:

```
T H E space C A T space S A T space O N space T H E space M A T
```

Each of these characters becomes its own token in the vocabulary.

Next, common groupings of characters are identified:

- "TH" appears in "the" (twice)
- "HE" appears in "the" (twice)
- "AT" appears in "cat", "sat", and "mat"

Each of these groupings also gets assigned its own token.

Then, groups of groups are identified - like "TH" + "HE" creating "THE" (the word "the"), which gets its own token.

## Vocabulary Size Matters

The goal is to create a large vocabulary of tokens because larger vocabularies can split words into fewer tokens, making processing more efficient.

![Vocabulary Size](https://res.cloudinary.com/total-typescript/image/upload/v1759238449/ai-hero-images/mcsd9qzjf4cz1ulsrblz.png)

For example, a vocabulary size of 1,000 tokens might split "understanding" into 5 tokens. A vocabulary size of 50,000 tokens might split it into 3 tokens, and a vocabulary size of 200,000 tokens might split it into 2 tokens.

Having a larger vocabulary means you can split words into fewer tokens, making processing more efficient.

## Handling Unusual Words

The tokenizer struggles with uncommon words. For example, "O Frabjous Day" from Lewis Carroll's poem gets split into many tokens because "Frabjous" is a made-up word that doesn't appear frequently in the training corpus.

![Unusual Words](https://res.cloudinary.com/total-typescript/image/upload/v1759238450/ai-hero-images/pcnihurikeetpfh01xss.png)

We can see that it turns it into 7 tokens - more than we'd expect from only 15 characters.

## Final Thoughts

I hope that helps demystify tokens a bit. I found the [tiktokenizer playground](https://tiktokenizer.vercel.app/) really useful for understanding this stuff.

Let me know if you have any questions - and what else would you like me to cover next?

Matt
