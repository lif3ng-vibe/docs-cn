import { DarkSection } from "./dark-section";

export function FinalCta() {
  return (
    <section className="fcta-outer">
      <DarkSection>
        <div className="fcta-container">
          <h2 className="fcta-title">
            准备好出发了吗？
          </h2>
          <p className="fcta-sub">
            云端，或你自己的服务器。<br />
            无锁定，无配置文件。
          </p>
          <div className="fcta-row">
            <a href="/login" className="fcta-btn fcta-btn--primary">
              开始使用
            </a>
            <a
              href="https://github.com/oblien/openship"
              target="_blank"
              rel="noreferrer"
              className="fcta-btn fcta-btn--ghost"
            >
              在 GitHub 上查看
            </a>
          </div>
          <ul className="fcta-trust">
            <li>CLI、Web 与桌面端</li>
            <li>云端或自托管</li>
            <li>无锁定</li>
            <li>开源</li>
          </ul>
        </div>
      </DarkSection>
    </section>
  );
}
