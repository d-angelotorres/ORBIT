google.charts.load('current', { packages: ['corechart', 'table', 'geochart'] });
google.charts.setOnLoadCallback(init);

// Centralized zoom management
const zoomSettings = {
  altitude: { factor: 1, min: 1, max: 20 },
  velocity: { factor: 4, min: 1, max: 20 }
};

let currentPrefix = 'week1';
const sampleCache = new Map(); // Cache for sampled data

// Common chart options for consistency
const commonChartOptions = {
  width: 1200,
  height: 600,
  chartArea: { width: '80%', height: '70%' },
  hAxis: {
    titleTextStyle: { fontSize: 16, bold: true },
    textStyle: { fontSize: 12 },
    slantedText: true,
    slantedTextAngle: 45
  },
  vAxis: {
    titleTextStyle: { fontSize: 16, bold: true },
    textStyle: { fontSize: 12 }
  },
  legend: { position: 'bottom', textStyle: { fontSize: 14 } },
  animation: {
    startup: true,
    duration: 500,
    easing: 'out'
  }
};

function init() {
  drawAllCharts();

  document.getElementById('datasetSelect').addEventListener('change', (e) => {
    currentPrefix = e.target.value;
    sampleCache.clear(); // Clear cache on dataset change
    drawAllCharts();
  });
}

function drawAllCharts() {
  drawAltitudeChart();
  drawGeoChart();
  drawVelocityChart();
  drawVisibilityChart();
  drawVisiblePassesChart();
  drawVisibilityBarChart();
  drawSummaryStatsTable();
}

// Sampling helper with caching
function sampleData(data, maxPoints = 100) {
  const cacheKey = `${currentPrefix}_${maxPoints}_${data.getNumberOfRows()}`;
  if (sampleCache.has(cacheKey)) return sampleCache.get(cacheKey);

  const totalRows = data.getNumberOfRows();
  if (totalRows <= maxPoints) return data;

  const step = Math.ceil(totalRows / maxPoints);
  const sampled = new google.visualization.DataTable();
  sampled.addColumn('string', data.getColumnLabel(0));
  sampled.addColumn('number', data.getColumnLabel(1));

  for (let i = 0; i < totalRows; i += step) {
    sampled.addRow([data.getValue(i, 0), data.getValue(i, 1)]);
  }

  sampleCache.set(cacheKey, sampled);
  return sampled;
}

// Zoom controls
function updateZoom(chartType, action) {
  const settings = zoomSettings[chartType];
  if (action === 'in') {
    settings.factor = Math.max(settings.min, settings.factor - 0.5);
  } else if (action === 'out') {
    settings.factor = Math.min(settings.max, settings.factor + 0.5);
  } else if (action === 'reset') {
    settings.factor = chartType === 'altitude' ? 1 : 4;
  }
  if (chartType === 'altitude') {
    drawAltitudeChart();
  } else if (chartType === 'velocity') {
    drawVelocityChart();
  }
}

// Specific zoom functions
function zoomIn() { updateZoom('altitude', 'in'); }
function zoomOut() { updateZoom('altitude', 'out'); }
function resetZoom() { updateZoom('altitude', 'reset'); }
function velocityZoomIn() { updateZoom('velocity', 'in'); }
function velocityZoomOut() { updateZoom('velocity', 'out'); }
function velocityResetZoom() { updateZoom('velocity', 'reset'); }

