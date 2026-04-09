const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

function updateBodyScrollLock() {
  const menu = $("#navMenu");
  const modal = $("#projectModal");
  const navOpen = menu?.classList.contains("is-open");
  const modalOpen = modal?.classList.contains("is-open");
  document.body.style.overflow = navOpen || modalOpen ? "hidden" : "";
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
    updateBodyScrollLock();
  };

  const close = () => {
    menu.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    updateBodyScrollLock();
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

const PROJECT_MODAL_IMG_FALLBACK = "images/project-placeholder.svg";

const PROJECT_MODAL_DATA = {
  funnel: {
    title: "구매 퍼널 분석 & 전환 개선",
    meta: "Funnel · SQL · Insight",
    images: [
      { src: "images/funnel-detail-1.png", alt: "퍼널 단계별 전환·이탈 지표 요약" },
      { src: "images/funnel-detail-2.png", alt: "세그먼트별 이탈 원인 비교" },
    ],
    paragraphs: [
      "이벤트 로그를 정제해 단계별 퍼널을 정의하고, 단계 간 이탈이 큰 구간을 우선순위로 잡았습니다. 디바이스·유입 채널·첫 구매 여부 등으로 세그먼트를 나눠 ‘어디서’ ‘누가’ 이탈하는지 수치로 설명했습니다.",
      "가설 기반으로 개선안(카피, 결제 단계 UX, 장바구니 리마인드 등)과 함께 모니터링할 지표·대시보드 초안을 제안해, 이후 실험과 성과 측정으로 이어질 수 있게 정리했습니다.",
    ],
  },
  cohort: {
    title: "리텐션 코호트 분석",
    meta: "Cohort · SQL · Segmentation",
    images: [
      { src: "images/cohort-detail-1.png", alt: "코호트 리텐션 히트맵" },
      { src: "images/cohort-detail-2.png", alt: "액티베이션 행동과 리텐션 상관" },
    ],
    paragraphs: [
      "첫 핵심 행동(가입·첫 구매 등) 시점을 기준으로 코호트를 구성하고, 주차·월 단위 리텐션 곡선을 비교했습니다. 초기 이탈이 큰 코호트와 장기 잔존이 높은 코호트의 행동 차이를 SQL로 집계해 패턴을 도출했습니다.",
      "‘액티베이션’으로 정의할 행동을 데이터로 좁힌 뒤, 해당 행동 완료율을 올리는 캠페인·온보딩 실험 아이디어와 측정 지표를 제안했습니다.",
    ],
  },
  dashboard: {
    title: "KPI 대시보드 구축",
    meta: "BI · Dashboard · Monitoring",
    images: [
      { src: "images/dashboard-detail-1.png", alt: "KPI 대시보드 개요 화면" },
      { src: "images/dashboard-detail-2.png", alt: "드릴다운 및 필터 예시" },
    ],
    paragraphs: [
      "이해관계자 인터뷰로 ‘매일 보는 숫자’와 의사결정 시나리오를 정리한 뒤, 지표 정의(분자·분모·집계 주기)를 문서화했습니다. Tableau/Power BI 등에서 일관된 필터·드릴다운 구조로 볼 수 있게 설계했습니다.",
      "알림·모니터링 기준(임계치, 비교 기간)을 합의하고, 리포트 대신 셀프서비스로 확인 가능한 화면으로 옮겨 운영 문의를 줄이는 방향으로 마무리했습니다.",
    ],
  },
};

function setModalImage(img, src, alt) {
  img.alt = alt || "";
  img.loading = "lazy";
  img.decoding = "async";
  img.onerror = () => {
    img.onerror = null;
    img.src = PROJECT_MODAL_IMG_FALLBACK;
  };
  img.src = src;
}

function initProjectModals() {
  const modal = $("#projectModal");
  const dialog = $(".projectModal__dialog", modal);
  const titleEl = $("#projectModalTitle");
  const metaEl = $("#projectModalMeta");
  const bodyEl = $("#projectModalBody");
  const img1 = $("#projectModalImg1");
  const img2 = $("#projectModalImg2");
  const closeBtn = $("#projectModalClose");
  if (!modal || !dialog || !titleEl || !metaEl || !bodyEl || !img1 || !img2) return;

  let lastFocus = null;

  const close = () => {
    if (!modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("hidden", "");
    modal.setAttribute("aria-hidden", "true");
    updateBodyScrollLock();
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
    lastFocus = null;
  };

  const open = (id) => {
    const data = PROJECT_MODAL_DATA[id];
    if (!data) return;
    lastFocus = document.activeElement;
    titleEl.textContent = data.title;
    metaEl.textContent = data.meta;
    bodyEl.replaceChildren();
    data.paragraphs.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      bodyEl.appendChild(p);
    });
    const [a, b] = data.images;
    setModalImage(img1, a.src, a.alt);
    setModalImage(img2, b.src, b.alt);
    modal.removeAttribute("hidden");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    updateBodyScrollLock();
    (closeBtn || dialog).focus({ preventScroll: true });
  };

  $$(".projectCard[data-project]").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".projectCard__actions")) return;
      open(card.dataset.project);
    });

    const actions = $(".projectCard__actions", card);
    if (actions) {
      actions.addEventListener("click", (e) => e.stopPropagation());
    }

    card.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (e.target !== card) return;
      e.preventDefault();
      open(card.dataset.project);
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-modal-close]")) close();
  });

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Escape") return;
      if (!modal.classList.contains("is-open")) return;
      e.preventDefault();
      close();
    },
    true,
  );
}

function main() {
  initTheme();
  initHeaderElevate();
  initMobileNav();
  initProjectModals();
  initSmoothScroll();
  initScrollSpy();
  initStackFilter();
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
