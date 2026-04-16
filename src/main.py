from src.tools.registry import register_tool
from src.skills.registry import register_skill
from src.tools.definitions.calculator import calculator_tool
from src.tools.definitions.web_search import web_search_tool
from src.skills.definitions.summarize import summarize_skill
from src.skills.definitions.translate import translate_skill


def main() -> None:
    register_tool(calculator_tool)
    register_tool(web_search_tool)

    register_skill(summarize_skill)
    register_skill(translate_skill)

    print("Atlas initialized")


if __name__ == "__main__":
    main()
