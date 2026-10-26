import React from 'react';
import OriginalPage from '@theme-original/DocCategoryGeneratedIndexPage';

// 镜像站移除了 social-cards 插件，不再注入其 og:image，仅透传原始分类索引页。
export default function DocCategoryGeneratedIndexPage(props) {
  return <OriginalPage {...props} />;
}
