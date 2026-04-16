from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

client = OpenAI()


class WeatherParams(BaseModel):
    city: str = Field(description="Name of the city")


class WeatherResult(BaseModel):
    city: str
    temperature: float
    condition: str


def get_weather(params: WeatherParams) -> WeatherResult:
    # In real life, call an API here
    return WeatherResult(city=params.city, temperature=22.0, condition="sunny")


def main() -> None:
    tools = [
        {"type": "web_search"},
        {
            "type": "function",
            "name": "get_weather",
            "description": "Get current weather for a city",
            "parameters": WeatherParams.model_json_schema(),
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
            params = WeatherParams.model_validate_json(item.arguments)
            result = get_weather(params)

            print(f">>> [TOOL] get_weather({params.city}) -> {result.model_dump_json()}", flush=True)

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
                        "output": result.model_dump_json(),
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