// Altitude Chart with zoomable data
function drawAltitudeChart() {
  const data = currentPrefix === 'week1' ? getWeek1Data() : getWeek2Data();
  if (!data || data.getNumberOfRows() === 0) {
    document.getElementById('altitude_chart').innerHTML = '<p style="text-align: center; color: red;">No data available</p>';
    return;
  }

  const filtered = new google.visualization.DataTable();
  filtered.addColumn('string', 'Timestamp');
  filtered.addColumn('number', 'Altitude (km)');

  for (let i = 0; i < data.getNumberOfRows(); i++) {
    filtered.addRow([data.getValue(i, 0), data.getValue(i, 3)]);
  }

  const maxPoints = Math.floor(1000 / zoomSettings.altitude.factor);
  const sampled = sampleData(filtered, maxPoints);

  const altitudeRange = filtered.getColumnRange(1);
  const options = {
    ...commonChartOptions,
    title: 'ISS Altitude Over Time',
    curveType: 'function',
    hAxis: {
      ...commonChartOptions.hAxis,
      title: 'Timestamp',
      format: 'MMM d HH:mm',
      gridlines: { count: 10 }
    },
    vAxis: {
      ...commonChartOptions.vAxis,
      title: 'Altitude (km)',
      gridlines: { count: 8 },
      viewWindow: {
        min: Math.max(altitudeRange.min - (altitudeRange.max - altitudeRange.min) * 0.1 / zoomSettings.altitude.factor, 0),
        max: altitudeRange.max + (altitudeRange.max - altitudeRange.min) * 0.1 * zoomSettings.altitude.factor
      }
    },
    colors: ['#1e88e5'],
    pointSize: 5,
    dataOpacity: 0.7,
    explorer: {
      actions: ['dragToZoom', 'rightClickToReset'],
      axis: 'horizontal',
      keepInBounds: true,
      maxZoomIn: 0.05,
      maxZoomOut: 20
    }
  };

  const chart = new google.visualization.LineChart(document.getElementById('altitude_chart'));
  chart.draw(sampled, options);
}

// World Map – ISS Location Plot
function drawGeoChart() {
  const data = currentPrefix === 'week1' ? getWeek1Geo() : getWeek2Geo();
  if (!data || data.getNumberOfRows() === 0) {
    document.getElementById('geo_chart').innerHTML = '<p style="text-align: center; color: red;">No data available</p>';
    return;
  }

  const mapData = new google.visualization.DataTable();
  mapData.addColumn('number', 'Latitude');
  mapData.addColumn('number', 'Longitude');
  mapData.addColumn({ type: 'string', role: 'tooltip', p: { html: true } });

  for (let i = 0; i < data.getNumberOfRows(); i++) {
    const lat = data.getValue(i, 0);
    const lon = data.getValue(i, 1);
    const name = data.getValue(i, 2);
    const alt = data.getValue(i, 3);

    const tooltip = `
      <div style="padding:10px;">
        <strong>${name}</strong><br/>
        <strong>Lat/Lon:</strong> ${lat.toFixed(2)}, ${lon.toFixed(2)}<br/>
        <strong>Altitude:</strong> ${alt.toFixed(1)} km
      </div>
    `;
    mapData.addRow([lat, lon, tooltip]);
  }

  const options = {
    displayMode: 'markers',
    colorAxis: { colors: ['#1e88e5'] },
    legend: 'none',
    tooltip: { isHtml: true },
    sizeAxis: { minValue: 0, maxValue: 100 },
    backgroundColor: '#eaf2f8',
    datalessRegionColor: '#f8f9fa',
    defaultColor: '#4285F4',
    keepAspectRatio: true,
    enableRegionInteractivity: true,
  };

  const chart = new google.visualization.GeoChart(document.getElementById('geo_chart'));
  chart.draw(mapData, options);
}

// Line Chart – Velocity over Time
function drawVelocityChart() {
  const data = currentPrefix === 'week1' ? getWeek1Data() : getWeek2Data();
  if (!data || data.getNumberOfRows() === 0) {
    document.getElementById('velocity_chart').innerHTML = '<p style="text-align: center; color: red;">No data available</p>';
    return;
  }

  const view = new google.visualization.DataView(data);
  view.setColumns([0, 4]); // Timestamp, Velocity (km/h)

  const maxPoints = Math.floor(1000 / zoomSettings.velocity.factor);
  const sampledData = sampleData(view, maxPoints);

  const velocityRange = view.getColumnRange(1);
  const options = {
    ...commonChartOptions,
    title: 'ISS Velocity Over Time',
    curveType: 'function',
    hAxis: {
      ...commonChartOptions.hAxis,
      title: 'Timestamp',
      format: 'MMM d HH:mm',
      gridlines: { count: 10 }
    },
    vAxis: {
      ...commonChartOptions.vAxis,
      title: 'Velocity (km/h)',
      gridlines: { count: 8 },
      viewWindow: {
        min: Math.max(velocityRange.min - (velocityRange.max - velocityRange.min) * 0.1 / zoomSettings.velocity.factor, 0),
        max: velocityRange.max + (velocityRange.max - velocityRange.min) * 0.1 * zoomSettings.velocity.factor
      }
    },
    colors: ['#43a047'],
    pointSize: 5,
    dataOpacity: 0.7,
    explorer: {
      actions: ['dragToZoom', 'rightClickToReset'],
      axis: 'horizontal',
      keepInBounds: true,
      maxZoomIn: 0.05,
      maxZoomOut: 20
    }
  };

  const chart = new google.visualization.LineChart(document.getElementById('velocity_chart'));
  chart.draw(sampledData, options);
}

