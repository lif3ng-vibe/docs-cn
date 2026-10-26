# 参与文档贡献

本网站使用现代静态网站生成器 [Docusaurus 3](https://docusaurus.io/) 构建。

克隆文档仓库：

```bash
git clone https://github.com/BerriAI/litellm-docs.git
cd litellm-docs
```

### 本地运行文档的环境搭建

安装依赖：

```bash
npm install
```

在本地运行文档站：

```bash
npm start
```

在此打开文档：[http://localhost:3000/](http://localhost:3000/)。

### 修改文档
- 所有文档都放在 `docs` 目录下
- 博客文章放在 `blog` 目录下
- 如果你新增 `.md` 文件或调整目录层级，请检查 `sidebars.js` 是否需要更新

### 验证你的改动

提交 PR 之前，先运行：

```bash
npm run build
```

测试完改动后，向 [github.com/BerriAI/litellm-docs](https://github.com/BerriAI/litellm-docs) 发起 pull request。
