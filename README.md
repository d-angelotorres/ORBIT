# **ORBIT** – _Observing Real-time Behavior of ISS Trajectory_ 🌍🛰️

**API Project for CEN4930C – Seminar in Advanced Software Development**

---

## 📖 Overview

**ORBIT** is a real-time ISS tracking project that collects location data at scheduled intervals to analyze the satellite's global flyover behavior.

The primary objective is to answer the question:

> _“How often, and for how long, does the International Space Station (ISS) pass over various parts of the Earth, and are there any observable patterns related to time of day or duration?”_

Data is collected using the [WhereTheISSAt](https://wheretheiss.at) API, stored locally, and analyzed to uncover geographic and temporal patterns. The project includes data visualization through graphs, heatmaps, and histograms.

---

## 🔧 Tech Stack

- **Python 3**
- **Pandas** – data handling and analysis
- **Matplotlib** – plotting and chart generation
- **Reverse Geopy** – reverse geolocation (lat/lon → country)
- **PyCountry** – country name standardization and validation
- **Cron (macOS)** – scheduled data collection automation

---

## 🌐 API Used

[**WhereTheISSAt**](https://wheretheiss.at)
Endpoint: `https://api.wheretheiss.at/v1/satellites/25544`

Provides real-time ISS telemetry including:

- Latitude / Longitude
- Altitude (km)
- Velocity (km/h)
- Visibility (daylight / night)

---

## 📁 Project Structure

```
.
├── data/
│   ├── iss_30min_week1.csv      # 30-minute interval data (Week 1)
│   ├── iss_5min_week2.csv       # 5-minute interval data (Week 2)
│   └── unused.csv               # Extra/out-of-scope data (not used in analysis)
│
├── logs/                        # Output logs from cron jobs
│   ├── cron_log_week1.txt
│   └── cron_log_week2.txt
│
├── plots/                       # Generated visualizations
│   ├── week1/
│   └── week2/
│
├── src/
│   ├── analyze.py               # Data analysis & visualization
│   └── collect_data.py          # API queries and data logging
│
├── .gitignore
├── requirements.txt
└── README.md

```

---

## 🕒 Data Collection

- **Frequency**:

  - Every 30 minutes (Week 1)
  - Every 5 minutes (Week 2)

- **Tool**: `cron` scheduler (macOS)

- **Script**: `src/collect_data.py`

- **Output**: Appends entries to `data/*.csv`

### Logged Fields:

- Timestamp (human-readable)
- Latitude & Longitude
- Altitude (km)
- Velocity (km/h)
- Visibility (daylight/night)

---

### ⚠️ Notes on Data Integrity

- One data point during **Week 2** (June 1, 2025 at 10:05 UTC) was not recorded due to a temporary DNS resolution error when querying the live API.
- This resulted in a **single 5-minute gap** in the dataset.
- See lines 1807-1808 in both the Week 2 [cron log](./logs/cron_log_week2.txt) and [CSV](./data/iss_5min_week2.csv) for evidence of the error.
- All other scheduled intervals were successfully recorded.
- This type of minor data loss is a known challenge in real-time data collection and does not significantly impact the overall analysis.

---
