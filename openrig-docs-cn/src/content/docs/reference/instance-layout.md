---
title: "OpenRig 实例布局"
---

一个 OpenRig 实例把它的托管状态保存在单一配置的 `$OPENRIG_HOME` 之下。`rig daemon start` 与直接启动守护进程的首次启动，都会在数据库打开或监听器绑定之前调和同一套增量式布局。

```text
$OPENRIG_HOME/
  config.json             # typed instance settings; created as an empty object
  state/                  # runtime-owned durable state
  context/                # addressable context library (`context.root`)
    system/
      system-world.yaml   # selected baseline context + skill identities
  skills/                 # managed skill catalog (`skills.root`)
  workspace/              # project work tree (`workspace.root`)
    SPEC.md                # project intent
    project.yaml           # project context and skill selection
    workspace.yaml         # project-location catalog
    .gitignore
    missions/
    exhaust/
  specs/                  # canonical instance spec library
  topology/               # instance, rig, pod, and seat continuity tree
  plugins/                # installed OpenRig plugins
  run/                    # process coordination files
  logs/                   # daemon and operation logs
  transcripts/            # durable per-seat terminal transcripts
  backups/                # operator-created recovery artifacts
  secrets/                # local connector and host secrets
```

初始化器只创建缺失的托管条目。它绝不覆盖既有文件，并在首次写入之前检查每一条托管路径。类型不对的路径按其确切位置上报；无关的用户自有内容被保留。对已收敛实例的第二次运行不写入任何东西。

workspace 子树由[项目工作区契约（Project Workspace Contract）](/reference/project-workspace/)负责。实例初始化器调用那个所有者，而不是自带另一份文件字节副本。`skills/` 与 `topology/` 被创建为空根；其内容分别由目录（catalog）工作流与拓扑工作流负责。

## 上下文库设置

可寻址上下文库有一个带类型的设置与一个环境变量覆盖：

| 呈现面 | 值 |
| --- | --- |
| 配置键 | `context.root` |
| 环境变量 | `OPENRIG_CONTEXT_ROOT` |
| 默认值 | `$OPENRIG_HOME/context` |
| 解析后属性 | `contextRoot` |

已移除的 `context.packs_root`、`context.packsRoot` 与 `OPENRIG_CONTEXT_PACKS_ROOT` 拼写会被拒绝，并提示改用 `context.root`；它们不是兼容别名。Bundle 安装与 `rig context add` 解析的都是同一个配置好的落地根。

## System World

System World 是在拓扑/角色与 Project World 素材之前选定的实例级基线。它的带版本清单包含有序的上下文包（context pack）引用加上托管的 skill 标识；它绝不包含权威的 skill 字节。默认清单以增量方式安装在 `$OPENRIG_HOME/context/system/system-world.yaml`。

| 呈现面 | 值 |
| --- | --- |
| 配置键 | `context.system_world` |
| 环境变量 | `OPENRIG_CONTEXT_SYSTEM_WORLD` |
| 默认值 | `default` |
| 解析后属性 | `systemWorld` |

`default` 选择已安装的清单；一个安全的相对或绝对路径选择显式替换；`disabled` 是显式的关闭状态。缺失或畸形的选择会失败；缺席绝不会被推断为禁用。`rig context work-install --json` 报告生效状态、来源、清单、上下文选择器与 skill。带 `--runtime` 时，其托管 skill 装载随后把 System World、拓扑与 Project World 选择器连同来源信息组合起来。

对 0.5.9 之前的 home，把 `openrig-upgrade` skill 的 `migrate-telemetry-state-0.5.9.mjs` 辅助脚本当作一次智能体操作迁移（Agent-Operated Migration）来使用。其顺序是：plan → `--apply-state` → 单独激活目标运行时 → 配对的新根（new-root）采样（新于任何有界 legacy 尾部）→ `--verify` → 非破坏性的收尾器 `--apply-library`。激活期间，运行时读取器以规范优先、legacy 兜底，且自定义上下文库根保持稳定。验证绑定确切的已接受尾部字节；收尾会重新校验它们、以不覆盖方式复制，并最后切换配置。它绝不移除 legacy 遥测或库。`--rollback` 只回滚辅助脚本自己的配置、System World、空目录与已复制库效果。若写入者/读取者收敛、恢复的 legacy 写入、字节漂移、冲突或任何迁移自有路径无法被证明，辅助脚本必须停下而不是宣称成功。`--help` 打印阶段语法而不做盘点；不带阶段标志就是有意的只读 plan，未知选项在 plan 或变更之前以非零退出。

## 既有的 spec 库

创建 `$OPENRIG_HOME/specs` 不会迁移既有的发布初期（launch-era）spec。升级过的安装可能仍有一个单独的 legacy spec 库，运行时为兼容而读取它。把这种双 home 状态当作一个显式限制：用现行 spec 库命令来确定某个 spec 由哪里供给，不要仅仅因为规范目录存在就推断已经收敛。
