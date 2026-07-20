export const GameConfig = {
  field: {
    wallThickness: 20,   // Độ dày của các bức tường xung quanh khung chơi
  },

  viewport: {
    width: 720 ,
    height: 1280 ,
    aspectRatio: 9 / 16,
  },

  physics: {
    gravity: 0.0,   //   Lực hấp dẫn trong trò chơi (0.0 có nghĩa là không có trọng lực)
  },

  ball: {
    radius: 16,   // Bán kính của quả bóng

    startSpeed: 4,   // Tốc độ ban đầu của quả bóng khi bắt đầu trò chơi
    restitution: 1,   // Hệ số đàn hồi của quả bóng (1.0 có nghĩa là hoàn toàn đàn hồi, không mất năng lượng khi va chạm)

    friction: 0,   // Hệ số ma sát của quả bóng (0 có nghĩa là không có ma sát, quả bóng sẽ không chậm lại khi di chuyển)
    frictionAir: 0,   // Hệ số ma sát không khí của quả bóng (0 có nghĩa là không có ma sát không khí, quả bóng sẽ không chậm lại khi di chuyển trong không khí)
  },

  difficulty: {
    maxSpeed: 18,  // Tốc độ tối đa mà quả bóng có thể đạt được trong trò chơi

    speedIncreaseInterval: 2,  // Khoảng thời gian (tính bằng giây) sau đó tốc độ sẽ tăng lên

    speedIncreaseAmount: 0.2,  // Số lượng tốc độ tăng lên sau mỗi khoảng thời gian (speedIncreaseInterval)
  },

  drawLine: {
    thickness: 8,

    maxPoints: 40,  // Số lượng điểm tối đa mà người chơi có thể vẽ trên một đường thẳng

    simplifyTolerance: 6,  // Độ dung sai để làm mượt đường vẽ (giảm số lượng điểm mà không làm thay đổi hình dạng tổng thể của đường vẽ)

    restitution: 1,  // Hệ số đàn hồi của đường vẽ (1.0 có nghĩa là hoàn toàn đàn hồi, không mất năng lượng khi va chạm)

    lifetimeMs: 1300,  // Thời gian tồn tại của đường vẽ (tính bằng mili giây) trước khi nó biến mất
  },

  scoring: {
    pointsPerBounce: 10,  // Số điểm được cộng khi quả bóng chạm vào đường vẽ

    pointsPerSecond: 1,  // Số điểm được cộng cho mỗi giây trôi qua trong trò chơi
  },

  // GameConfig.js — bổ sung vào orb.effects
orb: {
  radius: 22,
  spawnInterval: 12,
  lifetimeMs: 9000,
  edgePadding: 70,
  color: 0xa855f7,
  glowColor: 0xe9d5ff,
  effects: {
    scoreBonus: 50,
    slowBallMultiplier: 0.65,
    shieldDurationMs: 6000,

   
    doubleScoreDurationMs: 8000,   // DOUBLE_SCORE: Thời gian nhân đôi điểm (ms)
    speedUpMultiplier: 1.4,        // SPEED_UP: tăng tốc bóng
    speedUpDurationMs: 5000,       // Thời gian tăng tốc bóng (ms)
    projectileSpawnCount: 2,       // PROJECTILE: sinh thêm bao nhiêu vật cản
    gravityDownMultiplier: 1.8,    // GRAVITY_DOWN: trọng lực kéo mạnh hơn
    gravityUpMultiplier: 0.3,      // GRAVITY_UP: trọng lực yếu đi / bồng bềnh
    gravityDurationMs: 5000,
  },
},

  projectile: {
    radius: 12,
    spawnInterval: 10,  // Khoảng thời gian (tính bằng giây) giữa các lần sinh ra vật cản
    speed: 4,              // Tốc độ ban đầu của vật cản khi sinh ra
    speedIncreasePerSecond: 0.2,  // Tốc độ đạn tăng dần theo thời gian chơi
    minSpeed: 6,       // Tốc độ tối thiểu của vật cản (đạn) khi sinh ra  
    maxSpeed: 24,
    lifetimeMs: 9000,
    edgePadding: 32,  
    color: 0xff4d6d,
    maxActive: 6,  // Số lượng vật cản tối đa có thể tồn tại cùng lúc trên màn hình
  },

  debug: {
    enabled: true,        // Bật/tắt toàn bộ debug
    logCollision: true,   // Log va chạm trong collisionEnd
    logDifficulty: true,  // Log tốc độ/level trong DifficultySystem
  }

};
