# Breathe-Easy · Technician Performance

Soft-minimal points dashboard for Breathe-Easy technicians (Hong Kong AC service).

**Live:** https://mydomshurt.github.io/breathe-easy-dashboard/

## Pages

| Route | Purpose |
|-------|--------|
| `#/compete` | Rankings by Pts/Day, This Week, Month, or Quarter |
| `#/team` | Full Team — collective output, no rankings |
| `#/tech/{Name}` | Personal profile (Matthew, Nick, Iggi, Alun, Tiago) |

Josh excluded. **No revenue** in the UI.

## Layout (scroll architecture)

**App shell — do not regress:**

- `body` is a full-viewport **flex column** with `overflow: hidden`
- `nav` is **in normal document flow** (`position: relative`) — never `fixed` or `sticky`
- `#app` (`.main`) is the **only scroll container** (`flex: 1; min-height: 0; overflow-y: auto`)
- There is **no nav spacer** and no measured header offset

This design makes it impossible for content to sit under the nav, which was the root of the long-running mobile scroll bugs.

## Files

| File | Role |
|------|------|
| `index.html` | Shell |
| `styles.css` | App shell + UI |
| `app.js` | Routing, aggregation, charts |
| `data.json` | Totals, ranking, points table |
| `weeks.json` | Week-by-week rows (merged at load) |

## Points

S 1.00 · W 0.85 · B 1.15 · C 1.80 · UC 1.30 · TV/OU 1.40 · SwG 1.30 · EF/PAU 1.00

Influencer units = same points as paid.

## Update data

Edit `data.json` / `weeks.json`, push to `main`. GitHub Pages deploys automatically.
