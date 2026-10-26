Migrate from Kubernetes Manifests to the Microservices Chart | 从 Kubernetes Manifests 迁移到微服务 Chart | 从-kubernetes-manifests-迁移到微服务-chart
1. Capture the current deployment | 1. 记录当前部署 | 1-记录当前部署
2. Split `DATABASE_URL` into a username and password Secret | 2. 将 `DATABASE_URL` 拆分为用户名和密码 Secret | 2-将-database_url-拆分为用户名和密码-secret
3. Choose the chart version | 3. 选择 chart 版本 | 3-选择-chart-版本
4. Write `values.yaml` | 4. 编写 `values.yaml` | 4-编写-valuesyaml
5. Install alongside the old deployment | 5. 与旧部署并行安装 | 5-与旧部署并行安装
6. Verify the new release | 6. 验证新发布 | 6-验证新发布
7. Move traffic | 7. 切换流量 | 7-切换流量
8. Scale the gateway | 8. 网关扩缩容 | 8-网关扩缩容
9. Remove the old deployment | 9. 移除旧部署 | 9-移除旧部署
Roll back | 回滚 | 回滚
