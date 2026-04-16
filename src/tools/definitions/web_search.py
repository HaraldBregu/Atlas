from src.tools.types import Tool


def _execute(query: str) -> dict[str, list[str]]:
    # TODO: wire up real search API
    return {"results": [f"Placeholder result for: {query}"]}


web_search_tool = Tool(
    name="web_search",
    description="Search the web for information",
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Search query"},
        },
        "required": ["query"],
    },
    execute=_execute,
)
