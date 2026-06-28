# Bun 마사지 — 수도권 출장마사지 질문형 가이드

서울·경기·인천 출장마사지 정보를 **질문 → 답변 → 관련 지역 → 예약 전 확인** 순서로 연결하는
정적 사이트입니다. 의존성 없이 Node/Bun에서 빌드되는 자체 정적 사이트 생성기를 사용합니다.

## 빌드 / 미리보기

```bash
node build.mjs      # dist/ 에 전체 사이트 생성 (bun build.mjs 도 동일)
npm run serve       # http://localhost:8080 로 미리보기
```

## 구조

```
build.mjs                 # 정적 사이트 생성기 (zero-dependency)
src/
  data/                   # 콘텐츠 데이터 (JSON)
    site.json             # 업체정보·전화·텔레그램·내비
    seoul/gyeonggi/incheon.json
    questions.json        # 질문형 페이지
    content.json          # 이용 장소·예약 전 확인·운영 기준
  templates/
    layout.mjs            # head/메타/스키마/헤더/푸터 공통 레이아웃
    components.mjs        # 재사용 UI 컴포넌트
  styles/styles.css       # Pretendard + 프리미엄 팔레트 토큰 + 컴포넌트 오버레이
dist/                     # 생성 결과 (배포 대상)
```

## SEO 적용 사항

- **메타 디스크립션 80자 이내** — `clampDesc()`가 모든 페이지에서 강제
- **구조화 데이터(스키마)** — 모든 페이지에 `WebSite`, `Organization`, `WebPage`,
  `BreadcrumbList`, `ImageObject`를 그래프로 출력하고, 질문/FAQ 페이지에는 `FAQPage` 추가
- **선호 썸네일** — `og:image`와 스키마 `ImageObject`를 함께 명시
- **내부링크** — 메인 → 지역 허브 → 행정구역/생활권/역세권 롱테일 키워드로 연결
- **품질 정책** — 출구별·노선별 중복 페이지 미생성, 역명 기준 1 URL,
  인천 2026 개편 대응 페이지는 `noindex` 처리(`robots`·사이트맵 제외)
- `sitemap.xml`, `robots.txt` 자동 생성

## 업체 정보

- 상호: **Bun 마사지**
- 전화예약: **0508-202-4719**
- 제작/제휴 문의: 푸터의 오렌지 텔레그램 버튼(웹사이트 제작문의 · 제휴문의)

> 본 사이트는 합법적인 방문형 서비스 안내만 제공하며, 불법·선정적 서비스를 제공하거나 알선하지 않습니다.
