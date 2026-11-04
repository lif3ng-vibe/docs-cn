# 术语表（Worktrunk 中文镜像）

本表约定 Worktrunk（`wt`）文档中文镜像的统一翻译口径。翻译以意译为主，按中文技术写作习惯重组句式，不做逐词硬译；专业术语首次出现时附英文原词，写作「钩子（hook）」这样的形式，后文可直接使用中文。产品名、工具名、命令名（含子命令与选项）、环境变量名、hook 名与模板变量名一律保留原文不译，代码块与命令示例中的内容原样保留。下表为不译名单，翻译时须逐字保留，包括大小写、连字符与前缀符号（`--`、`#` 等）。

## 不译名单

| 原词 | 理由 |
| --- | --- |
| `worktree` | Git 原生概念，直接对应 `git worktree` 命令族；中文社区无统一译名，「工作树」易与 working tree 混淆，保留原文最不易误读 |
| `wt` 及全部 wt 子命令（如 `wt switch`） | 工具的可执行命令，读者需逐字照抄到 shell 中运行，任何改写都会使命令失效 |
| `git` / `GitHub` / `PR` / `MR` / `CI` | 工具与平台名及业界通行缩写，中文技术语境直接使用原文，无通行译名 |
| `shell` / `zsh` / `bash` / `fish` / `Nushell` | shell 本身及各具体实现的专有名，无中文译名 |
| `agent` | 本文档语境指 AI 编码代理（如 Claude Code 等），中文社区惯用原词；译作「智能体」或「代理」均带歧义 |
| `statusline` | 终端复用器与编辑器生态的既定术语，zellij、tmux 等工具官方文档均用原词 |
| `zellij` / `tmux` / `vim` / `VS Code` / `Demoshell` / `SignPath` / `LaunchAgent` / `systemd` | 产品名、工具名与操作系统机制名，属专有名词 |
| `post-start` / `post-switch` / `post-commit` / `post-merge` / `post-remove` / `pre-commit` / `pre-merge` | hook 名，作为配置键与文件/目录名按字面匹配，改名即失效；行文中可写作「post-start 钩子（hook）」 |
| `BRANCH` / `SESSION` / `WORKTREE` / `#branch` / `#worktree` / `#source` / `#source_branch` | 模板变量名，渲染时按字面做字符串替换，翻译后占位符不会被展开 |
| `wt_*`、`WT_*` 环境变量 | 环境变量名区分大小写，程序按字面读取，不可翻译 |
| `--full` / `--json` / `--porcelain` 等选项名 | CLI 选项名，须与 `--help` 输出及实际用法逐字一致；含义可在行文中解释（如 `--porcelain` 即机器可读输出） |

## 术语对照

| 英文 | 中文 |
| --- | --- |
| worktree | worktree（不译） |
| branch | 分支 |
| repository / repo | 仓库 |
| commit | 提交 |
| commit message | 提交信息 |
| default branch | 默认分支 |
| integration branch | 集成分支 |
| remote | 远程 |
| upstream | 上游 |
| checkout | 检出 |
| switch | 切换 |
| merge | 合并（动词/概念，命令名不译） |
| rebase | rebase（不译） |
| squash | squash（不译） |
| fast-forward | fast-forward（不译） |
| stash | stash（不译） |
| stage / staging | 暂存 |
| interactive picker | 交互式选择器 |
| shell integration | Shell 集成 |
| hook | 钩子 |
| hook types | 钩子类型 |
| template | 模板 |
| template variable | 模板变量 |
| template filter | 模板过滤器 |
| template function | 模板函数 |
| template expression | 模板表达式 |
| alias | 别名 |
| subcommand | 子命令 |
| CI status | CI 状态 |
| PR checkout | PR 检出 |
| LLM commit messages | LLM 提交信息 |
| append to the prompt | 追加到提示词 |
| forge | forge（不译） |
| forge platform | forge 平台 |
| marker file | 标记文件 |
| logs | 日志 |
| state | 状态 |
| cache | 缓存 |
| worktree path template | worktree 路径模板 |
| detached HEAD | 脱离 HEAD（detached HEAD） |
| interactive prompts | 交互式提问 |
