// Bun 마사지 — 정적 사이트 생성기 (zero-dependency, node/bun 호환)
// 모든 페이지는 공통 레이아웃을 거쳐 헤더·푸터·스키마·SEO가 일관됩니다.
import { mkdir, writeFile, copyFile, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderPage, clampDesc, site } from "./src/templates/layout.mjs";
import {
  breadcrumb, hero, section, cardGrid, chips, checklist, faqList,
  answerBlocks, inquiryCta, STANDARD_CHECKLIST,
} from "./src/templates/components.mjs";

import seoul from "./src/data/seoul.json" with { type: "json" };
import gyeonggi from "./src/data/gyeonggi.json" with { type: "json" };
import incheon from "./src/data/incheon.json" with { type: "json" };
import questions from "./src/data/questions.json" with { type: "json" };
import content from "./src/data/content.json" with { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "dist");
const provinces = { seoul, gyeonggi, incheon };

const pages = []; // { path, html, noindex, priority }
const longClampWarnings = [];

function register(page) {
  const desc = clampDesc(page.description);
  if ([...String(page.description || "")].length > 80) {
    longClampWarnings.push(`${page.path} (${[...String(page.description)].length}자 → 80자 절삭)`);
  }
  const html = renderPage(page);
  pages.push({ path: page.path, html, noindex: !!page.noindex, priority: page.priority ?? 0.6 });
}

const crumb = (...parts) => [{ label: "홈", href: "/" }, ...parts];

// ---------------------------------------------------------------------------
// 메인 페이지
// ---------------------------------------------------------------------------
function buildHome() {
  const questionCards = questions.items.slice(0, 8).map((q) => ({
    title: q.menu, desc: q.lead, href: `/questions/${q.slug}/`, tag: "자주 묻는 질문",
  }));

  const regionCards = [
    { title: "서울", desc: "25개 구와 핵심 생활권·지하철역 기준으로 안내합니다.", href: "/seoul/", tag: "지역별 안내" },
    { title: "경기", desc: "31개 시군과 일반구, 신도시, 외곽 이동권을 함께 안내합니다.", href: "/gyeonggi/", tag: "지역별 안내" },
    { title: "인천", desc: "현행 구군과 2026 개편 대응, 신도시·공항·도서 지역을 안내합니다.", href: "/incheon/", tag: "지역별 안내" },
  ];

  const lifeSeoul = ["강남역·역삼", "잠실·송파", "홍대·합정", "여의도·영등포", "성수·왕십리", "용산·서울역"];
  const lifeGg = ["수원역·인계동", "분당·판교", "죽전·수지", "동탄신도시", "부천역·상동", "일산·킨텍스", "의정부역·민락", "하남·미사"];
  const lifeIc = ["송도국제도시", "구월·인천시청", "부평역·부평시장", "주안·도화", "청라국제도시", "검단신도시", "영종·운서", "인천공항"];
  const lifeChips = (province, names) =>
    chips(names.map((n) => {
      const m = provinces[province].lifeAreas.find((l) => l.name === n);
      return { label: n, href: `/${province}/life/${m ? m.slug : ""}/` };
    }));

  const body = `
${hero({
    eyebrow: "서울 · 경기 · 인천 수도권",
    h1: "서울·경기·인천 출장마사지 · 수도권 지역별 질문 안내",
    lead: "서울, 경기, 인천 모든 지역을 자주 묻는 질문, 지역, 생활권, 지하철역, 이용 장소 기준으로 확인할 수 있습니다.",
    ctas: [
      { label: "질문으로 찾기", href: "/questions/", variant: "btn--orange" },
      { label: "지역별 안내", href: "/area/", variant: "btn--gold" },
      { label: "생활권 보기", href: "/life/", variant: "btn--invert" },
      { label: "예약 전 확인", href: "/check/", variant: "btn--invert" },
    ],
    meta: [`전화예약 <b>${site.phone}</b>`, "서비스 지역 · 수도권 전역", "합법 방문형 서비스 안내"],
  })}

${section({
    eyebrow: "왜 질문형인가",
    h2: "수도권 출장마사지는 지역보다 질문이 먼저입니다",
    inner: `<div class="prose"><p class="muted">서울은 역세권과 생활권 기준이 강하고, 경기는 시군 범위가 넓어 차량 이동 기준이 중요합니다. 인천은 신도시·원도심·공항·도서 지역이 섞여 있어 예약 전 확인사항이 달라집니다. 이 사이트는 자주 묻는 질문을 먼저 보여주고, 답변 안에서 관련 지역과 생활권으로 이동하도록 구성했습니다.</p></div>`,
  })}

${section({
    tint: true,
    eyebrow: "FAQ",
    h2: "예약 전 많이 묻는 질문",
    lead: "질문을 먼저 고르면, 답변 안에서 서울·경기·인천 지역으로 연결됩니다.",
    inner: cardGrid(questionCards, 4),
  })}

${section({
    eyebrow: "지역별 안내",
    h2: "서울·경기·인천 지역별 안내",
    inner: cardGrid(regionCards, 3),
  })}

${section({
    tint: true,
    eyebrow: "생활권",
    h2: "수도권 주요 생활권",
    lead: "행정구역보다 생활권 기준으로 위치를 확인하면 빠릅니다.",
    inner: `
      <h3>서울</h3>${lifeChips("seoul", lifeSeoul)}
      <h3 style="margin-top:1.5rem">경기</h3>${lifeChips("gyeonggi", lifeGg)}
      <h3 style="margin-top:1.5rem">인천</h3>${lifeChips("incheon", lifeIc)}`,
  })}

${section({
    eyebrow: "체크리스트",
    h2: "문의 전 확인하면 좋은 내용",
    inner: `<div class="prose">${checklist(STANDARD_CHECKLIST)}</div>`,
  })}

${inquiryCta()}
`;

  register({
    title: "서울·경기·인천 출장마사지｜수도권 지역별 홈타이 질문 안내",
    description: "서울·경기·인천 출장마사지·홈타이 예약 전 자택·호텔·오피스텔·역세권·외곽 지역 기준 안내",
    path: "/",
    h1: "서울·경기·인천 출장마사지 · 수도권 지역별 질문 안내",
    crumbs: crumb(),
    faqs: questions.items.slice(0, 6).map((q) => ({ q: q.menu, a: q.lead })),
    priority: 1.0,
    body,
  });
}

