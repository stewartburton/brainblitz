// Cloudflare Pages Function — TTS usage stats
// GET /api/tts-usage — returns character usage and request count

export async function onRequestGet(context) {
  const { env } = context;

  if (!env.BRAINBLITZ_KV) {
    return new Response(JSON.stringify({ error: 'KV not configured' }), {
      status: 501,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const usage = await env.BRAINBLITZ_KV.get('tts:usage', 'json') || {
      totalChars: 0, totalRequests: 0, history: []
    };

    return new Response(JSON.stringify(usage, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to read usage' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
