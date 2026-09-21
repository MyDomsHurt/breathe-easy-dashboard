function renderCompetition(){
  destroyCharts();
  setNav('#/compete');
  const tf = resolveTimeframe(TIMEFRAME);
  const weekKeys = tf.weeks;
  const sorted = rankedTechs(weekKeys, METRIC);
  const mLabel = metricLabel(METRIC);
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
      <p class="explain">Ranked high → low on <strong>${mLabel}</strong> inside the selected period. Gap is distance behind #1. Pts/Day = points ÷ workdays.</p>
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
          const gapHtml = gap == null ? '<span class="gap-lead">Lead</span>' : `<span class="gap-behind">-${metricFmt(METRIC, gap)}</span>`;
          return `<tr class="${i===0?'lead-row':''}">
            <td><span class="rank-num ${i===0?'r1':i===1?'r2':i===2?'r3':''}">${i+1}</span></td>
            <td class="name"><span class="tech-dot" style="background:${TECH_COLORS[t.name]}"></span>${t.name}</td>
            <td class="num"><strong>${metricFmt(METRIC, primary)}</strong></td>
            <td class="num">${fmt(t.pointsDay, 2)}</td>
            <td class="num hide-sm">${fmt(t.points, 1)}</td>
            <td class="num hide-sm">${fmt(t.days)}</td>
            <td class="num hide-sm">${gapHtml}</td>
            <td>${badge(trendInWindow(t))}</td>
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
      <p class="explain">Each completed unit type has a fixed weight. <strong>R</strong> = return visit — counted, <strong>0 points</strong>.</p>
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
    data: { labels: sorted.map(t => t.name), datasets: [{ data: sorted.map(t => metricValue(t, METRIC)), backgroundColor: sorted.map(t => TECH_COLORS[t.name]), borderRadius: 6, barThickness: 26 }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { x: { grid: { color: 'rgba(14,77,145,0.08)' }, beginAtZero: true }, y: { grid: { display: false }, ticks: { font: { size: 13, weight: '600' } } } } }
  }));
  charts.push(new Chart(document.getElementById('c2'), {
    type: 'line',
    data: { labels, datasets: names.map(n => ({ label: n, data: weekKeys.map(k => { const r = (DATA.technicians[n].weeks || []).find(x => x.week === k); return r ? (r.pointsDay || 0) : null; }), borderColor: TECH_COLORS[n], backgroundColor: TECH_COLORS[n] + '22', tension: 0.3, pointRadius: 3, borderWidth: 2, spanGaps: true })) },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12 } } },
      scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(14,77,145,0.08)' }, beginAtZero: true } } }
  }));
}
