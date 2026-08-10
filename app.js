/* Breathe-Easy Dashboard */
const TECH_COLORS = {Matthew:'#2563eb',Nick:'#059669',Iggi:'#d97706',Alun:'#7c3aed',Tiago:'#0891b2'};
let DATA=null, charts=[], RANK_MODE='day', TEAM_SCALE='week';

function destroyCharts(){charts.forEach(c=>c.destroy());charts=[];}
function fmt(n,d=0){if(n==null||isNaN(n))return'\u2014';return Number(n).toLocaleString('en-HK',{maximumFractionDigits:d,minimumFractionDigits:d});}
function pct(n){return(n>=0?'+':'')+fmt(n*100,0)+'%';}
function badge(t){const x=(t||'Stable').toLowerCase();return `<span class="badge ${x}">${t}</span>`;}

async function loadData(){
  const [res,wres]=await Promise.all([fetch('data.json'),fetch('weeks.json')]);
  DATA=await res.json();
  const weeks=await wres.json();
  for(const name of Object.keys(DATA.technicians||{})){
    if(weeks[name]) DATA.technicians[name].weeks=weeks[name];
  }
}

function syncNavSpacer(){
  const nav=document.querySelector('.nav');
  const spacer=document.getElementById('nav-spacer');
  if(!nav||!spacer) return;
  if(window.matchMedia('(max-width: 768px)').matches){
    spacer.style.height=nav.offsetHeight+'px';
  } else {
    spacer.style.height='';
  }
}
function setNav(active){
  const links=[
    {href:'#/compete',label:'Competition'},
    {href:'#/team',label:'Full Team'},
    ...Object.keys(DATA.technicians).map(t=>({href:`#/tech/${t}`,label:t}))
  ];
  document.getElementById('nav-links').innerHTML=links.map(l=>{
    const isActive = active===l.href || (l.href!=='#/compete' && l.href!=='#/team' && active.startsWith(l.href));
    return `<a href="${l.href}" class="${isActive?'active':''}">${l.label}</a>`;
  }).join('');
  requestAnimationFrame(syncNavSpacer);
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
  for(const r of (DATA.technicians[t.name].weeks||[])){
    if(weekMonth(r.week)===monthKey) monthDays+=(r.workday||0);
  }
  return Object.assign({}, t, {
    weekPts: techWeekPoints(t.name, latestWk),
    monthPts: techMonthPoints(t.name, monthKey),
    quarterPts: techQuarterPoints(t.name, quarterKey),
    monthDays: monthDays
  });
}
function rankMetricKey(mode){
  return ({day:'pointsDay', week:'weekPts', month:'monthPts', quarter:'quarterPts'})[mode]||'pointsDay';
}
function rankMetricLabel(mode, monthShort, quarterShort){
  return ({day:'Pts/Day', week:'This Week', month:(monthShort||'Month'), quarter:(quarterShort||'Quarter')})[mode]||'Pts/Day';
}
function rankBy(mode){
  const key=rankMetricKey(mode);
  return DATA.ranking.map(enrichTech).sort((a,b)=>(b[key]||0)-(a[key]||0));
}
function rankByPtsDay(){ return rankBy('day'); }
function gapOnMetric(sorted, i, mode){
  if(i===0) return null;
  const key=rankMetricKey(mode);
  return (sorted[i-1][key]||0)-(sorted[i][key]||0);
}
function fmtMetric(mode, v){
  if(mode==='day') return fmt(v,2);
  return fmt(v,1);
}
function teamWeekly(){
  const weeks=DATA.weeks||[];
  const names=Object.keys(DATA.technicians);
  return weeks.map(w=>{
    let points=0, units=0, days=0;
    for(const n of names){
      const r=(DATA.technicians[n].weeks||[]).find(x=>x.week===w);
      if(r){points+=r.points||0; units+=r.totalUnits||0; days+=r.workday||0;}
    }
    return {week:w, points, units, days, pointsDay: days?points/days:0};
  });
}
function teamUnitTotals(){
  const totals={};
  for(const t of Object.values(DATA.technicians)){
    for(const [k,v] of Object.entries(t.unitTotals||{})){
      totals[k]=(totals[k]||0)+(v||0);
    }
  }
  return totals;
}
function teamReturnsForWeek(weekKey){
  let sum=0;
  for(const n of Object.keys(DATA.technicians)){
    const r=(DATA.technicians[n].weeks||[]).find(x=>x.week===weekKey);
    if(r) sum+=(r.returns||0);
  }
  return sum;
}
function teamScaleStats(scale){
  const tw=teamWeekly();
  const labels=DATA.weekLabels||[];
  const weeks=DATA.weeks||[];
  const monthKey=currentMonthKey();
  const quarterKey=currentQuarterKey();
  const latest=tw.length-1;
  if(scale==='week'){
    const cur=tw[latest]||{points:0,pointsDay:0,units:0,days:0};
    const prev=latest>0?tw[latest-1]:null;
    const returns=teamReturnsForWeek(weeks[latest]);
    return {
      label: labels[latest]||'This week',
      points: cur.points, pointsDay: cur.pointsDay, units: cur.units, days: cur.days, returns,
      prevPoints: prev?prev.points:null, prevPointsDay: prev?prev.pointsDay:null,
      prevLabel: latest>0?(labels[latest-1]||'Prior'):null
    };
  }
  if(scale==='month'){
    let points=0,units=0,days=0,returns=0;
    tw.forEach((row,i)=>{ if(weekMonth(weeks[i])===monthKey){ points+=row.points; units+=row.units; days+=row.days; returns+=teamReturnsForWeek(weeks[i]); } });
    return { label: monthLabel(monthKey), points, pointsDay: days?points/days:0, units, days, returns, prevPoints:null, prevPointsDay:null, prevLabel:null };
  }
  let points=0,units=0,days=0,returns=0;
  tw.forEach((row,i)=>{ if(weekQuarter(weeks[i])===quarterKey){ points+=row.points; units+=row.units; days+=row.days; returns+=teamReturnsForWeek(weeks[i]); } });
  return { label: quarterLabel(quarterKey), points, pointsDay: days?points/days:0, units, days, returns, prevPoints:null, prevPointsDay:null, prevLabel:null };
}
function teamStory(stats, scale, tw){
  let deltaClass='flat', deltaText='';
  if(scale==='week' && stats.prevPoints!=null){
    const d=stats.points-stats.prevPoints;
    if(d>0.5){ deltaClass='up'; deltaText='Up vs last week'; }
    else if(d<-0.5){ deltaClass='down'; deltaText='Down vs last week'; }
    else { deltaClass='flat'; deltaText='Flat vs last week'; }
  }
  let isBest=false;
  if(scale==='week' && tw && tw.length){
    let best=tw[0].points, bi=0;
    tw.forEach((r,i)=>{ if(r.points>best){ best=r.points; bi=i; } });
    isBest = bi===tw.length-1;
  }
  const chips=[];
  if(deltaText) chips.push(`<span class="story-chip ${deltaClass}">${deltaText}</span>`);
  if(isBest) chips.push(`<span class="story-chip best">Best week so far</span>`);
  if(stats.returns===0) chips.push(`<span class="story-chip clean">No returns</span>`);
  else chips.push(`<span class="story-chip mild">${fmt(stats.returns)} returns</span>`);
  return `
    <div class="story-top">
      <div class="story-period">${stats.label}</div>
      ${chips.length?`<div class="story-chips">${chips.join('')}</div>`:''}
    </div>
    <div class="story-main">
      <div class="story-hero">
        <div class="story-hero-value">${fmt(stats.points,1)}</div>
        <div class="story-hero-label">Team points</div>
      </div>
      <div class="story-stats">
        <div class="story-stat">
          <div class="story-stat-value">${fmt(stats.pointsDay,2)}</div>
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
      </div>
    </div>`;
}

