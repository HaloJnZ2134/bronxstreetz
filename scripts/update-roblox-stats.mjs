import { mkdir, writeFile } from 'node:fs/promises';

const PLACE_ID = process.env.ROBLOX_PLACE_ID || '16995353837';
const OUT_FILE = 'data/roblox-stats.json';

const headers = {
  'Accept': 'application/json',
  'User-Agent': 'BronxStreetzWebsiteStats/1.0',
};

async function fetchJson(url) {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`${url} failed with ${response.status}. ${text.slice(0, 200)}`);
  }

  return response.json();
}

function calculateRating(likes, dislikes) {
  const total = Number(likes || 0) + Number(dislikes || 0);
  if (total <= 0) return null;
  return (Number(likes || 0) / total) * 100;
}

async function writeStats(payload) {
  await mkdir('data', { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function main() {
  const updatedAt = new Date().toISOString();

  try {
    const universeResponse = await fetchJson(`https://apis.roblox.com/universes/v1/places/${PLACE_ID}/universe`);
    const universeId = universeResponse.universeId;

    if (!universeId) {
      throw new Error('Roblox did not return a universeId.');
    }

    const [gameResponse, voteResponse] = await Promise.all([
      fetchJson(`https://games.roblox.com/v1/games?universeIds=${universeId}`),
      fetchJson(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`).catch((error) => {
        console.warn('Vote stats failed, continuing without vote data:', error.message);
        return null;
      }),
    ]);

    const game = gameResponse?.data?.[0];
    const votes = voteResponse?.data?.[0] || {};

    if (!game) {
      throw new Error('Roblox did not return game stats.');
    }

    const likes = votes.upVotes ?? null;
    const dislikes = votes.downVotes ?? null;

    await writeStats({
      ok: true,
      placeId: PLACE_ID,
      universeId,
      name: game.name || 'Bronx Streetz',
      playing: game.playing ?? null,
      visits: game.visits ?? null,
      favorites: game.favoritedCount ?? null,
      likes,
      dislikes,
      rating: calculateRating(likes, dislikes),
      updatedAt,
      source: 'Roblox public APIs via GitHub Actions',
    });

    console.log(`Updated ${OUT_FILE} for universe ${universeId}.`);
  } catch (error) {
    console.error(error);

    await writeStats({
      ok: false,
      placeId: PLACE_ID,
      universeId: null,
      name: 'Bronx Streetz',
      playing: null,
      visits: null,
      favorites: null,
      likes: null,
      dislikes: null,
      rating: null,
      updatedAt,
      error: error.message,
    });

    process.exitCode = 1;
  }
}

main();
