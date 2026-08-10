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

function setNav(active){
  const links=[{href:'#/',label:'Overview'},...Object.keys(DATA.technicians).map(t=>({href:`#/tech/${t}`,label:t}))];
  document.getElementById('nav-links').innerHTML=links.map(l=>
    `<a href="${l.href}" class="${(active===l.href||(l.href!=='#/'&&active.startsWith(l.href)))?'active':''}">${l.label}</a>`
  ).join('');
}

function renderOverview(){
  destroyCharts();
  const team=DATA.team, ranking=DATA.ranking, weeks=DATA.weeks, labels=DATA.weekLabels;
  setNav('#/');
  document.getElementById('app').innerHTML=`
    <div class="page-header"><h1>Team Overview</h1><p>Points competition \u00b7 Fair efficiency \u00b7 Updated ${DATA.generated}</p></div>
    <div class="kpi-row">
      <div class="kpi-card"><div class="label">Total Points</div><div class="value">${fmt(team.totalPoints,1)}</div></div>
      <div class="kpi-card"><div class="label">Team Pts / Day</div><div class="value">${fmt(team.avgPointsDay,2)}</div></div>
      <div class="kpi-card"><div class="label">Total Units</div><div class="value">${fmt(team.totalUnits)}</div></div>
      <div class="kpi-card"><div class="label">Workdays</div><div class="value">${fmt(team.totalDays)}</div></div>
    </div>
    <div class="section"><div class="section-title">Competition</div>
      <p class="scroll-hint">Swipe table sideways for more columns</p>
      <div class="table-wrap"><table>
        <thead><tr><th>#</th><th>Technician</th><th class="num">Points</th><th class="num hide-sm">Share</th><th class="num">Pts/Day</th><th class="num hide-sm">vs Team</th><th class="num hide-sm">Units</th><th class="num hide-sm">U/Day</th><th>Status</th></tr></thead>
        <tbody>${ranking.map((t,i)=>{
          const share=t.totalPoints/team.totalPoints;
          const vs=team.avgPointsDay?(t.pointsDay/team.avgPointsDay-1):0;
          return `<tr><td>${i+1}</td><td class="name"><a href="#/tech/${t.name}" style="color:inherit;text-decoration:none">${t.name}</a></td>
            <td class="num"><strong>${fmt(t.totalPoints,1)}</strong></td><td class="num hide-sm">${fmt(share*100,1)}%</td>
            <td class="num">${fmt(t.pointsDay,2)}</td>
            <td class="num hide-sm" style="color:${vs>=0?'var(--green)':'var(--red)'}">${pct(vs)}</td>
            <td class="num hide-sm">${fmt(t.totalUnits)}</td><td class="num hide-sm">${fmt(t.unitsDay,1)}</td><td>${badge(t.trend)}</td></tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>
    <div class="section"><div class="section-title">Charts</div>
      <div class="chart-grid">
        <div class="chart-card"><h3>Points share</h3><div class="chart-wrap"><canvas id="c1"></canvas></div></div>
        <div class="chart-card"><h3>Points per day ranking</h3><div class="chart-wrap"><canvas id="c2"></canvas></div></div>
        <div class="chart-card full"><h3>Weekly points contribution</h3><div class="chart-wrap tall"><canvas id="c3"></canvas></div></div>
        <div class="chart-card full"><h3>Points / day trend</h3><div class="chart-wrap tall"><canvas id="c4"></canvas></div></div>
      </div>
    </div>
    <div class="section"><div class="section-title">Points system</div>
      <div class="points-ref"><table>
        <thead><tr><th>Unit type</th><th class="num">Points</th><th>Note</th></tr></thead>
        <tbody>${DATA.pointsTable.map(p=>`<tr><td class="name">${p.type}</td><td class="num"><strong>${fmt(p.points,2)}</strong></td><td style="color:var(--text-muted)">${p.note}</td></tr>`).join('')}</tbody>
      </table>
      <p class="note">Influencer (free) units receive the same points as paid units of the same type.</p></div>
    </div>`;

  charts.push(new Chart(document.getElementById('c1'),{type:'doughnut',data:{labels:ranking.map(t=>t.name),datasets:[{data:ranking.map(t=>t.totalPoints),backgroundColor:ranking.map(t=>TECH_COLORS[t.name]),borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14,font:{size:12}}},tooltip:{callbacks:{label:ctx=>` ${ctx.label}: ${fmt(ctx.raw,1)} pts`}}},cutout:'62%'}}));

  const pd=[...ranking].sort((a,b)=>b.pointsDay-a.pointsDay);
  charts.push(new Chart(document.getElementById('c2'),{type:'bar',data:{labels:pd.map(t=>t.name),datasets:[{data:pd.map(t=>t.pointsDay),backgroundColor:pd.map(t=>TECH_COLORS[t.name]),borderRadius:6,barThickness:22}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'#f1f5f9'},ticks:{font:{size:11}}},y:{grid:{display:false},ticks:{font:{size:12}}}}}}));

  const names=Object.keys(DATA.technicians);
  charts.push(new Chart(document.getElementById('c3'),{type:'bar',data:{labels,datasets:names.map(n=>({label:n,data:weeks.map(w=>{const r=(DATA.technicians[n].weeks||[]).find(x=>x.week===w);return r?r.points:0;}),backgroundColor:TECH_COLORS[n],borderRadius:4,stack:'p'}))},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14,font:{size:12}}}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,grid:{color:'#f1f5f9'}}}}}));

  charts.push(new Chart(document.getElementById('c4'),{type:'line',data:{labels,datasets:names.map(n=>({label:n,data:weeks.map(w=>{const r=(DATA.technicians[n].weeks||[]).find(x=>x.week===w);return r?r.pointsDay:0;}),borderColor:TECH_COLORS[n],backgroundColor:TECH_COLORS[n],tension:0.3,pointRadius:4,borderWidth:2,spanGaps:false}))},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14,font:{size:12}}}},scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}}}));
}

function renderTech(name){
  destroyCharts();
  const t=DATA.technicians[name];
  if(!t){document.getElementById('app').innerHTML='<p>Not found.</p>';return;}
  setNav(`#/tech/${name}`);
  const team=DATA.team;
  const vs=team.avgPointsDay?(t.pointsDay/team.avgPointsDay-1):0;
  const weeks=t.weeks||[];
  const unitOrder=['S','W','B','C','UC','SwG','TV','OU'];
  document.getElementById('app').innerHTML=`
    <div class="page-header"><h1>${t.name}</h1><p>Personal performance profile</p></div>
    <div class="kpi-row">
      <div class="kpi-card"><div class="label">Total Points</div><div class="value">${fmt(t.totalPoints,1)}</div></div>
      <div class="kpi-card"><div class="label">Pts / Day</div><div class="value">${fmt(t.pointsDay,2)}</div></div>
      <div class="kpi-card"><div class="label">Total Units</div><div class="value">${fmt(t.totalUnits)}</div></div>
      <div class="kpi-card"><div class="label">Units / Day</div><div class="value">${fmt(t.unitsDay,1)}</div></div>
      <div class="kpi-card"><div class="label">Workdays</div><div class="value">${fmt(t.totalDays)}</div></div>
      <div class="kpi-card"><div class="label">Returns</div><div class="value">${fmt(t.totalReturns)}</div></div>
    </div>
    <div class="progress-strip">
      ${badge(t.trend)}
      <div class="progress-item">Latest: <strong>${fmt(t.latestPointsDay,2)}</strong></div>
      <div class="progress-item">Your avg: <strong>${fmt(t.ownAvgPointsDay,2)}</strong></div>
      <div class="progress-item">Change: <strong style="color:${t.change>=0?'var(--green)':'var(--red)'}">${pct(t.change)}</strong></div>
      <div class="progress-item">vs Team: <strong style="color:${vs>=0?'var(--green)':'var(--red)'}">${pct(vs)}</strong></div>
      <div class="progress-item">Best: <strong>${fmt(t.bestPointsDay,2)}</strong></div>
      <div class="progress-item">Influencer pts: <strong>${fmt(t.totalInflPoints,1)}</strong></div>
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
        <div class="chart-card"><h3>Points / day</h3><div class="chart-wrap"><canvas id="t1"></canvas></div></div>
        <div class="chart-card"><h3>Points by week</h3><div class="chart-wrap"><canvas id="t2"></canvas></div></div>
        <div class="chart-card full"><h3>Unit mix (S/W/B/C)</h3><div class="chart-wrap tall"><canvas id="t3"></canvas></div></div>
      </div>
    </div>`;

  const color=TECH_COLORS[name]||'#2563eb';
  const wl=weeks.map(w=>w.weekLabel);
  charts.push(new Chart(document.getElementById('t1'),{type:'line',data:{labels:wl,datasets:[{data:weeks.map(w=>w.pointsDay),borderColor:color,backgroundColor:color+'18',fill:true,tension:0.3,pointRadius:5,borderWidth:2.5,spanGaps:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}}}));
  charts.push(new Chart(document.getElementById('t2'),{type:'bar',data:{labels:wl,datasets:[{data:weeks.map(w=>w.points),backgroundColor:color,borderRadius:6,barThickness:28}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}}}));
  charts.push(new Chart(document.getElementById('t3'),{type:'bar',data:{labels:wl,datasets:[
    {label:'S',data:weeks.map(w=>w.S||0),backgroundColor:'#2563eb',stack:'u'},
    {label:'W',data:weeks.map(w=>w.W||0),backgroundColor:'#059669',stack:'u'},
    {label:'B',data:weeks.map(w=>w.B||0),backgroundColor:'#d97706',stack:'u'},
    {label:'C',data:weeks.map(w=>w.C||0),backgroundColor:'#7c3aed',stack:'u'}
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14}}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,grid:{color:'#f1f5f9'}}}}}));
}

function route(){
  const hash=location.hash||'#/';
  if(hash.startsWith('#/tech/')) renderTech(decodeURIComponent(hash.replace('#/tech/','')));
  else renderOverview();
}
document.body.style.paddingTop='';
loadData().then(()=>{route();window.addEventListener('hashchange',route);});
