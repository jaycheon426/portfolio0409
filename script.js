const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function setToast(message) {
  const el = $("#toast");
  if (!el) return;

  el.textContent = message;
  el.classList.add("is-show");

  window.clearTimeout(setToast._t);
  setToast._t = window.setTimeout(() => el.classList.remove("is-show"), 2400);
}

function setTheme(next) {
  const theme = next === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);

  const toggle = $(".theme-toggle");
  if (toggle) {
    toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    toggle.querySelector(".theme-toggle__icon").textContent = theme === "dark" ? "◐" : "◑";
  }
}

function initTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return setTheme(stored);

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
}

function initHeaderElevate() {
  const header = $(".header");
  if (!header) return;

  const update = () => header.classList.toggle("is-elevated", window.scrollY > 6);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initMobileNav() {
  const btn = $(".nav__toggle");
  const menu = $("#navMenu");
  if (!btn || !menu) return;

  const open = () => {
    menu.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    menu.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  btn.addEventListener("click", () => {
    const isOpen = menu.classList.contains("is-open");
    if (isOpen) close();
    else open();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  menu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) close();
  });

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("is-open")) return;
    if (e.target.closest(".nav")) return;
    close();
  });
}

function initSmoothScroll() {
  const links = $$('a[href^="#"]')
    .filter((a) => a.getAttribute("href")?.length > 1)
    .filter((a) => !a.hasAttribute("data-disabled"));

  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", `#${id}`);
    });
  });
}

function initScrollSpy() {
  const navLinks = $$(".nav__link")
    .filter((a) => a.getAttribute("href")?.startsWith("#"))
    .filter((a) => a.getAttribute("href") !== "#top");
  if (navLinks.length === 0) return;

  const idToLink = new Map(
    navLinks.map((a) => [a.getAttribute("href").slice(1), a]),
  );

  const sections = Array.from(idToLink.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      setActive(visible.target.id);
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: [0.05, 0.2, 0.6] },
  );

  sections.forEach((s) => io.observe(s));
}

function initStackFilter() {
  const pills = $$(".stack__pill");
  const cards = $$(".stackCard");
  if (pills.length === 0 || cards.length === 0) return;

  const apply = (filter) => {
    pills.forEach((p) => p.classList.toggle("is-active", p.dataset.filter === filter));

    cards.forEach((c) => {
      const cat = c.dataset.category;
      const show = filter === "all" || filter === cat;
      c.classList.toggle("is-hidden", !show);
      c.style.display = show ? "" : "none";
    });
  };

  pills.forEach((p) => {
    p.addEventListener("click", () => apply(p.dataset.filter || "all"));
  });

  apply("all");
}

function initCountUp() {
  const els = $$("[data-count]");
  if (els.length === 0) return;

  const animateOne = (el) => {
    const target = Number(el.dataset.count || 0);
    if (!Number.isFinite(target)) return;
    const start = 0;
    const duration = 900;
    const t0 = performance.now();

    const tick = (t) => {
      const p = clamp((t - t0) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(start + (target - start) * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        animateOne(e.target);
        obs.unobserve(e.target);
      });
    },
    { threshold: 0.4 },
  );

  els.forEach((el) => io.observe(el));
}

function initContactForm() {
  const form = $("#contactForm");
  const hint = $("#formHint");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();

    if (!name || !email || !message) {
      if (hint) hint.textContent = "모든 입력값을 채워주세요.";
      setToast("입력값을 확인해주세요.");
      return;
    }

    form.reset();
    if (hint) hint.textContent = "메시지가 저장되었습니다. (데모)";
    setToast("보내기 완료! (로컬 데모)");
  });
}

function initDisabledLinks() {
  $$("[data-disabled]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      setToast("이 링크는 예시입니다. 주소를 바꿔주세요.");
    });
  });
}

function initFooterYear() {
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());
}

function main() {
  initTheme();
  initHeaderElevate();
  initMobileNav();
  initSmoothScroll();
  initScrollSpy();
  initStackFilter();
  initCountUp();
  initContactForm();
  initDisabledLinks();
  initFooterYear();

  const toggle = $(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const cur = document.documentElement.dataset.theme;
      setTheme(cur === "dark" ? "light" : "dark");
      setToast(cur === "dark" ? "라이트 모드" : "다크 모드");
    });
  }
}

document.addEventListener("DOMContentLoaded", main);
