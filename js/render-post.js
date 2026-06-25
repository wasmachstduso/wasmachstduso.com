// Renders a single post: body, tags, optional guide map, and the existing
// likes / comments / share Workers (same per-post IDs as before).

const API = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "http://localhost:8787/api"
  : "/api";
const WORKER_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "https://wasmachstduso.com"
  : location.origin;

const params = new URLSearchParams(location.search);
const id = params.get("id");

function transliterate(s) {
  return s.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").toLowerCase();
}
function escapeHtml(t) {
  return t.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

async function main() {
  const el = document.getElementById("post");
  if (!id) { el.innerHTML = "<p>Kein Beitrag angegeben.</p>"; return; }

  let post;
  try {
    const res = await fetch(`${API}/posts/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error();
    post = await res.json();
  } catch {
    el.innerHTML = "<p>Beitrag nicht gefunden.</p>";
    return;
  }

  document.title = post.title;
  const commentId = post.comment_id || transliterate(id);
  const tags = post.tags || [];
  const places = post.places || [];

  const tagsHtml = tags.length
    ? `<div class="tags">${tags.map((t) => `<a class="tag" href="/?tag=${encodeURIComponent(t)}">${escapeHtml(t)}</a>`).join("")}</div>`
    : "";

  const mapHtml = places.length
    ? `<div id="map"></div>
       <ul class="places-list">${places.map((p) => `
        <li>
          <span class="pl-text" style="flex:1"><strong>${escapeHtml(p.name)}</strong>${p.note ? ` — <span>${escapeHtml(p.note)}</span>` : ""}</span>
          <a href="https://maps.apple.com/?ll=${p.lat},${p.lng}&q=${encodeURIComponent(p.name)}"
             target="_blank" rel="noopener"
             style="flex-shrink:0;display:inline-flex;align-items:center;gap:4px;height:30px;padding:0 10px;font-size:13px;border-radius:7px;border:1px solid #aaa;font-family:noto-sans,sans-serif;color:#333;text-decoration:none;white-space:nowrap"
             onmouseover="this.style.backgroundColor='#fdc0324f'" onmouseout="this.style.backgroundColor=''">
            📍 Maps
          </a>
        </li>`).join("")}
       </ul>`
    : "";

  el.innerHTML = `
    <h1>${escapeHtml(post.title)}</h1>
    <p><strong>von ${escapeHtml(post.author)}</strong> am <em>${escapeHtml(post.date)}</em></p>
    ${tagsHtml}
    <div class="post-content">${post.body_html}</div>
    ${mapHtml}
    <div class="post-interaction">
      <button class="like-button" onclick="window.location.href='/'">🏠 start</button>
      <button class="like-button" id="like-btn">❤️ like (<span id="like-count">0</span>)</button>
      <button class="like-button" id="share-btn">🔗 teilen</button>
    </div>
    <div id="comments-root"></div>
  `;

  if (places.length) renderMap(places);

  // likes
  const likeCount = document.getElementById("like-count");
  fetch(`${WORKER_BASE}/likes/?id=${encodeURIComponent(id)}`)
    .then((r) => r.json()).then((d) => (likeCount.textContent = d.likes)).catch(() => {});
  document.getElementById("like-btn").onclick = () => {
    fetch(`${WORKER_BASE}/likes/?id=${encodeURIComponent(id)}`, { method: "POST" })
      .then((r) => r.json()).then((d) => (likeCount.textContent = d.likes)).catch(() => {});
  };

  // share
  document.getElementById("share-btn").onclick = () => {
    if (navigator.share) {
      navigator.share({ title: document.title, text: "Schau dir diesen Blogpost an!", url: location.href }).catch(() => {});
    } else {
      alert("Teilen wird von deinem Browser nicht unterstützt.");
    }
  };

  renderComments(commentId);
}

function renderMap(places) {
  const map = L.map("map");
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
    maxZoom: 19,
  }).addTo(map);
  const markers = [];
  places.forEach((p) => {
    const m = L.marker([p.lat, p.lng]).addTo(map);
    m.bindPopup(`<strong>${p.name}</strong>${p.note ? "<br>" + p.note : ""}`);
    markers.push([p.lat, p.lng]);
  });
  if (markers.length === 1) map.setView(markers[0], 14);
  else map.fitBounds(markers, { padding: [40, 40] });
}

function renderComments(commentId) {
  const root = document.getElementById("comments-root");
  root.innerHTML = `
    <div class="comments-section" style="margin-top:20px">
      <form id="comment-form" style="margin-bottom:5px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
          <input type="text" name="name" placeholder="Name" required
            style="flex:1;height:40px;padding:0 12px;font-size:16px;border-radius:5px;border:1px solid rgba(0,0,0,0.25);background:rgba(255,255,255,0.45);box-sizing:border-box" />
          <button type="submit" class="like-button">posten</button>
        </div>
        <textarea name="comment" placeholder="Kommentar" required rows="5"
          style="width:100%;max-height:7.5em;overflow-y:auto;resize:none;padding:8px;border-radius:8px;background:rgba(255,255,255,0.45);border:1px solid rgba(0,0,0,0.25);box-sizing:border-box;line-height:1.5;font-size:16px"></textarea>
      </form>
      <div id="comments-list" style="padding-top:10px;padding-bottom:30px">Kein Kommentar.</div>
    </div>`;

  const base = (location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "https://wasmachstduso.com" : location.origin) + "/comments";
  const list = document.getElementById("comments-list");

  function load() {
    fetch(`${base}/?post=${encodeURIComponent(commentId)}`)
      .then((r) => r.json())
      .then((comments) => {
        comments = comments.reverse();
        if (!comments.length) { list.innerHTML = "Kein Kommentar."; return; }
        list.innerHTML = "";
        comments.forEach(({ name, comment, timestamp }) => {
          const d = new Date(timestamp);
          const div = document.createElement("div");
          div.className = "comment";
          div.innerHTML = `<p><strong>${escapeHtml(name)}</strong> <small>${d.toLocaleString()}</small></p><p>${escapeHtml(comment)}</p>`;
          list.appendChild(div);
        });
      })
      .catch(() => {});
  }
  load();

  document.getElementById("comment-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const name = f.name.value.trim();
    const comment = f.comment.value.trim();
    if (!name || !comment) { alert("Bitte gib erst Name und Kommentar ein!"); return; }
    if (!confirm(`Fertig getippt?\n\nName: ${name}\nKommentar:\n${comment}`)) return;
    try {
      const r = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: commentId, name, comment }),
      });
      if (!r.ok) throw new Error(await r.text());
      f.name.value = ""; f.comment.value = "";
      load();
    } catch (err) {
      alert("Failed to post comment: " + err.message);
    }
  });
}

main();
