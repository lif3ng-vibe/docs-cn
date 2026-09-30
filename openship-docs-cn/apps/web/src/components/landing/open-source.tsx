/**
 * Open source - editorial magazine spread. Big headline left, Apache 2.0
 * design moment + meta data right. No card grid, no install terminal.
 */
export function OpenSource() {
  return (
    <section className="os-section">
      <div className="os-container">
        <div className="os-grid">
          {/* Left - editorial */}
          <div className="os-lead">
            <p className="os-eyebrow">开源</p>
            <h2 className="os-headline">
              随你运行、Fork、<br />再交付。
            </h2>
            <p className="os-body">
              控制台、CLI、智能体、基础设施适配器——全部公开、可读、可审计。树莓派能跑，服务器集群也能跑。愿意的话，随时回馈上游。
            </p>
            <div className="os-cta-row">
              <a
                className="os-btn os-btn--primary"
                href="https://github.com/oblien/openship"
                target="_blank"
                rel="noreferrer"
              >
                去 GitHub 点个 Star
              </a>
              <a
                className="os-btn os-btn--ghost"
                href="https://github.com/oblien/openship"
                target="_blank"
                rel="noreferrer"
              >
                阅读源码
              </a>
            </div>
          </div>

          {/* Right - Apache 2.0 design moment + meta */}
          <aside className="os-side">
            <div className="os-license">
              <span className="os-license-eyebrow">采用许可证</span>
              <span className="os-license-name">Apache 2.0</span>
              <p className="os-license-note">
                宽松许可。使用、修改、交付皆随你——商业产品和闭源产品也不例外。
              </p>
            </div>

            <dl className="os-meta">
              <div className="os-meta-row">
                <dt>运行环境</dt>
                <dd>Linux、macOS、Windows，ARM 与 x86 皆可。任意云端，或你自己的笔记本。</dd>
              </div>
              <div className="os-meta-row">
                <dt>遥测</dt>
                <dd>默认关闭。愿意帮助改进平台时可自行开启。</dd>
              </div>
              <div className="os-meta-row">
                <dt>锁定</dt>
                <dd>普通 Docker 容器加标准清单文件，随时可以离开。</dd>
              </div>
              <div className="os-meta-row">
                <dt>遵循标准</dt>
                <dd>Docker、OCI、Let&rsquo;s Encrypt、ACME、S3、SMTP。</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}
