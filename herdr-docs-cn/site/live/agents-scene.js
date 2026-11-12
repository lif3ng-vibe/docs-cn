// Agents running agents: a lead agent starts helpers with hc, they work, and
// their reports land in its input as <hc> notes. Written from a real run
// (Claude Code Sonnet as lead, Codex GPT-6.1 Sol as reviewer, bun test).
(() => {
const B = (document.currentScript?.src ?? "").replace(/[^/]*$/, "");
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const W = 1400, H = 720;
const GLYPH = "·✢✳✶✻✽✻✶✳✢";
const spin = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" class="spin"><circle cx="12" cy="12" r="9.4" stroke-opacity="0.24"/><path d="M12 2.6a9.4 9.4 0 0 1 9.4 9.4"/></svg>';

const PROMPT = "rename the Plugins nav label to Marketplace, keep the /plugins/ URLs. get a review and run the tests before you call it done";
const REVIEW_TASK = "Review the uncommitted diff: Plugins was renamed to Marketplace, the /plugins/ URLs must stay. Look for leftovers and broken links. Don't edit. Report findings with: hc send t1";
const FOUND = 'One leftover: src/pages/plugins.astro:6 still says "Herdr plugins" in the page title. Everything else says Marketplace and keeps /plugins/.';
const TESTS = ["refreshPlugins > publishes an empty snapshot", "refreshPlugins > keeps one star sample per UTC day", "refreshPlugins > preserves the snapshot on GitHub failure", "waitlist > confirms a signup once", "waitlist > rate limits per address", "docs path > maps versions and locales", "fetch handler > does not expose a public Worker API"];

function mount(fit) {
  fit.classList.add("hw-fit");
  const root = document.createElement("div");
  root.className = "hw scene";
  root.innerHTML = `
    <div class="sc-tree">
      <span class="who">you</span><span class="arr">→</span>
      <span class="chip" data-id="t1"><img src="${B}icons/claude.svg" alt=""><b>t1</b> Claude Code <i>lead</i><span class="st"></span></span>
      <span class="kids"></span>
      <span class="grow"></span>
      <button class="sc-replay" type="button">↻ Restart</button>
    </div>
    <div class="sc-body">
      <div class="pane lead focus" data-id="t1"><div class="phead row"></div><div class="term"></div></div>
      <div class="sc-col"></div>
    </div>`;
  fit.appendChild(root);
  const size = () => { const k = fit.clientWidth / W; root.style.transform = `scale(${k})`; fit.style.height = H * k + "px"; };
  new ResizeObserver(size).observe(fit); size();

  // ---------- state ----------
  let run = 0;
  const P = {};
  const reset = () => {
    P.t1 = { name: "Claude Code", role: "lead", icon: "claude", status: "idle", blocks: [], input: "", work: null };
    P.t2 = null; P.t3 = null;
    // fresh panes each round, so nothing animates back from the last one
    root.querySelector(".sc-body").innerHTML = '<div class="pane lead focus" data-id="t1"><div class="phead row"></div><div class="term"></div></div><div class="sc-col"></div>';
    root.querySelector(".kids").innerHTML = "";
  };

  // ---------- drawing ----------
  const ln = (h, c = "") => `<div class="ln ${c}">${h}</div>`;
  const gap = '<div class="gap"></div>';
  const diff = rows => rows.map(([n, k, t]) => ln(`      <span class="d">${String(n).padStart(3)}</span> ${k} ${esc(t)}`, k === "-" ? "del" : "add")).join("");
  const fmt = ms => { const s = Math.max(1, Math.round(ms / 1000)); return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`; };
  function lead(p) {
    const out = [`<div class="row banner"><img src="${B}icons/claude.svg" alt=""><div>${ln('Claude Code <span class="d">v2.1.309</span>')}${ln('<span class="d">Sonnet 5.5 · ~/code/website</span>')}</div></div>`];
    for (const b of p.blocks) {
      if (b.t === "user") out.push(gap, ln(`<span class="d">❯</span> ${esc(b.text)}`, "user"));
      if (b.t === "note") out.push(gap, `<div class="ln user note ${b.fresh ? "fresh" : ""}"><span class="d">❯</span> <span class="tag">${esc(b.open)}</span>${esc(b.text)}<span class="tag">&lt;/hc&gt;</span></div>`);
      if (b.t === "say") out.push(gap, `<div class="ln hang"><span>⏺</span><div>${esc(b.text)}</div></div>`);
      if (b.t === "tool") {
        out.push(gap, ln(`${b.ok ? '<span class="g">⏺</span>' : '<span class="d">⏺</span>'} <span class="bold">${b.name}</span>(${esc(b.arg)})`));
        if (b.res) out.push(ln(`  <span class="d">⎿</span>  ${esc(b.res)}`));
        if (b.rows) out.push(diff(b.rows));
      }
      if (b.t === "worked") out.push(gap, ln(`<span class="d">✻ Worked for ${b.time}</span>`));
    }
    if (p.work) { const el = Date.now() - p.work.start; out.push(gap, ln(`<span class="o">${GLYPH[Math.floor(el / 120) % GLYPH.length]} ${p.work.verb}…</span> <span class="d">(${fmt(el)} · esc to interrupt)</span>`)); }
    return `<div class="scroll">${out.join("")}</div><div class="ccin"><div class="rule"></div>${ln(`<span class="d">❯</span> ${esc(p.input)}<span class="caret${p.input ? "" : " blink"}"></span>`)}<div class="rule"></div>${ln('  <span class="r">⏵⏵ bypass permissions on</span>')}</div>`;
  }
  function codex(p) {
    const out = [`<div class="box">${ln('<span class="d">&gt;_</span> <span class="bold">OpenAI Codex</span> <span class="d">(v0.163.0)</span>')}${ln('<span class="d">model:</span> gpt-6.1-sol low')}</div>`];
    for (const b of p.blocks) {
      if (b.t === "user") out.push(gap, ln(`<span class="d">›</span> ${esc(b.text)}`, "user"));
      if (b.t === "note") out.push(gap, `<div class="ln user note ${b.fresh ? "fresh" : ""}"><span class="d">›</span> <span class="tag">${esc(b.open)}</span>${esc(b.text)}<span class="tag">&lt;/hc&gt;</span></div>`);
      if (b.t === "say") out.push(gap, `<div class="ln hang"><span class="d">•</span><div>${esc(b.text)}</div></div>`);
      if (b.t === "ran") { out.push(gap, ln(`<span class="d">•</span> <span class="bold">Ran</span> ${esc(b.cmd)}`)); for (const [i, r] of (b.out ?? []).entries()) out.push(ln(`  <span class="d">${i ? " " : "└"}</span> ${esc(r)}`)); }
    }
    if (p.work) out.push(gap, ln(`<span class="shim">◦ Working</span> <span class="d">(${fmt(Date.now() - p.work.start)} • esc to interrupt)</span>`));
    return `<div class="scroll">${out.join("")}</div>`;
  }
  function tests(p) {
    const out = [ln(`<span class="d">$</span> bun test`), ln('<span class="d">bun test v1.3.4</span>')];
    for (const t of p.lines) out.push(ln(`<span class="g">✓</span> ${esc(t)} <span class="d">[0.${(t.length * 7) % 90 + 10}ms]</span>`));
    if (p.done) out.push(gap, ln('<span class="g"> 95 pass</span>'), ln(' 0 fail'), ln('<span class="d">Ran 95 tests across 5 files. [284.00ms]</span>'));
    return `<div class="scroll">${out.join("")}</div>`;
  }
  const status = s => s === "working" ? spin : `<i class="dot ${s}"></i>`;
  // An agent's logo, or a green prompt for a plain program (as the app's tabs do).
  const pic = p => p.icon ? `<img src="${B}icons/${p.icon}.svg" alt="">` : '<span class="prompt">&gt;_</span>';
  function draw() {
    for (const id of ["t1", "t2", "t3"]) {
      const p = P[id];
      if (!p) continue;
      const pane = root.querySelector(`.pane[data-id="${id}"]`);
      if (!pane) continue;
      const head = `${pic(p)}<span class="pn">${p.name}</span><span class="cwd">${id} · ${p.role}</span>${status(p.status)}`;
      const ph = pane.querySelector(".phead");
      if (ph.dataset.h !== head) { ph.innerHTML = head; ph.dataset.h = head; }
      const term = pane.querySelector(".term");
      const html = id === "t1" ? lead(p) : id === "t2" ? tests(p) : codex(p);
      if (term.dataset.h !== html) { term.innerHTML = html; term.dataset.h = html; const sc = term.querySelector(".scroll"); sc.scrollTop = sc.scrollHeight; }
      const chip = root.querySelector(`.chip[data-id="${id}"] .st`);
      if (chip && chip.dataset.s !== p.status) { chip.innerHTML = status(p.status); chip.dataset.s = p.status; }
    }
  }

  // ---------- moves ----------
  const go = async (r, ms) => { await sleep(ms); if (r !== run) throw "stop"; };
  async function type(r, p, text) { for (const ch of text) { p.input += ch; await go(r, 22 + Math.random() * 30); } await go(r, 250); p.input = ""; }
  async function stream(r, b, text, key = "text") { b[key] = ""; for (const w of text.split(/(\s+)/)) { b[key] += w; await go(r, w.trim() ? 28 + Math.random() * 40 : 0); } }
  function spawn(id, p, cls) {
    P[id] = p;
    const col = root.querySelector(".sc-col");
    col.insertAdjacentHTML("beforeend", `<div class="pane kid ${cls}" data-id="${id}"><div class="phead row"></div><div class="term"></div></div>`);
    col.classList.add("open"); root.querySelector(".lead").classList.add("narrow");
    root.querySelector(".kids").insertAdjacentHTML("beforeend", `<span class="chip kid" data-id="${id}">${pic(p)}<b>${id}</b> ${p.name} <i>${p.role}</i><span class="st"></span></span>`);
  }
  // A note flies from one pane into another's input, then lands there.
  async function fly(r, from, to, label) {
    const a = root.querySelector(`.pane[data-id="${from}"]`).getBoundingClientRect();
    const target = to === "t1" ? root.querySelector('.pane[data-id="t1"] .ccin') : root.querySelector(`.pane[data-id="${to}"] .term`);
    const b = target.getBoundingClientRect(), o = root.getBoundingClientRect(), k = o.width / W;
    const pill = document.createElement("div");
    pill.className = "sc-msg";
    pill.innerHTML = `<span class="mono">&lt;hc from="${label}"&gt;</span>`;
    root.appendChild(pill);
    const x0 = (a.left - o.left + a.width / 2) / k, y0 = (a.top - o.top + 60) / k;
    const x1 = (b.left - o.left + b.width / 2) / k, y1 = (b.top - o.top + 20) / k;
    pill.style.transform = `translate(${x0}px, ${y0}px) translate(-50%, -50%) scale(.6)`;
    pill.getBoundingClientRect();
    pill.style.transform = `translate(${x1}px, ${y1}px) translate(-50%, -50%) scale(1)`;
    pill.classList.add("go");
    await go(r, 900);
    pill.remove();
  }
  const land = (p, open, text) => { for (const b of p.blocks) b.fresh = false; p.blocks.push({ t: "note", open, text, fresh: true }); };
  async function tool(r, p, name, arg, res, rows, wait = 800) { const b = { t: "tool", name, arg }; p.blocks.push(b); await go(r, wait); b.ok = true; b.res = res; if (rows) for (let i = 1; i <= rows.length; i++) { b.rows = rows.slice(0, i); await go(r, 90); } await go(r, 350); }

  async function play(r) {
    if (P.t1?.blocks.length) { root.classList.add("fade"); await go(r, 450); }
    reset(); draw();
    root.classList.remove("fade");
    const t1 = P.t1;
    await go(r, 900);
    await type(r, t1, PROMPT);
    t1.blocks.push({ t: "user", text: PROMPT }); t1.status = "working"; t1.work = { verb: "Herding", start: Date.now() };
    await go(r, 1200);
    await tool(r, t1, "Update", "src/components/SiteLayout.astro", "Updated with 3 additions and 3 removals", [[107, "-", '<a class="lnk" href="/plugins/">Plugins</a>'], [107, "+", '<a class="lnk" href="/plugins/">Marketplace</a>']]);
    await tool(r, t1, "Update", "src/components/SiteTitle.astro", "Updated with 1 addition and 1 removal");
    await tool(r, t1, "Bash", "hc run --bg --name tests bun test", '{"address":"t2","name":"tests","state":"live"}', null, 600);
    spawn("t2", { name: "bun test", role: "tests", icon: null, status: "working", lines: [], done: false }, "kid-t");
    await go(r, 500);
    await tool(r, t1, "Bash", `hc run --bg --name reviewer codex "${REVIEW_TASK}"`, '{"address":"t3","name":"reviewer","state":"live"}', null, 700);
    spawn("t3", { name: "Codex", role: "reviewer", icon: "codex", status: "working", blocks: [{ t: "user", text: REVIEW_TASK }], work: { start: Date.now() } }, "kid-r");
    const t2 = P.t2, t3 = P.t3;
    const say = { t: "say" }; t1.blocks.push(say); await stream(r, say, "Rename's done. The tests and a reviewer are running; I'll wait for both.");
    await tool(r, t1, "Bash", "hc wait --children any", "", null, 300);
    t1.work = { verb: "Waiting on t2, t3", start: Date.now() };
    // the helpers work side by side
    const tb = { t: "say" }; t3.blocks.push(tb); await stream(r, tb, "I'll read the diff and search the site for leftover labels, then send my findings with hc send.");
    for (const line of TESTS.slice(0, 4)) { t2.lines.push(line); await go(r, 220); }
    t3.blocks.push({ t: "ran", cmd: "git diff --stat", out: ["src/components/SiteLayout.astro | 6 +++---", "src/components/SiteTitle.astro  | 2 +-"] });
    for (const line of TESTS.slice(4)) { t2.lines.push(line); await go(r, 220); }
    t2.done = true; t2.status = "done";
    await go(r, 500);
    await fly(r, "t2", "t1", "t2 tests");
    land(t1, "<hc>", "t2 tests exited (exit 0). Last lines: 95 pass · 0 fail · Ran 95 tests across 5 files. Read: hc read t2");
    await go(r, 900);
    t3.blocks.push({ t: "ran", cmd: "rg -n -i 'plugins' src index.html public", out: ['src/pages/plugins.astro:6  title="Herdr plugins: community…"', "+ 41 lines (^t to expand)"] });
    await go(r, 1400);
    t3.blocks.push({ t: "ran", cmd: `hc send t1 '${FOUND.slice(0, 46)}…'`, out: ['{"started":true,"status":"working"}'] });
    t3.work = null; t3.status = "idle";
    await go(r, 400);
    await fly(r, "t3", "t1", "t3 reviewer");
    land(t1, '<hc from="t3 reviewer">', FOUND);
    t1.work = { verb: "Herding", start: Date.now() };
    await go(r, 1400);
    await tool(r, t1, "Update", "src/pages/plugins.astro", "Updated with 1 addition and 1 removal", [[6, "-", 'title="Herdr plugins: community plugin marketplace"'], [6, "+", 'title="Herdr marketplace: community plugins"']]);
    await tool(r, t1, "Bash", 'hc send t3 "fixed the title, take another look"', '{"started":true,"status":"working"}', null, 500);
    await fly(r, "t1", "t3", "t1 lead");
    land(t3, '<hc from="t1 lead">', "fixed the title, take another look");
    t3.status = "working"; t3.work = { start: Date.now() };
    await go(r, 1300);
    t3.blocks.push({ t: "ran", cmd: "git diff src/pages/plugins.astro", out: ['-  title="Herdr plugins: community plugin marketplace"', '+  title="Herdr marketplace: community plugins"'] });
    await go(r, 1000);
    t3.blocks.push({ t: "ran", cmd: "hc send t1 'Looks good. Nothing left.'", out: ['{"started":true,"status":"working"}'] });
    t3.work = null; t3.status = "done";
    await fly(r, "t3", "t1", "t3 reviewer");
    land(t1, '<hc from="t3 reviewer">', "Looks good. Nothing left.");
    await go(r, 900);
    const done = { t: "say" }; t1.blocks.push(done);
    await stream(r, done, 'Done. The nav says "Marketplace" everywhere and the /plugins/ URLs are unchanged. 95 tests pass, and the reviewer found nothing left after one fix.');
    t1.work = null; t1.status = "done";
    t1.blocks.push({ t: "worked", time: "1m 4s" });
  }

  // Plays once, the first time it's seen, and stays on its last frame.
  // Restart plays it again; scrolling never does.
  let visible = false, started = false;
  const start = async () => { const r = ++run; started = true; try { await play(r); } catch (e) { if (e !== "stop") throw e; } };
  root.querySelector(".sc-replay").onclick = start;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !started) start();
  }, { threshold: .25 }).observe(fit);
  reset(); draw();
  setInterval(() => { if (visible && !document.hidden) draw(); }, 60);
}

window.AgentsScene = { mount };
})();
