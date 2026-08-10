# Breathe-Easy · Technician Performance

Soft-minimal points competition dashboard for Breathe-Easy technicians.

**Live:** https://mydomshurt.github.io/breathe-easy-dashboard/

## What it shows

- **Overview** — team KPIs, competition table, charts, points system
- **Individual profiles** — Matthew, Nick, Iggi, Alun, Tiago
- Primary metrics: **Points** and **Points / Day** (fair efficiency)
- Josh (director) excluded
- Influencer (free) units count full points
- No revenue displayed

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
| `index.html` | Shell |
| `styles.css` | Layout + mobile |
| `app.js` | UI, charts, routing |
| `data.json` | All metrics + week detail |

## Update data

Edit `data.json` (or regenerate from Service Output) and commit to `main`.
GitHub Pages updates within a minute or two.

## Local

```bash
npx serve .
```
