// Site header: slides away when scrolling down, comes back on any upward scroll.
// Also drives the burger menu on the index page (if present).
(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");
  const HIDE_AFTER = 80;   // px from top before the header may hide
  const DELTA = 6;         // ignore tiny scroll jitters

  function setMenu(open) {
    if (!menu || !burger) return;
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    if (open) header.classList.remove("hidden");
  }

  if (burger && menu) {
    burger.addEventListener("click", (e) => { e.stopPropagation(); setMenu(!menu.classList.contains("open")); });
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !burger.contains(e.target)) setMenu(false);
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  }

  let lastY = window.scrollY, ticking = false;
  function update() {
    ticking = false;
    const y = Math.max(0, window.scrollY);          // iOS rubber-banding can report negatives
    const menuOpen = menu && menu.classList.contains("open");
    if (menuOpen || y < HIDE_AFTER) header.classList.remove("hidden");
    else if (y > lastY + DELTA) header.classList.add("hidden");
    else if (y < lastY - DELTA) header.classList.remove("hidden");
    if (Math.abs(y - lastY) > DELTA || y < HIDE_AFTER) lastY = y;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
})();
