# Scroll-scrub QA report

- Result: **PASS**
- Date: 2026-11-08 20:03
- Browser: Chromium 148.0.7778.96 (Playwright, headless)
- Served from: site/ at http://127.0.0.1/
- Duration: 44.1 s

## Checks

| | Check | Detail |
|---|---|---|
| PASS | mobile: canvas engine running | engine=canvas variant=port-540 ring=32 |
| PASS | mobile: canvas backing store matches CSS size x min(DPR, 2) | 780x1688 for 390x844 CSS at DPR 3 |
| PASS | mobile: each caption holds for >= 0.5 viewport of scroll | travel 2532 px, 3 captions |
| PASS | mobile scroll down: every step settles on the exact frame | slowest 572 ms |
| PASS | mobile scroll down: frames advance | 0 12 24 36 48 59 71 83 95 95 |
| PASS | mobile scroll down: no horizontal overflow | max 0 px |
| PASS | mobile scroll down: one caption at a time |  |
| PASS | mobile: loop sleeps when idle | 0 ticks in 600 ms while idle |
| PASS | mobile scroll up: every step settles on the exact frame | slowest 398 ms |
| PASS | mobile scroll up: frames reverse | 95 95 83 71 59 48 36 24 12 0 |
| PASS | mobile scroll up: no horizontal overflow | max 0 px |
| PASS | mobile scroll up: one caption at a time |  |
| PASS | mobile: caption contrast on the worst frame | c0 18.57 (need 3.0); c1 18.46 (need 4.5); c2 17.25 (need 4.5) |
| PASS | mobile touch flings: frames follow the finger both ways | down 38 75 95 / up 75 37 0 |
| PASS | mobile rotate: canvas not blank right after the resize | centre mean 139.0 |
| PASS | mobile rotate: variant switches and the exact frame returns | port-540 -> land-1920, frame 24 -> 51 (buffer 0, screen 0) in 342 ms, canvas 1688x780 |
| PASS | mobile reduced-motion: static hold frame, no scrub | engine=static reason=reduced-motion poster=end-portrait.webp section=844 px (vh 844) |
| PASS | mobile reduced-motion: every caption visible | opacities [1, 1, 1] |
| PASS | mobile reduced-motion: no horizontal overflow | 0 px |
| PASS | mobile reduced-motion: caption contrast on the worst frame | c0 3.04 (need 3.0); c1 7.34 (need 4.5); c2 17.25 (need 4.5) |
| PASS | desktop: canvas engine running | engine=canvas variant=land-1920 ring=24 |
| PASS | desktop: canvas backing store matches CSS size x min(DPR, 2) | 1440x900 for 1440x900 CSS at DPR 1 |
| PASS | desktop: each caption holds for >= 0.5 viewport of scroll | travel 2700 px, 3 captions |
| PASS | desktop scroll down: every step settles on the exact frame | slowest 580 ms |
| PASS | desktop scroll down: frames advance | 0 12 24 36 48 59 71 83 95 95 |
| PASS | desktop scroll down: no horizontal overflow | max 0 px |
| PASS | desktop scroll down: one caption at a time |  |
| PASS | desktop: loop sleeps when idle | 0 ticks in 600 ms while idle |
| PASS | desktop scroll up: every step settles on the exact frame | slowest 402 ms |
| PASS | desktop scroll up: frames reverse | 95 95 83 71 59 48 36 24 12 0 |
| PASS | desktop scroll up: no horizontal overflow | max 0 px |
| PASS | desktop scroll up: one caption at a time |  |
| PASS | desktop: caption contrast on the worst frame | c0 3.30 (need 3.0); c1 18.20 (need 3.0); c2 7.73 (need 3.0) |
| PASS | desktop mouse wheel: frames follow the wheel both ways | down 17 34 51 68 84 95 / up 84 68 51 34 17 0 |
| PASS | desktop reduced-motion: static hold frame, no scrub | engine=static reason=reduced-motion poster=end.webp section=900 px (vh 900) |
| PASS | desktop reduced-motion: every caption visible | opacities [1, 1, 1] |
| PASS | desktop reduced-motion: no horizontal overflow | 0 px |
| PASS | desktop reduced-motion: caption contrast on the worst frame | c0 3.62 (need 3.0); c1 11.85 (need 3.0); c2 12.56 (need 3.0) |
| PASS | desktop video-fallback: video engine running | engine=video file=scrub.mp4 |
| PASS | desktop video-fallback down: every step settles on the exact frame | slowest 567 ms |
| PASS | desktop video-fallback down: frames advance | 0 16 32 48 63 79 95 |
| PASS | desktop video-fallback down: no horizontal overflow | max 0 px |
| PASS | desktop video-fallback down: one caption at a time |  |
| PASS | desktop video-fallback up: every step settles on the exact frame | slowest 443 ms |
| PASS | desktop video-fallback up: frames reverse | 95 79 63 48 32 16 0 |
| PASS | desktop video-fallback up: no horizontal overflow | max 0 px |
| PASS | desktop video-fallback up: one caption at a time |  |
| PASS | desktop frozen-rAF: watchdog keeps the frame in sync | drawn [0, 29, 66, 95, 48, 0], pixels match=True, rafless=True |
| PASS | console, page and HTTP errors | none |

