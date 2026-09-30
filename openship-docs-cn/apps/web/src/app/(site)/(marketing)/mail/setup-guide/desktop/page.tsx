"use client";

import { Mail } from "lucide-react";
import {
  Callout,
  GuideLayout,
  GuideSection,
  Steps,
} from "../_components/guide-layout";

export default function DesktopGuidePage() {
  return (
    <GuideLayout
      icon={Mail}
      title="桌面客户端"
      subtitle="Thunderbird、Outlook、Apple Mail（另行介绍）、Spark、K-9——IMAP/SMTP 设置完全一致。本指南以 Thunderbird 为例；字段名称几乎适用于所有其他客户端。"
    >
      <GuideSection title="通用设置">
        <p className="text-sm leading-relaxed text-white/70">
          每个邮件客户端要的都是同样几项信息。它们都在右侧栏——边设置边复制：
        </p>
        <Callout>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>
              <strong>用户名</strong>——你的完整电子邮箱地址（两台服务器上相同）。
            </li>
            <li>
              <strong>密码</strong>——来自 Openship 管理面板的“总览”标签页。
            </li>
            <li>
              <strong>IMAP 服务器 / 端口 / 安全</strong>——通常是端口{" "}
              <em>993</em>，配 <em>SSL/TLS</em>。
            </li>
            <li>
              <strong>SMTP 服务器 / 端口 / 安全</strong>——通常是端口{" "}
              <em>587</em>，配 <em>STARTTLS</em>。
            </li>
            <li>
              <strong>认证方式</strong>——“普通密码”（不是 OAuth）。
            </li>
          </ul>
        </Callout>
      </GuideSection>

      <GuideSection title="Thunderbird">
        <Steps
          items={[
            <>
              打开 Thunderbird。如果是第一个账户，设置向导会自动出现；
              否则：<strong>文件</strong> → <strong>新建</strong> →{" "}
              <strong>现有邮件账户</strong>。
            </>,
            <>输入你的姓名、完整邮箱与密码，点击 <strong>继续</strong>。</>,
            <>
              Thunderbird 会尝试自动检测。一旦出现<strong>手动配置</strong>{" "}
              选项就立即点击以<strong>阻止它</strong>——自动检测经常选错协议。
            </>,
            <>
              IMAP：主机、端口 <strong>993</strong>、SSL/TLS、普通密码。
              SMTP：主机、端口 <strong>587</strong>、STARTTLS、普通密码。
              两处用户名都是你的完整邮箱。
            </>,
            <>
              点击 <strong>重新测试</strong>，圆点应变绿。点击 <strong>完成</strong>。
            </>,
          ]}
        />
      </GuideSection>

      <GuideSection title="Outlook（经典版）">
        <Steps
          items={[
            <>
              <strong>文件</strong> → <strong>添加账户</strong> →{" "}
              <strong>高级选项</strong> → 勾选{" "}
              <strong>让我手动设置账户</strong>。
            </>,
            <>输入你的邮箱 → <strong>连接</strong>。</>,
            <>选择 <strong>IMAP</strong>。</>,
            <>
              按右侧栏填入收发服务器与端口。收件加密选 <strong>SSL/TLS</strong>，
              发件选 <strong>STARTTLS</strong>。
            </>,
            <>
              输入密码。Outlook 会进行验证；通过后点击 <strong>完成</strong>。
            </>,
          ]}
        />
      </GuideSection>

      <GuideSection title="K-9 / Spark / FairEmail（开源客户端）">
        <p className="text-sm leading-relaxed text-white/70">
          其他 IMAP 客户端流程相同：被问到时选择 <strong>手动设置</strong> →{" "}
          <strong>IMAP</strong>，按右侧栏填入各项值，并避开任何“OAuth”或
          “Google 登录”选项——这是一台独立的 IMAP/SMTP 服务器，
          不是 Google 账户。
        </p>
      </GuideSection>

      <GuideSection title="常见坑">
        <Callout tone="warning">
          <strong>“服务器不信任证书”</strong>通常说明 Let's Encrypt
          证书尚未生效（安装后需 5–15 分钟）。接受一次证书，警告就不会再出现。
        </Callout>
        <Callout tone="warning">
          凭据明明正确却提示 <strong>“用户名和密码不被接受”</strong>
          ——检查用户名字段是否填了 <em>完整邮箱</em>，
          而不是 @ 前的本地部分。这台服务器的虚拟邮箱机制要求完整地址。
        </Callout>
      </GuideSection>
    </GuideLayout>
  );
}
