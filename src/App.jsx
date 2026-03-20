import { useState, useCallback } from 'react';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import { useChessStats } from './hooks/useChessStats';
import { loadConfig, saveConfig } from './config';

export default function App() {
  const [config, setConfig] = useState(loadConfig);
  const [showAdmin, setShowAdmin] = useState(false);

  const { playerData, loading, lastUpdated, refresh } = useChessStats(config);

  const handleSave = useCallback((newConfig) => {
    saveConfig(newConfig);
    setConfig(newConfig);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1a0a] text-gray-200">
      <div className="max-w-lg mx-auto px-4 py-6">
        <Leaderboard
          playerData={playerData}
          config={config}
          loading={loading}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
        />

        {/* Admin button */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setShowAdmin(true)}
            className="w-12 h-12 bg-[#2d4a2d] hover:bg-[#3a5c3a] border border-[#4a7c59] rounded-full flex items-center justify-center text-xl shadow-lg transition-colors"
            title="Admin Panel"
          >
            ⚙️
          </button>
        </div>

        {showAdmin && (
          <AdminPanel config={config} onSave={handleSave} onClose={() => setShowAdmin(false)} />
        )}
      </div>
    </div>
  );
}
