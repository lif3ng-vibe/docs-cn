import Link from "next/link";
import { resourcesSource, type ResourceFrontmatter } from "@/lib/source";
import type { Metadata } from "next";

const SITE_URL = "https://openship.io";

type RPage = { url: string; data: ResourceFrontmatter };

function getPages(): RPage[] {
  return resourcesSource.getPages() as unknown as RPage[];
}

function getCategories() {
  const pages = getPages();
  const set = new Set<string>();
  pages.forEach((p) => {
    if (p.data?.category) set.add(p.data.category);
  });
  return [
    { name: "全部", slug: "all" },
    ...[...set].sort().map((c) => ({ name: c, slug: c.toLowerCase() })),
  ];
}

function formatDate(raw: string): string {
  try {
    return new Date(raw).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

// 静态导出：searchParams 不可用，?category= 过滤退化为客户端重载；元数据固定为全量视图
const category: string | undefined = undefined;

export async function generateMetadata(
  _props: unknown,
): Promise<Metadata> {
  const pageTitle =
    category && category !== "all"
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} – Openship 资源`
      : "资源 – Openship";

  const pageDescription =
    category && category !== "all"
      ? `浏览${category}分类下来自 Openship 团队的文章、指南与更新`
      : "来自 Openship 团队的工程深度解析、产品更新与指南。";

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `${SITE_URL}/resources${category && category !== "all" ? `?category=${category}` : ""}`,
      siteName: "Openship",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
    alternates: {
      canonical: `${SITE_URL}/resources`,
    },
  };
}

export default async function ResourcesPage(
  _props: unknown,
): Promise<React.ReactNode> {
  // 静态导出：不再读取 searchParams，固定全量视图
  const category = "all" as string;

  let pages = getPages();
  const categories = getCategories();

  if (category !== "all") {
    pages = pages.filter(
      (p) => (p.data?.category?.toLowerCase() || "") === category.toLowerCase()
    );
  }

  pages.sort((a, b) => {
    const da = a.data.date ?? "";
    const db = b.data.date ?? "";
    return db.localeCompare(da);
  });

  const featured = pages[0] || null;
  const rest = pages.slice(1);

  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Openship 资源",
    description:
      "来自 Openship 团队的工程深度解析、产品更新与指南",
    url: `${SITE_URL}/resources`,
    publisher: {
      "@type": "Organization",
      name: "Openship",
    },
    blogPost: pages.slice(0, 10).map((page) => ({
      "@type": "BlogPosting",
      headline: page.data.title,
      description: page.data.description,
      url: `${SITE_URL}${page.url}`,
      datePublished: page.data.date,
      author: { "@type": "Person", name: page.data.author || "Openship 团队" },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogStructuredData) }}
      />

      <main className="res-main">
        <section className="res-hero">
          <span className="res-eyebrow">资源</span>
          <h1 className="res-title">来自构建一线的思考。</h1>
          <p className="res-sub">
            来自 Openship 团队的工程深度解析、产品更新与指南——第一手，无转述。
          </p>
        </section>

        <nav className="res-tabs" aria-label="分类">
          {categories.map((cat) => {
            const href =
              cat.slug === "all" ? "/resources" : `/resources?category=${cat.slug}`;
            const active = category === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={href}
                className="res-tab"
                data-active={active ? "true" : "false"}
                aria-current={active ? "page" : undefined}
              >
                {cat.name}
              </Link>
            );
          })}
        </nav>

        {featured && (
          <Link href={featured.url} className="res-featured">
            <div className="res-featured-flag">精选</div>
            <span className="res-featured-tag">
              {featured.data.category || "文章"}
            </span>
            <h2 className="res-featured-title">{featured.data.title}</h2>
            {featured.data.description && (
              <p className="res-featured-desc">{featured.data.description}</p>
            )}
            <div className="res-featured-meta">
              <div className="res-avatar" aria-hidden="true">
                {(featured.data.author || "O")[0].toUpperCase()}
              </div>
              <span className="res-meta-name">
                {featured.data.author || "Openship 团队"}
              </span>
              {featured.data.date && (
                <>
                  <span className="res-meta-dot" aria-hidden="true" />
                  <time dateTime={featured.data.date}>
                    {formatDate(featured.data.date)}
                  </time>
                </>
              )}
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="res-grid">
            {rest.map((post) => (
              <Link key={post.url} href={post.url} className="res-card">
                <div className="res-card-top">
                  <span className="res-card-tag">
                    {post.data.category || "文章"}
                  </span>
                  {post.data.date && (
                    <time className="res-card-date" dateTime={post.data.date}>
                      {formatDate(post.data.date)}
                    </time>
                  )}
                </div>
                <h3 className="res-card-title">{post.data.title}</h3>
                {post.data.description && (
                  <p className="res-card-desc">{post.data.description}</p>
                )}
                <div className="res-card-foot">
                  <div className="res-avatar" aria-hidden="true">
                    {(post.data.author || "O")[0].toUpperCase()}
                  </div>
                  <span>{post.data.author || "Openship 团队"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pages.length === 0 && (
          <p className="res-empty">该分类下暂无文章。</p>
        )}
      </main>
    </>
  );
}
