import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchPlayerProfile,
  fetchPlayerStats,
  fetchRecentGames,
  getRatingFromStats,
  buildRatingHistory,
  getRatingAtDate,
  calcColorStats,
  getBestWin,
  getCurrentStreak,
  getLastActive,
} from '../utils/chesscom';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useChessStats(config) {
  const [playerData, setPlayerData] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchAllPlayers = useCallback(async () => {
    if (!config.players || config.players.length === 0) {
      setPlayerData({});
      return;
    }

    setLoading(true);

    const results = {};

    await Promise.all(
      config.players.map(async (username) => {
        try {
          const [profile, stats, games] = await Promise.all([
            fetchPlayerProfile(username),
            fetchPlayerStats(username),
            fetchRecentGames(username),
          ]);

          const ratingData = getRatingFromStats(stats, config.format);
          if (!ratingData) {
            results[username] = {
              username,
              error: `No ${config.format.replace('chess_', '')} rating found`,
            };
            return;
          }

          const history = buildRatingHistory(games, username, config.format);
          const startRating = getRatingAtDate(history, config.challengeStartDate);
          const colorStats = calcColorStats(games, username, config.format);
          const bestWin = getBestWin(games, username, config.format);
          const streak = getCurrentStreak(games, username, config.format);
          const lastActive = getLastActive(games, username, config.format);

          const totalGames = ratingData.record.win + ratingData.record.loss + ratingData.record.draw;
          const winRate = totalGames > 0 ? ((ratingData.record.win / totalGames) * 100).toFixed(1) : 0;

          results[username] = {
            username,
            avatar: profile?.avatar || null,
            currentRating: ratingData.current,
            bestRating: ratingData.best,
            startRating: startRating || ratingData.current,
            ratingGain: startRating ? ratingData.current - startRating : 0,
            gamesPlayed: totalGames,
            winRate,
            record: ratingData.record,
            colorStats,
            history,
            bestWin,
            streak,
            lastActive,
            error: null,
          };
        } catch (err) {
          results[username] = {
            username,
            error: err.message,
          };
        }
      })
    );

    setPlayerData(results);
    setLastUpdated(new Date());
    setLoading(false);
  }, [config.players, config.format, config.challengeStartDate]);

  useEffect(() => {
    fetchAllPlayers();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchAllPlayers, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAllPlayers]);

  return { playerData, loading, lastUpdated, refresh: fetchAllPlayers };
}
