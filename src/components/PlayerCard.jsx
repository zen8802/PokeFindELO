import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import RatingChart from './RatingChart';

export default function PlayerCard({ player, rank, isLeader, targetRating, startDate, format: gameFormat }) {
  const [expanded, setExpanded] = useState(false);

  if (player.error) {
    return (
      <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <span className="font-semibold text-red-300">{player.username}</span>
          <span className="text-red-400 text-sm ml-auto">{player.error}</span>
        </div>
      </div>
    );
  }

  const gain = player.ratingGain;
  const gainColor = gain > 0 ? 'text-green-400' : gain < 0 ? 'text-red-400' : 'text-gray-400';
  const gainText = gain > 0 ? `+${gain}` : `${gain}`;

  const progress = Math.max(0, Math.min(100,
    (player.currentRating / targetRating) * 100
  ));
  const reachedTarget = player.currentRating >= targetRating;

  return (
    <div
      className="bg-[#1a2e1a] border border-[#2d4a2d] rounded-xl p-4 mb-3 cursor-pointer transition-all hover:border-[#4a7c59] hover:bg-[#1e351e]"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Main row */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 relative">
          {player.avatar ? (
            <img
              src={player.avatar}
              alt={player.username}
              className="w-10 h-10 rounded-full border-2 border-[#2d4a2d] object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#2d4a2d] flex items-center justify-center text-sm font-bold text-[#d4a843]">
              {player.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#0f1f0f] border border-[#2d4a2d] flex items-center justify-center text-[10px] font-bold text-[#d4a843]">
            {rank}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isLeader && <span title="Current leader">👑</span>}
            <span className="font-semibold text-[#e8dcc8] truncate">{player.username}</span>
            {reachedTarget && <span title="Target reached!">🏆</span>}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {player.lastActive
              ? `Active ${formatDistanceToNow(new Date(player.lastActive), { addSuffix: true })}`
              : 'No recent activity'}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-xl font-bold text-[#e8dcc8]">{player.currentRating}</div>
          <div className={`text-sm font-semibold ${gainColor}`}>{gainText}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>0</span>
          <span>🎯 {targetRating}</span>
        </div>
        <div className="w-full h-2 bg-[#0f1f0f] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${reachedTarget ? 'bg-[#d4a843]' : 'bg-[#4a7c59]'}`}
            style={{ width: `${Math.max(0, progress)}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mt-3 text-xs text-gray-400">
        <span>🎮 {player.gamesPlayed} games</span>
        <span>📈 {player.winRate}% WR</span>
        <span>
          {player.streak?.type === 'W' ? '🔥' : player.streak?.type === 'L' ? '❄️' : '➖'}
          {' '}{player.streak?.count}{player.streak?.type}
        </span>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#2d4a2d]" onClick={(e) => e.stopPropagation()}>
          {/* Color breakdown */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#0f1f0f] rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-white rounded-sm" /> As White
              </div>
              <div className="text-sm text-[#e8dcc8]">
                <span className="text-green-400">{player.colorStats?.white.win}W</span>
                {' / '}
                <span className="text-gray-400">{player.colorStats?.white.draw}D</span>
                {' / '}
                <span className="text-red-400">{player.colorStats?.white.loss}L</span>
              </div>
            </div>
            <div className="bg-[#0f1f0f] rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-gray-700 rounded-sm" /> As Black
              </div>
              <div className="text-sm text-[#e8dcc8]">
                <span className="text-green-400">{player.colorStats?.black.win}W</span>
                {' / '}
                <span className="text-gray-400">{player.colorStats?.black.draw}D</span>
                {' / '}
                <span className="text-red-400">{player.colorStats?.black.loss}L</span>
              </div>
            </div>
          </div>

          {/* Best win */}
          {player.bestWin && (
            <div className="text-xs text-gray-400 mb-3">
              ⭐ Best win: <span className="text-[#d4a843]">{player.bestWin.opponent}</span> ({player.bestWin.rating}) on{' '}
              {format(new Date(player.bestWin.date), 'MMM d, yyyy')}
            </div>
          )}

          {/* Extra stats */}
          <div className="text-xs text-gray-400 mb-3 space-y-1">
            <div>
              🏅 Best rating: <span className="text-[#e8dcc8]">{player.bestRating}</span>
              {' | '}
              W/D/L: <span className="text-green-400">{player.record?.win}</span>/
              <span className="text-gray-300">{player.record?.draw}</span>/
              <span className="text-red-400">{player.record?.loss}</span>
            </div>
            {player.avgOpponentRating && (
              <div>
                🎯 Avg opponent: <span className="text-[#e8dcc8]">{player.avgOpponentRating}</span>
              </div>
            )}
            {player.avgTimePerMove && (
              <div>
                ⏱️ Avg time/move: <span className="text-[#e8dcc8]">{player.avgTimePerMove}s</span>
              </div>
            )}
          </div>

          {/* Top openings */}
          {player.topOpenings && player.topOpenings.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-400 mb-1">♟️ Most Played Openings</div>
              <div className="space-y-1">
                {player.topOpenings.map((o, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-[#e8dcc8] truncate flex-1">{o.name}</span>
                    <span className="text-gray-500 flex-shrink-0">{o.count} games</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rating chart */}
          <div className="text-xs text-gray-400 mb-1">📊 Rating History</div>
          <RatingChart history={player.history} targetRating={targetRating} startDate={startDate} />
        </div>
      )}
    </div>
  );
}
