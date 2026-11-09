import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { upstreamUrl } from "@/lib/site";

// 自定义中文 Footer：geistdocs 内置 Footer 渲染 vercel.com 公司页脚
// （About/Careers/Social 等几十条外链），对中文镜像无意义，替换为本站信息。
export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-[1448px] px-6 pt-10 pb-6 text-sm">
      <div className="flex flex-col gap-2 text-neutral-500 dark:text-neutral-400">
        <p>
          agent-browser 中文文档——非官方翻译，内容以{" "}
          <Link
            href="https://github.com/vercel-labs/agent-browser"
            className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            vercel-labs/agent-browser
          </Link>{" "}
          （Apache-2.0）为源，快照日期 2026-11-08。
        </p>
        <div className="flex items-center gap-4">
          <Link
            href={upstreamUrl}
            className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            官方英文文档
          </Link>
          <Link
            href="https://www.npmjs.com/package/agent-browser"
            className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            npm
          </Link>
        </div>
      </div>
      <div className="mt-8 flex items-center justify-end">
        <ThemeToggle />
      </div>
    </footer>
  );
}
