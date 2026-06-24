// Drop-in replacement for the old load-posts.js.
// Reads the post list from the content worker instead of the static posts.json.
// The homepage HTML (#post-grid, #load-more) is unchanged.

const container = document.getElementById("post-grid");
const loadMoreBtn = document.getElementById("load-more");
let allPosts = [];
let loadedCount = 0;
const POSTS_PER_LOAD = 10;
const API = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "http://localhost:8787/api"
  : "/api";

fetch(`${API}/posts`)
  .then((res) => res.json())
  .then((data) => {
    allPosts = data;
    renderPosts();
    if (allPosts.length > POSTS_PER_LOAD) loadMoreBtn.style.display = "block";
  })
  .catch((err) => console.error("Failed to load posts", err));

function renderPosts() {
  const next = allPosts.slice(loadedCount, loadedCount + POSTS_PER_LOAD);
  next.forEach((post) => {
    const tile = document.createElement("a");
    tile.href = post.link || `/post.html?id=${encodeURIComponent(post.id)}`;
    tile.className = "post-tile";
    tile.innerHTML = `
      <img src="${post.cover_image}" alt="Header image" loading="lazy" />
      <div class="post-info">
        <h2>${post.title}</h2>
        <p>${post.date} — von ${post.author}</p>
      </div>
    `;
    container.appendChild(tile);
  });
  loadedCount += POSTS_PER_LOAD;
  if (loadedCount >= allPosts.length) loadMoreBtn.style.display = "none";
}

loadMoreBtn.addEventListener("click", renderPosts);
