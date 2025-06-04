// genAI.js (place this file alongside SPARKY/src/genAI.js)

import fs from "fs";
import path from "path";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Determine directory where this script resides (SPARKY/src)
const scriptDir = path.dirname(new URL(import.meta.url).pathname);

// Compute path to SPARKY/public/response.json (one level up from scriptDir)
const outputPath = path.resolve(scriptDir, "..", "public", "response.json");

// Initialize Bedrock Runtime client (AWS SDK v3)
const bedrockClient = new BedrockRuntimeClient({
  region: "us-west-2",
});

async function runPromptAndWriteOutput() {
  // The prompt you want to send:
  const prompt = `My current AQI is 73, I have an average sized wildfire that is 100km from me. \
Give me a json that includes these keys: impacted AQI, description (of the impact), advice (for the impacted victims) as an array. \
Return only valid JSON, no other text.`;

  // Build the invokeModel input parameters (mirroring the Python kwargs)
  const invokeParams = {
    modelId: "anthropic.claude-3-5-haiku-20241022-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
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
    }),
  };

  try {
    // Invoke the model
    const command = new InvokeModelCommand(invokeParams);
    const response = await bedrockClient.send(command);

    // Read and parse the response body
    const rawBody = await streamToString(response.body);
    const bodyObj = JSON.parse(rawBody);
    // Claude returns content as an array; extract the first "text" field:
    const aiText = bodyObj.content?.[0]?.text;

    if (!aiText) {
      throw new Error("No 'content[0].text' found in Bedrock response");
    }

    // Attempt to parse the AI-generated text as JSON
    let aiJson;
    try {
      aiJson = JSON.parse(aiText);
    } catch (jsonErr) {
      console.error("Error parsing AI response as JSON:", jsonErr);
      console.error("AI raw response was:", aiText);

      // Fallback: write raw text to src/ai_response_raw.txt
      const fallbackPath = path.join(scriptDir, "ai_response_raw.txt");
      fs.writeFileSync(fallbackPath, aiText, "utf8");
      console.log(`Saved raw AI response to: ${fallbackPath}`);
      return;
    }

    // If an old response.json exists in public/, remove it
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    // Write the new AI-generated JSON into public/response.json
    fs.writeFileSync(outputPath, JSON.stringify(aiJson, null, 2), "utf8");
    console.log(`Wrote AI JSON response to: ${outputPath}`);
    console.log(JSON.stringify(aiJson, null, 2));
  } catch (err) {
    console.error("Error invoking Bedrock model or writing output:", err);
  }
}

// Helper function to convert a ReadableStream / Readable to string
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

// Run the main logic
runPromptAndWriteOutput();