## Console and network

- No console errors, page errors or HTTP errors.

## Notes

- mobile: no frame code in the footage, pixel check skipped
- mobile: first frame painted 77 ms after navigation start
- mobile: 1478 KB downloaded; 0 long tasks (max 0 ms)
- desktop: no frame code in the footage, pixel check skipped
- desktop: first frame painted 24 ms after navigation start
- desktop: 963 KB downloaded; 0 long tasks (max 0 ms)

## mobile scroll down

| step | scrollY | progress | target | drawn | buffer | screen | settle ms | captions | contrast |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | 0.000 | 0.0 | 0 | 0 | 0 | 0 | 0 | c0 18.9 |
| 1 | 316 | 0.125 | 11.9 | 12 | 0 | 0 | 323 | 0 | c0 18.6 |
| 2 | 633 | 0.250 | 23.8 | 24 | 0 | 127 | 344 | - | - |
| 3 | 950 | 0.375 | 35.6 | 36 | 0 | 127 | 394 | 1 | - |
| 4 | 1266 | 0.500 | 47.5 | 48 | 0 | 127 | 572 | 1 | c1 18.5 |
| 5 | 1582 | 0.625 | 59.4 | 59 | 0 | 127 | 276 | - | - |
| 6 | 1899 | 0.750 | 71.2 | 71 | 0 | 127 | 291 | 2 | - |
| 7 | 2216 | 0.875 | 83.1 | 83 | 62 | 127 | 296 | 2 | c2 17.3 |
| 8 | 2532 | 1.000 | 95.0 | 95 | 127 | 127 | 278 | 2 | c2 17.2 |
| 9 | 2954 | 1.000 | 95.0 | 95 | 127 | - | 0 | 2 | c2 17.2 |

## mobile scroll up

| step | scrollY | progress | target | drawn | buffer | screen | settle ms | captions | contrast |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 2954 | 1.000 | 95.0 | 95 | 127 | - | 2 | 2 | c2 17.2 |
| 1 | 2532 | 1.000 | 95.0 | 95 | 127 | 127 | 1 | 2 | c2 17.2 |
| 2 | 2216 | 0.875 | 83.1 | 83 | 62 | 127 | 323 | 2 | c2 17.3 |
| 3 | 1899 | 0.750 | 71.2 | 71 | 0 | 127 | 352 | 2 | c2 17.4 |
| 4 | 1582 | 0.625 | 59.4 | 59 | 0 | 127 | 398 | - | - |
| 5 | 1266 | 0.500 | 47.5 | 48 | 0 | 127 | 263 | 1 | c1 18.5 |
| 6 | 950 | 0.375 | 35.6 | 36 | 0 | 127 | 293 | 1 | c1 18.6 |
| 7 | 633 | 0.250 | 23.8 | 24 | 0 | 127 | 287 | - | - |
| 8 | 316 | 0.125 | 11.9 | 12 | 0 | 0 | 267 | 0 | c0 18.6 |
| 9 | 0 | 0.000 | 0.0 | 0 | 0 | 0 | 282 | 0 | c0 18.9 |

## desktop scroll down

