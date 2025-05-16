const viewPostId = window.location.pathname.split("/").pop().replace(".html", ""); // e.g. "Title_02052025"
const viewWorkerUrl = "https://wasmachstduso.com/views";

fetch(`${viewWorkerUrl}/?id=${viewPostId}`)
.then(res => {
    if (!res.ok) throw new Error("Failed to load view count");
    return res.json();
})
.then(data => {
    const viewEl = document.getElementById("view-counter");
    if (viewEl) {
    viewEl.textContent = `${data.views} Aufrufe`;
    }
})
.catch(err => {
    console.error("View counter error:", err);
});
