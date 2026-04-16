from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

client = OpenAI()


def main() -> None:
    response = client.responses.create(
        model="gpt-4o",
        tools=[
            {"type": "web_search"},
            {
                "type": "function",
                "name": "get_weather",
                "description": "Get current weather for a given location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string", "description": "City name"},
                    },
                    "required": ["location"],
                },
            },
        ],
        input="What is the situation in Ukraine right now?",
        stream=True,
    )

    for event in response:
        if event.type == "response.web_search_call.in_progress":
            print(f">>> [TOOL] web_search started", flush=True)
        elif event.type == "response.web_search_call.searching":
            print(f">>> [TOOL] searching...", flush=True)
        elif event.type == "response.web_search_call.completed":
            print(f">>> [TOOL] web_search done\n", flush=True)
        elif event.type == "response.output_text.delta":
            print(event.delta, end="", flush=True)

    print()


if __name__ == "__main__":
    main()
