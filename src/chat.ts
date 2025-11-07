import 'dotenv/config';
import OpenAI from 'openai';

// Schema import kept for future validation needs but unused in streaming mode.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { briefSchema } from './schema/brief.js';
import { parseCliArgs } from './cliArgs.js';
import { buildSystemPrompt, buildUserPrompt } from './prompts.js';

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

  const stream = await client.chat.completions.create({
    model: targetModel,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
  });

  console.log('--- streaming start ---\n');

  let hadContent = false;
  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      hadContent = true;
      process.stdout.write(content);
    }
  }

  if (!hadContent) {
    console.error('\n(No streamed content received)');
  }

  console.log('\n\n--- streaming end ---');
}

main().catch((err) => {
  console.error('Error:', err?.response?.data || err?.message || err);
  process.exit(1);
});
