// 재사용 UI 컴포넌트 (HTML 문자열 반환)
import { esc, site } from "./layout.mjs";
import { heroVisual } from "./visuals.mjs";

export function breadcrumb(crumbs) {
  const items = crumbs
    .map((c, i) => {
      const last = i === crumbs.length - 1;
      return `<li>${
        last
          ? `<span aria-current="page">${esc(c.label)}</span>`
          : `<a href="${c.href}">${esc(c.label)}</a>`
      }</li>`;
    })
    .join("");
  return `<nav class="breadcrumb container" aria-label="경로"><ol>${items}</ol></nav>`;
}

export function hero({ eyebrow, h1, lead, ctas = [], meta = [], visual }) {
  const cta = ctas
    .map(
      (c) =>
        `<a class="btn ${c.variant || "btn--ghost"} btn--lg" href="${c.href}">${esc(c.label)}</a>`
    )
    .join("");
  const metaHtml = meta.length
    ? `<div class="hero__meta">${meta
        .map((m) => `<span>${m}</span>`)
        .join("")}</div>`
    : "";
  const content = `
    <div class="hero__content">
      ${eyebrow ? `<span class="eyebrow" style="color:var(--c-gold-2)">${esc(eyebrow)}</span>` : ""}
      <h1>${esc(h1)}</h1>
      ${lead ? `<p class="hero__lead">${esc(lead)}</p>` : ""}
      ${cta ? `<div class="hero__cta">${cta}</div>` : ""}
      ${metaHtml}
    </div>`;
  const visualHtml = visual
    ? `<div class="hero__visual" aria-hidden="false">${heroVisual(visual)}</div>`
    : "";
  return `
<section class="hero${visual ? " hero--split" : ""}">
  <div class="container hero__inner">
    ${content}
    ${visualHtml}
  </div>
</section>`;
}

export function section({ tint = false, eyebrow, h2, lead, inner }) {
  return `
<section class="section${tint ? " section--tint" : ""}">
  <div class="container">
    ${h2 ? `<div class="section__head">${
      eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ""
    }<h2>${esc(h2)}</h2>${lead ? `<p class="muted">${esc(lead)}</p>` : ""}</div>` : ""}
    ${inner}
  </div>
</section>`;
}

export function cardGrid(cards, cols = 3) {
  const items = cards
    .map(
      (c) => `
    <a class="card card--link" href="${c.href}">
      ${c.tag ? `<span class="card__tag">${esc(c.tag)}</span>` : ""}
      <h3>${esc(c.title)}</h3>
      ${c.desc ? `<p>${esc(c.desc)}</p>` : ""}
    </a>`
    )
    .join("");
  return `<div class="grid grid--${cols}">${items}</div>`;
}

