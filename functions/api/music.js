// Cloudflare Pages Function — ElevenLabs Music generation + KV caching
// Requires env var ELEVENLABS_API_KEY and KV binding BRAINBLITZ_KV

var TRACK_CONFIGS = {
  title: {
    prompt: 'Chill lo-fi electronic game show theme with neon cyberpunk feel. Warm analog synth pads, gentle arpeggiated melodies over a soft beat, 82 BPM. Retro-futuristic lounge vibe, atmospheric and inviting. Smooth synthwave meets lo-fi chill.',
    duration_ms: 60000,
    label: 'Title Screen'
  },
  game: {
    prompt: 'Tense electronic quiz show music with driving beat and pulsing synthesizers, 115 BPM. Dark cyberpunk atmosphere that builds intensity. Urgent staccato synths, deep bass pulses, escalating pressure. Tron soundtrack meets game show suspense.',
    duration_ms: 60000,
    label: 'Game'
  },
  victory: {
    prompt: 'Triumphant electronic celebration music, euphoric and energetic, 135 BPM. Ascending synth arpeggios building to a climactic moment. Sparkling tones, powerful drums, feeling of winning glory. Pure joy and accomplishment.',
    duration_ms: 30000,
    label: 'Victory'
  },
  draw: {
    prompt: 'Mellow ambient electronic piece, contemplative and neutral, 70 BPM. Warm floating synth pads, gentle shimmering textures. Neither happy nor sad, peaceful and reflective. The calm after an evenly matched contest.',
    duration_ms: 30000,
    label: 'Draw'
  }
};

var TRACK_NAMES = Object.keys(TRACK_CONFIGS);

export async function onRequestGet(context) {
  var env = context.env;
  var url = new URL(context.request.url);
  var name = url.searchParams.get('name');
  var status = url.searchParams.get('status');

  // Return status of all tracks
  if (status === 'true') {
    var results = {};
    for (var i = 0; i < TRACK_NAMES.length; i++) {
      var key = TRACK_NAMES[i];
      var meta = await env.BRAINBLITZ_KV.get('music:meta:' + key, 'json');
      results[key] = meta || null;
    }
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Return cached audio
  if (!name || TRACK_NAMES.indexOf(name) === -1) {
    return new Response(JSON.stringify({ error: 'Invalid track. Valid: ' + TRACK_NAMES.join(', ') }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  var audio = await env.BRAINBLITZ_KV.get('music:' + name, 'arrayBuffer');
  if (!audio) {
    return new Response(JSON.stringify({ error: 'Track not generated yet' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=604800',
    },
  });
}

export async function onRequestPost(context) {
  var env = context.env;
  var apiKey = env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ElevenLabs API key not configured' }), {
      status: 501,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    var body = await context.request.json();
    var name = body.name;
    var customPrompt = body.prompt;

    if (!name || TRACK_NAMES.indexOf(name) === -1) {
      return new Response(JSON.stringify({ error: 'Invalid track name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    var config = TRACK_CONFIGS[name];
    var prompt = customPrompt || config.prompt;

    var res = await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        music_length_ms: config.duration_ms,
        model_id: 'music_v1',
        force_instrumental: true,
      }),
    });

    if (!res.ok) {
      var errText = await res.text();
      return new Response(JSON.stringify({ error: 'ElevenLabs Music API error', status: res.status, detail: errText }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    var audioData = await res.arrayBuffer();

    // Cache audio in KV
    await env.BRAINBLITZ_KV.put('music:' + name, audioData);

    // Store metadata
    var meta = {
      prompt: prompt,
      duration_ms: config.duration_ms,
      size_bytes: audioData.byteLength,
      generated_at: new Date().toISOString(),
      label: config.label,
    };
    await env.BRAINBLITZ_KV.put('music:meta:' + name, JSON.stringify(meta));

    return new Response(JSON.stringify({ ok: true, name: name, meta: meta }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Music generation failed', detail: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
