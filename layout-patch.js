/* layout-patch.js — Full Team closer to core reference */
(function () {
  if (typeof teamStory !== 'function') return;

  teamStory = function (stats, scale, tw) {
    let deltaClass = 'flat', deltaText = '';
    if (scale === 'week' && stats.prevPoints != null) {
      const d = stats.points - stats.prevPoints;
      if (d > 0.5) { deltaClass = 'up'; deltaText = 'Up vs last week'; }
      else if (d < -0.5) { deltaClass = 'down'; deltaText = 'Down vs last week'; }
      else { deltaClass = 'flat'; deltaText = 'Flat vs last week'; }
    }
    let isBest = false;
    if (scale === 'week' && tw && tw.length) {
      let best = tw[0].points, bi = 0;
      tw.forEach((r, i) => { if (r.points > best) { best = r.points; bi = i; } });
      isBest = bi === tw.length - 1;
    }
    const chips = [];
    if (deltaText) chips.push(`<span class="story-chip ${deltaClass}">${deltaText}</span>`);
    if (isBest) chips.push(`<span class="story-chip best">Best week so far</span>`);
    if (stats.returns === 0) chips.push(`<span class="story-chip clean">No returns</span>`);
    else chips.push(`<span class="story-chip mild">${fmt(stats.returns)} returns</span>`);
    return `
      <div class="story-top">
        <div class="story-period">${stats.label}</div>
        ${chips.length ? `<div class="story-chips">${chips.join('')}</div>` : ''}
      </div>
      <div class="story-hero-block">
        <div class="story-hero-kicker">Total team points</div>
        <div class="story-hero-value">${fmt(stats.points, 1)}</div>
        <div class="story-hero-sub">Every point is cleaner air</div>
      </div>
      <div class="story-stats">
        <div class="story-stat">
          <div class="story-stat-value">${fmt(stats.pointsDay, 2)}</div>
          <div class="story-stat-label">Pts / day</div>
        </div>
        <div class="story-stat">
          <div class="story-stat-value">${fmt(stats.days)}</div>
          <div class="story-stat-label">Workdays</div>
        </div>
        <div class="story-stat">
          <div class="story-stat-value">${fmt(stats.units)}</div>
          <div class="story-stat-label">Units</div>
        </div>
      </div>`;
  };

  window.crewBoardHtml = function (scale) {
    const mode = scale === 'month' ? 'month' : scale === 'quarter' ? 'quarter' : 'week';
    const sorted = rankBy(mode);
    const key = rankMetricKey(mode);
    const metricLabel = scale === 'month' ? monthLabel(currentMonthKey()) : scale === 'quarter' ? quarterLabel(currentQuarterKey()) : 'This week';
    return `
      <div class="crew-board">
        <div class="crew-board-head">
          <span class="crew-board-title">Crew leaderboard</span>
          <span class="crew-board-sub">${metricLabel}</span>
        </div>
        <ol class="crew-list">
          ${sorted.map((t, i) => `
            <li class="crew-row">
              <span class="crew-rank">${i + 1}</span>
              <span class="crew-dot" style="background:${TECH_COLORS[t.name] || '#0082C8'}"></span>
              <a class="crew-name" href="#/tech/${t.name}">${t.name}</a>
              <span class="crew-pts">${fmt(t[key], 1)}</span>
            </li>`).join('')}
        </ol>
      </div>`;
  };

  renderTeam = function () {
    destroyCharts();
    setNav('#/team');
    const scale = TEAM_SCALE || 'week';
    const team = DATA.team;
    const labels = DATA.weekLabels;
    const weeks = DATA.weeks;
    const names = techNames();
    const tw = teamWeekly();
    const unitTotals = teamUnitTotals();
    const unitOrder = ['S', 'W', 'B', 'C', 'UC', 'SwG', 'TV', 'OU'];
    const unitChips = unitOrder.filter(u => (unitTotals[u] || 0) > 0);
    const stats = teamScaleStats(scale);
    const story = teamStory(stats, scale, tw);
    const scaleBtn = (id, label) => `<button type="button" class="rank-mode-btn ${scale === id ? 'active' : ''}" data-scale="${id}">${label}</button>`;

    document.getElementById('app').innerHTML = `
      <div class="page-header">
        <h1>Full Team</h1>
        <p>Collective output · Updated ${DATA.generated}</p>
      </div>
      <div class="rank-modes" id="team-scales">
        ${scaleBtn('week', 'This Week')}
        ${scaleBtn('month', monthLabel(currentMonthKey()))}
        ${scaleBtn('quarter', quarterLabel(currentQuarterKey()))}
      </div>
      <div class="ref-hero-grid">
        <div class="team-story">${story}</div>
        ${crewBoardHtml(scale)}
      </div>
      <div class="section">
        <div class="section-title">Charts</div>
        <div class="chart-grid">
          <div class="chart-card full hero-card"><h3>What we put up each week</h3><div class="chart-wrap hero"><canvas id="t1"></canvas></div></div>
          <div class="chart-card"><h3>This week vs last week</h3><div class="chart-wrap"><canvas id="t0"></canvas></div></div>
          <div class="chart-card"><h3>Are we pacing above average?</h3><div class="chart-wrap"><canvas id="t2"></canvas></div></div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Week by week</div>
        <div class="table-wrap"><table>
          <thead><tr><th>Week</th><th class="num">Points</th><th class="num">Pts/Day</th><th class="num">Units</th><th class="num">Workdays</th><th class="num">Returns</th></tr></thead>
          <tbody>${tw.map((w, i) => `<tr>
            <td>${labels[i] || w.week}</td>
            <td class="num"><strong>${fmt(w.points, 1)}</strong></td>
            <td class="num">${fmt(w.pointsDay, 2)}</td>
            <td class="num">${fmt(w.units)}</td>
            <td class="num">${fmt(w.days)}</td>
            <td class="num">${fmt(w.returns || 0)}</td>
          </tr>`).join('')}
          <tr style="background:#f0f7fc;font-weight:600">
            <td>All weeks</td>
            <td class="num">${fmt(team.totalPoints, 1)}</td>
            <td class="num">${fmt(team.avgPointsDay, 2)}</td>
            <td class="num">${fmt(team.totalUnits)}</td>
            <td class="num">${fmt(team.totalDays)}</td>
            <td class="num">${fmt(tw.reduce((s, w) => s + (w.returns || 0), 0))}</td>
          </tr>
          </tbody>
        </table></div>
      </div>
      <div class="section">
        <div class="section-title">What the crew delivered</div>
        <div class="unit-chips">${unitChips.map(u => `<div class="unit-chip"><div class="ut">${u}</div><div class="uv">${fmt(unitTotals[u])}</div></div>`).join('')}</div>
      </div>`;

    document.getElementById('team-scales').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-scale]');
      if (!btn) return;
      TEAM_SCALE = btn.getAttribute('data-scale');
      renderTeam();
    });

    const latest = tw.length - 1;
    const prev = latest > 0 ? latest - 1 : -1;
    charts.push(new Chart(document.getElementById('t0'), {
      type: 'bar',
      data: {
        labels: prev >= 0 ? [labels[prev], labels[latest]] : [labels[latest]],
        datasets: [{
          data: prev >= 0 ? [tw[prev].points, tw[latest].points] : [tw[latest].points],
          backgroundColor: prev >= 0 ? ['#94a3b8', '#0082C8'] : ['#0082C8'],
          borderRadius: 8, barThickness: 40
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#e8f1f8' } } } }
    }));
    const avgPD = team.avgPointsDay;
    charts.push(new Chart(document.getElementById('t2'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Pts/day', data: tw.map(w => w.pointsDay), borderColor: '#0082C8', backgroundColor: '#0082C822', fill: true, tension: 0.3, pointRadius: 5, borderWidth: 2.5 },
          { label: 'Avg', data: labels.map(() => avgPD), borderColor: '#94a3b8', borderDash: [6, 4], pointRadius: 0, borderWidth: 1.5, fill: false }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#e8f1f8' } } } }
    }));
    charts.push(new Chart(document.getElementById('t1'), {
      type: 'bar',
      data: {
        labels,
        datasets: names.map(n => ({
          label: n,
          data: weeks.map(w => { const r = (DATA.technicians[n].weeks || []).find(x => x.week === w); return r ? r.points : 0; }),
          backgroundColor: TECH_COLORS[n], borderRadius: 4, stack: 'p'
        }))
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14 } } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: '#e8f1f8' } } } }
    }));
  };
})();
