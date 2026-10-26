import Image from '@theme/IdealImage';

# LiteLLM 代理性能

本页各项数字均为 LiteLLM 代理与直接调用提供商所得结果的对比。如需网关容量数据（大规模场景下每个 Pod 的请求数、Token 数与延迟），请参阅 [基准测试](../benchmarks.md)。

### 吞吐量提升 30%
与直接调用 OpenAI 原始 API 相比，LiteLLM 代理结合负载均衡（Load Balancer）可将吞吐量提升 **30%**
<Image img={require('../../img/throughput.png')} />

### 额外延迟 0.00325 秒
与直接使用 OpenAI 原始 API 相比，LiteLLM 代理会增加 **0.00325 秒**的延迟
<Image img={require('../../img/latency.png')} />
