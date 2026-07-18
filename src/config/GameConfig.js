export const GameConfig = {
  field: {
    size: 500,
    wallThickness: 20,
  },

  physics: {
    gravity: 0.0,
  },

  ball: {
    radius: 16,

    startSpeed: 4,
    restitution: 1,

    friction: 0,
    frictionAir: 0,
  },

  difficulty: {
    maxSpeed: 18,

    speedIncreaseInterval: 15,

    speedIncreaseAmount: 0.5,
  },

  drawLine: {
    thickness: 8,

    maxPoints: 40,

    simplifyTolerance: 5,

    restitution: 1,

    lifetimeMs: 1300,
  },

  scoring: {
    pointsPerBounce: 10,

    pointsPerSecond: 1,
  },
};