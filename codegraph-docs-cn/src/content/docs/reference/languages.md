---
title: 语言支持
description: CodeGraph 能解析的每种语言，以及它识别的扩展名。
---

语言支持依据文件扩展名自动启用——没有任何需要配置的东西。

| 语言 | 扩展名 | 状态 |
|---|---|---|
| TypeScript | `.ts`, `.tsx` | 完全支持 |
| JavaScript | `.js`, `.jsx`, `.mjs` | 完全支持 |
| Python | `.py` | 完全支持 |
| Go | `.go` | 完全支持 |
| Rust | `.rs` | 完全支持 |
| Java | `.java` | 完全支持 |
| C# | `.cs` | 完全支持 |
| PHP | `.php` | 完全支持 |
| Ruby | `.rb` | 完全支持 |
| C | `.c`, `.h` | 完全支持 |
| C++ | `.cpp`, `.hpp`, `.cc` | 完全支持 |
| Objective-C | `.m`, `.mm`, `.h` | 部分支持（类、协议、方法、`@property`、`#import`、消息发送；`.mm` ObjC++ 可能解析不完整） |
| Swift | `.swift` | 完全支持 |
| Kotlin | `.kt`, `.kts` | 完全支持 |
| Scala | `.scala`, `.sc` | 完全支持（类、trait、方法、类型别名、Scala 3 枚举） |
| Dart | `.dart` | 完全支持 |
| Svelte | `.svelte` | 完全支持（脚本提取、Svelte 5 runes、SvelteKit 路由） |
| Vue | `.vue` | 完全支持（script + script-setup、Nuxt 页面/API/中间件路由） |
| Astro | `.astro` | 完全支持（frontmatter + 脚本提取、模板中的组件/调用引用、`src/pages/` 路由） |
| Liquid | `.liquid` | 完全支持 |
| Pascal / Delphi | `.pas`, `.dpr`, `.dpk`, `.lpr` | 完全支持（类、记录、接口、枚举、DFM/FMX 窗体） |
| Lua | `.lua` | 完全支持（函数、方法、局部变量、`require` 导入、调用边） |
| R | `.R`, `.r` | 完全支持（函数、带方法的 S4/R5/R6 类、`library`/`require` 导入、`source()` 文件引用、调用边） |
| Luau | `.luau` | 完全支持（在 Lua 基础上增加类型化签名、`type` 别名、Roblox `require`） |
