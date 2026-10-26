# 搜索工具（Admin UI）

控制哪些团队和虚拟密钥（virtual key）可以调用已配置的各个网络搜索集成（`/v1/search`），并在 LiteLLM 的花费仪表板（spend dashboard）中查看团队与密钥级别的用量。


![](/img/ui-search-tools/step-01-go-to-search-tools-tab.png)

## 第 1 步：注册工具

在 **Search tools** 页面新建工具（名称 + 提供商 + 凭据）。

![](/img/ui-search-tools/step-02-add-new-search-tool.png)

## 第 2 步：团队白名单

**Teams** → 创建/编辑团队 → 打开 **Search Tool Settings** → 为该团队添加工具。

![](/img/ui-search-tools/step-03-create-or-edit-team.png)
![](/img/ui-search-tools/step-04-open-search-tool-settings.png)
![](/img/ui-search-tools/step-05-add-search-tool-to-team.png)

## 第 3 步：密钥（可选，配置更严的列表）

**Virtual keys** → 为该团队生成或更新密钥 → **Search Tool Settings** 中的工具必须包含在团队列表之内（若团队列表非空）。

![](/img/ui-search-tools/step-06-create-team-key.png)

## 第 4 步：调用搜索

```bash
curl -sS -X POST "http://localhost:4000/v1/search/YOUR_SEARCH_TOOL_NAME" \
  -H "Authorization: Bearer YOUR_VIRTUAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "hello world", "max_results": 5}'
```

![](/img/ui-search-tools/step-07-open-usage-team-usage.png)

## 第 5 步：查看花费

**Logs** → 用 **Team ID** + **Public model / search tool** = `search_tool_name` 筛选 → 查看 **Cost** 列。

![](/img/ui-search-tools/step-08-select-team.png)
![](/img/ui-search-tools/step-09-see-search-tool-usage.png)

## 相关文档

- [搜索提供商与 YAML](../search/index.md)
- [代理配置（`search_tools` 行）](./config_settings.md)
