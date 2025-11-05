import 'dotenv/config';
import OpenAI from 'openai';

// Usage:
//   npm run dev -- "Your prompt here"
//   or after build: npm start -- "Your prompt here"
//   You can also pass model via --model gpt-4o-mini (defaults below)

const args = process.argv.slice(2);

function parseArgs(argv: string[]) {
  const out: { prompt: string; model?: string } = { prompt: '' };
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--model' && i + 1 < argv.length) {
      out.model = argv[++i];
    } else {
      rest.push(a);
    }
  }
  out.prompt = rest.join(' ').trim();
  return out;
}

async function main() {
  const { prompt, model } = parseArgs(args);
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY. Set it in your environment or .env file.');
    process.exit(1);
  }
  if (!prompt) {
    console.error('Usage: npm run dev -- "Your prompt here" [--model gpt-4o-mini]');
    process.exit(1);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const targetModel = model || 'gpt-4o-mini';

  console.log(`Model: ${targetModel}`);
  console.log('--- streaming start ---\n');

  // Streaming using Chat Completions API
  const stream = await client.chat.completions.create({
    model: targetModel,
    stream: true,
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ],
  });

  let hadContent = false;
  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content || '';
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
