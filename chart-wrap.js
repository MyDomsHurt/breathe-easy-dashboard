/* Direction A Chart.js wrapper — load after Chart.js, before app.js */
(function () {
  const ACCENT = '#0d9488';
  const GRID = '#e7e5e4';
  const OrigChart = window.Chart;
  if (!OrigChart) return;
  function Chart(ctx, config) {
    try {
      const scales = config && config.options && config.options.scales;
      if (scales) {
        Object.keys(scales).forEach(function (k) {
          const g = scales[k] && scales[k].grid;
          if (g && g.color) g.color = GRID;
        });
      }
      const datasets = config && config.data && config.data.datasets;
      if (datasets) {
        datasets.forEach(function (ds) {
          if (ds.borderColor === '#1481c3') ds.borderColor = ACCENT;
          if (typeof ds.backgroundColor === 'string' && ds.backgroundColor.indexOf('#1481c3') === 0)
            ds.backgroundColor = ACCENT + ds.backgroundColor.slice(7);
          if (Array.isArray(ds.backgroundColor)) {
            ds.backgroundColor = ds.backgroundColor.map(function (c) {
              if (c === '#1481c3') return ACCENT;
              if (c === '#154487') return '#a855f7';
              if (c === '#16a34a') return '#22c55e';
              if (c === '#fb8e28') return '#f97316';
              if (c === '#59bcee') return '#0ea5e9';
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
  Object.keys(OrigChart).forEach(function (k) {
    try { Chart[k] = OrigChart[k]; } catch (e) {}
  });
  window.Chart = Chart;
})();
