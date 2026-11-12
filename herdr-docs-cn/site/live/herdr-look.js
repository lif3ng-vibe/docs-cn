// A live copy of Herdr's default look: the same nine agents, working.
(() => {
// Assets sit next to this script.
const B = (document.currentScript?.src ?? "").replace(/[^/]*$/, "");
const I = (n, s = 14, cls = "") => (window.ICONS[n] || "").replace("<svg", `<svg width="${s}" height="${s}" class="${cls}"`);
const spinner = s => I("spinner", s, "spin").replace("<svg", `<svg style="animation-delay:-${Date.now() % 900}ms"`);
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const PROG = {
  claude: { name: "Claude Code", icon: B + "icons/claude.svg" },
  codex: { name: "Codex", icon: B + "icons/codex.svg" },
  pi: { name: "Pi", icon: B + "icons/pi.svg" },
  amp: { name: "Amp", icon: B + "icons/amp.svg" },
};

// ---------- the world ----------
const SPACES = [
  { id: "website", color: "#22a99a", branch: "main", tabs: ["pricing page", "og tags", "blog pass", "docs nav"] },
  { id: "core", color: "#e3814f", branch: "master", tabs: ["doc comments"] },
  { id: "plugins", color: "#5b8def", branch: "main", tabs: ["readme"] },
  { id: "service-api", color: "#8b7cf6", branch: "master", tabs: ["metrics"], machine: "vps" },
  { id: "extensions", color: "#3fae6a", branch: "main", tabs: ["tests"], machine: "macbook" },
];
const min = 60000, now0 = Date.now();
const AGENTS = [
  { id: "t1", prog: "claude", space: "website", tab: "pricing page", since: 4 * min },
  { id: "t2", prog: "codex", space: "website", tab: "pricing page", since: 4 * min },
  { id: "t3", prog: "claude", space: "website", tab: "og tags", since: 4 * min },
  { id: "t4", prog: "codex", space: "website", tab: "blog pass", since: 9 * min },
  { id: "t5", prog: "claude", space: "website", tab: "docs nav", since: 2 * min },
  { id: "t6", prog: "claude", space: "core", tab: "doc comments", since: 6 * min },
  { id: "t7", prog: "codex", space: "plugins", tab: "readme", since: 12 * min },
  { id: "vps/t8", prog: "pi", space: "service-api", tab: "metrics", since: 3 * min },
  { id: "macbook/t9", prog: "amp", space: "extensions", tab: "tests", since: 18 * min },
];
for (const a of AGENTS) { a.since = now0 - a.since; a.status = "idle"; a.blocks = []; a.input = ""; a.work = null; a.perm = null; }
const S = { space: "website", tab: { website: "pricing page" }, focus: { "pricing page": "t1" } };
const byId = id => AGENTS.find(a => a.id === id);
const tabAgents = (space, tab) => AGENTS.filter(a => a.space === space && a.tab === tab);
const rank = { blocked: 3, working: 2, done: 1, idle: 0 };
const top = list => list.reduce((s, a) => (rank[a.status] > rank[s] ? a.status : s), "idle");
const activeTab = () => S.tab[S.space] ?? SPACES.find(s => s.id === S.space).tabs[0];
const visible = a => a.space === S.space && a.tab === activeTab();
const focused = a => visible(a) && (S.focus[a.tab] ?? tabAgents(a.space, a.tab)[0].id) === a.id;
const cwd = a => `~/code/${a.space}`;

// ---------- stories ----------
// Claude steps: say, tool [name, arg, result], diff [file, summary, lines], ask [question, file]
// Codex steps: say, explored [[verb, what]], edited [file, lines], bullets [..]
const STORY = {
  t1: [
    { prompt: "look at the pricing section in src/pages/index.astro and tighten its copy: shorter sentences, one idea each. edit the file and list what you changed.", verb: "Tightening", steps: [
      ["say", "I'll read the pricing section first."],
      ["tool", "Read", "src/pages/index.astro", "Read 214 lines"],
      ["diff", "src/pages/index.astro", "Updated src/pages/index.astro with 2 additions and 2 removals", [
        [118, "-", "<p>Herdr is free for individuals and it will always stay free for individuals.</p>"],
        [118, "+", "<p>Free for individuals. Forever.</p>"],
        [119, "-", "<p>Teams get shared spaces, machines everyone can reach, and priority support.</p>"],
        [119, "+", "<p>Teams share spaces and machines.</p>"]]],
      ["say", "Done. Two changes:\n1. The free line is now two short sentences.\n2. The team line keeps one idea and drops the support promise."]] },
    { prompt: "nice. same rules for the faq below it", verb: "Herding", steps: [
      ["tool", "Read", "src/pages/index.astro", "Read 64 lines"],
      ["diff", "src/pages/index.astro", "Updated src/pages/index.astro with 2 additions and 2 removals", [
        [161, "-", "<dd>Yes, your terminals keep running even after you have closed the app window.</dd>"],
        [161, "+", "<dd>Yes. Close the app, they keep running.</dd>"],
        [167, "-", "<dd>You can connect other machines and see all of their agents in one list.</dd>"],
        [167, "+", "<dd>Add a machine. Its agents join the list.</dd>"]]],
      ["say", "Shortened two answers. The rest already read fine."]] },
  ],
  t2: [
    { prompt: "find unused css selectors in public/css/site.css and remove five of them", steps: [
      ["explored", [["Read", "site.css"], ["Search", "hero-meta|cap-soon|soon-tag in src"], ["Read", "index.astro, Header.astro"]]],
      ["edited", "public/css/site.css", [
        [110, "-", "body.site .hd-nav .ico.wide:has(b:empty) { width: 30px; }"],
        [111, "-", ".hero-meta > .meta { opacity: .7; }"],
        [112, "-", ".caps .cap-soon .mask { inset: 0; }"],
        [113, "-", ".caps .cap-soon .soon-tag { top: 8px; }"],
        [114, "-", ".caps > .cap:hover .herd i { scale: 1.1; }"]]],
      ["say", "Removed five unused selector rules from site.css. I checked the markup and scripts for each class first."]] },
    { prompt: "run the build and make sure nothing broke", steps: [
      ["explored", [["Run", "bun run build"]]],
      ["say", "Build passes. 41 pages, no warnings."]] },
  ],
  t3: [{ prompt: "add og tags to every blog post", verb: "Wrangling", long: true, steps: [
      ["tool", "Search", 'pattern: "og:image"', "Found 2 files"],
      ["tool", "Read", "src/components/Head.astro", "Read 88 lines"],
      ["diff", "src/components/Head.astro", "Updated src/components/Head.astro with 2 additions", [
        [21, "+", '<meta property="og:title" content={title} />'],
        [22, "+", '<meta property="og:image" content={image ?? "/og.png"} />']]],
      ["say", "Head now takes an image. Passing it from each post next."]] }],
  t4: [{ prompt: "proofread the last three blog posts", steps: [
      ["explored", [["Read", "content/blog/*.md"]]],
      ["say", "Fixed four typos and one broken link. Nothing else changed."]] }],
  t5: [{ prompt: "reorder the docs sidebar so getting started comes first", verb: "Sorting", steps: [
      ["tool", "Read", "src/docs/nav.ts", "Read 42 lines"],
      ["ask", "src/docs/nav.ts", [[7, "-", '  { label: "Concepts", items: concepts },'], [7, "+", '  { label: "Getting started", items: start },'], [8, "-", '  { label: "Getting started", items: start },'], [8, "+", '  { label: "Concepts", items: concepts },']]],
      ["say", "Getting started is first now."]] }],
  t6: [{ prompt: "document the public api of crates/core with doc comments", verb: "Annotating", long: true, steps: [
      ["tool", "Read", "crates/core/src/lib.rs", "Read 312 lines"],
      ["say", "Starting with the terminal lifecycle types."]] }],
  t7: [{ prompt: "write a readme for the plugin examples", steps: [["say", "Wrote README.md with three examples."]] }],
  "vps/t8": [{ prompt: "add request timing metrics to the api", long: true, steps: [["say", "Adding a timing layer to the router."]] }],
  "macbook/t9": [{ prompt: "make the flaky upload test stable", steps: [["say", "The test waited on a timer. It now waits for the upload event."]] }],
};

// ---------- rendering terminals ----------
const ln = (h, cls = "") => `<div class="ln ${cls}">${h}</div>`;
const gap = '<div class="gap"></div>';
const diffRows = rows => rows.map(([n, k, t]) => ln(`      <span class="d">${String(n).padStart(3)}</span> ${k === " " ? " " : k} ${esc(t)}`, k === "-" ? "del" : k === "+" ? "add" : "")).join("");
const fmtS = ms => { const s = Math.max(1, Math.round(ms / 1000)); return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`; };
const GLYPH = "·✢✳✶✻✽✻✶✳✢";

function claude(a) {
  const out = [];
  for (const b of a.blocks) {
    if (b.t === "banner") out.push(`<div class="row" style="gap:18px;margin:6px 0 14px"><img src="${B}icons/claude.svg" style="width:96px;height:64px;image-rendering:pixelated" alt=""><div>${ln('Claude Code <span class="d">v2.1.309</span>')}${ln('<span class="d">Opus 5.5 · Claude Max</span>')}${ln(`<span class="d">${cwd(a)}</span>`)}</div></div>`);
    if (b.t === "user") out.push(gap, ln(`<span class="d">❯</span> ${esc(b.text)}`, "user"));
    if (b.t === "say") out.push(gap, `<div class="ln hang"><span>⏺</span><div>${esc(b.text).replace(/\n/g, "<br>")}</div></div>`);
    if (b.t === "tool" || b.t === "diff") {
      const dot = b.ok ? '<span class="g">⏺</span>' : `<span class="d" style="opacity:${Date.now() % 1000 < 500 ? 1 : .3}">⏺</span>`;
      out.push(gap, ln(`${dot} <span class="bold">${b.t === "diff" ? "Update" : b.name}</span>(${esc(b.arg)})`));
      if (b.res) out.push(ln(`  <span class="d">⎿</span>  ${b.res}`));
      if (b.rows?.length) out.push(diffRows(b.rows));
    }
    if (b.t === "perm") out.push(`<div class="perm">${ln('<span class="bold">Edit file</span>')}${diffRows(b.rows)}${ln(`Do you want to make this edit to <span class="bold">${b.file.split("/").pop()}</span>?`)}${ln('<span class="b">❯</span> <span class="b opt" data-ok="1">1. Yes</span>')}${ln('  <span class="opt" data-ok="1">2. Yes, allow all edits during this session</span> <span class="d">(shift+tab)</span>')}${ln('  <span class="opt" data-ok="1">3. No, and tell Claude what to do differently</span> <span class="d">(esc)</span>')}</div>`);
    if (b.t === "worked") out.push(gap, ln(`<span class="d">✻ Worked for ${b.time}</span>`));
  }
  if (a.work) {
    const el = Date.now() - a.work.start;
    out.push(gap, ln(`<span class="o">${GLYPH[Math.floor(el / 120) % GLYPH.length]} ${a.work.verb}…</span> <span class="d">(${fmtS(el)} · ↓ ${(el / 900 * .1 + .3).toFixed(1)}k tokens · esc to interrupt)</span>`));
  }
  const cur = focused(a) ? `<span class="caret${a.input ? "" : " blink"}"></span>` : `<span class="caret" style="background:none;outline:1px solid var(--a8)"></span>`;
  const input = a.perm ? "" : `<div class="ccin"><div class="rule"></div>${ln(`<span class="d">❯</span> ${esc(a.input)}${cur}`)}<div class="rule"></div>${ln('  <span class="r">⏵⏵ bypass permissions on</span> <span class="d">(shift+tab to cycle)</span>')}</div>`;
  return `<div class="scroll">${out.join("")}</div>${input}`;
}

function codex(a) {
  const out = [];
  for (const b of a.blocks) {
    if (b.t === "banner") out.push(`<div style="border:1px solid var(--rule);border-radius:6px;padding:4px 12px;display:inline-block;margin-bottom:4px">${ln(`<span class="d">&gt;_</span> <span class="bold">${PROG[a.prog].name}</span> <span class="d">(v0.94.0)</span>`)}${gap}${ln(`<span class="d">model:</span>     gpt-6-luna low`)}${ln(`<span class="d">directory:</span> ${cwd(a)}`)}</div>`);
    if (b.t === "user") out.push(gap, ln(`<span class="d">›</span> ${esc(b.text)}`, "user"));
    if (b.t === "say") out.push(gap, `<div class="ln hang"><span class="d">•</span><div>${esc(b.text)}</div></div>`);
    if (b.t === "explored") out.push(gap, ln(`<span class="d">•</span> <span class="bold">${b.items.some(i => i[0] === "Run") ? "Ran" : b.done ? "Explored" : "Exploring"}</span>`), ...b.items.map(([v, w], i) => ln(`  <span class="d">${i ? " " : "└"}</span> <span class="c">${v}</span> ${esc(w)}`)));
    if (b.t === "edited") out.push(gap, ln(`<span class="d">•</span> <span class="bold">Edited</span> ${b.file} (<span class="g">+${b.rows.filter(r => r[1] === "+").length}</span> <span class="r">-${b.rows.filter(r => r[1] === "-").length}</span>)`), diffRows(b.rows));
    if (b.t === "worked") out.push(gap, `<div class="ln d" style="white-space:nowrap;overflow:hidden">─ Worked for ${b.time} ${"─".repeat(200)}</div>`);
  }
  if (a.work) out.push(gap, ln(`<span class="shim">◦ Working</span> <span class="d">(${fmtS(Date.now() - a.work.start)} • esc to interrupt)</span>`));
  const ph = a.input ? esc(a.input) : '<span class="d">Ask Codex to do anything</span>';
  const cur = focused(a) ? `<span class="caret${a.input ? "" : " blink"}"></span>` : "";
  return `<div class="scroll">${out.join("")}</div><div class="cxin">${ln(`<span class="d">›</span> ${a.input ? ph + cur : cur + ph}`)}</div>${ln(`  <span class="d">gpt-6-luna low · ${cwd(a)}</span>`, "")}`;
}

// ---------- playing a story ----------
const waiters = {};
async function play(a, st, instant) {
  const P = ms => (instant ? 0 : sleep(ms));
  const cc = a.prog === "claude";
  if (!instant && focused(a)) for (const ch of st.prompt) { a.input += ch; await sleep(rand(18, 55)); }
  else if (!instant) { a.input = st.prompt; await sleep(300); }
  a.input = "";
  a.blocks.push({ t: "user", text: st.prompt });
  const start = Date.now();
  if (!instant) { set(a, "working"); a.work = { verb: st.verb ?? "Thinking", start }; }
  await P(rand(900, 1600));
  for (const [kind, ...x] of st.steps) {
    if (kind === "say") {
      const b = { t: "say", text: "" }; a.blocks.push(b);
      if (instant) b.text = x[0];
      else for (const w of x[0].split(/(\s+)/)) { b.text += w; await sleep(w.trim() ? rand(25, 70) : 0); }
    } else if (kind === "tool") {
      const b = { t: "tool", name: x[0], arg: x[1] }; a.blocks.push(b);
      await P(rand(700, 1500)); b.ok = true; b.res = x[2];
    } else if (kind === "diff") {
      const b = { t: "diff", arg: x[0], rows: [] }; a.blocks.push(b);
      await P(rand(900, 1700)); b.ok = true; b.res = x[1];
      for (const r of x[2]) { b.rows.push(r); await P(90); }
    } else if (kind === "ask") {
      const b = { t: "perm", file: x[0], rows: x[1] }; a.blocks.push(b);
      a.perm = b; a.work = null; set(a, "blocked");
      if (!instant) await new Promise(r => { waiters[a.id] = r; setTimeout(r, 22000); });
      a.blocks.pop(); a.perm = null;
      if (instant) return;
      a.blocks.push({ t: "diff", arg: x[0], ok: true, res: `Updated ${x[0]} with ${x[1].length / 2} additions and ${x[1].length / 2} removals`, rows: x[1] });
      set(a, "working"); a.work = { verb: st.verb ?? "Thinking", start: Date.now() };
      await P(900);
    } else if (kind === "explored") {
      const b = { t: "explored", items: [] }; a.blocks.push(b);
      for (const it of x[0]) { b.items.push(it); await P(rand(600, 1300)); }
      b.done = true;
    } else if (kind === "edited") {
      await P(rand(800, 1400));
      const b = { t: "edited", file: x[0], rows: [] }; a.blocks.push(b);
      for (const r of x[1]) { b.rows.push(r); await P(80); }
    }
    await P(rand(500, 1100));
    if (st.long && !instant) await sleep(rand(4000, 9000));
  }
  a.work = null;
  a.blocks.push({ t: "worked", time: instant ? `${Math.floor(rand(20, 90))}s` : fmtS(Date.now() - start) });
  if (!instant) set(a, "done");
}

async function life(a, delay) {
  const list = STORY[a.id];
  await sleep(delay);
  for (let i = 1; ; i++) {
    const st = list[i % list.length];
    await play(a, st);
    await sleep(a.id === "t1" ? 5000 : rand(9000, 20000));
    if (list.length === 1 && !st.long && a.id !== "t5") await sleep(30000);
  }
}

function set(a, status) {
  a.status = status; a.since = Date.now(); ver++;
}

// ---------- chrome ----------
const ago = t => { const m = Math.floor((Date.now() - t) / min); return m < 1 ? "<1m" : `${m}m`; };
const stat = (s, badge = true, dot = 6) =>
  s === "working" ? spinner(12) : s === "blocked" ? (badge ? '<span class="badge">Needs you</span>' : `<i class="dot" style="width:${dot}px;height:${dot}px;background:var(--blocked)"></i>`)
  : s === "done" ? `<i class="dot" style="width:${dot}px;height:${dot}px;background:var(--done)"></i>` : "";

function sidebar(root) {
  const sp = s => {
    const st = top(AGENTS.filter(a => a.space === s.id));
    return `<div class="space row ${s.id === S.space ? "on" : ""}" data-space="${s.id}"><span class="av" style="background:${s.color}">${s.id[0].toUpperCase()}</span><span class="nm trunc">${s.id}</span><span class="git row"><span>${s.branch}</span><i class="dot" style="width:6px;height:6px;background:var(--a3)"></i></span>${stat(st)}</div>`;
  };
  const mach = (icon, name) => `<div class="mach row">${I(icon, 13)}<span class="grow trunc">${name}</span><span class="plus">+</span><i class="dot" style="width:6px;height:6px;background:var(--done)"></i>${I("chevron-down", 11)}</div>`;
  const nw = `<div class="newsp row">${I("plus", 12)}New space there</div>`;
  const MACHINES = [[null, "monitor"], ["macbook", "server"], ["vps", "server"]];
  let agents = "";
  for (const s of SPACES) {
    const list = AGENTS.filter(a => a.space === s.id);
    agents += `<div class="grp row">${s.id}</div>`;
    for (const a of list) {
      const on = visible(a) && focused(a);
      const right = a.status === "working" ? spinner(12).replace("<svg", '<svg style="margin:0 1px"')
        : a.status === "blocked" ? stat("blocked")
        : a.status === "done" ? '<i class="dot" style="width:7px;height:7px;margin:0 3px;background:var(--done)"></i>'
        : '<i class="dot" style="width:7px;height:7px;margin:0 3px;border:1.5px solid var(--idle)"></i>';
      agents += `<div class="agent row ${on ? "on" : ""} ${a.status}" data-agent="${a.id}"><img src="${PROG[a.prog].icon}" alt=""><span class="nm grow trunc">${a.tab}</span><span class="t">${ago(a.since)}</span>${right}</div>`;
    }
  }
  root.querySelector(".lists").innerHTML =
    `<div><div class="shead row"><span>Spaces</span><span>+</span></div><div class="slist">${MACHINES.map(([m, icon]) => { const mine = SPACES.filter(s => (s.machine ?? null) === m); return mach(icon, m ?? "This computer") + (mine.length ? mine.map(sp).join("") : nw); }).join("")}</div></div>` +
    `<div class="agents"><div class="ahead row"><span>Agents</span>${I("layers", 14)}</div><div class="alist">${agents}</div></div>`;
}

function tabs(root) {
  const s = SPACES.find(x => x.id === S.space);
  const tb = s.tabs.map(t => {
    const list = tabAgents(s.id, t), on = t === activeTab();
    const p = list.find(a => a.prog !== "pi") ?? list[0];
    return `<div class="tab row ${on ? "on" : ""}" data-tab="${t}"><img src="${PROG[p.prog].icon}" alt=""><span class="trunc" style="max-width:170px">${t}</span>${stat(top(list), false)}${on ? `<span class="x">${I("close", 12)}</span>` : ""}</div>`;
  }).join("");
  root.querySelector(".tabs").innerHTML = `<div class="row grow" style="gap:3px">${tb}</div><div class="ibtn" style="color:var(--dim)">+</div><div class="pbtn row">${I("file", 14)}Files</div><div class="pbtn row">${I("changes", 14)}Changes</div>`;
  const list = AGENTS.filter(a => a.status === "blocked").length;
  root.querySelector(".status").innerHTML = `<div class="row">${I(s.machine ? "server" : "monitor", 13)}${s.machine ?? "This computer"}</div><div class="row">${I("branch", 13)}${s.branch}</div><div class="row"><i class="dot" style="width:6px;height:6px;background:var(--working)"></i>${AGENTS.length} agents${list ? `<span style="color:var(--blocked)">· ${list} needs you</span>` : ""}</div><div class="grow"></div><div style="color:var(--dim)">${root.classList.contains("mac") ? "⌘" : "Ctrl"} Shift P&nbsp; commands</div>`;
}

// The active tab's panes into `body`; each look draws its own pane header.
function panes(body, head) {
  const list = tabAgents(S.space, activeTab());
  if (body.dataset.key !== S.space + activeTab()) {
    body.dataset.key = S.space + activeTab();
    body.innerHTML = list.map(a => `<div class="pane" data-pane="${a.id}"><div class="phead row"></div><div class="term"></div></div>`).join("");
  }
  for (const a of list) {
    const el = body.querySelector(`[data-pane="${a.id}"]`);
    el.classList.toggle("focus", focused(a) && list.length > 1);
    const ph = el.querySelector(".phead");
    if (ph.dataset.h !== a.status) { ph.innerHTML = head(a); ph.dataset.h = a.status; }
    const term = el.querySelector(".term");
    const html = a.prog === "claude" ? claude(a) : codex(a);
    if (term.dataset.h !== html) { term.innerHTML = html; term.dataset.h = html; const sc = term.querySelector(".scroll"); sc.scrollTop = sc.scrollHeight; }
  }
}

// ---------- board ----------
const BOARD = [
  { key: "blocked", label: "Needs you", color: "#d79032", wash: "#fff5e4" },
  { key: "working", label: "Working", color: "#7465db", wash: "#efedfd" },
  { key: "done", label: "Done", color: "#39a380", wash: "#e8f6ef" },
  { key: "idle", label: "Idle", color: "#99a0ad", wash: "#edf0f4" },
];
const observed = a => { const m = Math.floor((Date.now() - a.since) / min); return m < 1 ? "<1m observed" : `${m}m observed`; };
const column = {};
function board(root) {
  const tab = activeTab();
  const moved = a => { const m = column[a.id] && column[a.id] !== a.status; column[a.id] = a.status; return m ? "new" : ""; };
  root.querySelector(".bd-title").textContent = S.space;
  root.querySelector(".bd-live .where").textContent = `${S.space} / ${tab}`;
  root.querySelector(".bd-cols").innerHTML = BOARD.map(st => {
    const cards = AGENTS.filter(a => a.status === st.key);
    return `<div class="bd-col"><div class="bd-colh row"><i class="dot" style="width:8px;height:8px;background:${st.color}"></i><b>${st.label}</b><span class="n" style="background:${st.wash};color:${st.color}">${cards.length}</span><span class="grow"></span><span class="plus">+</span></div>` +
      cards.map(a => `<div class="bd-card ${visible(a) && focused(a) ? "on" : ""} ${moved(a)}" data-agent="${a.id}" style="--c:${st.color}"><i class="bar"></i><div class="in"><div class="row top"><img src="${PROG[a.prog].icon}" alt=""><span class="trunc">${PROG[a.prog].name}</span><span class="grow"></span><span>${a.id}</span></div><div class="nm trunc">${a.tab}</div><div class="row bot"><span class="trunc">${a.space}</span><span class="grow"></span><span>${observed(a)}</span></div></div></div>`).join("") + "</div>";
  }).join("");
}
const boardHead = a => `<img src="${PROG[a.prog].icon}" alt=""><span class="pn">${PROG[a.prog].name}</span><span class="grow"></span><i class="dot" style="width:6px;height:6px;background:${BOARD.find(s => s.key === a.status).color}"></i>`;

// ---------- core: the same window as herdr-core sees it ----------
const ST = { working: '<span class="b">working</span>', blocked: '<span class="y">needs you</span>', done: '<span class="g">done</span>', idle: '<span class="d">idle</span>' };
function coreSide(root) {
  const pad = (s, n) => s + " ".repeat(Math.max(1, n - s.length));
  let out = `<span class="d">~</span> hc ls\n<span class="d">${pad("ID", 4)}${pad("WHERE", 22)}STATUS</span>\n`;
  for (const s of SPACES) for (const a of AGENTS.filter(a => a.space === s.id))
    out += `${pad(a.id, 4)}${pad(a.space + "/" + a.tab, 22)}${ST[a.status]}\n`;
  out += `\n<span class="d">~</span> hc machine ls\n${pad("this", 12)}<span class="g">connected</span>\n${pad("macbook", 12)}<span class="g">connected</span>\n${pad("vps", 12)}<span class="g">connected</span>`;
  root.querySelector(".cr-side").innerHTML = out;
  root.querySelector(".cr-top").innerHTML = `<span class="d">~</span> hc attach ${tabAgents(S.space, activeTab()).map(a => a.id).join(" ")}   <span class="d">${S.space}/${activeTab()}</span>`;
}
const coreHead = a => `<span class="d">\u2500\u2500 ${a.id} \u00b7 ${a.prog} \u00b7 ${cwd(a)} \u00b7</span> ${ST[a.status]} <span class="d">${"\u2500".repeat(80)}</span>`;

const nextSpace = () => SPACES[(SPACES.findIndex(s => s.id === S.space) + 1) % SPACES.length].id;
const TITLE = { t1: "Tighten pricing copy", t2: "Remove unused CSS selectors", t3: "Add og tags to blog posts", t4: "Proofread blog posts", t5: "Reorder docs sidebar", t6: "Document core public API", t7: "Plugin examples readme", "vps/t8": "Request timing metrics", "macbook/t9": "Fix flaky upload test" };

// ---------- terminals: just tabs and terminals ----------
function terminals(root) {
  root.querySelector(".tm-space").dataset.space = nextSpace();
  root.querySelector(".tm-space .sp").textContent = S.space;
  const s = SPACES.find(x => x.id === S.space);
  root.querySelector(".tm-tabs").innerHTML = s.tabs.map(t => {
    const list = tabAgents(s.id, t), p = list.find(a => a.prog !== "pi") ?? list[0], st = top(list);
    const dot = st === "idle" ? "" : `<i style="background:var(--${st})"></i>`;
    return `<div class="tm-tab row ${t === activeTab() ? "on" : ""}" data-tab="${t}"><span class="ic"><img src="${PROG[p.prog].icon}" alt="">${dot}</span><span class="trunc nm">${t}</span><span class="trunc path">${cwd(p)}</span></div>`;
  }).join("");
}
const termHead = a => `<img src="${PROG[a.prog].icon}" alt=""><span class="pn trunc">${TITLE[a.id]}</span><span class="cwd trunc">${cwd(a)}</span><span class="acts row">${I("panel-right", 15)}${I("square", 14)}${I("close", 14)}</span>`;

// ---------- code: an editor around the agents ----------
const CODE = [
  ['<span class="k">---</span>'],
  ['<span class="k">import</span> <span class="v">Base</span> <span class="k">from</span> <span class="s">"../layouts/Base.astro"</span>;'],
  ['<span class="k">import</span> <span class="v">Pricing</span> <span class="k">from</span> <span class="s">"../components/Pricing.astro"</span>;'],
  ['<span class="k">---</span>'],
  ['<span class="t">&lt;</span><span class="c">Base</span> <span class="a">title</span>=<span class="s">"Herdr"</span><span class="t">&gt;</span>'],
  ['  <span class="t">&lt;section</span> <span class="a">class</span>=<span class="s">"pricing"</span><span class="t">&gt;</span>'],
  ['    <span class="t">&lt;h2&gt;</span>Pricing<span class="t">&lt;/h2&gt;</span>'],
  ['    <span class="t">&lt;p&gt;</span>Free for individuals. Forever.<span class="t">&lt;/p&gt;</span>', "m"],
  ['    <span class="t">&lt;p&gt;</span>Teams share spaces and machines.<span class="t">&lt;/p&gt;</span>', "m"],
  ['    <span class="t">&lt;</span><span class="c">Pricing</span> <span class="a">plans</span>={<span class="v">plans</span>} <span class="t">/&gt;</span>'],
  ['  <span class="t">&lt;/section&gt;</span>'],
  ['  <span class="cm">&lt;!-- faq --&gt;</span>'],
];
const TREE = [[0, "v", "WEBSITE", 1], [1, ">", ".astro"], [1, ">", ".claude"], [1, ">", "public"], [1, "v", "src"], [2, ">", "components"], [2, ">", "content"], [2, "v", "pages"], [3, "", "index.astro", 0, 1], [3, "", "pricing.astro"], [3, ">", "blog"], [2, ">", "styles"], [1, "", "astro.config.mjs"], [1, "", "package.json"], [1, "", "README.md"]];
function code(root) {
  const tab = activeTab(), blocked = AGENTS.find(a => a.status === "blocked");
  const working = AGENTS.filter(a => a.status === "working").length;
  root.querySelector(".vs-search").dataset.space = nextSpace();
  root.querySelector(".vs-search").textContent = `${S.space} \u2014 Herdr`;
  root.querySelector(".vs-tree .list").innerHTML = TREE.map(([d, ch, n, root_, on]) =>
    `<div class="vt row ${on ? "on" : ""} ${root_ ? "root" : ""}" style="padding-left:${8 + d * 12}px"><span class="ch">${ch === "v" ? I("chevron-down", 12) : ch === ">" ? I("chevron-right", 12) : ""}</span>${root_ ? S.space.toUpperCase() : n}</div>`).join("");
  root.querySelector(".vs-code").innerHTML = CODE.map(([l, m], i) => `<div class="cl ${m ? "mod" : ""}"><span class="n">${114 + i}</span><span>${l}</span></div>`).join("");
  root.querySelector(".vs-tlist").innerHTML = SPACES.find(s => s.id === S.space).tabs.map(t => `<span class="${t === tab ? "on" : ""}" data-tab="${t}">${t}</span>`).join("");
  root.querySelector(".vs-status").innerHTML = `<span class="rm">&gt;&lt;</span><span>${I("branch", 12)} main*</span><span>\u2297 0 \u26a0 0</span><span>\u25cf ${working} agents working</span>${blocked ? `<span class="nd" data-agent="${blocked.id}">\u25cf 1 needs you</span>` : ""}<span class="grow"></span><span>Ln 121, Col 7</span><span>Spaces: 2</span><span>UTF-8</span><span>Astro</span><span>Herdr</span>`;
}
const codeHead = a => `<img src="${PROG[a.prog].icon}" alt=""><span class="pn">${PROG[a.prog].name}</span><span class="cwd trunc">${cwd(a)}</span>${a.status === "working" ? spinner(12) : `<i class="dot" style="width:7px;height:7px;background:var(--${a.status})"></i>`}`;

// ---------- pasture: an actual herd ----------
function pasture(root) {
  root.querySelector(".pa-sign b").textContent = S.space;
  root.querySelector(".pa-rail .where").textContent = `${S.space}  /  ${activeTab()}`;
  const n = st => AGENTS.filter(a => a.status === st).length;
  root.querySelector(".pa-stats").innerHTML = `<span>${n("working")} wandering</span><span>${n("blocked")} need you</span><span>${n("done")} resting</span>`;
  sheep(root, true);
}
function sheep(root, force) {
  const step = Math.floor(Date.now() / 4200);
  if (!force && root._step === step) return;
  root._step = step;
  const field = root.querySelector(".pa-herd");
  AGENTS.forEach((a, i) => {
    let el = field.querySelector(`[data-agent="${a.id}"]`);
    if (!el) {
      el = document.createElement("div");
      el.dataset.agent = a.id;
      el.innerHTML = `<div class="bubble">! ${PROG[a.prog].name}</div><div class="zzz">zzz</div><div class="sb"><img class="s" alt=""><span class="tag"><img src="${PROG[a.prog].icon}" alt=""></span></div><div class="nm">${a.tab}</div>`;
      field.appendChild(el);
    }
    const w = a.status === "working";
    el.className = `sheep ${a.status} ${visible(a) && focused(a) ? "on" : ""}`;
    const src = `${B}pasture/${a.status === "done" ? "sleep" : w || a.status === "blocked" ? "sheep" : "graze"}.svg`;
    const img = el.querySelector(".s");
    if (!img.src.endsWith(src)) img.src = src;
    el.style.left = 250 + (i % 5) * 215 + (w ? Math.sin(step * .8 + i) * 34 : 0) + "px";
    el.style.top = (i < 5 ? 74 : 182) + "px";
  });
}
const pastureHead = a => `<img src="${PROG[a.prog].icon}" alt=""><span class="pn">${PROG[a.prog].name}</span><span class="grow"></span><span>${a.status === "blocked" ? "needs you" : a.status}</span>`;

// ---------- 1998 ----------
let clippyOff = null;
const bevel = (s) => `<span class="ctl"><img src="${B}w98/${s}.svg" alt=""></span>`;
function w98(root) {
  root.querySelector(".w9-icons").innerHTML = `<div class="di"><img src="${B}w98/computer.svg" alt=""><span>My Computer</span></div><div class="di"><img src="${B}w98/bin.svg" alt=""><span>Recycle Bin</span></div>` +
    SPACES.map(s => `<div class="di ${s.id === S.space ? "on" : ""}" data-space="${s.id}"><img src="${B}w98/folder${s.id === S.space ? "-open" : ""}.svg" alt=""><span>${s.id}</span></div>`).join("") +
    `<div class="di"><img src="${B}w98/sol.svg" alt=""><span>Solitaire</span></div>`;
  const s = SPACES.find(x => x.id === S.space);
  const tasks = s.tabs.map(t => { const p = tabAgents(s.id, t)[0]; return `<div class="w9-b row ${t === activeTab() ? "on" : ""}" data-tab="${t}"><img src="${PROG[p.prog].icon}" alt=""><span class="trunc">${t}</span></div>`; }).join("");
  root.querySelector(".w9-btns").innerHTML = tasks + `<div class="w9-b row"><img src="${B}w98/sol-sm.svg" alt=""><span>Solitaire</span></div>`;
  root.querySelector(".w9-tray").innerHTML = AGENTS.filter(a => a.status !== "idle").map(a => `<img src="${PROG[a.prog].icon}" alt="" title="${a.tab}">`).join("") + `<span>${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>`;
  const b = AGENTS.find(a => a.status === "blocked");
  const clip = root.querySelector(".w9-clippy");
  clip.classList.toggle("show", Boolean(b) && clippyOff !== b.id + b.since);
  if (b) clip.querySelector(".bub").innerHTML = `It looks like ${PROG[b.prog].name} in '${b.space} \\ ${b.tab}' is waiting for you.<br><br>Would you like help?<br><br><a data-agent="${b.id}">Take me there</a><br><a data-dismiss="${b.id + b.since}">Not now</a>`;
}
const w98Head = a => `<img src="${PROG[a.prog].icon}" alt=""><span class="trunc grow">${PROG[a.prog].name} - ${a.tab}${a.status === "blocked" ? " (needs you)" : ""}</span>${bevel("ctl-min")}${bevel("ctl-max")}${bevel("ctl-close")}`;
const SOL = ["0-12", "1-9", "2-6", "3-13", "0-1", "2-10", "1-11"];

// ---------- looks ----------
const lights = '<div class="lights"><i></i><i></i><i></i></div>';
const LOOKS = {
  herdr: {
    html: () => `<div class="side"><div class="brand row"><div class="name row grow"><img src="${B}icons/herdr.png" alt="">Herdr</div><div class="ibtn">${I("search", 15)}</div><div class="ibtn">${I("sidebar", 15)}</div></div>
      <div class="lists"></div>
      <div class="foot"><div class="r row">${I("settings", 14)}Settings</div><div class="r d row">${I("plus", 14)}Add machine</div></div></div>
      <div class="work"><div class="tabs row"></div><div class="body"></div><div class="status row"></div></div>`,
    chrome: root => { sidebar(root); tabs(root); },
    panes: root => panes(root.querySelector(".body"), a => `<img src="${PROG[a.prog].icon}" alt=""><span class="pn">${PROG[a.prog].name}</span><span class="cwd trunc">${cwd(a)}</span>${a.status === "done" ? '<i class="dot" style="width:7px;height:7px;background:var(--done)"></i>' : stat(a.status)}`),
  },
  board: {
    html: () => `<div class="bd-head"><div class="row" style="gap:10px"><span class="logo row"><i style="height:17px"></i><i style="height:12px"></i><i style="height:20px"></i></span><span class="bd-title"></span><span class="slash">/</span><span class="sub">Agent board</span><span class="grow"></span><span class="meta">${AGENTS.length} agents across ${SPACES.length} spaces</span></div>
      <div class="row" style="gap:7px"><span class="chip on">Board</span><span class="chip">All spaces</span><span class="chip">All agents</span><span class="grow"></span><i class="dot" style="width:6px;height:6px;background:#39a380"></i><span class="meta" style="font-size:10px">Live updates</span></div></div>
      <div class="bd-cols row"></div>
      <div class="bd-work"><div class="bd-live row"><i class="dot" style="width:7px;height:7px;background:#7465db"></i><b>Live workspace</b><span class="where"></span><span class="grow"></span><span class="cap">TERMINALS</span></div><div class="body"></div></div>`,
    chrome: board,
    panes: root => panes(root.querySelector(".body"), boardHead),
  },
  terminals: {
    html: () => `<div class="tm-top row"><div class="tm-space row">${I("folder", 15)}<span class="sp"></span></div><div class="tm-tabs row"></div><span class="grow"></span><span class="ibtn">\u2318</span><span class="ibtn">${I("plus", 16)}</span></div><div class="body"></div>`,
    chrome: terminals,
    panes: root => panes(root.querySelector(".body"), termHead),
  },
  code: {
    html: () => `<div class="vs-title row"><div class="vs-menu row"><span>File</span><span>Edit</span><span>Selection</span><span>View</span><span>Go</span><span>Run</span><span>Terminal</span><span>Help</span></div><div class="vs-search"></div></div>
      <div class="vs-main"><div class="vs-act"><span class="on">${I("files", 22)}</span><span>${I("search", 21)}</span><span>${I("git-branch", 21)}<b>4</b></span><span>${I("layers", 21)}<b>1</b></span><span class="grow"></span><span>${I("settings", 21)}</span></div>
      <div class="vs-tree"><div class="h">EXPLORER</div><div class="list"></div></div>
      <div class="vs-right"><div class="vs-etabs row"><span class="on"><i class="fi o">\u25c6</i>index.astro <em>\u00d7</em></span><span><i class="fi b">#</i>site.css</span><span><i class="fi p">M\u2193</i>README.md</span></div>
      <div class="vs-crumb">src \u203a pages \u203a index.astro</div><div class="vs-code"></div>
      <div class="vs-panel"><div class="vs-ptabs row"><span>PROBLEMS</span><span>OUTPUT</span><span>DEBUG CONSOLE</span><span class="on">TERMINAL</span><span>PORTS</span><span class="grow"></span><span class="vs-tlist row"></span><span>+</span></div><div class="body"></div></div></div></div>
      <div class="vs-status row"></div>`,
    chrome: code,
    panes: root => panes(root.querySelector(".body"), codeHead),
  },
  pasture: {
    html: () => `<div class="pa-field"><img class="meadow" src="${B}pasture/meadow.svg" alt=""><div class="pa-title"><b>The pasture</b><span>${AGENTS.length} sheep, one happy herd.</span></div><div class="pa-post"></div><div class="pa-sign"><small>WELCOME TO</small><b></b></div><div class="pa-stats row"></div><div class="pa-herd"></div></div><div class="pa-rail row"><span class="where"></span><span class="grow"></span><span>THE WORKSHED</span></div><div class="body"></div>`,
    chrome: pasture,
    panes: root => { sheep(root); panes(root.querySelector(".body"), pastureHead); },
  },
  w98: {
    html: () => `<div class="w9-desk"><div class="w9-icons"></div><div class="body"></div>
      <div class="w9-sol"><div class="w9-tb row"><img src="${B}w98/sol-sm.svg" alt=""><span class="grow">Solitaire</span>${bevel("ctl-min")}${bevel("ctl-close")}</div><div class="w9-menu"><u>G</u>ame&nbsp;&nbsp;&nbsp;<u>H</u>elp</div><div class="felt"><div class="row" style="gap:8px"><img src="${B}w98/sol-back-0.svg" alt=""><span class="grow"></span><i></i><i></i><i></i><i></i></div><div class="row" style="gap:8px;align-items:flex-start;margin-top:12px">${SOL.map((c, i) => `<div class="pile" style="padding-top:${i * 5}px"><img src="${B}w98/sol-${c}.svg" alt=""></div>`).join("")}</div></div></div>
      <div class="w9-clippy"><div class="bub"></div><img src="${B}w98/clippy.svg" alt=""></div></div>
      <div class="w9-task row"><div class="w9-b start row"><img src="${B}w98/start-sm.svg" alt=""><b>Start</b></div><div class="w9-btns row"></div><span class="grow"></span><div class="w9-tray row"></div></div>`,
    chrome: w98,
    panes: root => panes(root.querySelector(".body"), w98Head),
  },
  core: {
    html: () => `<pre class="cr-side"></pre><div class="work"><div class="cr-top"></div><div class="body"></div></div>`,
    chrome: coreSide,
    panes: root => panes(root.querySelector(".body"), coreHead),
  },
};

// Bumped on any change every mount must redraw (status, selection).
let ver = 1;
// opts: look, platform (mac|linux), onLook, crop {x, y, w, h}: show only that part of the window.
function mount(fit, opts = {}) {
  fit.classList.add("hw-fit");
  const W = 1477, H = 831, roots = {}, crop = opts.crop;
  let current = null, seen = 0, lastMin = 0;
  if (crop) fit.style.overflow = "hidden";
  const make = name => {
    const root = document.createElement("div");
    root.className = `hw ${name} ${opts.platform ?? "mac"} off ${crop ? "crop" : ""}`;
    root.innerHTML = (opts.platform === "linux" ? "" : lights) + LOOKS[name].html();
    fit.appendChild(root);
    root.addEventListener("click", click);
    return root;
  };
  const size = () => {
    const k = fit.clientWidth / (crop?.w ?? W);
    for (const r of Object.values(roots)) r.style.transform = crop ? `scale(${k}) translate(${-crop.x}px, ${-crop.y}px)` : `scale(${k})`;
    fit.style.height = (crop?.h ?? H) * k + "px";
  };
  new ResizeObserver(size).observe(fit);
  const setLook = name => {
    if (name === current || !LOOKS[name]) return;
    roots[name] ??= make(name);
    current = name; size(); seen = 0; draw();
    for (const [n, r] of Object.entries(roots)) r.classList.toggle("off", n !== name);
    opts.onLook?.(name);
  };

  function click(e) {
    const t = e.target.closest("[data-space],[data-tab],[data-agent],[data-pane],[data-ok],[data-dismiss]");
    if (!t) return;
    if (t.dataset.dismiss) clippyOff = t.dataset.dismiss;
    else if (t.dataset.ok) { const a = byId(t.closest("[data-pane]").dataset.pane); waiters[a.id]?.(); }
    else if (t.dataset.space) S.space = t.dataset.space;
    else if (t.dataset.tab) S.tab[S.space] = t.dataset.tab;
    else if (t.dataset.agent) { const a = byId(t.dataset.agent); S.space = a.space; S.tab[a.space] = a.tab; S.focus[a.tab] = a.id; }
    else if (t.dataset.pane) S.focus[activeTab()] = t.dataset.pane;
    // what you look at stops being news
    for (const a of tabAgents(S.space, activeTab())) if (a.status === "done") a.status = "idle";
    ver++; draw();
  }

  // Drawing stops while the window is off screen; the agents keep working.
  let onScreen = true;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(fit);
  const draw = () => {
    if (!onScreen || document.hidden) return;
    const root = roots[current], look = LOOKS[current];
    const m = Math.floor(Date.now() / min);
    if (seen !== ver || m !== lastMin) { look.chrome(root); seen = ver; lastMin = m; }
    look.panes(root);
  };
  setLook(opts.look ?? "herdr");
  setInterval(draw, 60);
  return { setLook, looks: Object.keys(LOOKS) };
}

// ---------- start ----------
(async () => {
for (const a of AGENTS) a.blocks.push({ t: "banner" });
await Promise.all(AGENTS.filter(a => a.id !== "t5").map(a => play(a, STORY[a.id][0], true)));
// done before you came, so quiet; t1's last answer and t2's are news
for (const id of ["t1", "t2"]) byId(id).status = "done";
for (const id of ["t3", "t6", "vps/t8"]) { const a = byId(id); a.blocks = a.blocks.slice(0, 2); }
byId("t2").blocks.splice(1);
const startDelays = { t1: 1800, t2: 400, t3: 0, t4: 60000, t5: 0, t6: 0, t7: 90000, "vps/t8": 0, "macbook/t9": 120000 };
for (const a of AGENTS) {
  if (["t3", "t6", "vps/t8"].includes(a.id)) { a.status = "working"; a.work = { verb: STORY[a.id][0].verb ?? "Thinking", start: Date.now() - rand(20000, 90000) }; continueStory(a); }
  else if (a.id === "t5") life5(a);
  else if (a.id === "t2") (async () => { await sleep(400); await play(a, STORY.t2[0]); await sleep(15000); life(a, 0); })();
  else life(a, startDelays[a.id]);
}
ver++;
})();
async function continueStory(a) {
  const st = STORY[a.id][0];
  for (const [kind, ...x] of st.steps.slice(0, 1)) if (kind === "tool") a.blocks.push({ t: "tool", name: x[0], arg: x[1], ok: true, res: x[2] });
  await sleep(rand(8000, 25000));
  const rest = { ...st, steps: st.steps.slice(1) };
  for (const [kind, ...x] of rest.steps) {
    if (kind === "say") { const b = { t: "say", text: "" }; a.blocks.push(b); for (const w of x[0].split(/(\s+)/)) { b.text += w; await sleep(40); } }
    else if (kind === "tool") { const b = { t: "tool", name: x[0], arg: x[1] }; a.blocks.push(b); await sleep(1200); b.ok = true; b.res = x[2]; }
    else if (kind === "diff") { const b = { t: "diff", arg: x[0], rows: [] }; a.blocks.push(b); await sleep(1400); b.ok = true; b.res = x[1]; for (const r of x[2]) { b.rows.push(r); await sleep(90); } }
    await sleep(rand(5000, 12000));
  }
  a.blocks.push({ t: "worked", time: fmtS(Date.now() - a.work.start) }); a.work = null; set(a, "done");
  life(a, 20000);
}
async function life5(a) {
  for (;;) { await play(a, STORY.t5[0], false); await sleep(rand(20000, 30000)); }
}

window.HerdrLook = { mount, agents: AGENTS, spaces: SPACES, programs: PROG, version: () => ver };
})();
