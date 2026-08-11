(function () {
  const ACCENT = '#ff5a1f';
  const GRID = 'rgba(26,18,8,0.08)';
  const TICK = '#b5a48c';
  const OrigChart = window.Chart;
  if (!OrigChart) return;
  try {
    OrigChart.defaults.font.family = "'Nunito', system-ui, sans-serif";
    OrigChart.defaults.font.size = 11;
    OrigChart.defaults.font.weight = '700';
    OrigChart.defaults.color = TICK;
    OrigChart.defaults.plugins.legend.labels.boxWidth = 10;
    OrigChart.defaults.plugins.legend.labels.padding = 12;
    OrigChart.defaults.plugins.legend.labels.usePointStyle = true;
    OrigChart.defaults.plugins.legend.labels.pointStyle = 'circle';
    OrigChart.defaults.plugins.legend.labels.color = '#3d2e1f';
    OrigChart.defaults.plugins.tooltip.backgroundColor = 'rgba(26,18,8,0.92)';
    OrigChart.defaults.plugins.tooltip.cornerRadius = 10;
    OrigChart.defaults.plugins.tooltip.padding = 10;
    OrigChart.defaults.elements.bar.borderRadius = 6;
    OrigChart.defaults.elements.bar.borderSkipped = false;
    OrigChart.defaults.elements.line.borderWidth = 3;
    OrigChart.defaults.elements.point.radius = 4;
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
      const datasets = config && config.data && config.data.datasets;
      if (datasets) {
        datasets.forEach(function (ds) {
          if (ds.borderColor === '#1481c3') ds.borderColor = ACCENT;
          if (typeof ds.backgroundColor === 'string' && ds.backgroundColor.indexOf('#1481c3') === 0)
            ds.backgroundColor = ACCENT + (ds.backgroundColor.length > 7 ? ds.backgroundColor.slice(7) : '40');
          if (Array.isArray(ds.backgroundColor)) {
            ds.backgroundColor = ds.backgroundColor.map(function (c) {
              if (c === '#1481c3') return ACCENT;
              if (c === '#154487') return '#7c3aed';
              if (c === '#16a34a') return '#22c55e';
              if (c === '#fb8e28') return '#f97316';
              if (c === '#59bcee') return '#0ea5e9';
              if (c === '#94a3b8') return '#b5a48c';
              return c;
            });
          }
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
  Object.keys(OrigChart).forEach(function (k) { try { Chart[k] = OrigChart[k]; } catch (e) {} });
  window.Chart = Chart;
})();
