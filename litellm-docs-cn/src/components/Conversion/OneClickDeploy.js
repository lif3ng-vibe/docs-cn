import React from 'react';
import {ONE_CLICK} from './content';
import {track} from './shared';
import styles from './styles.module.css';

// A small, self-contained block for hosted one-click deploys. The badges are
// the providers' own images, used as published.
export default function OneClickDeploy({source = 'docs'}) {
  return (
    <div className={styles.oneClick}>
      <div className={styles.oneClickCopy}>
        <p className={styles.oneClickTitle}>一键部署到云端</p>
        <p className={styles.oneClickText}>
          同样的网关与 Postgres，由平台代管。凡是指南中出现 <code>http://localhost:4000</code> 的地方，都换成你这次部署的 URL。
        </p>
      </div>
      <div className={styles.oneClickBadges}>
        {ONE_CLICK.map(([name, url, badge]) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="nofollow noopener"
            onClick={() => track('docs_one_click_deploy', {provider: name, source})}>
            <img src={badge} alt={`在 ${name} 上部署`} height="32" />
          </a>
        ))}
      </div>
    </div>
  );
}