export function chips(links) {
  const items = links
    .map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`)
    .join("");
  return `<ul class="chips">${items}</ul>`;
}

export function checklist(items) {
  return `<ul class="checklist">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

export function faqList(faqs) {
  return `<div class="faq">${faqs
    .map(
      (f) =>
        `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`
    )
    .join("")}</div>`;
}

// 지역별 답변 블록 (서울/경기/인천 차별화)
export function answerBlocks(blocks) {
  const cls = { 서울: "badge--seoul", 경기: "badge--gyeonggi", 인천: "badge--incheon" };
  return blocks
    .map(
      (b) => `
  <div class="answer-block">
    <h3><span class="badge ${cls[b.region] || ""}">${esc(b.region)}</span> ${esc(b.title)}</h3>
    <p>${esc(b.text)}</p>
  </div>`
    )
    .join("");
}

// 본문 하단 문의 유도 (전화 + 텔레그램)
export function inquiryCta() {
  return `
<section class="section section--tint">
  <div class="container">
    <div class="footer-cta" style="margin:0">
      <div class="footer-cta__text">
        <h2>예약 및 제휴 문의</h2>
        <p>전화예약 ${esc(site.phone)} · 또는 텔레그램으로 문의하세요.</p>
      </div>
      <div class="footer-cta__actions">
        <a class="btn btn--orange btn--lg" href="${site.phoneHref}">전화예약 ${esc(site.phone)}</a>
        <a class="btn btn--gold btn--lg" href="/contact/">문의 안내 보기</a>
      </div>
    </div>
  </div>
</section>`;
}

// 요금 안내 (프리미엄 다크 섹션) — 메인·전 지역 공통
export function priceTable(noteLink = "/check/") {
  const cards = site.pricing
    .map((p) => {
      const feat = p.featured;
      return `
      <div class="price-card${feat ? " price-card--featured" : ""}">
        ${feat ? `<span class="price-card__badge">추천</span>` : ""}
        <h3>${esc(p.label)}</h3>
        <div class="price-card__amount">${esc(p.amount)}<span>원</span></div>
        <div class="price-card__time">${esc(p.time)}</div>
        <p>${esc(p.desc)}</p>
        <a class="btn ${feat ? "btn--gold" : "btn--invert"} btn--block" href="${site.phoneHref}">예약 문의</a>
      </div>`;
    })
    .join("");
  return `
<section class="section price">
  <div class="container">
    <div class="section__head price__head">
      <span class="eyebrow">요금 안내</span>
      <h2>코스 시간으로 보는 기본 요금</h2>
      <p>관리 시간(60·90·120분)을 기준으로 정리한 기본 금액입니다. 표시되지 않은 별도 비용은 두지 않는 것을 원칙으로 안내합니다.</p>
    </div>
    <div class="price-grid">${cards}</div>
    <p class="price-note">방문 지역과 시간대, 이동 거리에 따라 최종 금액은 통화 시 확정됩니다. <a href="${noteLink}">요금·예약 기준 자세히 보기 →</a></p>
  </div>
</section>`;
}

// 롱테일 주제 내부링크 — 메인·전 지역 공통(이용 장소·예약 전 확인·질문 클러스터로 연결)
const LONGTAIL_TOPICS = [
  { label: "자택 방문 마사지 이용 기준", href: "/use/home/" },
  { label: "호텔·숙소 출장마사지 가능 여부", href: "/use/hotel/" },
  { label: "오피스텔 출장마사지 방문 기준", href: "/use/officetel/" },
  { label: "업무지구 야간 예약 안내", href: "/use/night/" },
  { label: "역세권 기준으로 찾는 방법", href: "/questions/station-area/" },
  { label: "외곽·공항 지역 이용 기준", href: "/questions/airport-island/" },
  { label: "추가 이동비 기준 확인", href: "/check/move-fee/" },
  { label: "예약 가능 시간 확인", href: "/check/time/" },
  { label: "개인정보 처리 기준 안내", href: "/check/privacy/" },
  { label: "불법·선정적 서비스 불가 안내", href: "/check/legal/" },
];
export function longtailTopics(extra = []) {
  return section({
    tint: true,
    eyebrow: "함께 찾는 주제",
    h2: "이런 주제도 확인해 보세요",
    inner: chips([...extra, ...LONGTAIL_TOPICS]),
  });
}

// 표준 체크리스트(예약 전 확인)
export const STANDARD_CHECKLIST = [
  "방문 주소를 정확히 확인했나요?",
  "공동현관 또는 건물 출입 방식이 있나요?",
  "호텔·숙소 이용 가능 여부를 확인했나요?",
  "오피스텔 관리 규정이 있나요?",
  "주차 또는 차량 이동이 필요한 지역인가요?",
  "외곽 지역 추가 이동비가 있나요?",
  "공항·도서 지역 사전 예약이 필요한가요?",
  "예약 변경 기준을 확인했나요?",
  "개인정보 처리 기준을 확인했나요?",
  "불법·선정적 서비스 불가 안내를 확인했나요?",
];
