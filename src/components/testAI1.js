// wildfire_predict.js

/**
 * Fetches four feature values via HTTP from a local API (which returns a flat JSON),
 * then sends a single-row CSV (with trailing newline) to a SageMaker real-time endpoint
 * using AWS SDK v3. Saves the prediction JSON into "prediction_result.json".
 */

import fs from "fs";
import path from "path";
import axios from "axios";

// v3 imports for SageMaker Runtime
import {
  SageMakerRuntimeClient,
  InvokeEndpointCommand
} from "@aws-sdk/client-sagemaker-runtime";

// ─── 1) Change to your real SageMaker endpoint name ─────────────────────────
const ENDPOINT_NAME = "canvas-fire-predict";

// ─── 2) Compute scriptDir (directory where this file lives) ────────────────
// Use import.meta.url to get this file’s location
const scriptDir = path.dirname(new URL(import.meta.url).pathname);

// ─── 3) Read latitude/longitude from src/components/currentCoord.json ──────
function readCoords() {
  // If wildfire_predict.js is in src/, then currentCoord.json is in src/components/
  const coordFile = path.resolve(scriptDir, "currentCoord.json");

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
async function fetchFromLocal(lat, lon) {
  const params = { lat, lon };

  try {
    const resp = await axios.get("http://127.0.0.1:5001/api/currentDataClimate", {
      params,
      timeout: 5000,
    });

    // Expecting payload like:
    // {
    //   result: {
    //     currentMaxTemp: 289.25,
    //     currentMinTemp: 285.63,
    //     currentPrecipitation: 40,
    //     currentWindSpeed: 2.06
    //   }
    // }
    const payload = resp.data;
    if (!payload.result) {
      throw new Error("Missing 'result' field in response");
    }
    const data = payload.result;

    const maxTemp       = Number(data.currentMaxTemp);
    const minTemp       = Number(data.currentMinTemp);
    const precipitation = Number(data.currentPrecipitation);
    const avgWindSpeed  = Number(data.currentWindSpeed);

    if ([maxTemp, minTemp, precipitation, avgWindSpeed].some(isNaN)) {
      throw new Error("One or more returned values cannot be converted to number");
    }

    return { minTemp, maxTemp, precipitation, avgWindSpeed };
  } catch (err) {
    console.error("Request to local API failed:", err.message || err);
    process.exit(1);
  }
}

// ─── 5) Invoke SageMaker endpoint using AWS SDK v3 ─────────────────────────
async function invokeSageMaker(minTemp, maxTemp, precipitation, avgWindSpeed) {
  // Build CSV payload
  const csvLine = `${minTemp},${maxTemp},${precipitation},${avgWindSpeed}\n`;
  const payload = Buffer.from(csvLine, "utf8");

  // Initialize SageMakerRuntimeClient (v3)
  const smrClient = new SageMakerRuntimeClient({
    region: process.env.AWS_REGION || "us-west-2"
  });

  const command = new InvokeEndpointCommand({
    EndpointName: ENDPOINT_NAME,
    ContentType: "text/csv",
    Body: payload,
    Accept: "application/json"
  });

  try {
    const response = await smrClient.send(command);
    // response.Body is a ReadableStream or Uint8Array
    const rawBody = await streamToString(response.Body);
    let result;
    try {
      result = JSON.parse(rawBody);
    } catch {
      console.error("Received non-JSON response from container:\n", rawBody);
      console.error(`Check CloudWatch logs for /aws/sagemaker/Endpoints/${ENDPOINT_NAME}`);
      process.exit(1);
    }
    return result;
  } catch (err) {
    console.error("Error invoking SageMaker endpoint:", err.message || err);
    console.error(`Check CloudWatch logs for /aws/sagemaker/Endpoints/${ENDPOINT_NAME}`);
    process.exit(1);
  }
}

// ─── 6) Helper to convert a ReadableStream / Uint8Array to string ─────────
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
async function main() {
  // Load coords from src/components/currentCoord.json
  const { latitude, longitude } = readCoords();

  // Fetch features
  const { minTemp, maxTemp, precipitation, avgWindSpeed } = await fetchFromLocal(
    latitude,
    longitude
  );

  // Invoke SageMaker
  const prediction = await invokeSageMaker(minTemp, maxTemp, precipitation, avgWindSpeed);

  // Print & save the prediction
  console.log("\nPrediction result:");
  console.log(JSON.stringify(prediction, null, 2));

  const outputFilename = path.resolve(scriptDir, "prediction_result.json");
  try {
    fs.writeFileSync(outputFilename, JSON.stringify(prediction, null, 2));
    console.log(`\nSaved prediction to '${outputFilename}'`);
  } catch (writeErr) {
    console.error("Failed to write prediction result to file:", writeErr);
    process.exit(1);
  }
}

main();
