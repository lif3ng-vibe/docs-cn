// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Static-export stub for app/api/search/route.ts.
 *
 * Swapped in by scripts/prepare-export.mjs for DOCS_STATIC_EXPORT=1 builds and
 * restored afterwards. The real route shells out to `astryx search` at request
 * time, which an `output: 'export'` build (no server) cannot do. The stub
 * answers 200 with an empty result set so the search panel degrades to
 * "no matches" instead of a network error.
 *
 * @output application/json, empty results
 */

export const dynamic = 'force-static';

export async function GET(_req: Request) {
  return Response.json(
    {query: '', results: [], stub: 'static-export'},
    {headers: {'cache-control': 'no-store'}},
  );
}
