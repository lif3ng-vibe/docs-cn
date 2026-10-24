import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// 与 Starlight 默认一致；显式声明以免上游快照出现额外键时卡 schema
export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({}),
  }),
};
