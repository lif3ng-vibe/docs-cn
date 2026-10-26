import React from 'react';
import clsx from 'clsx';
import TOCItems from '@theme/TOCItems';
import Link from '@docusaurus/Link';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight';
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active';

export default function TOC({ className, ...props }) {
  return (
    <div className={clsx(styles.tableOfContents, className)}>
      {/* Scrollable TOC items */}
      <div className={clsx(styles.tocItemsContainer, 'thin-scrollbar')}>
        <TOCItems
          {...props}
          linkClassName={LINK_CLASS_NAME}
          linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
        />
      </div>

      {/* Enterprise promo card pinned at the bottom */}
      <div className={styles.promoCard}>
        <ThemedImage
          className={styles.promoMark}
          alt=""
          width={22}
          height={22}
          sources={{
            light: useBaseUrl('/img/brand/litellm-monogram-blue.svg'),
            dark: useBaseUrl('/img/brand/litellm-monogram-white.svg'),
          }}
        />
        <div className={styles.promoHeading}>LiteLLM Enterprise</div>
        <div className={styles.promoDescription}>
          SSO/SAML、审计日志、花费追踪、多团队管理与防护栏，为生产环境而生。
        </div>
        <Link to="/docs/enterprise" className={styles.promoButton}>
          了解更多 →
        </Link>
      </div>
    </div>
  );
}
