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
  taxonomy: {
    title: "Taxonomy & Dashboard",
    meta: "Data Architecture · UTM · Tableau",
    images: [
      { src: "images/taxonomy-detail-1.png", alt: "이벤트/프로퍼티 스키마 샘플" },
      { src: "images/taxonomy-detail-2.png", alt: "대시보드 UI 샘플" },
    ],
    paragraphs: [
      "단일 뷰(Single View)와 데이터 기반 문화를 만들기 위해, 채널 분류를 위한 UTM 전략을 정리하고 이벤트/프로퍼티 택소노미를 설계했습니다. 추적 정의가 바뀌어도 운영이 흔들리지 않도록 용어·규칙을 문서화해 커뮤니케이션 비용을 낮췄습니다.",
      "정의된 지표가 실제로 ‘의사결정에 쓰이게’ 만드는 것을 목표로 Tableau 대시보드(UI/드릴다운)를 구성해 공유했습니다. 이해관계자들이 같은 화면에서 같은 숫자를 보고 빠르게 합의할 수 있도록 기준과 맥락을 함께 제공했습니다.",
    ],
  },
  funnel: {
    title: "Funnel & Cohort Analysis",
    meta: "SQL · Sequential Funnel · Retention",
    images: [
      { src: "images/funnel-detail-1.png", alt: "퍼널 단계별 전환·이탈 지표 요약" },
      { src: "images/funnel-detail-2.png", alt: "세그먼트별 이탈 원인 비교" },
    ],
    paragraphs: [
      "SQL로 데이터를 추출·정제한 뒤, 순차 퍼널(Sequential Funnel)을 구성해 단계별 전환/이탈을 측정했습니다. 세그먼트를 나눠 ‘누가’ ‘어디서’ 이탈하는지 구조적으로 설명하고, 우선순위를 정해 개선 포인트를 좁혔습니다.",
      "코호트/리텐션(Stickiness) 분석을 함께 수행해 단기 전환과 장기 잔존을 동시에 보도록 설계했습니다. 결과를 액션 플랜으로 정리해, 다음 실험/최적화 루프로 이어질 수 있게 만들었습니다.",
    ],
  },
  segment: {
    title: "Segment Optimization",
    meta: "RFM · Targeting · Optimization Loop",
    images: [
      { src: "images/segment-detail-1.png", alt: "RFM 분석 모델 샘플" },
      { src: "images/segment-detail-2.png", alt: "Audience 타겟팅 및 최적화 루프" },
    ],
    paragraphs: [
      "Heavy User/Light User/Non-purchase 등 세그먼트를 정의하고, RFM 모델을 기반으로 오디언스를 구성했습니다. 각 세그먼트의 목적(재구매/활성/전환)에 맞는 메시지·채널 전략을 제안했습니다.",
      "성과를 다시 세그먼트 정의와 타겟팅 로직에 반영하는 최적화 루프를 설계해, 반복적으로 효율을 개선할 수 있는 구조를 만들었습니다.",
    ],
  },
  market: {
    title: "Competitor Analysis",
    meta: "App Market · Benchmarking · Insight",
    images: [
      { src: "images/market-detail-1.png", alt: "시장/경쟁 지표 시각화 샘플" },
      { src: "images/market-detail-2.png", alt: "벤치마킹 인사이트 요약" },
    ],
    paragraphs: [
      "모바일 앱 시장 및 경쟁 서비스를 비교하기 위해 지표 체계를 정리하고, 핵심 KPI와 사용성/성장 지표를 시각화했습니다. 단순 비교가 아니라 ‘우리 서비스가 어디에서 이길 수 있는지’에 초점을 맞춰 분석을 구성했습니다.",
      "벤치마킹 결과를 실행 가능한 제안(우선순위/기대효과/리스크) 형태로 정리해 공유했습니다.",
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
