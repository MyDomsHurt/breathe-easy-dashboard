/* Breathe-Easy Dashboard v63
 * Competition | Full Team | Personal
 * Timeframe + metric controls · full-year weeks.json
 * Returns (R) tracked as count only — 0 points
 */
const TECH_ORDER = ['Matthew','Tiago','Nick','Alun','Iggi'];
const TECH_COLORS = {Matthew:'#2563eb',Nick:'#22c55e',Iggi:'#f97316',Alun:'#a855f7',Tiago:'#0ea5e9'};

let DATA = null, charts = [];
let TIMEFRAME = 'this_month';
let METRIC = 'day'; // day | points | unitsDay

function techNames(){
  const keys = DATA && DATA.technicians ? Object.keys(DATA.technicians) : TECH_ORDER;
  return TECH_ORDER.filter(n => keys.includes(n));
}
function $(id){ return document.getElementById(id); }
function fmt(n, d=0){
  if(n==null || isNaN(n)) return '\u2014';
  return Number(n).toLocaleString('en-HK', {maximumFractionDigits:d, minimumFractionDigits:d});
}
function destroyCharts(){ charts.forEach(c => c.destroy()); charts = []; }
function badge(t){
  const x = (t || 'Stable').toLowerCase();
  return `<span class="badge ${x}">${t}</span>`;
}

async function loadData(){
  const [res, wres] = await Promise.all([fetch('data.json'), fetch('weeks.json')]);
  DATA = await res.json();
  const weeks = await wres.json();
  const cols = weeks._cols;
  for(const name of Object.keys(DATA.technicians || {})){
    if(!weeks[name]) continue;
    if(cols){
      DATA.technicians[name].weeks = weeks[name].map(arr => {
        const o = {};
        cols.forEach((c, i) => { o[c] = arr[i]; });
        return o;
      });
    } else {
      DATA.technicians[name].weeks = weeks[name];
    }
  }
  const keys = allWeekKeys();
  if(keys.length){
    DATA.weeks = keys;
    DATA.weekLabels = keys.map(weekLabelFor);
  }
  if(DATA.ranking){
    DATA.ranking = DATA.ranking.map(t => {
      const live = DATA.technicians[t.name];
      return live ? Object.assign({}, t, live) : t;
    });
  }
}

function setNav(active){
  const names = techNames();
  const competeActive = active === '#/compete' ? ' active' : '';
  const teamActive = active === '#/team' ? ' active' : '';
  $('nav-links').innerHTML =
    names.map(n => `<a href="#/tech/${n}" class="${active === ('#/tech/'+n) ? 'active' : ''}">${n}</a>`).join('') +
    `<span class="nav-sep"></span>` +
    `<a href="#/team" class="${teamActive}">Full Team</a>` +
    `<a href="#/compete" class="nav-compete${competeActive}">Competition</a>`;
}

