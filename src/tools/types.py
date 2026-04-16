from __future__ import annotations

from typing import Any, Callable, Awaitable

from pydantic import BaseModel


class Tool(BaseModel):
    name: str
    description: str
    parameters: dict[str, Any]
    execute: Callable[..., Any | Awaitable[Any]]

    class Config:
        arbitrary_types_allowed = True
