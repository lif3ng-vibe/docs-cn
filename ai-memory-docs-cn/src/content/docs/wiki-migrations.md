---
title: "Wiki 结构迁移"
description: "SQL schema 迁移由 refinery 在服务器启动时自动处理。本文档讲的是 wiki 目录文件系统级变更的平行机制。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/wiki-migrations.md"
---

# Wiki 结构迁移

SQL schema 迁移由 `refinery` 在服务器启动时自动处理。本文档讲的是 wiki 目录*文件系统级*变更的平行机制。

## 何时写 wiki 迁移

任何时候，新版 ai-memory 需要把旧版创建的磁盘 wiki 目录重构成新结构，就写一个 wiki 迁移。需要迁移的例子：

- 路径方案变了（如 `<wiki_root>/<page>.md` → `<wiki_root>/<workspace>/<project>/<page>.md`）。
- 目录被重命名、拆分或合并。
- 某类别的每页都要加一个新的必需 frontmatter 字段。
- 日志轮换改变了 `log.md` 备份的文件名模式。

**不要**为纯增量且向后兼容的变更写迁移（如一个默认 `null` 的新可选 frontmatter 字段）。

## 怎么写 wiki 迁移

### 1. 创建迁移文件

在 `crates/ai-memory-wiki/src/migrations/` 里加一个新文件。命名约定：

```
m<YYYY>_<MM>_<DD>_<HH><MM>_<descriptive_name>.rs
```

例如：`m2026_06_01_1200_rename_logs_dir.rs`。

### 2. 实现 `WikiMigration` trait

```rust
use std::path::Path;
use ai_memory_store::WriterHandle;
use crate::error::WikiResult;
use crate::migrations::WikiMigration;

pub struct RenameLogs2026;

#[async_trait::async_trait]
impl WikiMigration for RenameLogs2026 {
    fn name(&self) -> &'static str {
        // 必须唯一且可排序。选定后永不更改。
        "2026_06_01T12_00_rename_logs_dir"
    }

    fn description(&self) -> &'static str {
        "rename _logs/ to _log/ for consistency with log.md"
    }

    async fn up(&self, _writer: &WriterHandle, wiki_root: &Path) -> WikiResult<()> {
        let old = wiki_root.join("_logs");
        let new = wiki_root.join("_log");

        // 幂等：工作已完成时立即返回 Ok。
        if !old.exists() {
            return Ok(());
        }

        std::fs::rename(&old, &new)?;
        Ok(())
    }
}
```

### 3. 注册它

打开 `crates/ai-memory-wiki/src/migrations/mod.rs`，在 `registry()` 函数里追加：

```rust
pub fn registry() -> Vec<Box<dyn WikiMigration>> {
    vec![
        // 既有条目……
        Box::new(super::m2026_06_01_1200_rename_logs_dir::RenameLogs2026),
    ]
}
```

同时在 `mod.rs` 顶部附近加 `mod m2026_06_01_1200_rename_logs_dir;`。

**绝不重排或删除条目。** 运行器把注册顺序与 `wiki_migrations` 表一起使用。

### 4. 加单元测试

每个迁移模块必须包含一个 `#[cfg(test)]` 块，做到：

- 对 `tempfile::TempDir` 执行迁移。
- 验证前置条件（旧布局存在）、后置条件（新布局存在、旧的消失）与幂等性（跑两次是无操作）。

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    use ai_memory_store::Store;

    #[tokio::test]
    async fn renames_logs_dir() {
        let dir = TempDir::new().unwrap();
        let store = Store::open(dir.path()).unwrap();
        let wiki_root = dir.path().join("wiki");
        std::fs::create_dir_all(&wiki_root).unwrap();

        // 前置条件。
        std::fs::create_dir(wiki_root.join("_logs")).unwrap();

        let m = RenameLogs2026;
        m.up(&store.writer, &wiki_root).await.unwrap();

        assert!(wiki_root.join("_log").exists());
        assert!(!wiki_root.join("_logs").exists());

        // 幂等：再跑一次不报错。
        m.up(&store.writer, &wiki_root).await.unwrap();
    }
}
```

## 不该怎么写迁移

### 没有坟场步骤就不许破坏性删除

迁移要移除文件（挪走它们）时，先把它们拷贝或移动到 `<wiki_root>/_graveyard/<migration_name>/<original_path>`。这让操作者至少在一个发布周期内能找回被误删的数据。

```rust
// 坏——升级后数据永远消失。
std::fs::remove_dir_all(wiki_root.join("_tmp"))?;

// 好——数据落进坟场，可恢复。
let graveyard = wiki_root.join("_graveyard").join(self.name());
std::fs::create_dir_all(&graveyard)?;
std::fs::rename(wiki_root.join("_tmp"), graveyard.join("_tmp"))?;
```

### 不许调 LLM

迁移在每次服务器启动时运行。它们必须快且免费。任何需要语言模型的变换都属于一次性 CLI 命令或整编任务，不属于迁移。

### 不许在写入器 actor 之外直连 SQL

迁移需要在文件搬动之外更新 SQLite 索引时，用 `WriterHandle` 方法。绝不打开第二个 `Connection`；绝不在迁移里直接调 `ops::*`。这维护 `CLAUDE.md` 里的不变量 #2（单写入器 actor）。

## 跟踪

已应用的迁移记录在 `wiki_migrations` SQLite 表里：

```sql
SELECT name, datetime(applied_at / 1000000, 'unixepoch') AS applied
FROM wiki_migrations
ORDER BY name;
```

该表由 `V06__wiki_migrations.sql` 创建（一个先于所有 wiki 迁移运行的 `refinery` 迁移）。迁移失败时服务器带清晰报错退出；重启服务器自动重试失败的迁移。
