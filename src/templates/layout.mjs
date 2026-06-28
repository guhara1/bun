// 공통 레이아웃: head/메타/스키마/헤더/푸터
// 모든 페이지가 이 레이아웃을 거치므로 SEO·푸터·업체정보가 일관됩니다.
import site from "../data/site.json" with { type: "json" };

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// 메타 디스크립션은 80자 이내(공백 포함)로 강제합니다.
export function clampDesc(desc) {
  const d = String(desc || "").replace(/\s+/g, " ").trim();
  if ([...d].length <= 80) return d;
  return [...d].slice(0, 79).join("").trim() + "…";
}

const abs = (path) => site.baseUrl + (path.startsWith("/") ? path : "/" + path);

// ---- 스키마 빌더 ---------------------------------------------------------
function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": abs("/#organization"),
    name: site.legalName,
    url: site.baseUrl,
    telephone: site.phone,
    areaServed: site.areaServed,
    sameAs: Object.values(site.social),
    logo: {
      "@type": "ImageObject",
      url: abs("/assets/og-default.svg"),
      width: 1200,
      height: 630,
    },
  };
}

function breadcrumbSchema(crumbs) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: abs(c.href),
    })),
  };
}

function webPageSchema({ title, description, path, image }) {
  return {
    "@type": "WebPage",
    "@id": abs(path) + "#webpage",
    url: abs(path),
    name: title,
    description: clampDesc(description),
    inLanguage: "ko-KR",
    isPartOf: { "@id": abs("/#website") },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: image ? abs(image) : abs("/assets/og-default.svg"),
    },
    publisher: { "@id": abs("/#organization") },
  };
}

function faqSchema(faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function buildSchemaGraph(page) {
  const graph = [
    {
      "@type": "WebSite",
      "@id": abs("/#website"),
      url: site.baseUrl,
      name: site.name,
      inLanguage: "ko-KR",
      publisher: { "@id": abs("/#organization") },
    },
    organizationSchema(),
    webPageSchema(page),
    breadcrumbSchema(page.crumbs),
  ];
  const faq = faqSchema(page.faqs);
  if (faq) graph.push(faq);
  if (page.extraSchema) graph.push(...page.extraSchema);
  return { "@context": "https://schema.org", "@graph": graph };
}

// ---- 헤더 / 푸터 ---------------------------------------------------------
function header(activeHref) {
  const items = site.nav
    .map(
      (n) =>
        `<li><a href="${n.href}"${n.href === activeHref ? ' aria-current="page"' : ""}>${esc(
          n.label
        )}</a></li>`
    )
    .join("");
  return `
<header class="site-header">
  <div class="container site-header__bar">
    <a class="brand" href="/">
      <span class="brand__mark">B</span>
      <span class="brand__name">Bun <span>마사지</span></span>
    </a>
    <button class="btn btn--ghost nav-toggle" aria-expanded="false" aria-controls="site-nav" onclick="this.nextElementSibling.classList.toggle('is-open');this.setAttribute('aria-expanded',this.nextElementSibling.classList.contains('is-open'))">메뉴</button>
    <nav class="site-nav" id="site-nav" aria-label="주 메뉴">
      <ul class="site-nav__list">${items}</ul>
    </nav>
    <a class="header-phone" href="${site.phoneHref}"><span>전화예약</span> ${esc(site.phone)}</a>
  </div>
</header>`;
}

const tgIcon = `<svg class="btn__ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3 18.7 19.5c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.3-.1-.5-.6-.2L6.4 13.2l-4.8-1.5c-1-.3-1-1 .2-1.5l18.7-7.2c.9-.3 1.6.2 1.3 1.3z"/></svg>`;

function footer() {
  const quick = site.nav
    .slice(1, 7)
    .map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`)
    .join("");
  const regions = site.nav
    .slice(6, 9)
    .map((n) => `<li><a href="${n.href}">${esc(n.label)} 출장마사지 안내</a></li>`)
    .join("");
  return `
<footer class="site-footer">
  <div class="container">
    <!-- 오렌지 텔레그램 CTA: 웹사이트 제작문의 / 제휴문의 -->
    <section class="footer-cta" aria-label="제작 및 제휴 문의">
      <div class="footer-cta__text">
        <h2>웹사이트 제작 · 제휴 문의</h2>
        <p>텔레그램으로 빠르게 상담하세요. 사이트 제작과 제휴 제안을 환영합니다.</p>
      </div>
      <div class="footer-cta__actions">
        <a class="btn btn--orange btn--lg" href="${site.telegram.website}" target="_blank" rel="noopener nofollow">${tgIcon} 웹사이트 제작문의</a>
        <a class="btn btn--orange btn--lg" href="${site.telegram.partnership}" target="_blank" rel="noopener nofollow">${tgIcon} 제휴문의</a>
      </div>
    </section>

    <div class="footer-grid">
      <div class="footer-biz">
        <h3>업체 정보</h3>
        <p>상호 <b>${esc(site.name)}</b></p>
        <p>전화예약</p>
        <p class="footer-phone"><a href="${site.phoneHref}" style="color:#fff">${esc(site.phone)}</a></p>
        <p>서비스 지역 · 서울 · 경기 · 인천 수도권 전역</p>
      </div>
      <div>
        <h3>바로가기</h3>
        <ul>${quick}</ul>
      </div>
      <div>
        <h3>지역별 안내</h3>
        <ul>${regions}
          <li><a href="/policy/">운영 기준 · 개인정보 처리방침</a></li>
          <li><a href="/contact/">문의하기</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} ${esc(site.name)}. 불법·선정적 서비스를 제공하거나 알선하지 않습니다.</span>
      <span><a href="/policy/privacy/">개인정보 처리방침</a> · <a href="/sitemap.xml">사이트맵</a></span>
    </div>
  </div>
</footer>`;
}

// ---- 페이지 렌더 ---------------------------------------------------------
// page = { title, description, path, h1, crumbs, faqs?, image?, extraSchema?, body }
export function renderPage(page) {
  const description = clampDesc(page.description);
  const canonical = abs(page.path);
  const ogImage = abs(page.image || "/assets/og-default.svg");
  const schema = JSON.stringify(buildSchemaGraph({ ...page, description }));
  const robots = page.noindex ? "noindex,follow" : "index,follow";

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<!-- 선호 썸네일을 og:image와 스키마 ImageObject로 모두 명시 -->
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="theme-color" content="#161210">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">${schema}</script>
</head>
<body>
<a class="skip-link" href="#main">본문 바로가기</a>
${header(page.path === "/" ? "/" : page.activeNav || page.path)}
<main id="main">
${page.body}
</main>
${footer()}
</body>
</html>`;
}

export { esc, abs, site };
