import React from 'react';
import OriginalMetadata from '@theme-original/DocItem/Metadata';

// 镜像站移除了 social-cards 插件（sharp 无法渲染中文标题，见 docusaurus.config.js），
// 这里不再注入其 og:image，仅保留默认 Metadata 行为。
export default function DocItemMetadata() {
  return <OriginalMetadata />;
}
