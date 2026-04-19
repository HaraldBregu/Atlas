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
    response = client.responses.parse(
        model="gpt-4o-mini",
        input="Give me info about Paris.",
        text_format=CityInfo,
    )

    city: CityInfo = response.output_parsed
    print(city.model_dump_json(indent=2))


if __name__ == "__main__":
    main()
