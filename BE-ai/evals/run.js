import fs from "node:fs/promises";
import { triage } from "../src/triage.js";

const cases = JSON.parse(await fs.readFile(new URL("./cases.json", import.meta.url)));
let matched = 0;
const failures = [];

for (const testCase of cases) {
  const result = await triage({ text: testCase.text });
  if (result.status === 200 && result.body.category === testCase.category) matched++;
  else failures.push({ text: testCase.text, expected: testCase.category, got: result.body.category || result.body.error });
}

console.log(`${matched}/${cases.length} category matches (${Math.round(100 * matched / cases.length)}%)`);
if (failures.length) console.log(JSON.stringify(failures, null, 2));
process.exitCode = failures.length ? 1 : 0;
