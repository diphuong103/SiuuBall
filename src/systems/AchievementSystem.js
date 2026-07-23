const ACHIEVEMENTS = [
  { id: "bounces", target: 10, title: "10 BOUNCES", subtitle: "Keep the rhythm", color: 0x38bdf8, sfx: "achievement1" },
  { id: "safeTime", target: 30, title: "30-SECOND SURVIVOR", subtitle: "Survive 30 seconds without taking damage", color: 0x4ade80, sfx: "achievement2" },
  { id: "orbs", target: 3, title: "ORB HUNTER", subtitle: "3 orbs collected", color: 0xfbbf24, sfx: "achievement3" },
  { id: "lines", target: 12, title: "LINE MASTER", subtitle: "12 lines drawn", color: 0xc084fc, sfx: "achievement4" },
];

export class AchievementSystem {
  constructor(onUnlock) { this.onUnlock = onUnlock; this.reset(); }
  reset() { this.progress = { bounces: 0, safeTime: 0, orbs: 0, lines: 0 }; this.unlocked = new Set(); }
  add(id, amount = 1) {
    if (!(id in this.progress)) return;
    this.progress[id] += amount;
    const achievement = ACHIEVEMENTS.find((item) => item.id === id);
    if (achievement && !this.unlocked.has(id) && this.progress[id] >= achievement.target) {
      this.unlocked.add(id);
      this.onUnlock?.(achievement);
    }
  }
  update(deltaSeconds) { this.add("safeTime", deltaSeconds); }
  resetSafeTime() { this.progress.safeTime = 0; }
}
