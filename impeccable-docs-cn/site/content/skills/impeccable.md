---
tagline: "获取下一步建议，或用大白话描述你想做的设计工作。"
---

## 什么时候用

`/impeccable` 是主命令。有两种用法：

- 单独运行 `/impeccable`，让技能检查项目并推荐下一步做什么。
- 知道想要的结果、但不知道确切命令时，附上一句大白话请求。

以下情况直接找 `/impeccable`：

- **不知道从哪儿开始**。它会检查设置文件是否存在，查看当前项目状态，推荐两三条下一步命令。运行任何东西之前都会先问你。
- **不确定哪条命令合适**。用大白话描述你想要什么，让技能挑对路子。
- **工作横跨多个学科**。"重做这个 hero 区块"牵涉布局、字体、颜色和动效，一条命令吃不下这活。
- **想要自由形态的设计帮助**。没有哪条专项命令能干净对应这项工作时，就用主命令。

如果是新项目，从 `/impeccable init` 开始。它会创建其他所有命令都要读的设置文件。

## 工作原理

大多数 AI 生成的 UI 都以同样的方式翻车：平庸的字体、紫色渐变、卡片网格套卡片网格、满屏玻璃拟态。`/impeccable` 会在模型写代码之前，给它更强有力的设计指令。

项目根目录下的两个文件，决定了这项技能的一切行为：

- **`PRODUCT.md`** 说明这个项目是做什么的：受众、产品目的、语调、反面参照，以及界面属于品牌还是产品。
- **`DESIGN.md`** 说明界面应该长什么样：颜色、字体排印、组件、层级高度，以及设计规则。

每条命令生成之前都会读这两个文件。设置中最关键的选择是**品牌还是产品**：这是一个以印象为产品的营销界面，还是一个用设计帮人完成任务的工具界面？文档把这一选择称为**调性（register）**。示例见 [Design Context](/docs-cn/impeccable/docs/context))。

在项目中首次使用时，`/impeccable` 可能会把你导去 `init`：一段简短的访谈，写出 `PRODUCT.md`，并主动提出帮你写 `DESIGN.md`。之后的命令会直接读这些文件，不再追问。

## 试一试

不带子命令运行，先摸清方向：

```
/impeccable
```

它会掂量项目状态，指出最好的下一步。比如：还没有 `DESIGN.md`，就运行 `document`；你正在编辑的文件里还有未解决的发现，就运行 `polish`。它会等你来选。

或者直接描述你想要什么，它会直接动手：

```
/impeccable redo this hero section
```

```
/impeccable build me a pricing page for a developer tool
```

这两条请求都是故意写得含糊。`/impeccable` 会挑对命令或直接开工，只要设置文件存在就会用上它们。

想在浏览器里做视觉迭代而不是在聊天里：

```
/impeccable live
```

在运行中的开发服务器上点名任意元素，丢一句评论或画上一笔，三个生产级变体就会经 HMR 热插进页面。选中心仪的那个，它就写回源码。

## 把命令 pin 回快捷方式

v3.0 把 18 个独立技能合并成了一个带 23 条命令的 `/impeccable`。如果你怀念某条命令的短形态，把它 pin 回来：

```
/impeccable pin critique
```

从现在起，`/critique` 会直接调用 `/impeccable critique`。它写入的是一个轻量的重定向技能，委托给父级，所以技能更新会自动生效，无需重新 pin。

值得一试的 pin：

- `/impeccable pin polish` 用于最终打磨
- `/impeccable pin audit` 用于确定性的无障碍/性能检查
- `/impeccable pin live` 用于浏览器迭代流程
- `/impeccable pin critique` 用于设计评审

移除用 `/impeccable unpin critique`。pin 以命令名命名的目录形式存放在你的 AI 宿主（harness）技能目录里（`.claude/skills/critique/`、`.cursor/skills/critique/` 等），所以也可以手动删除。

## 常见陷阱

- **把它当风格指南**。它是一个有主见的设计搭档，不是 linter。默认值的存在是为了抬高下限，不是替你做判断。如果你有正当理由反驳（品牌规范、无障碍约束、用户研究），就反驳，并说明原因，技能会配合你。真正让产出变差的，是不加理由地无视它的主张。
- **指望它修现有代码**。`/impeccable` 是为创造而设。要精修，请改用 `/impeccable polish`、`/impeccable distill` 或 `/impeccable critique`。
- **在 `init` 存好上下文之前就开跑**。在全新项目上，它会在半路打断你做访谈——能用，但更慢。先跑 `/impeccable init` 更顺。
- **选错品牌/产品路线**。营销页和应用界面需要不同的默认值。如果 `PRODUCT.md` 里没有 `## Register` 字段（旧版文件），跑一次 `/impeccable init` 补上。
