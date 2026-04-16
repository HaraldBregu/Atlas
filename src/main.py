from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

client = OpenAI()

# 2. Simulated function implementation
def get_weather(city):
    # In real life, call an API here
    return f"The weather in {city} is sunny and 22°C"


def main() -> None:
    tools = [
        {"type": "web_search"},
        {
            "type": "function",
            "name": "get_weather",
            "description": "Get current weather for a city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "Name of the city",
                    }
                },
                "required": ["city"],
            },
        },
    ]

    # First call — model may invoke function tools
    response = client.responses.create(
        model="gpt-4o",
        tools=tools,
        input="What's the weather in Paris?",
    )

    # Check if model called get_weather, execute it, send result back
    for item in response.output:
        if item.type == "function_call" and item.name == "get_weather":
            import json
            args = json.loads(item.arguments)
            result = get_weather(args["city"])

            print(f">>> [TOOL] get_weather({args['city']}) -> {result}", flush=True)

            # Send function result back, stream the final answer
            followup = client.responses.create(
                model="gpt-4o",
                tools=tools,
                input=[
                    {"type": "message", "role": "user", "content": "What's the weather in Paris?"},
                    item,
                    {
                        "type": "function_call_output",
                        "call_id": item.call_id,
                        "output": result,
                    },
                ],
                stream=True,
            )

            for event in followup:
                if event.type == "response.output_text.delta":
                    print(event.delta, end="", flush=True)

            print()
            return

    # No function call — stream text directly (e.g. web_search handled internally)
    for item in response.output:
        if hasattr(item, "text"):
            print(item.text)

    print()


if __name__ == "__main__":
    main()
