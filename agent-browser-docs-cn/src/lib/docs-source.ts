// 原上游此文件还包含全量文档源加载（loadAllDocsSources/loadDocsSource，
// 供 .md markdown 协商、llms.txt 与服务端搜索索引使用）；静态镜像无这些
// 服务端路由，只保留路径安全校验。
export function isSafePathSegments(segments: readonly string[]): boolean {
  return segments.every(
    (part) =>
      part.length > 0 &&
      part !== "." &&
      part !== ".." &&
      !/[\/\\\u0000-\u001f\u007f]/.test(part),
  );
}
