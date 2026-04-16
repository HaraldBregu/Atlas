from src.tools.types import Tool


def _execute(expression: str) -> dict[str, float]:
    result = eval(expression)  # noqa: S307
    return {"result": float(result)}


calculator_tool = Tool(
    name="calculator",
    description="Evaluate a mathematical expression",
    parameters={
        "type": "object",
        "properties": {
            "expression": {"type": "string", "description": "Math expression to evaluate"},
        },
        "required": ["expression"],
    },
    execute=_execute,
)
