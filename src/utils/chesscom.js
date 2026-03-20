const BASE_URL = 'https://api.chess.com/pub/player';

export async function fetchPlayerProfile(username) {
  const res = await fetch(`${BASE_URL}/${username.toLowerCase()}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchPlayerStats(username) {
  const res = await fetch(`${BASE_URL}/${username.toLowerCase()}/stats`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(res.status === 404 ? `Player "${username}" not found on Chess.com` : `Failed to fetch stats for "${username}"`);
  }
  return res.json();
}

export async function fetchArchiveList(username) {
  const res = await fetch(`${BASE_URL}/${username.toLowerCase()}/games/archives`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch archives for "${username}"`);
  }
  const data = await res.json();
  return data.archives || [];
}

export async function fetchArchiveGames(archiveUrl) {
  const res = await fetch(archiveUrl, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch archive');
  }
  const data = await res.json();
  return data.games || [];
}

// Get rating from stats object for a given format
export function getRatingFromStats(stats, format) {
  const formatStats = stats[format];
  if (!formatStats || !formatStats.last) return null;
  return {
    current: formatStats.last.rating,
    best: formatStats.best?.rating || formatStats.last.rating,
    record: {
      win: formatStats.record?.win || 0,
      loss: formatStats.record?.loss || 0,
      draw: formatStats.record?.draw || 0,
    },
  };
}

// Build rating history from archive games for a given format
export function buildRatingHistory(games, username, format) {
  const timeClass = format.replace('chess_', '');
  const lowerUser = username.toLowerCase();

  return games
    .filter((g) => g.time_class === timeClass)
    .map((g) => {
      const isWhite = g.white?.username?.toLowerCase() === lowerUser;
      const playerData = isWhite ? g.white : g.black;
      return {
        date: g.end_time * 1000,
        rating: playerData.rating,
        result: playerData.result,
        color: isWhite ? 'white' : 'black',
        opponent: isWhite ? g.black?.username : g.white?.username,
        opponentRating: isWhite ? g.black?.rating : g.white?.rating,
      };
    })
    .sort((a, b) => a.date - b.date);
}

// Calculate win/draw/loss by color from games
export function calcColorStats(games, username, format) {
  const timeClass = format.replace('chess_', '');
  const lowerUser = username.toLowerCase();

  const stats = {
    white: { win: 0, draw: 0, loss: 0 },
    black: { win: 0, draw: 0, loss: 0 },
  };

  for (const g of games) {
    if (g.time_class !== timeClass) continue;
    const isWhite = g.white?.username?.toLowerCase() === lowerUser;
    const color = isWhite ? 'white' : 'black';
    const result = isWhite ? g.white.result : g.black.result;

    if (result === 'win') stats[color].win++;
    else if (['drawn', 'agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timevsinsufficient'].includes(result)) stats[color].draw++;
    else stats[color].loss++;
  }

  return stats;
}

// Find the rating closest to (but after) the challenge start date
export function getRatingAtDate(ratingHistory, startDate) {
  const startTs = new Date(startDate).getTime();

  // Find the first game on or after start date
  const afterStart = ratingHistory.filter((r) => r.date >= startTs);
  if (afterStart.length > 0) {
    return afterStart[0].rating;
  }

  // If no games after start, use the last game before start
  const beforeStart = ratingHistory.filter((r) => r.date < startTs);
  if (beforeStart.length > 0) {
    return beforeStart[beforeStart.length - 1].rating;
  }

  return null;
}

// Get best win from games
export function getBestWin(games, username, format) {
  const timeClass = format.replace('chess_', '');
  const lowerUser = username.toLowerCase();
  let best = null;

  for (const g of games) {
    if (g.time_class !== timeClass) continue;
    const isWhite = g.white?.username?.toLowerCase() === lowerUser;
    const playerResult = isWhite ? g.white.result : g.black.result;
    if (playerResult !== 'win') continue;

    const opponentRating = isWhite ? g.black?.rating : g.white?.rating;
    const opponentName = isWhite ? g.black?.username : g.white?.username;
    if (!best || opponentRating > best.rating) {
      best = { rating: opponentRating, opponent: opponentName, date: g.end_time * 1000 };
    }
  }

  return best;
}

// Get current streak from recent games
export function getCurrentStreak(games, username, format) {
  const timeClass = format.replace('chess_', '');
  const lowerUser = username.toLowerCase();

  const filtered = games
    .filter((g) => g.time_class === timeClass)
    .sort((a, b) => b.end_time - a.end_time);

  if (filtered.length === 0) return { type: 'none', count: 0 };

  const firstGame = filtered[0];
  const isWhiteFirst = firstGame.white?.username?.toLowerCase() === lowerUser;
  const firstResult = isWhiteFirst ? firstGame.white.result : firstGame.black.result;

  let streakType;
  if (firstResult === 'win') streakType = 'W';
  else if (['drawn', 'agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timevsinsufficient'].includes(firstResult)) streakType = 'D';
  else streakType = 'L';

  let count = 0;
  for (const g of filtered) {
    const isWhite = g.white?.username?.toLowerCase() === lowerUser;
    const result = isWhite ? g.white.result : g.black.result;
    let type;
    if (result === 'win') type = 'W';
    else if (['drawn', 'agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timevsinsufficient'].includes(result)) type = 'D';
    else type = 'L';

    if (type === streakType) count++;
    else break;
  }

  return { type: streakType, count };
}

