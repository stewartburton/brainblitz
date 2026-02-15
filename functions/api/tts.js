// Cloudflare Pages Function — ElevenLabs TTS proxy
// Requires env var ELEVENLABS_API_KEY set in Cloudflare Pages settings
// Tracks character usage in KV key "tts:usage"

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // "Rachel" — clear English voice
const ALLOWED_VOICES = ['21m00Tcm4TlvDq8ikWAM', '5W1ijlUigww8GacnRjZV']; // Rachel, Butcher

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'TTS not configured' }), {
      status: 501,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { text, voice_id } = await request.json();

    if (!text || text.length > 1000) {
      return new Response(JSON.stringify({ error: 'Invalid text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use requested voice if allowed, otherwise default
    const selectedVoice = (voice_id && ALLOWED_VOICES.includes(voice_id)) ? voice_id : DEFAULT_VOICE_ID;

    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      return new Response(JSON.stringify({ error: 'TTS API error', detail: errText }), {
        status: ttsRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Track TTS character usage in KV (fire-and-forget)
    if (env.BRAINBLITZ_KV) {
      try {
        const existing = await env.BRAINBLITZ_KV.get('tts:usage', 'json') || {
          totalChars: 0, totalRequests: 0, history: []
        };
        existing.totalChars += text.length;
        existing.totalRequests += 1;
        existing.history.push({
          chars: text.length,
          voice: selectedVoice === DEFAULT_VOICE_ID ? 'rachel' : 'butcher',
          timestamp: new Date().toISOString()
        });
        // Keep last 200 entries to avoid bloat
        if (existing.history.length > 200) {
          existing.history = existing.history.slice(-200);
        }
        await env.BRAINBLITZ_KV.put('tts:usage', JSON.stringify(existing));
      } catch(e) { /* don't block TTS response */ }
    }

    // Stream the audio back to the client
    return new Response(ttsRes.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'TTS request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