function renderCompetition(){
  destroyCharts();
  setNav('#/compete');
  const mode = RANK_MODE || 'day';
  const labels=DATA.weekLabels;
  const weeks=DATA.weeks;
  const names=Object.keys(DATA.technicians);
  const monthShort=monthLabel(currentMonthKey());
  const sorted=rankBy(mode);
  const metricKey=rankMetricKey(mode);
  const quarterShort=quarterLabel(currentQuarterKey());
  const metricLabel=rankMetricLabel(mode, monthShort, quarterShort);
  const modeBtn = (id, label) => `<button type="button" class="rank-mode-btn ${mode===id?'active':''}" data-mode="${id}">${label}</button>`;

  document.getElementById('app').innerHTML=`
    <div class="page-header">
      <h1>Competition</h1>
      <p>Pick the timescale you want to compete on \u00b7 Updated ${DATA.generated}</p>
    </div>
    <div class="rank-modes" id="rank-modes">
      ${modeBtn('day', 'Pts / Day')}
      ${modeBtn('week', 'This Week')}
      ${modeBtn('month', monthShort)}
      ${modeBtn('quarter', quarterShort)}
    </div>
    <p class="rank-mode-hint">
      ${mode==='day' ? 'Pace \u2014 fair when people work different numbers of days.' : ''}
      ${mode==='week' ? 'Output this week \u2014 more days worked counts.' : ''}
      ${mode==='month' ? 'Output this month \u2014 more days worked counts.' : ''}
      ${mode==='quarter' ? 'Output this quarter \u2014 more days worked counts.' : ''}
    </p>
    <div class="section">
      <div class="section-title">Leaderboard \u00b7 ${metricLabel}</div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>#</th><th>Technician</th>
          <th class="num">${metricLabel}</th>
          <th class="num ${mode==='day'?'':'hide-sm'}">Pts/Day</th>
          <th class="num ${mode==='week'?'':'hide-sm'}">This Week</th>
          <th class="num ${mode==='month'?'':'hide-sm'}">${monthShort}</th>
          <th class="num ${mode==='quarter'?'':'hide-sm'}">${quarterShort}</th>
          <th class="num hide-sm">Gap</th>
          <th>Trend</th>
        </tr></thead>
        <tbody>${sorted.map((t,i)=>{
          const gap=gapOnMetric(sorted,i,mode);
          const gapHtml=i===0 ? `<span style="color:var(--green);font-weight:600">Lead</span>` : `<span style="color:var(--text-muted)">${fmtMetric(mode, gap)} behind</span>`;
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
      <p class="note">All four timescales are valid ways to compete.</p>
    </div>
    <div class="section">
      <div class="section-title">Head-to-head \u00b7 ${metricLabel}</div>
      <div class="chart-grid">
        <div class="chart-card"><h3>${metricLabel} ranking</h3><div class="chart-wrap"><canvas id="c1"></canvas></div></div>
        <div class="chart-card"><h3>${quarterShort} share</h3><div class="chart-wrap"><canvas id="c2"></canvas></div></div>
        <div class="chart-card full"><h3>Points by week</h3><div class="chart-wrap tall"><canvas id="c3"></canvas></div></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Points system</div>
      <div class="points-ref"><table>
        <thead><tr><th>Unit type</th><th class="num">Points</th><th>Note</th></tr></thead>
        <tbody>${DATA.pointsTable.map(p=>`<tr><td class="name">${p.type}</td><td class="num"><strong>${fmt(p.points,2)}</strong></td><td style="color:var(--text-muted)">${p.note}</td></tr>`).join('')}</tbody>
      </table>
      <p class="note">Influencer units receive the same points as paid units of the same type.</p></div>
    </div>`;

  document.getElementById('rank-modes').addEventListener('click', (e)=>{
    const btn=e.target.closest('[data-mode]');
    if(!btn) return;
    RANK_MODE=btn.getAttribute('data-mode');
    renderCompetition();
  });

  charts.push(new Chart(document.getElementById('c1'),{ type:'bar', data:{labels:sorted.map(t=>t.name),datasets:[{data:sorted.map(t=>t[metricKey]),backgroundColor:sorted.map(t=>TECH_COLORS[t.name]),borderRadius:6,barThickness:22}]}, options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'#f1f5f9'}},y:{grid:{display:false}}}} }));
  const byQ=DATA.ranking.map(enrichTech).sort((a,b)=>b.quarterPts-a.quarterPts);
  charts.push(new Chart(document.getElementById('c2'),{ type:'doughnut', data:{labels:byQ.map(t=>t.name),datasets:[{data:byQ.map(t=>t.quarterPts),backgroundColor:byQ.map(t=>TECH_COLORS[t.name]),borderWidth:0}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14}}},cutout:'62%'} }));
  charts.push(new Chart(document.getElementById('c3'),{ type:'bar', data:{labels,datasets:names.map(n=>({ label:n, data:weeks.map(w=>{const r=(DATA.technicians[n].weeks||[]).find(x=>x.week===w);return r?r.points:0;}), backgroundColor:TECH_COLORS[n],borderRadius:4,stack:'p' }))}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14}}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,grid:{color:'#f1f5f9'}}}} }));
}

