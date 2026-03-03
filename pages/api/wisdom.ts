
import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  AI: any;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env } = context;

  if (!env.AI) {
    return new Response(JSON.stringify({ error: 'AI binding not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }) as any;
  }

  const model = '@cf/meta/llama-2-7b-chat-int8';
  const prompt = "Generate a short, cryptic, and funny piece of wisdom about the card game Balatro. It should be one or two sentences. Examples: 'The voucher is a lie.', 'Sometimes, the best play is to fold. Sometimes.', 'Embrace the chaos of the spectral pack.'";

  try {
    const aiResponse = await env.AI.run(model, {
      prompt: prompt,
      max_tokens: 50,
    });

    // The response from Llama-2 is typically in a `response` field.
    // Adjust based on the actual model's output structure if necessary.
    const wisdom = aiResponse.response || "The AI is pondering the meaning of a flush.";

    return new Response(JSON.stringify({ wisdom }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }) as any;
  } catch (e) {
    console.error("AI Error:", e);
    return new Response(JSON.stringify({ error: 'Failed to generate wisdom from AI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }) as any;
  }
};
