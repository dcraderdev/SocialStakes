# Layout Audit — Round 2

Branch: `layout-responsive-audit`  
Base commit: `b5726a5` (round 1 fixes)  
Audit date: 2026-05-16

## Fixes Applied

### 1. `body { margin: 0; padding: 0; }` — `frontend/src/index.css`
**Root cause:** Browser default `body { margin: 8px }` was never overridden.  
**Impact:** Everything was shifted 8px right + 8px down from the viewport edge. `docScrollWidth` on the lobby exceeded the viewport by 8px.  
**Fix:** Added `margin: 0; padding: 0;` to the body rule.

### 2. Private game buttons anonymous wrapper — `theme.css` + `GameFloor.css`
**Root cause:** The JSX wraps `.private-game-buttons` in an anonymous `<div>` (no class). With the parent flex container having `align-items: center`, the anonymous div had computed `width: 0` — the buttons overflowed from the center but only accidentally centered.  
**Fix:**  
- Added `.gamefloor-container > div { width: 100%; box-sizing: border-box; }` in `theme.css` — anonymous wrapper is now explicitly full-width.  
- Added `margin: 0 auto !important` to `.private-game-buttons` in `theme.css` — centers the 1200px-wide button row inside the full-width wrapper.  
- Added `margin: 0 auto` to `.private-game-buttons` in `GameFloor.css`.

### 3. Button-stack breakpoint raised — `GameFloor.css` + `theme.css`
**Root cause:** Two `width: 280px` buttons + `24px` gap = 584px total. The old `max-width: 600px` breakpoint let buttons into a row at 600–660px viewport where they couldn't fit without overflowing.  
**Fix:** Raised column-stack breakpoint from `600px` to `660px` in both files.

### 4. Profile modal hidden state — `ProfileButtonModal.css`
**Root cause:** `.profile-modal.hidden { right: -300px }` kept the element in the stacking context as `display: block; visibility: visible`. JS audits always flagged it as an overflowing element even though it was off-screen.  
**Fix:** Added `visibility: hidden; pointer-events: none; transition: right 1s ease, visibility 0s linear 1s;` to `.profile-modal.hidden`. Added `visibility: visible; pointer-events: auto;` to `.profile-modal.visible`. The element is now truly inert when hidden.

### 5. `html { margin: 0; padding: 0; }` — `theme.css`
Explicitly zeroed the html element margin/padding to ensure a clean baseline across all browsers.

---

## JavaScript Audit Results (post-fix)

All measurements taken via `getBoundingClientRect()` + `getComputedStyle()` injected into the live browser.  
Viewport: 1440px | Center: 720px | Scrollbar: ~15px | Content-area center: ~713px  
**Note:** A −7px to −15px offset from *viewport* center is expected and correct — it equals the scrollbar gutter. Content is centered in the *content area*, not the scrollbar gutter.

| Page | Element | Left | Width | Center | Off from viewport-cx | Status |
|------|---------|------|-------|--------|----------------------|--------|
| `/` Lobby | body | 0 | 1425 | 712 | −7 | ✓ (scrollbar) |
| `/` Lobby | `.gamefloor-container` | 73 | 1280 | 713 | −7 | ✓ |
| `/` Lobby | `.private-game-buttons` | 113 | 1200 | 713 | −7 | ✓ |
| `/play/coinflip` | `.ss-page` | 49 | 1328 | 713 | −7 | ✓ |
| `/play/hilo` | `.ss-page` | 49 | 1328 | 713 | −7 | ✓ |
| `/play/acey` | `.ss-page` | 49 | 1328 | 713 | −7 | ✓ |
| `/history` | body | 0 | — | — | 0 | ✓ |
| `/history` | `.ss-page` (behind loading screen) | 41 | 1328 | 705 | −15 | ✓ (scrollbar) |
| `/friends` | body | 0 | — | — | 0 | ✓ |
| `/thisdoesnotexist` | `.unknown-container` | 0 | 1440 | 720 | 0 | ✓ |
| `/thisdoesnotexist` | `.unknown-text-container` | 359 | 722 | 720 | 0 | ✓ |

**`docScrollWidth` = viewport width (1440)** on all pages — no horizontal overflow.  
**`realOverflow` = []** on all pages (filtered to exclude children of fixed-position elements).

---

## Narrow Viewport Audit (~614px — closest Chrome allows)

| Page | Element | Status |
|------|---------|--------|
| `/` Lobby | body margin | 0px ✓ |
| `/` Lobby | `.gamefloor-container` | centered (off: −7) ✓ |
| `/` Lobby | `.private-game-buttons` | column stack, centered (off: −7) ✓ |
| `/` Lobby | `.private-game-button` (single) | w: 322px, centered (off: −7) ✓ |
| `/play/coinflip` | `.ss-page` | full-width content area, no overflow ✓ |

---

## Screenshots Saved

| File | Viewport | Page |
|------|----------|------|
| `after/lobby-1440px.png` | 1440px | Lobby `/` |
| `after/coinflip-1440px.png` | 1440px | CoinFlip `/play/coinflip` |
| `after/404-1440px.png` | 1440px | 404 page |
| `after/lobby-375px.png` | ~614px (browser min) | Lobby `/` narrow |
| `after/coinflip-375px.png` | ~614px (browser min) | CoinFlip narrow |

---

## Files Changed in Round 2

| File | Change |
|------|--------|
| `frontend/src/index.css` | `body { margin: 0; padding: 0; }` |
| `frontend/src/styles/theme.css` | `.gamefloor-container > div { width: 100% }`, `.private-game-buttons { margin: 0 auto }`, breakpoint 600→660px, `html { margin: 0; padding: 0 }` |
| `frontend/src/components/GameFloor/GameFloor.css` | `margin: 0 auto` on `.private-game-buttons`, breakpoint 600→660px |
| `frontend/src/components/ProfileButtonModal/ProfileButtonModal.css` | `.hidden`: `visibility: hidden; pointer-events: none`. `.visible`: `visibility: visible; pointer-events: auto` |
