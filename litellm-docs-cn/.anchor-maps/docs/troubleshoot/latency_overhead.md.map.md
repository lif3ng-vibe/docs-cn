Latency Overhead Troubleshooting | 延迟开销故障排查 | 延迟开销故障排查
The Invisible Latency Gap | 看不见的延迟缺口 | 看不见的延迟缺口
Quick Checklist | 快速排查清单 | 快速排查清单
Diagnostic Headers | 诊断响应头 | 诊断响应头
`x-litellm-overhead-duration-ms` (always on) | `x-litellm-overhead-duration-ms`（始终开启） | x-litellm-overhead-duration-ms始终开启
`x-litellm-callback-duration-ms` (always on) | `x-litellm-callback-duration-ms`（始终开启） | x-litellm-callback-duration-ms始终开启
Detailed Timing Breakdown (opt-in) | 详细耗时分解（需手动开启） | 详细耗时分解需手动开启
Large Payload Overhead | 大负载开销 | 大负载开销
1. DEBUG Logging (most common) | 1. DEBUG 日志（最常见） | 1-debug-日志最常见
2. Base64 in Logging Payloads | 2. 日志负载中的 Base64 | 2-日志负载中的-base64
3. Base64 and Oversized Lines in stdout Logs | 3. stdout 日志中的 Base64 与超长行 | 3-stdout-日志中的-base64-与超长行
Environment Variables Reference | 环境变量参考 | 环境变量参考
