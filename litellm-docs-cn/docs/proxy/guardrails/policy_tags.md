# 基于标签的策略绑定

系统会自动把防护栏（guardrails）策略套用到任何带有特定标签的密钥或团队上。无需逐个绑定策略，只要给密钥打上标签，剩下的交给策略引擎处理即可。

**示例**：安全团队要求所有医疗健康相关的密钥都执行 PII（个人身份信息）脱敏和 PHI（受保护健康信息）检测。只需给这些密钥打上 `health` 标签，再创建一条基于标签的绑定，所有匹配的密钥就会自动套用这些防护栏。

## 1. 创建带防护栏的策略

在左侧边栏进入 **Policies**（策略）页面，你会看到现有策略及其防护栏的列表。

![策略列表页，展示现有策略与 + Add New Policy 按钮](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/d7aa1e1f-011e-40bf-a356-6dfe9d5d54f1/ascreenshot_8db95c231a7f4a79a36c2a98ba127542_text_export.jpeg)

点击 **+ Add New Policy**（新增策略）。在弹窗中为策略取一个名字（例如 `high-risk-policy2`）。如果想参考已有策略，也可以直接输入关键字搜索现有的策略名称。

![Create New Policy 弹窗，输入策略名称和可选描述](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/18f1ff69-9b83-4a98-9aad-9892a104d3ff/ascreenshot_1c6b85231cad4ec695750b53bbbda52c_text_export.jpeg)

向下滚动到 **Guardrails to Add**（要添加的防护栏）。点击下拉框，查看代理上已配置的全部可用防护栏，然后选中这条策略要执行的防护栏。

![Guardrails to Add 下拉框，展示可用防护栏，如 OAI-moderation、phi-pre-guard、pii-pre-guard](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/55cedad7-9939-44a1-8644-a184cde82ab7/ascreenshot_eab4e55b82b8411893eccb6234d60b82_text_export.jpeg)

选中之后，防护栏会以标签块（chip）形式出现在输入框里。下方的 **Resolved Guardrails**（最终生效的防护栏）区域展示最终将套用的防护栏集合（包括从父策略继承的部分）。

![选中的防护栏以标签块显示：testing-pl、phi-pre-guard、pii-pre-guard，下方为 Resolved Guardrails 预览](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/c06d5b08-1c85-4715-b827-3e6864880428/ascreenshot_7a082e55f3ad425f9009346c68afae23_text_export.jpeg)

点击 **Create Policy**（创建策略）保存。

![点击 Create Policy 保存新策略](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/7e6eae64-4bba-4d72-b226-d1308ac576a8/ascreenshot_22d0ed686c594221bbbd2f40df214d75_text_export.jpeg)

## 2. 为策略添加标签绑定

策略创建好后，切换到 **Attachments**（绑定）标签页，在这里定义策略*应用在哪些范围*。

![切换到 Attachments 标签页，展示绑定表格与作用域文档](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/871ae6d9-16d1-44e2-baf2-7bb8a9e72087/ascreenshot_76e124619d70462ea0e2fbb46ded1ac9_text_export.jpeg)

点击 **+ Add New Attachment**（新增绑定）。Attachments 页面说明了可用的作用域：Global（全局）、Teams（团队）、Keys（密钥）、Models（模型）和 **Tags**（标签）。

![Attachments 页面展示包括 Tags 在内的作用域类型，点击 + Add New Attachment](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/d45ab8bc-fc1e-425b-8a3f-44d18df810ec/ascreenshot_425824030f3144b7ab3c0ac570349b00_text_export.jpeg)

在 **Create Policy Attachment**（创建策略绑定）弹窗中，先在下拉框里选中刚创建的策略。

![在下拉框中选择要绑定的策略（如 high-risk-policy2）](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/e0dcac40-e39c-4a6a-9d9c-4bbb9ec0ee91/ascreenshot_445b19894e0b466196a13e20c8e67f2d_text_export.jpeg)

作用域类型选择 **Specific (teams, keys, models, or tags)**（指定团队、密钥、模型或标签）。表单会随之展开，显示 Teams、Keys、Models 和 Tags 字段。

![选择 “Specific” 作用域类型后出现 Tags 字段](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/f685e02a-e22e-4c6c-9742-d5268746214b/ascreenshot_14d63d9d06dd4fc7854cfeb5e8d9ef85_text_export.jpeg)

向下滚动到 **Tags** 字段，输入要匹配的标签；这里输入 `health`。可以填任意字符串，也可以用 `health-*` 这样的通配模式匹配所有以 `health-` 开头的标签（如 `health-team`、`health-dev`）。

![Tags 字段中输入了 “health”，支持 prod-* 等通配符，可匹配 prod-us、prod-eu](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/14581df7-732c-4ea5-b36d-58270b00e92c/ascreenshot_e734c81418f046549b61a84b9d352a29_text_export.jpeg)

## 3. 查看绑定的影响范围

创建绑定之前，先点击 **Estimate Impact**（预估影响），预览将有多少密钥和团队受到影响。这一步是确认影响面的关键：应用之前，先核对作用范围是否符合预期。

![点击 Estimate Impact，已输入标签 “health” 并准备预览](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/6ccb81d7-3d11-48b0-b634-fc4d738aa530/ascreenshot_2eb89e6ff13a4b12b61004660a36c30c_text_export.jpeg)

**Impact Preview**（影响预览）会内联显示，明确列出受影响的密钥和团队数量。本例中显示 “This attachment would affect **1 key** and **0 teams**”（该绑定将影响 1 个密钥和 0 个团队），并列出了密钥别名 `hi`。

