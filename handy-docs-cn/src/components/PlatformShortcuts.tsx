import { usePlatform } from "../hooks/usePlatform";
import type { PlatformTab } from "../lib/platformStore";

const SHORTCUTS: Record<PlatformTab, { action: string; keys: string }[]> = {
  mac: [
    { action: "转写", keys: "Option + Space" },
    {
      action: "带后处理的转写",
      keys: "Option + Shift + Space",
    },
    { action: "取消", keys: "Escape" },
  ],
  windows: [
    { action: "转写", keys: "Ctrl + Space" },
    { action: "带后处理的转写", keys: "Ctrl + Shift + Space" },
    { action: "取消", keys: "Escape" },
  ],
  linux: [
    { action: "转写", keys: "Ctrl + Space" },
    { action: "带后处理的转写", keys: "Ctrl + Shift + Space" },
    { action: "取消", keys: "Escape" },
  ],
};

const REMAPPING: Record<PlatformTab, string> = {
  mac: "在 macOS 上，很多人喜欢用 fn 键",
  windows:
    "在 Windows 上，快捷键默认要求至少一个修饰键（Ctrl、Alt、Shift）加一个普通键，不支持纯修饰键快捷键。可在设置里启用实验性的 Handy Keys 实现，获得更灵活的键位组合。",
  linux:
    "在 Linux 上，快捷键默认要求至少一个修饰键（Ctrl、Alt、Shift）加一个普通键，不支持纯修饰键快捷键。可在设置里进入「高级」设置启用实验性的 Handy Keys 实现，获得更灵活的键位组合。",
};

export default function PlatformShortcuts() {
  const platform = usePlatform();
  const shortcuts = SHORTCUTS[platform];

  return (
    <div className="not-prose">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left pb-2 pr-4 font-semibold border-b border-handy-text/10">
              操作
            </th>
            <th className="text-left pb-2 font-semibold border-b border-handy-text/10">
              快捷键
            </th>
          </tr>
        </thead>
        <tbody>
          {shortcuts.map((s) => (
            <tr key={s.action}>
              <td className="py-1.5 pr-4 border-b border-handy-text/5">
                {s.action}
              </td>
              <td className="py-1.5 border-b border-handy-text/5">
                <code className="text-xs bg-handy-text/5 px-1.5 py-0.5 rounded">
                  {s.keys}
                </code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 text-sm leading-relaxed text-handy-text/60 !mb-0">
        在 Handy 设置里点击某个快捷键并按下你想要的组合键即可重新映射。{REMAPPING[platform]}
      </p>
    </div>
  );
}
