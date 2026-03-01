// Cloudflare Pages Function — Serve cached Sound Effects from KV
// Requires KV binding BRAINBLITZ_KV

var SFX_NAMES = ['correct','wrong','tick','countdown','start','click','whoosh','victory_fanfare','draw_tone','crowd_cheer','achievement','streak_fire'];

export async function onRequest(context) {
  var env = context.env;
  var url = new URL(context.request.url);

  if (context.request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  var name = url.searchParams.get('name');

  if (!name || SFX_NAMES.indexOf(name) === -1) {
    return new Response(JSON.stringify({ error: 'Invalid SFX. Valid: ' + SFX_NAMES.join(', ') }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Serve cached SFX from KV
  var audio = await env.BRAINBLITZ_KV.get('sfx:' + name, 'arrayBuffer');
  if (!audio) {
    return new Response(JSON.stringify({ error: 'SFX not cached' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=604800'
    }
  });
}
