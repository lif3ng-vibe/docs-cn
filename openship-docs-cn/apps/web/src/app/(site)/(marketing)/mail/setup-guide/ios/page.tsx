"use client";

import { Apple } from "lucide-react";
import {
  Callout,
  GuideLayout,
  GuideSection,
  Steps,
} from "../_components/guide-layout";

export default function IosGuidePage() {
  return (
    <GuideLayout
      icon={Apple}
      title="iOS 与 macOS 邮件"
      subtitle="把你的邮箱添加到 iPhone、iPad 或 Mac 上 Apple 内置的“邮件”应用。三者流程一致；截图以 iPhone 为准。"
    >
      <GuideSection title="开始之前">
        <p className="text-sm leading-relaxed text-white/70">
          你需要 Openship 管理面板“总览”标签页中的用户名与密码，
          以及右侧栏显示的 IMAP / SMTP 主机与端口。输入邮箱后 iOS 会自动填充部分字段——
          点按“完成”前请与这里的值逐一核对。
        </p>
      </GuideSection>

      <GuideSection title="添加账户">
        <Steps
          items={[
            <>
              打开 <strong>设置</strong> → <strong>邮件</strong> →{" "}
              <strong>账户</strong> →{" "}
              <strong>添加账户</strong> → <strong>其他</strong>。
            </>,
            <>点按 <strong>添加邮件账户</strong>。</>,
            <>
              输入显示名称、完整电子邮箱地址（即右侧栏的
              <em> 用户名</em>）、密码，以及可选的描述（如“工作邮箱”）。点按{" "}
              <strong>下一步</strong>。
            </>,
            <>
              在下一屏，确认顶部选中的是 <strong>IMAP</strong>。
            </>,
            <>
              在<strong>接收邮件服务器</strong>部分填入 IMAP 主机、端口，
              用户名用完整邮箱。
            </>,
            <>
              在<strong>外发邮件服务器</strong>部分填入 SMTP 主机与端口。
              用户名和密码在这里也必填——iOS 有时会显示为“可选”，
              但这台服务器上它们是必填项。
            </>,
            <>
              点按 <strong>下一步</strong>。iOS 会验证连接，
              可能需要 20–60 秒。验证通过后，选择要同步的数据（邮件即可），
              点按 <strong>存储</strong>。
            </>,
          ]}
        />
      </GuideSection>

      <GuideSection title="验证失败时">
        <Callout tone="warning">
          最常见的原因是 <strong>端口</strong> 或{" "}
          <strong>安全类型</strong>不匹配。重新打开该账户，进入“高级”，
          确认：IMAP 使用端口 <strong>993</strong> 并开启{" "}
          <em>使用 SSL</em>；SMTP 使用端口 <strong>587</strong>，
          开启 <em>使用 SSL</em>，认证方式设为 <em>密码</em>。
        </Callout>
        <Callout>
          如果反复看到 <em>“无法验证服务器身份”</em>，第一次请接受证书——
          新签发的证书，Let's Encrypt 链有时验证较慢。5 分钟后警告就会消失。
        </Callout>
      </GuideSection>

      <GuideSection title="发送测试邮件">
        <Steps
          items={[
            <>
              打开<strong>邮件</strong>应用。新账户会与其他账户并列出现。
            </>,
            <>
              给自己写一封邮件，用新地址发送。
            </>,
            <>
              它应在几秒内到达你的收件箱。如果进了垃圾箱，说明 DMARC
              策略较严格——检查管理面板的 DNS 标签页，
              确认 SPF/DKIM/DMARC 记录已发布。
            </>,
          ]}
        />
      </GuideSection>
    </GuideLayout>
  );
}
