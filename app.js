/* Breathe-Easy Dashboard v61
 * Competition | Full Team | Personal
 * Data: data.json + weeks.json (merged at load)
 * Team returns (R) = 1.30 pts each — crew-assist visits, not Issues quality metric
 */
const TECH_ORDER = ['Matthew','Tiago','Nick','Alun','Iggi'];
const TECH_COLORS = {Matthew:'#2563eb',Nick:'#22c55e',Iggi:'#f97316',Alun:'#a855f7',Tiago:'#0ea5e9'};
function techNames(){
  const keys = DATA && DATA.technicians ? Object.keys(DATA.technicians) : TECH_ORDER;
  return TECH_ORDER.filter(n => keys.includes(n));
}
let DATA=null, charts=[], RANK_MODE='day', TEAM_SCALE='week';
function $(id){return document.getElementById(id);}
function fmt(n,d=0){if(n==null||isNaN(n))return '\u2014';return Number(n).toLocaleString('en-HK',{maximumFractionDigits:d,minimumFractionDigits:d});}
function destroyCharts(){charts.forEach(c=>c.destroy());charts=[];}
function badge(t){const x=(t||'Stable').toLowerCase();return `<span class="badge ${x}">${t}</span>`;}

async function loadData(){
  const [res,wres]=await Promise.all([fetch('data.json'),fetch('weeks.json')]);
  DATA=await res.json();
  const weeks=await wres.json();
  for(const name of Object.keys(DATA.technicians||{})){
    if(weeks[name]) DATA.technicians[name].weeks=weeks[name];
  }
  if(DATA.ranking){
    DATA.ranking=DATA.ranking.map(t=>{
      const live=DATA.technicians[t.name];
      return live?Object.assign({},t,live):t;
    });
  }
}

function setNav(active){
  const names=techNames();
  const competeActive = active==='#/compete' ? ' active' : '';
  const teamActive = active==='#/team' ? ' active' : '';
  $('nav-links').innerHTML =
    names.map(n=>`<a href="#/tech/${n}" class="${active===('#/tech/'+n)?'active':''}">${n}</a>`).join('') +
    `<span class="nav-sep"></span>` +
    `<a href="#/team" class="${teamActive}">Full Team</a>` +
    `<a href="#/compete" class="nav-compete${competeActive}">Competition</a>`;
}

function gapToNext(sorted, i){
  if(i===0) return null;
  return sorted[i-1].pointsDay - sorted[i].pointsDay;
}
function weekMonth(weekStr){ return (weekStr||'').slice(0,7); }
function latestWeekKey(){ const w=DATA.weeks||[]; return w.length?w[w.length-1]:null; }
function currentMonthKey(){ const lw=latestWeekKey(); return lw?weekMonth(lw):null; }
function techWeekPoints(name, weekKey){
  const r=(DATA.technicians[name].weeks||[]).find(x=>x.week===weekKey);
  return r? (r.points||0) : 0;
}
function techMonthPoints(name, monthKey){
  let sum=0;
  for(const r of (DATA.technicians[name].weeks||[])){
    if(weekMonth(r.week)===monthKey) sum+=(r.points||0);
  }
  return sum;
}
function monthLabel(monthKey){
  if(!monthKey) return 'Month';
  const [y,m]=monthKey.split('-');
  const names=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return names[parseInt(m,10)-1]+' '+y;
}
function weekQuarter(weekStr){
  if(!weekStr) return null;
  const y=weekStr.slice(0,4);
  const m=parseInt(weekStr.slice(5,7),10);
  const q=Math.ceil(m/3);
  return y+'-Q'+q;
}
function currentQuarterKey(){ const lw=latestWeekKey(); return lw?weekQuarter(lw):null; }
function techQuarterPoints(name, quarterKey){
  let sum=0;
  for(const r of (DATA.technicians[name].weeks||[])){
    if(weekQuarter(r.week)===quarterKey) sum+=(r.points||0);
  }
  return sum;
}
function quarterLabel(quarterKey){
  if(!quarterKey) return 'Quarter';
  const parts=quarterKey.split('-Q');
  return 'Q'+parts[1]+' '+parts[0];
}
function enrichTech(t){
  const latestWk=latestWeekKey();
  const monthKey=currentMonthKey();
  const quarterKey=currentQuarterKey();
  let monthDays=0;
  const rows=(DATA.technicians[t.name].weeks||[]);
  for(const r of rows){
    if(weekMonth(r.week)===monthKey) monthDays+=(r.workday||0);
  }
  const nWeeks=rows.length || 1;
  const totalPts=rows.reduce((s,r)=>s+(r.points||0),0);
  return Object.assign({}, t, {
    latestWeekPts: techWeekPoints(t.name, latestWk),
    weekPts: totalPts/nWeeks,
    monthPts: techMonthPoints(t.name, monthKey),
    quarterPts: techQuarterPoints(t.name, quarterKey),
    monthDays: monthDays
  });
}
function rankMetricKey(mode){
  return ({day:'pointsDay', week:'weekPts', month:'monthPts', quarter:'quarterPts'})[mode]||'pointsDay';
}
function rankMetricLabel(mode, monthShort, quarterShort){
  return ({day:'Pts/Day', week:'Pts/Week', month:(monthShort||'Month'), quarter:(quarterShort||'Quarter')})[mode]||'Pts/Day';
}
function rankBy(mode){
  const key=rankMetricKey(mode);
  return DATA.ranking.map(enrichTech).sort((a,b)=>(b[key]||0)-(a[key]||0));
}
function gapOnMetric(sorted, i, mode){
  if(i===0) return null;
  const key=rankMetricKey(mode);
  return (sorted[0][key]||0)-(sorted[i][key]||0);
}
function fmtMetric(mode, v){
  if(mode==='day') return fmt(v,2);
  return fmt(v,1);
}

