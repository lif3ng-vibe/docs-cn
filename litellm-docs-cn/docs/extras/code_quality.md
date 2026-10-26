# 代码质量

🚅 LiteLLM 遵循 [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)。

我们使用：
- Ruff 负责格式化与代码检查（`make format`、`make lint-ruff`）
- basedpyright 负责类型检查（`make lint-basedpyright`）
- 循环导入与导入安全检查（`make check-circular-imports`、`make check-import-safety`）

在 `litellm` 仓库根目录运行 `make lint`，即可执行与 CI 相同的检查。


如果你对如何改进代码质量有建议，欢迎随时提交 issue 或 PR。
