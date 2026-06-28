export async function onRequest(context) {
  const KV = context.env.POSTS;
  const SITE = "https://wasmachstduso.com";

  const raw = await KV.get("index");
  const posts = raw ? JSON.parse(raw) : [];
  posts.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  function esc(s) {
    return String(s || "").replace(/[<>&'"]/g, (c) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c])
    );
  }

  const items = posts.slice(0, 20).map((p) => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/post.html?id=${encodeURIComponent(p.id)}</link>
      <guid isPermaLink="true">${SITE}/post.html?id=${encodeURIComponent(p.id)}</guid>
      <pubDate>${new Date(p.created_at || Date.now()).toUTCString()}</pubDate>
      ${(p.tags || []).map((t) => `<category>${esc(t)}</category>`).join("")}
    </item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>was machst du so?</title>
  <link>${SITE}</link>
  <description>was machst du so?</description>
  <language>de</language>${items}
</channel></rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}