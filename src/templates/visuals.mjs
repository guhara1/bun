// 프리미엄 웰니스 히어로 비주얼 — 인라인 SVG (외부 의존성/이미지 없음)
// 마사지·스파 모티프(밸런스 스톤, 연꽃, 잎, 물결, 캔들)를 지역별로 배치합니다.

const BASE = {
  p1: "#fdebd2", p2: "#f3cd97",          // 따뜻한 크림 패널
  glow: "#ffac5a", accent: "#e8590c",
  s1: "#b29c86", s2: "#6f5f51",          // 스톤(따뜻한 토프)
  leaf: "#7f8a4d", leaf2: "#9aa861", leafVein: "#5f6a39",
  lotusBack: "#f4b9a0", lotusFront: "#efd1a6", lotusTip: "#e89a86",
  w1: "#f2c79a", w2: "#e6a86f", w3: "#d98a4a",
};
const P = (o) => ({ ...BASE, ...o });

const PALETTES = {
  royal:    P({ glow: "#ffb066", accent: "#d9510a", s1: "#c2a877", s2: "#7a6647" }),
  amber:    P({}),
  jade:     P({ glow: "#f0c474", accent: "#3f8f63", leaf: "#3f8f63", leaf2: "#5fae7e", leafVein: "#2c6b48", w1: "#bcd9bf", w2: "#8fc29c", w3: "#5fae7e" }),
  azure:    P({ glow: "#ffc27a", accent: "#3f7fa3", w1: "#bcd6e6", w2: "#8db9d4", w3: "#5f97bd", leaf: "#5f97bd", leaf2: "#7fb0cf" }),
  rose:     P({ glow: "#ffb98f", accent: "#c4607a", lotusBack: "#f3b3bf", lotusFront: "#f6dcc0", lotusTip: "#e07e96" }),
};

function frame(id, pal, centerpiece, label, extraDefs = "") {
  return `<svg class="hero-visual__svg" viewBox="0 0 560 600" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="${id}-panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${pal.p1}"/><stop offset="1" stop-color="${pal.p2}"/>
    </linearGradient>
    <radialGradient id="${id}-glow" cx="0.5" cy="0.3" r="0.62">
      <stop offset="0" stop-color="${pal.glow}" stop-opacity="0.6"/>
      <stop offset="1" stop-color="${pal.glow}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-stone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${pal.s1}"/><stop offset="1" stop-color="${pal.s2}"/>
    </linearGradient>
    <linearGradient id="${id}-leaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${pal.leaf2}"/><stop offset="1" stop-color="${pal.leaf}"/>
    </linearGradient>
    ${extraDefs}
  </defs>
  <rect x="0" y="0" width="560" height="600" rx="32" fill="url(#${id}-panel)"/>
  <circle cx="280" cy="190" r="250" fill="url(#${id}-glow)"/>
  <circle cx="372" cy="150" r="66" fill="${pal.glow}" opacity="0.18"/>
  <circle cx="372" cy="150" r="42" fill="${pal.glow}" opacity="0.22"/>
  ${centerpiece}
  <g fill="${pal.accent}" opacity="0.45">
    <circle cx="118" cy="128" r="5"/><circle cx="150" cy="92" r="3"/>
    <circle cx="452" cy="262" r="4"/><circle cx="430" cy="306" r="2.5"/>
    <circle cx="96" cy="250" r="3"/>
  </g>
</svg>`;
}

