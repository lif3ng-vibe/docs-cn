import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import SalesButton from './SalesButton';
import {ICONS} from './icons';
import styles from './styles.module.css';

// Outcome tiles: a drawn icon, a short claim, one supporting line, and an
// optional link to the doc that backs the claim. A tile with a second source
// (`more` and `moreTo`) links its title and that source separately, since a
// card that is one link cannot hold another.
export function Tiles({items, columns = 3, size = 'md'}) {
  return (
    <div className={clsx('lite-cardgrid', styles.tiles, size === 'lg' && styles.tilesLg)} style={{'--cv-cols': columns}}>
      {items.map(({icon, title, text, to, more, moreTo}) => {
        const Icon = ICONS[icon];
        const split = Boolean(moreTo);
        const inner = (
          <>
            {Icon && (
              <span className={styles.tileIcon}>
                <Icon size={size === 'lg' ? 34 : 26} />
              </span>
            )}
            <span className={styles.tileTitle}>{split && to ? <Link to={to}>{title}</Link> : title}</span>
            {text && <span className={styles.tileText}>{text}</span>}
            {split && (
              <Link to={moreTo} className={styles.tileMore}>
                {more}
              </Link>
            )}
          </>
        );
        return to && !split ? (
          <Link key={title} to={to} className={clsx('lite-cardgrid__cell', styles.tile, styles.tileLink)}>
            {inner}
          </Link>
        ) : (
          <div key={title} className={clsx('lite-cardgrid__cell', styles.tile)}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

// Closing call to action for enterprise-minded readers.
export function SalesBand({title, text, source = 'docs'}) {
  return (
    <aside className={styles.band}>
      <div className={styles.bandCopy}>
        <p className={styles.bandTitle}>{title || 'LiteLLM 服务于公司里的每个团队'}</p>
        <p className={styles.bandText}>
          {text ||
            '企业版在同一网关上，凭一个许可证密钥即可增加 SSO、审计日志、各团队的管理员角色，以及 LiteLLM 工程师的支持。'}
        </p>
      </div>
      <div className={styles.bandActions}>
        <SalesButton source={source} />
        <span className={styles.salesNote}>可免费试用 30 天。</span>
      </div>
    </aside>
  );
}

// "What next" row: plain cards with a drawn icon and a one-line reason.
export function NextSteps({items}) {
  return <Tiles items={items} columns={items.length > 3 ? 4 : items.length} />;
}