// ---------------------------------------------------------------------------
// 질문 허브 + 질문 페이지
// ---------------------------------------------------------------------------
function buildQuestions() {
  const cards = questions.items.map((q) => ({
    title: q.menu, desc: q.lead, href: `/questions/${q.slug}/`, tag: "질문",
  }));
  register({
    title: "출장마사지 자주 묻는 질문｜서울·경기·인천 지역별 안내",
    description: "내 지역·호텔·오피스텔·역세권·외곽·공항 등 출장마사지 자주 묻는 질문을 지역별로 안내",
    path: "/questions/",
    h1: "수도권 출장마사지 자주 묻는 질문",
    activeNav: "/questions/",
    crumbs: crumb({ label: "질문으로 찾기", href: "/questions/" }),
    priority: 0.9,
    body: `${breadcrumb(crumb({ label: "질문으로 찾기", href: "/questions/" }))}
${section({ h2: "수도권 출장마사지 자주 묻는 질문", lead: questions.intro, inner: cardGrid(cards, 3) })}
${inquiryCta()}`,
  });

  for (const q of questions.items) {
    const crumbs = crumb(
      { label: "질문으로 찾기", href: "/questions/" },
      { label: q.menu, href: `/questions/${q.slug}/` }
    );
    const body = `${breadcrumb(crumbs)}
${hero({ eyebrow: "자주 묻는 질문", h1: q.h1, lead: q.lead, ctas: [
      { label: "전화예약 " + site.phone, href: site.phoneHref, variant: "btn--orange" },
      { label: "지역별 안내", href: "/area/", variant: "btn--invert" },
    ] })}
${section({ h2: "지역별 답변", lead: "서울·경기·인천은 확인 기준이 다릅니다.", inner: answerBlocks(q.answers) })}
${section({ tint: true, h2: "관련 지역·생활권 바로가기", inner: chips(q.links) })}
${section({ h2: "예약 전 체크리스트", inner: `<div class="prose">${checklist(STANDARD_CHECKLIST)}</div>` })}
${q.faqs && q.faqs.length ? section({ tint: true, h2: "자주 묻는 질문", inner: faqList(q.faqs) }) : ""}
${inquiryCta()}`;
    register({
      title: q.title, description: q.desc, path: `/questions/${q.slug}/`, h1: q.h1,
      activeNav: "/questions/", crumbs, faqs: q.faqs, priority: 0.8, body,
    });
  }
}

