// Cloudflare Pages Function — GET/POST player achievements via KV
// Requires a KV namespace binding named "BRAINBLITZ_KV" in Cloudflare Pages settings

var defaultAchievements = {
  earned: [],
  history: []
};

function normalizePlayer(name) {
  if (!name || typeof name !== 'string') return '';
  return name.trim().toLowerCase();
}

function playerKey(normalized) {
  return 'achievements:player:' + normalized;
}

export async function onRequestGet(context) {
  var env = context.env;
  var url = new URL(context.request.url);
  var player = url.searchParams.get('player');
  var p1 = url.searchParams.get('p1');
  var p2 = url.searchParams.get('p2');

  try {
    // Mode 1: Single player lookup
    if (player) {
      var normalized = normalizePlayer(player);
      if (!normalized) {
        return new Response(JSON.stringify({ error: 'Invalid player name' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      var data = await env.BRAINBLITZ_KV.get(playerKey(normalized), 'json');
      return new Response(JSON.stringify(data || defaultAchievements), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mode 2: Two-player lookup
    if (p1 && p2) {
      var n1 = normalizePlayer(p1);
      var n2 = normalizePlayer(p2);
      if (!n1 || !n2) {
        return new Response(JSON.stringify({ error: 'Invalid player name(s)' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      var results = await Promise.all([
        env.BRAINBLITZ_KV.get(playerKey(n1), 'json'),
        env.BRAINBLITZ_KV.get(playerKey(n2), 'json'),
      ]);
      var response = {};
      response[n1] = results[0] || defaultAchievements;
      response[n2] = results[1] || defaultAchievements;
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mode 3: No params — backwards compat fallback (burden + stu)
    var fallback = await Promise.all([
      env.BRAINBLITZ_KV.get(playerKey('burden'), 'json'),
      env.BRAINBLITZ_KV.get(playerKey('stu'), 'json'),
    ]);

    return new Response(JSON.stringify({
      burden: fallback[0] || defaultAchievements,
      stu: fallback[1] || defaultAchievements,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to load achievements' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestPost(context) {
  var env = context.env;

  try {
    var body = await context.request.json();
    var player = body.player;
    var newAchievements = body.achievements; // array of achievement IDs

    var normalized = normalizePlayer(player);
    if (!normalized) {
      return new Response(JSON.stringify({ error: 'Invalid player name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(newAchievements) || newAchievements.length === 0) {
      return new Response(JSON.stringify({ error: 'No achievements provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    var key = playerKey(normalized);
    var existing = await env.BRAINBLITZ_KV.get(key, 'json');
    if (!existing) {
      existing = { earned: [], history: [] };
    }

    var now = new Date().toISOString();
    var added = [];

    for (var i = 0; i < newAchievements.length; i++) {
      var achId = newAchievements[i];
      if (existing.earned.indexOf(achId) === -1) {
        existing.earned.push(achId);
        existing.history.push({ id: achId, timestamp: now });
        added.push(achId);
      }
    }

    if (added.length > 0) {
      await env.BRAINBLITZ_KV.put(key, JSON.stringify(existing));
    }

    return new Response(JSON.stringify({
      ok: true,
      added: added,
      achievements: existing,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to save achievements' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
