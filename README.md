# **ORBIT** – _Observing Real-time Behavior of ISS Trajectory_ 🌍🛰️

**API Project for CEN4930C – Seminar in Advanced Software Development**

---

## 📖 Overview

**ORBIT** is a real-time ISS tracking and visualization project that collects and analyzes satellite telemetry data to explore the global movement and visibility of the International Space Station.

The core research question:

> _“How often, and for how long, does the ISS pass over various regions of the Earth, and are there any observable patterns based on geography or time of day?”_

Using the [WhereTheISSAt](https://wheretheiss.at) API, data was gathered on a scheduled basis and visualized through interactive maps, line graphs, heatmaps, and 3D animations to uncover patterns in altitude, speed, and visibility across two collection periods.

---

## 🛰️ Key Features

- 14 days of real-time ISS data collection
- Two data resolutions: **30-minute** and **5-minute** intervals
- Interactive charts powered by **Google Charts**
- 3D and animated orbital visualizations using **three.js** and **Plotly**
- Clean, browser-based interface (HTML/JS/CSS)

---

## 🔧 Tech Stack

- **Python 3** – data collection & preprocessing
- **JavaScript + Google Charts** – data visualization
- **HTML/CSS** – presentation layer
- **three.js / Plotly** – 3D/animated orbit plots
- **Cron (macOS)** – automated interval-based scraping

---

## 🌐 API Used

**WhereTheISSAt**
[https://wheretheiss.at](https://wheretheiss.at)
Endpoint: `/v1/satellites/25544`

Returns live telemetry data, including:

- Latitude / Longitude
- Altitude (km)
- Velocity (km/h)
- Visibility (`daylight`, `eclipsed`, or `visible`)

---

## 📁 Project Structure

```
.
├── data/                       # Collected raw CSV data
│   ├── iss_30min_week1.csv
│   ├── iss_5min_week2.csv
│   └── unused.csv
├── logs/                       # Cron output logs
│   ├── cron_log_week1.txt
│   └── cron_log_week2.txt
├── requirements.txt            # Python dependencies
├── src/                        # Backend Python scripts & output
│   ├── collect_data.py
│   ├── convert_to_google_charts.py
│   └── output/
│       ├── week1_data.js
│       ├── week1_geo.js
│       ├── week1_velocity.js
│       ├── week1_visibility.js
│       ├── week2_data.js
│       ├── week2_geo.js
│       ├── week2_velocity.js
│       └── week2_visibility.js
└── view/                       # Frontend & visualizations
    ├── index.html
    ├── script.js
    ├── styles.css
    └── plots/
        ├── week1/
        │   ├── animated_trajectory.html
        │   └── interactive_3d_plot.html
        └── week2/
            ├── animated_trajectory.html
            └── interactive_3d_plot.html
```

---

## 📊 Visualizations

The `index.html` dashboard includes:

- 📈 **Line Charts** – Altitude and velocity over time
- 🗺️ **World Map** – ISS orbital path with visibility overlay
- 📅 **Bar Chart** – Number of visible passes per day
- 📊 **Summary Table** – Min, max, and average stats

### 🎥 3D / Animated Views

Use the **"Interactive 3D Plot"** and **"Animated Trajectory"** toggles for:

- 3D orbital view with altitude contours (via Plotly)
- Realistic animated ISS orbit in 3D space (via three.js)

These are dynamically displayed based on the selected dataset (Week 1 or Week 2).

---

## 🕒 Data Collection Details

- **Week 1**: Every 30 minutes (337 data points)

- **Week 2**: Every 5 minutes (2016 data points)

- Scheduler: macOS `cron`

- Collector: `src/collect_data.py`

- Output Format: CSV

### Logged Fields:

- Timestamp (UTC)
- Latitude & Longitude
- Altitude (km)
- Velocity (km/h)
- Visibility (status)

---

## ⚠️ Data Integrity Note

- One data point during **Week 2** (June 1, 2025 at 10:05 UTC) was not recorded due to a temporary DNS resolution error when querying the live API.
- This resulted in a **single 5-minute gap** in the dataset.
- See lines 1807-1808 in both the Week 2 [cron log](./logs/cron_log_week2.txt) and [CSV](./data/iss_5min_week2.csv) for evidence of the error.
- All other scheduled intervals were successfully recorded.
- This type of minor data loss is a known challenge in real-time data collection and does not significantly impact the overall analysis.

---

## 📌 Usage

To view the dashboard:

1. Navigate to the `view/` directory.
2. Open `index.html` in a modern browser.
3. Use the dropdown to switch between Week 1 and Week 2.
4. Click on the "Interactive 3D Plot" or "Animated Trajectory" to open additional orbit visualizations.
