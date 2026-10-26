import Image from '@theme/IdealImage';


# 用户管理层级

<Image img={require('../../img/litellm_user_heirarchy.png')} style={{ width: '100%', maxWidth: '4000px' }} />

LiteLLM 支持按用户、团队、组织和预算划分的层级体系。

- 一个组织可以包含多个团队。[API 参考](https://docs.litellm.ai/api-reference/#/organization%20management)
- 一个团队可以包含多个用户。[API 参考](https://docs.litellm.ai/api-reference/#/team%20management)
- 一个用户可以持有多把密钥，并加入多个团队。[API 参考](https://docs.litellm.ai/api-reference/#/budget%20management)
- 密钥既可以归属于团队，也可以归属于用户。[API 参考](https://docs.litellm.ai/api-reference/#/Customer%20Management)


:::info

角色与权限的更多细节请参见[访问控制](./access_control)。
:::
