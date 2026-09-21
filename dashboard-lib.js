/* Breathe-Easy Performance */
const TECH_ORDER = ['Matthew','Tiago','Nick','Alun','Iggi'];
const TECH_COLORS = { Matthew:'#2563eb', Tiago:'#0ea5e9', Nick:'#22c55e', Alun:'#a855f7', Iggi:'#f97316' };
(function initChartDefaults(){
  const OrigChart = window.Chart;
  if (!OrigChart) return;
  const GRID = 'rgba(14,77,145,0.08)';
  const TICK = '#8aa0b8';
  try {
    OrigChart.defaults.font.family = "'Libre Franklin', Arial, system-ui, sans-serif";
    OrigChart.defaults.font.size = 11;
    OrigChart.defaults.font.weight = '600';
    OrigChart.defaults.color = TICK;
    OrigChart.defaults.plugins.legend.labels.boxWidth = 10;
    OrigChart.defaults.plugins.legend.labels.padding = 12;
    OrigChart.defaults.plugins.legend.labels.usePointStyle = true;
    OrigChart.defaults.plugins.legend.labels.pointStyle = 'circle';
    OrigChart.defaults.plugins.legend.labels.color = '#1a3558';
    OrigChart.defaults.plugins.tooltip.backgroundColor = 'rgba(14,77,145,0.94)';
    OrigChart.defaults.plugins.tooltip.cornerRadius = 10;
    OrigChart.defaults.plugins.tooltip.padding = 10;
    OrigChart.defaults.elements.bar.borderRadius = 6;
    OrigChart.defaults.elements.bar.borderSkipped = false;
    OrigChart.defaults.elements.line.borderWidth = 2.5;
    OrigChart.defaults.elements.point.radius = 3.5;
    OrigChart.defaults.elements.point.hoverRadius = 5;
    OrigChart.defaults.scale.grid.color = GRID;
    OrigChart.defaults.scale.grid.drawBorder = false;
    OrigChart.defaults.scale.ticks.color = TICK;
  } catch (e) {}
  function Chart(ctx, config) {
    try {
      const scales = config && config.options && config.options.scales;
      if (scales) {
        Object.keys(scales).forEach(function (k) {
          const axis = scales[k] || (scales[k] = {});
          axis.grid = axis.grid || {};
          axis.grid.color = GRID;
          axis.grid.drawBorder = false;
          if (axis.ticks) axis.ticks.color = TICK;
        });
      }
    } catch (e) {}
    return new OrigChart(ctx, config);
  }
  Chart.prototype = OrigChart.prototype;
  Object.keys(OrigChart).forEach(function (k) { try { Chart[k] = OrigChart[k]; } catch (e) {} });
  window.Chart = Chart;
})();
let DATA = null, charts = [];
let TIMEFRAME = 'this_month';
let METRIC = 'day';
function techNames(){
  const keys = DATA && DATA.technicians ? Object.keys(DATA.technicians) : TECH_ORDER;
  return TECH_ORDER.filter(n => keys.includes(n));
}
function $(id){ return document.getElementById(id); }
function fmt(n, d){
  if(d==null) d=0;
  if(n==null || isNaN(n)) return '\u2014';
  return Number(n).toLocaleString('en-HK', {maximumFractionDigits:d, minimumFractionDigits:d});
}
function destroyCharts(){ charts.forEach(function(c){ c.destroy(); }); charts = []; }
function badge(t){
  const x = (t || 'Stable').toLowerCase();
  return '<span class="badge '+x+'">'+(t||'Stable')+'</span>';
}
async function loadData(){
  const res = await fetch('data.json');
  const wres = await fetch('weeks.json');
  DATA = await res.json();
  const weeks = await wres.json();
  const cols = weeks._cols;
  const names = Object.keys(DATA.technicians || {});
  for(var i=0;i<names.length;i++){
    var name = names[i];
    if(!weeks[name]) continue;
    if(cols){
      DATA.technicians[name].weeks = weeks[name].map(function(arr){
        var o = {};
        cols.forEach(function(c, idx){ o[c] = arr[idx]; });
        return o;
      });
    } else {
      DATA.technicians[name].weeks = weeks[name];
    }
  }
  var keys = allWeekKeys();
  if(keys.length){
    DATA.weeks = keys;
    DATA.weekLabels = keys.map(weekLabelFor);
  }
  if(DATA.ranking){
    DATA.ranking = DATA.ranking.map(function(t){
      var live = DATA.technicians[t.name];
      return live ? Object.assign({}, t, live) : t;
    });
  }
}
function setNav(active){
  const names = techNames();
  const competeActive = active === '#/compete' ? ' active' : '';
  const teamActive = active === '#/team' ? ' active' : '';
  $('nav-links').innerHTML =
    names.map(function(n){ return '<a href="#/tech/'+n+'" class="'+(active === ('#/tech/'+n) ? 'active' : '')+'">'+n+'</a>'; }).join('') +
    '<span class="nav-sep"></span>' +
    '<a href="#/team" class="'+teamActive+'">Full Team</a>' +
    '<a href="#/compete" class="nav-compete'+competeActive+'">Competition</a>';
}
function allWeekKeys(){
  const set = new Set();
  techNames().forEach(function(n){
    (DATA.technicians[n].weeks || []).forEach(function(r){ if(r.week) set.add(r.week); });
  });
  (DATA.weeks || []).forEach(function(w){ set.add(w); });
  return Array.from(set).sort();
}
function weekLabelFor(weekKey){
  var names = techNames();
  for(var i=0;i<names.length;i++){
    var r = (DATA.technicians[names[i]].weeks || []).find(function(x){ return x.week === weekKey; });
    if(r && r.weekLabel) return r.weekLabel;
  }
  if(!weekKey) return '';
  var d = new Date(weekKey + 'T12:00:00');
  if(isNaN(d)) return weekKey;
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return String(d.getDate()).padStart(2,'0') + ' ' + months[d.getMonth()];
}
function weekMonth(weekStr){ return (weekStr || '').slice(0, 7); }
function weekQuarter(weekStr){
  if(!weekStr) return null;
  var y = weekStr.slice(0, 4);
  var m = parseInt(weekStr.slice(5, 7), 10);
  return y + '-Q' + Math.ceil(m / 3);
}
function monthLabel(monthKey){
  if(!monthKey) return 'Month';
  var parts = monthKey.split('-');
  var names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return names[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
}
function quarterLabel(quarterKey){
  if(!quarterKey) return 'Quarter';
  var parts = quarterKey.split('-Q');
  return 'Q' + parts[1] + ' ' + parts[0];
}
function shiftMonth(monthKey, delta){
  var parts = monthKey.split('-').map(Number);
  var d = new Date(parts[0], parts[1] - 1 + delta, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
function shiftQuarter(quarterKey, delta){
  var bits = quarterKey.split('-Q');
  var y = parseInt(bits[0], 10), q = parseInt(bits[1], 10) + delta;
  while(q < 1){ q += 4; y -= 1; }
  while(q > 4){ q -= 4; y += 1; }
  return y + '-Q' + q;
}
function resolveTimeframe(id){
  var keys = allWeekKeys();
  if(!keys.length) return { id: id, label: 'No data', weeks: [] };
  var latest = keys[keys.length - 1];
  var prev = keys.length > 1 ? keys[keys.length - 2] : null;
  var thisMonth = weekMonth(latest);
  var lastMonth = shiftMonth(thisMonth, -1);
  var thisQ = weekQuarter(latest);
  var lastQ = shiftQuarter(thisQ, -1);
  function filterMonth(mk){ return keys.filter(function(k){ return weekMonth(k) === mk; }); }
  function filterQuarter(qk){ return keys.filter(function(k){ return weekQuarter(k) === qk; }); }
  if(id==='this_week') return { id:id, label:'This week \u00b7 '+weekLabelFor(latest), weeks:[latest] };
  if(id==='last_week') return { id:id, label: prev ? 'Last week \u00b7 '+weekLabelFor(prev) : 'Last week', weeks: prev ? [prev] : [] };
  if(id==='last_4') return { id:id, label:'Last 4 weeks', weeks: keys.slice(-4) };
  if(id==='this_month') return { id:id, label: monthLabel(thisMonth), weeks: filterMonth(thisMonth) };
  if(id==='last_month') return { id:id, label: monthLabel(lastMonth), weeks: filterMonth(lastMonth) };
  if(id==='this_quarter') return { id:id, label: quarterLabel(thisQ), weeks: filterQuarter(thisQ) };
  if(id==='last_quarter') return { id:id, label: quarterLabel(lastQ), weeks: filterQuarter(lastQ) };
  if(id==='ytd' || id==='full') return { id:id, label: id==='full' ? 'Full year' : 'Year to date', weeks: keys };
  return { id:'this_month', label: monthLabel(thisMonth), weeks: filterMonth(thisMonth) };
}
