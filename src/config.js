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
  localStorage.setItem('chess-climb-config', JSON.stringify(config));
}
