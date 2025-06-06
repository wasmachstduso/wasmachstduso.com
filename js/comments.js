const postId = window.location.pathname.split("/").pop().replace(".html", ""); // same post ID logic
const workerUrl = "https://wasmachstduso.com/comments"; // update to your comments worker URL

// Fetch and display comments
async function fetchComments() {
  try {
    const res = await fetch(`${workerUrl}/?post=${postId}`);
    const comments = await res.json();
    
    const commentsContainer = document.getElementById("comments-list");
    commentsContainer.innerHTML = ""; // clear existing

    if (comments.length === 0) {
      commentsContainer.textContent = "Schreib den ersten Kommentar!";
      return;
    }

    comments.forEach(({ id, name, comment, timestamp }) => {
      const commentEl = document.createElement("div");
      commentEl.className = "comment";

      const date = new Date(timestamp);
      commentEl.innerHTML = `
        <p><strong>${escapeHtml(name)}</strong> <small>${date.toLocaleString()}</small></p>
        <p>${escapeHtml(comment)}</p>
        <button class="delete-comment" data-id="${id}" style="display:none;">Delete</button>
      `;

      commentsContainer.appendChild(commentEl);
    });

    // Add delete button handlers (if you want)
    document.querySelectorAll(".delete-comment").forEach(button => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        if (confirm("Delete this comment?")) {
          await deleteComment(id);
          fetchComments();
        }
      });
    });

  } catch (err) {
    console.error("Failed to load comments", err);
  }
}

// Post a new comment
async function postComment(name, comment) {
  try {
    const res = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post: postId, name, comment })
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

// Event listener for comment form submit
document.addEventListener("DOMContentLoaded", () => {
  fetchComments();

  const form = document.getElementById("comment-form");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const nameInput = form.querySelector("input[name='name']");
    const commentInput = form.querySelector("textarea[name='comment']");

    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();

    if (!name || !comment) {
      alert("Please enter your name and comment.");
      return;
    }

    postComment(name, comment);

    nameInput.value = "";
    commentInput.value = "";
  });
});
