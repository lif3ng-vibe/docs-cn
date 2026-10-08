import { fetchOssStats } from '@/lib/home/oss-stats';

export async function OssStatsSection() {
  const stats = await fetchOssStats();
  return (
    <dl
      aria-label="AI SDK 社区"
      className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4 md:py-20"
    >
      {[
        [stats.downloads, '每周下载量'],
        [stats.stars, 'GitHub Stars'],
        [stats.contributors, '贡献者'],
        ['100+', '支持的模型'],
      ].map(([count, label]) => (
        <div className="flex flex-col" key={label}>
          <dt className="order-2 mt-2 font-sans text-sm text-gray-900">
            {label}
          </dt>
          <dd className="text-heading-40 lg:text-heading-48">{count}</dd>
        </div>
      ))}
    </dl>
  );
}
