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
