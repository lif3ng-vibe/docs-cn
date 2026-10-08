// End-to-end tutorials. Each walks a real workflow using the actual pack:
// commands map to skills exactly as in the agent-skills repo, and every step
// is runnable in Claude Code, Codex, or any agent. No em dashes.

export interface Step {
  n: string;
  title: string;
  /** Claude Code slash command, if the step maps to one. */
  command?: string;
  /** Skill slug this step exercises (links to the catalog). */
  skill?: string;
  /** Copyable, tool-neutral prompt that works in any agent. */
  prompt: string;
  /** What the agent does and what you will see. */
  does: string;
  /** Why this step matters: the value of the skill. */
  why: string;
  /** How to know the step is done before moving on. */
  checkpoint?: string;
  /** Optional "faster path" note, e.g. using /build auto to skip the per-slice stepping. */
  tip?: string;
}

export interface Tutorial {
  slug: string;
  order: number;
  level: string;
  title: string;
  scenario: string;
  summary: string;
  time: string;
  difficulty: string;
  hue: number;
  /** Existing diagram reused as the header visual. */
  diagram: string;
  intro: string;
  prereqs: string[];
  steps: Step[];
  outcome: string;
  /** skill -> what it bought you, for the closing recap. */
  recap: { skill: string; got: string }[];
}