function allWeekKeys(){
  const set = new Set();
  for(const n of techNames()){
    for(const r of (DATA.technicians[n].weeks || [])) if(r.week) set.add(r.week);
  }
  (DATA.weeks || []).forEach(w => set.add(w));
  return [...set].sort();
}
function weekLabelFor(weekKey){
  for(const n of techNames()){
    const r = (DATA.technicians[n].weeks || []).find(x => x.week === weekKey);
    if(r && r.weekLabel) return r.weekLabel;
  }
  if(!weekKey) return '';
  const d = new Date(weekKey + 'T12:00:00');
  if(isNaN(d)) return weekKey;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return d.getDate().toString().padStart(2,'0') + ' ' + months[d.getMonth()];
}
function weekMonth(weekStr){ return (weekStr || '').slice(0, 7); }
function weekQuarter(weekStr){
  if(!weekStr) return null;
  const y = weekStr.slice(0, 4);
  const m = parseInt(weekStr.slice(5, 7), 10);
  return y + '-Q' + Math.ceil(m / 3);
}
function monthLabel(monthKey){
  if(!monthKey) return 'Month';
  const [y, m] = monthKey.split('-');
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return names[parseInt(m, 10) - 1] + ' ' + y;
}
function quarterLabel(quarterKey){
  if(!quarterKey) return 'Quarter';
  const parts = quarterKey.split('-Q');
  return 'Q' + parts[1] + ' ' + parts[0];
}
function shiftMonth(monthKey, delta){
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
function shiftQuarter(quarterKey, delta){
  const [yStr, qStr] = quarterKey.split('-Q');
  let y = parseInt(yStr, 10), q = parseInt(qStr, 10) + delta;
  while(q < 1){ q += 4; y -= 1; }
  while(q > 4){ q -= 4; y += 1; }
  return y + '-Q' + q;
}

function resolveTimeframe(id){
  const keys = allWeekKeys();
  if(!keys.length) return { id, label: 'No data', weeks: [] };
  const latest = keys[keys.length - 1];
  const prev = keys.length > 1 ? keys[keys.length - 2] : null;
  const thisMonth = weekMonth(latest);
  const lastMonth = shiftMonth(thisMonth, -1);
  const thisQ = weekQuarter(latest);
  const lastQ = shiftQuarter(thisQ, -1);
  const filterMonth = (mk) => keys.filter(k => weekMonth(k) === mk);
  const filterQuarter = (qk) => keys.filter(k => weekQuarter(k) === qk);

  switch(id){
    case 'this_week':
      return { id, label: 'This week · ' + weekLabelFor(latest), weeks: [latest] };
    case 'last_week':
      return { id, label: prev ? 'Last week · ' + weekLabelFor(prev) : 'Last week', weeks: prev ? [prev] : [] };
    case 'last_4':
      return { id, label: 'Last 4 weeks', weeks: keys.slice(-4) };
    case 'this_month':
      return { id, label: monthLabel(thisMonth), weeks: filterMonth(thisMonth) };
    case 'last_month':
      return { id, label: monthLabel(lastMonth), weeks: filterMonth(lastMonth) };
    case 'this_quarter':
      return { id, label: quarterLabel(thisQ), weeks: filterQuarter(thisQ) };
    case 'last_quarter':
      return { id, label: quarterLabel(lastQ), weeks: filterQuarter(lastQ) };
    case 'ytd':
    case 'full':
      return { id, label: id === 'full' ? 'Full year' : 'Year to date', weeks: keys };
    default:
      return { id: 'this_month', label: monthLabel(thisMonth), weeks: filterMonth(thisMonth) };
  }
}

const TF_PRESETS = [
  { id: 'this_week', short: 'This week' },
  { id: 'last_week', short: 'Last week' },
  { id: 'last_4', short: 'Last 4 wks' },
  { id: 'this_month', short: 'This month' },
  { id: 'last_month', short: 'Last month' },
  { id: 'this_quarter', short: 'This quarter' },
  { id: 'last_quarter', short: 'Last quarter' },
  { id: 'ytd', short: 'YTD' },
];

const METRIC_PRESETS = [
  { id: 'day', short: 'Pts / Day' },
  { id: 'points', short: 'Total points' },
  { id: 'unitsDay', short: 'Units / Day' },
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
    name,
    points,
    days,
    units,
    returns,
    pointsDay: days ? Math.round((points / days) * 100) / 100 : 0,
    unitsDay: days ? Math.round((units / days) * 100) / 100 : 0,
    weeks: rows,
    weeksActive: rows.filter(r => (r.workday || 0) > 0 || (r.points || 0) > 0).length,
  };
}

function teamWindowStats(weekKeys){
  const names = techNames();
  let points = 0, days = 0, units = 0, returns = 0;
  const byTech = {};
  for(const n of names){
    const s = techWindowStats(n, weekKeys);
    byTech[n] = s;
    points += s.points;
    days += s.days;
    units += s.units;
    returns += s.returns;
  }
  points = Math.round(points * 10) / 10;
  return {
    points, days, units, returns,
    pointsDay: days ? Math.round((points / days) * 100) / 100 : 0,
    byTech,
  };
}

