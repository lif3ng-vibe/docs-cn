import Link from "next/link";
import { SUPPORT_EMAIL } from "@repo/core";

// 本镜像为纯静态导出（GitHub Pages），原站在 /api/contact 的支持请求后端不可用。
// 表单替换为指向官方渠道的提示卡，布局沿用原表单容器样式。
export function ContactForm({ source = "contact" }: { source?: "support" | "contact" }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid var(--th-bd-default)",
        background: "var(--th-bg-card)",
        padding: "28px 26px",
        maxWidth: 560,
      }}
    >
      <h3
        className="text-lg font-semibold mb-3"
        style={{ color: "var(--th-text-heading)" }}
      >
        在线支持表单仅在官方站点可用
      </h3>
      <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--th-text-body)" }}>
        本站是 OpenShip 文档的非官方中文镜像，为纯静态部署，不提供请求提交后端。
        如需提交支持请求，请前往
        <a
          href="https://openship.io/support"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 mx-1"
          style={{ color: "var(--th-text-heading)" }}
        >
          官方支持页面
        </a>
        ，或发送邮件至
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="underline underline-offset-4 mx-1"
          style={{ color: "var(--th-text-heading)" }}
        >
          {SUPPORT_EMAIL}
        </a>
        。
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "var(--th-text-secondary)" }}>
        使用文档遇到问题时，也欢迎在
        <a
          href="https://github.com/oblien/openship/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 mx-1"
          style={{ color: "var(--th-text-heading)" }}
        >
          GitHub Issues
        </a>
        中检索或反馈。
      </p>
    </div>
  );
}