export const tutorials: Tutorial[] = [
  {
    slug: 'new-app',
    order: 1,
    level: 'Tutorial 01',
    title: 'Build a new app from an empty folder',
    scenario: 'Greenfield',
    summary:
      'Take a blank directory to a tested, reviewed, ship-ready app by driving every lifecycle phase with the pack. The example is a browser-based habit tracker that saves to localStorage, so it runs fully local with no database.',
    time: '30 to 45 min',
    difficulty: 'Beginner',
    hue: 205,
    diagram: 'lifecycle',
    intro:
      'You will build a small habit tracker: add daily habits, mark them done, and watch your streaks grow. It runs entirely in the browser and saves to localStorage, so there is no database or backend to set up. You will not write the code yourself. Instead you drive the agent through Define, Plan, Build, Verify, Review, and Ship. Pick any stack when the spec asks, even plain HTML, CSS, and JS. The goal is to feel what each skill buys you.',
    prereqs: [
      'The pack installed: npx skills add addyosmani/agent-skills',
      'An empty directory, opened in Claude Code or Codex',
      'A browser and any web stack you like, even plain HTML, CSS, and JS',
    ],
    steps: [
      {
        n: '1',
        title: 'Pressure-test the idea before any code',
        command: '/spec',
        skill: 'interview-me',
        prompt:
          'Interview me about a habit tracker I want to build. Ask one question at a time until you are ~95% sure what I actually want, then stop. Cover which habits, daily vs weekly, how a streak works, what a missed day does, and that data stays on this device.',
        does: 'The agent asks one focused question at a time and refuses to start building until the intent is clear.',
        why: 'A habit tracker sounds obvious until you hit the edge cases: what counts as a streak, what a missed day does to it, timezones, and whether data lives only on this device. A few questions now save a rebuild later.',
        checkpoint: 'You have a crisp, one-paragraph description of exactly what to build.',
      },
      {
        n: '2',
        title: 'Write the spec',
        command: '/spec',
        skill: 'spec-driven-development',
        prompt:
          'Follow the spec-driven-development skill. Write a SPEC.md for the habit tracker: objectives, the localStorage data model, the core screens and states, the streak rules, testing strategy, and explicit non-goals.',
        does: 'The agent produces a SPEC.md covering objectives, the data shape, screens, streak rules, testing, and boundaries.',
        why: 'You review a short plan in a couple of minutes instead of chasing decisions through 2,000 lines of generated code later. The data model and streak rules are exactly what you want pinned down before any UI exists.',
        checkpoint: 'SPEC.md exists and you agree with it. Edit anything you do not.',
      },
      {
        n: '3',
        title: 'Break it into small, ordered tasks',
        command: '/plan',
        skill: 'planning-and-task-breakdown',
        prompt:
          'Follow the planning-and-task-breakdown skill. Turn SPEC.md into small, verifiable tasks with acceptance criteria and dependency ordering: add a habit, mark a day done, compute streaks, show stats, persist to localStorage. Write them to tasks/plan.md.',
        does: 'The agent decomposes the spec into thin, independently shippable tasks with clear done criteria.',
        why: 'Small tasks are the unit you can actually verify. They stop the agent from writing one giant blob you cannot review.',
        checkpoint: 'tasks/plan.md lists tasks you could each land in one sitting.',
      },
      {
        n: '4',
        title: 'Build the first slice, test-first',
        command: '/build',
        skill: 'test-driven-development',
        prompt:
          'Follow incremental-implementation and test-driven-development. Implement the first task: computing a streak from a list of completed dates. Write the failing test first, cover the edge cases (a missed day, today not done yet), make it pass, then commit.',
        does: 'The agent writes a failing test for the streak logic, implements just enough to pass, runs it, and commits that slice.',
        why: 'Streak math is where the bugs hide, so it is the perfect thing to drive with tests. Each slice arrives tested and committed on its own, so a bad change is one revert away.',
        checkpoint: 'The streak tests are green and the slice is committed.',
        tip: 'Stepping one slice at a time feels slow? Run /build auto instead to implement the whole plan in a single approved pass. You approve the plan once, then it works through every task, still test-driven and committed per task, pausing only on failures or risky steps. Then rejoin at Verify below.',
      },
      {
        n: '5',
        title: 'Design the storage contract and the UI',
        skill: 'api-and-interface-design',
        prompt:
          'Design the localStorage module contract first: load, save, the data schema, and what happens when stored data is missing or from an older version. Then build a minimal, accessible UI: a list of habits, a way to mark today done, and a streak display. Keep it production-quality.',
        does: 'The api-and-interface-design and frontend-ui-engineering skills activate automatically for these tasks.',
        why: 'A clean storage contract keeps persistence out of your UI, and WCAG-aware components are exactly where agents cut corners. The skills hold the line so the output is not AI-generated slop.',
        checkpoint: 'You can add a habit, mark it done in the browser, and the streak updates.',
      },
      {
        n: '6',
        title: 'Prove it works with real runtime data',
        command: '/test',
        skill: 'browser-testing-with-devtools',
        prompt:
          'Run the full test suite. Then verify in a real browser: mark a habit done, confirm the streak updates in the DOM, and reload to confirm it persisted in localStorage. If you have the Chrome DevTools MCP configured, browser-testing-with-devtools will capture the DOM and network for you; if not, click through it yourself.',
        does: 'The agent runs the suite, and captures browser evidence via the Chrome DevTools MCP if it is configured, otherwise walks you through the check by hand.',
        why: '"Seems right" is never enough. You want to see the streak update and the data still there after a refresh, as evidence. The browser-testing-with-devtools skill automates that when the MCP is available.',
        checkpoint: 'Suite passes and you have seen a habit persist across a reload.',
      },
      {
        n: '7',
        title: 'Review before you call it done',
        command: '/review',
        skill: 'security-and-hardening',
        prompt:
          'Follow code-review-and-quality across all five axes, then run security-and-hardening focused on rendering user-entered habit names safely (no XSS) and on validating data loaded from localStorage, which is untrusted and can be tampered with or corrupted.',
        does: 'The agent reviews correctness, readability, architecture, security, and performance, and hardens how user input and stored data are handled.',
        why: 'Habit names are user input rendered into the page, a classic XSS footgun, and localStorage is an untrusted boundary. This is the step that catches both before a user does.',
        checkpoint: 'Findings are addressed, names are escaped, and bad stored data cannot crash the app.',
      },
      {
        n: '8',
        title: 'Ship with a go / no-go',
        command: '/ship',
        skill: 'shipping-and-launch',
        prompt:
          'Follow the shipping-and-launch skill. Produce a pre-launch checklist, put a new habit-type behind a feature flag, plan a deploy to any static host, and write the rollback steps. Then give me a go or no-go.',
        does: 'The agent runs a pre-launch checklist, sets up a flag and a static deploy plan with rollback, and returns an honest recommendation.',
        why: 'Shipping is a decision, not a vibe. A static app still deserves a checklist, a reversible flag, and a rollback path, then you make the call.',
        checkpoint: 'You have a go / no-go and a rollback plan you trust.',
      },
    ],
    outcome:
      'A working, tested, reviewed habit tracker that runs entirely in the browser and remembers your streaks, plus the artifacts that made it safe: SPEC.md, a task plan, tests, and a launch checklist. You reviewed a decision at every phase instead of a wall of code at the end.',
    recap: [
      { skill: 'spec-driven-development', got: 'A plan you could review in minutes' },
      { skill: 'planning-and-task-breakdown', got: 'Verifiable units instead of one blob' },
      { skill: 'test-driven-development', got: 'The streak math proven correct' },
      { skill: 'security-and-hardening', got: 'XSS and bad stored data caught before users' },
      { skill: 'shipping-and-launch', got: 'A reversible, checklisted launch' },
    ],
  },
  {
    slug: 'existing-app',
    order: 2,
    level: 'Tutorial 02',
    title: 'Add a feature to a codebase you did not write',
    scenario: 'Brownfield',
    summary:
      'The realistic case: a feature added safely to an existing app. Prime the agent on the codebase, spec against its patterns, verify in unfamiliar code, and land behind a flag. Example: add rate limiting to an API.',
    time: '40 to 60 min',
    difficulty: 'Intermediate',
    hue: 40,
    diagram: 'solo-workflow',
    intro:
      'Bring your own repo, or clone any open-source app you like. The worked example adds rate limiting to an existing API endpoint, but the shape applies to any feature in any brownfield system. Brownfield is where agents do the most damage, so the emphasis is on context, verification, and reversibility.',
    prereqs: [
      'The pack installed: npx skills add addyosmani/agent-skills',
      'An existing repo with a test suite, opened in Claude Code or Codex',
      'A real feature in mind (the example: rate limiting on one endpoint)',
    ],
    steps: [
      {
        n: '1',
        title: 'Prime the agent on the codebase',
        skill: 'context-engineering',
        prompt:
          'Follow the context-engineering skill. Read this repo and write a short rules file (CLAUDE.md or AGENTS.md) capturing its conventions: structure, patterns, test commands, and the things a newcomer would get wrong.',
        does: 'The agent surveys the repo and records its conventions where every future session will read them.',
        why: 'An agent starts every session cold and fills gaps with confident guesses. Writing the conventions down once stops it re-deriving your project from zero and inventing patterns you do not use.',
        checkpoint: 'A rules file exists that matches how the repo actually works.',
      },
      {
        n: '2',
        title: 'Ground the approach in the real docs',
        skill: 'source-driven-development',
        prompt:
          'Follow source-driven-development. For adding rate limiting in this stack, verify the approach against the official docs of the framework and libraries in use, cite the sources, and flag anything you could not confirm.',
        does: 'The agent checks the framework docs rather than pattern-matching from memory, and cites what it used.',
        why: 'Brownfield stacks pin specific versions. Source-cited decisions keep the agent from reaching for an outdated or wrong pattern.',
        checkpoint: 'The proposed approach is backed by citations you can open.',
      },
      {
        n: '3',
        title: 'Spec the feature against existing patterns',
        command: '/spec',
        skill: 'spec-driven-development',
        prompt:
          'Follow spec-driven-development, but scope it to a change inside this existing system. Spec rate limiting for one endpoint: where it hooks in, config, limits, error response, and what must not change.',
        does: 'The agent writes a focused spec that fits the current architecture instead of a greenfield design.',
        why: 'The spec now describes a change to a living system, including the invariants you must not break. You review the decision before it is built.',
        checkpoint: 'A short spec that names the integration point and the non-goals.',
      },
      {
        n: '4',
        title: 'Doubt the plan before touching production code',
        skill: 'doubt-driven-development',
        prompt:
          'Apply doubt-driven-development to this plan. In fresh context, extract every non-trivial claim about how the existing code behaves, try to refute each one against the actual source, and reconcile.',
        does: 'A skeptical pass re-checks the plan’s assumptions about the existing code before any change lands.',
        why: 'In code you did not write, a confident wrong assumption is cheap to catch now and expensive to debug in production later.',
        checkpoint: 'Assumptions about current behavior are confirmed against the source.',
      },
      {
        n: '5',
        title: 'Pin current behavior, then build in slices',
        command: '/build',
        skill: 'incremental-implementation',
        prompt:
          'Follow incremental-implementation and test-driven-development. First add characterization tests that pin the endpoint’s current behavior, then add rate limiting behind a feature flag in thin, committed slices.',
        does: 'The agent locks in existing behavior with tests, then adds the feature incrementally behind a flag.',
        why: 'Characterization tests make change observable, and the flag makes it reversible. You are changing a system people depend on, so both matter.',
        checkpoint: 'Old behavior is pinned, new behavior is flagged off by default.',
        tip: 'Too many stops? /build auto implements the remaining tasks in one approved pass, and still pauses on failures and risky steps. In code you did not write, it is worth keeping the manual stepping for the riskiest tasks and letting /build auto sweep the routine ones.',
      },
      {
        n: '6',
        title: 'When something breaks, find the root cause',
        skill: 'debugging-and-error-recovery',
        prompt:
          'A test broke after the change. Follow debugging-and-error-recovery: reproduce it, localize it, reduce it to the smallest failing case, fix the root cause, and add a guard so it cannot regress.',
        does: 'The agent runs a systematic triage instead of guessing at fixes.',
        why: 'Brownfield failures hide in the corners. A disciplined reproduce-localize-reduce-fix-guard loop beats trial and error.',
        checkpoint: 'The failure is understood and guarded, not just made to pass.',
      },
      {
        n: '7',
        title: 'Review as a change to the system',
        command: '/review',
        skill: 'code-review-and-quality',
        prompt:
          'Follow code-review-and-quality. Keep the change near ~100 lines, check that it fits existing patterns, and run security-and-hardening on the new limits and error paths.',
        does: 'The agent reviews the diff for correctness and fit, and hardens the new surface.',
        why: 'The bar for brownfield is "does this improve the system and follow its conventions," not "is it how I would have written it from scratch."',
        checkpoint: 'The change is small, fits the codebase, and is hardened.',
      },
      {
        n: '8',
        title: 'Roll out behind the flag',
        command: '/ship',
        skill: 'shipping-and-launch',
        prompt:
          'Follow shipping-and-launch. Plan a staged rollout using the feature flag, add the monitoring you would want on a rate limiter, and write the rollback. Give me a go or no-go.',
        does: 'The agent plans a gradual, monitored rollout with a clear rollback and a recommendation.',
        why: 'You flip the flag for a slice of traffic, watch the signals, and can turn it off instantly. That is how you change production without holding your breath.',
        checkpoint: 'A staged rollout plan with monitoring and a one-switch rollback.',
      },
    ],
    outcome:
      'A feature merged into a system you did not write, with the existing behavior pinned, the change small and reversible, and a rollout you can watch. The same sequence works for any brownfield feature.',
    recap: [
      { skill: 'context-engineering', got: 'The agent stopped guessing your patterns' },
      { skill: 'doubt-driven-development', got: 'Wrong assumptions caught before prod' },
      { skill: 'incremental-implementation', got: 'A small, flagged, reversible change' },
      { skill: 'debugging-and-error-recovery', got: 'Root cause, not a papered-over test' },
      { skill: 'shipping-and-launch', got: 'A staged rollout you could turn off' },
    ],
  },
  {
    slug: 'loop-engineering',
    order: 3,
    level: 'Tutorial 03',
    title: 'Put the skills in a loop',
    scenario: 'Loop engineering',
    summary:
      'Wrap the skills in a small, safe automated loop: a nightly job that fixes one thing, verifies it, and opens a short PR for you to approve. The skills are the verification inside the loop; you own the outer loop.',
    time: '30 to 45 min',
    difficulty: 'Advanced',
    hue: 145,
    diagram: 'inner-outer-loop',
    intro:
      'This tutorial builds the smallest honest software factory: a loop that improves your codebase while you sleep and asks for your sign-off in the morning. It pairs with the loop engineering guide, which explains the theory. Here you build one concretely. Keep the scope tiny on purpose, because a loop earns autonomy only where the check is cheap and hard to fake.',
    prereqs: [
      'The pack installed, and Tutorial 01 or 02 done first so the flow is familiar',
      'A repo with a fast, reliable test suite and a linter',
      'A way to run on a schedule: Claude Code /loop or a GitHub Actions cron, or Codex Automations',
    ],
    steps: [
      {
        n: '1',
        title: 'Pick a task that earns the dark',
        skill: 'code-simplification',
        prompt:
          'Help me pick one narrow, high-frequency, hard-to-fake improvement to automate: for example, fixing a single lint violation or removing one needlessly optional prop per run. It must be verifiable by a green-or-red check.',
        does: 'You and the agent choose a change whose "done" a machine can prove, not just assert.',
        why: 'Back pressure: automate only what you can cheaply and reliably verify. A cheap oracle is what lets you walk away safely. See the loop engineering guide for where to keep the lights on.',
        checkpoint: 'You have one tiny task with a pass/fail oracle (tests plus lint).',
      },
      {
        n: '2',
        title: 'Define the maker',
        command: '/build',
        skill: 'incremental-implementation',
        prompt:
          'Write a short instruction for a "maker" agent: find one instance of the target pattern, fix it following incremental-implementation and test-driven-development, run the tests and linter, and commit only if both pass.',
        does: 'You capture the inner-loop worker as a small, repeatable instruction (a prompt or a SKILL.md).',
        why: 'The maker is one job on repeat: gather context, act, check, commit. Writing it down once is what turns a one-off run into a loop.',
        checkpoint: 'A maker instruction that stops unless tests and lint are green.',
      },
      {
        n: '3',
        title: 'Add a separate checker',
        skill: 'code-review-and-quality',
        prompt:
          'Write a "checker" agent that reviews the maker’s diff with code-review-and-quality against a short rubric, and rejects anything outside the target pattern or larger than a few lines.',
        does: 'A second agent, with different instructions, grades the work the maker produced.',
        why: 'The model that wrote the code grades its own homework too kindly. A separate checker is the only reason you can trust an unattended run. This is the same split /ship uses.',
        checkpoint: 'A checker that can say no, on its own rubric.',
      },
      {
        n: '4',
        title: 'Wrap it in a loop with a real stop condition',
        prompt:
          'Set this up to run on a schedule with a verifiable stop condition. In Claude Code use /loop or a run-until-done /goal such as "tests and lint are clean"; in Codex use an Automation. Keep each run to one fix.',
        does: 'A harness primitive (Claude Code /loop or /goal, or a Codex Automation) runs the maker and checker on a cadence.',
        why: 'The loop primitive belongs to your harness, not this pack. It runs the skills, and a separate model, not the maker, decides when the run is done.',
        checkpoint: 'The loop runs one full maker-then-checker cycle end to end.',
      },
      {
        n: '5',
        title: 'Give the loop a memory',
        prompt:
          'Add a state file (a progress markdown file or a tracker) where each run records what it changed and what is left, so tomorrow’s run resumes instead of repeating itself.',
        does: 'The loop writes what it did to disk, outside any single conversation.',
        why: 'The model forgets everything between runs. The state file is the spine that lets the loop pick up where it stopped.',
        checkpoint: 'A run reads and updates the state file.',
      },
      {
        n: '6',
        title: 'Make the loop hand you evidence',
        skill: 'git-workflow-and-versioning',
        prompt:
          'Have the loop open a small pull request with the diff, the passing test and lint output, and a one-line rationale. Anything it cannot verify should be left for me, not merged.',
        does: 'Each successful run produces a short, reviewable PR; anything uncertain is escalated, not shipped.',
        why: 'This is the boundary between the inner and outer loop. What crosses it is evidence: a diff, green checks, and a reason. You give the verdict.',
        checkpoint: 'You wake up to a PR short enough to read in a minute.',
      },
      {
        n: '7',
        title: 'Own the outer loop',
        prompt:
          'Review the loop’s PR. Decide: merge, redirect, or turn the loop off. Then decide which parts of your codebase should never run lights-out (auth, billing, public APIs) and keep those on manual review.',
        does: 'You read the evidence, make the call, and set where the loop is allowed to operate.',
        why: 'The agent can ship more than you can review, so your judgment is the scarce resource. You stay in the constraints, sampling, audit, and ownership loops. The loop cannot inherit the consequences. You can.',
        checkpoint: 'You have shipped one loop-made change you are willing to sign your name to.',
      },
    ],
    outcome:
      'A tiny, honest software factory: a scheduled maker-checker loop that improves the codebase and hands you a short PR to approve, with the risky parts of the system kept firmly on manual review. Scale the pattern only as far as your verification can reach.',
    recap: [
      { skill: 'test-driven-development', got: 'The green-or-red oracle the loop runs on' },
      { skill: 'incremental-implementation', got: 'The maker’s small, safe fix per run' },
      { skill: 'code-review-and-quality', got: 'A checker that is not the maker' },
      { skill: 'git-workflow-and-versioning', got: 'A small PR as the evidence you approve' },
    ],
  },
];

export function getTutorial(slug: string) {
  return tutorials.find((t) => t.slug === slug);
}

export const RUN_MODES = [
  { tool: 'Claude Code', how: 'Type the slash command, e.g. /spec. Skills also activate on their own.' },
  { tool: 'Codex', how: 'Invoke the skill by name, e.g. @spec-driven-development, or just paste the prompt.' },
  { tool: 'Any agent', how: 'Paste the step’s prompt. It names the skill to follow, so no slash command is needed.' },
];