function renderTeam(){
  destroyCharts();
  setNav('#/team');
  const scale = TEAM_SCALE || 'week';
  const team=DATA.team;
  const labels=DATA.weekLabels;
  const weeks=DATA.weeks;
  const names=Object.keys(DATA.technicians);
  const tw=teamWeekly();
  const unitTotals=teamUnitTotals();
  const unitOrder=['S','W','B','C','UC','SwG','TV','OU'];
  const unitChips=unitOrder.filter(u=>(unitTotals[u]||0)>0);
  const stats=teamScaleStats(scale);
  const story=teamStory(stats, scale, tw);
  const scaleBtn = (id, label) => `<button type="button" class="rank-mode-btn ${scale===id?'active':''}" data-scale="${id}">${label}</button>`;

  document.getElementById('app').innerHTML=`
    <div class="page-header">
      <h1>Full Team</h1>
      <p>Collective board \u00b7 Rankings live under Competition \u00b7 Updated ${DATA.generated}</p>
    </div>
    <div class="team-story">${story}</div>
    <div class="rank-modes" id="team-scales">
      ${scaleBtn('week', 'This Week')}
      ${scaleBtn('month', monthLabel(currentMonthKey()))}
      ${scaleBtn('quarter', quarterLabel(currentQuarterKey()))}
    </div>
    <p class="rank-mode-hint">Output and pace for the whole crew. No rankings on this page.</p>
    <div class="section">
      <div class="section-title">Charts</div>
      <div class="chart-grid">
        <div class="chart-card"><h3>This week vs last week</h3><div class="chart-wrap"><canvas id="t0"></canvas></div></div>
        <div class="chart-card"><h3>Crew pace (pts/day)</h3><div class="chart-wrap"><canvas id="t2"></canvas></div></div>
        <div class="chart-card full"><h3>What we put up each week</h3><div class="chart-wrap tall"><canvas id="t1"></canvas></div></div>
        <div class="chart-card full"><h3>Team points by week</h3><div class="chart-wrap"><canvas id="t3"></canvas></div></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Week by week</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Week</th><th class="num">Points</th><th class="num">Pts/Day</th><th class="num">Units</th><th class="num">Workdays</th><th class="num">Returns</th></tr></thead>
        <tbody>${tw.map((w,i)=>`<tr>
          <td>${labels[i]||w.week}</td>
          <td class="num"><strong>${fmt(w.points,1)}</strong></td>
          <td class="num">${fmt(w.pointsDay,2)}</td>
          <td class="num">${fmt(w.units)}</td>
          <td class="num">${fmt(w.days)}</td>
          <td class="num">${fmt(teamReturnsForWeek(weeks[i]))}</td>
        </tr>`).join('')}
        <tr style="background:#f8fafc;font-weight:600">
          <td>All weeks</td>
          <td class="num">${fmt(team.totalPoints,1)}</td>
          <td class="num">${fmt(team.avgPointsDay,2)}</td>
          <td class="num">${fmt(team.totalUnits)}</td>
          <td class="num">${fmt(team.totalDays)}</td>
          <td class="num">${fmt(tw.reduce((s,_,i)=>s+teamReturnsForWeek(weeks[i]),0))}</td>
        </tr>
        </tbody>
      </table></div>
    </div>
    <div class="section">
      <div class="section-title">What the crew delivered</div>
      <div class="unit-chips">${unitChips.map(u=>`<div class="unit-chip"><div class="ut">${u}</div><div class="uv">${fmt(unitTotals[u])}</div></div>`).join('')}</div>
    </div>`;

  document.getElementById('team-scales').addEventListener('click', (e)=>{
    const btn=e.target.closest('[data-scale]');
    if(!btn) return;
    TEAM_SCALE=btn.getAttribute('data-scale');
    renderTeam();
  });

  const latest=tw.length-1;
  const prev=latest>0?latest-1:-1;
  charts.push(new Chart(document.getElementById('t0'),{ type:'bar', data:{ labels: prev>=0?[labels[prev], labels[latest]]:[labels[latest]], datasets:[{ data: prev>=0?[tw[prev].points, tw[latest].points]:[tw[latest].points], backgroundColor: prev>=0?['#94a3b8','#2563eb']:['#2563eb'], borderRadius:8, barThickness:40 }] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}} }));
  const avgPD = team.avgPointsDay;
  charts.push(new Chart(document.getElementById('t2'),{ type:'line', data:{labels,datasets:[ {label:'Pts/day', data:tw.map(w=>w.pointsDay), borderColor:'#2563eb', backgroundColor:'#2563eb22', fill:true, tension:0.3, pointRadius:5, borderWidth:2.5}, {label:'Avg', data:labels.map(()=>avgPD), borderColor:'#94a3b8', borderDash:[6,4], pointRadius:0, borderWidth:1.5, fill:false} ]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:12,font:{size:11}}}},scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}} }));
  charts.push(new Chart(document.getElementById('t1'),{ type:'bar', data:{labels,datasets:names.map(n=>({ label:n, data:weeks.map(w=>{const r=(DATA.technicians[n].weeks||[]).find(x=>x.week===w);return r?r.points:0;}), backgroundColor:TECH_COLORS[n],borderRadius:4,stack:'p' }))}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14}}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,grid:{color:'#f1f5f9'}}}} }));
  charts.push(new Chart(document.getElementById('t3'),{ type:'bar', data:{labels,datasets:[{ label:'Team points', data:tw.map(w=>w.points), backgroundColor:'#059669', borderRadius:6, barThickness:28 }]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}} }));
}