const sheen = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity="0.16"/>`;

function stones(id, pal) {
  const tiers = [
    [452, 104, 36], [392, 86, 30], [340, 66, 24], [298, 44, 18],
  ];
  const body = tiers
    .map(([cy, rx, ry]) => `<ellipse cx="280" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id}-stone)"/>${sheen(280, cy - ry * 0.45, rx * 0.7, ry * 0.4)}`)
    .join("");
  return `
  <ellipse cx="280" cy="490" rx="150" ry="24" fill="#000" opacity="0.05"/>
  <g stroke="${pal.accent}" stroke-opacity="0.22" stroke-width="2" fill="none">
    <ellipse cx="280" cy="492" rx="118" ry="20"/><ellipse cx="280" cy="492" rx="158" ry="28"/>
  </g>
  ${body}
  <g transform="translate(280,258)">
    <path d="M0 30 C0 8 0 8 0 -22" stroke="${pal.leafVein}" stroke-width="3" fill="none"/>
    <path d="M0 -4 C16 -8 28 -22 30 -40 C12 -36 2 -22 0 -4 Z" fill="${pal.leaf}"/>
    <path d="M0 6 C-15 2 -26 -10 -28 -28 C-12 -24 -2 -12 0 6 Z" fill="${pal.leaf2}"/>
  </g>`;
}

function lotus(id, pal) {
  const petal = (deg, sc, fill) =>
    `<path d="M0 0 C -20 -30 -13 -86 0 -116 C 13 -86 20 -30 0 0 Z" transform="rotate(${deg}) scale(${sc})" fill="${fill}"/>`;
  const back = [-62, -31, 0, 31, 62].map((d) => petal(d, 1.06, pal.lotusBack)).join("");
  const front = [-42, -14, 14, 42].map((d) => petal(d, 0.82, pal.lotusFront)).join("");
  return `
  <g transform="translate(280,438)">
    <ellipse cx="0" cy="34" rx="150" ry="24" fill="#000" opacity="0.05"/>
    <g stroke="${pal.accent}" stroke-opacity="0.2" stroke-width="2" fill="none">
      <ellipse cx="0" cy="40" rx="120" ry="18"/><ellipse cx="0" cy="40" rx="160" ry="26"/>
    </g>
    ${back}${front}
    <path d="M0 0 C -8 -24 -5 -68 0 -94 C 5 -68 8 -24 0 0 Z" fill="${pal.lotusTip}"/>
    <circle cx="0" cy="-10" r="11" fill="${pal.glow}" opacity="0.55"/>
  </g>`;
}

function leaf(id, pal) {
  const veins = [];
  for (let i = 1; i <= 5; i++) {
    const y = -130 + i * 46;
    const s = 40 + i * 6;
    veins.push(`<path d="M0 ${y} C ${s} ${y - 6} ${s + 14} ${y - 30} ${s + 18} ${y - 44}" stroke="${pal.leafVein}" stroke-width="2.5" fill="none" opacity="0.6"/>`);
    veins.push(`<path d="M0 ${y} C ${-s} ${y - 6} ${-s - 14} ${y - 30} ${-s - 18} ${y - 44}" stroke="${pal.leafVein}" stroke-width="2.5" fill="none" opacity="0.6"/>`);
  }
  return `
  <g transform="translate(280,338)">
    <ellipse cx="0" cy="178" rx="130" ry="22" fill="#000" opacity="0.05"/>
    <g transform="rotate(16)">
      <path d="M0 170 C -118 124 -118 -120 0 -168 C 118 -120 118 124 0 170 Z" fill="url(#${id}-leaf)"/>
      <path d="M0 170 L0 -168" stroke="${pal.leafVein}" stroke-width="4"/>
      ${veins.join("")}
      <path d="M-46 60 C -10 40 8 0 16 -54" stroke="#fff" stroke-opacity="0.18" stroke-width="10" fill="none"/>
    </g>
  </g>`;
}

