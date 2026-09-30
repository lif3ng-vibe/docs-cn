"use client";

import { Smartphone } from "lucide-react";
import {
  Callout,
  GuideLayout,
  GuideSection,
  Steps,
} from "../_components/guide-layout";

export default function AndroidGuidePage() {
  return (
    <GuideLayout
      icon={Smartphone}
      title="Android Gmail 应用"
      subtitle="把你的邮箱作为第三方 IMAP 账户添加到 Android 的 Gmail 应用。Android 12 到 15 流程相同；不同 OEM 定制系统的菜单措辞可能略有差异。"
    >
      <GuideSection title="开始之前">
        <p className="text-sm leading-relaxed text-white/70">
          你需要 Openship 管理面板“总览”标签页中的用户名与密码，
          以及右侧栏显示的 IMAP / SMTP 主机与端口。出现选项时请点按{" "}
          <em>“手动设置”</em>——自动检测经常选错端口。
        </p>
      </GuideSection>

      <GuideSection title="添加账户">
        <Steps
          items={[
            <>
              打开 <strong>Gmail</strong>，点按你的头像（右上角）→{" "}
              <strong>添加其他账户</strong>。
            </>,
            <>
              选择 <strong>其他</strong>（不是 Google，也不是 Outlook）。
            </>,
            <>
              输入完整的电子邮箱地址（即右侧栏的{" "}
              <em>用户名</em>）→ 点按 <strong>手动设置</strong>。
            </>,
            <>
              选择 <strong>个人 (IMAP)</strong>。
            </>,
            <>
              输入密码 → <strong>下一步</strong>。
            </>,
            <>
              <strong>接收服务器设置</strong>：用户名保持完整邮箱地址不变。
              服务器填右侧栏的 IMAP 主机。端口 <strong>993</strong>，安全类型{" "}
              <strong>SSL/TLS</strong>。点按 <strong>下一步</strong>。
            </>,
            <>
              <strong>外发服务器设置</strong>：服务器填 SMTP 主机。端口{" "}
              <strong>587</strong>，安全类型 <strong>STARTTLS</strong>。
              保持“要求登录”开启，并重新输入密码。点按 <strong>下一步</strong>。
            </>,
            <>
              选择同步频率（15 分钟即可）→ 输入显示名称 →{" "}
              <strong>下一步</strong>。账户添加完成。
            </>,
          ]}
        />
      </GuideSection>

      <GuideSection title="推送通知">
        <Callout>
          Gmail 按你选择的间隔轮询 IMAP；对非 Google 账户<em>不会</em>{" "}
          使用 IDLE。想要近乎即时的通知，请安装支持 IMAP IDLE 的专用客户端，
          如 FairEmail 或 K-9。设置方式完全相同。
        </Callout>
      </GuideSection>

      <GuideSection title="登录失败时">
        <Callout tone="warning">
          报错 <em>“无法打开与服务器的连接”</em> 几乎总是意味着端口/安全类型不匹配。
          在 Gmail 设置中重新打开该账户，点按你的地址，再进入{" "}
          <strong>服务器设置</strong>，核对收件为{" "}
          <strong>993 + SSL/TLS</strong>、发件为{" "}
          <strong>587 + STARTTLS</strong>。
        </Callout>
      </GuideSection>
    </GuideLayout>
  );
}
