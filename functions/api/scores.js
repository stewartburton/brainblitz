// Cloudflare Pages Function — GET/POST player stats via KV
// Requires a KV namespace binding named "BRAINBLITZ_KV" in Cloudflare Pages settings

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const [burden, stu] = await Promise.all([
      env.BRAINBLITZ_KV.get('stats:burden', 'json'),
      env.BRAINBLITZ_KV.get('stats:stu', 'json'),
    ]);

    return new Response(JSON.stringify({
      burden: burden || null,
      stu: stu || null,
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
  const { request, env } = context;

  try {
    const body = await request.json();
    const { player, won, draw, score, correct, bestStreak } = body;

    if (!['burden', 'stu'].includes(player)) {
      return new Response(JSON.stringify({ error: 'Invalid player' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const key = `stats:${player}`;
    const existing = await env.BRAINBLITZ_KV.get(key, 'json') || {
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      totalScore: 0,
      totalCorrect: 0,
      bestGameScore: 0,
      bestStreak: 0,
      lastPlayed: null,
    };

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