| step | scrollY | progress | target | drawn | buffer | screen | settle ms | captions | contrast |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | 0.000 | 0.0 | 0 | 0 | 0 | 0 | 0 | c0 13.3 |
| 1 | 338 | 0.125 | 11.9 | 12 | 0 | 0 | 312 | 0 | c0 3.3 |
| 2 | 675 | 0.250 | 23.8 | 24 | 0 | 127 | 350 | - | - |
| 3 | 1012 | 0.375 | 35.6 | 36 | 0 | 127 | 398 | 1 | - |
| 4 | 1350 | 0.500 | 47.5 | 48 | 0 | 127 | 580 | 1 | c1 18.2 |
| 5 | 1688 | 0.625 | 59.4 | 59 | 0 | 127 | 266 | - | - |
| 6 | 2025 | 0.750 | 71.2 | 71 | 0 | 127 | 266 | - | - |
| 7 | 2362 | 0.875 | 83.1 | 83 | 127 | 127 | 263 | 2 | c2 7.9 |
| 8 | 2700 | 1.000 | 95.0 | 95 | 127 | 127 | 271 | 2 | c2 7.7 |
| 9 | 3150 | 1.000 | 95.0 | 95 | 127 | - | 1 | 2 | c2 7.7 |

## desktop scroll up

| step | scrollY | progress | target | drawn | buffer | screen | settle ms | captions | contrast |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 3150 | 1.000 | 95.0 | 95 | 127 | - | 1 | 2 | c2 7.7 |
| 1 | 2700 | 1.000 | 95.0 | 95 | 127 | 127 | 0 | 2 | c2 7.7 |
| 2 | 2362 | 0.875 | 83.1 | 83 | 127 | 127 | 307 | 2 | c2 7.9 |
| 3 | 2025 | 0.750 | 71.2 | 71 | 0 | 127 | 328 | 2 | c2 8.3 |
| 4 | 1688 | 0.625 | 59.4 | 59 | 0 | 127 | 402 | - | - |
| 5 | 1350 | 0.500 | 47.5 | 48 | 0 | 127 | 269 | 1 | c1 18.2 |
| 6 | 1012 | 0.375 | 35.6 | 36 | 0 | 127 | 265 | 1 | c1 18.3 |
| 7 | 675 | 0.250 | 23.8 | 24 | 0 | 127 | 265 | - | - |
| 8 | 338 | 0.125 | 11.9 | 12 | 0 | 0 | 303 | 0 | c0 3.3 |
| 9 | 0 | 0.000 | 0.0 | 0 | 0 | 0 | 275 | 0 | c0 13.3 |

## desktop video-fallback down

| step | scrollY | progress | target | drawn | buffer | screen | settle ms | captions | contrast |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | 0.000 | 0.0 | 0 | 0 | 0 | 0 | 0 | - |
| 1 | 450 | 0.167 | 15.8 | 16 | 0 | 7 | 349 | 0 | - |
| 2 | 900 | 0.333 | 31.7 | 32 | 0 | 127 | 396 | - | - |
| 3 | 1350 | 0.500 | 47.5 | 48 | 0 | 127 | 567 | 1 | - |
| 4 | 1800 | 0.667 | 63.3 | 63 | 0 | 127 | 304 | - | - |
| 5 | 2250 | 0.833 | 79.2 | 79 | 62 | 127 | 303 | 2 | - |
| 6 | 2700 | 1.000 | 95.0 | 95 | 127 | 127 | 345 | 2 | - |

## desktop video-fallback up

| step | scrollY | progress | target | drawn | buffer | screen | settle ms | captions | contrast |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 2700 | 1.000 | 95.0 | 95 | 127 | 127 | 0 | 2 | - |
| 1 | 2250 | 0.833 | 79.2 | 79 | 62 | 127 | 346 | 2 | - |
| 2 | 1800 | 0.667 | 63.3 | 63 | 0 | 127 | 443 | - | - |
| 3 | 1350 | 0.500 | 47.5 | 48 | 0 | 127 | 311 | 1 | - |
| 4 | 900 | 0.333 | 31.7 | 32 | 0 | 127 | 304 | - | - |
| 5 | 450 | 0.167 | 15.8 | 16 | 0 | 7 | 298 | 0 | - |
| 6 | 0 | 0.000 | 0.0 | 0 | 0 | 0 | 305 | 0 | - |

## Screenshots (qa-out/)

Open every one before calling the section done.

- mobile-down-00.png
- mobile-down-01.png
- mobile-down-02.png
- mobile-down-03.png
- mobile-down-04.png
- mobile-down-05.png
- mobile-down-06.png
- mobile-down-07.png
- mobile-down-08.png
- mobile-down-09.png
- mobile-rotated.png
- mobile-reduced.png
- desktop-down-00.png
- desktop-down-01.png
- desktop-down-02.png
- desktop-down-03.png
- desktop-down-04.png
- desktop-down-05.png
- desktop-down-06.png
- desktop-down-07.png
- desktop-down-08.png
- desktop-down-09.png
- desktop-reduced.png
- desktop-video-mid.png
