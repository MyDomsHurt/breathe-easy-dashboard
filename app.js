/* Breathe-Easy Dashboard */
const TECH_COLORS = {Matthew:'#2563eb',Nick:'#059669',Iggi:'#d97706',Alun:'#7c3aed',Tiago:'#0891b2'};
let DATA=null, charts=[];

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
    {href:'#/team',label:'Team'},
    ...Object.keys(DATA.technicians).map(t=>({href:`#/tech/${t}`,label:t}))
  ];
  document.getElementById('nav-links').innerHTML=links.map(l=>{
    const isActive = active===l.href || (l.href!=='#/compete' && l.href!=='#/team' && active.startsWith(l.href));
    return `<a href="${l.href}" class="${isActive?'active':''}">${l.label}</a>`;
  }).join('');
  requestAnimationFrame(syncNavSpacer);
}

function rankByPtsDay(){
  return [...DATA.ranking].sort((a,b)=>b.pointsDay-a.pointsDay);
}
function gapToNext(sorted, i){
  if(i===0) return null;
  return sorted[i-1].pointsDay - sorted[i].pointsDay;
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

function renderCompetition(){
  destroyCharts();
  setNav('#/compete');
  const sorted=rankByPtsDay();
  const labels=DATA.weekLabels;
  const weeks=DATA.weeks;
  const names=Object.keys(DATA.technicians);

  document.getElementById('app').innerHTML=`
    <div class="page-header">
      <h1>Competition</h1>
      <p>Individual ranking \u00b7 Fair score is <strong>Pts / Day</strong> \u00b7 Updated ${DATA.generated}</p>
    </div>

    <div class="section">
      <div class="section-title">Leaderboard</div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>#</th><th>Technician</th>
          <th class="num">Pts/Day</th>
          <th class="num">Points</th>
          <th class="num hide-sm">vs Own Avg</th>
          <th class="num hide-sm">Gap</th>
          <th>Trend</th>
        </tr></thead>
        <tbody>${sorted.map((t,i)=>{
          const vsOwn=t.ownAvgPointsDay?(t.pointsDay/t.ownAvgPointsDay-1):0;
          const gap=gapToNext(sorted,i);
          const gapHtml=i===0
            ? `<span style="color:var(--green);font-weight:600">Lead</span>`
            : `<span style="color:var(--text-muted)">${fmt(gap,2)} behind</span>`;
          return `<tr>
            <td>${i+1}</td>
            <td class="name"><a href="#/tech/${t.name}" style="color:inherit;text-decoration:none">${t.name}</a></td>
            <td class="num"><strong>${fmt(t.pointsDay,2)}</strong></td>
            <td class="num">${fmt(t.totalPoints,1)}</td>
            <td class="num hide-sm" style="color:${vsOwn>=0?'var(--green)':'var(--red)'}">${pct(vsOwn)}</td>
            <td class="num hide-sm">${gapHtml}</td>
            <td>${badge(t.trend)}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
      <p class="note">Ranked by Pts/Day so different workdays stay fair. Gap = distance to the person above you.</p>
    </div>

    <div class="section">
      <div class="section-title">Head-to-head</div>
      <div class="chart-grid">
        <div class="chart-card"><h3>Pts / day ranking</h3><div class="chart-wrap"><canvas id="c1"></canvas></div></div>
        <div class="chart-card"><h3>Season points share</h3><div class="chart-wrap"><canvas id="c2"></canvas></div></div>
        <div class="chart-card full"><h3>Pts / day by week</h3><div class="chart-wrap tall"><canvas id="c3"></canvas></div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Points system</div>
      <div class="points-ref"><table>
        <thead><tr><th>Unit type</th><th class="num">Points</th><th>Note</th></tr></thead>
        <tbody>${DATA.pointsTable.map(p=>`<tr><td class="name">${p.type}</td><td class="num"><strong>${fmt(p.points,2)}</strong></td><td style="color:var(--text-muted)">${p.note}</td></tr>`).join('')}</tbody>
      </table>
      <p class="note">Influencer (free) units receive the same points as paid units of the same type.</p></div>
    </div>`;

  charts.push(new Chart(document.getElementById('c1'),{
    type:'bar',
    data:{labels:sorted.map(t=>t.name),datasets:[{data:sorted.map(t=>t.pointsDay),backgroundColor:sorted.map(t=>TECH_COLORS[t.name]),borderRadius:6,barThickness:22}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'#f1f5f9'},ticks:{font:{size:11}}},y:{grid:{display:false},ticks:{font:{size:12}}}}}
  }));

  const byPoints=[...DATA.ranking].sort((a,b)=>b.totalPoints-a.totalPoints);
  charts.push(new Chart(document.getElementById('c2'),{
    type:'doughnut',
    data:{labels:byPoints.map(t=>t.name),datasets:[{data:byPoints.map(t=>t.totalPoints),backgroundColor:byPoints.map(t=>TECH_COLORS[t.name]),borderWidth:0}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14,font:{size:12}}},tooltip:{callbacks:{label:ctx=>` ${ctx.label}: ${fmt(ctx.raw,1)} pts`}}},cutout:'62%'}
  }));

  charts.push(new Chart(document.getElementById('c3'),{
    type:'line',
    data:{labels,datasets:names.map(n=>({
      label:n,
      data:weeks.map(w=>{const r=(DATA.technicians[n].weeks||[]).find(x=>x.week===w);return r?r.pointsDay:0;}),
      borderColor:TECH_COLORS[n],backgroundColor:TECH_COLORS[n],tension:0.3,pointRadius:4,borderWidth:2,spanGaps:false
    }))},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14,font:{size:12}}}},scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}}
  }));
}

function renderTeam(){
  destroyCharts();
  setNav('#/team');
  const team=DATA.team;
  const labels=DATA.weekLabels;
  const weeks=DATA.weeks;
  const names=Object.keys(DATA.technicians);
  const tw=teamWeekly();
  const unitTotals=teamUnitTotals();
  const unitOrder=['S','W','B','C','UC','SwG','TV','OU'];
  const unitChips=unitOrder.filter(u=>(unitTotals[u]||0)>0);

  document.getElementById('app').innerHTML=`
    <div class="page-header">
      <h1>Team Effort</h1>
      <p>Collective output \u00b7 One crew \u00b7 Updated ${DATA.generated}</p>
    </div>

    <div class="kpi-row">
      <div class="kpi-card"><div class="label">Team Points</div><div class="value">${fmt(team.totalPoints,1)}</div></div>
      <div class="kpi-card"><div class="label">Team Pts / Day</div><div class="value">${fmt(team.avgPointsDay,2)}</div></div>
      <div class="kpi-card"><div class="label">Total Units</div><div class="value">${fmt(team.totalUnits)}</div></div>
      <div class="kpi-card"><div class="label">Workdays</div><div class="value">${fmt(team.totalDays)}</div></div>
    </div>

    <div class="section">
      <div class="section-title">Week by week (team)</div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Week</th>
          <th class="num">Points</th>
          <th class="num">Pts/Day</th>
          <th class="num">Units</th>
          <th class="num">Workdays</th>
        </tr></thead>
        <tbody>${tw.map((w,i)=>`<tr>
          <td>${labels[i]||w.week}</td>
          <td class="num"><strong>${fmt(w.points,1)}</strong></td>
          <td class="num">${fmt(w.pointsDay,2)}</td>
          <td class="num">${fmt(w.units)}</td>
          <td class="num">${fmt(w.days)}</td>
        </tr>`).join('')}
        <tr style="background:#f8fafc;font-weight:600">
          <td>Total</td>
          <td class="num">${fmt(team.totalPoints,1)}</td>
          <td class="num">${fmt(team.avgPointsDay,2)}</td>
          <td class="num">${fmt(team.totalUnits)}</td>
          <td class="num">${fmt(team.totalDays)}</td>
        </tr>
        </tbody>
      </table></div>
    </div>

    <div class="section">
      <div class="section-title">What the team delivered</div>
      <div class="unit-chips">${unitChips.map(u=>`<div class="unit-chip"><div class="ut">${u}</div><div class="uv">${fmt(unitTotals[u])}</div></div>`).join('')}</div>
    </div>

    <div class="section">
      <div class="section-title">Team charts</div>
      <div class="chart-grid">
        <div class="chart-card full"><h3>Weekly points \u2014 who contributed</h3><div class="chart-wrap tall"><canvas id="t1"></canvas></div></div>
        <div class="chart-card"><h3>Team pts / day trend</h3><div class="chart-wrap"><canvas id="t2"></canvas></div></div>
        <div class="chart-card"><h3>Team units by week</h3><div class="chart-wrap"><canvas id="t3"></canvas></div></div>
      </div>
      <p class="note">Stacked bars show contribution to the whole, not a ranking. The trend lines are the crew\u2019s combined pace.</p>
    </div>`;

  charts.push(new Chart(document.getElementById('t1'),{
    type:'bar',
    data:{labels,datasets:names.map(n=>({
      label:n,
      data:weeks.map(w=>{const r=(DATA.technicians[n].weeks||[]).find(x=>x.week===w);return r?r.points:0;}),
      backgroundColor:TECH_COLORS[n],borderRadius:4,stack:'p'
    }))},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14,font:{size:12}}}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,grid:{color:'#f1f5f9'}}}}
  }));

  charts.push(new Chart(document.getElementById('t2'),{
    type:'line',
    data:{labels,datasets:[{
      label:'Team pts/day',
      data:tw.map(w=>w.pointsDay),
      borderColor:'#2563eb',backgroundColor:'#2563eb22',fill:true,tension:0.3,pointRadius:5,borderWidth:2.5
    }]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}}
  }));

  charts.push(new Chart(document.getElementById('t3'),{
    type:'bar',
    data:{labels,datasets:[{
      label:'Units',
      data:tw.map(w=>w.units),
      backgroundColor:'#059669',borderRadius:6,barThickness:28
    }]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}}
  }));
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

  const gapLine = rank===1
    ? `<div class="progress-item">Rank: <strong>#1 efficiency</strong></div>`
    : `<div class="progress-item">Rank: <strong>#${rank}</strong> \u00b7 ${fmt(gap,2)} pts/day behind</div>`;

  document.getElementById('app').innerHTML=`
    <div class="page-header"><h1>${t.name}</h1><p>Personal performance profile</p></div>

    <div class="kpi-row">
      <div class="kpi-card"><div class="label">Pts / Day</div><div class="value">${fmt(t.pointsDay,2)}</div></div>
      <div class="kpi-card"><div class="label">Total Points</div><div class="value">${fmt(t.totalPoints,1)}</div></div>
      <div class="kpi-card"><div class="label">Total Units</div><div class="value">${fmt(t.totalUnits)}</div></div>
      <div class="kpi-card"><div class="label">Workdays</div><div class="value">${fmt(t.totalDays)}</div></div>
    </div>

    <div class="progress-strip">
      ${badge(t.trend)}
      ${gapLine}
      <div class="progress-item">vs your avg: <strong style="color:${vsOwn>=0?'var(--green)':'var(--red)'}">${pct(vsOwn)}</strong></div>
      <div class="progress-item">vs team: <strong style="color:${vs>=0?'var(--green)':'var(--red)'}">${pct(vs)}</strong></div>
      <div class="progress-item">Best week: <strong>${fmt(t.bestPointsDay,2)}</strong> pts/day</div>
      <div class="progress-item">Returns: <strong>${fmt(t.totalReturns)}</strong></div>
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
      <p class="note">Zero weeks highlighted. Influencer units count full points.</p>
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
  charts.push(new Chart(document.getElementById('p2'),{type:'bar',data:{labels:wl,datasets:[{data:weeks.map(w=>w.points),borderColor:color,backgroundColor:color,borderRadius:6,barThickness:28}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}}}));
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
