---
title: "Learn Anything With My /teach Skill"
slug: "learn-anything-with-my-teach-skill"
type: "post"
description: "Learn to use the /teach skill in Claude Code to create personalized AI-powered lessons on anything—languages, coding, skills—with interactive exercises."
updatedAt: "2026-06-08T16:45:34.558Z"
---

The [`/teach` skill](https://github.com/mattpocock/skills/tree/main/skills/productivity/teach) is designed to let you learn anything using Claude as your personalized teacher. It doesn't just generate random lessons - it understands _your_ goals, adapts to _your_ level, and creates lessons tailored specifically to you.

The skill captures your mission, finds high-quality resources, generates interactive lessons with audio and quizzes, and keeps a learning record of your progress so it always knows exactly where you are in your journey.

<PromoCard
	variant="course"
	title="Learn this way, live"
	description="The cohort runs on exactly this workflow — join the waitlist for the next AI Coding for Real Engineers."
	href="/cohorts/ai-coding-for-real-engineers-m0k0w"
	ctaLabel="Join the waitlist"
/>

## Steps To Complete

### Set Up Your Project

- [ ] Create a new directory for your learning project

```txt
mkdir learning-french
cd learning-french
```

- [ ] Open the directory in your code editor (VS Code is recommended)

```txt
code .
```

### Install the /teach Skill

- [ ] Ensure Node.js is installed on your system

If you don't have Node, [download it from nodejs.org](https://nodejs.org/en/download).

- [ ] Open the integrated terminal in your editor and run the skills installation command

```txt
npx skills@latest add mattpocock/skills
```

- [ ] Select the `/teach` skill when prompted

Use the up/down arrow keys to navigate, then press `space` to select it.

- [ ] Choose Claude Code as your agent

Again, use arrow keys and space to select.

- [ ] Choose to install locally in your project (project scope)

- [ ] Select the symlink installation method

- [ ] Decline the "find skills" skill when asked

### Fix the Agent Directory (if needed)

If the installation created an `.agents` directory instead of `.claude`, you'll need to create a symlink so both directories point to the same place.

- [ ] Run the symlink command in your terminal

```txt
ln -s .agents .claude
```

This ensures both Claude Code and your agents can read from the same directory, and changes in one will reflect in the other.

### Use the /teach Skill to Create Your First Lesson

- [ ] Open Claude Code or your chosen agent in the project directory

- [ ] Ask the agent to teach you something

For example: `teach me French` or `teach me React hooks` or `teach me how to make sourdough bread`.

The agent will ask you clarifying questions about:

- Why you want to learn this
- Your current level
- What success looks like for you
- How you prefer to learn

Be specific with your answers - the more detail you give, the better your personalized lessons will be.

![Claude asking clarifying questions about your French learning mission](https://res.cloudinary.com/total-typescript/image/upload/v1780936890/ai-hero-images/qe4ytzhikcjq2hzcuzhw.png)

- [ ] Review the files the agent creates

The agent will generate several files in your project:

- `MISSION.md` - your learning goal and context
- `RESOURCES.md` - vetted resources for your specific goal
- `reference/glossary.html` - a cheat sheet you can add to as you learn
- `lessons/` - interactive HTML lessons with audio and quizzes
- `learning-records/` - your progress history

- [ ] Open and complete your first lesson

Open the lesson file in your browser (the agent will tell you the command to run) and work through the interactive content. Many lessons include tap-to-hear audio buttons and instant-feedback quizzes.

![Interactive French lesson in browser with tap-to-hear audio buttons and quiz questions](https://res.cloudinary.com/total-typescript/image/upload/v1780936891/ai-hero-images/hcwm9jbwvfodztditzfa.png)

### Continue Your Learning

- [ ] Tell the agent how the first lesson went and ask for the next one

Come back to Claude Code and describe what you learned, what was confusing, or what you'd like to focus on next. Treat it like talking to a real teacher who knows everything about your progress.

The agent will create new lessons, update your learning records, and continue building your reference materials as you progress through your learning journey.

