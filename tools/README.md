# 색인(인덱싱) 도구

## 빌드 시 자동 생성되는 색인 자산 (`node build.mjs` → `dist/`)
- `sitemap.xml` — 전체 색인 대상 URL (873개)
- `rss.xml` — RSS 2.0 피드(색인 촉진용)
- `robots.txt` — `Yeti`(네이버)·`Googlebot`·`Bingbot` 허용 + 사이트맵 경로
- `<indexNowKey>.txt` — IndexNow 키 파일(빙·네이버 즉시 통보용)
- 모든 페이지 `<head>` 에 네이버 인증 메타 + RSS `<link rel="alternate">`

## 1) IndexNow — 빙·네이버 즉시 색인 통보 (가장 빠름)
빙·네이버·얀덱스가 참여. **글을 올리거나 수정할 때마다** 실행하면 즉시 통보됩니다.

```bash
node build.mjs                 # dist/ 재생성(키 파일·사이트맵 포함)
# 배포(커밋·푸시) 후 키 파일이 https://<도메인>/<키>.txt 로 접근 가능해야 함
python tools/indexnow.py                      # 전체 URL 일괄 통보
python tools/indexnow.py /seoul/gangnam-gu/   # 특정 URL만 통보
```
- 의존성 없음(파이썬 표준 라이브러리).
- 키/도메인은 `src/data/site.json` 의 `indexNowKey`·`baseUrl` 에서 읽음.

## 2) 구글 — IndexNow 미참여
구글은 IndexNow에 참여하지 않습니다. 또한:
- **사이트맵 ping**(`google.com/ping?sitemap=`)은 2023년 폐지되어 동작하지 않습니다.
- **Indexing API**는 공식적으로 `JobPosting`·`BroadcastEvent` 전용이라 일반 페이지에는 약관 위반입니다.

→ 구글은 **Search Console에 사이트맵(`/sitemap.xml`) 제출** + 핵심 페이지 **URL 검사 → 색인 요청**이 정석입니다.
1. search.google.com/search-console 에서 속성 추가(도메인 인증)
2. 사이트맵 메뉴에 `sitemap.xml` 제출
3. 중요한 페이지는 URL 검사로 개별 색인 요청

## 체크리스트
- [ ] 네이버 서치어드바이저: 사이트 등록(메타 인증 이미 적용) → 사이트맵·RSS 제출
- [ ] 빙 웹마스터: 사이트 등록 → IndexNow 키 자동 인식
- [ ] 구글 서치 콘솔: 사이트맵 제출
- [ ] 배포 후 `python tools/indexnow.py` 1회 실행(첫 일괄 통보)
