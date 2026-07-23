import test from "node:test";
import assert from "node:assert/strict";
import Matter from "matter-js";

const { CollisionManager } = await import("../src/gameplay/CollisionManager.js");

test("collision manager dispatches a ball-projectile collision once", () => {
  const engine = Matter.Engine.create();
  engine.gravity.y = 0;
  const ball = Matter.Bodies.circle(100, 100, 16, { label: "main-ball" });
  const projectile = Matter.Bodies.circle(100, 100, 12, {
    label: "projectile",
    isSensor: true,
  });
  Matter.World.add(engine.world, [ball, projectile]);

  let hits = 0;
  const collisions = new CollisionManager(engine);
  collisions.register({ onBallHitProjectile: () => { hits += 1; } });
  Matter.Engine.update(engine, 1000 / 60);
  collisions.unregister();

  assert.equal(hits, 1);
});
