---
title: 'MCP 记忆集成'
---

# MCP 记忆集成

> 给任意智能体加上跨会话的持久记忆，用的是模型上下文协议（Model Context Protocol，MCP）。

## 它能做什么

默认情况下，代理公司（The Agency）的智能体每次会话都从零开始。
上下文靠智能体之间、会话之间手动复制粘贴传递。一个 MCP 记忆服务器
改变了这一点：

- **跨会话记忆**：智能体记得之前会话中的决策、交付物和上下文
- **交接连续性**：一个智能体交接（handoff）给另一个时，接收方能
  准确回忆起做过什么——无需复制粘贴
- **失败时回滚**：当 QA 检查失败、或某个架构决策被证明是错的，
  回滚到已知良好的状态，而不是从头再来

## 设置

你需要一个提供记忆工具的 MCP 服务器：`remember`、`recall`、`rollback`
和 `search`。把它加进你的 MCP 客户端配置（Claude Code、Cursor 等）：

```json
{
  "mcpServers": {
    "memory": {
      "command": "your-mcp-memory-server",
      "args": []
    }
  }
}
```

任何暴露 `remember`、`recall`、`rollback` 和 `search` 工具的 MCP 服务器
都可以。可用实现请查看 [MCP 生态](https://modelcontextprotocol.io)。

## 如何给任意智能体加记忆

要给现有智能体增强持久记忆，可以在智能体的提示词里加一个
**记忆集成**章节。这个章节指示智能体在关键时刻使用 MCP 记忆工具。

### 模式

```markdown
## Memory Integration

When you start a session:
- Recall relevant context from previous sessions using your role and the current project as search terms
- Review any memories tagged with your agent name to pick up where you left off

When you make key decisions or complete deliverables:
- Remember the decision or deliverable with descriptive tags (your agent name, the project, the topic)
- Include enough context that a future session — or a different agent — can understand what was done and why

When handing off to another agent:
- Remember your deliverables tagged for the receiving agent
- Include the handoff metadata: what you completed, what's pending, and what the next agent needs to know

When something fails and you need to recover:
- Search for the last known-good state
- Use rollback to restore to that point rather than rebuilding from scratch
```

### 智能体会拿它做什么

有了这些指令，LLM 会自动使用 MCP 记忆工具：

- `remember`——把一个决策、交付物或上下文快照连同标签一起存储
- `recall`——按关键词、标签或语义相似度检索相关记忆
- `rollback`——出问题时回退到之前的状态
- `search`——跨会话、跨智能体查找特定记忆

智能体文件无需改代码，也不用写 API 调用。MCP 工具搞定一切。

## 示例：增强版 Backend Architect

完整示例见 [backend-architect-with-memory.md](backend-architect-with-memory.md)
——标准 Backend Architect 智能体加上一个记忆集成章节。

## 示例：带记忆的工作流

见 [../../examples/workflow-with-memory.md](../../examples/workflow-with-memory.md)：
Startup MVP 工作流加上持久记忆的增强版，展示智能体如何通过记忆
而非复制粘贴来传递上下文。

## 小贴士

- **保持标签一致**：每条记忆都用智能体名和项目名做标签，这样
  recall 才可靠。
- **让 LLM 决定什么重要**：记忆指令是引导，不是死规矩。LLM 会
  自己弄清什么时候该记、该回忆什么。
- **回滚是杀手级特性**：当 Reality Checker 判定一个交付物不合格时，
  原智能体可以直接回滚到自己的上一个检查点，而不必手动撤销改动。