function rankedTechs(weekKeys, metric){
  return techNames()
    .map(n => techWindowStats(n, weekKeys))
    .sort((a, b) => metricValue(b, metric) - metricValue(a, metric));
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
  const tfBtns = TF_PRESETS.map(p =>
    `<button type="button" class="rank-mode-btn ${TIMEFRAME===p.id?'active':''}" data-tf="${p.id}">${p.short}</button>`
  ).join('');
  const metBtns = METRIC_PRESETS.map(p =>
    `<button type="button" class="rank-mode-btn metric-btn ${METRIC===p.id?'active':''}" data-metric="${p.id}">${p.short}</button>`
  ).join('');
  return `
    <div class="controls-bar" data-scope="${scope}">
      <div class="controls-row">
        <span class="controls-label">Period</span>
        <div class="rank-modes tf-modes">${tfBtns}</div>
      </div>
      <div class="controls-row">
        <span class="controls-label">Rank by</span>
        <div class="rank-modes metric-modes">${metBtns}</div>
      </div>
      <p class="controls-active">Showing <strong>${tf.label}</strong> · ${tf.weeks.length} week${tf.weeks.length===1?'':'s'} · ranked by <strong>${metricLabel(METRIC)}</strong></p>
    </div>`;
}

function bindControls(scope){
  const bar = document.querySelector(`.controls-bar[data-scope="${scope}"]`);
  if(!bar) return;
  bar.addEventListener('click', (e) => {
    const tfBtn = e.target.closest('[data-tf]');
    if(tfBtn){
      TIMEFRAME = tfBtn.getAttribute('data-tf');
      route();
      return;
    }
    const mBtn = e.target.closest('[data-metric]');
    if(mBtn){
      METRIC = mBtn.getAttribute('data-metric');
      route();
    }
  });
}

