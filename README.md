# Breathe-Easy · Technician Performance

Soft-minimal points competition dashboard for Breathe-Easy technicians.

**Live:** https://mydomshurt.github.io/breathe-easy-dashboard/

## What it shows

- **Overview** — team KPIs, competition table, charts, points system
- **Individual profiles** — Matthew, Nick, Iggi, Alun, Tiago
- Primary metrics: **Points** and **Points / Day**
- Josh excluded; influencer units count full points
- No revenue on the dashboard

## Points

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

## Files

| File | Role |
|------|------|
| `index.html` | Page shell |
| `styles.css` | Layout + mobile |
| `app.js` | UI, charts, routing |
| `data.json` | Team totals, ranking, points table |
| `weeks.json` | Per-technician week-by-week rows |

`app.js` loads both JSON files and merges week rows onto each technician at runtime.

## Update data

1. Update `data.json` (totals / ranking)
2. Update `weeks.json` (week detail)
3. Commit to `main` — Pages refreshes in 1–2 minutes

## Local

```bash
npx serve .
```
