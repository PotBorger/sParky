#!/usr/bin/env node

/**
 * Fetches four feature values via HTTP from a local API,
 * computes avgTemp = (minTemp + maxTemp)/2, then sends [avgTemp, precipitation, avgWindSpeed]
 * as a single-row CSV to a SageMaker real-time endpoint (AWS SDK v3).
 * Logs every step and prints only the predicted radius value to the console.
 */

import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
import {
  SageMakerRuntimeClient,
  InvokeEndpointCommand,
} from "@aws-sdk/client-sagemaker-runtime";

// ─── 1) SageMaker endpoint name ─────────────────────────────────────────────
const ENDPOINT_NAME = "canvas-new-deployment-06-05-2025-10-59-AM";

// ─── 2) Resolve __dirname in ESM ─────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── 3) Read latitude/longitude from currentCoord.json ──────────────────────
function readCoords() {
  // Absolute path to currentCoord.json
  const coordFile = "/Users/thanhle/Documents/sParky/currentCoord.json";
  if (!fs.existsSync(coordFile)) {
    console.error(`Error: '${coordFile}' not found.`);
    process.exit(1);
  }

  let raw;
  try {
    raw = fs.readFileSync(coordFile, "utf8");
  } catch (err) {
    console.error("Error reading 'currentCoord.json':", err);
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Error parsing 'currentCoord.json':", err);
    process.exit(1);
  }

  const { currentLat, currentLon } = parsed;
  if (typeof currentLat !== "number" || typeof currentLon !== "number") {
    console.error(
      "Invalid coordinates in 'currentCoord.json'. Expect numeric currentLat and currentLon."
    );
    process.exit(1);
  }

  return { latitude: currentLat, longitude: currentLon };
}

// ─── 4) Fetch feature values from local API ─────────────────────────────────
async function fetchWeatherInfo(lat, lon) {
  const params = { lat, lon };
  try {
    const resp = await axios.get(
      "http://127.0.0.1:5001/api/currentDataClimate",
      {
        params,
        timeout: 5000,
      }
    );

    const payload = resp.data;
    if (!payload.result) {
      throw new Error("Missing 'result' field in response");
    }
    const data = payload.result;

    const maxTemp = (5 / 9) * (Number(data.currentMaxTemp) - 32);
    const minTemp = (5 / 9) * (Number(data.currentMinTemp) - 32);
    const precipitation = Number(data.currentPrecipitation);
    const avgWindSpeed = Number(data.currentWindSpeed) / 3.6;

    if ([maxTemp, minTemp, precipitation, avgWindSpeed].some(isNaN)) {
      throw new Error(
        "One or more returned values cannot be converted to number"
      );
    }

    return { minTemp, maxTemp, precipitation, avgWindSpeed };
  } catch (err) {
    console.error("Request to local API failed:", err.message || err);
    process.exit(1);
  }
}

// ─── 5) Invoke SageMaker endpoint (avgTemp, precipitation, avgWindSpeed) ────
async function invokeSageMaker(avgTemp, precipitation, avgWindSpeed) {
  const csvLine = `${avgTemp},${precipitation},${avgWindSpeed}\n`;
  const payload = Buffer.from(csvLine, "utf8");

  const smrClient = new SageMakerRuntimeClient({
    region: process.env.AWS_REGION || "us-west-2",
  });

  const command = new InvokeEndpointCommand({
    EndpointName: ENDPOINT_NAME,
    ContentType: "text/csv",
    Body: payload,
    Accept: "application/json",
  });

  try {
    const response = await smrClient.send(command);
    const rawBody = await streamToString(response.Body);

    let result;
    try {
      result = JSON.parse(rawBody);
    } catch {
      console.error("Received non-JSON response from container:\n", rawBody);
      console.error(
        `Check CloudWatch logs for /aws/sagemaker/Endpoints/${ENDPOINT_NAME}`
      );
      process.exit(1);
    }
    return result;
  } catch (err) {
    console.error("Error invoking SageMaker endpoint:", err.message || err);
    console.error(
      `Check CloudWatch logs for /aws/sagemaker/Endpoints/${ENDPOINT_NAME}`
    );
    process.exit(1);
  }
}

// ─── 6) Helper: convert ReadableStream or Uint8Array to string ─────────────
async function streamToString(stream) {
  if (stream instanceof Uint8Array) {
    return Buffer.from(stream).toString("utf8");
  }
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

// ─── 7) Main execution ───────────────────────────────────────────────────────
export default async function runPredictWildfireRadius(fireLon, fireLat) {
  console.log(">>> Starting wildfire-radius prediction script... <<<");

  // 1) Read coords
  const latitude = fireLat;
  const longitude = fireLon;
  console.log(`Coordinates: lat=${latitude}, lon=${longitude}`);

  // 2) Fetch features
  const { minTemp, maxTemp, precipitation, avgWindSpeed } =
    await fetchWeatherInfo(latitude, longitude);

  // 3) Compute avgTemp
  const avgTemp = (minTemp + maxTemp) / 2;
  // console.log(`Computed avgTemp = ${avgTemp}`);

  // 4) Invoke SageMaker
  const prediction = await invokeSageMaker(
    avgTemp,
    precipitation,
    avgWindSpeed
  );

  // 5) Extract and log only the numeric prediction value
  //    (Assuming the response JSON contains a field "predicted_label")
  if (prediction.predicted_label !== undefined) {
    console.log("Predicted wildfire radius:", prediction.predicted_label);
  } else {
    console.log("Predicted wildfire radius (full response):", prediction);
  }

  return prediction;
}
