// Default challenge settings
export const DEFAULT_CONFIG = {
  targetRating: 2500,
  challengeStartDate: new Date().toISOString().split('T')[0],
  format: 'chess_blitz',
  adminPin: '1234',
  players: [],
};

export const FORMAT_LABELS = {
  chess_rapid: 'Rapid',
  chess_blitz: 'Blitz',
  chess_bullet: 'Bullet',
};

export const FORMAT_OPTIONS = [
  { value: 'chess_rapid', label: 'Rapid' },
  { value: 'chess_blitz', label: 'Blitz' },
  { value: 'chess_bullet', label: 'Bullet' },
];

export function loadConfig() {
  // 1. Try loading from URL hash (shared link)
  try {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const decoded = JSON.parse(atob(hash));
      return { ...DEFAULT_CONFIG, ...decoded };
    }
  } catch {
    // ignore bad hash
  }

  // 2. Fallback to localStorage (admin's local copy)
  try {
    const stored = localStorage.getItem('chess-climb-config');
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }

  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config) {
  // Save to localStorage for the admin
  localStorage.setItem('chess-climb-config', JSON.stringify(config));

  // Encode config into URL hash so the link is shareable
  const { adminPin, ...shareableConfig } = config;
  const encoded = btoa(JSON.stringify(shareableConfig));
  window.location.hash = encoded;
}