// ---------------------------------------------------------------------------
// 지역별 안내 허브
// ---------------------------------------------------------------------------
function buildArea() {
  const inner = `
    ${section({ h2: "서울 25개 구", inner: chips(seoul.districts.map((d) => ({ label: d.name, href: `/seoul/${d.slug}/` }))) }).replace(/^\n/, "")}
    ${section({ tint: true, h2: "경기 31개 시군", inner: chips(gyeonggi.cities.map((c) => ({ label: c.name, href: `/gyeonggi/${c.slug}/` }))) })}
    ${section({ h2: "인천 현행 구군", inner: chips(incheon.guGun.map((g) => ({ label: g.name, href: `/incheon/${g.slug}/` }))) })}`;
  register({
    title: "서울·경기·인천 지역별 안내｜수도권 방문 가능 지역 보기",
    description: "서울 25개 구, 경기 31개 시군, 인천 구군 등 수도권 지역별 방문 안내를 한눈에 확인",
    path: "/area/",
    h1: "서울·경기·인천 지역별 안내",
    activeNav: "/area/",
    crumbs: crumb({ label: "지역별 안내", href: "/area/" }),
    priority: 0.9,
    body: `${breadcrumb(crumb({ label: "지역별 안내", href: "/area/" }))}
${hero({ eyebrow: "지역별 안내", h1: "서울·경기·인천 지역별 안내", lead: "행정구역과 대표 생활권, 지하철역 기준으로 수도권 전 지역을 안내합니다." })}
${inner}
${inquiryCta()}`,
  });
}

// ---------------------------------------------------------------------------
// 이용 장소 / 예약 전 확인 / 운영 기준 (단순 콘텐츠 페이지)
// ---------------------------------------------------------------------------
function buildSimpleSection(key, base, label, h1) {
  const data = content[key];
  const cards = data.items.map((i) => ({ title: i.menu, desc: i.lead, href: `${base}${i.slug}/`, tag: label }));
  register({
    title: `${h1}｜Bun 마사지`,
    description: data.desc || data.intro,
    path: base,
    h1,
    activeNav: base,
    crumbs: crumb({ label, href: base }),
    priority: 0.8,
    body: `${breadcrumb(crumb({ label, href: base }))}
${hero({ eyebrow: label, h1, lead: data.intro })}
${section({ inner: cardGrid(cards, 3) })}
${inquiryCta()}`,
  });

  for (const item of data.items) {
    const crumbs = crumb({ label, href: base }, { label: item.menu, href: `${base}${item.slug}/` });
    const body = `${breadcrumb(crumbs)}
${hero({ eyebrow: label, h1: item.h1, lead: item.lead })}
${section({ h2: "확인 포인트", inner: `<div class="prose">${checklist(item.points)}</div>` })}
${section({ tint: true, h2: "함께 확인하면 좋은 안내", inner: chips([
      { label: "질문으로 찾기", href: "/questions/" },
      { label: "예약 전 확인", href: "/check/" },
      { label: "지역별 안내", href: "/area/" },
    ]) })}
${inquiryCta()}`;
    register({
      title: item.title, description: item.desc, path: `${base}${item.slug}/`, h1: item.h1,
      activeNav: base, crumbs, priority: 0.7, body,
    });
  }
}

