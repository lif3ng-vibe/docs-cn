import { usePlatform } from "../hooks/usePlatform";

export default function PlatformPermissions() {
  const platform = usePlatform();

  if (platform !== "mac") {
    return null;
  }

  return (
    <div className="not-prose">
      <h3 className="text-lg font-semibold mb-2">权限</h3>
      <p className="text-sm leading-relaxed mb-2">
        在 macOS 上，Handy 会请求两项权限，请务必授予。
      </p>
      <ol className="text-sm leading-relaxed list-decimal pl-5 mb-2">
        <li className="mb-1">
          <strong>麦克风</strong>——用于录入你的声音
        </li>
        <li className="mb-1">
          <strong>辅助功能</strong>——用于把转写结果输入到其他应用
        </li>
      </ol>
    </div>
  );
}
