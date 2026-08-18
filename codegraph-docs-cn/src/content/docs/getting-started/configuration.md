---
title: 配置
description: CodeGraph 默认零配置，仅一个可选的 codegraph.json，用于自定义文件扩展名、排除已跟踪目录、索引被 gitignore 的源码以及索引嵌套 git 仓库。
---

几乎没有——CodeGraph **默认零配置**，起步阶段没有任何需要编写或保持同步的东西。语言支持依据文件扩展名自动启用，无需按语言单独接入。唯一的可选文件是 `codegraph.json`，它覆盖四种场景：[自定义文件扩展名](#自定义文件扩展名)、[排除已跟踪目录](#排除已跟踪目录)、[索引被 gitignore 的源码](#索引被-gitignore-的源码)以及[索引嵌套 git 仓库](#索引嵌套-git-仓库)。

## 开箱即跳过的内容

- **依赖、构建和缓存目录**——`node_modules`、`vendor`、`dist`、`build`、`target`、`.venv`、`Pods`、`.next` 之类，覆盖每一个[受支持的技术栈](/reference/languages/)——这样图谱里装的是你的代码，而不是第三方噪声。即便没有 `.gitignore` 也同样生效。
- **`.gitignore` 中列出的所有内容**——在 git 仓库中经由 git 生效，在非 git 项目中则直接读取 `.gitignore`（根目录与嵌套目录皆可）。
- **大于 1 MB 的文件**——生成产物、压缩混淆过的 JS、内嵌的第三方大文件。

## 排除或纳入更多

还想排除别的什么，就加进 `.gitignore`。想把某个默认排除的目录重新**纳入**（比如你就是想让某个内嵌依赖被索引），加一条取反规则——`!vendor/`。

默认规则是统一施加的，所以把依赖或构建目录提交进仓库并不会强行把它塞进图谱——`.gitignore` 取反规则才是显式的纳入开关。

## 排除已跟踪目录

`.gitignore` 只对 git **尚未跟踪**的文件生效——它无法丢掉你已经提交过的目录。因此，已提交进仓库的内嵌主题、SDK 或资源包（比如放在 `static/` 下的 Metronic 管理后台主题，动辄几百个 `.js` 文件）没法用这种方式排除。这类目录请列在 `codegraph.json` 的 `exclude` 下：

```json
{
  "exclude": ["static/", "**/vendor/**"]
}
```

每个条目都是 gitignore 风格的模式，按相对项目根目录的路径匹配，并在 CodeGraph 查看文件的所有场合一致生效——全量索引、增量 `sync` 以及文件监听。它对已跟踪的文件同样适用（这正是它的意义所在），且优先级高于其他一切规则，因此适合用来处理那种撑大了图谱、但并非你真正代码的大型已提交依赖。（它与 [`includeIgnored`](#索引嵌套-git-仓库) 正好相反——后者把被 gitignore 的目录重新*纳入*。）

新增或修改 `exclude` 后，请重新索引（`codegraph index`）。

## 索引被 gitignore 的源码

`.gitignore` 会把文件挡在索引之外——这通常正是你想要的，除非被 gitignore 的文件是货真价实的第一方源码。这个功能为以下场景而生：项目同时由 **Git 之外的另一套 VCS（SVN、Perforce 等）** 管理，一部分源码提交在那套 VCS 里，并刻意列进 `.gitignore`，永远不进 Git。这些源码依然是你的，你也希望它们出现在图谱里，但 git 从不列出它们，CodeGraph 也就无从得见。（`includeIgnored` 帮不上忙——它只会复活被 gitignore 目录*内嵌的 git 仓库*，救不了普通源码。）

把这些路径列在 `codegraph.json` 的 `include` 下，强制纳入：

```json
{
  "include": ["Tools/", "Local/typescript/"]
}
```

每个条目都是 gitignore 风格的模式，按相对项目根目录的路径匹配（`"Tools/"` 这样的目录、`"Tools/**"` 这样的递归 glob、单个文件，都可以）。CodeGraph 会直接从磁盘发现匹配的文件——越过 `.gitignore`——并在它查看文件的所有场合为其建立索引：全量索引、增量 `sync` 以及文件监听。

几点须知：

- 显式的 [`exclude`](#排除已跟踪目录) 仍然优先——同一路径两边都列，结果是不被索引。
- `node_modules`、`dist`、`.git` 这类内置跳过项永远不会被重新纳入，即使 `include` 模式匹配到它们内部也一样。
- 它与 `exclude`（把已跟踪文件*排除*在外）方向相反；它面向的是 git 本身从不跟踪的源码。

新增或修改 `include` 后，请重新索引（`codegraph index`）。

## 自定义文件扩展名

如果你的项目为某个[受支持的语言](/reference/languages/)使用了非标准扩展名——比如 Lua 用 `.dota_lua`、PHP 用 `.tpl`——这些文件默认会被跳过，因为扩展名不在 CodeGraph 的识别范围内。在项目根目录放一个可选的 `codegraph.json` 来建立映射：

```json
{
  "extensions": {
    ".dota_lua": "lua",
    ".tpl": "php"
  }
}
```

每个值都是一个受支持语言的 id。这些映射叠加在内置默认值之上，冲突时以这些映射为准，因此你也可以改写内置映射（例如 `".h": "cpp"`）。把文件提交进仓库，即可与团队共享这套映射。

语言名写错或文件格式非法时，CodeGraph 会给出警告并跳过——绝不会让索引中断——而没有 `codegraph.json` 的项目行为与从前完全一致。新增或修改映射后，请重新索引（`codegraph index`）。

## 索引嵌套 git 仓库

CodeGraph 尊重你的 `.gitignore`，所以被 gitignore 的目录不会进入图谱——**连同嵌套在其中的任何 git 仓库**。如果你把克隆来的参考项目、内嵌副本或一堆不相干的仓库放在某个被 gitignore 的目录里（比如 `resource/`、`.repos/` 或 `examples/`），CodeGraph 会原封不动：不会走进去、不会发现内嵌仓库、更不会为其建立索引。

反过来，如果你维护的是一个**由独立克隆组成的“超级仓库”**——一个工作区，它自己的 `.gitignore` 把各个子仓库列了进去以保持 `git status` 干净，而你确实希望每个子仓库都进入同一张图谱——那就用 `includeIgnored` 把这些目录重新纳入：

```json
{
  "includeIgnored": ["packages/", "services/"]
}
```

每个条目都是一个 gitignore 风格的模式，指名一个被 gitignore 的目录，其中的嵌套 git 仓库依然要被索引。CodeGraph 会深入你列出的目录，并按每个内嵌仓库自己的 `git ls-files` 为其建立索引，因此每个子仓库自身的 `.gitignore` 依然得到尊重。未列出的目录保持排除。

几点须知：

- **未被跟踪的**嵌套仓库（即没有被你 gitignore 的）会自动索引——`includeIgnored` 只服务于被你 `.gitignore` 排除的那些。
- `node_modules` 这类内置跳过项永远不会被重新纳入，即便在已选择纳入的目录里也一样。
- 不采用这种布局的项目根本不需要 `codegraph.json`。

新增或修改 `includeIgnored` 后，请重新索引（`codegraph index`）。

## 数据存放位置

每个项目的数据存放在项目根目录下的 `.codegraph/` 目录中，里面是 SQLite 数据库（`codegraph.db`）。任何数据都不会离开你的机器。