function renderTech(name){
  destroyCharts();
  const t=DATA.technicians[name];
  if(!t){document.getElementById('app').innerHTML='<p>Not found.</p>';return;}
  setNav(`#/tech/${name}`);
  const team=DATA.team;
  const sorted=rankByPtsDay();
  const rank=sorted.findIndex(x=>x.name===name)+1;
  const gap=gapToNext(sorted, rank-1);
  const vsOwn=t.ownAvgPointsDay?(t.pointsDay/t.ownAvgPointsDay-1):0;
  const vs=team.avgPointsDay?(t.pointsDay/team.avgPointsDay-1):0;
  const weeks=t.weeks||[];
  const unitOrder=['S','W','B','C','UC','SwG','TV','OU'];
  const weekPts=techWeekPoints(name, latestWeekKey());
  const monthPts=techMonthPoints(name, currentMonthKey());
  const quarterKey=currentQuarterKey();
  const quarterShort=quarterLabel(quarterKey);
  const quarterPts=techQuarterPoints(name, quarterKey);
  const monthShort=monthLabel(currentMonthKey());
  const rankLabel = rank===1
    ? 'Leading on pts/day'
    : `#${rank} \u00b7 ${fmt(gap,2)} pts/day behind`;
  const ownClass = vsOwn>=0 ? 'up' : 'down';
  const teamClass = vs>=0 ? 'up' : 'down';

  document.getElementById('app').innerHTML=`
    <div class="page-header"><h1>${t.name}</h1><p>Personal performance profile</p></div>
    <div class="kpi-row">
      <div class="kpi-card"><div class="label">Pts / Day</div><div class="value">${fmt(t.pointsDay,2)}</div></div>
      <div class="kpi-card"><div class="label">This Week</div><div class="value">${fmt(weekPts,1)}</div></div>
      <div class="kpi-card"><div class="label">${monthShort}</div><div class="value">${fmt(monthPts,1)}</div></div>
      <div class="kpi-card"><div class="label">${quarterShort}</div><div class="value">${fmt(quarterPts,1)}</div></div>
    </div>

    <div class="profile-status">
      <div class="profile-status-top">
        ${badge(t.trend)}
        <div class="profile-rank">${rankLabel}</div>
      </div>
      <div class="profile-status-grid">
        <div class="profile-metric">
          <div class="profile-metric-value ${ownClass}">${pct(vsOwn)}</div>
          <div class="profile-metric-label">vs your average</div>
        </div>
        <div class="profile-metric">
          <div class="profile-metric-value ${teamClass}">${pct(vs)}</div>
          <div class="profile-metric-label">vs team average</div>
        </div>
        <div class="profile-metric">
          <div class="profile-metric-value">${fmt(t.bestPointsDay,2)}</div>
          <div class="profile-metric-label">Best week pts/day</div>
        </div>
        <div class="profile-metric">
          <div class="profile-metric-value">${fmt(t.totalReturns)}</div>
          <div class="profile-metric-label">Returns</div>
        </div>
      </div>
    </div>

    <div class="section"><div class="section-title">Unit mix</div>
      <div class="unit-chips">${unitOrder.filter(u=>(t.unitTotals||{})[u]>0).map(u=>`<div class="unit-chip"><div class="ut">${u}</div><div class="uv">${fmt(t.unitTotals[u])}</div></div>`).join('')}</div>
    </div>
    <div class="section"><div class="section-title">Week by week</div>
      <p class="scroll-hint">Swipe table sideways for unit breakdown</p>
      <div class="table-wrap"><table class="wide">
        <thead><tr><th>Week</th><th class="num">Points</th><th class="num">Pts/Day</th><th class="num">Units</th><th class="num">S</th><th class="num">W</th><th class="num">B</th><th class="num">C</th><th class="num">Days</th><th class="num">Infl</th><th class="num">Returns</th></tr></thead>
        <tbody>${weeks.map(w=>{
          const zero=w.totalUnits===0&&w.workday===0;
          return `<tr class="${zero?'zero-row':''}"><td>${w.weekLabel}</td><td class="num"><strong>${fmt(w.points,1)}</strong></td><td class="num">${fmt(w.pointsDay,2)}</td><td class="num">${fmt(w.totalUnits)}</td>
            <td class="num">${w.S||'\u2014'}</td><td class="num">${w.W||'\u2014'}</td><td class="num">${w.B||'\u2014'}</td><td class="num">${w.C||'\u2014'}</td>
            <td class="num">${w.workday||'\u2014'}</td>
            <td class="num">${w.inflPoints?fmt(w.inflPoints,1):'\u2014'}</td><td class="num">${w.returns||'\u2014'}</td></tr>`;
        }).join('')}
        <tr style="background:#f8fafc;font-weight:600"><td>Total</td><td class="num">${fmt(t.totalPoints,1)}</td><td class="num">${fmt(t.pointsDay,2)}</td><td class="num">${fmt(t.totalUnits)}</td>
          <td class="num">${(t.unitTotals||{}).S||0}</td><td class="num">${(t.unitTotals||{}).W||0}</td><td class="num">${(t.unitTotals||{}).B||0}</td><td class="num">${(t.unitTotals||{}).C||0}</td>
          <td class="num">${fmt(t.totalDays)}</td><td class="num">${fmt(t.totalInflPoints,1)}</td><td class="num">${fmt(t.totalReturns)}</td></tr>
        </tbody>
      </table></div>
    </div>
    <div class="section"><div class="section-title">Your charts</div>
      <div class="chart-grid">
        <div class="chart-card"><h3>Points / day</h3><div class="chart-wrap"><canvas id="p1"></canvas></div></div>
        <div class="chart-card"><h3>Points by week</h3><div class="chart-wrap"><canvas id="p2"></canvas></div></div>
        <div class="chart-card full"><h3>Unit mix (S/W/B/C)</h3><div class="chart-wrap tall"><canvas id="p3"></canvas></div></div>
      </div>
    </div>`;

  const color=TECH_COLORS[name]||'#2563eb';
  const wl=weeks.map(w=>w.weekLabel);
  charts.push(new Chart(document.getElementById('p1'),{type:'line',data:{labels:wl,datasets:[{data:weeks.map(w=>w.pointsDay),borderColor:color,backgroundColor:color+'18',fill:true,tension:0.3,pointRadius:5,borderWidth:2.5,spanGaps:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}}}));
  charts.push(new Chart(document.getElementById('p2'),{type:'bar',data:{labels:wl,datasets:[{data:weeks.map(w=>w.points),backgroundColor:color,borderRadius:6,barThickness:28}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}}}));
  charts.push(new Chart(document.getElementById('p3'),{type:'bar',data:{labels:wl,datasets:[
    {label:'S',data:weeks.map(w=>w.S||0),backgroundColor:'#2563eb',stack:'u'},
    {label:'W',data:weeks.map(w=>w.W||0),backgroundColor:'#059669',stack:'u'},
    {label:'B',data:weeks.map(w=>w.B||0),backgroundColor:'#d97706',stack:'u'},
    {label:'C',data:weeks.map(w=>w.C||0),backgroundColor:'#7c3aed',stack:'u'}
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14}}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,grid:{color:'#f1f5f9'}}}}}));
}

function route(){
  const hash=location.hash||'#/compete';
  if(hash.startsWith('#/tech/')) renderTech(decodeURIComponent(hash.replace('#/tech/','')));
  else if(hash==='#/team') renderTeam();
  else renderCompetition();
}
document.body.style.paddingTop='';
loadData().then(()=>{route();window.addEventListener('hashchange',route);window.addEventListener('resize',syncNavSpacer);});
