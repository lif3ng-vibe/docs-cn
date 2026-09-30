"use client";

import { Code2 } from "lucide-react";
import {
  Callout,
  GuideLayout,
  GuideSection,
  Steps,
} from "../_components/guide-layout";
import { CodeBlock } from "../_components/code-block";

export default function NodemailerGuidePage() {
  return (
    <GuideLayout
      icon={Code2}
      title="用代码发送"
      subtitle="在应用中用任意 SMTP 库发送邮件。这里以最常用的 Node.js / nodemailer 为例——其他语言的字段完全相同。"
    >
      <GuideSection title="安装 nodemailer">
        <CodeBlock language="bash" filename="终端">
{`npm install nodemailer
# or
pnpm add nodemailer
# or
bun add nodemailer`}
        </CodeBlock>
      </GuideSection>

      <GuideSection title="最小传输器配置">
        <CodeBlock language="ts" filename="mailer.ts">
{`import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,        // smtp host from the right rail
  port: Number(process.env.SMTP_PORT), // 587
  secure: false,                       // STARTTLS upgrades after connect
  requireTLS: true,                    // refuse if TLS upgrade is unavailable
  auth: {
    user: process.env.SMTP_USER!,      // your full email address
    pass: process.env.SMTP_PASS!,      // postmaster password - keep in .env
  },
});`}
        </CodeBlock>
        <Callout>
          <strong>为什么用 587 + STARTTLS 而不是 465 + secure: true？</strong>
          {" "}两者都可行。587/STARTTLS 是现代提交标准，也是大多数客户端的选择。
          465（隐式 TLS）同样支持——设置{" "}
          <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[12px]">port: 465, secure: true</code>{" "}
          并移除 <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[12px]">requireTLS</code> 即可。
        </Callout>
      </GuideSection>

      <GuideSection title="发送一封邮件">
        <CodeBlock language="ts" filename="send.ts">
{`import { transporter } from "./mailer";

await transporter.sendMail({
  from: '"Your App" <postmaster@yourdomain.com>',
  to: "alice@example.com",
  subject: "Hello from your self-hosted mail server",
  text: "Plain-text body.",
  html: "<p>HTML body too - clients pick whichever they prefer.</p>",
});`}
        </CodeBlock>
      </GuideSection>

      <GuideSection title="先验证连接">
        <p className="text-sm leading-relaxed text-white/70">
          启动时先 ping 一次服务器，让错误配置尽快失败，
          而不是等第一次 sendMail 超时：
        </p>
        <CodeBlock language="ts" filename="boot.ts">
{`await transporter.verify();
console.log("SMTP ready");`}
        </CodeBlock>
      </GuideSection>

      <GuideSection title="其他语言">
        <p className="text-sm leading-relaxed text-white/70">
          各库的写法如出一辙——主机、端口、TLS 模式、用户名、密码。
        </p>

        <CodeBlock language="py" filename="python · smtplib">
{`import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg["From"] = "postmaster@yourdomain.com"
msg["To"] = "alice@example.com"
msg["Subject"] = "Hello"
msg.set_content("Plain text body")

with smtplib.SMTP("smtp.yourdomain.com", 587) as s:
    s.starttls()
    s.login("postmaster@yourdomain.com", "PASSWORD")
    s.send_message(msg)`}
        </CodeBlock>

        <CodeBlock language="go" filename="go · net/smtp">
{`auth := smtp.PlainAuth("",
  "postmaster@yourdomain.com",
  "PASSWORD",
  "smtp.yourdomain.com",
)
err := smtp.SendMail(
  "smtp.yourdomain.com:587",
  auth,
  "postmaster@yourdomain.com",
  []string{"alice@example.com"},
  []byte("Subject: Hello\\r\\n\\r\\nbody"),
)`}
        </CodeBlock>
      </GuideSection>

      <GuideSection title="生产环境清单">
        <Steps
          items={[
            <>
              绝不把密码提交进版本库。使用运行时加载的{" "}
              <strong>环境变量</strong>（Vercel/Railway/Fly 都支持；本地
              用 <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[12px]">.env.local</code>）。
            </>,
            <>
              在进程生命周期内复用同一个 <strong>transporter</strong>{" "}
              实例——每封邮件都新建 TCP+TLS 握手会拖垮吞吐量。
            </>,
            <>
              <strong>From</strong> 地址必须是这台服务器上存在的邮箱。
              外来的 From 地址会被你的 SPF + DMARC 策略拒收。
            </>,
            <>
              事务性邮件量大的话，启动时先运行 <strong>verify()</strong>{" "}
              并在 <strong>sendMail</strong> 外加重试；瞬时网络抖动是常态。
            </>,
            <>
              邮件发不出去时，查看 Openship 管理面板的“健康”标签页——
              外发队列就在那里。
            </>,
          ]}
        />
      </GuideSection>
    </GuideLayout>
  );
}
