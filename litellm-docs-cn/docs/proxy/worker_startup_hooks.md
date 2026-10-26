# Worker 启动钩子

在代理启动期间，可以通过 `LITELLM_WORKER_STARTUP_HOOKS` 在**每个 worker 进程**中执行自定义初始化函数。采用多 worker 部署（`--num_workers > 1`）时，如果所用库需要按进程初始化（例如 [gflags](https://github.com/google/python-gflags)），这个机制就必不可少。

## 问题所在

以多个 worker 运行 LiteLLM 代理时：

```bash
litellm --config config.yaml --num_workers 4
```

每个 worker 都是由 uvicorn、gunicorn 或 Granian（`--run_granian`）启动的**独立进程**。主进程在 `run_server()` 之前初始化的任何进程内状态，在 worker 进程中都**不可用**。其中包括：

- [python-gflags](https://github.com/google/python-gflags)（`gflags.FLAGS`）
- [absl-py flags](https://abseil.io/docs/python/guides/flags)（`absl.flags.FLAGS`）
- 自定义单例注册表或连接池（connection pool）
- 任何需要显式初始化的模块级状态

## 用法

将环境变量 `LITELLM_WORKER_STARTUP_HOOKS` 设为以逗号分隔的 `module.path:function_name` 可调用对象列表：

```bash
export LITELLM_WORKER_STARTUP_HOOKS="my_module:my_init_function"
```

每个钩子都会在 worker 启动生命周期的**早期**被调用，先于配置加载、数据库初始化以及任何请求处理。同步与异步函数均受支持。

## 示例：gflags 初始化

### 1. 定义封装模块

```python title="my_litellm_wrapper.py"
import gflags
import json
import os
import sys
from typing import Optional, List, Any


def init_gflags(
    usage: Optional[Any] = None,
    raw_args: Optional[List[str]] = None,
    known_only: bool = False,
) -> List[str]:
    """Initialize gflags from command-line arguments."""
    try:
        gflags.FLAGS.set_gnu_getopt(True)
        if raw_args is None:
            raw_args = sys.argv
        argv = gflags.FLAGS(raw_args, known_only=known_only)
    except gflags.Error as e:
        if usage is None:
            print("%s\nUsage: %s ARGS\n%s" % (e, sys.argv[0], gflags.FLAGS))
        else:
            print(usage % dict(cmd=sys.argv[0], flags=gflags.FLAGS))
        sys.exit(1)
    return argv


def init_gflags_for_worker():
    """Re-initialize gflags in each worker process.

    Reads the original sys.argv from the GFLAGS_ARGV env var
    (set by the master process before starting the proxy).
    """
    raw_args = json.loads(os.environ.get("GFLAGS_ARGV", "[]")) or sys.argv
    init_gflags(raw_args=raw_args, known_only=True)
```

### 2. 启动代理

```python title="start_proxy.py"
import json
import os
import sys

from my_litellm_wrapper import init_gflags

# Store sys.argv so workers can re-parse the same flags
os.environ["GFLAGS_ARGV"] = json.dumps(sys.argv)

# Tell LiteLLM to call our hook in each worker
os.environ["LITELLM_WORKER_STARTUP_HOOKS"] = "my_litellm_wrapper:init_gflags_for_worker"

# Initialize gflags in the master process
init_gflags()

# Start the proxy (programmatic invocation)
from litellm.proxy.proxy_cli import run_server

run_server(
    ["--config", "config.yaml", "--num_workers", "4"],
    standalone_mode=False,
)
```

或者直接在 shell 中启动：

```bash
export GFLAGS_ARGV='["my_app", "--my_flag=value", "--batch_size=32"]'
export LITELLM_WORKER_STARTUP_HOOKS="my_litellm_wrapper:init_gflags_for_worker"

litellm --config config.yaml --num_workers 4
```

## 工作原理

```
Master Process                          Worker Process (×N)
─────────────────                       ──────────────────────
1. init_gflags()                        3. proxy_startup_event():
2. run_server()                            → Read LITELLM_WORKER_STARTUP_HOOKS
   → sets env vars                         → Import & call each hook
   → uvicorn.run(workers=N)                  (gflags.FLAGS re-initialized ✓)
   → spawns workers ──────────────────►    → Continue with config/DB setup
                                           → Ready to serve requests
```

- 钩子在 `proxy_startup_event`（即 FastAPI 的 lifespan）的**最开头**执行，先于配置加载、数据库连接以及其他任何初始化。
- 主进程中设置的环境变量会被 worker 进程**继承**（标准的 Unix fork/spawn 行为）。
- 如果某个钩子**抛出异常**，对应的 worker 将无法启动。这是有意为之：缺失初始化（例如 gflags 未初始化）会在后续流程中引发错误。

## 多个钩子

多个钩子之间用逗号分隔：

```bash
export LITELLM_WORKER_STARTUP_HOOKS="my_module:init_gflags,my_module:init_metrics,my_module:init_connections"
```

钩子按**从左到右的顺序**依次执行。

## 异步钩子

同样支持异步函数，调用时会自动 await：

```python
async def init_async_connections():
    """Example async hook for initializing async resources."""
    await setup_async_connection_pool()
```

```bash
export LITELLM_WORKER_STARTUP_HOOKS="my_module:init_async_connections"
```

## 参考

| 环境变量 | 说明 |
|---|---|
| `LITELLM_WORKER_STARTUP_HOOKS` | 以逗号分隔的 `module.path:function_name` 可调用对象列表，启动时在每个 worker 中执行 |

钩子格式遵循标准的 Python entry point 语法：`module.path:function_name`，其中 `module.path` 是以点分隔的 Python 导入路径，`function_name` 是该模块内可调用对象的名称。
