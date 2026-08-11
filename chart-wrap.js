/* Dark overhaul Chart.js — load after Chart.js, before app.js */
(function () {
  const ACCENT = '#2dd4bf';
  const GRID = 'rgba(255,255,255,0.06)';
  const TICK = '#71717a';
  const OrigChart = window.Chart;
  if (!OrigChart) return;

  try {
    OrigChart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    OrigChart.defaults.font.size = 11;
    OrigChart.defaults.font.weight = '500';
    OrigChart.defaults.color = TICK;
    OrigChart.defaults.plugins.legend.labels.boxWidth = 10;
    OrigChart.defaults.plugins.legend.labels.boxHeight = 10;
    OrigChart.defaults.plugins.legend.labels.padding = 14;
    OrigChart.defaults.plugins.legend.labels.usePointStyle = true;
    OrigChart.defaults.plugins.legend.labels.pointStyle = 'circle';
    OrigChart.defaults.plugins.legend.labels.color = '#a1a1aa';
    OrigChart.defaults.plugins.tooltip.backgroundColor = 'rgba(15,17,23,0.95)';
    OrigChart.defaults.plugins.tooltip.titleColor = '#f4f4f5';
    OrigChart.defaults.plugins.tooltip.bodyColor = '#d4d4d8';
    OrigChart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.08)';
    OrigChart.defaults.plugins.tooltip.borderWidth = 1;
    OrigChart.defaults.plugins.tooltip.titleFont = { weight: '600', size: 12 };
    OrigChart.defaults.plugins.tooltip.bodyFont = { size: 12 };
    OrigChart.defaults.plugins.tooltip.padding = 12;
    OrigChart.defaults.plugins.tooltip.cornerRadius = 10;
    OrigChart.defaults.elements.bar.borderRadius = 6;
    OrigChart.defaults.elements.bar.borderSkipped = false;
    OrigChart.defaults.elements.line.borderWidth = 2.5;
    OrigChart.defaults.elements.point.radius = 3.5;
    OrigChart.defaults.elements.point.hoverRadius = 5;
    OrigChart.defaults.scale.grid.color = GRID;
    OrigChart.defaults.scale.grid.drawBorder = false;
    OrigChart.defaults.scale.ticks.color = TICK;
    OrigChart.defaults.scale.ticks.padding = 6;
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
          if (axis.ticks) {
            axis.ticks.color = TICK;
            axis.ticks.font = axis.ticks.font || { size: 11, weight: '500' };
          }
        });
      }
      if (config && config.options && config.options.plugins && config.options.plugins.legend && config.options.plugins.legend.labels) {
        config.options.plugins.legend.labels.color = '#a1a1aa';
      }
      const datasets = config && config.data && config.data.datasets;
      if (datasets) {
        datasets.forEach(function (ds) {
          if (ds.borderColor === '#1481c3') ds.borderColor = ACCENT;
          if (typeof ds.backgroundColor === 'string' && ds.backgroundColor.indexOf('#1481c3') === 0)
            ds.backgroundColor = ACCENT + (ds.backgroundColor.length > 7 ? ds.backgroundColor.slice(7) : '33');
          if (Array.isArray(ds.backgroundColor)) {
            ds.backgroundColor = ds.backgroundColor.map(function (c) {
              if (c === '#1481c3') return ACCENT;
              if (c === '#154487') return '#a855f7';
              if (c === '#16a34a') return '#4ade80';
              if (c === '#fb8e28') return '#fb923c';
              if (c === '#59bcee') return '#38bdf8';
              if (c === '#94a3b8') return '#71717a';
              return c;
            });
          }
          if (ds.borderColor === '#94a3b8') ds.borderColor = '#71717a';
          if (ds.label === 'S') ds.backgroundColor = '#3b82f6';
          if (ds.label === 'W') ds.backgroundColor = '#4ade80';
          if (ds.label === 'B') ds.backgroundColor = '#fb923c';
          if (ds.label === 'C') ds.backgroundColor = '#c084fc';
          if (ds.label === 'Avg' || ds.label === 'Your avg') {
            ds.borderColor = '#71717a';
          }
        });
      }
    } catch (e) {}
    return new OrigChart(ctx, config);
  }
  Chart.prototype = OrigChart.prototype;
  Object.keys(OrigChart).forEach(function (k) {
    try { Chart[k] = OrigChart[k]; } catch (e) {}
  });
  window.Chart = Chart;
})();
