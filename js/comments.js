const commentPostId = window.location.pathname.split("/").pop().replace(".html", ""); // same post ID logic
const commentWorkerUrl = "https://wasmachstduso.com/comments"; // update to your comments worker URL

// Fetch and display comments
async function fetchComments() {
  try {
    const res = await fetch(`${commentWorkerUrl}/?post=${commentPostId}`);
    const comments = (await res.json()).reverse();
    
    const commentsContainer = document.getElementById("comments-list");
    commentsContainer.innerHTML = ""; // clear existing

    if (comments.length === 0) {
      return;
    }
    

    comments.forEach(({ id, name, comment, timestamp }) => {
      const commentEl = document.createElement("div");
      commentEl.className = "comment";

      const date = new Date(timestamp);
      commentEl.innerHTML = `
        <p><strong>${escapeHtml(name)}</strong> <small>${date.toLocaleString()}</small></p>
        <p>${escapeHtml(comment)}</p>
      `;

      commentsContainer.appendChild(commentEl);
    });

  } catch (err) {
    console.error("Failed to load comments", err);
  }
}

// Post a new comment
async function postComment(name, comment) {
  try {
    const res = await fetch(commentWorkerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post: commentPostId, name, comment })
    });

    if (!res.ok) throw new Error(await res.text());

    fetchComments();
  } catch (err) {
    alert("Failed to post comment: " + err.message);
  }
}

// Simple HTML escape helper
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m => {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
  });
}

function initCommentSystem() {
  fetchComments();

  const form = document.getElementById("comment-form");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const nameInput = form.querySelector("input[name='name']");
    const commentInput = form.querySelector("textarea[name='comment']");
    const name = nameInput?.value?.trim() || null;
    const comment = commentInput?.value?.trim() || null;

    if (!name || !comment) {
      alert("Bitte gib erst Name und Kommentar ein!");
      return;
    }
    const confirmation = confirm(
      `Fertig getippt?\n\nName: ${name}\nKommentar:\n${comment}`
    );
    
    if (!confirmation) return;
    
    postComment(name, comment);

    nameInput.value = "";
    commentInput.value = "";
  });
}

