import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';

// Brand column (logo, one line on what LiteLLM is, newsletter signup) beside
// the link columns from docusaurus.config.js, then a slim bottom bar.
export default function FooterLayout({style, links, copyright}) {
  return (
    <footer
      className={clsx(ThemeClassNames.layout.footer.container, 'footer', 'lite-footer', {
        'footer--dark': style === 'dark',
      })}>
      <div className="container container-fluid">
        <div className="lite-footer__top">
          <div className="lite-footer__brand">
            <a href="https://www.litellm.ai/" target="_blank" rel="noopener noreferrer" aria-label="LiteLLM 官网">
              {/* The footer is always navy, so it uses the white primary logo. */}
              <img className="lite-footer__logo" src={useBaseUrl('/img/brand/litellm-logo-white.png')} alt="LiteLLM" width="147" height="28" />
            </a>
            <p className="lite-footer__tagline">一个 API 调用所有模型：可直接写进代码，也可架在你自己的网关后面。</p>
          </div>
          <div className="lite-footer__links">{links}</div>
        </div>
        <div className="lite-footer__bottom">
          {copyright}
          <span className="lite-footer__legal">
            <a href="https://trust.litellm.ai/" target="_blank" rel="noopener noreferrer">
              SOC 2 Type II
            </a>
            <a href="https://github.com/BerriAI/litellm/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
              MIT 许可证
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
