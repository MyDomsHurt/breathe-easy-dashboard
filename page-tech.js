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
          <p class="chart-explain">Weekly pace vs period average (${fmt(s.pointsDay,2)}).</p>
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
    data: { labels, datasets: [
      { label: 'Your Pts/Day', data: rows.map(w => w.pointsDay), borderColor: color, backgroundColor: color + '22', fill: true, tension: 0.3, pointRadius: 4, borderWidth: 2.5 },
      { label: 'Period avg ' + fmt(avg, 2), data: labels.map(() => avg), borderColor: '#8aa0b8', borderDash: [6, 4], pointRadius: 0, borderWidth: 1.5, fill: false }
    ] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12 } } },
      scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(14,77,145,0.08)' }, beginAtZero: true } } }
  }));
  charts.push(new Chart(document.getElementById('p2'), {
    type: 'bar',
    data: { labels, datasets: [{ data: rows.map(w => w.points), backgroundColor: color, borderRadius: 6, barThickness: 28 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(14,77,145,0.08)' }, beginAtZero: true } } }
  }));
  charts.push(new Chart(document.getElementById('p3'), {
    type: 'bar',
    data: { labels, datasets: [{ data: rows.map(w => w.returns || 0), backgroundColor: '#69C7EE', borderRadius: 6, barThickness: 28 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(14,77,145,0.08)' }, beginAtZero: true, ticks: { stepSize: 1 } } } }
  }));
}
function route(){
  const hash = location.hash || '#/team';
  if(hash.startsWith('#/tech/')) renderTech(decodeURIComponent(hash.replace('#/tech/', '')));
  else if(hash === '#/compete') renderCompetition();
  else renderTeam();
}
window.addEventListener('hashchange', route);
window.startDashboard = function(){
  if (window.__dashboardStarted) { route(); return; }
  window.__dashboardStarted = true;
  loadData().then(function(){ route(); }).catch(function(err){
    console.error(err);
    var el = document.getElementById('app');
    if (el) el.innerHTML = '<p>Failed to load data.</p>';
  });
};
