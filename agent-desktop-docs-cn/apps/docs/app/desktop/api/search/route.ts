import { createSearchRoute } from "@vercel/geistdocs/routes/search";
import { config } from "@/lib/geistdocs/config";
import { geistdocsSource } from "@/lib/geistdocs/source";

export const GET = createSearchRoute({ config, sources: [geistdocsSource] });

export const dynamic = "force-static";
export const revalidate = false;
