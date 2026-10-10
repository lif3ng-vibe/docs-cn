/**
 * 中文镜像的部署子路径（与 next.config.ts 的 basePath、geistdocs config 的
 * basePath 必须一致）。客户端组件不能 import lib/geistdocs/config（含 JSX
 * 与服务端依赖），这里维护唯一的字面量常量供全站 import。
 */
export const BASE_PATH = '/docs-cn/ai-sdk';

/** 给 public 资产的根绝对路径补 basePath；已是绝对 URL 或已带前缀则原样返回。 */
export const withBase = (src: string | undefined): string => {
  if (!src) return '';
  if (!src.startsWith('/') || src.startsWith(`${BASE_PATH}/`)) return src;
  return `${BASE_PATH}${src}`;
};