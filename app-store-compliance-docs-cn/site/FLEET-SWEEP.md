# 应用矩阵扫描与豁免台账

你交付的应用不止一个。应用矩阵扫描（Fleet Sweep）会对其中每一个应用运行守卫（guard），并给你一个统一的发布判定，因此某个被你遗忘的应用里的阻塞项也无法蒙混过关。豁免台账（Waiver Ledger）允许一条经复核确认的误报在证据的支持下暂且搁置，直到你选择的某个日期为止，此后它会自行恢复生效。

## 你能得到什么

- 整个应用矩阵（fleet）只有一个判定。`READY`、`READY_WITH_ACTIONS`、`NOT_CHECKED` 或 `BLOCKED`，以最差的应用为准。退出码分别为 0、3、1 和 2，因此只有真正就绪的应用矩阵才会以 0 退出。
- 不允许静默通过。守卫在每次退出前都会打印一行 `Coverage.`，写明它扫描了哪些内容。部分扫描、你声明了但守卫没有找到的平台、超时、汇总缺失或重复、计数与发现不符、或退出码与它们相互矛盾，结果都是 `NOT_CHECKED`，绝不会是 `READY`。豁免永远无法把一次部分扫描变成通过。
- 所有者操作呈现在同一份报告里。扫描看不到的账号与控制台步骤（协议、隐私问答、数据安全（Data Safety）、在真机上的测试）与代码发现并列展示。设置为 `false` 的步骤，或者完全没有 readiness 列表的应用，会保持待办状态。
- 豁免会到期，且只覆盖单一出现位置。每条豁免都写明应用、发现 ID、严重级别与所在文件，因此绝不会遮蔽同一条规则在新位置或更高严重级别上的再次触发。每条豁免都需要理由、证据、复核人，以及不超过 180 天的到期日。针对同一出现位置的两条豁免会互相抵消。已过期、不完整、重复或失效的豁免会在报告中点名，对应发现随之恢复生效。
- 扫描看不到的发布规则。每个应用声明自己的 `regions` 和 `features`，而每一条适用的、经核实且现行的[裁定登记册（Ruling Register）](RULING-REGISTER.md)要求都会阻塞该应用，直到你对其作出确认为止。
- 一份 GitHub 代码扫描文件。`--scanning-export` 以 GitHub 要求的 SARIF 2.1.0 格式写出各项发现，使其显示在 Security 标签页和 pull request 中。

## 从安装到首次判定

1. 复制应用矩阵模板并列出你的应用。

   ```bash
   cp templates/fleet.example.json fleet.json
   ```

   每个 `name` 必须唯一。`path` 可以使用 `~` 和环境变量。`platforms` 列出你交付的平台（`ios`、`android`、`web`），扫描会检查守卫是否真的找到了其中每一个。`readiness` 把每个账号步骤映射为 `true` 或 `false`。如果省略它，该应用会把它报告为一项未完成的所有者操作。
2. 运行扫描。

   ```bash
   python3 scripts/fleet-sweep.py fleet.json
   ```

3. 阅读底部的判定行。退出码 0 表示就绪，3 表示就绪但有待办操作，2 表示被阻塞，1 表示未检查或输入有误。

## 豁免一项经复核的误报

```bash
cp templates/waivers.example.json waivers.json
python3 scripts/fleet-sweep.py fleet.json --waivers waivers.json
```

每条豁免都从应用矩阵文件复制 `app` 名称，并按照守卫打印的原样填写 `finding_id`、`severity` 和 `file`。只有当守卫打印某条发现时未附带文件时，才可以省略 `file`。豁免绝不会作用于另一个应用，而匹配不到任何内容的豁免会被报告出来，以便你将其淘汰。

## 供 CI 使用的输出

```bash
python3 scripts/fleet-sweep.py fleet.json --json fleet-result.json --scanning-export fleet.sarif
```

使用 `github/codeql-action/upload-sarif` 上传 `fleet.sarif`，即可在 code scanning 中查看各项发现。路径中带有应用名称；已豁免的发现仍保留在文件中，并连同证据一起标记为已抑制（suppressed）；而一个未经检查的应用会把整次运行标记为不成功。JSON 中保存每个应用、它的各项发现、连同证据的已豁免条目、豁免问题，以及所有者操作。

## 它不做什么

它不会改动任何一条守卫规则。什么算一条发现由守卫决定。Fleet Sweep 只负责汇总、应用你签署过的豁免，并拒绝把任何未经它确认已检查的内容称为就绪。
