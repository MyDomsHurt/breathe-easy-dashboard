/* Breathe-Easy Dashboard
 * Competition | Full Team | Personal
 * Timeframe + metric controls · full-year weeks.json
 * Returns (R) tracked as count only — 0 points
 */
const TECH_ORDER = ['Matthew','Tiago','Nick','Alun','Iggi'];
const TECH_COLORS = {
  Matthew: '#2563eb',
  Tiago: '#0ea5e9',
  Nick: '#22c55e',
  Alun: '#a855f7',
  Iggi: '#f97316'
};

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