function renderCompetition(){
  destroyCharts();
  setNav('#/compete');
  const mode = RANK_MODE || 'day';
  const labels=DATA.weekLabels;
  const weeks=DATA.weeks;
  const names=techNames();
  const monthShort=monthLabel(currentMonthKey());
  const sorted=rankBy(mode);
  const metricKey=rankMetricKey(mode);
  const quarterShort=quarterLabel(currentQuarterKey());
  const metricLabel=rankMetricLabel(mode, monthShort, quarterShort);
  const modeBtn = (id, label) => `<button type="button" class="rank-mode-btn ${mode===id?'active':''}" data-mode="${id}">${label}</button>`;
  const retW = DATA.returnPointsWeight != null ? DATA.returnPointsWeight : 1.3;
  const modeHint = {
    day: 'Pts/Day = each person\u2019s points \u00f7 their workdays in the loaded data. Fair when people worked different numbers of days.',
    week: 'Pts/Week = that person\u2019s total points \u00f7 number of weeks in the file (zero-point weeks still count). Includes unit weights and team returns at '+fmt(retW,1)+' pts each.',
    month: monthShort+' = sum of weekly points in that calendar month (unit types + team returns).',
    quarter: quarterShort+' = sum of weekly points in that quarter (unit types + team returns).'
  }[mode] || '';

  document.getElementById('app').innerHTML=`
    <div class="page-header">
      <h1>Competition</h1>
      <p>Rankings use weighted job points for the timescale you select \u00b7 Updated ${DATA.generated}</p>
    </div>
    <div class="rank-modes" id="rank-modes">
      ${modeBtn('day', 'Pts / Day')}
      ${modeBtn('week', 'Pts / Week')}
      ${modeBtn('month', monthShort)}
      ${modeBtn('quarter', quarterShort)}
    </div>
    <p class="explain">${modeHint}</p>
    <div class="section">
      <div class="section-title">Leaderboard \u00b7 ${metricLabel}</div>
      <p class="explain">Ranked high \u2192 low on <strong>${metricLabel}</strong> only. Gap is how far each person is behind rank 1 on that same measure.</p>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>#</th><th>Technician</th>
          <th class="num">${metricLabel}</th>
          <th class="num ${mode==='day'?'':'hide-sm'}">Pts/Day</th>
          <th class="num ${mode==='week'?'':'hide-sm'}">Pts/Week</th>
          <th class="num ${mode==='month'?'':'hide-sm'}">${monthShort}</th>
          <th class="num ${mode==='quarter'?'':'hide-sm'}">${quarterShort}</th>
          <th class="num hide-sm">Gap</th>
          <th>Trend</th>
        </tr></thead>
        <tbody>${sorted.map((t,i)=>{
          const gap=gapOnMetric(sorted,i,mode);
          const gapHtml=i===0 ? `<span style="color:var(--green);font-weight:600">Lead</span>` : `<span style="color:var(--mute)">${fmtMetric(mode, gap)} behind</span>`;
          return `<tr>
            <td>${i+1}</td>
            <td class="name"><a href="#/tech/${t.name}" style="color:inherit;text-decoration:none">${t.name}</a></td>
            <td class="num"><strong>${fmtMetric(mode, t[metricKey])}</strong></td>
            <td class="num ${mode==='day'?'':'hide-sm'}">${fmt(t.pointsDay,2)}</td>
            <td class="num ${mode==='week'?'':'hide-sm'}">${fmt(t.weekPts,1)}</td>
            <td class="num ${mode==='month'?'':'hide-sm'}">${fmt(t.monthPts,1)}</td>
            <td class="num ${mode==='quarter'?'':'hide-sm'}">${fmt(t.quarterPts,1)}</td>
            <td class="num hide-sm">${gapHtml}</td>
            <td>${badge(t.trend)}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>
    <div class="section">
      <div class="section-title">Head-to-head \u00b7 ${metricLabel}</div>
      <div class="chart-grid">
        <div class="chart-card full hero-card">
          <h3>Who leads on ${metricLabel}?</h3>
          <p class="chart-explain">One bar per person. Longer bar = higher ${metricLabel} in the selected timescale.</p>
          <div class="chart-wrap hero"><canvas id="c1"></canvas></div>
        </div>
        <div class="chart-card full">
          <h3>Team points by week</h3>
          <p class="chart-explain">Each bar is one week\u2019s total crew points (all technicians added together). Not a per-person race.</p>
          <div class="chart-wrap"><canvas id="c3"></canvas></div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Points system</div>
      <p class="explain">Each completed unit type is worth a fixed weight. <strong>R</strong> = team return visit (return work done for the crew), not a quality penalty from the Issues sheet. Influencer jobs use the same weights as paid jobs of that type.</p>
      <div class="points-ref"><table>
        <thead><tr><th>Unit type</th><th class="num">Points each</th><th>Note</th></tr></thead>
        <tbody>${DATA.pointsTable.map(p=>`<tr><td class="name">${p.type}</td><td class="num"><strong>${fmt(p.points,2)}</strong></td><td style="color:var(--mute)">${p.note||''}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>`;

  document.getElementById('rank-modes').addEventListener('click', (e)=>{
    const btn=e.target.closest('[data-mode]');
    if(!btn) return;
    RANK_MODE=btn.getAttribute('data-mode');
    renderCompetition();
  });

  charts.push(new Chart(document.getElementById('c1'),{
    type:'bar',
    data:{labels:sorted.map(t=>t.name),datasets:[{data:sorted.map(t=>t[metricKey]),backgroundColor:sorted.map(t=>TECH_COLORS[t.name]),borderRadius:6,barThickness:26}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true},y:{grid:{display:false},ticks:{font:{size:13,weight:'600'}}}}}
  }));
  const teamByWeek = weeks.map(w=>{
    let s=0;
    names.forEach(n=>{ const r=(DATA.technicians[n].weeks||[]).find(x=>x.week===w); if(r) s+=(r.points||0); });
    return s;
  });
  charts.push(new Chart(document.getElementById('c3'),{
    type:'bar',
    data:{labels,datasets:[{label:'Team points',data:teamByWeek,backgroundColor:'#2896D1',borderRadius:6,barThickness:28}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true}}}
  }));
}

