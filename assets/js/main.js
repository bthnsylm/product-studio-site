// Product Studio Site — main.js
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

function setTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const icon = $("#themeIcon");
  if(icon) icon.textContent = theme === "dark" ? "🌙" : "☀️";
}
function initTheme(){
  const saved = localStorage.getItem("theme");
  if(saved){ setTheme(saved); return; }
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
}

function initDrawer(){
  const burger = $("#burger");
  const drawer = $("#drawer");
  const closeBtn = $("#drawerClose");
  if(!burger || !drawer) return;

  const open = () => { drawer.classList.add("open"); burger.setAttribute("aria-expanded","true"); drawer.setAttribute("aria-hidden","false"); };
  const close = () => { drawer.classList.remove("open"); burger.setAttribute("aria-expanded","false"); drawer.setAttribute("aria-hidden","true"); };

  burger.addEventListener("click", () => drawer.classList.contains("open") ? close() : open());
  if(closeBtn) closeBtn.addEventListener("click", close);
  drawer.addEventListener("click", (e) => { if(e.target === drawer) close(); });
  $$(".drawer-panel a", drawer).forEach(a => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if(e.key === "Escape") close(); });
}

function initReveal(){
  const items = $$(".reveal");
  if(!items.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting){
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
}

function initActiveNav(){
  const path = location.pathname.split("/").pop() || "index.html";
  $$(`.nav a, .drawer a`).forEach(a => {
    const href = a.getAttribute("href");
    if(!href) return;
    const target = href.split("/").pop();
    if(target === path) a.classList.add("active");
  });
}

function initYear(){
  const y = $("#year");
  if(y) y.textContent = new Date().getFullYear();
}

/* Page transition - safe for hash links */
function initPageTransitions(){
  const overlay = $("#pageTransition");
  if(!overlay) return;

  const isSameOrigin = (url) => {
    try { return new URL(url, location.href).origin === location.origin; }
    catch { return false; }
  };

  const isSameDocumentHashNav = (href) => {
    try {
      const u = new URL(href, location.href);
      const samePath = u.pathname === location.pathname;
      const hasHash = !!u.hash && u.hash.length > 1;
      return samePath && hasHash;
    } catch { return false; }
  };

  const links = $$('a[href]:not([target="_blank"]):not([download])');
  links.forEach(a => {
    const href = a.getAttribute("href");
    if(!href) return;
    if(href.startsWith("#")) return;
    if(isSameDocumentHashNav(href)) return;
    if(href.startsWith("mailto:") || href.startsWith("tel:")) return;
    if(!isSameOrigin(href)) return;

    a.addEventListener("click", (e) => {
      if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      overlay.classList.add("on");
      const t = setTimeout(() => overlay.classList.remove("on"), 1200);

      e.preventDefault();
      setTimeout(() => { location.href = href; }, 140);
      window.addEventListener("pageshow", () => clearTimeout(t), { once:true });
    });
  });

  window.addEventListener("hashchange", () => overlay.classList.remove("on"));
  window.addEventListener("pageshow", () => overlay.classList.remove("on"));
}

function initContactForm(){
  const form = $("#contactForm");
  if(!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    const email = (fd.get("email") || "").toString().trim();
    const msg = (fd.get("message") || "").toString().trim();

    const subject = encodeURIComponent(`[Studio] New message from ${name || "Someone"}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${msg}\n`);
    window.location.href = `mailto:batuhan.saylam@icloud.com?subject=${subject}&body=${body}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  const toggle = $("#themeToggle");
  if(toggle){
    toggle.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "light";
      setTheme(cur === "light" ? "dark" : "light");
    });
  }
  initDrawer();
  initReveal();
  initActiveNav();
  initYear();
  initPageTransitions();
  initContactForm();
});
