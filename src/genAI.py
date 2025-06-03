import os
import boto3
import json

# Determine the directory where this script resides
script_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(script_dir, "response.json")

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

# Extract the AI's text response
ai_text = body["content"][0]["text"]

try:
    # Parse the AI's response as JSON
    ai_json = json.loads(ai_text)
    
    # If the file already exists, remove it so we start fresh
    if os.path.exists(output_path):
        os.remove(output_path)
    
    # Save only the AI's JSON response
    with open(output_path, "w") as f:
        json.dump(ai_json, f, indent=2)
    
    print(f"Wrote AI JSON response to: {output_path}")
    print(json.dumps(ai_json, indent=2))
    
except json.JSONDecodeError as e:
    print(f"Error parsing AI response as JSON: {e}")
    print(f"AI response was: {ai_text}")
    
    # Fallback: save the raw AI text for debugging
    fallback_path = os.path.join(script_dir, "ai_response_raw.txt")
    with open(fallback_path, "w") as f:
        f.write(ai_text)
    print(f"Saved raw AI response to: {fallback_path}")