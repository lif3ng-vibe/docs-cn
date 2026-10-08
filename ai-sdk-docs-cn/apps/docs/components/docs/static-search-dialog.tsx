'use client';

import {
  SearchDialog as FumadocsSearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogListItem,
  SearchDialogOverlay,
  TagsList,
  TagsListItem,
} from 'fumadocs-ui/components/dialog/search';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { useState } from 'react';

type SearchDialogLike = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowClear?: boolean;
  from?: string;
  onTagChange?: (tag: string | string[] | undefined) => void;
  tag?: string | string[];
  tags?: { name: string; value: string }[];
};

/**
 * 静态导出版搜索对话框：以 `type: 'static'` 从构建期生成的
 * `/api/search` 索引文件检索（无服务端）。其余结构与
 * @vercel/geistdocs 的 GeistdocsSearchDialog 保持一致。
 */
export const StaticSearchDialog = (props: SearchDialogLike) => {
  const {
    allowClear = false,
    from,
    onTagChange,
    tag,
    tags,
    ...dialogProps
  } = props;
  const { locale } = useI18n();
  const hasTags = tags !== undefined && tags.length > 0;
  const [selected, setSelected] = useState(tag);

  const { search, setSearch, query } = useDocsSearch({
    type: 'static',
    locale,
    tag: hasTags ? selected : tag,
    from,
  });

  return (
    <FumadocsSearchDialog
      isLoading={query.isLoading}
      onSearchChange={setSearch}
      search={search}
      {...dialogProps}
    >
      <SearchDialogOverlay className="bg-background-100/80 backdrop-blur-none" />
      <SearchDialogContent className="w-[640px] max-w-[calc(100vw-1rem)] border-none shadow-[var(--ds-shadow-modal)]">
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList
          aria-label="搜索结果"
          Item={itemProps => (
            <SearchDialogListItem {...itemProps} role="option" />
          )}
          items={query.data === 'empty' ? null : query.data}
          role="listbox"
        />
        {hasTags ? (
          <SearchDialogFooter>
            <TagsList
              allowClear={allowClear}
              onTagChange={value => {
                setSelected(value);
                onTagChange?.(value);
              }}
              tag={typeof selected === 'string' ? selected : undefined}
            >
              {tags.map(item => (
                <TagsListItem key={item.value} value={item.value}>
                  {item.name}
                </TagsListItem>
              ))}
            </TagsList>
          </SearchDialogFooter>
        ) : null}
      </SearchDialogContent>
    </FumadocsSearchDialog>
  );
};