function renderTeam(){
  destroyCharts();
  setNav('#/team');
  const team=DATA.team;
  const labels=DATA.weekLabels;
  const weeks=DATA.weeks;
  const names=techNames();
  const tw = weeks.map(w=>{
    let points=0, units=0, days=0, returns=0;
    names.forEach(n=>{
      const r=(DATA.technicians[n].weeks||[]).find(x=>x.week===w);
      if(!r) return;
      points+=r.points||0; units+=r.totalUnits||0; days+=r.workday||0; returns+=r.returns||0;
    });
    return {week:w, points, units, days, returns, pointsDay: days? points/days : 0};
  });
  const retW = DATA.returnPointsWeight != null ? DATA.returnPointsWeight : 1.3;
  const unitTotals={};
  names.forEach(n=>{ const ut=DATA.technicians[n].unitTotals||{}; Object.keys(ut).forEach(k=>{ unitTotals[k]=(unitTotals[k]||0)+ut[k]; }); });
  const unitOrder=['S','W','B','C','UC','SwG','TV','OU','EF','PAU','R'];
  const weightMap={}; (DATA.pointsTable||[]).forEach(p=>weightMap[p.type]=p.points);
  const unitChips=unitOrder.filter(u=>(unitTotals[u]||0)>0);

  document.getElementById('app').innerHTML=`
    <div class="page-header">
      <h1>Full Team</h1>
      <p>Crew totals from weighted jobs + team return visits \u00b7 Updated ${DATA.generated}</p>
    </div>
    <div class="kpi-row">
      <div class="kpi-card"><div class="label">Team points</div><div class="value">${fmt(team.totalPoints,1)}</div><div class="kpi-explain">Sum of all technicians\u2019 weighted points (includes team returns at ${fmt(retW,1)} pts each).</div></div>
      <div class="kpi-card"><div class="label">Pts / Day</div><div class="value">${fmt(team.avgPointsDay,2)}</div><div class="kpi-explain">Team points \u00f7 team workdays (${fmt(team.totalDays)} days).</div></div>
      <div class="kpi-card"><div class="label">Units</div><div class="value">${fmt(team.totalUnits)}</div><div class="kpi-explain">Unweighted job count (S/W/B/\u2026). Does not include the R return count.</div></div>
      <div class="kpi-card"><div class="label">Team returns</div><div class="value">${fmt(team.totalReturns||0)}</div><div class="kpi-explain">Return visits technicians completed <strong>for the crew</strong>. Each adds ${fmt(retW,1)} points. Not the Issues-sheet quality metric.</div></div>
    </div>
    <div class="section">
      <div class="section-title">Weekly performance</div>
      <div class="chart-grid">
        <div class="chart-card full hero-card">
          <h3>Team points each week</h3>
          <p class="chart-explain">One bar per week = crew total points that week (everyone combined). Includes unit weights and team returns.</p>
          <div class="chart-wrap hero"><canvas id="t1"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>This week vs last week</h3>
          <p class="chart-explain">Crew points in the latest week vs the week before. Grey = previous week, blue = latest week.</p>
          <div class="chart-wrap"><canvas id="t0"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>Pts/Day vs season pace</h3>
          <p class="chart-explain">Solid line = team points \u00f7 workdays that week. Dashed line = season pace (all points \u00f7 all workdays = ${fmt(team.avgPointsDay,2)}).</p>
          <div class="chart-wrap"><canvas id="t2"></canvas></div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Week by week</div>
      <p class="explain">Points are weighted. Units are job counts. Team returns = crew-assist return visits (each ${fmt(retW,1)} pts, already inside Points).</p>
      <div class="table-wrap"><table class="wide">
        <thead><tr><th>Week</th><th class="num">Points</th><th class="num">Pts/Day</th><th class="num hide-sm">Units</th><th class="num hide-sm">Workdays</th><th class="num">Team returns</th></tr></thead>
        <tbody>
        ${tw.map((w,i)=>`<tr><td>${labels[i]||w.week}</td><td class="num"><strong>${fmt(w.points,1)}</strong></td><td class="num">${fmt(w.pointsDay,2)}</td><td class="num hide-sm">${fmt(w.units)}</td><td class="num hide-sm">${fmt(w.days)}</td><td class="num">${fmt(w.returns||0)}</td></tr>`).join('')}
        <tr class="total-row"><td>All weeks</td><td class="num">${fmt(team.totalPoints,1)}</td><td class="num">${fmt(team.avgPointsDay,2)}</td><td class="num hide-sm">${fmt(team.totalUnits)}</td><td class="num hide-sm">${fmt(team.totalDays)}</td><td class="num">${fmt(team.totalReturns||0)}</td></tr>
        </tbody></table></div>
    </div>
    <div class="section">
      <div class="section-title">What the crew delivered</div>
      <p class="explain">Job counts by type. Chip = type \u00b7 points weight \u00b7 count. R = team return visits.</p>
      <div class="unit-chips">${unitChips.map(u=>{ const w=weightMap[u]!=null?weightMap[u]:''; return `<div class="unit-chip"><div class="ut">${u}${w!==''?' \u00b7 '+fmt(w,2)+' pts':''}</div><div class="uv">${fmt(unitTotals[u])}</div></div>`; }).join('')}</div>
    </div>`;

  const latest=tw.length-1; const prev=latest>0?latest-1:-1;
  charts.push(new Chart(document.getElementById('t0'),{ type:'bar', data:{ labels: prev>=0?[labels[prev], labels[latest]]:[labels[latest]], datasets:[{ data: prev>=0?[tw[prev].points, tw[latest].points]:[tw[latest].points], backgroundColor: prev>=0?['#94a3b8','#2896D1']:['#2896D1'], borderRadius:8, barThickness:40 }] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true}}} }));
  const avgPD=team.avgPointsDay;
  charts.push(new Chart(document.getElementById('t2'),{ type:'line', data:{labels,datasets:[ {label:'Pts/Day that week', data:tw.map(w=>w.pointsDay), borderColor:'#2896D1', backgroundColor:'rgba(40,150,209,0.15)', fill:true, tension:0.3, pointRadius:4, borderWidth:2.5}, {label:'Season pace '+fmt(avgPD,2), data:labels.map(()=>avgPD), borderColor:'#8aa0b8', borderDash:[6,4], pointRadius:0, borderWidth:1.5, fill:false} ]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,padding:12}}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true}}} }));
  charts.push(new Chart(document.getElementById('t1'),{ type:'bar', data:{labels,datasets:[{label:'Team points', data:tw.map(w=>w.points), backgroundColor:'#0E4D91', borderRadius:6, barThickness:32}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true}}} }));
}

