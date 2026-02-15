// Cloudflare Pages Function — GET/POST player achievements via KV
// Requires a KV namespace binding named "BRAINBLITZ_KV" in Cloudflare Pages settings

var defaultAchievements = {
  earned: [],
  history: []
};

export async function onRequestGet(context) {
  var env = context.env;
  var url = new URL(context.request.url);
  var player = url.searchParams.get('player');

  try {
    // If specific player requested
    if (player) {
      if (['burden', 'stu'].indexOf(player) === -1) {
        return new Response(JSON.stringify({ error: 'Invalid player' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      var data = await env.BRAINBLITZ_KV.get('achievements:' + player, 'json');
      return new Response(JSON.stringify(data || defaultAchievements), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return both players
    var results = await Promise.all([
      env.BRAINBLITZ_KV.get('achievements:burden', 'json'),
      env.BRAINBLITZ_KV.get('achievements:stu', 'json'),
    ]);

    return new Response(JSON.stringify({
      burden: results[0] || defaultAchievements,
      stu: results[1] || defaultAchievements,
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

    if (['burden', 'stu'].indexOf(player) === -1) {
      return new Response(JSON.stringify({ error: 'Invalid player' }), {
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

    var key = 'achievements:' + player;
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
