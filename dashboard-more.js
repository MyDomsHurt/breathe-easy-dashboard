const TF_PRESETS = [
  { id: 'this_week', short: 'This week' },
  { id: 'last_week', short: 'Last week' },
  { id: 'last_4', short: 'Last 4 wks' },
  { id: 'this_month', short: 'This month' },
  { id: 'last_month', short: 'Last month' },
  { id: 'this_quarter', short: 'This quarter' },
  { id: 'last_quarter', short: 'Last quarter' },
  { id: 'ytd', short: 'YTD' }
];
const METRIC_PRESETS = [
  { id: 'day', short: 'Pts / Day' },
  { id: 'points', short: 'Total points' },
  { id: 'unitsDay', short: 'Units / Day' }
];
function metricLabel(id){
  return ({ day: 'Pts/Day', points: 'Points', unitsDay: 'Units/Day' })[id] || 'Pts/Day';
}
function metricFmt(id, v){
  if(id === 'points') return fmt(v, 1);
  return fmt(v, 2);
}
function metricValue(stats, id){
  if(id === 'points') return stats.points;
  if(id === 'unitsDay') return stats.unitsDay;
  return stats.pointsDay;
}
function techWindowStats(name, weekKeys){
  const set = new Set(weekKeys);
  const rows = (DATA.technicians[name].weeks || []).filter(r => set.has(r.week));
  let points = 0, days = 0, units = 0, returns = 0;
  for(const r of rows){
    points += r.points || 0;
    days += r.workday || 0;
    units += r.totalUnits || 0;
    returns += r.returns || 0;
  }
  points = Math.round(points * 10) / 10;
  return {
    name, points, days, units, returns,
    pointsDay: days ? Math.round((points / days) * 100) / 100 : 0,
    unitsDay: days ? Math.round((units / days) * 100) / 100 : 0,
    weeks: rows,
    weeksActive: rows.filter(r => (r.workday || 0) > 0 || (r.points || 0) > 0).length
  };
}
function teamWindowStats(weekKeys){
  const names = techNames();
  let points = 0, days = 0, units = 0, returns = 0;
  const byTech = {};
  for(const n of names){
    const s = techWindowStats(n, weekKeys);
    byTech[n] = s;
    points += s.points; days += s.days; units += s.units; returns += s.returns;
  }
  points = Math.round(points * 10) / 10;
  return { points, days, units, returns, pointsDay: days ? Math.round((points / days) * 100) / 100 : 0, byTech };
}
function rankedTechs(weekKeys, metric){
  return techNames().map(n => techWindowStats(n, weekKeys)).sort((a, b) => metricValue(b, metric) - metricValue(a, metric));
}
function trendInWindow(stats){
  const active = (stats.weeks || []).filter(r => (r.workday || 0) > 0);
  if(active.length < 2) return 'Stable';
  const a = active[active.length - 2].pointsDay || 0;
  const b = active[active.length - 1].pointsDay || 0;
  if(b > a + 0.3) return 'Improving';
  if(b < a - 0.3) return 'Declining';
  return 'Stable';
}
function controlsHtml(scope){
  const tf = resolveTimeframe(TIMEFRAME);
  const tfBtns = TF_PRESETS.map(p => `<button type="button" class="rank-mode-btn ${TIMEFRAME===p.id?'active':''}" data-tf="${p.id}">${p.short}</button>`).join('');
  const metBtns = METRIC_PRESETS.map(p => `<button type="button" class="rank-mode-btn metric-btn ${METRIC===p.id?'active':''}" data-metric="${p.id}">${p.short}</button>`).join('');
  return `<div class="controls-bar" data-scope="${scope}">
      <div class="controls-row"><span class="controls-label">Period</span><div class="rank-modes tf-modes">${tfBtns}</div></div>
      <div class="controls-row"><span class="controls-label">Rank by</span><div class="rank-modes metric-modes">${metBtns}</div></div>
      <p class="controls-active">Showing <strong>${tf.label}</strong> · ${tf.weeks.length} week${tf.weeks.length===1?'':'s'} · ranked by <strong>${metricLabel(METRIC)}</strong></p>
    </div>`;
}
function bindControls(scope){
  const bar = document.querySelector('.controls-bar[data-scope="'+scope+'"]');
  if(!bar) return;
  bar.addEventListener('click', function(e){
    const tfBtn = e.target.closest('[data-tf]');
    if(tfBtn){ TIMEFRAME = tfBtn.getAttribute('data-tf'); route(); return; }
    const mBtn = e.target.closest('[data-metric]');
    if(mBtn){ METRIC = mBtn.getAttribute('data-metric'); route(); }
  });
}
