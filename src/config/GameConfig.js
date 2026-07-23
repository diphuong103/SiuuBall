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
    fixedStepMs: 1000 / 60,
    maxFrameDeltaMs: 50,
    maxStepsPerFrame: 3,
  },

  ball: {
    radius: 16,   // Bán kính của quả bóng

    startSpeed: 3,   // Tốc độ ban đầu của quả bóng khi bắt đầu trò chơi
    restitution: 1,   // Hệ số đàn hồi của quả bóng (1.0 có nghĩa là hoàn toàn đàn hồi, không mất năng lượng khi va chạm)

    friction: 0,   // Hệ số ma sát của quả bóng (0 có nghĩa là không có ma sát, quả bóng sẽ không chậm lại khi di chuyển)
    frictionAir: 0,   // Hệ số ma sát không khí của quả bóng (0 có nghĩa là không có ma sát không khí, quả bóng sẽ không chậm lại khi di chuyển trong không khí)
  },

  difficulty: {
    maxSpeed: 20,  // Tốc độ tối đa mà quả bóng có thể đạt được trong trò chơi

    speedIncreaseInterval: 6,  // Khoảng thời gian (giây) mỗi lần tăng tốc độ bóng (tăng lên 6s)

    speedIncreaseAmount: 0.1,  // Số lượng tốc độ tăng lên sau mỗi khoảng thời gian (giảm từ 0.2 xuống 0.1)
  },

  gameplayEvents: {
    arenaChangeInterval: 60,   // khung vien thay doi sau 60s
    waveStartDelay: 30,  // chế độ survival xả đạn
    waveInterval: 45,   // thời gian lặp lại chế độ survival    
    waveDuration: 7,     // thời gian xảy ra hiệu ứng 
    waveProjectileMultiplier: 3,   // so dan ban ra x3 lan
    waveScoreMultiplier: 2,    // so diem nhan doi 
    rareOrbChance: 0.15,   // Xác suất sinh Rare Orb là 15%.
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


orb: {
  radius: 22,
  spawnInterval: 6,   // Cầu hiệu ứng xuất hiện thưa hơn (giây)
  maxActive: 2,
  lifetimeMs: 9000,
  edgePadding: 70,
  color: 0xa855f7,
  glowColor: 0xe9d5ff,
  effects: {
    scoreBonus: 50,
    slowBallMultiplier: 0.65,
    slowBallDurationMs: 5000,
    shieldDurationMs: 6000,

   
    doubleScoreDurationMs: 8000,   // DOUBLE_SCORE: Thời gian nhân đôi điểm (ms)
    speedUpMultiplier: 1.4,        // SPEED_UP: tăng tốc bóng
    speedUpDurationMs: 5000,       // Thời gian tăng tốc bóng (ms)
    projectileSpawnCount: 2,       // PROJECTILE: sinh thêm bao nhiêu vật cản
    gravityDownMultiplier: 0.35,   // GRAVITY_DOWN: trọng lực kéo vừa phải (êm hơn)
    gravityUpMultiplier: 0.25,     // GRAVITY_UP: trọng lực yếu đi / bồng bềnh êm hơn
    gravityDurationMs: 5000,
  },
},

  scoreOrb: {
    spawnInterval: 2, // Cầu điểm xuất hiện thường xuyên hơn (giây)
    maxActive: 4,
    values: [
      { value: 10, weight: 40 },
      { value: 20, weight: 28 },
      { value: 50, weight: 17 },
      { value: 100, weight: 10 },
      { value: 150, weight: 5 },
    ],
  },

  projectile: {
    radius: 12,
    spawnInterval: 10,  // Khoảng thời gian (tính bằng giây) giữa các lần sinh ra vật cản
    speed: 3.5,            // Tốc độ ban đầu của vật cản khi sinh ra
    speedIncreasePerSecond: 0.015, // Tốc độ đạn tăng dần rất nhẹ theo thời gian chơi (0.015)
    minSpeed: 3.5,         // Tốc độ tối thiểu của vật cản (đạn) khi sinh ra  
    maxSpeed: 18,
    lifetimeMs: 9000,
    edgePadding: 32,  
    color: 0xff4d6d,
    maxActive: 6,  // Số lượng vật cản tối đa có thể tồn tại cùng lúc trên màn hình
  },

  debug: {
    enabled: false,       // Bật/tắt toàn bộ debug
    logCollision: false,  // Log va chạm trong collisionEnd
    logDifficulty: false, // Log tốc độ/level trong DifficultySystem
  }

};