function wave(id, pal) {
  return `
  <g>
    <path d="M30 372 C 160 332 250 414 380 374 S 520 356 530 374 L530 540 L30 540 Z" fill="${pal.w1}" opacity="0.95"/>
    <path d="M30 418 C 170 384 250 450 392 412 S 520 402 530 418 L530 540 L30 540 Z" fill="${pal.w2}" opacity="0.95"/>
    <path d="M30 462 C 150 436 270 492 400 458 S 520 450 530 462 L530 540 L30 540 Z" fill="${pal.w3}"/>
    <g stroke="#fff" stroke-opacity="0.4" stroke-width="2" fill="none">
      <path d="M120 432 C 150 424 180 440 210 432"/>
      <path d="M330 470 C 360 462 390 478 420 470"/>
    </g>
    <g transform="translate(360,372)">
      <ellipse cx="0" cy="6" rx="58" ry="16" fill="${pal.leaf}" opacity="0.9"/>
      <path d="M-2 6 C -30 0 -44 -16 -46 -34 C -22 -28 -6 -14 -2 6 Z" fill="${pal.leaf2}"/>
      <circle cx="6" cy="2" r="10" fill="${pal.glow}" opacity="0.7"/>
    </g>
  </g>`;
}

function candle(id, pal) {
  return `
  <g transform="translate(280,300)">
    <ellipse cx="0" cy="196" rx="150" ry="24" fill="#000" opacity="0.05"/>
    <circle cx="0" cy="-44" r="64" fill="${pal.glow}" opacity="0.32"/>
    <path d="M0 -126 C 24 -94 19 -56 0 -50 C -19 -56 -24 -94 0 -126 Z" fill="${pal.glow}"/>
    <path d="M0 -108 C 12 -88 9 -64 0 -60 C -9 -64 -12 -88 0 -108 Z" fill="#fff" opacity="0.72"/>
    <rect x="-2" y="-52" width="4" height="14" rx="2" fill="#5b4a3a"/>
    <rect x="-60" y="-38" width="120" height="200" rx="18" fill="url(#${id}-stone)"/>
    <ellipse cx="0" cy="-38" rx="60" ry="16" fill="${pal.s1}"/>${sheen(-18, -40, 26, 8)}
    <rect x="-44" y="-10" width="14" height="150" rx="7" fill="#fff" opacity="0.12"/>
    <g transform="translate(-78,150)">
      <path d="M0 8 C -28 0 -42 -18 -44 -38 C -20 -30 -4 -14 0 8 Z" fill="${pal.leaf}"/>
    </g>
    <g transform="translate(78,150) scale(-1,1)">
      <path d="M0 8 C -28 0 -42 -18 -44 -38 C -20 -30 -4 -14 0 8 Z" fill="${pal.leaf2}"/>
    </g>
  </g>`;
}

const MOTIFS = { stones, lotus, leaf, wave, candle };

// 지역/섹션 → (모티프, 팔레트) 매핑
const MAP = {
  home:      ["stones", "royal", "밸런스 스톤과 잎 — 수도권 마사지 안내"],
  questions: ["lotus", "rose", "연꽃 — 자주 묻는 질문"],
  area:      ["stones", "amber", "밸런스 스톤 — 지역별 안내"],
  use:       ["leaf", "jade", "허브 잎 — 이용 장소 안내"],
  check:     ["candle", "amber", "스파 캔들 — 예약 전 확인"],
  life:      ["stones", "amber", "밸런스 스톤 — 생활권 안내"],
  station:   ["wave", "azure", "물결 — 역세권 안내"],
  contact:   ["lotus", "rose", "연꽃 — 문의 안내"],
  policy:    ["leaf", "jade", "허브 잎 — 운영 기준"],
  seoul:     ["stones", "amber", "서울 마사지 안내 일러스트"],
  gyeonggi:  ["leaf", "jade", "경기 마사지 안내 일러스트"],
  incheon:   ["wave", "azure", "인천 마사지 안내 일러스트"],
};

let counter = 0;
export function heroVisual(key) {
  const entry = MAP[key] || MAP.home;
  const [motif, paletteKey, label] = entry;
  const pal = PALETTES[paletteKey];
  const id = `v${counter++}`;
  return frame(id, pal, MOTIFS[motif](id, pal), label);
}
