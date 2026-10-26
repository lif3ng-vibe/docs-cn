Historical scalability measurements | 历史可扩展性实测数据 | 历史可扩展性实测数据
Every trace query is bounded by time {#time-bounded-queries} | 每条追踪查询都有时间下界 | 每条追踪查询都有时间下界
Samples are selected once per job {#one-pass-sampling} | 每个任务只做一次采样选择 | 每个任务只做一次采样选择
Single trace reads are keyed and windowed {#single-trace-reads} | 单条追踪读取按键定位并限定窗口 | 单条追踪读取按键定位并限定窗口
Scheduling does not scan every lens {#scheduling} | 调度不会扫描每个 lens | 调度不会扫描每个-lens
Proposed: separate active jobs from history {#narrow-hot-state} | 拟议：把活跃任务与历史数据分开存储 | 拟议把活跃任务与历史数据分开存储
Proposed: order trace summaries by start time {#trace-list-rollup} | 拟议：按开始时间排序追踪摘要 | 拟议按开始时间排序追踪摘要
Benchmark methodology {#methodology} | 基准测试方法 | 基准测试方法
Load tests {#load-tests} | 负载测试 | 负载测试
