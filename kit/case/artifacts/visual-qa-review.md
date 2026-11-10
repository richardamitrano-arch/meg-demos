# Visual QA review

- Target: local directory site (served at http://127.0.0.1/)
- Generated: 2026-11-08 20:03:02 by visual_qa.py 1.0.0 (Chromium 148.0.7778.96), frame step 0.50 s, settle 0.70 s
- Measured: **0 BLOCK, 35 FLAG**. No measured BLOCK. This is not a pass: the review below decides.

Measured signals are pointers to frames, not verdicts. One bad frame found by eye blocks delivery just as much as a measured BLOCK. Open every contact sheet and every crop before writing a verdict.

## Recordings and sheets

| Size | Video | Length | Scroll | Sheets (frames every 0.50 s) | Frames measured |
|---|---|---|---|---|---|
| phone 390x844 @2x | videos/phone.mp4 | 9.1s | 675 px/s via wheel, page 4566 px | `sheets/phone-sheet-01.png`, `sheets/phone-sheet-02.png` | 11 in `frames/phone` |
| desktop 1440x900 @1x | videos/desktop.mp4 | 9.0s | 720 px/s via wheel, page 4724 px | `sheets/desktop-sheet-01.png`, `sheets/desktop-sheet-02.png` | 11 in `frames/desktop` |

Sheet labels read `#frame  time  y scrollY`. Time is the video clock. Scroll positions come from the scroll log, pinned to the video by detecting where motion starts and stops (phone: motion end (onset disagreed by 2.44 s), offset +2.41 s; desktop: motion end (onset disagreed by 2.47 s), offset +2.40 s). Calibrated labels are accurate to about +/- 0.1 s; uncalibrated ones to about +/- 0.5 s. Frames before the page loaded are blank.

## Measured: phone (390x844)

### Text contrast over imagery (worst first)

Contrast is measured per text node against the real pixels behind it (a second screenshot with all text transparent). p10 = the contrast over the worst 10% of the background, p50 = typical. Needs 4.5:1, or 3:1 for large text.

| Sev | Frame | y | Text | px | p10 | p50 | Need | Behind | Crop |
|---|---|---|---|---|---|---|---|---|---|
| OK | #7 3.5s | 2873 | Rooms | 15.2 | 11.87 | 12.46 | 4.5 | canvas | worst/phone-contrast-01.png |
| OK | #7 3.5s | 2873 | Hotel Alba | 15.2 | 12.28 | 13.27 | 4.5 | canvas | - |
| OK | #7 3.5s | 2873 | 22 m², king bed, balcony | 16 | 13.13 | 13.13 | 4.5 | solid | - |
| OK | #7 3.5s | 2873 | from 180 € with breakfast | 16 | 13.13 | 13.13 | 4.5 | solid | - |
| OK | #8 4.0s | 3211 | 34 m², corner windows, bath | 16 | 13.13 | 13.13 | 4.5 | solid | - |
| OK | #8 4.0s | 3211 | from 260 € with breakfast | 16 | 13.13 | 13.13 | 4.5 | solid | - |
| OK | #8 4.0s | 3211 | 16 m², queen bed | 16 | 13.13 | 13.13 | 4.5 | solid | - |
| OK | #8 4.0s | 3211 | from 130 € with breakfast | 16 | 13.13 | 13.13 | 4.5 | solid | - |
| OK | #7 3.5s | 2873 | Book | 15.2 | 13.60 | 13.85 | 4.5 | canvas | - |
| OK | #5 2.5s | 2196 | Check availability | 16 | 17.93 | 17.93 | 4.5 | solid | - |

11 text node(s) were covered by another element at measure time (overlay, header, banner) and were not measured. Check the frames for what covers them.

### Layout shifts

Sum of layout-shift values without input: **0.000** (OK; BLOCK above 0.1).

### Empty viewports and flat bands

- FLAG frame #1 (0.5s, y 850): full-width near-black band 96 px tall at 720 px (11% of viewport). worst/phone-band-01.png
- FLAG frame #7 (3.5s, y 2873): full-width near-black band 96 px tall at 528 px (11% of viewport). worst/phone-band-02.png
- FLAG frame #8 (4.0s, y 3211): full-width near-black band 96 px tall at 192 px (11% of viewport). worst/phone-band-03.png
- FLAG frame #9 (4.5s, y 3547): full-width near-black band 240 px tall at 480 px (28% of viewport). 
- FLAG frame #10 (5.0s, y 3722): full-width near-black band 240 px tall at 288 px (28% of viewport). 

### Invisible text after settle

- FLAG frame #0 (y 509): 3 text node(s) at opacity ~0 in view. `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(1)` "You see this sunrise from the bed. Break"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2)` "Double room with breakfast from 180 € a "; `div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2) > a.btn` "Check availability"
- FLAG frame #1 (y 850): 4 text node(s) at opacity ~0 in view. `h1#hero-title` "Hotel Alba. Twelve rooms facing east ove"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(1)` "You see this sunrise from the bed. Break"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2)` "Double room with breakfast from 180 € a "
- FLAG frame #2 (y 1187): 3 text node(s) at opacity ~0 in view. `h1#hero-title` "Hotel Alba. Twelve rooms facing east ove"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2)` "Double room with breakfast from 180 € a "; `div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2) > a.btn` "Check availability"
- FLAG frame #3 (y 1526): 4 text node(s) at opacity ~0 in view. `h1#hero-title` "Hotel Alba. Twelve rooms facing east ove"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(1)` "You see this sunrise from the bed. Break"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2)` "Double room with breakfast from 180 € a "
- FLAG frame #4 (y 1862): 4 text node(s) at opacity ~0 in view. `h1#hero-title` "Hotel Alba. Twelve rooms facing east ove"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(1)` "You see this sunrise from the bed. Break"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2)` "Double room with breakfast from 180 € a "
- FLAG frame #5 (y 2196): 2 text node(s) at opacity ~0 in view. `h1#hero-title` "Hotel Alba. Twelve rooms facing east ove"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(1)` "You see this sunrise from the bed. Break"

Reveal animations that never fire leave empty panels. Confirm on the contact sheet.

### Cut or clipped text

None measured.

### Images rendered larger than their source

- FLAG `div.scrub__stage > picture.scrub__poster > img` 540x962 source shown at 390x844 CSS px (1.14 source px per CSS px, best srcset 1.14) frame #0. worst/phone-image-01.png

BLOCK below 1.0 (blurry on every screen), FLAG below 1.5 (soft on high-density screens). CSS background images are not measured: judge them on the frames.

### Small copy (under 12 px at this size)

None.

### CTA timing

- OK: first CTA "Check availability" visible after 3.3 s of scrolling (limit 4 s) (frame #5, y 2196)

### Section spacing rhythm

Whitespace between consecutive top-level blocks (padding-bottom + gap + next padding-top):

- 152 px  `main#top > section.scrub.scrub--live:nth-of-type(1)` -> `section#rooms`
- 253 px  `section#rooms` -> `section#book`

## Measured: desktop (1440x900)

### Text contrast over imagery (worst first)

Contrast is measured per text node against the real pixels behind it (a second screenshot with all text transparent). p10 = the contrast over the worst 10% of the background, p50 = typical. Needs 4.5:1, or 3:1 for large text.

| Sev | Frame | y | Text | px | p10 | p50 | Need | Behind | Crop |
|---|---|---|---|---|---|---|---|---|---|
| OK | #7 3.5s | 3015 | 22 m², king bed, balcony | 16 | 13.13 | 13.13 | 4.5 | solid | worst/desktop-contrast-01.png |
| OK | #7 3.5s | 3015 | 34 m², corner windows, bath | 16 | 13.13 | 13.13 | 4.5 | solid | - |
| OK | #8 4.0s | 3375 | from 180 € with breakfast | 16 | 13.13 | 13.13 | 4.5 | solid | - |
| OK | #8 4.0s | 3375 | from 260 € with breakfast | 16 | 13.13 | 13.13 | 4.5 | solid | - |
| OK | #8 4.0s | 3375 | 16 m², queen bed | 16 | 13.13 | 13.13 | 4.5 | solid | - |
| OK | #8 4.0s | 3375 | from 130 € with breakfast | 16 | 13.13 | 13.13 | 4.5 | solid | - |
| OK | #7 3.5s | 3015 | Rooms | 15.2 | 14.42 | 14.46 | 4.5 | canvas | - |
| OK | #7 3.5s | 3015 | Book | 15.2 | 14.42 | 14.46 | 4.5 | canvas | - |
| OK | #4 2.0s | 1938 | Hotel Alba | 15.2 | 16.39 | 16.39 | 4.5 | canvas | - |
| OK | #5 2.5s | 2294 | Check availability | 16 | 17.93 | 17.93 | 4.5 | solid | - |

13 text node(s) were covered by another element at measure time (overlay, header, banner) and were not measured. Check the frames for what covers them.

### Layout shifts

Sum of layout-shift values without input: **0.000** (OK; BLOCK above 0.1).

### Empty viewports and flat bands

- FLAG frame #8 (4.0s, y 3375): 82% of the viewport is one flat colour (luma 7). worst/desktop-empty-02.png
- FLAG frame #9 (4.5s, y 3735): 81% of the viewport is one flat colour (luma 8). worst/desktop-empty-03.png
- FLAG frame #10 (5.0s, y 3824): 84% of the viewport is one flat colour (luma 8). worst/desktop-empty-01.png
- FLAG frame #0 (0.0s, y 495): full-width near-black band 96 px tall at 768 px (11% of viewport). worst/desktop-band-01.png
- FLAG frame #2 (1.0s, y 1215): full-width near-black band 96 px tall at 768 px (11% of viewport). worst/desktop-band-02.png
- FLAG frame #7 (3.5s, y 3015): full-width near-black band 96 px tall at 624 px (11% of viewport). worst/desktop-band-03.png
- FLAG frame #8 (4.0s, y 3375): full-width near-black band 144 px tall at 240 px (16% of viewport). 
- FLAG frame #8 (4.0s, y 3375): full-width near-black band 96 px tall at 768 px (11% of viewport). 
- FLAG frame #9 (4.5s, y 3735): full-width near-black band 240 px tall at 384 px (27% of viewport). 
- FLAG frame #10 (5.0s, y 3824): full-width near-black band 288 px tall at 288 px (32% of viewport). 

### Invisible text after settle

- FLAG frame #0 (y 495): 3 text node(s) at opacity ~0 in view. `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(1)` "You see this sunrise from the bed. Break"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2)` "Double room with breakfast from 180 € a "; `div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2) > a.btn` "Check availability"
- FLAG frame #1 (y 856): 4 text node(s) at opacity ~0 in view. `h1#hero-title` "Hotel Alba. Twelve rooms facing east ove"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(1)` "You see this sunrise from the bed. Break"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2)` "Double room with breakfast from 180 € a "
- FLAG frame #2 (y 1215): 3 text node(s) at opacity ~0 in view. `h1#hero-title` "Hotel Alba. Twelve rooms facing east ove"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2)` "Double room with breakfast from 180 € a "; `div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2) > a.btn` "Check availability"
- FLAG frame #3 (y 1574): 3 text node(s) at opacity ~0 in view. `h1#hero-title` "Hotel Alba. Twelve rooms facing east ove"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2)` "Double room with breakfast from 180 € a "; `div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2) > a.btn` "Check availability"
- FLAG frame #4 (y 1938): 4 text node(s) at opacity ~0 in view. `h1#hero-title` "Hotel Alba. Twelve rooms facing east ove"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(1)` "You see this sunrise from the bed. Break"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(2)` "Double room with breakfast from 180 € a "
- FLAG frame #5 (y 2294): 2 text node(s) at opacity ~0 in view. `h1#hero-title` "Hotel Alba. Twelve rooms facing east ove"; `div.scrub__stage > div.scrub__captions:nth-of-type(2) > p.cap:nth-of-type(1)` "You see this sunrise from the bed. Break"

Reveal animations that never fire leave empty panels. Confirm on the contact sheet.

### Cut or clipped text

None measured.

### Images rendered larger than their source

- FLAG `div.scrub__stage > picture.scrub__poster > img` 1920x1080 source shown at 1440x900 CSS px (1.20 source px per CSS px, best srcset 1.20) frame #0. worst/desktop-image-01.png

BLOCK below 1.0 (blurry on every screen), FLAG below 1.5 (soft on high-density screens). CSS background images are not measured: judge them on the frames.

### Small copy (under 14 px at this size)

None.

### CTA timing

- OK: first CTA "Check availability" visible after 3.2 s of scrolling (limit 4 s) (frame #5, y 2294)

### Section spacing rhythm

Whitespace between consecutive top-level blocks (padding-bottom + gap + next padding-top):

- 162 px  `main#top > section.scrub.scrub--live:nth-of-type(1)` -> `section#rooms`
- 270 px  `section#rooms` -> `section#book`

## Frames to open first

- phone frames/phone/000-t000.0s-y00509.png: image, invisible text
- phone frames/phone/001-t000.5s-y00850.png: black band, invisible text
- phone frames/phone/007-t003.5s-y02873.png: black band, invisible text
- phone frames/phone/008-t004.0s-y03211.png: black band, invisible text
- phone frames/phone/009-t004.5s-y03547.png: black band
- phone frames/phone/010-t005.0s-y03722.png: black band
- desktop frames/desktop/008-t004.0s-y03375.png: black band, empty viewport, invisible text
- desktop frames/desktop/000-t000.0s-y00495.png: black band, image, invisible text
- desktop frames/desktop/009-t004.5s-y03735.png: black band, empty viewport
- desktop frames/desktop/010-t005.0s-y03824.png: black band, empty viewport
- desktop frames/desktop/002-t001.0s-y01215.png: black band, invisible text
- desktop frames/desktop/007-t003.5s-y03015.png: black band, invisible text

## Fail-on-sight rubric (first reviewer)

Fill every line with PASS or FAIL and the frame reference (`phone #12`, `desktop sheet-02 cell 5`). "Looks fine" without a frame reference is not an answer. Definitions: references/rubric.md.

| # | Defect | phone | desktop | Evidence (frame refs, what you saw) |
|---|---|---|---|---|
| R1 | Mushy, upscaled or over-compressed imagery | | | |
| R2 | Cut, ghost or overlapping text during transitions (check every sheet cell) | | | |
| R3 | Tiny copy on desktop (body copy under 14 px, labels under 12 px) | | | |
| R4 | Empty panels: boxes, sections or viewports with nothing in them, unloaded images, reveals that never fire | | | |
| R5 | AI-image tells: garbled lettering, warped hands or fingers, melted objects, impossible geometry, fake logos | | | |
| R6 | Hard black or flat bands: letterboxing, black canvas, unrendered WebGL, missing video poster | | | |
| R7 | Inconsistent spacing rhythm between sections or inside repeated components | | | |
| R8 | CTA not visible within the time limit of scrolling, or visible but not readable as the next step | | | |
| R9 | Low-contrast text over imagery or gradients | | | |
| R10 | Layout jumps: content moving under the reader after load or during scroll | | | |
| R11 | Text cut at the viewport edge or clipped by its container | | | |
| R12 | Broken motion: stutter, a pinned section that never releases, a scrubbed video that does not move | | | |

Motion (R2, R12) cannot be proven from stills. If you could not watch the videos, write "motion not reviewed" here instead of PASS:

- Videos watched: yes / no
- Opened: all 4 sheets, all crops in `worst/`, frames listed above: yes / no

## Adversarial second reviewer

Run the protocol in references/adversarial-review.md. Paste its findings here unedited:

| # | Size | Frame | Defect | Severity (BLOCK / POLISH / NOT-A-DEFECT) | Reason |
|---|---|---|---|---|---|
| 1 | | | | | |

## Delivery decision

- [ ] Zero measured BLOCK, or each one fixed and the run repeated
- [ ] Every rubric line PASS with a frame reference
- [ ] Every second-reviewer BLOCK fixed and re-run (arguing is not fixing)
- [ ] Delivered together with: `videos/phone.mp4`, `videos/desktop.mp4`, the contact sheets and this file

Decision: BLOCKED / READY (one bad frame = BLOCKED). Signed by: ____  Date: ____
