### Check readiness before a skill runs | ### 技能运行前先检查就绪状态
## Model policy | ## 模型策略
### Model policy configuration is invalid or unreadable | ### 模型策略配置无效或不可读
### A custom provider needs an explicit model or host mode | ### 自定义提供商需要显式模型或宿主模式
### The selected review model could not be used | ### 选定的评审模型不可用
### Model-catalog freshness is unknown, stale or needs an update | ### 模型目录新鲜度未知、过期或需要更新
#### Repairing `recoveryRequired` state | #### 修复 `recoveryRequired` 状态
## Outside reviews (Codex and Claude Code) | ## 外部评审（Codex 与 Claude Code）
### How the verdict is read from a review | ### 评审结论如何被读取
### `gstack: cannot load gstack-codex-probe` / `gstack: cannot locate <helper> (shell: ...)` / `CODEX_MODE: helper_unavailable` | ### `gstack: cannot load gstack-codex-probe` / `gstack: cannot locate <helper> (shell: ...)` / `CODEX_MODE: helper_unavailable`
### `Codex outside review unavailable: Codex's sandbox could not start here (...)` | ### `Codex outside review unavailable: Codex's sandbox could not start here (...)`
### `... outside review unavailable: the reviewer could not run commands or read the diff (...)` | ### `... outside review unavailable: the reviewer could not run commands or read the diff (...)`
### `... outside review unavailable: the reviewer process failed (exit N: ...)` | ### `... outside review unavailable: the reviewer process failed (exit N: ...)`
### `... outside review unavailable: the reviewer hit its time limit and was stopped (exit 124)` | ### `... outside review unavailable: the reviewer hit its time limit and was stopped (exit 124)`
### `... outside review unavailable: the reviewer returned no response` | ### `... outside review unavailable: the reviewer returned no response`
### `... outside review unavailable: the reviewer declined to review` | ### `... outside review unavailable: the reviewer declined to review`
### `... outside review unavailable: the reviewer hit its output token limit and the response is cut off (...)` | ### `... outside review unavailable: the reviewer hit its output token limit and the response is cut off (...)`
### `... outside review unavailable: the response lacks the markers this gate requires (...)` | ### `... outside review unavailable: the response lacks the markers this gate requires (...)`
### `... outside review: ran, verdict unverified (...)` / `OUTSIDE_STATUS: unverified` / `GATE: UNVERIFIED` | ### `... outside review: ran, verdict unverified (...)` / `OUTSIDE_STATUS: unverified` / `GATE: UNVERIFIED`
### `... outside review: ran, verdict unverified (the review labels a finding with a P0-P3 severity in a form the parser cannot read (line N: "..."))` / `REASON: unparsed_severity` | ### `... outside review: ran, verdict unverified (the review labels a finding with a P0-P3 severity in a form the parser cannot read (line N: "..."))` / `REASON: unparsed_severity`
### `... outside review: ran, verdict unverified (the reviewer's own verdict does not say the change is ready (Verdict: ...))` / `REASON: unverified_verdict` | ### `... outside review: ran, verdict unverified (the reviewer's own verdict does not say the change is ready (Verdict: ...))` / `REASON: unverified_verdict`
### `CODEX_MODE: model_unusable` / `MODEL_UNUSABLE` | ### `CODEX_MODE: model_unusable` / `MODEL_UNUSABLE`
# or edit model / base_url in ${CODEX_HOME:-~/.codex}/config.toml | # 或编辑 ${CODEX_HOME:-~/.codex}/config.toml 中的 model / base_url
### `CODEX_MODE: quota_exhausted` / `MODEL_QUOTA_EXHAUSTED` | ### `CODEX_MODE: quota_exhausted` / `MODEL_QUOTA_EXHAUSTED`
# or | # 或
### `CODEX_MODE: unverified (rate_limited)` / `MODEL_PROBE_RATE_LIMITED` / `unavailable: Codex rate-limited the review` | ### `CODEX_MODE: unverified (rate_limited)` / `MODEL_PROBE_RATE_LIMITED` / `unavailable: Codex rate-limited the review`
### `CODEX_MODE: unverified` / `MODEL_PROBE_INCONCLUSIVE` | ### `CODEX_MODE: unverified` / `MODEL_PROBE_INCONCLUSIVE`
### `CODEX_MODE: not_authed` / `AUTH_FAILED` | ### `CODEX_MODE: not_authed` / `AUTH_FAILED`
### `Codex review skipped (codex_reviews disabled)` / `CODEX_MODE: disabled` | ### `Codex review skipped (codex_reviews disabled)` / `CODEX_MODE: disabled`
### `outside review: not run (outside reviews are turned off ... ). Fix: gstack-config set codex_reviews enabled ...` / `OUTSIDE_STATUS: not_run reason=consent_missing` | ### `outside review: not run (outside reviews are turned off ... ). Fix: gstack-config set codex_reviews enabled ...` / `OUTSIDE_STATUS: not_run reason=consent_missing`
### `NOTICE: gstack outside reviews send the review prompt and code to Codex (...) using ...` | ### `NOTICE: gstack outside reviews send the review prompt and code to Codex (...) using ...`
## /ship, /review and /document-release | ## /ship、/review 与 /document-release
### `Shipped without a version change: no version source is configured (no VERSION file, no .gstack/version-path). ...` | ### `Shipped without a version change: no version source is configured (no VERSION file, no .gstack/version-path). ...`
### `gstack-version-bump: classify: version source is broken: <path> ...` | ### `gstack-version-bump: classify: version source is broken: <path> ...`
### `BASE_REFRESH: stale <rev>` / `Base coverage: stale at <rev>` | ### `BASE_REFRESH: stale <rev>` / `Base coverage: stale at <rev>`
### `review_freshness: STALE content changed during review: the tree moved from <start> to <end> while <skill> ran ...` / **Review records missing or mismatched** | ### `review_freshness: STALE content changed during review: the tree moved from <start> to <end> while <skill> ran ...` / **Review records missing or mismatched**
### `STOP: /ship run <id> is open on this checkout and past its preflight (<marker>; open until its finish or for 120 minutes) ...` | ### `STOP: /ship run <id> is open on this checkout and past its preflight (<marker>; open until its finish or for 120 minutes) ...`
### `STOP: cannot record /ship run <id> on this checkout's lease (...)` | ### `STOP: cannot record /ship run <id> on this checkout's lease (...)`
### `gstack-wtree: cannot create a temp index under <dir>; set TMPDIR to a writable directory` / `gstack-review-log: cannot create a private object directory under <dir>; no working-tree fingerprint. Set TMPDIR to a writable directory.` | ### `gstack-wtree: cannot create a temp index under <dir>; set TMPDIR to a writable directory` / `gstack-review-log: cannot create a private object directory under <dir>; no working-tree fingerprint. Set TMPDIR to a writable directory.`
### `gstack-wtree: cannot stage the working tree: <git error>` | ### `gstack-wtree: cannot stage the working tree: <git error>`
### `Plan completion audit: not run (no plan is bound to this branch and no docs/designs/ file matches). Fix: ...` | ### `Plan completion audit: not run (no plan is bound to this branch and no docs/designs/ file matches). Fix: ...`
### `PERSISTED: no` / `PERSIST: gstack-review-log '{...}'` / `no saved Eng Review: run the PERSIST: line ...` | ### `PERSISTED: no` / `PERSIST: gstack-review-log '{...}'` / `no saved Eng Review: run the PERSIST: line ...`
### `gstack-learnings-search: bun not found on PATH, so learnings could not be read. Fix: ...` | ### `gstack-learnings-search: bun not found on PATH, so learnings could not be read. Fix: ...`
### `LEARNINGS: unavailable (<first stderr line>)` | ### `LEARNINGS: unavailable (<first stderr line>)`
### `gstack-learnings-log: could not create a temp file in <dir>, so the learning was not recorded. Fix: ...` | ### `gstack-learnings-log: could not create a temp file in <dir>, so the learning was not recorded. Fix: ...`
### `CALIBRATION: not calibrated: no recorded signals` | ### `CALIBRATION: not calibrated: no recorded signals`
### `ARTIFACTS_SYNC: attention: case-collision held=<N> names=<names>. Artifact paths differ only by letter case, ...` | ### `ARTIFACTS_SYNC: attention: case-collision held=<N> names=<names>. Artifact paths differ only by letter case, ...`
### `gstack: earlier data for this project is in projects/<slug> (a worktree's old bucket). Merge it: ...` | ### `gstack: earlier data for this project is in projects/<slug> (a worktree's old bucket). Merge it: ...`
## Design skills | ## 设计技能
### `DESIGN_NOT_AVAILABLE: <path> --version exited <code>` (or `timed out after 10s`, `is not installed`, `no timeout/gtimeout/perl ...`) | ### `DESIGN_NOT_AVAILABLE: <path> --version exited <code>` (or `timed out after 10s`, `is not installed`, `no timeout/gtimeout/perl ...`)
### `GSTACK_DESIGN_IMAGE_MODEL="<value>" is not a gpt-image model name ...` (or `... is not a Gemini model name, and the design provider is gemini`) | ### `GSTACK_DESIGN_IMAGE_MODEL="<value>" is not a gpt-image model name ...` (or `... is not a Gemini model name, and the design provider is gemini`)
### `No image API key found (OpenAI or Gemini).` | ### `No image API key found (OpenAI or Gemini).`
### `GSTACK_DESIGN_PROVIDER="<value>" is not a design provider (expected openai or gemini).` | ### `GSTACK_DESIGN_PROVIDER="<value>" is not a design provider (expected openai or gemini).`
### `GSTACK_DESIGN_PROVIDER=<provider> but no <Provider> key was found` | ### `GSTACK_DESIGN_PROVIDER=<provider> but no <Provider> key was found`
### `Gemini API error (400/403, model <model>, key from <source>): ...` | ### `Gemini API error (400/403, model <model>, key from <source>): ...`
### `Gemini API error (429 ...): ... no image quota left today` | ### `Gemini API error (429 ...): ... no image quota left today`
### `TASTE_PROFILE_UNAVAILABLE: could not resolve the project slug (gstack-slug failed). Fix: run ./setup.` | ### `TASTE_PROFILE_UNAVAILABLE: could not resolve the project slug (gstack-slug failed). Fix: run ./setup.`
### `cannot save paid image to <path>: <code> (<cause>). Image bytes were received; saved a recovery copy to <tmp path>. Fix: ...` | ### `cannot save paid image to <path>: <code> (<cause>). Image bytes were received; saved a recovery copy to <tmp path>. Fix: ...`
## Codex and other env-var hosts | ## Codex 与其他环境变量宿主
### `gstack: no install found (tried <path>). Fix: ./setup --host <host> from your gstack checkout; ./setup --status shows it.` | ### `gstack: no install found (tried <path>). Fix: ./setup --host <host> from your gstack checkout; ./setup --status shows it.`
### `router is a symlink, which Codex skips` / `section links: N of M broken (first: ...)` | ### `router is a symlink, which Codex skips` / `section links: N of M broken (first: ...)`
### `saved your edited <path> to <backup> (setup rewrites gstack's SKILL.md copies on every run)` | ### `saved your edited <path> to <backup> (setup rewrites gstack's SKILL.md copies on every run)`
### `error: could not back up an edited SKILL.md copy under <root>; the previous runtime root is unchanged` | ### `error: could not back up an edited SKILL.md copy under <root>; the previous runtime root is unchanged`
### `ERROR: <dir> is not a gstack checkout; nothing was changed. Re-run Step 2.` / `INSTALL_DIR is not set: re-run Step 2 ...` | ### `ERROR: <dir> is not a gstack checkout; nothing was changed. Re-run Step 2.` / `INSTALL_DIR is not set: re-run Step 2 ...`
### `<host>/<skill>/SKILL.md is <bytes> bytes, over the 160,000-byte limit. Fix: carve sections with usesLazySections() for this skill.` | ### `<host>/<skill>/SKILL.md is <bytes> bytes, over the 160,000-byte limit. Fix: carve sections with usesLazySections() for this skill.`
## Setup and auto-update | ## 安装与自动更新
### `gstack needs Bun 1.3.3 or newer (1.4.2 recommended); found <version> at <path>. Nothing was installed or changed.` | ### `gstack needs Bun 1.3.3 or newer (1.4.2 recommended); found <version> at <path>. Nothing was installed or changed.`
### `gstack auto-update: update held (bun-too-old: found Bun <version> at <path>; gstack <version> needs <floor> or newer); nothing was installed or changed. Fix now: ...` | ### `gstack auto-update: update held (bun-too-old: found Bun <version> at <path>; gstack <version> needs <floor> or newer); nothing was installed or changed. Fix now: ...`
### `bun-version-unreadable: could not read the version of Bun at <path> (bun --version printed '<output>'); gstack <version> needs <floor> or newer (BUN_VERSION_UNREADABLE)` | ### `bun-version-unreadable: could not read the version of Bun at <path> (bun --version printed '<output>'); gstack <version> needs <floor> or newer (BUN_VERSION_UNREADABLE)`
### `gstack auto-update: setup did not finish (<reason>); installed skills may be out of date. gstack retries automatically. Fix now: cd <dir> && ./setup` | ### `gstack auto-update: setup did not finish (<reason>); installed skills may be out of date. gstack retries automatically. Fix now: cd <dir> && ./setup`
### `gstack auto-update: git pull did not finish (exit N: ...); gstack is not updating. Fix now: ...` | ### `gstack auto-update: git pull did not finish (exit N: ...); gstack is not updating. Fix now: ...`
### `gstack setup: refusing to register hooks that do not parse (Claude Code would block tool calls with them): <file>:<line>: <error>` | ### `gstack setup: refusing to register hooks that do not parse (Claude Code would block tool calls with them): <file>:<line>: <error>`
### `gstack auto-update: update held (hook-does-not-parse: <file>:<line>: <error>); nothing was installed or changed, and your current hooks keep running. ...` | ### `gstack auto-update: update held (hook-does-not-parse: <file>:<line>: <error>); nothing was installed or changed, and your current hooks keep running. ...`
### `gstack auto-update: update held (hook-check-unavailable: <reason>); nothing was installed or changed, and your current hooks keep running. ... Fix now (in a terminal; Git Bash on Windows): cd '<dir>' && git fetch origin && bash bin/gstack-ff-update . '@{upstream}' && ./setup ...` | ### `gstack auto-update: update held (hook-check-unavailable: <reason>); nothing was installed or changed, and your current hooks keep running. ... Fix now (in a terminal; Git Bash on Windows): cd '<dir>' && git fetch origin && bash bin/gstack-ff-update . '@{upstream}' && ./setup ...`
### `HELD hook-check-unavailable: git archive of the incoming revision failed` / `gstack auto-update: update held (hook-check-unavailable: git archive of the incoming revision failed) ...` / `gstack auto-update: setup did not finish (bun not found on PATH) ...` on Windows | ### `HELD hook-check-unavailable: git archive of the incoming revision failed` / `gstack auto-update: update held (hook-check-unavailable: git archive of the incoming revision failed) ...` / `gstack auto-update: setup did not finish (bun not found on PATH) ...`（Windows）
### `gstack auto-update: update held (unmerged-files: <n> unmerged file(s) in the install (first: <path>)); an earlier merge, rebase or stash pop left conflicts in the install, and an update would bury them. Fix now (...): cd '<dir>' && git fetch origin && bash bin/gstack-ff-update . '@{upstream}' && ./setup ...` | ### `gstack auto-update: update held (unmerged-files: <n> unmerged file(s) in the install (first: <path>)); an earlier merge, rebase or stash pop left conflicts in the install, and an update would bury them. Fix now (...): cd '<dir>' && git fetch origin && bash bin/gstack-ff-update . '@{upstream}' && ./setup ...`
### `gstack auto-update: update held (tracked-by-project: ...)` / `(version-reverted: ...)` / `gstack-upgrade: tracked-by-project: ... (UPGRADE_REFUSED)` / `gstack-upgrade: version-reverted: ... (UPGRADE_REFUSED)` | ### `gstack auto-update: update held (tracked-by-project: ...)` / `(version-reverted: ...)` / `gstack-upgrade: tracked-by-project: ... (UPGRADE_REFUSED)` / `gstack-upgrade: version-reverted: ... (UPGRADE_REFUSED)`
### `gstack auto-update: update held (autostash-unrecoverable: <reason>); your local edits are where they were and nothing was installed. Look first: git -C '<dir>' status --short. Fix now (...)` / `autostash-unrecoverable: <reason>` | ### `gstack auto-update: update held (autostash-unrecoverable: <reason>); your local edits are where they were and nothing was installed. Look first: git -C '<dir>' status --short. Fix now (...)` / `autostash-unrecoverable: <reason>`
### `gstack auto-update: your local edits in the install (<files>) conflicted with an update, so they were saved in refs/gstack/rescue/<oid> and the install runs the update. ...` / `rescued <old> <new> refs/gstack/rescue/<oid> unmerged=<0/1>` | ### `gstack auto-update: your local edits in the install (<files>) conflicted with an update, so they were saved in refs/gstack/rescue/<oid> and the install runs the update. ...` / `rescued <old> <new> refs/gstack/rescue/<oid> unmerged=<0/1>`
### `gstack setup: refusing to replace <root> for <host>: this runtime directory contains the source checkout setup runs from (<checkout>), so replacing it would delete the checkout. Nothing was changed.` | ### `gstack setup: refusing to replace <root> for <host>: this runtime directory contains the source checkout setup runs from (<checkout>), so replacing it would delete the checkout. Nothing was changed.`
### `pruned <dir> (<host> is not installed from this checkout): ...` / `kept <path>: not proven generated (...)` / `host-render backup: <dir> (...)` | ### `pruned <dir> (<host> is not installed from this checkout): ...` / `kept <path>: not proven generated (...)` / `host-render backup: <dir> (...)`
### `CSO unavailable: its native helper was not built (windows-msvc-compile)` | ### `CSO unavailable: its native helper was not built (windows-msvc-compile)`
### `CSO unavailable: the native helper's <stage> step failed (...)` / `CSO publish step failed (...) for <revision>; previous CSO kept: <revision>` | ### `CSO unavailable: the native helper's <stage> step failed (...)` / `CSO publish step failed (...) for <revision>; previous CSO kept: <revision>`
### `Docker found at <path>, but native Windows Docker transport is not supported yet; static assessment only.` / `docker.exe at <path> is outside the trusted install locations (...)` | ### `Docker found at <path>, but native Windows Docker transport is not supported yet; static assessment only.` / `docker.exe at <path> is outside the trusted install locations (...)`
### `Snapshot manifest cap exceeded: ...` / `64 MiB source cap exceeded: ...` / `Symlink or special source file: <path>` | ### `Snapshot manifest cap exceeded: ...` / `64 MiB source cap exceeded: ...` / `Symlink or special source file: <path>`
### `INVALID_OUTPUT: Scanner report is malformed, unsupported, or exceeds structural limits.` (Semgrep on a real repository) | ### `INVALID_OUTPUT: Scanner report is malformed, unsupported, or exceeds structural limits.`（真实仓库上的 Semgrep）
### `unsupported argv0 "docker-tools"` (OrbStack's `docker` under /cso) | ### `unsupported argv0 "docker-tools"`（/cso 之下的 OrbStack `docker`）
### `removed the AskUserQuestion preference hook: it breaks Conductor's native AskUserQuestion (#2207). ...` | ### `removed the AskUserQuestion preference hook: it breaks Conductor's native AskUserQuestion (#2207). ...`
### `Error: browse_extension_id '<v>' is not a Chrome extension ID ... Existing value left unchanged.` | ### `Error: browse_extension_id '<v>' is not a Chrome extension ID ... Existing value left unchanged.`
## Install check (`gstack-doctor --check`) and the Capy installer | ## 安装检查（`gstack-doctor --check`）与 Capy 安装器
### `FAIL <id> — <detail>; fix: <command> (COMPONENT_MISSING; ...)` | ### `FAIL <id> — <detail>; fix: <command> (COMPONENT_MISSING; ...)`
### `FAIL runtime — bun <version> ... (RUNTIME_BELOW_MINIMUM; ...)` | ### `FAIL runtime — bun <version> ... (RUNTIME_BELOW_MINIMUM; ...)`
### `FAIL pins — bun <version> outside engines.bun >=1.4.2 (package.json:<line>; ...) (PROJECT_PIN_MISMATCH; ...)` | ### `FAIL pins — bun <version> outside engines.bun >=1.4.2 (package.json:<line>; ...) (PROJECT_PIN_MISMATCH; ...)`
### `FAIL revision — installed <version> (requested <ref>) (REVISION_UNMET; ...)` | ### `FAIL revision — installed <version> (requested <ref>) (REVISION_UNMET; ...)`
### `gstack-capy-install: Bun conflict: gstack needs >=<minimum>, <project> pins <constraint> (RUNTIME_PIN_CONFLICT; ...)` | ### `gstack-capy-install: Bun conflict: gstack needs >=<minimum>, <project> pins <constraint> (RUNTIME_PIN_CONFLICT; ...)`
### `gstack-browser-ensure: NEEDS_SETUP ... (BROWSER_UNAVAILABLE; ...)` | ### `gstack-browser-ensure: NEEDS_SETUP ... (BROWSER_UNAVAILABLE; ...)`
### `gstack-capy-install: preflight: <tool> not found (INSTALL_PREFLIGHT_FAILED; ...)` | ### `gstack-capy-install: preflight: <tool> not found (INSTALL_PREFLIGHT_FAILED; ...)`
### `gstack: fail launch-file — could not write the launch file <path>; fix: ... (LAUNCH_FILE_UNWRITABLE)` | ### `gstack: fail launch-file — could not write the launch file <path>; fix: ... (LAUNCH_FILE_UNWRITABLE)`
### `WARN floor — installed <v> is below the floor <f> that <project>/.gstack/ship-policy.json declares (min_gstack_version); fix: ... (PROJECT_FLOOR_UNMET)` / trailer note `floor=<f> (<file>)` | ### `WARN floor — installed <v> is below the floor <f> that <project>/.gstack/ship-policy.json declares (min_gstack_version); fix: ... (PROJECT_FLOOR_UNMET)` / trailer note `floor=<f> (<file>)`
### `WARN pins — node <v> outside <pin> (<file>); node read from <path> (node pin only; bun pins pass); fix: ... (PROJECT_NODE_PIN_UNMET)` | ### `WARN pins — node <v> outside <pin> (<file>); node read from <path> (node pin only; bun pins pass); fix: ... (PROJECT_NODE_PIN_UNMET)`
### `WARN behind — installed <v> is <n> commits behind origin (latest <ver>) and the session-start upgrade was skipped: <reason>; fix: <command> (UPGRADE_SKIPPED/UPGRADE_BUSY/UPGRADE_REFUSED)` / trailer note `behind=<n> (latest: <ver>); upgrade skipped: <reason> (<CODE>); fix: <command>` | ### `WARN behind — installed <v> is <n> commits behind origin (latest <ver>) and the session-start upgrade was skipped: <reason>; fix: <command> (UPGRADE_SKIPPED/UPGRADE_BUSY/UPGRADE_REFUSED)` / trailer note `behind=<n> (latest: <ver>); upgrade skipped: <reason> (<CODE>); fix: <command>`
### `gstack-upgrade: <cause>; nothing was changed; fix: <command> (UPGRADE_REFUSED)` | ### `gstack-upgrade: <cause>; nothing was changed; fix: <command> (UPGRADE_REFUSED)`
### `gstack-upgrade: live gstack sessions hold this installation: pid <p> (<age>m), ...; nothing was changed; fix: ... (UPGRADE_BUSY)` / `gstack-upgrade: a shared harness (capy-server, pid <p>) holds a lease <n>m old; ... (UPGRADE_BUSY)` | ### `gstack-upgrade: live gstack sessions hold this installation: pid <p> (<age>m), ...; nothing was changed; fix: ... (UPGRADE_BUSY)` / `gstack-upgrade: a shared harness (capy-server, pid <p>) holds a lease <n>m old; ... (UPGRADE_BUSY)`
### `gstack-upgrade: could not reach origin (...) (UPGRADE_FETCH_FAILED)` | ### `gstack-upgrade: could not reach origin (...) (UPGRADE_FETCH_FAILED)`
### `gstack: fail revision — installed <v> is below the supported minimum <m> (<cause>); fix: ... (REVISION_BELOW_MINIMUM)` | ### `gstack: fail revision — installed <v> is below the supported minimum <m> (<cause>); fix: ... (REVISION_BELOW_MINIMUM)`
### `FAIL wrapper — ... (CAPY_WRAPPER_STALE)` / `WARN wrapper — ...; owner action: ...` / `gstack-capy-skill: owner action — Drive copy is wrapper <n>, minimum <m>; ...` | ### `FAIL wrapper — ... (CAPY_WRAPPER_STALE)` / `WARN wrapper — ...; owner action: ...` / `gstack-capy-skill: owner action — Drive copy is wrapper <n>, minimum <m>; ...`
### `FAIL runtime — bun resolution drifted: recorded bun <v> at <path> (<rule>), now <current>; changed: <what>; fix: ... (BUN_RESOLUTION_DRIFT)` | ### `FAIL runtime — bun resolution drifted: recorded bun <v> at <path> (<rule>), now <current>; changed: <what>; fix: ... (BUN_RESOLUTION_DRIFT)`
### `gstack-capy-install: GSTACK_BUN_INSTALL_VERSION=<v> is not a verified Bun at or above gstack's supported minimum ...; fix: ... (BUN_INSTALL_VERSION_INVALID)` | ### `gstack-capy-install: GSTACK_BUN_INSTALL_VERSION=<v> is not a verified Bun at or above gstack's supported minimum ...; fix: ... (BUN_INSTALL_VERSION_INVALID)`
### `INSTALL: fail verdict — <detail>; fix: ... (INSTALL_UNVERIFIED)` | ### `INSTALL: fail verdict — <detail>; fix: ... (INSTALL_UNVERIFIED)`
## Capy: approvals, Captain briefs and PR screenshots | ## Capy：审批、Captain 简报与 PR 截图
### `gstack-approvals: ... (APPROVAL_RECORD_INVALID)` | ### `gstack-approvals: ... (APPROVAL_RECORD_INVALID)`
### `gstack-approvals: ... (APPROVAL_RECORD_SECRET)` | ### `gstack-approvals: ... (APPROVAL_RECORD_SECRET)`
### `gstack-approvals: ... (APPROVAL_RECORD_NO_BRANCH)` | ### `gstack-approvals: ... (APPROVAL_RECORD_NO_BRANCH)`
### `gstack-approvals: ... (APPROVAL_RECORD_UNAVAILABLE)` | ### `gstack-approvals: ... (APPROVAL_RECORD_UNAVAILABLE)`
### `gstack-approvals: ... (APPROVAL_RECORD_WRITE_FAILED)` | ### `gstack-approvals: ... (APPROVAL_RECORD_WRITE_FAILED)`
### `gstack-approvals import: ... (APPROVAL_IMPORT_UNANSWERED)` | ### `gstack-approvals import: ... (APPROVAL_IMPORT_UNANSWERED)`
### `gstack-owner-brief render --captain: ... (CAPTAIN_BRIEF_INCOMPLETE)` | ### `gstack-owner-brief render --captain: ... (CAPTAIN_BRIEF_INCOMPLETE)`
### `gstack-pr-shots: ... (PR_SHOTS_INPUT_NOT_FOUND)` | ### `gstack-pr-shots: ... (PR_SHOTS_INPUT_NOT_FOUND)`
### `gstack-pr-shots: ... (PR_SHOTS_INPUT_REFUSED)` | ### `gstack-pr-shots: ... (PR_SHOTS_INPUT_REFUSED)`
### `gstack-pr-shots: ... (PR_SHOTS_IDENTICAL)` | ### `gstack-pr-shots: ... (PR_SHOTS_IDENTICAL)`
### `gstack-pr-shots: ... (PR_SHOTS_RENDER_FAILED)` | ### `gstack-pr-shots: ... (PR_SHOTS_RENDER_FAILED)`
## /ship token budget and fresh-context handoffs (gstack-ship-budget) | ## /ship 的 token 预算与全新上下文交接（gstack-ship-budget）
### `gstack-ship-budget: ... (BUDGET_CAP_REACHED)` | ### `gstack-ship-budget: ... (BUDGET_CAP_REACHED)`
### `gstack-ship-budget: ... (BUDGET_READING_MISSING)` | ### `gstack-ship-budget: ... (BUDGET_READING_MISSING)`
### `gstack-ship-budget: ... (METER_SCOPE_PARENT)` | ### `gstack-ship-budget: ... (METER_SCOPE_PARENT)`
### `gstack-ship-budget: ... (BUDGET_READING_REJECTED)` | ### `gstack-ship-budget: ... (BUDGET_READING_REJECTED)`
### `gstack-ship-budget: ... (BUDGET_METER_UNAVAILABLE)` | ### `gstack-ship-budget: ... (BUDGET_METER_UNAVAILABLE)`
### `gstack-ship-budget: ... (BUDGET_LEDGER_INVALID)` | ### `gstack-ship-budget: ... (BUDGET_LEDGER_INVALID)`
### `gstack-review-log: ... (BUDGET_CHECK_SKIPPED)` / `gstack-ship-budget: ... role=<r> step=<s> started=<t> spend=unknown (BUDGET_CHECK_SKIPPED)` | ### `gstack-review-log: ... (BUDGET_CHECK_SKIPPED)` / `gstack-ship-budget: ... role=<r> step=<s> started=<t> spend=unknown (BUDGET_CHECK_SKIPPED)`
### `gstack-ship-budget: ... (HANDOFF_PIN_MOVED)` | ### `gstack-ship-budget: ... (HANDOFF_PIN_MOVED)`
## Browser | ## 浏览器
### `[browse] this install's browse CLI (<root>, build <hash>) and the gstack checkout's server bundle (<checkout>, build <hash>) are from different builds, so the server was not started. ...` | ### `[browse] this install's browse CLI (<root>, build <hash>) and the gstack checkout's server bundle (<checkout>, build <hash>) are from different builds, so the server was not started. ...`
### `[browse] chain: no flow to run (stdin was empty)` (or `stdin is a terminal`, `stdin could not be read (EAGAIN)`) | ### `[browse] chain: no flow to run (stdin was empty)` (or `stdin is a terminal`, `stdin could not be read (EAGAIN)`)
### `Chromium at GSTACK_CHROMIUM_PATH=<path> failed to launch: ...` | ### `Chromium at GSTACK_CHROMIUM_PATH=<path> failed to launch: ...`
### `Headed Chromium profile <dir> is in use by Chromium PID <pid> (started by PID <ppid>: <name>). ...` | ### `Headed Chromium profile <dir> is in use by Chromium PID <pid> (started by PID <ppid>: <name>). ...`
### `[browse] Headed browse now keeps a profile per project ...` | ### `[browse] Headed browse now keeps a profile per project ...`
### `Blocked: <host> is a cloud metadata or link-local address` / `... resolves to a cloud metadata or link-local address` | ### `Blocked: <host> is a cloud metadata or link-local address` / `... resolves to a cloud metadata or link-local address`
### `forbidden origin` from the sidebar terminal | ### `forbidden origin`（来自侧边栏终端）
### `hint: "<word>" looks like a CSS selector` | ### `hint: "<word>" looks like a CSS selector`
### `server-node.mjs not found. Run bun run build` (Windows) | ### `server-node.mjs not found. Run bun run build`（Windows）
### `[freeze] Hook helpers out of date (partial upgrade?)` | ### `[freeze] Hook helpers out of date (partial upgrade?)`
### `[browse] Could not record the Chromium PID (CDP SystemInfo.getProcessInfo: <error>); browse stop cannot reap a surviving Chromium.` | ### `[browse] Could not record the Chromium PID (CDP SystemInfo.getProcessInfo: <error>); browse stop cannot reap a surviving Chromium.`
### `No active page. Use "browse goto <url>" first.` (after the last tab was closed outside browse) | ### `No active page. Use "browse goto <url>" first.`（最后一个标签页在 browse 之外被关闭后）
### ``browse: every tab was closed outside browse and a new one could not be opened, because the browser or its context is gone (<cause>); fix: run `browse restart` ... (BROWSE_TAB_UNRECOVERABLE)`` | ### ``browse: every tab was closed outside browse and a new one could not be opened, because the browser or its context is gone (<cause>); fix: run `browse restart` ... (BROWSE_TAB_UNRECOVERABLE)``
### ``browse: the session name is not 1-64 letters, digits, dots, colons, underscores or dashes ("<name>"); fix: pick a name like agent-1 ... (BROWSE_SESSION_INVALID)`` | ### ``browse: the session name is not 1-64 letters, digits, dots, colons, underscores or dashes ("<name>"); fix: pick a name like agent-1 ... (BROWSE_SESSION_INVALID)``
### ``browse: only the local root token may name a session ... (BROWSE_SESSION_ROOT_ONLY)`` | ### ``browse: only the local root token may name a session ... (BROWSE_SESSION_ROOT_ONLY)``
### ``browse: this session's tab was closed ... (session <name>'s tab <id> was closed; it was on <url>); fix: open the page again ... (BROWSE_SESSION_TAB_RESET)`` | ### ``browse: this session's tab was closed ... (session <name>'s tab <id> was closed; it was on <url>); fix: open the page again ... (BROWSE_SESSION_TAB_RESET)``
### ``browse: every session slot is running a command ... (BROWSE_SESSION_LIMIT)`` | ### ``browse: every session slot is running a command ... (BROWSE_SESSION_LIMIT)``
### ``browse: no Playwright device has that name, so nothing on the tab changed ("<name>"; nearest: ...); fix: $B device --list (BROWSE_DEVICE_UNKNOWN)`` | ### ``browse: no Playwright device has that name, so nothing on the tab changed ("<name>"; nearest: ...); fix: $B device --list (BROWSE_DEVICE_UNKNOWN)``
### ``browse: Chromium refused a device emulation call on this tab (<method>: <error>; the tab is partly emulated); fix: $B device off (BROWSE_DEVICE_CDP_FAILED)`` | ### ``browse: Chromium refused a device emulation call on this tab (<method>: <error>; the tab is partly emulated); fix: $B device off (BROWSE_DEVICE_CDP_FAILED)``
### ``browse: touch input needs a phone profile on this tab first ($B tap on this tab); fix: $B device "iPhone 15" (BROWSE_TOUCH_NO_DEVICE)`` | ### ``browse: touch input needs a phone profile on this tab first ($B tap on this tab); fix: $B device "iPhone 15" (BROWSE_TOUCH_NO_DEVICE)``
## Windows | ## Windows
### `Windows blocked compiled gstack binaries at launch (Smart App Control or another application-control policy, #2595)` / `bash: .../browse.exe: Permission denied` | ### `Windows blocked compiled gstack binaries at launch (Smart App Control or another application-control policy, #2595)` / `bash: .../browse.exe: Permission denied`
### `setup: -c: line 1: unexpected EOF while looking for matching '"'` / `setup: -c: line 2: syntax error: unexpected end of file` from `.\setup.ps1` | ### `setup: -c: line 1: unexpected EOF while looking for matching '"'` / `setup: -c: line 2: syntax error: unexpected end of file`（来自 `.\setup.ps1`）
### `setup.ps1: argument N is empty; setup takes no empty arguments. Nothing was installed or changed. (SETUP_PS1_EMPTY_ARGUMENT; ...)` | ### `setup.ps1: argument N is empty; setup takes no empty arguments. Nothing was installed or changed. (SETUP_PS1_EMPTY_ARGUMENT; ...)`
### `gstack: WARN kept the full dependency install (SETUP_DEPS_MIGRATE_FAILED; ...): <cause>` | ### `gstack: WARN kept the full dependency install (SETUP_DEPS_MIGRATE_FAILED; ...): <cause>`
### `Chromium bootstrap: chromium-install — <bun> x playwright install chromium exited 127 (command not found); install Bun from bun.sh (winget Bun ships no bunx), or skip with ./setup --no-browser (Git Bash) or .\setup.ps1 --no-browser (PowerShell)` | ### `Chromium bootstrap: chromium-install — <bun> x playwright install chromium exited 127 (command not found); install Bun from bun.sh (winget Bun ships no bunx), or skip with ./setup --no-browser (Git Bash) or .\setup.ps1 --no-browser (PowerShell)`
### `gstack: no Git Bash found to run gstack's bash scripts on Windows (tried ...); fix: ... (BASH_UNAVAILABLE)` | ### `gstack: no Git Bash found to run gstack's bash scripts on Windows (tried ...); fix: ... (BASH_UNAVAILABLE)`
### `GATE_ERROR=no_base` | ### `GATE_ERROR=no_base`
## Memory and gbrain | ## 记忆与 gbrain
### `database host unreachable (<code> <host>); your gbrain config is unchanged. Fix: check network or VPN, then re-run /sync-gbrain.` | ### `database host unreachable (<code> <host>); your gbrain config is unchanged. Fix: check network or VPN, then re-run /sync-gbrain.`
### `[memory-ingest] ERR: gbrain reported N failure(s) it did not attribute to a staged page ... Refusing to advance state.` | ### `[memory-ingest] ERR: gbrain reported N failure(s) it did not attribute to a staged page ... Refusing to advance state.`
### `[memory-ingest] reconcile: not run (...)` | ### `[memory-ingest] reconcile: not run (...)`
### `[memory-ingest] ERR: another memory ingest (pid <N>) is writing <state file>; not run.` | ### `[memory-ingest] ERR: another memory ingest (pid <N>) is writing <state file>; not run.`
### `[memory-ingest] ERR: could not save ingest state <path>: <error>.` | ### `[memory-ingest] ERR: could not save ingest state <path>: <error>.`
### `[memory-ingest] kept N transcript page(s) for <repo> on this machine: gbrain source <id> ...` | ### `[memory-ingest] kept N transcript page(s) for <repo> on this machine: gbrain source <id> ...`
### `curated artifacts pushed to git, but gbrain source <id> has 0 indexed pages. Fix: gbrain sync --source <id>, then re-run /sync-gbrain` | ### `curated artifacts pushed to git, but gbrain source <id> has 0 indexed pages. Fix: gbrain sync --source <id>, then re-run /sync-gbrain`
### `dream: skipped — the installed gbrain cannot run only the resolve_symbol_edges phase, and the full dream cycle costs about 35 minutes ...` | ### `dream: skipped — the installed gbrain cannot run only the resolve_symbol_edges phase, and the full dream cycle costs about 35 minutes ...`
### `call graph for <source>: unknown: installed gbrain does not expose cycle_freshness` | ### `call graph for <source>: unknown: installed gbrain does not expose cycle_freshness`
### `[gbrain-sync] gbrain source <id>: path unavailable (<path>); gstack skips it.` | ### `[gbrain-sync] gbrain source <id>: path unavailable (<path>); gstack skips it.`
## Eval reports and pass-rates | ## 评测报告与通过率
### `eval:pass-rates: unknown flag <flag>` / `eval:pass-rates: unknown case <id> (not an E2E, judge or paid test file id)` | ### `eval:pass-rates: unknown flag <flag>` / `eval:pass-rates: unknown case <id> (not an E2E, judge or paid test file id)`
### `unknown failure_cause "<x>" (written by a newer gstack; update this checkout to read it)` | ### `unknown failure_cause "<x>" (written by a newer gstack; update this checkout to read it)`
### `--case <id>: registered by <file>, <file>; it needs exactly one` | ### `--case <id>: registered by <file>, <file>; it needs exactly one`
### `evidence: <artifact> too large to fetch (<N> MB)` | ### `evidence: <artifact> too large to fetch (<N> MB)`
### `[headroom] <case> session <key>: max <s> of <s> (<pct>) over <n> sample(s), above the 85% cap. Cut work in the skill or fixture; budgets are never raised ...` | ### `[headroom] <case> session <key>: max <s> of <s> (<pct>) over <n> sample(s), above the 85% cap. Cut work in the skill or fixture; budgets are never raised ...`
### `cost unknown (no billing captured for any of <N> trial(s))` / `cost $<x> known + <N> of <M> trial(s) cost unknown` | ### `cost unknown (no billing captured for any of <N> trial(s))` / `cost $<x> known + <N> of <M> trial(s) cost unknown`
### `· cause provider_stall: no stream event for <N>s ...` | ### `· cause provider_stall: no stream event for <N>s ...`
### Overlay record with `taskCorrect: false` and `answerError` (contract v4) | ### 带有 `taskCorrect: false` 与 `answerError` 的覆盖记录（契约 v4）
### `[detector-corpora] <N> stale entries (refresh from a current census when one fails)` | ### `[detector-corpora] <N> stale entries (refresh from a current census when one fails)`
### `recommendation substance median <x> < 4 over samples [<a>,<b>,<c>] (boilerplate/weak)` | ### `recommendation substance median <x> < 4 over samples [<a>,<b>,<c>] (boilerplate/weak)`
## Push guard (redaction) | ## 推送守卫（脱敏）
### `db.url_with_password` HIGH on a default `postgres`/`postgres` login whose host is a service name like `@db` (pre-push BLOCKED) | ### `db.url_with_password` HIGH on a default `postgres`/`postgres` login whose host is a service name like `@db` (pre-push BLOCKED)
### `.gstack-redact-allowlist (<n> entries) suppressed <m> finding(s) in this push` | ### `.gstack-redact-allowlist (<n> entries) suppressed <m> finding(s) in this push`
### `pii.ip_public` MEDIUM on a four-part version number | ### `pii.ip_public` MEDIUM on a four-part version number
### `pii.phone.e164` MEDIUM on a receipt token or a GitHub Actions run id | ### `pii.phone.e164` MEDIUM on a receipt token or a GitHub Actions run id
### `gstack-post pr-body` kept sections the body file did not contain | ### `gstack-post pr-body` kept sections the body file did not contain
### `MEDIUM  pii.email  <file>:<line>` from the pre-push hook | ### `MEDIUM  pii.email  <file>:<line>`（来自 pre-push hook）
## Unattended runs and artifacts | ## 无人值守运行与产物
### `ARTIFACT_INVALID_JSON` | ### `ARTIFACT_INVALID_JSON`
### `ARTIFACT_UNSUPPORTED_VERSION` | ### `ARTIFACT_UNSUPPORTED_VERSION`
### `ARTIFACT_SCHEMA` | ### `ARTIFACT_SCHEMA`
### `ARTIFACT_MISSING` | ### `ARTIFACT_MISSING`
### `ARTIFACT_STALE` | ### `ARTIFACT_STALE`
### `ARTIFACT_PATH_ESCAPE` | ### `ARTIFACT_PATH_ESCAPE`
### `ARTIFACT_MALFORMED_JSONL` | ### `ARTIFACT_MALFORMED_JSONL`
### `ARTIFACT_DUPLICATE_ID` | ### `ARTIFACT_DUPLICATE_ID`
### `ARTIFACT_UNBOUND_ID` | ### `ARTIFACT_UNBOUND_ID`
### `ARTIFACT_DANGLING_REF` | ### `ARTIFACT_DANGLING_REF`
### `ARTIFACT_DEPENDENCY_CYCLE` | ### `ARTIFACT_DEPENDENCY_CYCLE`
### `ARTIFACT_COUNT_MISMATCH` | ### `ARTIFACT_COUNT_MISMATCH`
### `ARTIFACT_RUN_INTERRUPTED` | ### `ARTIFACT_RUN_INTERRUPTED`
### `ARTIFACT_REVIEWER_MISSING` | ### `ARTIFACT_REVIEWER_MISSING`
### `ARTIFACT_GUARD_LINE_MISSING` | ### `ARTIFACT_GUARD_LINE_MISSING`
### `autoplan guard: not enforced by this host; publication order is unverified (GUARD_NOT_INSTALLED)` | ### `autoplan guard: not enforced by this host; publication order is unverified (GUARD_NOT_INSTALLED)`
### `review-log: status mismatch ... (REVIEW_STATUS_MISMATCH)` | ### `review-log: status mismatch ... (REVIEW_STATUS_MISMATCH)`
### `GATE_REV_STALE` | ### `GATE_REV_STALE`
### `GATE_REPLY_UNPARSED` | ### `GATE_REPLY_UNPARSED`
### `ANSWER_BY_REQUIRED` | ### `ANSWER_BY_REQUIRED`
## Queue-aware ship: policy, restamp, tree receipt, ship receipt | ## 队列感知发布：策略、重打戳、树回执、ship 回执
### `ROUTE_BOUNDED_REFUSED: <path> <reason> (fix: …)` | ### `ROUTE_BOUNDED_REFUSED: <path> <reason> (fix: …)`
### `policy source unavailable — fix: git fetch origin <base> --depth=1 (POLICY_SOURCE_UNAVAILABLE)` | ### `policy source unavailable — fix: git fetch origin <base> --depth=1 (POLICY_SOURCE_UNAVAILABLE)`
### `cannot read <path> at <ref>. <cause> (git version <v>). Fix: see docs/troubleshooting.md#history-read-failed (HISTORY_READ_FAILED)` | ### `cannot read <path> at <ref>. <cause> (git version <v>). Fix: see docs/troubleshooting.md#history-read-failed (HISTORY_READ_FAILED)`
### `POLICY_INVALID` | ### `POLICY_INVALID`
### `POLICY_CONTAINMENT` | ### `POLICY_CONTAINMENT`
### `POLICY_EXISTS` | ### `POLICY_EXISTS`
### `repo commands not executed (pass --allow-repo-commands) (REPO_COMMANDS_NOT_ALLOWED)` | ### `repo commands not executed (pass --allow-repo-commands) (REPO_COMMANDS_NOT_ALLOWED)`
### `QUEUE_STALE` | ### `QUEUE_STALE`
### `RESTAMP_VERSION_SOURCE` | ### `RESTAMP_VERSION_SOURCE`
### `RESTAMP_MERGE_CONFLICT` | ### `RESTAMP_MERGE_CONFLICT`
### `RESTAMP_RELEASE_TOOL_FAILED` | ### `RESTAMP_RELEASE_TOOL_FAILED`
### `RESTAMP_OUTPUT_OUTSIDE_ALLOWED` | ### `RESTAMP_OUTPUT_OUTSIDE_ALLOWED`
### `RESTAMP_CONFLICT` | ### `RESTAMP_CONFLICT`
### `PREDECESSOR MOVED <old> -> <new> — fix: gstack-restamp --after <pr> again (RESTAMP_PREDECESSOR_MOVED)` | ### `PREDECESSOR MOVED <old> -> <new> — fix: gstack-restamp --after <pr> again (RESTAMP_PREDECESSOR_MOVED)`
### `CHANGELOG_DUPLICATE_HEADING` | ### `CHANGELOG_DUPLICATE_HEADING`
### `CHANGELOG_TOP_MISMATCH` | ### `CHANGELOG_TOP_MISMATCH`
### `CHANGELOG_SECTION_MISSING` | ### `CHANGELOG_SECTION_MISSING`
### `gate-reuse: not-eligible (<what changed>) — fix: <rerun command> (GATE_REUSE_NOT_ELIGIBLE)` | ### `gate-reuse: not-eligible (<what changed>) — fix: <rerun command> (GATE_REUSE_NOT_ELIGIBLE)`
### `EVIDENCE_IDENTITY_UNKNOWN` | ### `EVIDENCE_IDENTITY_UNKNOWN`
### `EVIDENCE_BUNDLE_INVALID` | ### `EVIDENCE_BUNDLE_INVALID`
### `PREREGISTRATION_NOT_ANCESTOR` | ### `PREREGISTRATION_NOT_ANCESTOR`
### `HISTORY_POLICY_VIOLATION` | ### `HISTORY_POLICY_VIOLATION`
### `RECEIPT_MISSING` | ### `RECEIPT_MISSING`
### `RECEIPT_INVALID` | ### `RECEIPT_INVALID`
### `REVIEW_DIFF_TOO_LARGE` | ### `REVIEW_DIFF_TOO_LARGE`
### `REVIEW_DIFF_UNREADABLE` | ### `REVIEW_DIFF_UNREADABLE`
### `REVIEW_PLAN_STOPPED` | ### `REVIEW_PLAN_STOPPED`
### `REVIEW_EXCLUDE_REFERENCE` | ### `REVIEW_EXCLUDE_REFERENCE`
### `FETCH_VIOLATION` | ### `FETCH_VIOLATION`
### `FETCH_RERUN_BLOCKED` | ### `FETCH_RERUN_BLOCKED`
### `FETCH_RERUN_SPENT` | ### `FETCH_RERUN_SPENT`
### `EXECUTION_UNKNOWN` | ### `EXECUTION_UNKNOWN`
### `RUN_LOCKED` | ### `RUN_LOCKED`
### `RUN_NOT_INITIALIZED` | ### `RUN_NOT_INITIALIZED`
### `PHASE_NOT_AWAITING` | ### `PHASE_NOT_AWAITING`
### `CEO_ONLY_CONFLICT` | ### `CEO_ONLY_CONFLICT`
### `CEO_ONLY_AFTER_INIT` | ### `CEO_ONLY_AFTER_INIT`
### `CEO_ONLY_NO_GATE` | ### `CEO_ONLY_NO_GATE`
### `SHADOW_BEFORE_ANSWER` | ### `SHADOW_BEFORE_ANSWER`
### `ATTEMPT_MISMATCH` | ### `ATTEMPT_MISMATCH`
### `RESULT_RECEIPT_MISSING` | ### `RESULT_RECEIPT_MISSING`
### `RESULT_FINDINGS_MISSING` | ### `RESULT_FINDINGS_MISSING`
### `MODEL_FAMILY_CONFLICT` | ### `MODEL_FAMILY_CONFLICT`
### `SPEND_CAP_EXCEEDED` | ### `SPEND_CAP_EXCEEDED`
### `CONSENSUS_MISSING` | ### `CONSENSUS_MISSING`
### `OUTSIDE_RUNNER_UNAVAILABLE` | ### `OUTSIDE_RUNNER_UNAVAILABLE`
### `REALITY_ROW_MISSING` | ### `REALITY_ROW_MISSING`
### `REALITY_RECEIPT_MISSING` | ### `REALITY_RECEIPT_MISSING`
### `OFFICE_HOURS_PROBE_REFUSED` | ### `OFFICE_HOURS_PROBE_REFUSED`
### `TASKS_SUPERSEDE_REFUSED` | ### `TASKS_SUPERSEDE_REFUSED`
### `REALITY_RECEIPT_UNRESOLVED` | ### `REALITY_RECEIPT_UNRESOLVED`
## Pre-gate: generated-file registry, gstack-pregate, issue links | ## 预门禁：生成文件注册表、gstack-pregate、issue 链接
### `REGEN_REGISTRY_INVALID` | ### `REGEN_REGISTRY_INVALID`
### `REGEN_CONTAINMENT` | ### `REGEN_CONTAINMENT`
### `REGEN_STALE` | ### `REGEN_STALE`
### `REGEN_COMMAND_FAILED` | ### `REGEN_COMMAND_FAILED`
### `REGEN_DEPS_MISSING` | ### `REGEN_DEPS_MISSING`
### `PREGATE_GSTACK_TOO_OLD` | ### `PREGATE_GSTACK_TOO_OLD`
### `PREGATE_CONFIG_INVALID` | ### `PREGATE_CONFIG_INVALID`
### `PREGATE_SECRETS` | ### `PREGATE_SECRETS`
### `PREGATE_STRAYS` | ### `PREGATE_STRAYS`
### `PREGATE_LITERALS` | ### `PREGATE_LITERALS`
### `PREGATE_NO_LANE` | ### `PREGATE_NO_LANE`
### `PREGATE_HEAD_POLICY_LOOSENS` | ### `PREGATE_HEAD_POLICY_LOOSENS`
### `PREGATE_LANE_FAILED` | ### `PREGATE_LANE_FAILED`
### `PREGATE_INCOMPLETE` | ### `PREGATE_INCOMPLETE`
### `PREGATE_STALLED` | ### `PREGATE_STALLED`
### `PREGATE_RECEIPT_INVALID` | ### `PREGATE_RECEIPT_INVALID`
### `PREGATE_NO_POLICY` | ### `PREGATE_NO_POLICY`
### `PREGATE_ENVIRONMENT` | ### `PREGATE_ENVIRONMENT`
### `PREGATE_STALE` | ### `PREGATE_STALE`
### `PREGATE_REMOTE_UNCLEARED` | ### `PREGATE_REMOTE_UNCLEARED`
### `ISSUE_UNREADABLE` | ### `ISSUE_UNREADABLE`
### `ISSUE_LOOKUP_FAILED` | ### `ISSUE_LOOKUP_FAILED`
### `ISSUE_LINKS_MISSING` | ### `ISSUE_LINKS_MISSING`
## Eval plans, lane ownership, evidence verification, the owner brief | ## 评测计划、车道归属、证据核验与负责人简报
### `PREREG_INCOMPLETE` | ### `PREREG_INCOMPLETE`
### `PREREG_NO_GSTACK_ARM` | ### `PREREG_NO_GSTACK_ARM`
### `EVAL_REPORT_NO_GSTACK_ROW` | ### `EVAL_REPORT_NO_GSTACK_ROW`
### `EVAL_ARM_DUPLICATE` | ### `EVAL_ARM_DUPLICATE`
### `EVAL_PRICE_MISSING` | ### `EVAL_PRICE_MISSING`
### `EVAL_DRY_RUN_FAILED` | ### `EVAL_DRY_RUN_FAILED`
### `EVAL_ARMS_UNRESOLVED` | ### `EVAL_ARMS_UNRESOLVED`
### `EVAL_BUDGET_EXHAUSTED` | ### `EVAL_BUDGET_EXHAUSTED`
### `LANE_CONFLICT` | ### `LANE_CONFLICT`
### `LANE_REF_UNAVAILABLE` | ### `LANE_REF_UNAVAILABLE`
### `EVIDENCE_UNVERIFIED` | ### `EVIDENCE_UNVERIFIED`
### `BANNED_TERM_FOUND` | ### `BANNED_TERM_FOUND`
### `BANNED_TERMS_INVALID` | ### `BANNED_TERMS_INVALID`
### `CONTRIBUTOR_SOURCE_UNAVAILABLE` | ### `CONTRIBUTOR_SOURCE_UNAVAILABLE`
### `BRIEF_INPUT_MISSING` | ### `BRIEF_INPUT_MISSING`
### `DRAFT_DIRECTION_UNRESOLVED` | ### `DRAFT_DIRECTION_UNRESOLVED`
### `warning: left <n> locally edited file(s) with CRLF line endings that gstack pins to LF` | ### `warning: left <n> locally edited file(s) with CRLF line endings that gstack pins to LF`
## Field wave lane CD: pregate guards, regate, sealed output | ## 波次车道 CD：预门禁守卫、重新门禁、密封输出
### `PREGATE_GUARD_FAILED` | ### `PREGATE_GUARD_FAILED`
### `MIGRATION_COLLISION` | ### `MIGRATION_COLLISION`
### `SEALED_OUTPUT_REFUSED` | ### `SEALED_OUTPUT_REFUSED`
### `EVAL_GATE_UNPRICED` | ### `EVAL_GATE_UNPRICED`
### `EVAL_GATE_OVER_CAP` | ### `EVAL_GATE_OVER_CAP`
### `EVAL_PLAN_STALE` | ### `EVAL_PLAN_STALE`
### `PLAN_SECTIONS_INVALID` | ### `PLAN_SECTIONS_INVALID`
### `PLAN_AMEND_PENDING` | ### `PLAN_AMEND_PENDING`
### `AMENDMENT_UNKNOWN` | ### `AMENDMENT_UNKNOWN`
### `AMENDMENT_NOT_SETTLEABLE` | ### `AMENDMENT_NOT_SETTLEABLE`
### `GATE_REC_STALE` | ### `GATE_REC_STALE`
### `CHECKPOINT_INVALID` | ### `CHECKPOINT_INVALID`
### `CHECKPOINT_OVERLAP` | ### `CHECKPOINT_OVERLAP`
### `CHECKPOINT_TARGET_EXISTS` | ### `CHECKPOINT_TARGET_EXISTS`
### `OWNER_REPLY_REQUIRED` | ### `OWNER_REPLY_REQUIRED`
### `GATE_OWNER_REPLY_MISMATCH` | ### `GATE_OWNER_REPLY_MISMATCH`
### `GSTACK_VERSION_CHANGED` | ### `GSTACK_VERSION_CHANGED`
### `ARTIFACT_GATE_UNSETTLED` | ### `ARTIFACT_GATE_UNSETTLED`
### `ios-qa launch: GSTACK_IOS_LAUNCH_ENV ... so the app was not launched (<detail>); fix: ... (IOS_LAUNCH_ENV_INVALID)` | ### `ios-qa launch: GSTACK_IOS_LAUNCH_ENV ... so the app was not launched (<detail>); fix: ... (IOS_LAUNCH_ENV_INVALID)`
### `Outside voice unavailable: <cause>. Fix: <fix>. Continuing to ... (OUTSIDE_VOICE_UNAVAILABLE)` | ### `Outside voice unavailable: <cause>. Fix: <fix>. Continuing to ... (OUTSIDE_VOICE_UNAVAILABLE)`
### `ARTIFACT_MACHINE_PATH` | ### `ARTIFACT_MACHINE_PATH`
### `ARTIFACT_OWNER_WORDS` | ### `ARTIFACT_OWNER_WORDS`
### `ARTIFACT_PUBLIC_TARGET_EXISTS` | ### `ARTIFACT_PUBLIC_TARGET_EXISTS`
### `PREREG_DIAGNOSTIC_UNTESTED` | ### `PREREG_DIAGNOSTIC_UNTESTED`
### `EVAL_MODELS_INVALID` | ### `EVAL_MODELS_INVALID`
### `EVAL_MODEL_DENIED` | ### `EVAL_MODEL_DENIED`
### `EVAL_MODEL_OLD_GENERATION` | ### `EVAL_MODEL_OLD_GENERATION`
### `EVAL_MODEL_GENERATION_UNRESOLVED` | ### `EVAL_MODEL_GENERATION_UNRESOLVED`
### `gstack-pregate: cannot fingerprint the working tree: bin/gstack-wtree could not start (on Windows, no Git Bash was found) or it ran and failed (<detail>); fix: <fix> (WTREE_UNAVAILABLE)` | ### `gstack-pregate: cannot fingerprint the working tree: bin/gstack-wtree could not start (on Windows, no Git Bash was found) or it ran and failed (<detail>); fix: <fix> (WTREE_UNAVAILABLE)`
### `warn CLAUDE.md the gstack section in <file> lists <n> skills; Claude Code lists installed skills itself, and a pasted list goes stale with each release` | ### `warn CLAUDE.md the gstack section in <file> lists <n> skills; Claude Code lists installed skills itself, and a pasted list goes stale with each release`
## gstack | ## gstack
### `POLICY_GSTACK_TOO_OLD` | ### `POLICY_GSTACK_TOO_OLD`
### `QUEUE_NOT_READY` | ### `QUEUE_NOT_READY`
### `QUEUE_PROOF_MISSING` | ### `QUEUE_PROOF_MISSING`
### `QUEUE_STAMP_NOT_STAMP_ONLY` | ### `QUEUE_STAMP_NOT_STAMP_ONLY`
### `QUEUE_VERIFY_MISMATCH` | ### `QUEUE_VERIFY_MISMATCH`
### `QUEUE_GATE_MISSING` | ### `QUEUE_GATE_MISSING`
### `GATE_AHEAD_ATTEMPT_INVALID` | ### `GATE_AHEAD_ATTEMPT_INVALID`
### `QUEUE_TRAIN_OFF` | ### `QUEUE_TRAIN_OFF`
### `QUEUE_TRAIN_UNTRUSTED` | ### `QUEUE_TRAIN_UNTRUSTED`
### `CHANGELOG_FRAGMENT_INVALID` | ### `CHANGELOG_FRAGMENT_INVALID`
### `QUEUE_LAND_LOCKED` | ### `QUEUE_LAND_LOCKED`
### `QUEUE_TRAIN_UNSTAMPED` | ### `QUEUE_TRAIN_UNSTAMPED`
### `RESTAMP_NOT_STAGED` | ### `RESTAMP_NOT_STAGED`
### `RESTAMP_UNSTAGED_EDITS` | ### `RESTAMP_UNSTAGED_EDITS`
### `QUEUE_LAND_CONFLICT` | ### `QUEUE_LAND_CONFLICT`
### `QUEUE_LAND_DRIFT` | ### `QUEUE_LAND_DRIFT`
### `QUEUE_LAND_BASE_BUSY` | ### `QUEUE_LAND_BASE_BUSY`
### `QUEUE_LAND_STAMPED` | ### `QUEUE_LAND_STAMPED`
### `QUEUE_LAND_PIN_MOVED` | ### `QUEUE_LAND_PIN_MOVED`
### `QUEUE_LAND_CHECKS` | ### `QUEUE_LAND_CHECKS`
### `QUEUE_LAND_MERGED_CHECKS` | ### `QUEUE_LAND_MERGED_CHECKS`
### `QUEUE_LAND_NOT_CLEAN` | ### `QUEUE_LAND_NOT_CLEAN`
### `QUEUE_LAND_UNVERIFIED` | ### `QUEUE_LAND_UNVERIFIED`
### `RELEASE_STAMP_EMPTY` | ### `RELEASE_STAMP_EMPTY`
### `RELEASE_STAMP_INVALID` | ### `RELEASE_STAMP_INVALID`
### `QUEUE_TRAIN_STAMP_MISMATCH` | ### `QUEUE_TRAIN_STAMP_MISMATCH`
### `QUEUE_TRAIN_MOVED` | ### `QUEUE_TRAIN_MOVED`
### `QUEUE_TRAIN_CONFLICT` | ### `QUEUE_TRAIN_CONFLICT`
### `QUEUE_TRAIN_FREE_RED` | ### `QUEUE_TRAIN_FREE_RED`
### `QUEUE_TRAIN_DISPATCH_UNKNOWN` | ### `QUEUE_TRAIN_DISPATCH_UNKNOWN`
### `QUEUE_TRAIN_WAITING` | ### `QUEUE_TRAIN_WAITING`
### `QUEUE_TRAIN_PENDING` | ### `QUEUE_TRAIN_PENDING`
### `QUEUE_TRAIN_INCOMPLETE` | ### `QUEUE_TRAIN_INCOMPLETE`
### `QUEUE_TRAIN_RED` | ### `QUEUE_TRAIN_RED`
### `QUEUE_TRAIN_RED_ON_MAIN` | ### `QUEUE_TRAIN_RED_ON_MAIN`
### `QUEUE_TRAIN_UNATTRIBUTED` | ### `QUEUE_TRAIN_UNATTRIBUTED`
### `QUEUE_TRAIN_BISECT_CAPPED` | ### `QUEUE_TRAIN_BISECT_CAPPED`
### `QUEUE_TRAIN_PREFIX_INVALID` | ### `QUEUE_TRAIN_PREFIX_INVALID`
### `QUEUE_TRAIN_REBUILD_REFUSED` | ### `QUEUE_TRAIN_REBUILD_REFUSED`
### `QUEUE_TRAIN_TREE_MISMATCH` | ### `QUEUE_TRAIN_TREE_MISMATCH`
### `QUEUE_TRAIN_STALE` | ### `QUEUE_TRAIN_STALE`
### `QUEUE_TRAIN_BASE_RED` | ### `QUEUE_TRAIN_BASE_RED`
### `QUEUE_TRAIN_SPEND_CAP` | ### `QUEUE_TRAIN_SPEND_CAP`
### `QUEUE_TRAIN_LAND_METHOD` | ### `QUEUE_TRAIN_LAND_METHOD`
### `QUEUE_TRAIN_INIT_REFUSED` | ### `QUEUE_TRAIN_INIT_REFUSED`
### `QUEUE_TRAIN_DOCTOR_FINDINGS` | ### `QUEUE_TRAIN_DOCTOR_FINDINGS`
### `QUEUE_BASE_RED_NO_TRAIN` | ### `QUEUE_BASE_RED_NO_TRAIN`
### `SHIP_BASE_RED_FIXER` | ### `SHIP_BASE_RED_FIXER`
### `QUEUE_TRAIN_FROZEN` | ### `QUEUE_TRAIN_FROZEN`
### `BACKSTOP: green, but the freeze stands` | ### `BACKSTOP: green, but the freeze stands`
### `BACKSTOP: red, and the queue is already frozen` | ### `BACKSTOP: red, and the queue is already frozen`
### `QUEUE_WAVE_CONFLICT` | ### `QUEUE_WAVE_CONFLICT`
### `QUEUE_WAVE_MOVED` | ### `QUEUE_WAVE_MOVED`
### `QUEUE_WAVE_DUPLICATE` | ### `QUEUE_WAVE_DUPLICATE`
### `QUEUE_WAVE_SIZE` | ### `QUEUE_WAVE_SIZE`
### `QUEUE_WAVE_UNKNOWN` | ### `QUEUE_WAVE_UNKNOWN`
### `QUEUE_WAVE_DEPENDENT` | ### `QUEUE_WAVE_DEPENDENT`
### `QUEUE_WAVE_NOT_MERGED` | ### `QUEUE_WAVE_NOT_MERGED`
### `QUEUE_RECEIPT_MISSING` | ### `QUEUE_RECEIPT_MISSING`
### `QUEUE_RECEIPT_STALE` | ### `QUEUE_RECEIPT_STALE`
### `QUEUE_RECEIPT_CONDITIONAL` | ### `QUEUE_RECEIPT_CONDITIONAL`
### `BASE_RED_UNCONFIGURED` | ### `BASE_RED_UNCONFIGURED`
### `BASE_RED_UNNAMED` | ### `BASE_RED_UNNAMED`
### `BASE_RED_REPRO_ERROR` | ### `BASE_RED_REPRO_ERROR`
### `BASE_RED_PAUSE_EXPIRED` | ### `BASE_RED_PAUSE_EXPIRED`
### `BASE_RED_WAIT_TIMEOUT` | ### `BASE_RED_WAIT_TIMEOUT`
### `BASE_CONTAINS_HEAD` | ### `BASE_CONTAINS_HEAD`
### `QUEUE_RECEIPT_DEPTH_RAISED` | ### `QUEUE_RECEIPT_DEPTH_RAISED`
### `QUEUE_RECEIPT_EXCEPTION_INVALID` | ### `QUEUE_RECEIPT_EXCEPTION_INVALID`
### `QUEUE_RECEIPT_TARGETED_MISSING` | ### `QUEUE_RECEIPT_TARGETED_MISSING`
### `QUEUE_SCREEN_STALE_REF` | ### `QUEUE_SCREEN_STALE_REF`
### `QUEUE_SCREEN_RED` | ### `QUEUE_SCREEN_RED`
### `QUEUE_TRAIN_STACK_RED` | ### `QUEUE_TRAIN_STACK_RED`
### `QUEUE_POST_MERGE_RED` | ### `QUEUE_POST_MERGE_RED`
### `QUEUE_SCREEN_NOT_RUN` | ### `QUEUE_SCREEN_NOT_RUN`
### `READY_SCREEN_CHOICE_REQUIRED` | ### `READY_SCREEN_CHOICE_REQUIRED`
### `PREGATE_TIMING_ASSERTION` | ### `PREGATE_TIMING_ASSERTION`
### `APPROVAL_CLASSES_INVALID` | ### `APPROVAL_CLASSES_INVALID`
### `APPROVAL_CLASS_FOUND` | ### `APPROVAL_CLASS_FOUND`
### `APPROVAL_CITATION_MISSING` | ### `APPROVAL_CITATION_MISSING`
### `APPROVAL_SOURCE_UNAVAILABLE` | ### `APPROVAL_SOURCE_UNAVAILABLE`
### `STATE_MATRIX_INCOMPLETE` | ### `STATE_MATRIX_INCOMPLETE`
### `REVIEW_SCOPE_INPUT` | ### `REVIEW_SCOPE_INPUT`
### `REVIEW_SCOPE_RANGE` | ### `REVIEW_SCOPE_RANGE`
### `REVIEW_SCOPE_LEDGER` | ### `REVIEW_SCOPE_LEDGER`
### `RECEIPT_CARRY_REFUSED` | ### `RECEIPT_CARRY_REFUSED`
### `REVIEW_LOOP_EXCEPTION_INVALID` | ### `REVIEW_LOOP_EXCEPTION_INVALID`
### `RECEIPT_CARRY_TREE_MISMATCH` | ### `RECEIPT_CARRY_TREE_MISMATCH`
### `RECEIPT_CARRY_PRODUCT_CHANGED` | ### `RECEIPT_CARRY_PRODUCT_CHANGED`
### `RECEIPT_CARRY_SCOPED_REVIEW` | ### `RECEIPT_CARRY_SCOPED_REVIEW`
### Scoped re-check after `RECEIPT_CARRY_PRODUCT_CHANGED` (J1) | ### `RECEIPT_CARRY_PRODUCT_CHANGED` 之后的范围化复查（J1）
### `RECEIPT_PROSE_MISMATCH` | ### `RECEIPT_PROSE_MISMATCH`
### `RECEIPT_CARRY_PREGATE_STALE` | ### `RECEIPT_CARRY_PREGATE_STALE`
### `RECEIPT_GIT_TOO_OLD` | ### `RECEIPT_GIT_TOO_OLD`
### `DOCS_AUDIT_BLOCKED` | ### `DOCS_AUDIT_BLOCKED`
## gstack-pr-wait | ## gstack-pr-wait
### `#<pr> stopped: action needed (PR_WAIT_BLOCKED)` | ### `#<pr> stopped: action needed (PR_WAIT_BLOCKED)`
### `gstack-pr-wait: the watcher did not start, or a local error stopped it before a verdict — ... (PR_WAIT_REFUSED)` | ### `gstack-pr-wait: the watcher did not start, or a local error stopped it before a verdict — ... (PR_WAIT_REFUSED)`
## gstack-error-capture | ## gstack-error-capture
### `gstack-error-capture: ... (DX_CAPTURE_USAGE)` | ### `gstack-error-capture: ... (DX_CAPTURE_USAGE)`
### `gstack-error-capture: ... (DX_CAPTURE_BAD_DEADLINE)` | ### `gstack-error-capture: ... (DX_CAPTURE_BAD_DEADLINE)`
### `gstack-error-capture: ... (DX_CAPTURE_BAD_MAX_BYTES)` | ### `gstack-error-capture: ... (DX_CAPTURE_BAD_MAX_BYTES)`
### `gstack-error-capture: ... (DX_CAPTURE_BAD_PASS_ENV)` | ### `gstack-error-capture: ... (DX_CAPTURE_BAD_PASS_ENV)`
### `gstack-error-capture: ... (DX_CAPTURE_BAD_CWD)` | ### `gstack-error-capture: ... (DX_CAPTURE_BAD_CWD)`
### `gstack-error-capture: ... (DX_CAPTURE_APPROVAL_REQUIRED)` | ### `gstack-error-capture: ... (DX_CAPTURE_APPROVAL_REQUIRED)`
### `gstack-error-capture: ... (DX_CAPTURE_CONFIG_REFUSED)` | ### `gstack-error-capture: ... (DX_CAPTURE_CONFIG_REFUSED)`
### `gstack-error-capture: ... (DX_CAPTURE_NOT_FOUND)` | ### `gstack-error-capture: ... (DX_CAPTURE_NOT_FOUND)`
### `gstack-error-capture: ... (DX_CAPTURE_TEMP_DIR)` | ### `gstack-error-capture: ... (DX_CAPTURE_TEMP_DIR)`
### `gstack-error-capture: ... (DX_CAPTURE_CONTAINMENT_UNAVAILABLE)` | ### `gstack-error-capture: ... (DX_CAPTURE_CONTAINMENT_UNAVAILABLE)`
### `gstack-error-capture: ... (DX_CAPTURE_SUPERVISOR_FAILED)` | ### `gstack-error-capture: ... (DX_CAPTURE_SUPERVISOR_FAILED)`
### `gstack-error-capture: ... (DX_CAPTURE_INTERRUPTED)` | ### `gstack-error-capture: ... (DX_CAPTURE_INTERRUPTED)`
### `gstack-error-capture: ... (DX_CAPTURE_REDACTION_FAILED)` | ### `gstack-error-capture: ... (DX_CAPTURE_REDACTION_FAILED)`
### `gstack-error-capture: ... (DX_CAPTURE_INTERNAL)` | ### `gstack-error-capture: ... (DX_CAPTURE_INTERNAL)`
## Prose lint (gstack-prose-lint) | ## 文风检查（gstack-prose-lint）
### `PROSE_LINT_FOUND` | ### `PROSE_LINT_FOUND`
## Quick answers | ## 快速答案
## gstack-decision-trail and gstack-worktree-audit | ## gstack-decision-trail 与 gstack-worktree-audit
### `gstack-decision-trail: DECISION_TRAIL_START_REQUIRED: <file> has <n> rows and run <id> has no start row after the newest one` | ### `gstack-decision-trail: DECISION_TRAIL_START_REQUIRED: <file> has <n> rows and run <id> has no start row after the newest one`
### `gstack-worktree-audit` prints `warn: no -b given; MERGED checks against origin/HEAD` or every row says `MERGED no` | ### `gstack-worktree-audit` 打印 `warn: no -b given; MERGED checks against origin/HEAD`，或每行都显示 `MERGED no`
## Agent harnesses (gstack-harness) | ## Agent 宿主（gstack-harness）
### `gstack-harness: unknown harness "<name>"` (HARNESS_UNKNOWN_TARGET) | ### `gstack-harness: unknown harness "<name>"` (HARNESS_UNKNOWN_TARGET)
### `gstack-harness: <harness> has no default skills folder` (HARNESS_NO_DESTINATION) | ### `gstack-harness: <harness> has no default skills folder` (HARNESS_NO_DESTINATION)
### `gstack-harness: Hermes does not support --skills router` (HARNESS_MODE_UNSUPPORTED) | ### `gstack-harness: Hermes does not support --skills router` (HARNESS_MODE_UNSUPPORTED)
### `gstack-harness: refusing to write into <dir>: <why>` (HARNESS_UNSAFE_DESTINATION) | ### `gstack-harness: refusing to write into <dir>: <why>` (HARNESS_UNSAFE_DESTINATION)
### `gstack-harness: <path> already exists and gstack did not write it` / `a skill named <name> already exists at <path>` (HARNESS_UNOWNED_ENTRY) | ### `gstack-harness: <path> already exists and gstack did not write it` / `a skill named <name> already exists at <path>` (HARNESS_UNOWNED_ENTRY)
### `gstack-harness: refusing to write the gstack block into <file>: <why>` (HARNESS_CONTEXT_REFUSED) | ### `gstack-harness: refusing to write the gstack block into <file>: <why>` (HARNESS_CONTEXT_REFUSED)
### `gstack-harness: could not render <harness> skills: ...` (HARNESS_RENDER_FAILED) | ### `gstack-harness: could not render <harness> skills: ...` (HARNESS_RENDER_FAILED)
### `gstack-harness: router description is <n> bytes` / `context block is <n> bytes` (HARNESS_BUDGET_EXCEEDED) | ### `gstack-harness: router description is <n> bytes` / `context block is <n> bytes` (HARNESS_BUDGET_EXCEEDED)
### `gstack-harness: no registration named "<name>"` (HARNESS_NOT_REGISTERED) | ### `gstack-harness: no registration named "<name>"` (HARNESS_NOT_REGISTERED)
### `gstack-harness: <harness> has no start hook` / `the start hook goes into the <harness> profile <dir>, and this registration uses another skills folder` (HARNESS_HOOK_UNSUPPORTED) | ### `gstack-harness: <harness> has no start hook` / `the start hook goes into the <harness> profile <dir>, and this registration uses another skills folder` (HARNESS_HOOK_UNSUPPORTED)
### `gstack-harness: GSTACK_HARNESS_START_HOOK="<value>" is not on or off` (HARNESS_HOOK_CHOICE_INVALID) | ### `gstack-harness: GSTACK_HARNESS_START_HOOK="<value>" is not on or off` (HARNESS_HOOK_CHOICE_INVALID)
### `gstack-harness: a gstack-start plugin already exists at <dir> and this registration did not write it` (HARNESS_HOOK_OWNED_ELSEWHERE) | ### `gstack-harness: a gstack-start plugin already exists at <dir> and this registration did not write it` (HARNESS_HOOK_OWNED_ELSEWHERE)
### `gstack-harness: <harness> start hook is written: <why>. Turn it on: <command>` (HARNESS_HOOK_INACTIVE, exit 4) | ### `gstack-harness: <harness> start hook is written: <why>. Turn it on: <command>` (HARNESS_HOOK_INACTIVE, exit 4)
### `gstack-harness: no QM admin credential in the environment` / `... needs --yes` (HARNESS_QM_CREDENTIALS) | ### `gstack-harness: no QM admin credential in the environment` / `... needs --yes` (HARNESS_QM_CREDENTIALS)
### `gstack-harness: <METHOD> /v1/admin/skill-packs... returned HTTP <code>` / `... failed: timed out after 60 s` (HARNESS_QM_API) | ### `gstack-harness: <METHOD> /v1/admin/skill-packs... returned HTTP <code>` / `... failed: timed out after 60 s` (HARNESS_QM_API)
### `gstack-harness: gstack at <sha> is <n> MiB in <n> files; nothing was sent to QM` / `QM refused the pack: pack exceeds max bytes (33554432)` (HARNESS_QM_PACK_TOO_LARGE) | ### `gstack-harness: gstack at <sha> is <n> MiB in <n> files; nothing was sent to QM` / `QM refused the pack: pack exceeds max bytes (33554432)` (HARNESS_QM_PACK_TOO_LARGE)
## Module loadouts (gstack-modules) | ## 模块配置组（gstack-modules）
### `LOADOUTS_INVALID: modules/loadouts.json …` | ### `LOADOUTS_INVALID: modules/loadouts.json …`
### `LOADOUT_UNKNOWN: "<name>" is not a loadout (valid: …)` | ### `LOADOUT_UNKNOWN: "<name>" is not a loadout (valid: …)`
### `LOADOUT_INVALID_MODEL: "<id>" is not a plain model id; using full` | ### `LOADOUT_INVALID_MODEL: "<id>" is not a plain model id; using full`
### `LOADOUT_MISMATCH: <baked id> vs <running id>: read <full root>/<skill>/SKILL.md now` | ### `LOADOUT_MISMATCH: <baked id> vs <running id>: read <full root>/<skill>/SKILL.md now`
### `LOADOUT_FALLBACK: <reason>; serving full` | ### `LOADOUT_FALLBACK: <reason>; serving full`
### `MODULE_SPEC_INVALID: …` | ### `MODULE_SPEC_INVALID: …`
### `MODULE_UNKNOWN: "<id>" is not a module` | ### `MODULE_UNKNOWN: "<id>" is not a module`
### `MODULE_PINNED: <id> is pinned and can never be excluded` | ### `MODULE_PINNED: <id> is pinned and can never be excluded`
### `MODULE_EXCLUSION_UNSAFE: <id>: referenced by <file>:<line>` | ### `MODULE_EXCLUSION_UNSAFE: <id>: referenced by <file>:<line>`
### `RENDER_FAILED: gen-skill-docs failed: …` | ### `RENDER_FAILED: gen-skill-docs failed: …`
### `RENDER_DEST_NOT_OWNED: <dir> exists and holds no loadout.lock.json` | ### `RENDER_DEST_NOT_OWNED: <dir> exists and holds no loadout.lock.json`
## ubi-runner recovery and results sink | ## ubi-runner 恢复与结果汇聚端
### `UBI_RECOVERY_REQUIRED` | ### `UBI_RECOVERY_REQUIRED`
### `UBI_RECOVERY_UNAVAILABLE` | ### `UBI_RECOVERY_UNAVAILABLE`
### `RECOVER_FAILED: vm=<name> code=RECOVER_DECRYPT_FAILED` | ### `RECOVER_FAILED: vm=<name> code=RECOVER_DECRYPT_FAILED`
### `RECOVER_FAILED: vm=<name> code=RECOVER_API_UNAVAILABLE` | ### `RECOVER_FAILED: vm=<name> code=RECOVER_API_UNAVAILABLE`
### `RECOVER_FAILED: vm=<name> code=RECOVER_EXISTS` | ### `RECOVER_FAILED: vm=<name> code=RECOVER_EXISTS`
### `RECOVER_GONE: vm=<name>` | ### `RECOVER_GONE: vm=<name>`
### `UBI_SINK_INVALID` | ### `UBI_SINK_INVALID`
### `SINK_FLUSH_FAILED: vm=<name> seq=<n> last_push=<epoch/never> [sink_skipped=size/tar_failed]` | ### `SINK_FLUSH_FAILED: vm=<name> seq=<n> last_push=<epoch/never> [sink_skipped=size/tar_failed]`
### `UBI_CREATE_UNKNOWN` | ### `UBI_CREATE_UNKNOWN`
### `UBI_ATTACH_UNKNOWN` | ### `UBI_ATTACH_UNKNOWN`
## Per-repo cleanup (gstack-clean) | ## 按仓库清理（gstack-clean）
### `gstack-clean: an unknown flag or a bad --audit-days value … (GSTACK_CLEAN_USAGE)` | ### `gstack-clean: an unknown flag or a bad --audit-days value … (GSTACK_CLEAN_USAGE)`
### `gstack-clean: the folder to clean is not a safe per-repo .gstack folder … (GSTACK_CLEAN_TARGET_REFUSED)` | ### `gstack-clean: the folder to clean is not a safe per-repo .gstack folder … (GSTACK_CLEAN_TARGET_REFUSED)`
### `FAILED <path> <errno>` … `(GSTACK_CLEAN_PARTIAL)` | ### `FAILED <path> <errno>` … `(GSTACK_CLEAN_PARTIAL)`
### `gstack-clean: unexpected gstack-clean failure … (GSTACK_CLEAN_INTERNAL)` | ### `gstack-clean: unexpected gstack-clean failure … (GSTACK_CLEAN_INTERNAL)`
### `RUNAWAY_USAGE: …` (gstack-runaway) | ### `RUNAWAY_USAGE: …` (gstack-runaway)
### `RUNAWAY_INPUT: file=<path> …` (gstack-runaway) | ### `RUNAWAY_INPUT: file=<path> …` (gstack-runaway)
