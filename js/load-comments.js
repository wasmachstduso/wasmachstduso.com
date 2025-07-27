document.addEventListener("DOMContentLoaded", async () => {
    const container = document.createElement("div");
    container.id = "comments-placeholder";
    const post = document.querySelector('.post');
    if (post) {
    post.appendChild(container);
    } else {
    document.body.appendChild(container);
    }

  
    try {
      const res = await fetch("../assets/html/comments.html?v=20250727");
      const html = await res.text();
      container.innerHTML = html;
  
      // Load comment.js dynamically
      const script = document.createElement("script");
      script.src = "../js/comments.js?v=20250727";
      script.onload = () => {
        initCommentSystem();
      };
      document.body.appendChild(script);
    } catch (err) {
      container.innerHTML = "<p>Fehler beim Laden des Kommentarbereichs.</p>";
      console.error("Could not load comments section:", err);
    }
  });
  