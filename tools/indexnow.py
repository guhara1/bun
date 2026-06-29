#!/usr/bin/env python3
"""
IndexNow 일괄 색인 통보 — 빙(Bing)·네이버(Naver)·얀덱스 등에 즉시 통보.
(구글은 IndexNow 미참여 → Search Console 사이트맵 제출 사용)

사용법:
  python tools/indexnow.py                 # dist/sitemap.xml 의 모든 URL 통보
  python tools/indexnow.py /seoul/ /gyeonggi/suwon/   # 특정 경로만 통보

전제: `node build.mjs` 로 dist/ 가 빌드되어 있어야 함(sitemap.xml·키파일 생성).
의존성 없음(파이썬 표준 라이브러리만 사용).
"""
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = json.load(open(os.path.join(ROOT, "src/data/site.json"), encoding="utf-8"))
BASE = SITE["baseUrl"].rstrip("/")
HOST = re.sub(r"^https?://", "", BASE)
KEY = SITE["indexNowKey"]
KEY_LOCATION = f"{BASE}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"  # 한 곳에 보내면 참여 엔진에 공유됨


def urls_from_sitemap():
    path = os.path.join(ROOT, "dist/sitemap.xml")
    if not os.path.exists(path):
        sys.exit("dist/sitemap.xml 이 없습니다. 먼저 `node build.mjs` 를 실행하세요.")
    xml = open(path, encoding="utf-8").read()
    return re.findall(r"<loc>([^<]+)</loc>", xml)


def submit(url_list):
    # IndexNow 1회 요청 최대 10,000 URL
    for i in range(0, len(url_list), 10000):
        batch = url_list[i:i + 10000]
        payload = {
            "host": HOST,
            "key": KEY,
            "keyLocation": KEY_LOCATION,
            "urlList": batch,
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            ENDPOINT, data=data,
            headers={"Content-Type": "application/json; charset=utf-8"},
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                print(f"[{i//10000+1}] {len(batch)} URL → HTTP {resp.status} {resp.reason}")
        except urllib.error.HTTPError as e:
            # 200/202 외에도 키 검증 등으로 4xx 가 올 수 있음 → 본문 출력
            print(f"[{i//10000+1}] {len(batch)} URL → HTTP {e.code}: {e.read().decode('utf-8','ignore')[:300]}")


def main():
    args = sys.argv[1:]
    if args:
        urls = [a if a.startswith("http") else BASE + (a if a.startswith("/") else "/" + a) for a in args]
    else:
        urls = urls_from_sitemap()
    print(f"호스트 {HOST} · 키 {KEY[:8]}… · 통보 URL {len(urls)}개")
    print(f"키 위치 확인: {KEY_LOCATION} (배포 후 접근 가능해야 함)")
    submit(urls)
    print("완료. 빙 웹마스터/네이버 서치어드바이저에서 수집 로그를 확인하세요.")


if __name__ == "__main__":
    main()
