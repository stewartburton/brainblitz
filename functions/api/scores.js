// Cloudflare Pages Function — GET/POST player stats via KV
// Requires a KV namespace binding named "BRAINBLITZ_KV" in Cloudflare Pages settings
// Supports dynamic player names with player:{normalized} KV keys

var defaultStats = {
  gamesPlayed: 0,
  wins: 0,
  draws: 0,
  totalScore: 0,
  totalCorrect: 0,
  bestGameScore: 0,
  bestStreak: 0,
  lastPlayed: null,
};

function normalizeName(name) {
  return (name || '').trim().toLowerCase();
}

// One-time migration from old stats:burden/stats:stu keys to player: prefix
async function runMigrationIfNeeded(kv) {
  var migrated = await kv.get('migration:v2');
  if (migrated) return;

  var oldPlayers = ['burden', 'stu'];
  for (var i = 0; i < oldPlayers.length; i++) {
    var name = oldPlayers[i];

    // Migrate stats
    var oldStats = await kv.get('stats:' + name, 'json');
    if (oldStats) {
      var existingNew = await kv.get('player:' + name, 'json');
      if (!existingNew) {
        await kv.put('player:' + name, JSON.stringify(oldStats));
      }
    }

    // Migrate achievements
    var oldAch = await kv.get('achievements:' + name, 'json');
    if (oldAch) {
      var existingAch = await kv.get('achievements:player:' + name, 'json');
      if (!existingAch) {
        await kv.put('achievements:player:' + name, JSON.stringify(oldAch));
      }
    }
  }

  await kv.put('migration:v2', 'done');
}

export async function onRequestGet(context) {
  var env = context.env;
  var url = new URL(context.request.url);
  var p1 = url.searchParams.get('p1');
  var p2 = url.searchParams.get('p2');

  try {
    // Run migration on first access
    await runMigrationIfNeeded(env.BRAINBLITZ_KV);

    // If query params provided, look up those players
    if (p1 || p2) {
      var result = {};

      if (p1) {
        var n1 = normalizeName(p1);
        if (n1) {
          var data1 = await env.BRAINBLITZ_KV.get('player:' + n1, 'json');
          result[n1] = data1 || null;
        }
      }

      if (p2) {
        var n2 = normalizeName(p2);
        if (n2) {
          var data2 = await env.BRAINBLITZ_KV.get('player:' + n2, 'json');
          result[n2] = data2 || null;
        }
      }

      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fallback: return old-format data for backwards compatibility
    var results = await Promise.all([
      env.BRAINBLITZ_KV.get('player:burden', 'json'),
      env.BRAINBLITZ_KV.get('player:stu', 'json'),
    ]);

    return new Response(JSON.stringify({
      burden: results[0] || null,
      stu: results[1] || null,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to load stats' }), {
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
    var won = body.won;
    var draw = body.draw;
    var score = body.score;
    var correct = body.correct;
    var bestStreak = body.bestStreak;

    var normalized = normalizeName(player);
    if (!normalized) {
      return new Response(JSON.stringify({ error: 'Invalid player name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Run migration on first access
    await runMigrationIfNeeded(env.BRAINBLITZ_KV);

    var key = 'player:' + normalized;
    var existing = await env.BRAINBLITZ_KV.get(key, 'json');
    if (!existing) {
      existing = {
        gamesPlayed: 0,
        wins: 0,
        draws: 0,
        totalScore: 0,
        totalCorrect: 0,
        bestGameScore: 0,
        bestStreak: 0,
        lastPlayed: null,
      };
    }

    existing.gamesPlayed += 1;
    if (won) existing.wins += 1;
    if (draw) existing.draws += 1;
    existing.totalScore += score || 0;
    existing.totalCorrect += correct || 0;
    if ((score || 0) > existing.bestGameScore) existing.bestGameScore = score;
    if ((bestStreak || 0) > existing.bestStreak) existing.bestStreak = bestStreak;
    existing.lastPlayed = new Date().toISOString();

    await env.BRAINBLITZ_KV.put(key, JSON.stringify(existing));

    return new Response(JSON.stringify({ ok: true, stats: existing }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to save stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
