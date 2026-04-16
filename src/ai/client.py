from openai import OpenAI

from src.config import env

openai_client = OpenAI(api_key=env.openai_api_key)
