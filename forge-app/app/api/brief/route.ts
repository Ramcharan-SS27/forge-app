import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY || req.headers.get('x-api-key') || '';

  if (!apiKey) {
    return Response.json({ error: 'API key missing.' }, { status: 401 });
  }

  try {
    const { system } = await req.json();
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system,
      messages: [{ role: 'user', content: `Generate my daily brief for ${new Date().toDateString()}.` }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    return Response.json({ content });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 500 });
  }
}
