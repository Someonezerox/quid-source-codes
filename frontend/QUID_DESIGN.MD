# QUID — Design System

Internal style reference for the QUID admin UI (Telegram bot support-automation product). Dark theme, lime accent, Manrope. Every page shares the same shell so screens feel like one product.

---

## 1. Foundations

### Color

**Surfaces (dark, layered)**
| Token | Hex | Use |
|---|---|---|
| Canvas | `#0B0B0C` | App background, body |
| Sidebar | `#0E0E10` | Left icon rail |
| Card | `#141416` | KPI cards, table card |
| Card (raised) | `#161618` | Header search field |
| Input / control | `#1C1C1F` | Inline search, filter buttons, pagination |

**Text**
| Token | Hex | Use |
|---|---|---|
| Primary | `#FAFAFA` | Headings, key values, active rows |
| Secondary | `#C8C8CE` | Control labels, body |
| Muted | `#9A9AA2` | Inactive nav, last-seen |
| Faint | `#8A8A92` | Card labels, descriptions |
| Dim | `#65656D` | Inline meta, placeholders, footers |
| Ghost | `#55555C` | Table column headers |

**Accent** — `--accent`, default lime `#BEF264`. Used on the logo tile, active nav item, primary buttons, avatar, current pagination page, and the lead KPI icon. Exposed as a tweakable `accent` prop on every page (swatches: `#BEF264`, `#38BDF8`, `#A78BFA`, `#34D399`, `#FBBF24`). Text/icons **on** accent are always `#0B0B0C`.

**Status / semantic**
| Meaning | Color |
|---|---|
| Online / Active / success | `#34D399` |
| Away / Idle / low stock / warning | `#FBBF24` |
| Info / New / Human tag | `#38BDF8` |
| AI tag | `#A78BFA` |
| Offline / blocked / error | `#F87171` (dot for offline uses `#65656D`) |

Status surfaces are the hue at `~14%` alpha fill + `~28–30%` alpha border (e.g. `rgba(52,211,153,.14)` / `rgba(52,211,153,.28)`).

### Borders & dividers
- Hairline border: `1px solid rgba(255,255,255,.06)` (cards, controls).
- Sidebar / header divider: `rgba(255,255,255,.05)`.
- Table row divider: `rgba(255,255,255,.035)`.

### Type — Manrope (400–800)
| Role | Size / weight |
|---|---|
| Page title (`h1`) | 21px / 800, `letter-spacing:-.02em` |
| Page subtitle | 13px / 8A8A92 |
| KPI value | 25px / 800, `-.02em` |
| KPI label | 12.5px / 600 |
| Row primary | 14px / 700 |
| Row meta / handle | 12px / `#65656D` |
| Controls, tabs, buttons | 12.5–13px / 600–700 |
| Column header | 11px / 700, uppercase, `letter-spacing:.04em` |
| Tag pill | 9.5px / 800, `.04em` |

### Radius
Cards 18–20px · controls/buttons 9–11px · pills/tabs 9px · pagination 8px · avatars 50% · load bar 4px · logo tile 10px.

### Spacing
Page padding `24px 28px 36px`; header `20px 28px`; card padding 18px; table cells `14px 22px`; grid/flex gaps 16px (cards), 10px (controls), 7px (tabs).

---

## 2. Shell (shared on every page)

**Sidebar** — fixed 78px icon rail on `#0E0E10`. Top: lime logo tile + "QUID" wordmark. Center `nav`: Dashboard · Inbox · Products · Contacts · Agents (icon + 11px label, stacked, centered, 22px gap). Bottom: Settings, "M" avatar with green presence dot, red logout.
- Active item: `.quid-nav-item.active` → accent color, transparent bg.
- Inactive: `#9A9AA2`; hover → `#FAFAFA`. Transition `color/background .2s`.
- **Exactly one** item carries `active`; it's the current page.

**Main** — `flex:1`, scrolls. Sticky blurred header (`rgba(11,11,12,.82)` + `backdrop-filter:blur(12px)`) holding title + subtitle.

---

## 3. Components

**KPI card** — `#141416` card, 18px radius, flex row: 42px rounded icon tile + label/value stack. First card's icon tile uses accent (`#0B0B0C` glyph); others use a status-tinted tile. Four per row (`grid-template-columns:repeat(4,1fr)`, gap 16px).

**Table card** — `#141416`, 20px radius, `overflow:hidden`. Three stacked bands:
1. **Filter row** — left: tab pills (active = `rgba(255,255,255,.07)` + `#FAFAFA`, rest transparent + `#8A8A92`); right: inline search (`#1C1C1F`, 230px), optional ghost filter/category button, accent primary button. Search + filters live **in this row**, not the page header.
2. **Column header** — `grid`, 11px uppercase ghost labels; columns match the rows below.
3. **Rows** — `.quid-prow`, same grid, `14px 22px`, divider `rgba(255,255,255,.035)`, hover `rgba(255,255,255,.028)`. Footer: "Showing X of Y" + pagination (current page = accent).

**Buttons**
- Primary `.quid-btn`: accent bg, `#0B0B0C` text, 700, radius 9–11px; hover `brightness(1.07)`.
- Ghost `.quid-ghost`: `#1C1C1F` bg, hairline border, `#C8C8CE`; hover `rgba(255,255,255,.06)`.

**Avatar** — 40px circle, gradient fill, `#0B0B0C` 800 initials. Optional presence dot bottom-right (`border:2px solid #141416`).

**Pills & tags**
- Status pill: 7px dot + label in the status color.
- Tag (HUMAN / AI / VIP): tinted fill + border in the semantic hue, uppercase 9.5px.
- Load bar: 6px track `rgba(255,255,255,.07)`; fill color by load — `<50%` green, `50–79%` amber, `≥80%` red.

---

## 4. Pages
- **Dashboard** — overview KPIs, charts, live conversations, top agents.
- **Inbox** — 3-pane: rail + conversation list + chat panel.
- **Products** — KPI cards (Total / In stock / Low / Out) + catalog table; Search·Category·Add-product in filter row.
- **Contacts** — KPI cards + contacts table (handle, VIP, status, spend, last seen).
- **Agents** — KPI cards (Active w/ human·AI split, Online now, Avg response, Resolution) + agents table (Human/AI tag, status, active-chats load bar, handled, avg resp, resolution).

---

## 5. Rules
1. Never introduce a color outside the palette — drive theming through `--accent`.
2. One sidebar item active = the current page.
3. Search and filters belong in the table's filter row, not the page header.
4. `#0B0B0C` is the only text/icon color allowed on accent surfaces.
5. Inline styles only, Manrope throughout, keep radii/spacing on the scales above.
