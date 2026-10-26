# [BETA] 公开团队

将可用的团队开放给你的用户，供其在注册时加入。

<iframe width="840" height="500" src="https://www.loom.com/embed/7871ea15035a48d2a118b7486c2f7598?sid=267cd0ab-d92b-42fa-b97a-9f385ef8930c" frameBorder="0" allowFullScreen></iframe>


## 快速上手

1. 在 LiteLLM 上创建团队

```bash
curl -X POST '<PROXY_BASE_URL>/team/new' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <MASTER_KEY>' \
-d '{"name": "My Team", "team_id": "team_id_1"}'
```

2. 将该团队开放给你的用户

```yaml
litellm_settings:
    default_internal_user_params:
        available_teams: ["team_id_1"] # 👈 Make team available to new SSO users
```

3. 测试一下！

```bash
curl -L -X POST 'http://0.0.0.0:4000/team/member_add' \
-H 'Authorization: Bearer sk-<USER_KEY>' \
-H 'Content-Type: application/json' \
--data-raw '{
    "team_id": "team_id_1", 
    "member": [{"role": "user", "user_id": "my-test-user"}]
}'
```
