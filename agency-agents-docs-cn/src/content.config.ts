import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// 上游 agent 文件的 frontmatter 带有 name/color/emoji/vibe 等键，
// 在 Starlight 文档 schema 基础上放行这些键。
export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        name: z.string().optional(),
        color: z.string().optional(),
        emoji: z.string().optional(),
        vibe: z.string().optional(),
      }),
    }),
  }),
};