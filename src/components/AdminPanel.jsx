import { useState } from 'react';
import { FORMAT_OPTIONS } from '../config';

export default function AdminPanel({ config, onSave, onClose }) {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [newPlayer, setNewPlayer] = useState('');
  const [localConfig, setLocalConfig] = useState({ ...config });
  const [error, setError] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    if (pin === config.adminPin) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect PIN');
    }
  };

  const addPlayer = (e) => {
    e.preventDefault();
    const username = newPlayer.trim().toLowerCase();
    if (!username) return;
    if (localConfig.players.includes(username)) {
      setError('Player already added');
      return;
    }
    setLocalConfig({ ...localConfig, players: [...localConfig.players, username] });
    setNewPlayer('');
    setError('');
  };

  const removePlayer = (username) => {
    setLocalConfig({
      ...localConfig,
      players: localConfig.players.filter((p) => p !== username),
    });
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-[#0f1f0f] border border-[#2d4a2d] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#e8dcc8]">⚙️ Admin Panel</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {!authenticated ? (
          <form onSubmit={handleAuth}>
            <label className="block text-sm text-gray-400 mb-1">Enter Admin PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a2e1a] border border-[#2d4a2d] rounded-lg text-[#e8dcc8] focus:outline-none focus:border-[#4a7c59] mb-2"
              placeholder="PIN"
              autoFocus
            />
            {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
            <button
              type="submit"
              className="w-full py-2 bg-[#4a7c59] hover:bg-[#5a8c69] text-[#e8dcc8] rounded-lg font-semibold transition-colors"
            >
              Unlock
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            {/* Target Rating */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">🎯 Target Rating</label>
              <input
                type="number"
                value={localConfig.targetRating}
                onChange={(e) => setLocalConfig({ ...localConfig, targetRating: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-[#1a2e1a] border border-[#2d4a2d] rounded-lg text-[#e8dcc8] focus:outline-none focus:border-[#4a7c59]"
              />
            </div>

            {/* Challenge Start Date */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">📅 Challenge Start Date</label>
              <input
                type="date"
                value={localConfig.challengeStartDate}
                onChange={(e) => setLocalConfig({ ...localConfig, challengeStartDate: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a2e1a] border border-[#2d4a2d] rounded-lg text-[#e8dcc8] focus:outline-none focus:border-[#4a7c59]"
              />
            </div>

            {/* Game Format */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">♟️ Game Format</label>
              <select
                value={localConfig.format}
                onChange={(e) => setLocalConfig({ ...localConfig, format: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a2e1a] border border-[#2d4a2d] rounded-lg text-[#e8dcc8] focus:outline-none focus:border-[#4a7c59]"
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Admin PIN */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">🔑 Admin PIN</label>
              <input
                type="text"
                value={localConfig.adminPin}
                onChange={(e) => setLocalConfig({ ...localConfig, adminPin: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a2e1a] border border-[#2d4a2d] rounded-lg text-[#e8dcc8] focus:outline-none focus:border-[#4a7c59]"
              />
            </div>

            {/* Players */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">👥 Players</label>
              <form onSubmit={addPlayer} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newPlayer}
                  onChange={(e) => setNewPlayer(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#1a2e1a] border border-[#2d4a2d] rounded-lg text-[#e8dcc8] focus:outline-none focus:border-[#4a7c59]"
                  placeholder="Chess.com username"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4a7c59] hover:bg-[#5a8c69] text-[#e8dcc8] rounded-lg font-semibold transition-colors"
                >
                  Add
                </button>
              </form>
              {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
              <div className="space-y-1">
                {localConfig.players.map((p) => (
                  <div key={p} className="flex items-center justify-between bg-[#1a2e1a] px-3 py-2 rounded-lg">
                    <span className="text-[#e8dcc8] text-sm">{p}</span>
                    <button
                      onClick={() => removePlayer(p)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {localConfig.players.length === 0 && (
                  <p className="text-gray-500 text-xs italic">No players added yet</p>
                )}
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-[#d4a843] hover:bg-[#e0b853] text-[#0f1f0f] rounded-lg font-bold transition-colors"
            >
              Save & Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
