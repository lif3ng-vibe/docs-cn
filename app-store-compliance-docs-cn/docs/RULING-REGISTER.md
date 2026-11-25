# 裁决登记册（Ruling Register）

代码扫描无法告诉你：印度要求把你的借贷应用列入 RBI 名单，澳大利亚要求把 16 岁以下用户挡在你的社交信息流之外，欧盟要求提交一份 24 小时漏洞报告。裁决登记册（Ruling Register）把这些发布要求保存为数据，说明每一条在今天的约束力有多强、又该如何证明，这样，"没有发现"就永远不会被误当成"通过"。

## 你能得到什么

- 每条要求的法律效力。`in_force`、`in_force_later`（附开始生效日期）、`store_policy`、`proposed` 或 `guidance`。只有经核实、且今日仍生效的法律或商店政策才能阻断一次发布；提案中的法律或指导说明则永远不能。
- 如何证明。`automated`（一次检查就能看到）、`owner_attested`（只有你自己能确认）或 `mixed`（两者兼有）。由所有者声明（owner-attested）的要求需要你签署一份声明（attestation），因为在这里，扫描一无所获证明不了任何事。
- 每条前提都配有引文来源。每个来源都带有 URL、核查日期、逐字引文，以及 `supports` 字段，说明它证明的是义务本身、开始日期，还是两者都证明。只有当引文来源覆盖了义务，并且（如果该规则设有开始日期）也覆盖了开始日期，规则才会阻断。无法重新读取的来源会被标记为 `unverified`（未经验证）并注明原因；缺少引文前提的规则会被列为"确认来源"，且永远不会阻断。
- 只在应当适用的地方生效。每个条目都写明其司法辖区（ISO 国家代码、`EU` 或 `GLOBAL`）、可选的商店，以及它覆盖的应用功能（`lending`、`crypto`、`medical`、`generative_ai`、`personal_data`、`subscriptions`、`social`、`marketplace`、`children`）。不带功能的规则适用于该地区的每一个应用。
- 内置于 Fleet Sweep。每个应用都要声明自己的 `platforms`、`regions` 和 `features`，漏掉任何一个都是错误，因为未知的作用域会悄悄丢掉规则。任何经核实、已生效、适用于该应用且没有有效声明的规则，都会把该应用标记为 `BLOCKED`。

## 从安装到首次回答

1. 询问一个应用适用哪些要求。

   ```bash
   python3 scripts/ruling-register.py due --regions DE,AU,US --stores apple --features social,personal_data
   ```

   每一行都标明是 `BLOCKS`、`WATCH` 还是 `CONFIRM-SOURCE`，以及是否需要你的声明。
2. 在你的 fleet 文件中，为应用加上 `regions`、`features`，并在核查过某条要求之后，加上对应的声明。

   ```json
   "attestations": {
     "RR-AU-APP1-PRIVACY-POLICY": {
       "attested_by": "Your Name",
       "attested_on": "2026-11-05",
       "outcome": "compliant",
       "revision": 1,
       "covers": ["auto-1", "owner-2"],
       "regions": ["AU"],
       "evidence": "Policy linked in app and listing, reviewed against APP 1 in the October release notes"
     }
   }
   ```

   声明只有同时满足以下条件才会被接受：`outcome` 为 `compliant`；`revision` 与该规则当前的修订号（revision）一致；`covers` 列出该规则全部证明项的 id（包括 automated 类，并将检查结果作为证据）；`regions` 列出该规则波及的你的全部国家。声明的日期不能是未来日期，且一年后过期。某条规则发生变化时要提高它的 `revision`，此时它的每一条声明都必须重新作出。
3. 运行 Fleet Sweep。默认会读取登记册；传入 `--no-register` 可将其排除。

## 新增或修改一条要求

1. 编辑 `data/ruling-register.json`。新规则要分配新的 `RR-` 前缀 id 和 `revision` 1。绝不要把一个 id 复用给另一条规则；现有规则的含义发生变化时，要提高 `revision`。
2. 逐字引用一手来源，并记录你读取它的日期。绝不要粘贴你从未打开过的 URL。
3. 运行 `python3 scripts/ruling-register.py validate`，并修复每一个错误。
4. 要把登记册交给其他工具使用，运行 `python3 scripts/ruling-register.py export`。它会写出 `exports/ruling-register-v<version>.json`，并盖上 commit 与日期的戳记。

## 结果如何衡量

`python3 scripts/eval-scorecard.py` 会对照 `evals/gold-cases.json` 中的黄金场景，为 Fleet Sweep、Waiver Ledger 和裁决登记册评分。每个用例都会检查裁决结果、退出码、fleet 级与应用级裁决是否一致，以及哪些规则 id 必须出现、哪些必须不出现，因此即使一次改动保住了裁决结果却丢掉了理由，也仍然会失败。它会按功能打印误通过（把不安全的东西称为 ready）与误阻断的数量，并且只要出现任何遗漏或任何未知类别就判为失败。误通过的数量必须保持为零。

## 第一批条目

第一批 14 个条目来自对本实战手册的一次对抗性差距审查。它们包括：Google Play 在印度的借贷要求与欧盟的加密资产要求、美国的医疗器械软件与 DOJ 数据规则、中国的人工智能备案与标注规则、印度尼西亚的运营商注册、欧盟的撤回功能、DSA 的通知与行动（notice and action）与 CRA 报告义务、越南的账户认证要求，以及澳大利亚的隐私政策、16 岁以下社交媒体与《儿童在线隐私准则》（Children's Online Privacy Code）规则。所有来源均于 2026 年 11 月 5 日打开核查。欧盟撤回功能条目被标记为未经验证，因为当天 EUR-Lex 拒绝了自动读取。澳大利亚的最低年龄义务引用自该法案原文，但该法案通过部长级文件设定其开始日期，而承载该日期的 eSafety 页面当天未能加载，因此这条规则被标记为"确认来源"，而不是直接阻断。
