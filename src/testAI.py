#!/usr/bin/env python3
"""
wildfire_predict_test_fixed.py

Prompts for four feature values, then sends a single-row CSV (with a trailing newline)
to a SageMaker real-time endpoint. If the container still 500s, check CloudWatch for the full stack trace.
"""

import boto3
import json
import sys
import requests
import os

def fetch_from_local(lat, lon):
    params = {
        "lat": lat,
        "lon": lon
    }

    try:
        resp = requests.get("http://localhost:5001/api/currentDataClimate", params=params, timeout=5)
        resp.raise_for_status()
        payload = resp.json()

        data = payload["result"]

        max_temp = float(data["currentMaxTemp"])
        min_temp = float(data["currentMinTemp"])
        precipitation = float(data["currentPrecipitation"])
        avg_wind_speed = float(data["currentWindSpeed"])

        return min_temp, max_temp, precipitation, avg_wind_speed
    
    except requests.RequestException as e:
        print("Request to local API failed:", e)
        sys.exit(1)
    except (KeyError, ValueError) as e:
        print("Unexpected response structure or invalid data:", e)
        print("Full payload:", payload)
        sys.exit(1)



def main():
    # ─── 1) Change this to your real endpoint name ──────────────────────────────────
    endpoint_name = "canvas-fire-predict"
    coord_file = "currentCoord.json"
    # if not os.path.isFile(coord_file):
    #     print(f"Error: '{coord_file}' not found in the current directory.")
    #     sys.exit(1)
    try:
        with open(coord_file, "r") as f:
           coords = json.load(f)
        latitude  = float(coords["currentLat"])
        longitude = float(coords["currentLon"])
    except (json.JSONDecodeError, KeyError, ValueError) as e:
        print(f"Error parsing '{coord_file}':", e)
        sys.exit(1)

    min_temp, max_temp, precipitation, avg_wind_speed = fetch_from_local(latitude, longitude)

    # ─── 3) Build a CSV payload with a trailing newline ─────────────────────────────
    #     (No header row. Order must exactly match the four training columns.)
    csv_line = f"{min_temp},{max_temp},{precipitation},{avg_wind_speed}\n"
    payload = csv_line.encode("utf-8")

    # ─── 4) Invoke the endpoint ─────────────────────────────────────────────────────
    client = boto3.client("runtime.sagemaker")
    try:
        response = client.invoke_endpoint(
            EndpointName=endpoint_name,
            ContentType="text/csv",
            Body=payload,
            Accept="application/json"
        )
    except Exception as e:
        # If you still see a 500, it will surface here.
        print(f"Error invoking endpoint: {e}")
        print("Check CloudWatch logs for `/aws/sagemaker/Endpoints/{}`".format(endpoint_name))
        sys.exit(1)

    # ─── 5) Decode and parse the JSON response ───────────────────────────────────────
    raw_body = response["Body"].read().decode("utf-8")
    try:
        result = json.loads(raw_body)
    except json.JSONDecodeError:
        print("Received non-JSON response from container:")
        print(raw_body)
        print("Again, check CloudWatch logs for `/aws/sagemaker/Endpoints/{}`".format(endpoint_name))
        sys.exit(1)

    # ─── 6) Print the prediction JSON ───────────────────────────────────────────────
    print("\n Prediction result:")
    print(json.dumps(result, indent=4))

    output_filename = "prediction_result.json"
    with open(output_filename, "w") as fp:
        json.dump(result, fp, indent=4)

    print(f"\nSaved")


if __name__ == "__main__":
    main()
