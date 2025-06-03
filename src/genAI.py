import boto3
import json

bedrock_runtime = boto3.client('bedrock-runtime', region_name = 'us-west-2')

prompt = "My current AQI is 73, I have an average sized wildfire that is 100km from me. Give me a json that includes these keys: impacted AQI, description (of the impact), advice (for the impacted victims) as an array"

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
          {
            "type": "text",
            "text": prompt
          }
        ]
      }
    ]
  })
}

response = bedrock_runtime.invoke_model(**kwargs)

body = json.loads(response['body'].read())

print(body)