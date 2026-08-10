# Breathe-Easy · Technician Performance

Soft-minimal points dashboard for Breathe-Easy technicians (Hong Kong AC service).

**Live:** https://mydomshurt.github.io/breathe-easy-dashboard/

## Pages

| Route | Purpose |
|-------|--------|
| `#/compete` | Head-to-head rankings by Pts/Day, This Week, Month, or Quarter |
| `#/team` | **Full Team** — collective output, no rankings |
| `#/tech/{Name}` | Personal profile (Matthew, Nick, Iggi, Alun, Tiago) |

Josh is excluded. **No revenue** in the UI or ranking metrics.

## Primary metrics

- **Points** (volume / effort)
- **Pts / Day** (pace)
- Timescales: day · week · month · quarter

## Points system

| Unit | Points | Note |
|------|--------|------|
| S | 1.00 | Baseline |
| W | 0.85 | Lower density |
| B | 1.15 | Medium-high |
| C | 1.80 | High complexity |
| UC | 1.30 | |
| TV / OU | 1.40 | |
| SwG | 1.30 | |
| EF / PAU | 1.00 | |

Influencer (free) units receive the **same points** as paid units of the same type.

## Architecture

| File | Role |
|------|------|
| `index.html` | Shell + Chart.js CDN |
| `styles.css` | Soft minimal UI, mobile fixed nav + spacer |
| `app.js` | Routing, aggregation, charts |
| `data.json` | Team totals, ranking, points table |
| `weeks.json` | Per-technician week rows (merged at load) |

### Mobile nav

- Desktop: `position: sticky`
- Mobile (≤768px): `position: fixed` + `#nav-spacer` height measured in JS (`syncNavSpacer`)
- Do **not** set `overflow-x: hidden` on `body` (breaks sticky/scroll)
- Route changes call `scrollTopAndSync()`

### Charts

- One **hero** chart per page; supporting charts secondary
- Bars = volume; lines = pace; stacks = contribution
- Personal pace chart includes own-average reference line

## Update data

1. Edit `data.json` and/or `weeks.json`
2. Commit and push to `main`
3. GitHub Pages deploys automatically

Keep the data split: totals/ranking in `data.json`, time series in `weeks.json`.
