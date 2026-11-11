// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Static-export stub for app/mcp/route.ts.
 *
 * Swapped in by scripts/prepare-export.mjs for DOCS_STATIC_EXPORT=1 builds and
 * restored afterwards. The real route hosts the MCP server (streamable HTTP),
 * which an `output: 'export'` build (no server) cannot do. The stub answers
 * 501 with a plain-text note so agents probing the mirror get a clear signal.
 *
 * @output text/plain, 501
 */

export const dynamic = 'force-static';

export async function GET(_req: Request) {
  return new Response(
    'MCP is not available on the static mirror of this site.\n',
    {
      status: 501,
      headers: {'content-type': 'text/plain; charset=utf-8'},
    },
  );
}

export const POST = GET;
