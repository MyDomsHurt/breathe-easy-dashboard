/* Breathe-Easy Dashboard v63 — loading shell; full modules pending */
const TECH_ORDER=['Matthew','Tiago','Nick','Alun','Iggi'];
const TECH_COLORS={Matthew:'#2563eb',Nick:'#22c55e',Iggi:'#f97316',Alun:'#a855f7',Tiago:'#0ea5e9'};
let DATA=null,charts=[],TIMEFRAME='this_month',METRIC='day';
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
function renderCompetition(){destroyCharts();setNav('#/compete');$('app').innerHTML='<div class="page-header"><h1>Competition</h1><p>Updating to timeframe UI… refresh shortly.</p></div>';}
function renderTeam(){destroyCharts();setNav('#/team');$('app').innerHTML='<div class="page-header"><h1>Full Team</h1><p>Updating to timeframe UI… refresh shortly.</p></div>';}
function renderTech(name){destroyCharts();setNav('#/tech/'+name);$('app').innerHTML=`<div class="page-header"><h1>${name}</h1><p>Updating to timeframe UI… refresh shortly.</p></div>`;}
function route(){const hash=location.hash||'#/team';if(hash.startsWith('#/tech/'))renderTech(decodeURIComponent(hash.replace('#/tech/','')));else if(hash==='#/compete')renderCompetition();else renderTeam();}
window.addEventListener('hashchange',route);
loadData().then(()=>route()).catch(err=>{console.error(err);$('app').innerHTML='<p>Failed to load data.</p>';});
window.startDashboard=function(){route();};
