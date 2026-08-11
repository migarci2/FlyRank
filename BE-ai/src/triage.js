import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { inputSchema, outputJsonSchema, parseOutput } from "./schema.js";

export const PROMPT_VERSION = "triage-v1";
const prompt = await fs.readFile(new URL(`../prompts/${PROMPT_VERSION}.md`, import.meta.url), "utf8");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function retryable(error) {
  return error?.name === "AbortError" || error?.name === "APIConnectionTimeoutError" ||
    error?.status === 429 || error?.status >= 500;
}

export async function callWithRetries(call, wait = sleep) {
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await call();
    } catch (error) {
      last = error;
      if (!retryable(error) || attempt === 2) throw error;
      await wait(250 * (2 ** attempt) + Math.floor(Math.random() * 100));
    }
  }
  throw last;
}

function clientFromEnv() {
  return new OpenAI({
    baseURL: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
    timeout: 30_000,
    maxRetries: 0,
  });
}

async function modelCall(messages, repairCount = 0) {
  const started = Date.now();
  const model = process.env.LLM_MODEL;
  try {
    const response = await callWithRetries(() => clientFromEnv().chat.completions.create({
      model,
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: { name: "support_triage", strict: true, schema: outputJsonSchema },
      },
      messages,
    }));
    const usage = response.usage || {};
    const inputTokens = usage.prompt_tokens ?? 0;
    const outputTokens = usage.completion_tokens ?? 0;
    const cost = (inputTokens * Number(process.env.LLM_INPUT_COST_PER_MILLION || 0) +
      outputTokens * Number(process.env.LLM_OUTPUT_COST_PER_MILLION || 0)) / 1_000_000;
    console.log(JSON.stringify({ event: "llm_call", ok: true, prompt_version: PROMPT_VERSION,
      model, input_tokens: inputTokens, output_tokens: outputTokens,
      estimated_cost_usd: cost, duration_ms: Date.now() - started, repair_count: repairCount }));
    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.log(JSON.stringify({ event: "llm_call", ok: false, prompt_version: PROMPT_VERSION,
      model, status: error?.status ?? null, duration_ms: Date.now() - started,
      repair_count: repairCount }));
    throw error;
  }
}

async function quarantine(entry) {
  const dir = new URL("../logs/", import.meta.url);
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(new URL("quarantine.jsonl", dir), JSON.stringify(entry) + "\n");
}

export async function triage(body, { call = modelCall, quarantineWrite = quarantine } = {}) {
  const checked = inputSchema.safeParse(body);
  if (!checked.success) {
    const issue = checked.error.issues[0];
    return { status: 400, body: { error: `text: ${issue?.message || "invalid"}` } };
  }
  if (process.env.LLM_ENABLED === "false") {
    return { status: 503, body: { error: "AI triage is disabled" } };
  }
  if (process.env.LLM_STUB === "1") {
    return { status: 200, body: { category: "other", urgency: "normal", confidence: 0.4, reason: "Stub mode is enabled." } };
  }

  const userMessage = JSON.stringify({ source: "support_message", text: checked.data.text });
  const messages = [
    { role: "system", content: prompt },
    { role: "user", content: userMessage },
  ];

  let raw = await call(messages, 0);
  try {
    return { status: 200, body: parseOutput(raw) };
  } catch (firstError) {
    raw = await call([...messages, { role: "assistant", content: raw }, {
      role: "user",
      content: `Your previous answer was rejected: ${firstError.message}. Return only corrected JSON matching the schema.`,
    }], 1);
    try {
      return { status: 200, body: parseOutput(raw) };
    } catch (secondError) {
      await quarantineWrite({
        at: new Date().toISOString(),
        prompt_version: PROMPT_VERSION,
        input: checked.data,
        error: secondError.message,
        raw,
      });
      return { status: 422, body: { error: "model output failed schema validation after one repair" } };
    }
  }
}

export function statusForProviderError(error) {
  return error?.name === "APIConnectionTimeoutError" || error?.name === "AbortError" ? 504 : 502;
}