function renderCompetition(){
  destroyCharts();
  setNav('#/compete');
  const tf = resolveTimeframe(TIMEFRAME);
  const weekKeys = tf.weeks;
  const sorted = rankedTechs(weekKeys, METRIC);
  const mLabel = metricLabel(METRIC);
  const retW = DATA.returnPointsWeight != null ? DATA.returnPointsWeight : 0;
  const labels = weekKeys.map(weekLabelFor);
  const names = techNames();

  document.getElementById('app').innerHTML = `
    <div class="page-header">
      <h1>Competition</h1>
      <p>Period rankings from weighted job points · Updated ${DATA.generated}</p>
    </div>
    ${controlsHtml('compete')}
    <div class="section">
      <div class="section-title">Leaderboard · ${tf.label} · ${mLabel}</div>
      <p class="explain">Ranked high → low on <strong>${mLabel}</strong> inside the selected period. Gap is distance behind #1 on that same measure. Pts/Day = points ÷ workdays in the period.</p>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>#</th><th>Technician</th>
          <th class="num">${mLabel}</th>
          <th class="num">Pts/Day</th>
          <th class="num hide-sm">Points</th>
          <th class="num hide-sm">Days</th>
          <th class="num hide-sm">Gap</th>
          <th>Trend</th>
        </tr></thead>
        <tbody>${sorted.map((t, i) => {
          const primary = metricValue(t, METRIC);
          const gap = i === 0 ? null : metricValue(sorted[0], METRIC) - primary;
          const gapHtml = gap == null
            ? '<span class="gap-lead">Lead</span>'
            : `<span class="gap-behind">-${metricFmt(METRIC, gap)}</span>`;
          const tr = trendInWindow(t);
          return `<tr class="${i===0?'lead-row':''}">
            <td><span class="rank-num ${i===0?'r1':i===1?'r2':i===2?'r3':''}">${i+1}</span></td>
            <td class="name"><span class="tech-dot" style="background:${TECH_COLORS[t.name]}"></span>${t.name}</td>
            <td class="num"><strong>${metricFmt(METRIC, primary)}</strong></td>
            <td class="num">${fmt(t.pointsDay, 2)}</td>
            <td class="num hide-sm">${fmt(t.points, 1)}</td>
            <td class="num hide-sm">${fmt(t.days)}</td>
            <td class="num hide-sm">${gapHtml}</td>
            <td>${badge(tr)}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>
    <div class="section">
      <div class="section-title">Charts · ${tf.label}</div>
      <div class="chart-grid">
        <div class="chart-card full">
          <h3>${mLabel} by person</h3>
          <p class="chart-explain">One bar per person for the selected period.</p>
          <div class="chart-wrap hero"><canvas id="c1"></canvas></div>
        </div>
        <div class="chart-card full">
          <h3>Pts/Day by week</h3>
          <p class="chart-explain">Each technician’s weekly pace inside the selected period.</p>
          <div class="chart-wrap"><canvas id="c2"></canvas></div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Points system</div>
      <p class="explain">Each completed unit type has a fixed weight. <strong>R</strong> = team return visit — tracked as a count, currently <strong>0 points</strong>.</p>
      <div class="points-ref"><table>
        <thead><tr><th>Unit type</th><th class="num">Points each</th><th>Note</th></tr></thead>
        <tbody>${(DATA.pointsTable||[]).map(p =>
          `<tr><td class="name">${p.type}</td><td class="num"><strong>${fmt(p.points,2)}</strong></td><td style="color:var(--mute)">${p.note||''}</td></tr>`
        ).join('')}</tbody>
      </table></div>
    </div>`;

  bindControls('compete');

  charts.push(new Chart(document.getElementById('c1'), {
    type: 'bar',
    data: {
      labels: sorted.map(t => t.name),
      datasets: [{
        data: sorted.map(t => metricValue(t, METRIC)),
        backgroundColor: sorted.map(t => TECH_COLORS[t.name]),
        borderRadius: 6, barThickness: 26
      }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(14,77,145,0.08)' }, beginAtZero: true },
        y: { grid: { display: false }, ticks: { font: { size: 13, weight: '600' } } }
      }
    }
  }));

  charts.push(new Chart(document.getElementById('c2'), {
    type: 'line',
    data: {
      labels,
      datasets: names.map(n => ({
        label: n,
        data: weekKeys.map(k => {
          const r = (DATA.technicians[n].weeks || []).find(x => x.week === k);
          return r ? (r.pointsDay || 0) : null;
        }),
        borderColor: TECH_COLORS[n],
        backgroundColor: TECH_COLORS[n] + '22',
        tension: 0.3, pointRadius: 3, borderWidth: 2, spanGaps: true
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12 } } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(14,77,145,0.08)' }, beginAtZero: true }
      }
    }
  }));
}

function renderTeam(){
  destroyCharts();
  setNav('#/team');
  const tf = resolveTimeframe(TIMEFRAME);
  const weekKeys = tf.weeks;
  const team = teamWindowStats(weekKeys);
  const labels = weekKeys.map(weekLabelFor);
  const names = techNames();
  const retW = DATA.returnPointsWeight != null ? DATA.returnPointsWeight : 0;

  const unitTotals = {};
  for(const n of names){
    for(const r of (team.byTech[n].weeks || [])){
      for(const u of ['S','W','B','C','UC','TV','OU','SwG','EF','PAU']){
        unitTotals[u] = (unitTotals[u] || 0) + (r[u] || 0);
      }
      unitTotals['R'] = (unitTotals['R'] || 0) + (r.returns || 0);
    }
  }
  const unitOrder = ['S','W','B','C','UC','SwG','TV','OU','EF','PAU','R'];
  const weightMap = {};
  (DATA.pointsTable || []).forEach(p => { weightMap[p.type] = p.points; });

  const teamByWeek = weekKeys.map(w => {
    let points = 0, days = 0;
    names.forEach(n => {
      const r = (DATA.technicians[n].weeks || []).find(x => x.week === w);
      if(r){ points += r.points || 0; days += r.workday || 0; }
    });
    return { points, days, pointsDay: days ? points / days : 0 };
  });

  document.getElementById('app').innerHTML = `
    <div class="page-header">
      <h1>Full Team</h1>
      <p>Crew totals for the selected period · Updated ${DATA.generated}</p>
    </div>
    ${controlsHtml('team')}
    <div class="kpi-row">
      <div class="kpi-card"><div class="label">Team points</div><div class="value">${fmt(team.points,1)}</div><div class="kpi-explain">Sum of weighted points in ${tf.label}.</div></div>
      <div class="kpi-card"><div class="label">Pts / Day</div><div class="value">${fmt(team.pointsDay,2)}</div><div class="kpi-explain">Team points ÷ team workdays (${fmt(team.days)} days).</div></div>
      <div class="kpi-card"><div class="label">Units</div><div class="value">${fmt(team.units)}</div><div class="kpi-explain">Unweighted job count in the period.</div></div>
      <div class="kpi-card"><div class="label">Team returns</div><div class="value">${fmt(team.returns)}</div><div class="kpi-explain">Return visits tracked · ${fmt(retW,1)} pts each.</div></div>
    </div>
    <div class="section">
      <div class="section-title">Unit mix · ${tf.label}</div>
      <div class="unit-chips">${unitOrder.filter(u => (unitTotals[u]||0) > 0).map(u =>
        `<div class="unit-chip"><div class="ut">${u} · ${fmt(weightMap[u]!=null?weightMap[u]:0,2)} pts</div><div class="uv">${fmt(unitTotals[u])}</div></div>`
      ).join('')}</div>
    </div>
    <div class="section">
      <div class="section-title">Weekly pace · ${tf.label}</div>
      <div class="chart-grid">
        <div class="chart-card full">
          <h3>Team points by week</h3>
          <p class="chart-explain">Crew total each week in the selected period.</p>
          <div class="chart-wrap"><canvas id="t1"></canvas></div>
        </div>
        <div class="chart-card full">
          <h3>Team Pts/Day by week</h3>
          <p class="chart-explain">Crew pace (points ÷ workdays) each week.</p>
          <div class="chart-wrap"><canvas id="t2"></canvas></div>
        </div>
      </div>
    </div>`;

  bindControls('team');

  charts.push(new Chart(document.getElementById('t1'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: teamByWeek.map(x => x.points), backgroundColor: '#0d9488', borderRadius: 6, barThickness: 28 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(14,77,145,0.08)' }, beginAtZero: true }
      }
    }
  }));
  charts.push(new Chart(document.getElementById('t2'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Team Pts/Day',
        data: teamByWeek.map(x => Math.round(x.pointsDay * 100) / 100),
        borderColor: '#0d9488', backgroundColor: '#0d948822',
        fill: true, tension: 0.3, pointRadius: 4, borderWidth: 2.5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(14,77,145,0.08)' }, beginAtZero: true }
      }
    }
  }));
}

function renderTech(name){
  destroyCharts();
  if(!DATA.technicians[name]){ location.hash = '#/team'; return; }
  setNav('#/tech/' + name);
  const tf = resolveTimeframe(TIMEFRAME);
  const weekKeys = tf.weeks;
  const s = techWindowStats(name, weekKeys);
  const color = TECH_COLORS[name] || '#1481c3';
  const retW = DATA.returnPointsWeight != null ? DATA.returnPointsWeight : 0;
  const labels = weekKeys.map(weekLabelFor);
  const rows = s.weeks.slice().sort((a, b) => a.week.localeCompare(b.week));

  const ut = {};
  for(const r of rows){
    for(const u of ['S','W','B','C','UC','TV','OU','SwG','EF','PAU']){
      ut[u] = (ut[u] || 0) + (r[u] || 0);
    }
    ut['R'] = (ut['R'] || 0) + (r.returns || 0);
  }
  const unitOrder = ['S','W','B','C','UC','SwG','TV','OU','EF','PAU','R'];
  const weightMap = {};
  (DATA.pointsTable || []).forEach(p => { weightMap[p.type] = p.points; });

  document.getElementById('app').innerHTML = `
    <div class="page-header">
      <h1><span class="tech-dot" style="background:${color};width:12px;height:12px;display:inline-block;border-radius:50%;margin-right:8px;vertical-align:middle"></span>${name}</h1>
      <p>Personal performance · ${tf.label} · Updated ${DATA.generated}</p>
    </div>
    ${controlsHtml('tech')}
    <div class="profile-metrics">
      <div><div class="profile-metric-value" style="color:${color}">${fmt(s.points,1)}</div><div class="profile-metric-label">Points</div><p class="kpi-explain">Weighted units in ${tf.label}.</p></div>
      <div><div class="profile-metric-value">${fmt(s.pointsDay,2)}</div><div class="profile-metric-label">Pts / Day</div><p class="kpi-explain">Points ÷ workdays (${fmt(s.days)} days).</p></div>
      <div><div class="profile-metric-value">${fmt(s.units)}</div><div class="profile-metric-label">Units</div><p class="kpi-explain">Job count in the period.</p></div>
      <div><div class="profile-metric-value">${fmt(s.returns)}</div><div class="profile-metric-label">Team returns</div><p class="kpi-explain">Tracked · ${fmt(retW,1)} pts each.</p></div>
    </div>
    <div class="section">
      <div class="section-title">Unit mix · ${tf.label}</div>
      <div class="unit-chips">${unitOrder.filter(u => (ut[u]||0) > 0).map(u =>
        `<div class="unit-chip"><div class="ut">${u} · ${fmt(weightMap[u]!=null?weightMap[u]:0,2)} pts</div><div class="uv">${fmt(ut[u])}</div></div>`
      ).join('')}</div>
    </div>
    <div class="section">
      <div class="section-title">Week by week · ${tf.label}</div>
      <div class="table-wrap"><table class="wide">
        <thead><tr><th>Week</th><th class="num">Points</th><th class="num">Pts/Day</th><th class="num">Units</th><th class="num hide-sm">Days</th><th class="num">Returns</th></tr></thead>
        <tbody>
        ${rows.map(w => `<tr>
          <td>${w.weekLabel || weekLabelFor(w.week)}</td>
          <td class="num"><strong>${fmt(w.points,1)}</strong></td>
          <td class="num">${fmt(w.pointsDay,2)}</td>
          <td class="num">${fmt(w.totalUnits)}</td>
          <td class="num hide-sm">${fmt(w.workday)}</td>
          <td class="num">${fmt(w.returns||0)}</td>
        </tr>`).join('')}
        <tr class="total-row">
          <td>Period total</td>
          <td class="num">${fmt(s.points,1)}</td>
          <td class="num">${fmt(s.pointsDay,2)}</td>
          <td class="num">${fmt(s.units)}</td>
          <td class="num hide-sm">${fmt(s.days)}</td>
          <td class="num">${fmt(s.returns)}</td>
        </tr>
        </tbody>
      </table></div>
    </div>
    <div class="section">
      <div class="section-title">Charts · ${tf.label}</div>
      <div class="chart-grid">
        <div class="chart-card">
          <h3>Your Pts/Day</h3>
          <p class="chart-explain">Weekly pace vs your period average (${fmt(s.pointsDay,2)}).</p>
          <div class="chart-wrap"><canvas id="p1"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>Your points each week</h3>
          <p class="chart-explain">Weighted points in the selected period.</p>
          <div class="chart-wrap"><canvas id="p2"></canvas></div>
        </div>
        <div class="chart-card full">
          <h3>Your team returns</h3>
          <p class="chart-explain">Return visit count per week (0 points).</p>
          <div class="chart-wrap"><canvas id="p3"></canvas></div>
        </div>
      </div>
    </div>`;

  bindControls('tech');

  const avg = s.pointsDay;
  charts.push(new Chart(document.getElementById('p1'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Your Pts/Day',
          data: rows.map(w => w.pointsDay),
          borderColor: color, backgroundColor: color + '22',
          fill: true, tension: 0.3, pointRadius: 4, borderWidth: 2.5
        },
        {
          label: 'Period avg ' + fmt(avg, 2),
          data: labels.map(() => avg),
          borderColor: '#8aa0b8', borderDash: [6, 4],
          pointRadius: 0, borderWidth: 1.5, fill: false
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12 } } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(14,77,145,0.08)' }, beginAtZero: true }
      }
    }
  }));
  charts.push(new Chart(document.getElementById('p2'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: rows.map(w => w.points), backgroundColor: color, borderRadius: 6, barThickness: 28 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(14,77,145,0.08)' }, beginAtZero: true }
      }
    }
  }));
  charts.push(new Chart(document.getElementById('p3'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: rows.map(w => w.returns || 0), backgroundColor: '#69C7EE', borderRadius: 6, barThickness: 28 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(14,77,145,0.08)' }, beginAtZero: true, ticks: { stepSize: 1 } }
      }
    }
  }));
}

function route(){
  const hash = location.hash || '#/team';
  if(hash.startsWith('#/tech/')) renderTech(decodeURIComponent(hash.replace('#/tech/', '')));
  else if(hash === '#/compete') renderCompetition();
  else renderTeam();
}
window.addEventListener('hashchange', route);
loadData().then(() => { route(); }).catch(err => {
  console.error(err);
  $('app').innerHTML = '<p>Failed to load data.</p>';
});
window.startDashboard = function(){ route(); };
