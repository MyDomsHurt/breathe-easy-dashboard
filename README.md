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

Competition sits at the end, separated by a vertical rule.

---

## Layout (scroll architecture)

**App shell — do not regress:**

| Rule | Detail |
|------|--------|
| `body` | Full viewport flex column, `overflow: hidden` |
| `nav` | **In document flow** (`position: relative`) — never `fixed` or `sticky` |
| `#app` (`.main`) | **Only** scroll container (`flex: 1; min-height: 0; overflow-y: auto`) |
| Spacer | **None** |

---

## Files

| File | Role |
|------|------|
| `index.html` | Shell + Chart.js + cache-busted assets |
| `styles.css` | App shell + Direction A UI tokens |
| `chart-wrap.js` | Chart.js colour/grid overrides (before app.js) |
| `colors-patch.js` | TECH_COLORS vivid series (after app.js) |
| `app.js` | Routing, aggregation, charts, `TECH_ORDER` |
| `data.json` | Team totals, ranking seed, points table |
| `weeks.json` | Per-technician week rows |

After UI changes, bump `?v=` on assets in `index.html`.

---

## Design (Direction A)

**Neutral stage + vivid series. Teal is the only UI accent. Brand navy only on the wordmark.**

| Token | Value | Use |
|-------|--------|-----|
| Page background | `#f7f6f3` | Warm stone stage |
| Text | Charcoal / stone | UI chrome |
| **Accent (teal)** | `#0d9488` | Active nav, pills, team system charts |
| **Brand navy** | `#154487` | **Wordmark only** |
| Matthew | `#2563eb` | Chart series |
| Tiago | `#0ea5e9` | Chart series |
| Nick | `#22c55e` | Chart series |
| Alun | `#a855f7` | Chart series |
| Iggi | `#f97316` | Chart series |

Do **not** flood the UI with brand blue. Data carries colour; the frame stays neutral.

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

**Influencer units** score the same points as paid units of the same type.

**No revenue** in the UI or served data files.

---

## Competition metrics

1. **Pts / Day** — pace
2. **This Week** — weekly output
3. **Month** — current month output
4. **Quarter** — current quarter output

---

## Update data

1. Edit `data.json` and/or `weeks.json`
2. Keep technician names consistent with `TECH_ORDER`
3. Push to `main`
4. Zero-output weeks must appear as **0** (not missing) for continuous line charts