// ---------------------------------------------------------------------------
// 생활권 허브 / 지하철역 허브
// ---------------------------------------------------------------------------
function buildLifeHub() {
  const inner = ["seoul", "gyeonggi", "incheon"].map((p) => {
    const prov = provinces[p];
    return section({
      tint: p === "gyeonggi",
      h2: `${prov.province} 생활권`,
      inner: chips(prov.lifeAreas.map((l) => ({ label: l.name, href: `/${p}/life/${l.slug}/` }))),
    });
  }).join("");
  register({
    title: "수도권 생활권 안내｜서울·경기·인천 주요 생활권",
    description: "강남·분당·송도 등 서울·경기·인천 주요 생활권 기준으로 방문 안내를 확인",
    path: "/life/",
    h1: "수도권 주요 생활권",
    activeNav: "/life/",
    crumbs: crumb({ label: "생활권", href: "/life/" }),
    priority: 0.8,
    body: `${breadcrumb(crumb({ label: "생활권", href: "/life/" }))}
${hero({ eyebrow: "생활권", h1: "수도권 주요 생활권", lead: "행정구역보다 생활권 기준으로 위치를 확인하면 빠릅니다." })}
${inner}
${inquiryCta()}`,
  });
}

function buildStationHub() {
  const provHub = (p, label) => `<li><a href="/${p}/station/">${label} 역세권</a></li>`;
  const inner = ["seoul", "gyeonggi", "incheon"].map((p) => {
    const prov = provinces[p];
    return section({
      tint: p === "gyeonggi",
      h2: `${prov.province} 역세권`,
      inner: chips(prov.stations.map((s) => ({ label: s.name, href: `/${p}/station/${s.slug}/` }))),
    });
  }).join("");
  register({
    title: "수도권 지하철역 안내｜역세권 기준 위치 확인",
    description: "강남·수원·부평 등 수도권 주요 역세권 기준으로 위치를 확인하는 방법 안내",
    path: "/station/",
    h1: "수도권 지하철역 안내",
    activeNav: "/station/",
    crumbs: crumb({ label: "지하철역", href: "/station/" }),
    priority: 0.7,
    body: `${breadcrumb(crumb({ label: "지하철역", href: "/station/" }))}
${hero({ eyebrow: "지하철역", h1: "수도권 지하철역 안내", lead: "역명은 위치 설명용이며, 실제 예약은 정확한 주소와 건물 출입 방식으로 확인합니다. 출구별·노선별 구분은 사용하지 않습니다." })}
${inner}
${inquiryCta()}`,
  });
}

