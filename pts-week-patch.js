/* Pts / Week = running average (total points / weeks). Load after app.js. */
function techPointsPerWeek(name){
  const weeks=(DATA.technicians[name]&&DATA.technicians[name].weeks)||[];
  if(!weeks.length) return 0;
  return weeks.reduce(function(s,w){return s+(w.points||0);},0)/weeks.length;
}
(function(){
  var _enrich=enrichTech;
  enrichTech=function(t){
    var e=_enrich(t);
    e.weekPts=techPointsPerWeek(t.name);
    return e;
  };
  var _label=rankMetricLabel;
  rankMetricLabel=function(mode, monthShort, quarterShort){
    if(mode==='week') return 'Pts / Week';
    return _label(mode, monthShort, quarterShort);
  };
  var _fmt=fmtMetric;
  fmtMetric=function(mode,v){
    if(mode==='week') return fmt(v,1);
    return _fmt(mode,v);
  };
  var _comp=renderCompetition;
  renderCompetition=function(){
    _comp();
    var btn=document.querySelector('.rank-mode-btn[data-mode="week"]');
    if(btn) btn.textContent='Pts / Week';
    var hint=document.querySelector('.rank-mode-hint');
    if(hint && RANK_MODE==='week'){
      hint.textContent='Running average points per week \u2014 total points \u00f7 weeks in the period.';
    }
    document.querySelectorAll('th').forEach(function(th){
      if(th.textContent.trim()==='This Week') th.textContent='Pts / Week';
    });
    var note=document.querySelector('.section .note');
    if(note && note.textContent.indexOf('All four')!==-1){
      note.textContent='Pts / Week = total points \u00f7 weeks in the period (zero weeks included). All four modes are valid ways to compete.';
    }
  };
  var _tech=renderTech;
  renderTech=function(name){
    _tech(name);
    document.querySelectorAll('.kpi-card .label').forEach(function(el){
      if(el.textContent.trim()==='This Week'){
        el.textContent='Pts / Week';
        var val=el.parentElement.querySelector('.value');
        if(val) val.textContent=fmt(techPointsPerWeek(name),1);
      }
    });
  };
})();