// Get last active timestamp
export function getLastActive(games, username, format) {
  const timeClass = format.replace('chess_', '');
  const filtered = games
    .filter((g) => g.time_class === timeClass)
    .sort((a, b) => b.end_time - a.end_time);

  return filtered.length > 0 ? filtered[0].end_time * 1000 : null;
}

// Average opponent rating from recent games
export function getAvgOpponentRating(games, username, format) {
  const timeClass = format.replace('chess_', '');
  const lowerUser = username.toLowerCase();
  let total = 0;
  let count = 0;

  for (const g of games) {
    if (g.time_class !== timeClass) continue;
    const isWhite = g.white?.username?.toLowerCase() === lowerUser;
    const oppRating = isWhite ? g.black?.rating : g.white?.rating;
    if (oppRating) {
      total += oppRating;
      count++;
    }
  }

  return count > 0 ? Math.round(total / count) : null;
}

// Average time per move (seconds) from recent games
export function getAvgTimePerMove(games, username, format) {
  const timeClass = format.replace('chess_', '');
  const lowerUser = username.toLowerCase();
  let totalTime = 0;
  let totalMoves = 0;

  for (const g of games) {
    if (g.time_class !== timeClass) continue;
    if (!g.pgn) continue;

    const isWhite = g.white?.username?.toLowerCase() === lowerUser;

    // Parse clk timestamps from PGN
    const clkMatches = [...g.pgn.matchAll(/\[%clk (\d+):(\d+):(\d+(?:\.\d+)?)\]/g)];
    if (clkMatches.length < 2) continue;

    // Filter to only this player's moves (white = even indices 0,2,4; black = odd 1,3,5)
    const playerClks = clkMatches.filter((_, i) => isWhite ? i % 2 === 0 : i % 2 === 1);
    if (playerClks.length < 2) continue;

    for (let i = 1; i < playerClks.length; i++) {
      const prev = parseInt(playerClks[i - 1][1]) * 3600 + parseInt(playerClks[i - 1][2]) * 60 + parseFloat(playerClks[i - 1][3]);
      const curr = parseInt(playerClks[i][1]) * 3600 + parseInt(playerClks[i][2]) * 60 + parseFloat(playerClks[i][3]);
      const elapsed = prev - curr;
      if (elapsed > 0) {
        totalTime += elapsed;
        totalMoves++;
      }
    }
  }

  return totalMoves > 0 ? (totalTime / totalMoves).toFixed(1) : null;
}

// Most played openings from PGN ECO/Opening headers
export function getMostPlayedOpenings(games, username, format, topN = 3) {
  const timeClass = format.replace('chess_', '');
  const lowerUser = username.toLowerCase();
  const openingCounts = {};

  for (const g of games) {
    if (g.time_class !== timeClass) continue;
    if (!g.pgn) continue;

    const isWhite = g.white?.username?.toLowerCase() === lowerUser;

    // Extract ECOUrl or Opening header from PGN
    const openingMatch = g.pgn.match(/\[ECOUrl "https:\/\/www\.chess\.com\/openings\/([^"]+)"\]/);
    let opening = openingMatch
      ? decodeURIComponent(openingMatch[1]).replace(/-/g, ' ').replace(/\.\.\./g, '').split(/\d/)[0].trim()
      : null;

    if (!opening) {
      // Fallback: try Opening header
      const altMatch = g.pgn.match(/\[Opening "([^"]+)"\]/);
      opening = altMatch ? altMatch[1] : null;
    }

    if (!opening) continue;

    // Shorten to base opening name (first 2-3 words)
    const words = opening.split(' ');
    const shortName = words.slice(0, Math.min(3, words.length)).join(' ');

    const key = `${isWhite ? 'W' : 'B'}: ${shortName}`;
    openingCounts[key] = (openingCounts[key] || 0) + 1;
  }

  return Object.entries(openingCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name, count]) => ({ name, count }));
}

// Fetch recent archive months (last 3 months by default)
export async function fetchRecentGames(username, monthsBack = 4) {
  const archives = await fetchArchiveList(username);
  const recentArchives = archives.slice(-monthsBack);

  const allGames = [];
  for (const url of recentArchives) {
    try {
      const games = await fetchArchiveGames(url);
      allGames.push(...games);
    } catch {
      // skip failed archives
    }
  }

  return allGames;
}
