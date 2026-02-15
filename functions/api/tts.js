// Cloudflare Pages Function — ElevenLabs TTS proxy
// Requires env var ELEVENLABS_API_KEY set in Cloudflare Pages settings
// Uses a default voice; change VOICE_ID to use a different ElevenLabs voice

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // "Rachel" — clear English voice

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
    const { text } = await request.json();

    if (!text || text.length > 1000) {
      return new Response(JSON.stringify({ error: 'Invalid text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
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
