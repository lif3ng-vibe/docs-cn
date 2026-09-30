const fs = require('fs');
const f = 'scripts/push-via-api.cjs';
let s = fs.readFileSync(f, 'utf8');
const oldLine = "  return execFileSync('gh', ['api', args], { encoding: 'utf8', input: input, maxBuffer: 64 * 1024 * 1024 });";
const newLine = "  return execFileSync('gh', ['api'].concat(args.split(' ')), { encoding: 'utf8', input: input, maxBuffer: 64 * 1024 * 1024 });";
if (s.includes(oldLine)) {
  s = s.split(oldLine).join(newLine);
  fs.writeFileSync(f, s);
  console.log('gh 参数分词已修');
} else {
  console.log('未匹配');
}
