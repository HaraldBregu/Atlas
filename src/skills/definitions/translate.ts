import { chat } from "../../ai/index.js";
import type { Skill } from "../types.js";

export const translateSkill: Skill<
  { text: string; targetLanguage: string },
  { translation: string }
> = {
  name: "translate",
  description: "Translate text to a target language using AI",
  async execute({ text, targetLanguage }) {
    const result = await chat({
      messages: [
        {
          role: "system",
          content: `Translate the following text to ${targetLanguage}. Return only the translation.`,
        },
        { role: "user", content: text },
      ],
    });

    return { translation: result.message.content ?? "" };
  },
};
