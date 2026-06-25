// Homepage loader: reads posts from the worker, supports filtering by
// ?view=guides or ?tag=xxx, and populates the burger menu's tag list.

const API = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "http://localhost:8787/api"
  : "/api";

const container = document.getElementById("post-grid");
const loadMoreBtn = document.getElementById("load-more");
const filterNote = document.getElementById("filter-note");
const POSTS_PER_LOAD = 10;

let allPosts = [];
let filtered = [];
let loadedCount = 0;

const params = new URLSearchParams(location.search);
const viewParam = params.get("view");      // "guides"
const tagParam = (params.get("tag") || "").toLowerCase();

fetch(`${API}/posts`)
  .then((res) => res.json())
  .then((data) => {
    allPosts = data;
    buildTagMenu(data);
    applyFilter();
  })
  .catch((err) => console.error("Failed to load posts", err));

function applyFilter() {
  if (viewParam === "guides") {
    filtered = allPosts.filter((p) => (p.tags || []).includes("guides"));
    showNote(`Guides`);
  } else if (tagParam) {
    filtered = allPosts.filter((p) => (p.tags || []).includes(tagParam));
    showNote(`Tag: ${tagParam}`);
  } else {
    filtered = allPosts;
    filterNote.style.display = "none";
  }
  container.innerHTML = "";
  loadedCount = 0;
  renderPosts();
  loadMoreBtn.style.display = filtered.length > POSTS_PER_LOAD ? "block" : "none";
  if (filtered.length === 0) {
    container.innerHTML = `<p style="color:#757575;font-family:noto-sans,sans-serif">Noch nichts hier.</p>`;
  }
}

function showNote(text) {
  filterNote.style.display = "block";
  filterNote.innerHTML = `${text} &nbsp;·&nbsp; <a href="/">alle Beiträge</a>`;
}

function renderPosts() {
  const next = filtered.slice(loadedCount, loadedCount + POSTS_PER_LOAD);
  next.forEach((post) => {
    const tile = document.createElement("a");
    tile.href = post.link || `/post.html?id=${encodeURIComponent(post.id)}`;
    tile.className = "post-tile";
    const isGuide = (post.tags || []).includes("guides");
    tile.innerHTML = `
      ${post.cover_image ? `<img src="${post.cover_image}" alt="Header image" loading="lazy" />` : ""}
      <div class="post-info">
        <h2>${isGuide ? "📍 " : ""}${post.title}</h2>
        <p>${post.date} — von ${post.author}</p>
      </div>
    `;
    container.appendChild(tile);
  });
  loadedCount += POSTS_PER_LOAD;
  if (loadedCount >= filtered.length) loadMoreBtn.style.display = "none";
}

loadMoreBtn.addEventListener("click", renderPosts);

// build the tag submenu in the burger from all tags present (excluding "guides",
// which has its own entry)
function buildTagMenu(posts) {
  const tags = new Set();
  posts.forEach((p) => (p.tags || []).forEach((t) => { if (t !== "guides") tags.add(t); }));
  const list = document.getElementById("tag-list");
  const toggle = document.getElementById("tags-toggle");
  if (!list || !toggle) return;
  if (tags.size === 0) { toggle.style.display = "none"; return; }
  toggle.style.display = "block";
  [...tags].sort().forEach((t) => {
    const a = document.createElement("a");
    a.className = "sub";
    a.href = `/?tag=${encodeURIComponent(t)}`;
    a.textContent = t;
    list.appendChild(a);
  });
  toggle.addEventListener("click", () => {
    const open = list.style.display !== "none";
    list.style.display = open ? "none" : "block";
    document.getElementById("tags-arrow").classList.toggle("open", !open);
  });
}
