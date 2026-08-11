/* Authored bright Chart.js defaults */
(function () {
  const ACCENT = '#0d9488';
  const GRID = 'rgba(10,10,10,0.06)';
  const TICK = '#a3a3a3';
  const OrigChart = window.Chart;
  if (!OrigChart) return;

  try {
    OrigChart.defaults.font.family = "'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    OrigChart.defaults.font.size = 11;
    OrigChart.defaults.font.weight = '500';
    OrigChart.defaults.color = TICK;
    OrigChart.defaults.plugins.legend.labels.boxWidth = 8;
    OrigChart.defaults.plugins.legend.labels.boxHeight = 8;
    OrigChart.defaults.plugins.legend.labels.padding = 12;
    OrigChart.defaults.plugins.legend.labels.usePointStyle = true;
    OrigChart.defaults.plugins.legend.labels.pointStyle = 'circle';
    OrigChart.defaults.plugins.legend.labels.color = '#525252';
    OrigChart.defaults.plugins.tooltip.backgroundColor = 'rgba(10,10,10,0.92)';
    OrigChart.defaults.plugins.tooltip.titleColor = '#fafafa';
    OrigChart.defaults.plugins.tooltip.bodyColor = '#e5e5e5';
    OrigChart.defaults.plugins.tooltip.padding = 10;
    OrigChart.defaults.plugins.tooltip.cornerRadius = 6;
    OrigChart.defaults.elements.bar.borderRadius = 3;
    OrigChart.defaults.elements.bar.borderSkipped = false;
    OrigChart.defaults.elements.line.borderWidth = 2;
    OrigChart.defaults.elements.point.radius = 3;
    OrigChart.defaults.elements.point.hoverRadius = 5;
    OrigChart.defaults.scale.grid.color = GRID;
    OrigChart.defaults.scale.grid.drawBorder = false;
    OrigChart.defaults.scale.ticks.color = TICK;
    OrigChart.defaults.scale.ticks.padding = 4;
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
        config.options.plugins.legend.labels.color = '#525252';
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
              if (c === '#16a34a') return '#22c55e';
              if (c === '#fb8e28') return '#f97316';
              if (c === '#59bcee') return '#0ea5e9';
              if (c === '#94a3b8') return '#a3a3a3';
              return c;
            });
          }
          if (ds.borderColor === '#94a3b8') ds.borderColor = '#a3a3a3';
          if (ds.label === 'S') ds.backgroundColor = '#2563eb';
          if (ds.label === 'W') ds.backgroundColor = '#22c55e';
          if (ds.label === 'B') ds.backgroundColor = '#f97316';
          if (ds.label === 'C') ds.backgroundColor = '#a855f7';
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
