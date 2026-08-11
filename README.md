# Breathe-Easy · Technician Performance

Points-only performance dashboard for Breathe-Easy technicians (Hong Kong AC cleaning).

**Live:** https://mydomshurt.github.io/breathe-easy-dashboard/

**Repo:** https://github.com/MyDomsHurt/breathe-easy-dashboard

---

## What this is

Static SPA (HTML / CSS / Chart.js) on GitHub Pages. No backend.

- **Primary metrics:** Points and Pts/Day (not revenue)
- **Audience:** technicians + management — transparency and motivation
- **Josh is excluded** (director, not in rankings or charts)

Technicians in fixed display order:

**Matthew → Tiago → Nick → Alun → Iggi**

(`TECH_ORDER` in `app.js`. Rank tables still sort by the selected metric.)

---

## Pages & navigation

| Route | Purpose |
|-------|--------|
| `#/team` | **Full Team** — collective output, story strip, no rankings |
| `#/tech/{Name}` | Personal profile — KPIs, unit mix, week table, charts |
| `#/compete` | **Competition** — leaderboard by Pts/Day, This Week, Month, or Quarter |

**Default route:** `#/team` (crew-first).

**Nav order:**

```
Full Team · Matthew · Tiago · Nick · Alun · Iggi  |  Competition
```

Competition sits at the end, separated by a vertical rule, so it reads as its own mode — not part of the crew strip.

---

## Layout (scroll architecture)

**App shell — do not regress:**

| Rule | Detail |
|------|--------|
| `body` | Full viewport flex column, `overflow: hidden` |
| `nav` | **In document flow** (`position: relative`) — never `fixed` or `sticky` |
| `#app` (`.main`) | **Only** scroll container (`flex: 1; min-height: 0; overflow-y: auto`) |
| Spacer | **None** — no measured header offset |

This is what fixed the recurring mobile “can’t scroll back to top / content under nav” bugs. Reintroducing `position: fixed` on the nav will bring them back.

On route change, scroll resets via `scrollMainTop()` on `#app` (not `window`).

---

## Files

| File | Role |
|------|------|
| `index.html` | Shell + Chart.js CDN + cache-busted CSS/JS |
| `styles.css` | App shell, UI, brand tokens |
| `app.js` | Routing, aggregation, charts, `TECH_ORDER` |
| `data.json` | Team totals, ranking seed, points table (no revenue) |
| `weeks.json` | Per-technician week rows (merged into `DATA` at load) |

`app.js` loads both JSON files and attaches `weeks` onto each technician.

After UI changes, bump `?v=` on `styles.css` / `app.js` in `index.html` so Pages/CDN clients get the new build.

---

## Points system

| Unit | Points |
|------|--------|
| S | 1.00 |
| W | 0.85 |
| B | 1.15 |
| C | 1.80 |
| UC | 1.30 |
| TV / OU | 1.40 |
| SwG | 1.30 |
| EF / PAU | 1.00 |

**Influencer units** score the same points as paid units of the same type. They are not used when deriving the points-per-unit calibration from revenue (that logic lives in the source spreadsheet work; the web app only displays the final points).

**No revenue / Est. $** anywhere in the UI or in the served data files.

---

## Colour / design notes

Current UI tokens lean on the public site palette (optional for an internal board):

| Token | Hex | Use |
|-------|-----|-----|
| Navy | `#154487` | Titles, strong text, Alun series |
| Blue | `#1481c3` | Primary / active, Matthew series |
| Sky | `#59bcee` | Accent, Tiago series |
| Orange | `#fb8e28` | Warm accent, Iggi series |
| Green | `#16a34a` | Positive / Nick series |

Chart series colours follow technicians; rank order is independent of nav order.

Soft / minimal layout: Inter, light cards, Chart.js. Structure is stable; visual direction may still evolve (e.g. neutral stage vs brand-blue chrome).

---

## Competition metrics

On `#/compete`, ranking modes:

1. **Pts / Day** — pace (fair when days worked differ)
2. **This Week** — output this week
3. **Month** — output in the current month
4. **Quarter** — output in the current quarter

All four are intentional ways to compete.

---

## Update data

1. Edit `data.json` and/or `weeks.json`
2. Keep technician names consistent with `TECH_ORDER` / existing keys
3. Push to `main`
4. GitHub Pages deploys from `main` automatically

Zero-output weeks must still appear as **0** (not missing) so line charts stay continuous (e.g. Tiago).

---

## Local check

Open `index.html` via any static server (or the live Pages URL). Hash routes:

- `/#/team`
- `/#/compete`
- `/#/tech/Matthew`
