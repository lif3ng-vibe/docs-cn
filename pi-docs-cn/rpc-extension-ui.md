---
title: "RPC 扩展 UI"
---

扩展可以通过 `ctx.ui` 请求用户交互。在 RPC 模式下，受支持的调用成为一个请求/响应子协议，与常规的 [RPC 命令](rpc-commands)和[会话事件](json)并存。

扩展 UI 方法分为两类：

- **对话框方法**（`select`、`confirm`、`input`、`editor`）：在 stdout 上发出 `extension_ui_request` 并阻塞，直到客户端在 stdin 上发回带有匹配 `id` 的 `extension_ui_response`。
- **即发即忘方法**（`notify`、`setStatus`、`setWidget`、`setTitle`、`set_editor_text`）：在 stdout 上发出 `extension_ui_request`，但不期待响应。客户端可以展示该信息，也可以忽略。

如果对话框方法带有 `timeout` 字段，当超时到期时，智能体侧会以默认值自动解决。客户端无需追踪超时。

## 限制

一些 `ExtensionUIContext` 方法在 RPC 模式下不受支持或功能降级，因为它们需要直接访问终端 UI：

- `custom()` 返回 `undefined`。
- `onTerminalInput()` 返回一个无操作（no-op）的取消订阅函数。
- `setWorkingMessage()`、`setWorkingVisible()`、`setWorkingIndicator()`、`setHiddenThinkingLabel()`、`setFooter()`、`setHeader()`、`addAutocompleteProvider()`、`setEditorComponent()` 和 `setToolsExpanded()` 均为无操作。
- `getEditorText()` 返回 `""`，`getEditorComponent()` 返回 `undefined`。
- `getToolsExpanded()` 返回 `false`。
- `pasteToEditor()` 委托给 `setEditorText()`，没有终端粘贴处理。
- `getAllThemes()` 返回 `[]`，`getTheme()` 返回 `undefined`。
- `setTheme()` 返回 `{ success: false, error: "Theme switching not supported in RPC mode" }`。

注意：在 RPC 模式下 `ctx.mode` 为 `"rpc"` 且 `ctx.hasUI` 为 `true`，因为对话框与即发即忘方法可以通过扩展 UI 子协议正常工作。对于 `custom()` 这类需要真实终端的 TUI 专属功能，请用 `ctx.mode === "tui"` 加以保护。

## 来自 Pi 的请求

所有请求都带有 `type: "extension_ui_request"`、一个唯一的 `id` 和一个 `method` 字段。

### select

提示用户从列表中选择。带 `timeout` 字段的对话框方法以毫秒为单位包含超时时间；如果客户端未及时响应，智能体会以 `undefined` 自动解决。

```json
{
  "type": "extension_ui_request",
  "id": "uuid-1",
  "method": "select",
  "title": "Allow dangerous command?",
  "options": ["Allow", "Block"],
  "timeout": 10000
}
```

期望的响应：带有 `value`（所选选项字符串）的 `extension_ui_response`，或 `cancelled: true`。

### confirm

提示用户进行是/否确认。

```json
{
  "type": "extension_ui_request",
  "id": "uuid-2",
  "method": "confirm",
  "title": "Clear session?",
  "message": "All messages will be lost.",
  "timeout": 5000
}
```

期望的响应：带有 `confirmed: true/false` 的 `extension_ui_response`，或 `cancelled: true`。

### input

提示用户输入自由格式文本。

```json
{
  "type": "extension_ui_request",
  "id": "uuid-3",
  "method": "input",
  "title": "Enter a value",
  "placeholder": "type something..."
}
```

期望的响应：带有 `value`（输入的文本）的 `extension_ui_response`，或 `cancelled: true`。

### editor

打开一个多行文本编辑器，可选择预填内容。

```json
{
  "type": "extension_ui_request",
  "id": "uuid-4",
  "method": "editor",
  "title": "Edit some text",
  "prefill": "Line 1\nLine 2\nLine 3"
}
```

期望的响应：带有 `value`（编辑后的文本）的 `extension_ui_response`，或 `cancelled: true`。

### notify

显示一条通知。即发即忘，不期待响应。

```json
{
  "type": "extension_ui_request",
  "id": "uuid-5",
  "method": "notify",
  "message": "Command blocked by user",
  "notifyType": "warning"
}
```

`notifyType` 字段为 `"info"`、`"warning"` 或 `"error"`。省略时默认为 `"info"`。

### setStatus

设置或清除页脚/状态栏中的状态条目。即发即忘。

```json
{
  "type": "extension_ui_request",
  "id": "uuid-6",
  "method": "setStatus",
  "statusKey": "my-ext",
  "statusText": "Turn 3 running..."
}
```

发送 `statusText: undefined`（或省略它）即可清除该键的状态条目。

### setWidget

设置或清除显示在编辑器上方或下方的部件（widget，文本行块）。即发即忘。

```json
{
  "type": "extension_ui_request",
  "id": "uuid-7",
  "method": "setWidget",
  "widgetKey": "my-ext",
  "widgetLines": ["--- My Widget ---", "Line 1", "Line 2"],
  "widgetPlacement": "aboveEditor"
}
```

发送 `widgetLines: undefined`（或省略它）即可清除部件。`widgetPlacement` 字段为 `"aboveEditor"`（默认）或 `"belowEditor"`。RPC 模式只支持字符串数组；组件工厂会被忽略。

### setTitle

设置终端窗口/标签页标题。即发即忘。

```json
{
  "type": "extension_ui_request",
  "id": "uuid-8",
  "method": "setTitle",
  "title": "pi - my project"
}
```

### set_editor_text

设置输入编辑器中的文本。即发即忘。

```json
{
  "type": "extension_ui_request",
  "id": "uuid-9",
  "method": "set_editor_text",
  "text": "prefilled text for the user"
}
```

## 发往 Pi 的响应

只有对话框方法（`select`、`confirm`、`input`、`editor`）才会发送响应。`id` 必须与请求匹配。

### 值响应（select、input、editor）

```json
{"type": "extension_ui_response", "id": "uuid-1", "value": "Allow"}
```

### 确认响应（confirm）

```json
{"type": "extension_ui_response", "id": "uuid-2", "confirmed": true}
```

### 取消响应（任意对话框）

适用于取消任何对话框方法。扩展会收到 `undefined`（select/input/editor）或 `false`（confirm）。

```json
{"type": "extension_ui_response", "id": "uuid-3", "cancelled": true}
```

## 示例

经过验证的 [RPC 扩展 UI 客户端](../examples/rpc-extension-ui.ts)及其[演示扩展](../examples/extensions/rpc-demo.ts)可供参阅。

导出的请求与响应联合类型定义于 [`rpc-types.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/modes/rpc/rpc-types.ts)。与模式无关的扩展指南参见[扩展](extensions#ui-%E4%B8%8E%E6%A8%A1%E5%BC%8F)。
