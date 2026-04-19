from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

client = OpenAI()


class CityInfo(BaseModel):
    name: str = Field(description="City name")
    country: str = Field(description="Country name")
    population: int = Field(description="Approximate population")
    famous_for: list[str] = Field(description="Things the city is famous for")


def main() -> None:
    with client.responses.stream(
        model="gpt-4o-mini",
        input="Give me info about Paris.",
        text_format=CityInfo,
    ) as stream:
        for event in stream:
            if event.type == "response.output_text.delta":
                print(event.delta, end="", flush=True)

        print()
        final = stream.get_final_response()
        city: CityInfo = final.output_parsed
        print("\n--- parsed ---")
        print(city.model_dump_json(indent=2))


if __name__ == "__main__":
    main()
