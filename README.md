# Atlas

AI application using OpenAI SDK with function tools, web search, and Pydantic models.

## Requirements

- Python 3.11+
- OpenAI API key

## Setup

```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e .

# Install dev dependencies (optional)
pip install -e ".[dev]"
```

## Configuration

Create a `.env` file in the project root:

```
OPENAI_API_KEY=sk-...
```

## Run

```bash
python src/main.py
```

## What it does

1. Sends a prompt to GPT-4o with two tools: `web_search` and `get_weather`
2. Model decides which tool to call based on the prompt
3. If `get_weather` is called, the app executes it locally, sends the result back, and streams the final answer
4. If `web_search` is called, OpenAI handles it internally and returns the response

## Project structure

```
Atlas/
├── src/
│   └── main.py            # Entry point
├── pyproject.toml          # Project config & dependencies
├── .env                    # API keys (not committed)
└── README.md
```
