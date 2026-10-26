# 文档贡献指南

本网站使用 [Docusaurus 3](https://docusaurus.io/) 构建，这是一个现代化的静态网站生成器。

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

在本地启动文档站点：

```bash
npm start
```

然后打开 [http://localhost:3000/](http://localhost:3000/) 即可访问文档。

### 修改文档
- 所有文档都放在 `docs` 目录下
- 博客文章放在 `blog` 目录下
- 新增 `.md` 文件或调整目录层级时，请检查 `sidebars.js` 是否也需要同步更新

### 验证你的改动

提交 PR 之前，先运行：

```bash
npm run build
```

测试确认改动无误后，向 [github.com/BerriAI/litellm-docs](https://github.com/BerriAI/litellm-docs) 发起 pull request。
