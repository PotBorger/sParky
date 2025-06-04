#!/usr/bin/env python3
"""
wildfire_predict_test_fixed.py

Prompts for four feature values, then sends a single-row CSV (with a trailing newline)
to a SageMaker real-time endpoint. If the container still 500s, check CloudWatch for the full stack trace.
"""

import boto3
import json
import sys

def main():
    # ─── 1) Change this to your real endpoint name ──────────────────────────────────
    endpoint_name = "canvas-fire-predict"

    # ─── 2) Prompt for four float inputs ───────────────────────────────────────────
    try:
        min_temp        = float(input("Enter MIN_TEMP (e.g. 45.0): ").strip())
        max_temp        = float(input("Enter MAX_TEMP (e.g. 75.0): ").strip())
        precipitation   = float(input("Enter PRECIPITATION (e.g. 0.12): ").strip())
        avg_wind_speed  = float(input("Enter AVG_WIND_SPEED (e.g. 5.5): ").strip())
    except ValueError:
        print("⛔ Invalid input: please enter valid numeric values.")
        sys.exit(1)

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
        print(f"⛔ Error invoking endpoint: {e}")
        print("Check CloudWatch logs for `/aws/sagemaker/Endpoints/{}`".format(endpoint_name))
        sys.exit(1)

    # ─── 5) Decode and parse the JSON response ───────────────────────────────────────
    raw_body = response["Body"].read().decode("utf-8")
    try:
        result = json.loads(raw_body)
    except json.JSONDecodeError:
        print("⛔ Received non-JSON response from container:")
        print(raw_body)
        print("Again, check CloudWatch logs for `/aws/sagemaker/Endpoints/{}`".format(endpoint_name))
        sys.exit(1)

    # ─── 6) Print the prediction JSON ───────────────────────────────────────────────
    print("\n✅ Prediction result:")
    print(json.dumps(result, indent=4))


if __name__ == "__main__":
    main()
