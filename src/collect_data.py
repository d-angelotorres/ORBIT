import requests
import csv
import os
from datetime import datetime, UTC

# API endpoint
API_URL = "https://api.wheretheiss.at/v1/satellites/25544"

# Output file
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../data/iss_5min_week2.csv")

def fetch_iss_data():
    try:
        response = requests.get(API_URL)
        response.raise_for_status()
        data = response.json()
        return {
            "timestamp": datetime.fromtimestamp(data["timestamp"], UTC).strftime('%Y-%m-%d %H:%M:%S'),
            "latitude": data["latitude"],
            "longitude": data["longitude"],
            "altitude_km": data["altitude"],
            "velocity_kmph": data["velocity"],
            "visibility": data["visibility"]
        }
    except requests.RequestException as e:
        print(f"❌ Failed to fetch ISS data: {e}")
        return None

def save_to_csv(entry):
    file_exists = os.path.isfile(OUTPUT_FILE)

    with open(OUTPUT_FILE, mode='a', newline='') as csv_file:
        fieldnames = ["timestamp", "latitude", "longitude", "altitude_km", "velocity_kmph", "visibility"]
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

        if not file_exists:
            writer.writeheader()

        writer.writerow(entry)

    print(f"✅ Logged ISS data at {entry['timestamp']}")

def main():
    data = fetch_iss_data()
    if data:
        save_to_csv(data)
    else:
        print("⚠️ No data fetched.")

if __name__ == "__main__":
    main()