function renderTech(name){
  destroyCharts();
  setNav('#/tech/'+name);
  const t=DATA.technicians[name];
  if(!t){ document.getElementById('app').innerHTML='<p>Unknown technician</p>'; return; }
  const color=TECH_COLORS[name]||'#2896D1';
  const weeks=t.weeks||[];
  const wl=weeks.map(w=>w.weekLabel||w.week);
  const retW = DATA.returnPointsWeight != null ? DATA.returnPointsWeight : 1.3;
  const unitOrder=['S','W','B','C','UC','SwG','TV','OU','EF','PAU','R'];
  const weightMap={}; (DATA.pointsTable||[]).forEach(p=>weightMap[p.type]=p.points);
  const ut=t.unitTotals||{};
  const retPts = t.totalReturnPoints!=null?t.totalReturnPoints:(t.totalReturns||0)*retW;

  document.getElementById('app').innerHTML=`
    <div class="page-header">
      <h1>${name}</h1>
      <p>Personal points from weighted jobs + team return visits \u00b7 Updated ${DATA.generated}</p>
    </div>
    <div class="profile-status">
      <div class="profile-status-grid">
        <div><div class="profile-metric-value" style="color:${color}">${fmt(t.totalPoints,1)}</div><div class="profile-metric-label">Points</div><p class="kpi-explain">Weighted units + team returns (${fmt(t.totalReturns||0)} \u00d7 ${fmt(retW,1)} = ${fmt(retPts,1)} pts).</p></div>
        <div><div class="profile-metric-value">${fmt(t.pointsDay,2)}</div><div class="profile-metric-label">Pts / Day</div><p class="kpi-explain">Your points \u00f7 your workdays (${fmt(t.totalDays)} days).</p></div>
        <div><div class="profile-metric-value">${fmt(t.totalUnits)}</div><div class="profile-metric-label">Units</div><p class="kpi-explain">Your job count by type (unweighted). R returns listed separately.</p></div>
        <div><div class="profile-metric-value">${fmt(t.totalReturns)}</div><div class="profile-metric-label">Team returns</div><p class="kpi-explain">Return visits you completed for the crew. Each is worth ${fmt(retW,1)} points on this sheet.</p></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Unit mix</div>
      <p class="explain">How many of each unit type you completed. Chip shows type \u00b7 points weight \u00b7 your count.</p>
      <div class="unit-chips">${unitOrder.filter(u=>(ut[u]||0)>0).map(u=>`<div class="unit-chip"><div class="ut">${u} \u00b7 ${fmt(weightMap[u]!=null?weightMap[u]:0,2)} pts</div><div class="uv">${fmt(ut[u])}</div></div>`).join('')}</div>
    </div>
    <div class="section">
      <div class="section-title">Week by week</div>
      <p class="explain">Your points already include team returns for that week. Units = jobs; Team returns = crew-assist return visits.</p>
      <div class="table-wrap"><table class="wide">
        <thead><tr><th>Week</th><th class="num">Points</th><th class="num">Pts/Day</th><th class="num">Units</th><th class="num hide-sm">Days</th><th class="num">Team returns</th></tr></thead>
        <tbody>
        ${weeks.map(w=>`<tr><td>${w.weekLabel||w.week}</td><td class="num"><strong>${fmt(w.points,1)}</strong></td><td class="num">${fmt(w.pointsDay,2)}</td><td class="num">${fmt(w.totalUnits)}</td><td class="num hide-sm">${fmt(w.workday)}</td><td class="num">${fmt(w.returns||0)}</td></tr>`).join('')}
        <tr class="total-row"><td>All weeks</td><td class="num">${fmt(t.totalPoints,1)}</td><td class="num">${fmt(t.pointsDay,2)}</td><td class="num">${fmt(t.totalUnits)}</td><td class="num hide-sm">${fmt(t.totalDays)}</td><td class="num">${fmt(t.totalReturns)}</td></tr>
        </tbody></table></div>
    </div>
    <div class="section">
      <div class="section-title">Your charts</div>
      <div class="chart-grid">
        <div class="chart-card full hero-card">
          <h3>Your Pts/Day vs your average</h3>
          <p class="chart-explain">Solid line = your points \u00f7 workdays that week. Dashed line = your overall average (${fmt(t.ownAvgPointsDay,2)} Pts/Day) \u2014 not the crew average.</p>
          <div class="chart-wrap hero"><canvas id="p1"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>Your points each week</h3>
          <p class="chart-explain">Your weighted points only (units + team returns). No other technician is in this chart.</p>
          <div class="chart-wrap"><canvas id="p2"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>Your team returns each week</h3>
          <p class="chart-explain">Count of return visits you completed for the crew that week. Each counts as ${fmt(retW,1)} points in the Points column.</p>
          <div class="chart-wrap"><canvas id="p3"></canvas></div>
        </div>
      </div>
    </div>`;

  const avg=t.ownAvgPointsDay;
  charts.push(new Chart(document.getElementById('p1'),{ type:'line', data:{labels:wl,datasets:[ {label:'Your Pts/Day', data:weeks.map(w=>w.pointsDay), borderColor:color, backgroundColor:color+'22', fill:true, tension:0.3, pointRadius:4, borderWidth:2.5}, {label:'Your average '+fmt(avg,2), data:wl.map(()=>avg), borderColor:'#8aa0b8', borderDash:[6,4], pointRadius:0, borderWidth:1.5, fill:false} ]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,padding:12}}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true}}} }));
  charts.push(new Chart(document.getElementById('p2'),{type:'bar',data:{labels:wl,datasets:[{data:weeks.map(w=>w.points),backgroundColor:color,borderRadius:6,barThickness:28}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true}}} }));
  charts.push(new Chart(document.getElementById('p3'),{type:'bar',data:{labels:wl,datasets:[{label:'Team returns', data:weeks.map(w=>w.returns||0), backgroundColor:'#69C7EE', borderRadius:6, barThickness:28}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true, ticks:{stepSize:1}}}} }));
}

function route(){
  const hash=location.hash||'#/team';
  if(hash.startsWith('#/tech/')) renderTech(decodeURIComponent(hash.replace('#/tech/','')));
  else if(hash==='#/compete') renderCompetition();
  else renderTeam();
}
window.addEventListener('hashchange', route);
loadData().then(()=>{ route(); }).catch(err=>{ console.error(err); $('app').innerHTML='<p>Failed to load data.</p>'; });
window.startDashboard = function(){ /* auth may call this */ route(); };