// ---------------------------------------------------------------------------
// 지역(시·도) 허브 + 행정구역 페이지 + 생활권 페이지 + 역세권 페이지
// ---------------------------------------------------------------------------
function buildProvince(key) {
  const prov = provinces[key];
  const isIncheon = key === "incheon";
  const units = isIncheon ? prov.guGun : (key === "seoul" ? prov.districts : prov.cities);
  const unitLabel = key === "seoul" ? "25개 구" : key === "gyeonggi" ? "31개 시군" : "현행 구군";
  const provLabel = prov.province;

  // 허브
  register({
    title: `${provLabel} 출장마사지｜질문별 ${key === "gyeonggi" ? "시군" : key === "incheon" ? "구군" : "지역"} 안내`,
    description: `${provLabel} 출장마사지·홈타이 ${unitLabel}과 생활권·역세권 기준 방문 안내를 확인`,
    path: `/${key}/`,
    h1: `${provLabel} 출장마사지 · 질문별 지역 안내`,
    activeNav: `/${key}/`,
    crumbs: crumb({ label: provLabel, href: `/${key}/` }),
    priority: 0.9,
    body: `${breadcrumb(crumb({ label: provLabel, href: `/${key}/` }))}
${hero({ eyebrow: `${provLabel} 지역 안내`, h1: `${provLabel} 출장마사지 · 질문별 지역 안내`, lead: prov.intro, ctas: [
      { label: "질문으로 찾기", href: "/questions/", variant: "btn--orange" },
      { label: "예약 전 확인", href: "/check/", variant: "btn--invert" },
    ] })}
${section({ h2: `${provLabel} ${unitLabel}`, inner: chips(units.map((u) => ({ label: u.name, href: `/${key}/${u.slug}/` }))) })}
${section({ tint: true, h2: "대표 생활권", inner: chips(prov.lifeAreas.map((l) => ({ label: l.name, href: `/${key}/life/${l.slug}/` }))) })}
${section({ h2: "대표 역세권", inner: chips(prov.stations.map((s) => ({ label: s.name, href: `/${key}/station/${s.slug}/` }))) })}
${isIncheon ? section({ h2: "2026 개편 대응", lead: "행정구역 개편 전까지 준비 중인 안내입니다. 개편 이후 정식 공개됩니다.", inner: chips(prov.reform2026.map((r) => ({ label: r.name, href: `/${key}/${r.slug}/` }))) }) : ""}
${inquiryCta()}`,
  });

  // 행정구역 페이지
  for (const u of units) {
    const crumbs = crumb({ label: provLabel, href: `/${key}/` }, { label: u.name, href: `/${key}/${u.slug}/` });
    const body = `${breadcrumb(crumbs)}
${hero({ eyebrow: `${provLabel} ${u.name}`, h1: `${u.name} 출장마사지 · 질문별 안내`, lead: u.focus })}
${section({ h2: "이 지역 개요", inner: `<div class="prose"><p class="muted">${u.focus} ${prov.intro}</p></div>` })}
${section({ tint: true, h2: "이 지역에서 자주 묻는 질문", inner: cardGrid(questions.items.slice(0, 4).map((q) => ({ title: q.menu, desc: q.lead, href: `/questions/${q.slug}/`, tag: "질문" })), 2) })}
${section({ h2: "가까운 생활권·역", inner: chips([
      ...prov.lifeAreas.slice(0, 6).map((l) => ({ label: l.name, href: `/${key}/life/${l.slug}/` })),
      ...prov.stations.slice(0, 3).map((s) => ({ label: s.name, href: `/${key}/station/${s.slug}/` })),
    ]) })}
${section({ tint: true, h2: "이용 장소별 기준", inner: chips(content.use.items.slice(0, 6).map((i) => ({ label: i.menu, href: `/use/${i.slug}/` }))) })}
${section({ h2: "예약 전 체크리스트", inner: `<div class="prose">${checklist(STANDARD_CHECKLIST)}</div>` })}
${inquiryCta()}`;
    register({
      title: `${u.name} 출장마사지｜${provLabel} 방문 안내`,
      description: `${provLabel} ${u.name} 출장마사지·홈타이 생활권·역세권·이용 장소 기준 방문 안내`,
      path: `/${key}/${u.slug}/`, h1: `${u.name} 출장마사지 · 질문별 안내`,
      activeNav: `/${key}/`, crumbs, priority: 0.6, body,
    });
  }

  // 인천 2026 개편 대응 — draft/noindex
  if (isIncheon) {
    for (const r of prov.reform2026) {
      const crumbs = crumb({ label: provLabel, href: `/${key}/` }, { label: r.name, href: `/${key}/${r.slug}/` });
      register({
        title: `${r.name}｜인천 2026 행정구역 개편 대응 (준비 중)`,
        description: `인천 ${r.name}는 2026 행정구역 개편 대응 준비 중인 안내 페이지입니다`,
        path: `/${key}/${r.slug}/`, h1: `${r.name} · 2026 개편 대응 (준비 중)`,
        activeNav: `/${key}/`, crumbs, noindex: true, priority: 0.1,
        body: `${breadcrumb(crumbs)}
${section({ h2: `${r.name} · 준비 중`, inner: `<div class="prose"><div class="notice"><strong>${r.name}</strong>는 2026년 인천 행정구역 개편 대응을 위해 준비 중인 페이지입니다. 개편 시행 이후 정식 안내로 공개됩니다. 현재 가능한 지역은 <a href="/incheon/">인천 현행 구군 안내</a>에서 확인하세요.</div></div>` })}`,
      });
    }
  }

  // 생활권 페이지
  for (const l of prov.lifeAreas) {
    const crumbs = crumb({ label: provLabel, href: `/${key}/` }, { label: "생활권", href: "/life/" }, { label: l.name, href: `/${key}/life/${l.slug}/` });
    const body = `${breadcrumb(crumbs)}
${hero({ eyebrow: `${provLabel} 생활권`, h1: `${l.name} 생활권 안내`, lead: `${l.name} 생활권의 방문 기준을 자주 묻는 질문·이용 장소·예약 전 확인 순으로 안내합니다.` })}
${section({ h2: "이 생활권에서 자주 묻는 질문", inner: cardGrid(questions.items.slice(0, 4).map((q) => ({ title: q.menu, desc: q.lead, href: `/questions/${q.slug}/`, tag: "질문" })), 2) })}
${section({ tint: true, h2: "이용 장소별 기준", inner: chips(content.use.items.map((i) => ({ label: i.menu, href: `/use/${i.slug}/` }))) })}
${section({ h2: "예약 전 체크리스트", inner: `<div class="prose">${checklist(STANDARD_CHECKLIST)}</div>` })}
${section({ tint: true, h2: "관련 페이지", inner: chips([
      { label: `${provLabel} 전체`, href: `/${key}/` },
      { label: "지역별 안내", href: "/area/" },
      { label: "예약 전 확인", href: "/check/" },
    ]) })}
${inquiryCta()}`;
    register({
      title: `${l.name} 생활권 안내｜${provLabel} 출장마사지`,
      description: `${provLabel} ${l.name} 생활권 출장마사지·홈타이 이용 장소·예약 전 확인 안내`,
      path: `/${key}/life/${l.slug}/`, h1: `${l.name} 생활권 안내`,
      activeNav: `/${key}/`, crumbs, priority: 0.6, body,
    });
  }

  // 역세권 허브 + 역 페이지
  register({
    title: `${provLabel} 역세권 안내｜역 기준 위치 확인`,
    description: `${provLabel} 주요 역세권 기준으로 위치를 확인하는 방법 안내 (출구·노선 구분 없음)`,
    path: `/${key}/station/`, h1: `${provLabel} 역세권 안내`,
    activeNav: `/${key}/`,
    crumbs: crumb({ label: provLabel, href: `/${key}/` }, { label: "역세권", href: `/${key}/station/` }),
    priority: 0.6,
    body: `${breadcrumb(crumb({ label: provLabel, href: `/${key}/` }, { label: "역세권", href: `/${key}/station/` }))}
${hero({ eyebrow: `${provLabel} 역세권`, h1: `${provLabel} 역세권 안내`, lead: "역명은 위치 설명용입니다. 출구별·노선별 페이지는 만들지 않으며, 역명 기준 1개 안내만 제공합니다." })}
${section({ inner: chips(prov.stations.map((s) => ({ label: s.name, href: `/${key}/station/${s.slug}/` }))) })}
${inquiryCta()}`,
  });
  for (const s of prov.stations) {
    const crumbs = crumb({ label: provLabel, href: `/${key}/` }, { label: "역세권", href: `/${key}/station/` }, { label: s.name, href: `/${key}/station/${s.slug}/` });
    register({
      title: `${s.name} 기준 안내｜${provLabel} 역세권`,
      description: `${provLabel} ${s.name} 기준 위치 확인 안내. 예약은 실제 주소·건물 출입 방식으로 확인`,
      path: `/${key}/station/${s.slug}/`, h1: `${s.name} 기준 안내`,
      activeNav: `/${key}/`, crumbs, priority: 0.5,
      body: `${breadcrumb(crumbs)}
${hero({ eyebrow: `${provLabel} 역세권`, h1: `${s.name} 기준 안내`, lead: `${s.name}을(를) 기준으로 위치를 설명합니다. 실제 예약 가능 여부는 정확한 방문 주소와 건물 출입 방식으로 확인하세요.` })}
${section({ h2: "확인 포인트", inner: `<div class="prose">${checklist(["가까운 역 기준 위치 확인", "출구 번호 대신 실제 주소 사용", "건물 출입 방식 확인", "환승역도 노선 구분 없이 안내"])}</div>` })}
${section({ tint: true, h2: "관련 안내", inner: chips([
        { label: `${provLabel} 전체`, href: `/${key}/` },
        { label: "역세권 기준 찾기", href: "/questions/station-area/" },
        { label: "지하철역 안내", href: "/station/" },
      ]) })}
${inquiryCta()}`,
    });
  }
}

