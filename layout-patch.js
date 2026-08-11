/* layout-patch.js — Full Team closer to core reference (English only, artistic)
   Sculptural hero · skyline · water splash · letter badges · dark crew board
*/
(function () {
  const LETTER = { Matthew: 'M', Tiago: 'T', Nick: 'N', Alun: 'A', Iggi: 'I' };

  function skylineSvg() {
    return `<svg class="skyline" viewBox="0 0 900 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(255,255,255,0.22)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0.04)"/>
        </linearGradient>
      </defs>
      <path fill="url(#skyGrad)" d="M0 100 V58 H14 V40 H24 V58 H38 V30 H48 V58 H62 V45 H72 V58 H88 V24 H100 V58 H116 V50 H128 V20 H140 V58 H156 V38 H170 V58 H186 V14 H200 V58 H218 V42 H232 V58 H250 V28 H264 V58 H282 V48 H296 V10 H314 V58 H332 V32 H346 V58 H364 V40 H378 V58 H396 V22 H412 V58 H428 V44 H442 V58 H460 V16 H476 V58 H494 V36 H508 V58 H526 V30 H540 V58 H558 V42 H572 V58 H590 V24 H604 V58 H622 V50 H636 V58 H654 V32 H668 V58 H686 V46 H700 V58 H718 V20 H734 V58 H752 V38 H766 V58 H784 V26 H798 V58 H816 V44 H830 V58 H848 V18 H864 V58 H882 V40 H896 V58 H900 V100 Z"/>
      <path fill="rgba(255,255,255,0.08)" d="M0 100 V66 H50 V54 H100 V66 H150 V48 H200 V66 H250 V58 H300 V66 H350 V44 H400 V66 H450 V52 H500 V66 H550 V40 H600 V66 H650 V54 H700 V66 H750 V46 H800 V66 H850 V56 H900 V100 Z"/>
    </svg>`;
  }

  function splashSvg() {
    return `<svg class="hero-splash" viewBox="0 0 480 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="w1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(94,200,240,0.55)"/>
          <stop offset="100%" stop-color="rgba(0,130,200,0.15)"/>
        </linearGradient>
        <linearGradient id="w2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(0,130,200,0.5)"/>
          <stop offset="100%" stop-color="rgba(15,31,74,0.2)"/>
        </linearGradient>
      </defs>
      <path fill="url(#w1)" d="M0 90 Q50 35 110 75 T220 55 T330 80 T440 50 T480 70 V140 H0 Z"/>
      <path fill="url(#w2)" d="M0 105 Q70 50 140 90 T280 65 T400 95 T480 80 V140 H0 Z"/>
      <path fill="rgba(255,255,255,0.28)" d="M10 115 Q90 70 160 105 T300 85 T420 110 T480 95 V140 H0 Z"/>
      <path fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.8" d="M5 95 Q80 40 150 85 T290 60 T420 90"/>
      <path fill="none" stroke="rgba(94,200,240,0.4)" stroke-width="1.2" d="M20 110 Q100 65 180 100 T320 75 T460 105"/>
    </svg>`;
  }

  function apply() {
    if (typeof teamStory !== 'function' || typeof renderTeam !== 'function') return false;

    teamStory = function (stats, scale, tw) {
      let deltaClass = 'flat', deltaText = '';
      if (scale === 'week' && stats.prevPoints != null) {
        const d = stats.points - stats.prevPoints;
        if (d > 0.5) { deltaClass = 'up'; deltaText = '↑ Up vs last week'; }
        else if (d < -0.5) { deltaClass = 'down'; deltaText = '↓ Down vs last week'; }
        else { deltaClass = 'flat'; deltaText = '→ Flat vs last week'; }
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
      if (stats.returns === 0) chips.push(`<span class="story-chip clean">Zero returns</span>`);
      else chips.push(`<span class="story-chip mild">${fmt(stats.returns)} returns</span>`);

      const periodLabel = scale === 'month' ? (stats.label || 'This month') :
        scale === 'quarter' ? (stats.label || 'This quarter') : 'This week';

      return `
        ${skylineSvg()}
        <div class="poster-glow"></div>
        <div class="poster-top-row">
          <div class="poster-brand-block">
            <div class="poster-logo-mark">Breathe-Easy</div>
            <div class="poster-logo-sub">AC CLEANING CREW · HONG KONG</div>
          </div>
          <div class="poster-tagline">CLEAN AIR. COOL CONFIDENCE.<br>EVERY SPACE. EVERY TIME.</div>
        </div>
        <div class="poster-main">
          <div class="poster-mission">
            <div class="mission-label">OUR MISSION</div>
            <p class="mission-en">Breathing deeper. Cleaning deeper.<br>Healthier air for Hong Kong.</p>
            <div class="story-chips">${chips.join('')}</div>
          </div>
          <div class="poster-hero-col">
            <div class="story-hero-kicker">
              <span class="star-icon">✦</span> TEAM POINTS · ${periodLabel.toUpperCase()}
            </div>
            <div class="story-hero-value-wrap">
              <div class="story-hero-value">${fmt(stats.points, 1)}</div>
              ${splashSvg()}
            </div>
            <div class="story-hero-sub">Every point is cleaner air.</div>
          </div>
        </div>
        <div class="poster-metrics">
          <div class="p-metric">
            <div class="p-metric-icon">⚡</div>
            <div class="p-metric-val">${fmt(stats.pointsDay, 2)}</div>
            <div class="p-metric-lab">Pts / day</div>
          </div>
          <div class="p-metric">
            <div class="p-metric-icon">📅</div>
            <div class="p-metric-val">${fmt(stats.days)}</div>
            <div class="p-metric-lab">Workdays</div>
          </div>
          <div class="p-metric">
            <div class="p-metric-icon">🔧</div>
            <div class="p-metric-val">${fmt(stats.units)}</div>
            <div class="p-metric-lab">Units</div>
          </div>
          <div class="p-metric">
            <div class="p-metric-icon">${stats.returns === 0 ? '✓' : '↩'}</div>
            <div class="p-metric-val">${fmt(stats.returns)}</div>
            <div class="p-metric-lab">Returns</div>
          </div>
        </div>
        <div class="poster-footer-line">CLEANER SYSTEMS · HEALTHIER SPACES · STRONGER TEAM</div>
      `;
    };

    window.crewBoardHtml = function (scale) {
      const mode = scale === 'month' ? 'month' : scale === 'quarter' ? 'quarter' : 'week';
      const sorted = rankBy(mode);
      const key = rankMetricKey(mode);
      const metricLabel = scale === 'month' ? monthLabel(currentMonthKey()) :
        scale === 'quarter' ? quarterLabel(currentQuarterKey()) : 'This week';

      return `
        <div class="crew-board">
          <div class="crew-board-head">
            <span class="crew-board-title"><span class="trophy">🏆</span> LEADERBOARD</span>
            <span class="crew-board-sub">crew standings · ${metricLabel}</span>
          </div>
          <ol class="crew-list">
            ${sorted.map((t, i) => {
              const letter = LETTER[t.name] || t.name.charAt(0);
              const color = (typeof TECH_COLORS !== 'undefined' && TECH_COLORS[t.name]) || '#0082C8';
              let changeHtml = '';
              if (t.change != null && !isNaN(t.change)) {
                const up = t.change >= 0;
                changeHtml = `<span class="crew-chg ${up ? 'up' : 'down'}">${up ? '↑' : '↓'} ${Math.abs(Math.round(t.change * 100))}%</span>`;
              }
              return `
              <li class="crew-row">
                <span class="crew-letter" style="background:${color}">${letter}</span>
                <span class="crew-rank">${i + 1}</span>
                <a class="crew-name" href="#/tech/${t.name}">${t.name.toUpperCase()}</a>
                <span class="crew-pts">${fmt(t[key], 1)}</span>
                ${changeHtml}
              </li>`;
            }).join('')}
          </ol>
          <div class="crew-total">
            <span>TEAM TOTAL</span>
            <span>${fmt(sorted.reduce((s, t) => s + (t[key] || 0), 0), 1)}</span>
          </div>
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
        <div class="ref-hero-grid">
          <div class="team-story poster">${story}</div>
          ${crewBoardHtml(scale)}
        </div>
        <div class="rank-modes" id="team-scales">
          ${scaleBtn('week', 'This Week')}
          ${scaleBtn('month', monthLabel(currentMonthKey()))}
          ${scaleBtn('quarter', quarterLabel(currentQuarterKey()))}
        </div>
        <div class="section">
          <div class="section-title">Weekly performance</div>
          <div class="chart-grid">
            <div class="chart-card full hero-card wave-card">
              <h3>What we put up each week</h3>
              <div class="chart-wrap hero"><canvas id="t1"></canvas></div>
            </div>
            <div class="chart-card">
              <h3>This week vs last week</h3>
              <div class="chart-wrap"><canvas id="t0"></canvas></div>
            </div>
            <div class="chart-card">
              <h3>Are we pacing above average?</h3>
              <div class="chart-wrap"><canvas id="t2"></canvas></div>
            </div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Week by week</div>
          <div class="scroll-hint">Swipe for more →</div>
          <div class="table-wrap"><table class="wide">
            <thead><tr>
              <th>Week</th><th class="num">Points</th><th class="num">Pts/Day</th>
              <th class="num hide-sm">Units</th><th class="num hide-sm">Workdays</th><th class="num">Returns</th>
            </tr></thead>
            <tbody>
            ${tw.map((w, i) => `
              <tr>
                <td>${labels[i] || w.week}</td>
                <td class="num"><strong>${fmt(w.points, 1)}</strong></td>
                <td class="num">${fmt(w.pointsDay, 2)}</td>
                <td class="num hide-sm">${fmt(w.units)}</td>
                <td class="num hide-sm">${fmt(w.days)}</td>
                <td class="num">${fmt(w.returns || 0)}</td>
              </tr>`).join('')}
            <tr class="total-row">
              <td>All weeks</td>
              <td class="num">${fmt(team.totalPoints, 1)}</td>
              <td class="num">${fmt(team.avgPointsDay, 2)}</td>
              <td class="num hide-sm">${fmt(team.totalUnits)}</td>
              <td class="num hide-sm">${fmt(team.totalDays)}</td>
              <td class="num">${fmt(tw.reduce((s, w) => s + (w.returns || 0), 0))}</td>
            </tr>
            </tbody>
          </table></div>
        </div>
        <div class="section">
          <div class="section-title">What the crew delivered</div>
          <div class="unit-chips">${unitChips.map(u => `<div class="unit-chip"><div class="ut">${u}</div><div class="uv">${fmt(unitTotals[u])}</div></div>`).join('')}</div>
        </div>
        <div class="poster-bottom-tag">
          One team. One standard. Cleaner air for Hong Kong.<br>
          <span>Breathe-Easy AC Cleaning Crew · Hong Kong · Proudly Local</span>
        </div>
      `;

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
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(31,63,136,0.07)' } } } }
      }));
      const avgPD = team.avgPointsDay;
      charts.push(new Chart(document.getElementById('t2'), {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Pts/day', data: tw.map(w => w.pointsDay), borderColor: '#0082C8', backgroundColor: 'rgba(0,130,200,0.18)', fill: true, tension: 0.35, pointRadius: 4, borderWidth: 2.5 },
            { label: 'Avg', data: labels.map(() => avgPD), borderColor: '#8aa0b8', borderDash: [6, 4], pointRadius: 0, borderWidth: 1.5, fill: false }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(31,63,136,0.07)' } } } }
      }));
      charts.push(new Chart(document.getElementById('t1'), {
        type: 'bar',
        data: {
          labels,
          datasets: names.map(n => ({
            label: n,
            data: weeks.map(w => { const r = (DATA.technicians[n].weeks || []).find(x => x.week === w); return r ? r.points : 0; }),
            backgroundColor: (typeof TECH_COLORS !== 'undefined' && TECH_COLORS[n]) || '#0082C8',
            borderRadius: 4, stack: 'p'
          }))
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 14 } } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: 'rgba(31,63,136,0.07)' } } } }
      }));
    };

    if (typeof DATA !== 'undefined' && DATA) {
      try { route(); } catch (e) {}
    }
    return true;
  }

  let tries = 0;
  (function wait() {
    if (apply()) return;
    if (++tries > 100) return;
    setTimeout(wait, 40);
  })();
})();
