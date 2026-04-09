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
  "finance-campaign": {
    title: "캠페인 성과 분석 (금융)",
    meta: "Targeting · Validation · MMP(adbrix)",
    images: [
      { src: "images/finance-detail-1.png", alt: "타겟 세그먼트 정의 및 비교" },
      { src: "images/finance-detail-2.png", alt: "캠페인 전후 성과 및 기여도 분석" },
    ],
    paragraphs: [
      "기존 금융 서비스 이용자의 앱 이용 행태를 분석해 신규 가입 가능성이 높은 타겟 그룹을 정의했습니다. 1st Party 데이터와 3rd Party 데이터를 결합해 데모·활동성·관심사 카테고리 관점에서 세그먼트를 구성했습니다.",
      "추천 타겟으로 진행한 캠페인 결과, 기존 대비 최대 150배 높은 가입 전환을 기록했고(클릭 대비 전환율도 최대 175배), 캠페인 전후 평균 가입자 비중이 7.17% → 25.65%로 3.6배 상승했습니다. 추천 세그먼트의 캠페인 기여도는 62.04%로 핵심 타겟의 유효성을 검증했습니다.",
    ],
  },
  "beauty-rfm": {
    title: "유저 특성 분석 & 타겟 도출 (커머스)",
    meta: "RFM · Audience · Targeting Options",
    images: [
      { src: "images/beauty-detail-1.png", alt: "RFM 기반 4그룹 설계" },
      { src: "images/beauty-detail-2.png", alt: "그룹별 특성 분석 및 타겟 옵션" },
    ],
    paragraphs: [
      "뷰티 커머스 앱 헬스 카테고리 구매 전환 극대화를 위해, 최근 6개월 이너뷰티 제품 구매자를 대상으로 RFM 모형을 적용했습니다. Heavy/Mid/Light/One-time-buy 4개 그룹으로 구매 관여도를 구분했습니다.",
      "각 그룹의 데모·라이프스테이지·관심사, 건강관리 유형별 관여도 등을 다각도로 분석해 타겟 오디언스 세그먼트를 도출하고, DMP뿐 아니라 일반 매체에서도 활용 가능한 타겟팅 옵션을 제안했습니다.",
    ],
  },
  "auto-ga": {
    title: "웹사이트 유입·전환 분석 (자동차 런칭)",
    meta: "Google Analytics · UTM · Event Tracking",
    images: [
      { src: "images/auto-ga-detail-1.png", alt: "엔진별 유입/전환 성과 요약" },
      { src: "images/auto-ga-detail-2.png", alt: "웹사이트 행동 퍼널(클릭/스크롤) 분석" },
    ],
    paragraphs: [
      "국내 자동차 런칭 캠페인의 엔진별 성과 분석을 위해 Google Analytics 기반 분석을 수행했습니다. 엔진별 타겟팅/소재 제작이 필요해, 사전 이벤트 트래킹 데이터를 활용해 엔진별 타겟 프로파일링(세그먼트) 분석을 선행했습니다.",
      "유입 및 전환 단계별 상세 성과 분석을 위해 UTM 파라미터를 설계하고, 클릭/스크롤/옵션 선택/차량 이미지 클릭 등 웹사이트 행동 및 온라인 견적 완료 전환을 추적하도록 태깅을 설계했습니다. 유입부터 전환까지 연결된 퍼널 관점으로 성과를 해석했습니다.",
    ],
  },
  "auto-dashboard": {
    title: "마케팅 성과 자동화 대시보드 설계",
    meta: "Table Design · Spec · Tableau (설계/커뮤니케이션)",
    images: [
      { src: "images/auto-dashboard-detail-1.png", alt: "적재 테이블 설계 및 매칭 구조" },
      { src: "images/auto-dashboard-detail-2.png", alt: "대시보드 화면 설계/명세 샘플" },
    ],
    paragraphs: [
      "Google Analytics 리포팅 데이터와 일별 광고 성과 데이터를 일자별로 매칭하기 전, 광고·웹로그 데이터 적재를 위한 테이블을 설계하고 개발팀과 커뮤니케이션을 수행했습니다.",
      "유입 경로/데모/소재/매체별 효율, 전환(온라인 견적 완료) 등을 하나의 대시보드에서 모니터링할 수 있도록 화면 설계서와 기능 명세서를 작성했습니다. 구축은 별도 엔지니어가 진행했으며, 설계가 구현되도록 전 과정 커뮤니케이션을 담당했습니다.",
    ],
  },
  "commerce-behavior": {
    title: "모바일 앱 유저 행동 데이터 분석",
    meta: "Journey · Retention · Churn Definition",
    images: [
      { src: "images/commerce-detail-1.png", alt: "커머스 앱 시장/경쟁 앱 비교" },
      { src: "images/commerce-detail-2.png", alt: "신규/헤비/이탈 유저 리텐션 및 활동성 분석" },
    ],
    paragraphs: [
      "신규 유저 최적화와 기존 유저 리텐션 증대를 위해, 유저 Journey에 따라 커머스 앱 시장 현황 분석, 자사/경쟁 앱 비교, 신규/헤비/이탈(휴면) 유저의 이용 행태를 분석했습니다.",
      "쇼핑 업종 MAU 상위 20개 앱을 기준으로 브랜드 인지도/활동성 지표로 퍼포먼스 매트릭스를 산출해 현황을 점검하고, 설치 이후 기간별 유저 비율 변화로 카테고리별 리텐션 우수 그룹을 분석했습니다. 이탈을 정의하고 이탈 직전 3개월 활동성 변화를 추적해 개선 포인트를 도출했습니다.",
    ],
  },
  "sql-samples": {
    title: "SQL 활용 샘플",
    meta: "Funnel · Cross-purchase · Retention",
    images: [
      { src: "images/sql-detail-1.png", alt: "구매 단계 퍼널 분석 결과 예시" },
      { src: "images/sql-detail-2.png", alt: "리텐션/코호트 분석 결과 예시" },
    ],
    paragraphs: [
      "실무에서 사용한 리텐션·코호트·퍼널 등 다양한 방법론의 쿼리를 구현하고, 데이터 정제를 수행했습니다. (분석 테이블/컬럼명은 가상의 이름으로 대체)",
      "브랜드별 구매 단계 이탈(조회→장바구니→구매) 현황, 경쟁사 식별을 위한 교차 구매율(Cross-purchase) 분석, 기간별 리텐션 비교 등 의사결정에 직접 쓰이는 형태로 결과를 정리했습니다.",
    ],
    code: [
      "-- 1) Funnel: 조회 → 장바구니 → 구매 전환율",
      "WITH steps AS (",
      "  SELECT user_id, event_time,",
      "    CASE",
      "      WHEN event_name = 'view_item' THEN 1",
      "      WHEN event_name = 'add_to_cart' THEN 2",
      "      WHEN event_name = 'purchase' THEN 3",
      "    END AS step",
      "  FROM events",
      "  WHERE event_time >= :start AND event_time < :end",
      "),",
      "funnel AS (",
      "  SELECT user_id, MAX(step) AS max_step",
      "  FROM steps",
      "  GROUP BY 1",
      ")",
      "SELECT",
      "  COUNT(*) FILTER (WHERE max_step >= 1) AS viewers,",
      "  COUNT(*) FILTER (WHERE max_step >= 2) AS cart_users,",
      "  COUNT(*) FILTER (WHERE max_step >= 3) AS purchasers",
      "FROM funnel;",
      "",
      "-- 2) Cross-purchase: A브랜드 구매자 중 경쟁사 구매 비율",
      "WITH a_buyers AS (",
      "  SELECT DISTINCT user_id",
      "  FROM orders",
      "  WHERE brand = 'A' AND category = 'shoes'",
      "),",
      "competitor AS (",
      "  SELECT o.brand, COUNT(DISTINCT o.user_id) AS buyers",
      "  FROM orders o",
      "  JOIN a_buyers a ON a.user_id = o.user_id",
      "  WHERE o.brand <> 'A' AND o.category = 'shoes'",
      "  GROUP BY 1",
      ")",
      "SELECT brand, buyers",
      "FROM competitor",
      "ORDER BY buyers DESC",
      "LIMIT 10;",
      "",
      "-- 3) Retention (주차): 첫 방문 주 기준 재방문율",
      "WITH first_visit AS (",
      "  SELECT user_id, DATE_TRUNC('week', MIN(event_time)) AS cohort_week",
      "  FROM events",
      "  WHERE event_name = 'app_open'",
      "  GROUP BY 1",
      "),",
      "activity AS (",
      "  SELECT e.user_id,",
      "    DATE_TRUNC('week', e.event_time) AS active_week",
      "  FROM events e",
      "  WHERE e.event_name = 'app_open'",
      "  GROUP BY 1,2",
      ")",
      "SELECT",
      "  f.cohort_week,",
      "  DATE_PART('week', a.active_week - f.cohort_week) AS week_n,",
      "  COUNT(DISTINCT a.user_id) AS active_users",
      "FROM first_visit f",
      "JOIN activity a ON a.user_id = f.user_id",
      "GROUP BY 1,2",
      "ORDER BY 1,2;",
    ].join(\"\\n\"),
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
    if (data.code) {
      const pre = document.createElement("pre");
      pre.className = "codeBlock";
      pre.textContent = data.code;
      bodyEl.appendChild(pre);
    }
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
      open(card.dataset.project);
    });

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

function initProjectFilter() {
  const root = $("#projects");
  if (!root) return;

  const pills = $$("[data-project-filter]", root);
  const cards = $$(".projectCard[data-group]", root);
  if (pills.length === 0 || cards.length === 0) return;

  const apply = (filter) => {
    pills.forEach((p) => p.classList.toggle("is-active", p.dataset.projectFilter === filter));
    cards.forEach((c) => {
      const group = c.dataset.group;
      const show = filter === "all" || filter === group;
      c.style.display = show ? "" : "none";
    });
  };

  pills.forEach((p) => {
    p.addEventListener("click", () => apply(p.dataset.projectFilter || "all"));
  });

  apply("all");
}

function main() {
  initTheme();
  initHeaderElevate();
  initMobileNav();
  initProjectModals();
  initProjectFilter();
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