// Pie Chart – Visibility Conditions
function drawVisibilityChart() {
  const data = currentPrefix === 'week1' ? getWeek1Data() : getWeek2Data();
  if (!data || data.getNumberOfRows() === 0) {
    document.getElementById('visibility_chart').innerHTML = '<p style="text-align: center; color: red;">No data available</p>';
    return;
  }

  const visibilityCounts = { visible: 0, eclipsed: 0, daylight: 0 };

  for (let i = 0; i < data.getNumberOfRows(); i++) {
    const vis = data.getValue(i, 5);
    if (visibilityCounts.hasOwnProperty(vis)) {
      visibilityCounts[vis]++;
    }
  }

  const visData = new google.visualization.DataTable();
  visData.addColumn('string', 'Visibility');
  visData.addColumn('number', 'Count');
  visData.addRows([
    ['Visible', visibilityCounts.visible],
    ['Eclipsed', visibilityCounts.eclipsed],
    ['Daylight', visibilityCounts.daylight]
  ]);

  const options = {
    title: 'ISS Visibility Conditions',
    is3D: true,
    width: 600,
    height: 400,
    chartArea: { width: '80%', height: '70%' },
    legend: { position: 'right', textStyle: { fontSize: 14 } },
    colors: ['#ffeb3b', '#000000', '#e53935'],
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 12 },
    animation: {
      startup: true,
      duration: 500,
      easing: 'out'
    }
  };

  const chart = new google.visualization.PieChart(document.getElementById('visibility_chart'));
  chart.draw(visData, options);
}

// Bar Chart – Number of Visible Passes per Day
function drawVisiblePassesChart() {
  const data = currentPrefix === 'week1' ? getWeek1Data() : getWeek2Data();
  if (!data || data.getNumberOfRows() === 0) {
    document.getElementById('visible_passes_chart').innerHTML = '<p style="text-align: center; color: red;">No data available</p>';
    return;
  }

  const passesByDay = {};

  for (let i = 0; i < data.getNumberOfRows(); i++) {
    if (data.getValue(i, 5) === 'visible') {
      const timestamp = data.getValue(i, 0);
      const date = timestamp.split(' ')[0] + ' ' + timestamp.split(' ')[1];
      passesByDay[date] = (passesByDay[date] || 0) + 1;
    }
  }

  const passesData = new google.visualization.DataTable();
  passesData.addColumn('string', 'Date');
  passesData.addColumn('number', 'Visible Passes');
  passesData.addRows(Object.entries(passesByDay));

  const options = {
    ...commonChartOptions,
    title: 'Number of Visible ISS Passes per Day',
    legend: { position: 'none' },
    hAxis: {
      ...commonChartOptions.hAxis,
      title: 'Date'
    },
    vAxis: {
      ...commonChartOptions.vAxis,
      title: 'Number of Visible Passes',
      gridlines: { count: 8 },
      viewWindow: { min: 0 }
    },
    colors: ['#8e24aa']
  };

  const chart = new google.visualization.ColumnChart(document.getElementById('visible_passes_chart'));
  chart.draw(passesData, options);
}

