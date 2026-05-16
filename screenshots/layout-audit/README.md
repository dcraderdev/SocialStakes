# Layout Audit Screenshots

Captured during `layout-responsive-audit` branch session.
Branch based on `origin/table-seat-work` @ `0229a22`.

## Before (port 3000 — unmodified main branch)

| Page | Viewport | Issue observed |
|------|----------|----------------|
| Lobby `/` | 1440px | Private-game buttons float near viewport top (no nav visible), body offset left 10px |
| History `/history` | 1440px | OK |
| Verify `/verify` | 1440px | OK |
| CoinFlip `/play/coinflip` | 1440px | Loading screen only (app-level) |
| Lobby `/` | 375px  | Same misposition, no mobile responsive |
| History `/history` | 375px | Loading screen (waited too short) |

## After (port 3001 — `layout-responsive-audit` branch)

| Page | Viewport | Result |
|------|----------|--------|
| Lobby `/` | 1440px | Buttons **centered** correctly below nav bar |
| History `/history` | 1440px | Properly centered with visible nav bar |
| Verify `/verify` | 1440px | Properly centered with visible nav bar |
| CoinFlip `/play/coinflip` | 1440px | Properly centered with visible nav bar |
| History `/history` | 375px | Responsive — stacks correctly |
| CoinFlip `/play/coinflip` | 375px | Responsive — stacks correctly |
| Verify `/verify` | 375px | Responsive — stacks correctly |

## Files Changed

- `frontend/src/index.css` — removed `position: absolute; left: -10px; width: 99vw` from body
- `frontend/src/styles/theme.css` — nav visibility, lobby column layout, +180 lines of responsive CSS
- `frontend/src/components/GameFloor/GameFloor.css` — replaced all hacked absolute offsets with clean flex-column layout
- `frontend/src/components/TableSortBar/TableSortBar.css` — `100vw` → `100%`
- `frontend/src/components/TableTile/TableTile.css` — `100vw` → `100%`
- `frontend/src/components/FriendsPage/FriendsPage.css` — `top: 50px` → `top: 56px`, `100vw` → `100%`
- `frontend/src/components/UnknownRoutePage/UnknownRoutePage.css` — `top: 55px` → `top: 56px`, height fix
