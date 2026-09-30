// github.com:443 不可达时的 git push 替代通道：GitHub Git Data API。
// 用法：node scripts/push-via-api.cjs <repo> <diffBase本地对象> <parent远端提交> [force]
// 例：node scripts/push-via-api.cjs lif3ng-vibe/docs-cn <本地基> <远端master> force
// 原理：blobs(并发6) → tree(base=远端父树) → commit → PATCH ref heads/master。
// 前提：gh auth token 可用；api.github.com 可达（github.com 主站 443 不通也可用）。
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');

const REPO = process.argv[2];
const DIFF_BASE = process.argv[3];
const PARENT = process.argv[4];
const FORCE = process.argv[5] === 'force';
const HEAD = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
const MSG = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
const BASE_TREE = execSync('gh api repos/' + REPO + '/commits/' + PARENT + ' --jq .commit.tree.sha', { encoding: 'utf8' }).trim();
const raw = execSync('git diff --raw ' + DIFF_BASE + ' HEAD', { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const entries = [];
for (const line of raw.split('\n')) {
  if (!line.trim()) continue;
  const parts = line.split('\t');
  const meta = parts[0].split(' ');
  if (meta[1] === '000000') continue;
  entries.push({ path: parts[1], mode: meta[1] });
}
console.log(REPO + ' 变更文件: ' + entries.length + ' force=' + FORCE);
function gh(args, input) {
  return execFileSync('gh', ['api'].concat(args.split(' ')), { encoding: 'utf8', input: input, maxBuffer: 64 * 1024 * 1024 });
}
let done = 0;
const treeEntries = [];
const queue = entries.slice();
function worker() {
  while (queue.length) {
    const e = queue.shift();
    const blob = fs.readFileSync(e.path);
    const res = gh('repos/' + REPO + '/git/blobs --input -', JSON.stringify({ content: blob.toString('base64'), encoding: 'base64' }));
    treeEntries.push({ path: e.path, mode: e.mode, type: 'blob', sha: JSON.parse(res).sha });
    done++;
    if (done % 80 === 0) console.log('blobs ' + done + '/' + entries.length);
  }
}
const workers = [];
for (let i = 0; i < 6; i++) workers.push(new Promise(function (res) { worker(); res(); }));
Promise.all(workers).then(function () {
  const tree = JSON.parse(gh('repos/' + REPO + '/git/trees --input -', JSON.stringify({ base_tree: BASE_TREE, tree: treeEntries }))).sha;
  const commit = JSON.parse(gh('repos/' + REPO + '/git/commits --input -', JSON.stringify({ message: MSG, tree: tree, parents: [PARENT] }))).sha;
  gh('repos/' + REPO + '/git/refs/heads/master -X PATCH --input -', JSON.stringify({ sha: commit, force: FORCE }));
  console.log('完成: commit ' + commit.slice(0, 10) + (FORCE ? ' 已强推' : ' 已快进') + '到 master');
}).catch(function (err) {
  console.error('FAILED: ' + err.message);
  process.exit(1);
});
