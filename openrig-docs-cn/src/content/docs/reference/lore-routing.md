---
title: "Lore 路由——按地址取用的位置知识"
---

Lore 是一个持久位置在干活过程中挣来的知识。它留在该位置的席位树之下，当别的工件需要它时按地址组合进来。价值在于内容与学到它之处的结合；把字节复制进共享库会摧毁这一区分。

本约定定义条目形状、稳定地址、组合授权（composition grant），以及 lore 派生内容离开位置边界的唯一路径。它不新增任何解析器、来源种类、策展人角色或会话记录挖掘流程。

## 归宿、所有权与稳定地址

每个条目是拥有它的席位 `lore/` 目录下的一个 Markdown 文件：

```text
<topology-root>/rigs/<rig>/seats/<seat>/lore/<stable-slug>.md
```

从配置解析 `topology.root`；绝不硬编码这个根。拥有席位是唯一的直接作者。它以持久位置的身份写作，而不是以某个特定占用者或前任的身份。

文件名描述情境或触发器，绝不包含阶段、日期、占用者世代或版本。因此它的地址是稳定的：

```text
seat:lore/<stable-slug>.md
seat:lore/<stable-slug>.md#situation
```

阶段变更只编辑 frontmatter 与 `date`；它绝不重命名文件。既有引用在变更之后必须仍能解析。

## 必需的元数据

每个 lore 条目从诞生起就带有这些字段：

| 字段 | 含义 |
|---|---|
| `taxonomy` | 精确为 `lore`。这是机器可读的隐私类别。 |
| `stage` | 当前认识成熟度。合法取值只来自 [`knowledge-maturity.md`，"两种编码，一架梯子"](/reference/knowledge-maturity/#两种编码同一阶梯)；不要在此复制或扩展那份词汇表。 |
| `method` | 拥有位置凭什么能知道这一论断：观察、比较、事故或来源方法。 |
| `date` | 当前阶段决定或实质性修订的 UTC 日期时间。`stage` 变化时更新它。 |
| `position` | 规范的拥有席位地址 `<seat>@<rig>`。它命名的是位置，绝不是占用者。 |

`taxonomy: lore` 在每个条目的 frontmatter 中、以及在任何承载清单并为它服务的 lore pack 上都是必需的。拼错并不等价，任何提取该类别的机器 pin 都必须因此失败。

## 条目模板

用这个模板开始一个情境形状的条目。替换每一个占位符；`wip` 是起始标签，权威词汇表仍是上文引用的那份。

```markdown
---
taxonomy: lore
stage: wip
method: "<how this position could know>"
date: "YYYY-MM-DDTHH:MM:SSZ"
position: "<seat>@<rig>"
---

# <Short situation or trigger>

## Situation

**Position:** `<seat>@<rig>`

**Moment.** <What is happening when this knowledge becomes useful?>

**Reflex.** <What tempting response is likely to be wrong?>

**Instead.** <What should the reader do?>

**Because.** <What evidence or failure made the difference?>
```

当一个事实确实是可迁移单元时，也可以改用 `## Fact`。任何打算作为节级附件的 H2 都重复规范的 `Position:` 行，这样当解析器只返回该节时，署名仍然可见。

## 寻址与组合

Lore 使用既有的 `seat:` 语法与显式的 rig-加-席位读取授权。地址说明读哪个文件或节；授权说明该地址相对于谁的席位树。没有授权就是没有读取。

对安装（install）而言，组合完整条目地址（`seat:lore/<slug>.md`），让它的 frontmatter、taxonomy、stage、method、date 与 position 随内容一起走。一个组合出的作品必须可见地保留：

- 解析器提供的 `seat` 来源标签；
- 来自条目字节的拥有 `position`；以及
- 来自条目与 lore pack 元数据双方的 `taxonomy: lore` 类别。

把一个席位的 lore 供入另一个席位的安装，只有当调用方有意授权拥有席位树时才被允许。产生的作品仍然署名给那个所有者；接收席位不继承其身份。

附件点只是一个与拥有位置配对的指针：

```yaml
lore:
  address: "seat:lore/<stable-slug>.md#situation"
  position: "<seat>@<rig>"
```

附件绝不嵌入或复制 lore 字节。当更深的上下文相关时，读取器用被点名位置的显式授权来解析它。

## 阶段变更

要变更成熟度：

1. 只编辑 `stage` 与 `date`，除非论断本身也变了。
2. 重新解析同一个 `seat:lore/<stable-slug>.md` 地址。
3. 确认地址未变，且新的 stage 与 date 可见。

如果一次阶段变更会破坏地址，停下：那种存储形状违反本约定。`superseded` 与 `retired` 遵循所引成熟度主文档中的语义；这里不发明任何 lore 专属的替代。

## 对外闸门

lore 工件绝不通过复制、导出、供入或打包，从 rig 本地的位置知识跨入共享或可分发的受众。rig 之内经授权的读取侧组合不是毕业（graduation），并保持源地址与位置随附。其内容只能通过手写的重新落点（re-homing）进入一个新的对外工件：

1. 拥有席位亲自撰写目的地工件，或记录一条对其作者的显式委托。
2. 目的地以自己的话为新受众写成；lore 文件本身保持字节不变。
3. 目的地记录毕业事件：

```yaml
graduation:
  source_address: "seat:lore/<stable-slug>.md"
  source_stage: "<stage at graduation>"
  date: "YYYY-MM-DDTHH:MM:SSZ"
  owner: "<seat>@<rig>"
  delegation: "none | <who delegated to whom>"
  warrant: "<why the content earned the new audience>"
```

4. 如果目的地可分发，它必须通过公共实质受理闸门。重命名、重新包装，或把复制的 lore 宣称为另一个 pack 类别，是洗白，不是毕业。

源地址、源阶段、所有者/委托、日期与依据（warrant）让这次移动可以从目的地审计。源 lore 条目绝不仅为了宣告另一个工件从它毕业而被编辑。

## 隐私边界

Lore 是 rig 本地的位置知识。可分发的投影与 bundle 路径必须在结构上拒绝 `taxonomy: lore`，不依赖 token 拒绝列表或内容扫描器。既有的席位文件隔离保护继续有效。

本约定有意不创造：

- 自动的会话记录或记忆挖掘；
- lore 图书管理员、中央策展队列或评审仪式；
- 跨 rig 的 lore 共享；
- 新的地址语法、解析器种类或公开导出形式。

增长由所有者亲手书写且自然生长。当一个席位的实际工作让某个情境值得保存时，它写下一个条目；当消费者的情境需要时，它们按地址附加或组合它。
