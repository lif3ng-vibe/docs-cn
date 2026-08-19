---
title: "Mermaid, PDF &amp; image viewers"
description: "Mermaid, PDF &amp; image viewers — Orca documentation."
source: "https://www.onorca.dev/docs/editing/viewers"
---

# Mermaid, PDF & image viewers

$undefined

Orca includes built-in viewers for the formats that show up in most repos.

## Mermaid

Mermaid diagrams render inline inside markdown preview. Standalone `.mmd` files open in a dedicated viewer with pan/zoom.

## PDF

Scroll, zoom, and text selection. Useful for design docs checked into the repo. Scroll position is restored when you switch away from a PDF tab and come back (including close-and-reopen in the same session) — page plus mid-page offset, so you land where you left off. Positions are session-only and clear when Orca restarts.

## Images

`.png`, `.jpg`, `.svg`, `.webp`, `.gif`. Image-diff mode compares two versions of the same file side-by-side.

## CSV / TSV

`.csv` and `.tsv` files open in a table viewer with sortable columns and quick search. Useful for fixtures, exports, and any tabular data checked into the repo. Use the toolbar to flip back to the raw text view if you need to edit cells directly.

## Jupyter notebooks

`.ipynb` files open in a notebook viewer with rendered markdown, syntax-highlighted code cells, and saved outputs. Editing cells writes back to the on-disk `.ipynb` while preserving nbformat, so diffs stay clean.

> Beta The notebook editor is marked beta. Cell execution and richer output rendering are still settling — file an issue if a notebook in your repo doesn't load cleanly.
