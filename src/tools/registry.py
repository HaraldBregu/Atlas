from __future__ import annotations

from typing import Any

from src.tools.types import Tool

_tools: dict[str, Tool] = {}


def register_tool(tool: Tool) -> None:
    _tools[tool.name] = tool


def get_tool(name: str) -> Tool | None:
    return _tools.get(name)


def get_all_tools() -> list[Tool]:
    return list(_tools.values())


def tool_to_function(tool: Tool) -> dict[str, Any]:
    return {
        "type": "function",
        "function": {
            "name": tool.name,
            "description": tool.description,
            "parameters": tool.parameters,
        },
    }
