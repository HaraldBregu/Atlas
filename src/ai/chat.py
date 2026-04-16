from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from openai.types.chat import ChatCompletionMessageParam

from src.ai.client import openai_client
from src.tools.types import Tool
from src.tools.registry import tool_to_function


@dataclass
class ChatOptions:
    messages: list[ChatCompletionMessageParam]
    model: str = "gpt-4o"
    tools: list[Tool] = field(default_factory=list)
    temperature: float | None = None


def chat(options: ChatOptions) -> Any:
    kwargs: dict[str, Any] = {
        "model": options.model,
        "messages": options.messages,
    }

    if options.temperature is not None:
        kwargs["temperature"] = options.temperature

    if options.tools:
        kwargs["tools"] = [tool_to_function(t) for t in options.tools]

    response = openai_client.chat.completions.create(**kwargs)
    return response.choices[0]
