/* Breathe-Easy v63 compact restore */
const TECH_ORDER=['Matthew','Tiago','Nick','Alun','Iggi'];
const TECH_COLORS={Matthew:'#2563eb',Nick:'#22c55e',Iggi:'#f97316',Alun:'#a855f7',Tiago:'#0ea5e9'};
let DATA=null,charts=[],RANK_MODE='day';
function techNames(){const k=DATA&&DATA.technicians?Object.keys(DATA.technicians):TECH_ORDER;return TECH_ORDER.filter(n=>k.includes(n));}
function $(id){return document.getElementById(id);}
function fmt(n,d=0){if(n==null||isNaN(n))return '\u2014';return Number(n).toLocaleString('en-HK',{maximumFractionDigits:d,minimumFractionDigits:d});}
function destroyCharts(){charts.forEach(c=>c.destroy());charts=[];}
function badge(t){const x=(t||'Stable').toLowerCase();return `<span class="badge ${x}">${t}</span>`;}
async function loadData(){
  const[res,wres]=await Promise.all([fetch('data.json'),fetch('weeks.json')]);
  DATA=await res.json();
  const weeks=await wres.json();
  for(const name of Object.keys(DATA.technicians||{})){if(weeks[name])DATA.technicians[name].weeks=weeks[name];}
  if(DATA.ranking){DATA.ranking=DATA.ranking.map(t=>{const live=DATA.technicians[t.name];return live?Object.assign({},t,live):t;});}
}
function setNav(active){
  const names=techNames();
  $('nav-links').innerHTML=names.map(n=>`<a href="#/tech/${n}" class="${active===('#/tech/'+n)?'active':''}">${n}</a>`).join('')+
    `<span class="nav-sep"></span><a href="#/team" class="${active==='#/team'?'active':''}">Full Team</a>`+
    `<a href="#/compete" class="nav-compete${active==='#/compete'?' active':''}">Competition</a>`;
}
function weekMonth(w){return(w||'').slice(0,7);}
function latestWeekKey(){const w=DATA.weeks||[];return w.length?w[w.length-1]:null;}
function currentMonthKey(){const lw=latestWeekKey();return lw?weekMonth(lw):null;}
function weekQuarter(w){if(!w)return null;const m=parseInt(w.slice(5,7),10);return w.slice(0,4)+'-Q'+Math.ceil(m/3);}
function currentQuarterKey(){const lw=latestWeekKey();return lw?weekQuarter(lw):null;}
function monthLabel(mk){if(!mk)return'Month';const[y,m]=mk.split('-');return['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m,10)-1]+' '+y;}
function quarterLabel(qk){if(!qk)return'Quarter';const p=qk.split('-Q');return'Q'+p[1]+' '+p[0];}
function techWeekPoints(n,wk){const r=(DATA.technicians[n].weeks||[]).find(x=>x.week===wk);return r?(r.points||0):0;}
function techMonthPoints(n,mk){let s=0;for(const r of(DATA.technicians[n].weeks||[])){if(weekMonth(r.week)===mk)s+=(r.points||0);}return s;}
function techQuarterPoints(n,qk){let s=0;for(const r of(DATA.technicians[n].weeks||[])){if(weekQuarter(r.week)===qk)s+=(r.points||0);}return s;}
function enrichTech(t){
  const latestWk=latestWeekKey(),monthKey=currentMonthKey(),quarterKey=currentQuarterKey();
  const rows=(DATA.technicians[t.name].weeks||[]);
  const totalPts=rows.reduce((s,r)=>s+(r.points||0),0);
  const nWeeks=rows.length||1;
  return Object.assign({},t,{
    latestWeekPts:techWeekPoints(t.name,latestWk),
    weekPts:totalPts/nWeeks,
    monthPts:techMonthPoints(t.name,monthKey),
    quarterPts:techQuarterPoints(t.name,quarterKey)
  });
}
function rankMetricKey(mode){return({day:'pointsDay',week:'weekPts',month:'monthPts',quarter:'quarterPts'})[mode]||'pointsDay';}
function rankMetricLabel(mode,ms,qs){return({day:'Pts/Day',week:'Pts/Week',month:ms||'Month',quarter:qs||'Quarter'})[mode]||'Pts/Day';}
function rankBy(mode){const key=rankMetricKey(mode);return DATA.ranking.map(enrichTech).sort((a,b)=>(b[key]||0)-(a[key]||0));}
function fmtMetric(mode,v){return mode==='day'?fmt(v,2):fmt(v,1);}

function renderCompetition(){
  destroyCharts();setNav('#/compete');
  const mode=RANK_MODE||'day';
  const labels=DATA.weekLabels||[];
  const weeks=DATA.weeks||[];
  const names=techNames();
  const monthShort=monthLabel(currentMonthKey());
  const quarterShort=quarterLabel(currentQuarterKey());
  const sorted=rankBy(mode);
  const metricKey=rankMetricKey(mode);
  const metricLabel=rankMetricLabel(mode,monthShort,quarterShort);
  const retW=DATA.returnPointsWeight!=null?DATA.returnPointsWeight:0;
  const modeBtn=(id,label)=>`<button type="button" class="rank-mode-btn ${mode===id?'active':''}" data-mode="${id}">${label}</button>`;
  $('app').innerHTML=`
    <div class="page-header"><h1>Competition</h1>
      <p>Rankings use weighted job points · Updated ${DATA.generated}</p></div>
    <div class="rank-modes" id="rank-modes">
      ${modeBtn('day','Pts / Day')}${modeBtn('week','Pts / Week')}${modeBtn('month',monthShort)}${modeBtn('quarter',quarterShort)}
    </div>
    <div class="section">
      <div class="section-title">Leaderboard · ${metricLabel}</div>
      <div class="table-wrap"><table>
        <thead><tr><th>#</th><th>Technician</th><th class="num">${metricLabel}</th>
          <th class="num">Pts/Day</th><th class="num hide-sm">Gap</th><th>Trend</th></tr></thead>
        <tbody>${sorted.map((t,i)=>{
          const gap=i===0?null:(sorted[0][metricKey]||0)-(t[metricKey]||0);
          const gapHtml=gap==null?'<span class="gap-lead">Lead</span>':`<span class="gap-behind">-${fmtMetric(mode,gap)}</span>`;
          return`<tr class="${i===0?'lead-row':''}">
            <td><span class="rank-num ${i===0?'r1':i===1?'r2':i===2?'r3':''}">${i+1}</span></td>
            <td class="name">${t.name}</td>
            <td class="num"><strong>${fmtMetric(mode,t[metricKey])}</strong></td>
            <td class="num">${fmt(t.pointsDay,2)}</td>
            <td class="num hide-sm">${gapHtml}</td>
            <td>${badge(t.trend)}</td></tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>
    <div class="section">
      <div class="section-title">Charts</div>
      <div class="chart-grid">
        <div class="chart-card full"><h3>${metricLabel} by person</h3>
          <div class="chart-wrap hero"><canvas id="c1"></canvas></div></div>
        <div class="chart-card full"><h3>Team points by week</h3>
          <div class="chart-wrap"><canvas id="c3"></canvas></div></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Points system</div>
      <div class="points-ref"><table>
        <thead><tr><th>Unit</th><th class="num">Points</th><th>Note</th></tr></thead>
        <tbody>${(DATA.pointsTable||[]).map(p=>`<tr><td class="name">${p.type}</td><td class="num"><strong>${fmt(p.points,2)}</strong></td><td style="color:var(--mute)">${p.note||''}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>`;
  document.getElementById('rank-modes').addEventListener('click',e=>{
    const btn=e.target.closest('[data-mode]');if(!btn)return;RANK_MODE=btn.getAttribute('data-mode');renderCompetition();
  });
  charts.push(new Chart(document.getElementById('c1'),{
    type:'bar',data:{labels:sorted.map(t=>t.name),datasets:[{data:sorted.map(t=>t[metricKey]),backgroundColor:sorted.map(t=>TECH_COLORS[t.name]),borderRadius:6,barThickness:26}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true},y:{grid:{display:false},ticks:{font:{size:13,weight:'600'}}}}}
  }));
  const teamByWeek=weeks.map(w=>{let s=0;names.forEach(n=>{const r=(DATA.technicians[n].weeks||[]).find(x=>x.week===w);if(r)s+=(r.points||0);});return s;});
  charts.push(new Chart(document.getElementById('c3'),{
    type:'bar',data:{labels,datasets:[{data:teamByWeek,backgroundColor:'#2896D1',borderRadius:6,barThickness:28}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true}}}
  }));
}

function renderTeam(){
  destroyCharts();setNav('#/team');
  const team=DATA.team,labels=DATA.weekLabels||[],weeks=DATA.weeks||[],names=techNames();
  const retW=DATA.returnPointsWeight!=null?DATA.returnPointsWeight:0;
  const tw=weeks.map(w=>{let points=0,units=0,days=0,returns=0;
    names.forEach(n=>{const r=(DATA.technicians[n].weeks||[]).find(x=>x.week===w);if(!r)return;points+=r.points||0;units+=r.totalUnits||0;days+=r.workday||0;returns+=r.returns||0;});
    return{points,units,days,returns,pointsDay:days?points/days:0;});
  const unitTotals={};names.forEach(n=>{const ut=DATA.technicians[n].unitTotals||{};Object.keys(ut).forEach(k=>{unitTotals[k]=(unitTotals[k]||0)+ut[k];});});
  const unitOrder=['S','W','B','C','UC','SwG','TV','OU','EF','PAU','R'];
  const weightMap={};(DATA.pointsTable||[]).forEach(p=>weightMap[p.type]=p.points);
  $('app').innerHTML=`
    <div class="page-header"><h1>Full Team</h1>
      <p>Crew totals · Updated ${DATA.generated}</p></div>
    <div class="kpi-row">
      <div class="kpi-card"><div class="label">Team points</div><div class="value">${fmt(team.totalPoints,1)}</div></div>
      <div class="kpi-card"><div class="label">Pts / Day</div><div class="value">${fmt(team.avgPointsDay,2)}</div></div>
      <div class="kpi-card"><div class="label">Units</div><div class="value">${fmt(team.totalUnits)}</div></div>
      <div class="kpi-card"><div class="label">Team returns</div><div class="value">${fmt(team.totalReturns)}</div>
        <div class="kpi-explain">${fmt(retW,1)} pts each</div></div>
    </div>
    <div class="section"><div class="section-title">Unit mix</div>
      <div class="unit-chips">${unitOrder.filter(u=>(unitTotals[u]||0)>0).map(u=>`<div class="unit-chip"><div class="ut">${u} · ${fmt(weightMap[u]!=null?weightMap[u]:0,2)} pts</div><div class="uv">${fmt(unitTotals[u])}</div></div>`).join('')}</div>
    </div>
    <div class="section"><div class="section-title">Weekly pace</div>
      <div class="chart-grid">
        <div class="chart-card full"><h3>Team points by week</h3><div class="chart-wrap"><canvas id="t1"></canvas></div></div>
        <div class="chart-card full"><h3>Team Pts/Day by week</h3><div class="chart-wrap"><canvas id="t2"></canvas></div></div>
      </div>
    </div>`;
  charts.push(new Chart(document.getElementById('t1'),{type:'bar',data:{labels,datasets:[{data:tw.map(x=>x.points),backgroundColor:'#0d9488',borderRadius:6,barThickness:28}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true}}}}));
  charts.push(new Chart(document.getElementById('t2'),{type:'line',data:{labels,datasets:[{data:tw.map(x=>Math.round(x.pointsDay*100)/100),borderColor:'#0d9488',backgroundColor:'#0d948822',fill:true,tension:0.3,pointRadius:4,borderWidth:2.5}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true}}}}));
}

function renderTech(name){
  destroyCharts();
  if(!DATA.technicians[name]){location.hash='#/team';return;}
  setNav('#/tech/'+name);
  const t=DATA.technicians[name];
  const color=TECH_COLORS[name]||'#1481c3';
  const retW=DATA.returnPointsWeight!=null?DATA.returnPointsWeight:0;
  const weeks=(t.weeks||[]).slice().sort((a,b)=>a.week.localeCompare(b.week));
  const wl=weeks.map(w=>w.weekLabel||w.week);
  const ut=t.unitTotals||{};
  const unitOrder=['S','W','B','C','UC','SwG','TV','OU','EF','PAU','R'];
  const weightMap={};(DATA.pointsTable||[]).forEach(p=>weightMap[p.type]=p.points);
  $('app').innerHTML=`
    <div class="page-header"><h1>${name}</h1>
      <p>Personal performance · Updated ${DATA.generated}</p></div>
    <div class="profile-metrics">
      <div><div class="profile-metric-value" style="color:${color}">${fmt(t.totalPoints,1)}</div><div class="profile-metric-label">Points</div></div>
      <div><div class="profile-metric-value">${fmt(t.pointsDay,2)}</div><div class="profile-metric-label">Pts / Day</div></div>
      <div><div class="profile-metric-value">${fmt(t.totalUnits)}</div><div class="profile-metric-label">Units</div></div>
      <div><div class="profile-metric-value">${fmt(t.totalReturns)}</div><div class="profile-metric-label">Returns</div>
        <div class="kpi-explain">${fmt(retW,1)} pts each</div></div>
    </div>
    <div class="section"><div class="section-title">Unit mix</div>
      <div class="unit-chips">${unitOrder.filter(u=>(ut[u]||0)>0).map(u=>`<div class="unit-chip"><div class="ut">${u} · ${fmt(weightMap[u]!=null?weightMap[u]:0,2)} pts</div><div class="uv">${fmt(ut[u])}</div></div>`).join('')}</div>
    </div>
    <div class="section"><div class="section-title">Week by week</div>
      <div class="table-wrap"><table class="wide">
        <thead><tr><th>Week</th><th class="num">Points</th><th class="num">Pts/Day</th><th class="num">Units</th><th class="num hide-sm">Days</th><th class="num">Returns</th></tr></thead>
        <tbody>${weeks.map(w=>`<tr><td>${w.weekLabel||w.week}</td><td class="num"><strong>${fmt(w.points,1)}</strong></td><td class="num">${fmt(w.pointsDay,2)}</td><td class="num">${fmt(w.totalUnits)}</td><td class="num hide-sm">${fmt(w.workday)}</td><td class="num">${fmt(w.returns||0)}</td></tr>`).join('')}
        <tr class="total-row"><td>All weeks</td><td class="num">${fmt(t.totalPoints,1)}</td><td class="num">${fmt(t.pointsDay,2)}</td><td class="num">${fmt(t.totalUnits)}</td><td class="num hide-sm">${fmt(t.totalDays)}</td><td class="num">${fmt(t.totalReturns)}</td></tr>
        </tbody></table></div>
    </div>
    <div class="section"><div class="section-title">Charts</div>
      <div class="chart-grid">
        <div class="chart-card"><h3>Your Pts/Day</h3><div class="chart-wrap"><canvas id="p1"></canvas></div></div>
        <div class="chart-card"><h3>Your points</h3><div class="chart-wrap"><canvas id="p2"></canvas></div></div>
        <div class="chart-card full"><h3>Returns</h3><div class="chart-wrap"><canvas id="p3"></canvas></div></div>
      </div>
    </div>`;
  const avg=t.ownAvgPointsDay||t.pointsDay;
  charts.push(new Chart(document.getElementById('p1'),{type:'line',data:{labels:wl,datasets:[
    {label:'Pts/Day',data:weeks.map(w=>w.pointsDay),borderColor:color,backgroundColor:color+'22',fill:true,tension:0.3,pointRadius:4,borderWidth:2.5},
    {label:'Avg '+fmt(avg,2),data:wl.map(()=>avg),borderColor:'#8aa0b8',borderDash:[6,4],pointRadius:0,borderWidth:1.5,fill:false}
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,padding:12}}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true}}}}));
  charts.push(new Chart(document.getElementById('p2'),{type:'bar',data:{labels:wl,datasets:[{data:weeks.map(w=>w.points),backgroundColor:color,borderRadius:6,barThickness:28}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true}}}}));
  charts.push(new Chart(document.getElementById('p3'),{type:'bar',data:{labels:wl,datasets:[{data:weeks.map(w=>w.returns||0),backgroundColor:'#69C7EE',borderRadius:6,barThickness:28}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(14,77,145,0.08)'},beginAtZero:true,ticks:{stepSize:1}}}}}));
}

function route(){const hash=location.hash||'#/team';if(hash.startsWith('#/tech/'))renderTech(decodeURIComponent(hash.replace('#/tech/','')));else if(hash==='#/compete')renderCompetition();else renderTeam();}
window.addEventListener('hashchange',route);
loadData().then(()=>route()).catch(err=>{console.error(err);$('app').innerHTML='<p>Failed to load data.</p>';});
window.startDashboard=function(){route();};
