import csv
import os
from datetime import datetime, timedelta

def convert_utc_to_et(utc_str):
    dt_utc = datetime.strptime(utc_str, "%Y-%m-%d %H:%M:%S")
    dt_et = dt_utc - timedelta(hours=5)
    day = dt_et.day
    return dt_et.strftime(f"%b {day} %I:%M %p")

def csv_to_google_chart_array(csv_path, output_js_path, var_name):
    with open(csv_path, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    with open(output_js_path, 'w') as jsfile:
        func_name = f"get{var_name[0].upper() + var_name[1:]}"
        jsfile.write(f"function {func_name}() {{\n")
        jsfile.write("  return google.visualization.arrayToDataTable([\n")
        
        # Write headers
        headers = list(rows[0].keys())
        jsfile.write('    ["' + '","'.join(headers) + '"],\n')
        
        # Write data rows
        for row in rows:
            formatted_row = []
            for i, (key, val) in enumerate(row.items()):
                val = val.strip()
                if key == 'timestamp':
                    val = convert_utc_to_et(val)
                try:
                    float_val = float(val)
                    formatted_row.append(val)
                except ValueError:
                    formatted_row.append(f'"{val}"')
            line = "    [" + ", ".join(formatted_row) + "]"
            jsfile.write(line + ",\n")

        jsfile.write("  ]);\n")
        jsfile.write("}\n")

    print(f"✅ Converted {csv_path} → {output_js_path}")

def generate_geo_chart_js(csv_path, output_js_path, var_name):
    with open(csv_path, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    with open(output_js_path, 'w') as jsfile:
        func_name = f"get{var_name[0].upper() + var_name[1:]}"
        jsfile.write(f"function {func_name}() {{\n")
        jsfile.write("  return google.visualization.arrayToDataTable([\n")
        jsfile.write('    ["Lat", "Lng", "Name", "Altitude"],\n')  # Fixed header format
        
        for row in rows:
            time_et = convert_utc_to_et(row['timestamp'])
            # Format: [latitude, longitude, tooltip, altitude]
            line = f'    [{row["latitude"]}, {row["longitude"]}, "Position at {time_et}", {row["altitude_km"]}],'
            jsfile.write(line + "\n")

        jsfile.write("  ]);\n")
        jsfile.write("}\n")

    print(f"✅ Generated GeoChart data: {csv_path} → {output_js_path}")

def generate_visibility_piechart_js(csv_path, output_js_path, var_name):
    with open(csv_path, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)
    
    visibility_counts = {}
    for row in rows:
        vis = row['visibility']
        visibility_counts[vis] = visibility_counts.get(vis, 0) + 1
    
    with open(output_js_path, 'w') as jsfile:
        func_name = f"get{var_name[0].upper() + var_name[1:]}"
        jsfile.write(f"function {func_name}() {{\n")
        jsfile.write("  return google.visualization.arrayToDataTable([\n")
        jsfile.write('    ["Visibility", "Count"],\n')
        
        for vis, count in visibility_counts.items():
            jsfile.write(f'    ["{vis}", {count}],\n')
        
        jsfile.write("  ]);\n")
        jsfile.write("}\n")

    print(f"✅ Generated Visibility PieChart data: {csv_path} → {output_js_path}")

def generate_velocity_chart_js(csv_path, output_js_path, var_name):
    with open(csv_path, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    with open(output_js_path, 'w') as jsfile:
        func_name = f"get{var_name[0].upper() + var_name[1:]}"
        jsfile.write(f"function {func_name}() {{\n")
        jsfile.write("  return google.visualization.arrayToDataTable([\n")
        jsfile.write('    ["Time", "Velocity (km/h)"],\n')
        
        for row in rows:
            time_et = convert_utc_to_et(row['timestamp'])
            jsfile.write(f'    ["{time_et}", {row["velocity_kmph"]}],\n')
        
        jsfile.write("  ]);\n")
        jsfile.write("}\n")

    print(f"✅ Generated Velocity Chart data: {csv_path} → {output_js_path}")

# Create output directory if it doesn't exist
os.makedirs("output_js", exist_ok=True)

# Process both datasets
datasets = [
    ("../data/iss_30min_week1.csv", "week1"),
    ("../data/iss_5min_week2.csv", "week2")
]

for csv_path, prefix in datasets:
    csv_to_google_chart_array(csv_path, f"output_js/{prefix}_data.js", f"{prefix}Data")
    generate_geo_chart_js(csv_path, f"output_js/{prefix}_geo.js", f"{prefix}Geo")
    generate_visibility_piechart_js(csv_path, f"output_js/{prefix}_visibility.js", f"{prefix}Visibility")
    generate_velocity_chart_js(csv_path, f"output_js/{prefix}_velocity.js", f"{prefix}Velocity")