---
title: "Pi 包"
---

Pi 包（package）把扩展、技能、提示词模板和主题作为一个整体来安装和分发。当某项自定义需要通过 npm 或 git 共享，或多个资源需要捆绑在一起时，就使用包。

包可以是一个普通目录或 npm 包。它可以暴露约定俗成的资源目录，在 `package.json` 的 `pi` 键下声明显式路径，并携带自己的运行时依赖。

## 安装和管理包

从 npm、git 或本地路径安装：

```bash
pi install npm:@example/pi-tools@1.0.0
pi install git:github.com/example/pi-tools@v1
pi install ./local-package
```

`pi list` 显示已配置的包。用 `pi remove <source>` 移除一个包，用 `pi update --extensions` 校准包的安装状态。所有包相关命令与选项参见[命令行](cli#%E5%8C%85%E5%91%BD%E4%BB%A4)。

个人级安装会写入 `~/.pi/agent/settings.json`。加上 `--local` 或 `-l` 可把包声明写入 `.pi/settings.json`。Pi 只在授予项目信任后才读取该文件中的声明。

项目级包只在项目信任判定完成后才会安装和加载。包可以执行扩展代码，也可能包含指示模型运行程序的技能。安装第三方包之前请先审查其源码；授予项目信任之前请先审查项目包声明。

使用 `--extension` 或 `-e` 可在单次运行中试用某个包，而不把它加入设置：

```bash
pi -e npm:@example/pi-tools
```

## 选择来源

| 来源 | 示例 | 行为 |
|---|---|---|
| npm | `npm:@example/pi-tools@1.0.0` | 安装在 Pi 的 npm 目录下 |
| git | `git:github.com/example/pi-tools@v1` | 克隆并校准到所选 ref |
| URL | `https://github.com/example/pi-tools` | 按 git 来源处理 |
| 本地 | `./pi-tools` | 从解析后的路径直接加载，不做复制 |

带版本号的 npm 规格会被锁定。git 标签和 commit 同样会被锁定；包更新只校准检出内容，不会移动已配置的 ref。

相对本地路径以包含它的设置文件为基准解析。文件路径加载一个扩展；目录则遵循常规的包发现规则。

## 创建包

最简单的包使用约定目录：

```text
my-pi-package/
├── package.json
├── extensions/
├── skills/
├── prompts/
└── themes/
```

没有 `pi` 清单时，Pi 会从这些目录中发现 TypeScript 和 JavaScript 扩展、技能目录、Markdown 提示词模板和 JSON 主题。

当资源放在别处或需要筛选时，使用显式清单：

```json
{
  "name": "my-pi-package",
  "keywords": ["pi-package"],
  "pi": {
    "extensions": ["./src/extension.ts"],
    "skills": ["./resources/skills"],
    "prompts": ["./resources/prompts/*.md"],
    "themes": ["./resources/themes/*.json"]
  }
}
```

路径相对于包根目录。数组接受 glob 模式和排除项。当通过 glob 遍历无法发现点前缀或符号链接的资源根目录时，请直接列出它们。

`pi-package` 关键字让 npm 包有资格被 [Pi 包画廊](https://pi.dev/packages)发现。可选的 `pi.image` 与 `pi.video` 字段可为画廊添加预览。

## 声明依赖

把扩展导入的运行时包放进 `dependencies`。Pi 在安装 npm 或 git 来源的包时会一并安装其依赖。

Pi 为扩展和技能提供以下包：

- `@earendil-works/pi-ai`
- `@earendil-works/pi-agent-core`
- `@earendil-works/pi-coding-agent`
- `@earendil-works/pi-tui`
- `typebox`

上述由宿主提供的包请在 `peerDependencies` 中以 `"*"` 范围声明，并且不要打包它们。对于受管理的 npm 包以及用 npm、pnpm 或 Bun 安装的 git 包，Pi 会跳过自动安装对等依赖。本地包不会被安装或修改，因此其依赖树仍由包作者负责。

不要把宿主提供的包列进 `dependencies`。物理副本可能绕过 Pi 在编译后 ESM 中的扩展模块映射，产生重复的类、注册表和初始化工作。Pi 检测到这种清单配置时会报告扩展警告。用作依赖的其他 Pi 包必须包含在发布的 tarball 中，并通过其 `node_modules` 资源路径引用。

已安装的包以相互独立的模块根加载。不要依赖两个包共享同一个依赖实例，也不要依赖一个包去解析另一个包未声明的依赖。

## 选择包资源

设置中的对象形式可以收窄从包加载的资源：

```json
{
  "packages": [
    {
      "source": "npm:@example/pi-tools",
      "extensions": ["extensions/*.ts", "!extensions/legacy.ts"],
      "skills": [],
      "prompts": ["prompts/review.md"]
    }
  ]
}
```

对每种资源类型：

- 省略该属性：加载包所允许的全部资源。
- 使用 `[]`：不加载该类型的任何资源。
- 使用 `!pattern`：排除 glob 匹配项。
- 使用 `+path`：精确包含一个允许的路径。
- 使用 `-path`：精确排除一个路径。

筛选器只能收窄包清单，不会暴露包自身未声明的资源。

运行 `pi config` 可启用或停用已发现的资源以及 pi 的内置扩展。它从个人配置开始；按 Tab 切换作用域，或运行 `pi config --local` 从项目覆盖开始。

## 了解作用域与标识

同一个包可以同时出现在个人设置和项目设置中。项目条目通常会替换个人条目；而在 `autoload: false` 时，项目条目改为在个人包的基础上充当筛选增量。

Pi 用包名标识 npm 包，用不含 ref 的仓库 URL 标识 git 包，用解析后的绝对路径标识本地包。这样可以防止同一个包通过等价声明被加载两次。

打包之前，先用[扩展](extensions)、[技能](skills)、[提示词模板](prompt-templates)和[主题](themes)设计好各个资源。
