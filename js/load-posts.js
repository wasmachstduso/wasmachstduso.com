const container = document.getElementById("post-grid");
const loadMoreBtn = document.getElementById("load-more");
let allPosts = [];
let loadedCount = 0;
const POSTS_PER_LOAD = 10;

fetch("./posts/posts.json")
  .then(res => res.json())
  .then(data => {
    allPosts = data;
    renderPosts();
    if (allPosts.length > POSTS_PER_LOAD) {
      loadMoreBtn.style.display = "block";
    }
  });

function renderPosts() {
  const nextPosts = allPosts.slice(loadedCount, loadedCount + POSTS_PER_LOAD);
  nextPosts.forEach(post => {
    const tile = document.createElement("a");
    tile.href = post.link;
    tile.className = "post-tile";
    tile.innerHTML = `
      <img src="${post.image}" alt="Header image" />
      <div class="post-info">
        <h2>${post.title}</h2>
        <p>${post.date} — von ${post.author}</p>
      </div>
    `;
    container.appendChild(tile);
  });
  loadedCount += POSTS_PER_LOAD;
  if (loadedCount >= allPosts.length) {
    loadMoreBtn.style.display = "none";
  }
}

loadMoreBtn.addEventListener("click", renderPosts);
