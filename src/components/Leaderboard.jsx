import PlayerCard from './PlayerCard';
import { FORMAT_LABELS } from '../config';

export default function Leaderboard({ playerData, config, loading, lastUpdated, onRefresh }) {
  const players = Object.values(playerData)
    .filter((p) => !p.error)
    .sort((a, b) => b.currentRating - a.currentRating);

  const errorPlayers = Object.values(playerData).filter((p) => p.error);
  const leaderUsername = players.length > 0 ? players[0].username : null;

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[#e8dcc8] flex items-center justify-center gap-2">
          ♟️ Chess Climb Challenge
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Climb to <span className="text-[#d4a843] font-semibold">{config.targetRating}</span> in{' '}
          <span className="text-[#6abf6a]">{FORMAT_LABELS[config.format]}</span>
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 text-xs text-gray-400">
        <div>
          {lastUpdated && (
            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1.5 bg-[#2d4a2d] hover:bg-[#3a5c3a] text-[#e8dcc8] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <span className={loading ? 'animate-spin' : ''}>🔄</span>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Empty state */}
      {config.players.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">♔</div>
          <p>No players yet!</p>
          <p className="text-sm mt-1">Open the admin panel to add Chess.com usernames</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && Object.keys(playerData).length === 0 && config.players.length > 0 && (
        <div className="space-y-3">
          {config.players.map((p) => (
            <div key={p} className="bg-[#1a2e1a] border border-[#2d4a2d] rounded-xl p-4 animate-pulse h-24" />
          ))}
        </div>
      )}

      {/* Player cards */}
      {players.map((player, i) => (
        <PlayerCard
          key={player.username}
          player={player}
          rank={i + 1}
          isLeader={player.username === leaderUsername}
          targetRating={config.targetRating}
          startDate={config.challengeStartDate}
          format={config.format}
        />
      ))}

      {/* Error players */}
      {errorPlayers.map((player) => (
        <PlayerCard
          key={player.username}
          player={player}
          rank="-"
          isLeader={false}
          targetRating={config.targetRating}
          startDate={config.challengeStartDate}
          format={config.format}
        />
      ))}
    </div>
  );
}
