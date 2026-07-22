const SETTINGS_KEY = "siuuball_settings";

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  musicEnabled: true,
  difficulty: "NORMAL",
  ballIndex: 0,
  lineColorIndex: 0,
};

function normalizeBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeInteger(value, fallback) {
  return Number.isInteger(value) ? value : fallback;
}

function normalizeDifficulty(value) {
  return ["EASY", "NORMAL", "HARD"].includes(value) ? value : DEFAULT_SETTINGS.difficulty;
}

export class SaveSystem {
  static loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };

      const parsed = JSON.parse(raw);
      return {
        soundEnabled: normalizeBoolean(parsed.soundEnabled, DEFAULT_SETTINGS.soundEnabled),
        musicEnabled: normalizeBoolean(parsed.musicEnabled, DEFAULT_SETTINGS.musicEnabled),
        difficulty: normalizeDifficulty(parsed.difficulty),
        ballIndex: normalizeInteger(parsed.ballIndex, DEFAULT_SETTINGS.ballIndex),
        lineColorIndex: normalizeInteger(parsed.lineColorIndex, DEFAULT_SETTINGS.lineColorIndex),
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  static saveSettings(settings) {
    const normalized = {
      ...DEFAULT_SETTINGS,
      ...this.loadSettings(),
      ...settings,
    };

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
    } catch {
      // Ignore storage failures so the game still works in restricted browsers.
    }

    return normalized;
  }
}
