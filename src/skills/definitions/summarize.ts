import { chat } from "../../ai/index.js";
import type { Skill } from "../types.js";

export const summarizeSkill: Skill<
  { text: string; maxLength?: number },
  { summary: string }
> = {
  name: "summarize",
  description: "Summarize text using AI",
  async execute({ text, maxLength = 200 }) {
    const result = await chat({
      messages: [
        {
          role: "system",
          content: `Summarize the following text in ${maxLength} characters or fewer.`,
        },
        { role: "user", content: text },
      ],
    });

    return { summary: result.message.content ?? "" };
  },
};
