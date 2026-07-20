export class SpawnManager {
  constructor(physics, layer, width, height) {
    this.physics = physics;
    this.layer = layer;
    this.width = width;
    this.height = height;
    this.entities = new Set();
  }

  add(entity) {
    this.entities.add(entity);
    if (entity.body) {
      this.physics.add(entity.body);
    }
    const displayTarget = entity.graphics || entity.container;
    if (displayTarget) {
      this.layer.addChild(displayTarget);
    }
    return entity;
  }

  remove(entity) {
    if (!entity) return;

    this.entities.delete(entity);

    if (!entity.isActive) return;

    if (entity.body) {
      this.physics.remove(entity.body);
    }

    if (typeof entity.destroy === "function") {
      entity.destroy();
    }
  }

  clear() {
    for (const entity of [...this.entities]) {
      this.remove(entity);
    }
  }
}
