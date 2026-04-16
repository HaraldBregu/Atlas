import os

from dotenv import load_dotenv

load_dotenv()


class Env:
    @property
    def openai_api_key(self) -> str:
        return os.getenv("OPENAI_API_KEY", "")

    @property
    def mcp_server_port(self) -> int:
        return int(os.getenv("MCP_SERVER_PORT", "3100"))


env = Env()
