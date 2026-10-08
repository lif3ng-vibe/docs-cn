---
title: 'Aider 集成'
---

# Aider 集成

`CONVENTIONS.md` 是名册（roster）索引：每个智能体的名字、它是干什么的、
所属部门，以及指向其完整说明的路径。

## 为什么是索引而不是智能体本体

Aider 会在整个会话期间把约定文件保持在上下文里——这正是这个文件
存在的意义。279 个智能体正文合计约 380 万字符，粗略相当于一百万
token，所以一个装下全部正文的约定文件在任何模型里都放不下，
硬塞也要花掉一大笔钱。

索引约 97,000 字符（约 24k token）。以只读方式加载它，让 aider
把它标记为可缓存；等你真正需要某个智能体时，再把它的完整说明
拉进上下文。

## 安装

```bash
# 从你的项目根目录运行
cd /your/project
/path/to/agency-agents/scripts/install.sh --tool aider
```

## 使用一个智能体

通常直接点名智能体就够了——它的描述已经在上下文里：

```
Use the Frontend Developer agent to refactor this component.
```

当你需要智能体的完整说明时，把它的文件读入会话。
索引会给你路径：

```
/read-only /path/to/agency-agents/engineering/engineering-frontend-developer.md
```

## 手动使用

```bash
aider --read CONVENTIONS.md
```

`--read` 会把文件标记为只读，并在启用提示词缓存（prompt caching）时
让 aider 缓存它，这样索引不会在每一轮都重新发送。

## 重新生成

```bash
./scripts/convert.sh --tool aider
```