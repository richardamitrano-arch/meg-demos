# Launch QA report

- Target: local directory site (served at http://127.0.0.1/)
- Run: 2026-11-08 20:04:01, launch_qa.py 1.0.0, Chromium 148.0.7778.96
- **Verdict: PASS** (0 FAIL, 0 WARN, 14 PASS)

| Check | Result | Measured |
|---|---|---|
| Page loads (HTTP status) | **PASS** | HTTP 200, load 9 ms (desktop) |
| Console errors / uncaught exceptions | **PASS** | 0 errors across 3 viewports |
| Failed requests (4xx/5xx/blocked) | **PASS** | 0 failed requests |
| Horizontal overflow | **PASS** | scrollWidth == clientWidth at 390/768/1440 |
| <title> | **PASS** | 51 chars: Hotel Alba · Twelve rooms facing east over the lake |
| Meta description | **PASS** | 86 chars |
| og:title / og:image | **PASS** | present; og:image is relative (media/hero/end.webp): fine for a local preview, must be absolute on the live URL |
| <html lang> | **PASS** | lang="en" |
| Exactly one <h1> | **PASS** | 1 <h1>: Hotel Alba. Twelve rooms facing east over the lake. |
| Images have alt | **PASS** | 1 <img>, all with alt |
| Meta viewport | **PASS** | width=device-width, initial-scale=1, viewport-fit=cover |
| Text >= 12px on mobile | **PASS** | 19 text elements, none under 12px |
| Tap targets >= 40px on mobile | **PASS** | 5 targets, all >= 40px |
| Same-origin links resolve | **PASS** | 0 same-origin links, all OK |

## Viewports

| Viewport | HTTP | Load ms | Page height px | scrollWidth/clientWidth | Screenshot |
|---|---|---|---|---|---|
| mobile 390x844 | 200 | 15 | 4566 | 390/390 | screenshots/mobile-390x844.png |
| tablet 768x1024 | 200 | 14 | 5153 | 768/768 | screenshots/tablet-768x1024.png |
| desktop 1440x900 | 200 | 9 | 4724 | 1440/1440 | screenshots/desktop-1440x900.png |


## What this report does not prove

These checks prove the page loads and is not structurally broken. They do not prove it looks right. Open every screenshot above and look at it before calling the page ready; full-page screenshots of scroll-animated sites can show sections in their un-revealed state, so judge motion from a recording, not from these images.
