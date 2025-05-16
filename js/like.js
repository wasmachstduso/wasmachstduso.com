const postId = window.location.pathname.split("/").pop().replace(".html", ""); // e.g. "Title_02052025"
const workerUrl = "https://wasmachstduso.com/likes";

async function fetchLikes() {
try {
    const res = await fetch(`${workerUrl}/?id=${postId}`);
    const data = await res.json();
    document.getElementById("like-count").textContent = data.likes;
} catch (err) {
    console.error("Failed to load likes", err);
}
}

async function likePost() {
try {
    const res = await fetch(`${workerUrl}/?id=${postId}`, {
    method: "POST"
    });
    const data = await res.json();
    document.getElementById("like-count").textContent = data.likes;
} catch (err) {
    console.error("Failed to like post", err);
}
}

// Load like count on page load
fetchLikes();