![Impact Preview 显示 “This attachment would affect 1 key and 0 teams.”，密钥：hi](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/8834d85a-2c15-48dd-8d6b-810cf11ee5c4/ascreenshot_d814b42ca9f34c23b0c2269bfa3e64fb_text_export.jpeg)

确认影响没有问题后，点击 **Create Attachment**（创建绑定）保存。

![点击 Create Attachment 完成创建](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/4a8918f2-eedb-4f49-a53b-4e46d0387d2a/ascreenshot_b08d490d836d4f46b4e5cbb14f61377a_text_export.jpeg)

绑定创建后会出现在表格里，可以看到策略名 `high-risk-policy2` 和标签 `health`。

![Attachments 表格展示新绑定，策略为 high-risk-policy2，标签为 “health”](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/45867887-0aec-44a4-963b-b6cc6c302e3e/ascreenshot_981caeff98574ec89a8a53cd295e5043_text_export.jpeg)

## 4. 创建带标签的密钥

在左侧边栏进入 **Virtual Keys**（虚拟密钥）页面，点击 **+ Create New Key**（新建密钥）。

![Virtual Keys 页面展示现有密钥，点击 + Create New Key](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/4c1f9448-e590-4546-9357-6f68aa395b27/ascreenshot_4a7bc5be9e4347f3a9fe46f78d938d7c_text_export.jpeg)

输入密钥名称并选择模型。然后展开 **Optional Settings**（可选设置），向下滚动到 **Tags** 字段。

![Create New Key 弹窗，输入密钥名称](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/f84f7a2b-8057-4926-9f80-d68e437c77cf/ascreenshot_a277c8611b6e41059663b0759cd85cab_text_export.jpeg)

在 **Tags** 字段中输入 `health` 并按回车。策略引擎就是靠这个标签来匹配的。

![密钥创建中的 Tags 字段，输入 “health” 添加标签](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/3ad3bf10-76d2-4f15-9a66-ed6c99bb25c4/ascreenshot_8a8773fb65fc49329cb1716da92b2723_text_export.jpeg)

标签 `health` 现在以 chip 形式显示在 Tags 字段里。确认各项设置无误。

![Tags 字段显示已选中 “health” 并带勾号](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/de3e58a9-6013-4d0c-882e-5517ea286684/ascreenshot_c7eef1736fce4aa894ac3b118b3800a2_text_export.jpeg)

点击表单底部的 **Create Key**（创建密钥）。

![点击 Create Key 生成带 health 标签的新虚拟密钥](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/51d419ea-ee80-4e24-8e93-b99a844881bc/ascreenshot_097d4564289943a88e30b5d2e3eab262_text_export.jpeg)

弹窗会显示你的新虚拟密钥。点击 **Copy Virtual Key**（复制虚拟密钥），下一步测试时会用到。

![保存密钥弹窗，点击 Copy Virtual Key 复制到剪贴板](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/e87a0cc1-4d12-4066-bfa2-973159808fd1/ascreenshot_7b616a7291d0497a9c61bdcdb59394d7_text_export.jpeg)

## 5. 测试密钥并验证策略已生效

在左侧边栏进入 **Playground** 页面，交互式地测试这个密钥。

![从侧边栏进入 Playground](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/e6f8a3ee-e9e8-4107-93d1-bfca734c5ce9/ascreenshot_539bde38abe646e49148a912fff2d257_text_export.jpeg)

在 **Virtual Key Source** 下选择 “Virtual Key”，把刚复制的密钥粘贴到输入框中。

![将虚拟密钥粘贴到 Playground 配置中](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/a6612c4a-d499-4e54-8019-f54fde674ad9/ascreenshot_e85ebb9051554594bab0da57823fafad_text_export.jpeg)

从 **Select Model** 下拉框中选择一个模型。

![从下拉框选择模型（如 bedrock-claude-opus-4.5）](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/325e330f-3eff-4c5e-b177-21916138a2f5/ascreenshot_693478f89c034e949e08f3ed0dd05120_text_export.jpeg)

输入一条消息并按回车。如果请求被防护栏拦截，你会在响应中看到。本例中，`testing-pl` 防护栏检测到邮箱格式并返回 403 错误，证明策略已经生效。

![防护栏生效，请求被拦截：“Content blocked: email pattern detected”](https://colony-recorder.s3.amazonaws.com/files/2026-02-11/2cf16809-d2e5-4eae-a7dd-6a16dfcca7ce/ascreenshot_727d7d4ed20b4a52b2b41e39fd36eccb_text_export.jpeg)

**使用 curl**：

也可以在命令行验证。响应头会标明实际套用了哪些策略和防护栏：

```bash
curl -v http://localhost:4000/chat/completions \
  -H "Authorization: Bearer <your-tagged-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "say hi"}]
  }'
```

查看响应头：

```
x-litellm-applied-policies: high-risk-policy2
x-litellm-applied-guardrails: pii-pre-guard,phi-pre-guard,testing-pl
x-litellm-policy-sources: high-risk-policy2=tag:health
```

| 响应头 | 含义说明 |
|--------|----------|
| `x-litellm-applied-policies` | 本次请求匹配到了哪些策略 |
| `x-litellm-applied-guardrails` | 实际执行了哪些防护栏 |
| `x-litellm-policy-sources` | 每条策略**为什么**会匹配：`tag:health` 表明命中来源是标签 |
