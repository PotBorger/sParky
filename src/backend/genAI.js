// SPARKY/src/genAI.js

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------------------------
// 1) Load latitude and longitude from currentCoords.js
// -------------------------------------------------------------------
async function loadCoordinates() {
  const scriptDir = __dirname;
  const coordsPath = path.join(
    scriptDir,
    "..",
    "components",
    "currentCoord.json"
  );

  try {
    const coordsData = await fs.readFile(coordsPath, "utf8");
    const coords = JSON.parse(coordsData);

    const latitude = coords.currentLat?.toString();
    const longitude = coords.currentLon?.toString();

    if (!latitude || !longitude) {
      throw new Error(
        "Both 'currentLat' and 'currentLon' must be present in currentCoords.js"
      );
    }

    return { latitude, longitude };
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`File not found at ${coordsPath}`);
    } else if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${coordsPath}: ${error.message}`);
    } else {
      throw new Error(
        `Error loading coordinates from ${coordsPath}: ${error.message}`
      );
    }
  }
}

// -------------------------------------------------------------------
// 2) Query your backend for the current AQI
// -------------------------------------------------------------------
async function fetchCurrentAQI(latitude, longitude) {
  const backendUrl = `http://localhost:5001/api/currentAQ?lat=${latitude}&lon=${longitude}`;

  try {
    const response = await axios.get(backendUrl);
    const data = response.data;

    const aqiValue = data.result?.currentAQI;
    if (aqiValue === undefined || aqiValue === null) {
      throw new Error(
        `'currentAQI' field missing in backend response: ${JSON.stringify(
          data
        )}`
      );
    }

    return aqiValue;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Failed to fetch AQI from backend: HTTP ${error.response.status} - ${error.response.statusText}`
      );
    } else if (error.request) {
      throw new Error(`Failed to fetch AQI from backend: No response received`);
    } else {
      throw new Error(`Failed to fetch AQI from backend: ${error.message}`);
    }
  }
}

// -------------------------------------------------------------------
// 3) Build the prompt for Bedrock
// -------------------------------------------------------------------
function buildPrompt(aqiValue, distanceToFire, fireRadius) {
  return (
    `My current AQI is ${aqiValue} and there is a wildfire with ${fireRadius} square kilometre being ${distanceToFire} km away from me. ` +
    "Take all the provided information, give me a prediction about the effect of the wildfire and return only a JSON object (no extra text) with exactly these keys:\n" +
    "the impacted AQI here should mean how much my current (location) AQI is affected by the occurrence of the wildfire based on the provided distance and the radius of the fire. If the impact is insignificant, the returned impacted AQI should be equal to my current AQI and should not be lowered) \n" +
    '  • "impactedAQI"(numeric, from 1-5 inclusive,\n' +
    '  • "description": (string describing the impact),\n' +
    '  • "advice": (array of strings with recommendations for affected people).\n' +
    "For example:\n" +
    "{\n" +
    '  "impactedAQI": 3,\n' +
    '  "description": "Moderate air quality deterioration due to smoke.",\n' +
    '  "advice": [\n' +
    '    "Limit outdoor activities.",\n' +
    '    "Wear an N95 mask if you go outside.",\n' +
    '    "Keep windows closed and use an air purifier."\n' +
    "  ]\n" +
    "}\n"
  );
}

// -------------------------------------------------------------------
// 4) Prepare and invoke the Bedrock model
// -------------------------------------------------------------------
async function invokeBedrockModel(prompt) {
  const bedrockClient = new BedrockRuntimeClient({ region: "us-west-2" });

  const bodyPayload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 200,
    top_k: 250,
    temperature: 1,
    top_p: 0.999,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-5-haiku-20241022-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(bodyPayload),
  });

  try {
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const aiText = responseBody.content[0].text;
    const aiJson = JSON.parse(aiText);

    return aiJson;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`Error parsing AI response as JSON: ${error.message}`);
      console.error(`AI response was: ${error.context || "Unknown"}`);

      // Fallback: save raw AI response
      const fallbackPath = path.join(__dirname, "ai_response_raw.txt");
      await fs.writeFile(fallbackPath, error.context || "Unknown response");
      console.error(`Saved raw AI response to: ${fallbackPath}`);
      throw error;
    } else {
      throw new Error(`Bedrock invocation failed: ${error.message}`);
    }
  }
}

// -------------------------------------------------------------------
// 5) Write the AI response to public/response.json
// -------------------------------------------------------------------
async function saveResponse(aiJson) {
  const scriptDir = __dirname;
  const outputPath = path.resolve(
    path.join(scriptDir, "..", "components", "response.json")
  );

  try {
    // Remove old response.json if it exists
    try {
      await fs.access(outputPath);
      await fs.unlink(outputPath);
    } catch (error) {
      // File doesn't exist, which is fine
    }

    // Write the new AI JSON
    await fs.writeFile(outputPath, JSON.stringify(aiJson, null, 2));

    console.log(`Wrote AI JSON response to: ${outputPath}`);
    console.log(JSON.stringify(aiJson, null, 2));
  } catch (error) {
    throw new Error(`Error writing response file: ${error.message}`);
  }
}

// -------------------------------------------------------------------
// Main execution function - returns result instead of exiting
// -------------------------------------------------------------------
export default async function generateWildfireImpact(
  currentLon,
  currentLat,
  distanceToFire,
  fireRadius
) {
  try {
    console.log("Starting wildfire impact analysis...");

    // Load coordinates
    console.log("📍 Loading coordinates...");
    const latitude = currentLat;
    const longitude = currentLon;

    // Fetch current AQI
    console.log("Fetching current AQI...");
    const aqiValue = await fetchCurrentAQI(latitude, longitude);

    // Build prompt
    console.log(" Generating AI analysis...");
    const prompt = buildPrompt(aqiValue, distanceToFire, fireRadius);

    // Invoke AI model
    const resultJson = await invokeBedrockModel(prompt);
    // Save response
    // console.log("💾 Saving response...");
    // await saveResponse(aiJson);
    // console.log(" Wildfire impact analysis completed successfully!");
    return resultJson;
  } catch (error) {
    console.error(`Error in wildfire impact analysis: ${error.message}`);
    return {
      success: false,
      error: error.message,
      message: "Analysis failed",
    };
  }
}

// Legacy main function for backward compatibility
// export async function main() {
//   const result = await generateWildfireImpact();
//   if (!result.success) {
//     process.exit(1);
//   }
// }

// Run the main function only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export individual functions for testing/modularity
export {
  loadCoordinates,
  fetchCurrentAQI,
  buildPrompt,
  invokeBedrockModel,
  saveResponse,
};
