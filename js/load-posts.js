const container = document.getElementById("post-grid");
const loadMoreBtn = document.getElementById("load-more");
let allPosts = [];
let loadedCount = 0;
const POSTS_PER_LOAD = 10;

fetch("./posts/rss.xml")
  .then(res => res.text())
  .then(str => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(str, "application/xml");
    const items = xml.querySelectorAll("item");

    allPosts = Array.from(items).map(item => {
      const title = item.querySelector("title").textContent;
      const link = item.querySelector("link").textContent;
      const pubDate = item.querySelector("pubDate").textContent;
      const descriptionHTML = item.querySelector("description").textContent;

      // Extract image URL and author name from description using RegExp
      const imageMatch = descriptionHTML.match(/<img src="([^"]+)"/);
      const authorMatch = descriptionHTML.match(/Post von ([^<]+)/);

      return {
        title,
        link,
        date: new Date(pubDate).toLocaleDateString("de-DE", {
          weekday: "long", year: "numeric", month: "long", day: "numeric"
        }),
        author: authorMatch ? authorMatch[1] : "Unbekannt",
        image: imageMatch ? imageMatch[1] : ""
      };
    });

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