// ---------------------------------------------------------------------------
// 문의 페이지 / 정책 허브 / 404
// ---------------------------------------------------------------------------
function buildContact() {
  register({
    title: "문의하기｜Bun 마사지 예약·제휴·제작 문의",
    description: "전화예약 0508-202-4719, 텔레그램 웹사이트 제작문의·제휴문의 안내",
    path: "/contact/", h1: "문의하기",
    activeNav: "/contact/",
    crumbs: crumb({ label: "문의하기", href: "/contact/" }),
    priority: 0.7,
    body: `${breadcrumb(crumb({ label: "문의하기", href: "/contact/" }))}
${hero({ eyebrow: "문의", h1: "문의하기", lead: "예약은 전화로, 웹사이트 제작과 제휴는 텔레그램으로 문의하세요.", ctas: [
      { label: "전화예약 " + site.phone, href: site.phoneHref, variant: "btn--orange" },
      { label: "웹사이트 제작문의", href: site.telegram.website, variant: "btn--gold" },
      { label: "제휴문의", href: site.telegram.partnership, variant: "btn--invert" },
    ] })}
${section({ h2: "예약 안내", inner: `<div class="prose"><p>전화예약 <strong>${site.phone}</strong> 으로 문의하시면 방문 가능 지역과 예약 전 확인사항을 안내해 드립니다. 정확한 방문 주소와 건물 출입 방식을 함께 확인하면 방문이 원활합니다.</p><div class="notice notice--warn"><strong>안내</strong> 본 사이트는 합법적인 방문형 서비스만 안내하며, 불법·선정적 서비스를 제공하거나 알선하지 않습니다.</div></div>` })}
${section({ tint: true, h2: "제작 · 제휴 문의", inner: `<div class="prose"><p>웹사이트 제작 문의와 제휴 제안은 아래 텔레그램으로 연락 주세요.</p>${chips([
      { label: "웹사이트 제작문의 (텔레그램)", href: site.telegram.website },
      { label: "제휴문의 (텔레그램)", href: site.telegram.partnership },
    ])}</p></div>` })}`,
  });
}