// Bar Chart – Visibility by Time of Day
function drawVisibilityBarChart() {
  const data = currentPrefix === 'week1' ? getWeek1Data() : getWeek2Data();
  if (!data || data.getNumberOfRows() === 0) {
    document.getElementById('visibility_heatmap').innerHTML = '<p style="text-align: center; color: red;">No data available</p>';
    return;
  }

  const hourlyCounts = {};

  for (let i = 0; i < data.getNumberOfRows(); i++) {
    const visibility = data.getValue(i, 5);
    if (visibility === 'visible') {
      const timestamp = data.getValue(i, 0); // e.g., "May 17 07:00 PM"
      const hourLabel = timestamp.split(' ')[2] + ' ' + timestamp.split(' ')[3]; // "07:00 PM"
      hourlyCounts[hourLabel] = (hourlyCounts[hourLabel] || 0) + 1;
    }
  }

  // Chronologically sort 12-hour times
  const orderedHours = Object.keys(hourlyCounts).sort((a, b) => {
    const parseHour = (t) => {
      const [time, ampm] = t.split(' ');
      let [hour] = time.split(':');
      hour = parseInt(hour, 10) % 12;
      return hour + (ampm === 'PM' ? 12 : 0);
    };
    return parseHour(a) - parseHour(b);
  });

  const chartData = new google.visualization.DataTable();
  chartData.addColumn('string', 'Hour');
  chartData.addColumn('number', 'Visible Passes');

  for (const hour of orderedHours) {
    chartData.addRow([hour, hourlyCounts[hour]]);
  }

  const options = {
    ...commonChartOptions,
    title: 'ISS Visibility by Time of Day (12-Hour EST)',
    hAxis: {
      ...commonChartOptions.hAxis,
      title: 'Time (EST)'
    },
    vAxis: {
      ...commonChartOptions.vAxis,
      title: 'Number of Visible Passes'
    },
    colors: ['#fbc02d'],
    bar: { groupWidth: '80%' }
  };

  const chart = new google.visualization.ColumnChart(document.getElementById('visibility_heatmap'));
  chart.draw(chartData, options);
}

// Summary Stats Table
function drawSummaryStatsTable() {
  const data = currentPrefix === 'week1' ? getWeek1Data() : getWeek2Data();
  if (!data || data.getNumberOfRows() === 0) {
    document.getElementById('summary_stats').innerHTML = '<p style="text-align: center; color: red;">No data available</p>';
    return;
  }

  const altitudes = [], velocities = [], visibilities = [];
  for (let i = 0; i < data.getNumberOfRows(); i++) {
    const alt = parseFloat(data.getValue(i, 3));
    const vel = parseFloat(data.getValue(i, 4));
    const vis = data.getValue(i, 5);

    if (!isNaN(alt)) altitudes.push(alt);
    if (!isNaN(vel)) velocities.push(vel);
    visibilities.push(vis);
  }

  const stats = {
    'Altitude (km)': [
      Math.max(...altitudes).toFixed(2),
      Math.min(...altitudes).toFixed(2),
      (altitudes.reduce((a, b) => a + b, 0) / altitudes.length).toFixed(2)
    ],
    'Velocity (km/h)': [
      Math.max(...velocities).toFixed(2),
      Math.min(...velocities).toFixed(2),
      (velocities.reduce((a, b) => a + b, 0) / velocities.length).toFixed(2)
    ],
    'Visible Passes': [
      visibilities.filter(v => v === 'visible').length.toString(),
      '-',
      '-'
    ]
  };

  const tableData = new google.visualization.DataTable();
  tableData.addColumn('string', 'Metric');
  tableData.addColumn('string', 'Max');
  tableData.addColumn('string', 'Min');
  tableData.addColumn('string', 'Average');
  tableData.addRows([
    ['Altitude (km)', ...stats['Altitude (km)']],
    ['Velocity (km/h)', ...stats['Velocity (km/h)']],
    ['Visible Passes', ...stats['Visible Passes']]
  ]);

  const options = {
    width: 600,
    height: 200,
    showRowNumber: false
  };

  const chart = new google.visualization.Table(document.getElementById('summary_stats'));
  chart.draw(tableData, options);
}
