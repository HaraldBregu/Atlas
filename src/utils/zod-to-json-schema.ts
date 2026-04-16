import type { ZodType } from "zod";

/**
 * Minimal Zod-to-JSON-Schema converter for OpenAI function parameters.
 * Handles objects, strings, numbers, booleans, arrays, and optionals.
 */
export function zodToJsonSchema(schema: ZodType): Record<string, unknown> {
  const def = (schema as any)._def;
  const typeName: string = def?.typeName ?? "";

  switch (typeName) {
    case "ZodObject": {
      const shape = def.shape();
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        const innerDef = (value as any)._def;
        properties[key] = zodToJsonSchema(value as ZodType);
        if (innerDef?.typeName !== "ZodOptional") {
          required.push(key);
        }
      }

      return {
        type: "object",
        properties,
        ...(required.length && { required }),
      };
    }
    case "ZodString":
      return { type: "string", ...(def.description && { description: def.description }) };
    case "ZodNumber":
      return { type: "number", ...(def.description && { description: def.description }) };
    case "ZodBoolean":
      return { type: "boolean", ...(def.description && { description: def.description }) };
    case "ZodArray":
      return { type: "array", items: zodToJsonSchema(def.type) };
    case "ZodOptional":
      return zodToJsonSchema(def.innerType);
    case "ZodDefault":
      return zodToJsonSchema(def.innerType);
    default:
      return {};
  }
}
