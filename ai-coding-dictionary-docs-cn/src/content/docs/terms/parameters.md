---
title: "Parameters（参数量）"
source: "https://www.aihero.dev/ai-coding-dictionary/parameters"
---


The numbers inside a [model](/terms/model) — often billions of them — tuned during [training](/terms/training). Everything the model "knows" lives in them. Training sets them; [inference](/terms/inference) uses them unchanged. Also called _weights_.

Mechanically, the parameters are what turn input into output. [Next-token prediction](/terms/next-token-prediction) is a giant calculation: the [tokens](/terms/token) in the [context window](/terms/context-window) go in, get multiplied through the parameters, and a prediction for the next token comes out. There is no database of facts inside the model, no code lookup table — just these numbers, arranged so that the calculation tends to produce useful output. Facts the model can recite from training, like a standard library API, are [parametric knowledge](/terms/parametric-knowledge): stored in the parameters, not retrieved from anywhere.

The detail worth internalising is that parameters are frozen after training. Nothing you do in a [session](/terms/session) changes them — no correction you make, no codebase you show it, no mistake it learns from. Every session runs on the same numbers. This is why the model is [stateless](/terms/stateless), why its built-in knowledge stops at the [knowledge cutoff](/terms/knowledge-cutoff), and why anything project-specific has to arrive via [context](/terms/context) instead. The only way parameters change is more training — which produces, in effect, a different model.

_Usage:_

"Can we fine-tune it on our codebase?"

"That'd update the parameters — different model afterwards. For one project it's almost always cheaper to load the codebase as context than to retrain."