function buildPolicy() {
  const data = content.policy;
  const cards = data.items.map((i) => ({ title: i.menu, desc: i.lead, href: `/policy/${i.slug}/`, tag: "운영 기준" }));
  register({
    title: "운영 기준｜개인정보 처리방침·고객 유의사항·콘텐츠 품질",
    description: "Bun 마사지 운영 기준 — 개인정보 처리방침, 고객 유의사항, 콘텐츠 품질 기준 안내",
    path: "/policy/", h1: "운영 기준",
    activeNav: "/policy/",
    crumbs: crumb({ label: "운영 기준", href: "/policy/" }),
    priority: 0.5,
    body: `${breadcrumb(crumb({ label: "운영 기준", href: "/policy/" }))}
${hero({ eyebrow: "운영 기준", h1: "운영 기준", lead: data.intro })}
${section({ inner: cardGrid(cards, 3) })}
${inquiryCta()}`,
  });
  for (const item of data.items) {
    const crumbs = crumb({ label: "운영 기준", href: "/policy/" }, { label: item.menu, href: `/policy/${item.slug}/` });
    register({
      title: item.title, description: item.desc, path: `/policy/${item.slug}/`, h1: item.h1,
      activeNav: "/policy/", crumbs, priority: 0.4,
      body: `${breadcrumb(crumbs)}
${hero({ eyebrow: "운영 기준", h1: item.h1, lead: item.lead })}
${section({ inner: `<div class="prose">${checklist(item.points)}</div>` })}`,
    });
  }
}

function build404() {
  pages.push({
    path: "/404.html",
    noindex: true,
    priority: 0,
    html: renderPage({
      title: "페이지를 찾을 수 없습니다｜Bun 마사지",
      description: "요청하신 페이지를 찾을 수 없습니다. 수도권 홈으로 이동해 주세요.",
      path: "/404.html", h1: "페이지를 찾을 수 없습니다", noindex: true,
      crumbs: crumb(),
      body: `${section({ h2: "페이지를 찾을 수 없습니다", inner: `<div class="prose"><p class="muted">요청하신 페이지를 찾을 수 없습니다.</p>${chips([
        { label: "수도권 홈", href: "/" },
        { label: "질문으로 찾기", href: "/questions/" },
        { label: "지역별 안내", href: "/area/" },
      ])}</div>` })}`,
    }),
  });
}

