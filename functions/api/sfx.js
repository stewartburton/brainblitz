// Cloudflare Pages Function — ElevenLabs Sound Effects generation + KV caching
// Requires env var ELEVENLABS_API_KEY and KV binding BRAINBLITZ_KV

var SFX_CONFIGS = {
  correct: {
    text: 'Bright positive game show correct answer chime, quick ascending three-note crystalline jingle, satisfying and clear',
    duration: 1,
    label: 'Correct Answer'
  },
  wrong: {
    text: 'Game show wrong answer buzzer, short descending negative buzz, clear but not harsh',
    duration: 1,
    label: 'Wrong Answer'
  },
  tick: {
    text: 'Single crisp digital clock tick, clean and precise',
    duration: 0.5,
    label: 'Timer Tick'
  },
  countdown: {
    text: 'Single urgent countdown alarm beep, digital timer warning tone',
    duration: 0.5,
    label: 'Countdown Beep'
  },
  start: {
    text: 'Exciting game show start fanfare, quick ascending four-note synth jingle, energetic beginning',
    duration: 1.5,
    label: 'Game Start'
  },
  click: {
    text: 'Short crisp digital UI button click, satisfying tactile feedback, clean and modern',
    duration: 0.5,
    label: 'UI Click'
  },
  whoosh: {
    text: 'Quick smooth digital screen transition swoosh, futuristic interface sound',
    duration: 0.5,
    label: 'Screen Transition'
  },
  victory_fanfare: {
    text: 'Triumphant winner celebration fanfare, ascending triumphant melody with sparkle effects, game show winner moment',
    duration: 3,
    label: 'Victory Fanfare'
  },
  draw_tone: {
    text: 'Neutral ambiguous game ending tone, neither happy nor sad, like a tied game result, contemplative',
    duration: 1.5,
    label: 'Draw Tone'
  },
  crowd_cheer: {
    text: 'Excited crowd cheering and applauding enthusiastically, game show audience celebrating a great answer',
    duration: 2,
    label: 'Crowd Cheer'
  },
  achievement: {
    text: 'Achievement unlock jingle, magical ascending sparkle sound with a rewarding finale note, like unlocking a badge',
    duration: 1.5,
    label: 'Achievement Unlock'
  },
  streak_fire: {
    text: 'Epic on-fire streak moment sound, intense energy burst building to crowd excitement, powerful and thrilling',
    duration: 2,
    label: 'Streak Fire'
  }
};

var SFX_NAMES = Object.keys(SFX_CONFIGS);

export async function onRequestGet(context) {
  var env = context.env;
  var url = new URL(context.request.url);
  var name = url.searchParams.get('name');
  var status = url.searchParams.get('status');

  // Return status of all SFX
  if (status === 'true') {
    var results = {};
    for (var i = 0; i < SFX_NAMES.length; i++) {
      var key = SFX_NAMES[i];
      var meta = await env.BRAINBLITZ_KV.get('sfx:meta:' + key, 'json');
      results[key] = meta || null;
    }
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Return cached audio
  if (!name || SFX_NAMES.indexOf(name) === -1) {
    return new Response(JSON.stringify({ error: 'Invalid SFX. Valid: ' + SFX_NAMES.join(', ') }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  var audio = await env.BRAINBLITZ_KV.get('sfx:' + name, 'arrayBuffer');
  if (!audio) {
    return new Response(JSON.stringify({ error: 'SFX not generated yet' }), {
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
    var customText = body.text;

    if (!name || SFX_NAMES.indexOf(name) === -1) {
      return new Response(JSON.stringify({ error: 'Invalid SFX name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    var config = SFX_CONFIGS[name];
    var text = customText || config.text;

    var res = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        duration_seconds: config.duration,
        prompt_influence: 0.3,
      }),
    });

    if (!res.ok) {
      var errText = await res.text();
      return new Response(JSON.stringify({ error: 'ElevenLabs SFX API error', status: res.status, detail: errText }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    var audioData = await res.arrayBuffer();

    // Cache audio in KV
    await env.BRAINBLITZ_KV.put('sfx:' + name, audioData);

    // Store metadata
    var meta = {
      text: text,
      duration: config.duration,
      size_bytes: audioData.byteLength,
      generated_at: new Date().toISOString(),
      label: config.label,
    };
    await env.BRAINBLITZ_KV.put('sfx:meta:' + name, JSON.stringify(meta));

    return new Response(JSON.stringify({ ok: true, name: name, meta: meta }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'SFX generation failed', detail: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
