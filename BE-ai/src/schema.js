import { z } from "zod";

export const inputSchema = z.object({
  text: z.string().trim().min(1).max(2000),
}).strict();

export const outputSchema = z.object({
  category: z.enum(["billing", "bug", "feature", "other"]),
  urgency: z.enum(["low", "normal", "high"]),
  confidence: z.number().min(0).max(1),
  reason: z.string().trim().min(1).max(160),
}).strict();

export const outputJsonSchema = z.toJSONSchema(outputSchema);

export function parseOutput(raw) {
  const clean = raw.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/i, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("response does not contain a JSON object");
  return outputSchema.parse(JSON.parse(clean.slice(start, end + 1)));
}