// ---------------------------------------------------------------------------
// 사이트맵 / robots / 정적 자산
// ---------------------------------------------------------------------------
function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .filter((p) => !p.noindex && !p.path.endsWith(".html"))
    .map((p) => `  <url><loc>${site.baseUrl}${p.path}</loc><lastmod>${today}</lastmod><priority>${p.priority.toFixed(1)}</priority></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return xml;
}

const ROBOTS = `User-agent: *
Allow: /
Disallow: /404.html

Sitemap: ${site.baseUrl}/sitemap.xml
`;

const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#221c18"/><stop offset="1" stop-color="#161210"/></linearGradient><linearGradient id="o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a2b"/><stop offset="1" stop-color="#cf4708"/></linearGradient></defs><rect width="1200" height="630" fill="url(#b)"/><circle cx="1050" cy="80" r="320" fill="url(#o)" opacity="0.18"/><rect x="80" y="250" width="64" height="64" rx="16" fill="url(#o)"/><text x="170" y="298" font-family="Pretendard, sans-serif" font-size="44" font-weight="800" fill="#fff">Bun 마사지</text><text x="80" y="400" font-family="Pretendard, sans-serif" font-size="56" font-weight="800" fill="#fff">서울·경기·인천 출장마사지</text><text x="80" y="470" font-family="Pretendard, sans-serif" font-size="40" font-weight="600" fill="#c2a062">수도권 지역별 질문 안내</text><text x="80" y="545" font-family="Pretendard, sans-serif" font-size="32" fill="#c5bcae">전화예약 0508-202-4719</text></svg>`;

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a2b"/><stop offset="1" stop-color="#cf4708"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/><text x="16" y="23" font-family="sans-serif" font-size="20" font-weight="900" fill="#fff" text-anchor="middle">B</text></svg>`;

// ---------------------------------------------------------------------------
// 실행
// ---------------------------------------------------------------------------
async function writePage(p) {
  const filePath = p.path.endsWith(".html")
    ? join(OUT, p.path.replace(/^\//, ""))
    : join(OUT, p.path.replace(/^\//, ""), "index.html");
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, p.html, "utf8");
}

async function main() {
  if (existsSync(OUT)) await rm(OUT, { recursive: true, force: true });
  await mkdir(join(OUT, "assets"), { recursive: true });

  buildHome();
  buildQuestions();
  buildArea();
  buildSimpleSection("use", "/use/", "이용 장소", "이용 장소");
  buildSimpleSection("check", "/check/", "예약 전 확인", "예약 전 확인");
  buildLifeHub();
  buildStationHub();
  buildProvince("seoul");
  buildProvince("gyeonggi");
  buildProvince("incheon");
  buildContact();
  buildPolicy();
  build404();

  for (const p of pages) await writePage(p);

  await copyFile(join(__dirname, "src/styles/styles.css"), join(OUT, "styles.css"));
  await writeFile(join(OUT, "assets/og-default.svg"), OG_SVG, "utf8");
  await writeFile(join(OUT, "assets/favicon.svg"), FAVICON_SVG, "utf8");
  await writeFile(join(OUT, "sitemap.xml"), buildSitemap(), "utf8");
  await writeFile(join(OUT, "robots.txt"), ROBOTS, "utf8");

  const indexed = pages.filter((p) => !p.noindex && !p.path.endsWith(".html")).length;
  const noindexed = pages.filter((p) => p.noindex).length;
  console.log(`✓ ${pages.length} 페이지 생성 (색인 ${indexed} · noindex ${noindexed})`);
  if (longClampWarnings.length) {
    console.log(`! 디스크립션 80자 절삭: ${longClampWarnings.length}건`);
    longClampWarnings.forEach((w) => console.log("  - " + w));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
