import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY || req.headers.get('x-api-key') || '';

  if (!apiKey) {
    return Response.json(
      { error: 'API key missing. Set ANTHROPIC_API_KEY in Vercel environment variables, or enter it in Settings.' },
      { status: 401 }
    );
  }

  try {
    const { messages, system } = await req.json();
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system,
      messages,
    });

    return Response.json({ content: response.content });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 500 });
  }
}
