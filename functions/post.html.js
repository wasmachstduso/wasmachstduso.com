// Serves post.html with Open Graph tags filled in for the requested post, so link previews
// (iMessage, Slack, ...) show the cover image and title. Previews read the raw HTML and never
// run render-post.js, so the tags have to be added here. Falls back to the plain page on any problem.
const SITE = "https://wasmachstduso.com";

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function excerpt(html, max = 150) {
  const text = String(html || "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function absolute(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return SITE + (src.startsWith("/") ? "" : "/") + src;
}

// Pages serves post.html at the clean URL /post; follow its redirect if we land on one.
async function getPage(env, origin) {
  let res = await env.ASSETS.fetch(new Request(`${origin}/post`));
  for (let i = 0; i < 2 && res.status >= 300 && res.status < 400; i++) {
    res = await env.ASSETS.fetch(new Request(new URL(res.headers.get("Location"), origin)));
  }
  return res;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const page = await getPage(env, url.origin);
  const id = url.searchParams.get("id");
  if (!id || !page.ok || !env.POSTS) return page;

  const html = await page.text();
  const plain = () => new Response(html, { status: page.status, headers: { "Content-Type": "text/html; charset=utf-8" } });

  try {
    const raw = await env.POSTS.get(`post:${id}`);
    const post = raw ? JSON.parse(raw) : null;
    if (!post || post.draft) return plain();

    const title = String(post.title || "was machst du so?");
    const description = excerpt(post.body_html) || [post.author && `von ${post.author}`, post.date].filter(Boolean).join(" · ");
    const image = absolute(post.cover_image) || `${SITE}/favicon.png`;
    const link = `${SITE}/post.html?id=${encodeURIComponent(id)}`;

    const meta = [
      ["property", "og:type", "article"],
      ["property", "og:site_name", "was machst du so?"],
      ["property", "og:title", title],
      ["property", "og:description", description],
      ["property", "og:url", link],
      ["property", "og:image", image],
      ["property", "og:image:alt", title],
      ["name", "twitter:card", "summary_large_image"],
      ["name", "twitter:title", title],
      ["name", "twitter:description", description],
      ["name", "twitter:image", image],
      ["name", "description", description],
    ].map(([k, n, v]) => `  <meta ${k}="${n}" content="${esc(v)}" />`).join("\n");

    const out = html
      .replace(/<title>[^<]*<\/title>/, () => `<title>${esc(title)}</title>`)
      .replace("</head>", () => `${meta}\n</head>`);
    return new Response(out, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch {
    return plain();
  }
}
