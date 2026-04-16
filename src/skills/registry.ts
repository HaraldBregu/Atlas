import type { Skill } from "./types.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const skills = new Map<string, Skill<any, any>>();

export function registerSkill(skill: Skill<any, any>): void {
  skills.set(skill.name, skill);
}

export function getSkill(name: string): Skill<any, any> | undefined {
  return skills.get(name);
}

export function getAllSkills(): Skill<any, any>[] {
  return Array.from(skills.values());
}
