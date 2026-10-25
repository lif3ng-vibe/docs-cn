#!/usr/bin/env node
// 一次性：把各 chunk 里的 UI 文案替换为中文（精确字符串替换，漏配会报 MISS）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const A = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site', '_astro');

const jobs = [
  ['Changelog.astro_astro_type_script_index_0_lang.BbBRPwCT.js', [
    ['Choose a component', '选择一个组件'],
    ['All versions', '全部版本'],
    ['Collapse visible notes', '收起当前条目'],
    ['Expand visible notes', '展开当前条目'],
    ['Release link copied', '版本链接已复制'],
    ['Command copied', '命令已复制'],
    ['Copy was blocked. Select and copy the command or use the release link.', '复制被浏览器拦截。请手动选中命令复制，或使用版本链接。'],
    // Extension/CLI/Skill 是版本条目的分类标签（带尾随空格），单独处理见下
  ]],
  ['Doc.astro_astro_type_script_index_0_lang.CtelqPQc.js', [
    ['Move back to In progress', '退回「进行中」'],
    ['Mark task complete', '把任务标记为完成'],
    ['Review the homepage is done.', '确认：首页已完成。'],
    ['Review the homepage is in progress.', '确认：首页进行中。'],
    ['Put it back in the sleeve', '放回封套'],
    ['Make it mine', '改成我的风格'],
    ['Sunday side A. Has a nice ring to it.', '周日 A 面。听着不错。'],
    ['Folded ring', '折叠圆环'],
    ['Sphere', '球体'],
    ['Wave', '波浪'],
    ['Try with sample data', '用示例数据试试'],
    ['Reset example', '重置示例'],
    ['Example reset.', '示例已重置。'],
    ['Sample report loaded. Thursday had the most orders: 27.', '示例报告已加载。周四订单最多：27 单。'],
  ]],
  ['Doc.astro_astro_type_script_index_2_lang.DdcAfEke.js', [
    ['Timid design → Bold, confident design', '怯懦的设计 → 大胆、自信的设计'],
  ]],
  ['gallery.astro_astro_type_script_index_0_lang.BI2mr3tc.js', [
    ['Same prompt and model. Image generation availability varied between runs.', '相同的提示词与模型。图像生成能力在多次运行间存在差异。'],
    ['disabled in both', '两边都不可用'],
    ['An image model draws the options. You pick one. The coding model builds it.', '图像模型画出备选方案，你挑一张，编码模型把它建出来。'],
    ['Link to this design copied.', '该设计的链接已复制。'],
    ['Copy the link from your address bar to share this design.', '从地址栏复制链接即可分享这个设计。'],
    ['Website built from it', '由它构建的网页'],
    ['Design', '设计稿'],
    ['Website', '网页'],
  ]],
  ['index.astro_astro_type_script_index_0_lang.DmWYqvFK.js', [
    ['Motion off', '动效已关闭'],
    ['Pause examples', '暂停示例'],
    ['Play examples', '播放示例'],
    ['Motion is off to match your reduced-motion preference.', '已按你的「减少动态效果」偏好关闭动效。'],
    ['Examples repeat so you can inspect the movement.', '示例循环播放，方便你观察运动细节。'],
    ['Illustrative loops, paused.', '示意循环，已暂停。'],
    ['Illustrative loops, playing.', '示意循环，播放中。'],
  ]],
  ['index.astro_astro_type_script_index_1_lang.CgmVvbhy.js', [
    ['Example updated', '示例已更新'],
  ]],
  ['SlopPatternPreview.astro_astro_type_script_index_0_lang.BY9xxFf9.js', [
    ['Detector on', '检测器已开启'],
    ['Detector off', '检测器已关闭'],
  ]],
  ['WorldsRoll.astro_astro_type_script_index_0_lang.CBcqumjn.js', [
    ['Loading design directions…', '正在抽取设计方向…'],
    ['roll dealt no worlds', '本次 roll 未抽到任何世界'],
  ]],
];

let total = 0;
let miss = 0;
for (const [file, pairs] of jobs) {
  const p = path.join(A, file);
  let t = fs.readFileSync(p, 'utf8');
  for (const [a, b] of pairs) {
    if (t.includes(a)) { t = t.split(a).join(b); total++; }
    else { console.log(`MISS ${file}: ${a.slice(0, 50)}`); miss++; }
  }
  fs.writeFileSync(p, t);
}
console.log(`done: ${total} replaced, ${miss} missed`);
