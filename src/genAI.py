# genAI.py (located in SPARKY/src/genAI.py)

import os
import boto3
import json

# Determine the directory where this script resides (SPARKY/src)
script_dir = os.path.dirname(os.path.abspath(__file__))

# Point to SPARKY/public/response.json (one level up from script_dir)
output_path = os.path.abspath(os.path.join(script_dir, "..", "public", "response.json"))

bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-west-2")

prompt = (
    "My current AQI is 73, I have an average sized wildfire that is 100km from me. "
    "Give me a json that includes these keys: impacted AQI, description (of the impact), "
    "advice (for the impacted victims) as an array. Return only valid JSON, no other text."
)

kwargs = {
    "modelId": "anthropic.claude-3-5-haiku-20241022-v1:0",
    "contentType": "application/json",
    "accept": "application/json",
    "body": json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 200,
        "top_k": 250,
        "temperature": 1,
        "top_p": 0.999,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt}
                ]
            }
        ]
    })
}

response = bedrock_runtime.invoke_model(**kwargs)
body = json.loads(response["body"].read())
ai_text = body["content"][0]["text"]

try:
    ai_json = json.loads(ai_text)

    # If an old response.json exists in public/, remove it
    if os.path.exists(output_path):
        os.remove(output_path)

    # Write the new AI-generated JSON into public/response.json
    with open(output_path, "w") as f:
        json.dump(ai_json, f, indent=2)

    print(f"Wrote AI JSON response to: {output_path}")
    print(json.dumps(ai_json, indent=2))

except json.JSONDecodeError as e:
    print(f"Error parsing AI response as JSON: {e}")
    print(f"AI response was: {ai_text}")

    # Fallback: write raw text to src/ai_response_raw.txt
    fallback_path = os.path.join(script_dir, "ai_response_raw.txt")
    with open(fallback_path, "w") as f:
        f.write(ai_text)
    print(f"Saved raw AI response to: {fallback_path}")
