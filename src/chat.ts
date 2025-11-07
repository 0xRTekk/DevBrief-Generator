import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';

import { parseCliArgs } from './cliArgs.js';
import { buildSystemPrompt, buildUserPrompt } from './prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '../output');

async function main() {
  const cliArgs = parseCliArgs();

  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY. Set it in your environment or .env file.');
    process.exit(1);
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(cliArgs);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const targetModel = 'gpt-4o-mini';

  const responsePayload = {
    model: targetModel,
    temperature: 0.3,
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  } as any;

  const response = await client.responses.create(responsePayload);

  const rawJson = response.output_text;

  if (!rawJson) {
    console.error('No content received from OpenAI response.');
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    console.error('Failed to parse JSON response:', err);
    process.exit(1);
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `briefs-${timestamp}.json`;
  const filePath = path.join(OUTPUT_DIR, filename);

  await fs.writeFile(filePath, JSON.stringify(parsed, null, 2), 'utf8');

  console.log(`Briefs saved to ${filePath}`);
}

main().catch((err) => {
  console.error('Error:', err?.response?.data || err?.message || err);
  process.exit(1);
});
