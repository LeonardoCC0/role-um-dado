// Physics Simulation Engine using Cannon-es
import * as CANNON from 'cannon-es';
import { sounds } from '../audio/soundEngine.js';

export class PhysicsEngine {
  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -32, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;

    // Materials
    this.groundMaterial = new CANNON.Material('ground');
    this.wallMaterial = new CANNON.Material('wall');
    this.diceMaterial = new CANNON.Material('dice');

    // Contact Materials
    const diceGroundContact = new CANNON.ContactMaterial(this.diceMaterial, this.groundMaterial, {
      friction: 0.35,
      restitution: 0.38
    });
    const diceWallContact = new CANNON.ContactMaterial(this.diceMaterial, this.wallMaterial, {
      friction: 0.2,
      restitution: 0.55
    });
    const diceDiceContact = new CANNON.ContactMaterial(this.diceMaterial, this.diceMaterial, {
      friction: 0.25,
      restitution: 0.45
    });

    this.world.addContactMaterial(diceGroundContact);
    this.world.addContactMaterial(diceWallContact);
    this.world.addContactMaterial(diceDiceContact);
    this.diceWallContact = diceWallContact;

    this.wallBodies = [];
    this.traySize = 15;
    this.trayHeight = 3.5;

    this.setupGround();
    this.setupWalls(this.traySize);
  }

  setupGround() {
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      material: this.groundMaterial
    });
    // Rotate plane to face upwards +Y
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    groundBody.position.set(0, 0, 0);
    this.world.addBody(groundBody);
    this.groundBody = groundBody;
  }

  setupWalls(size) {
    // Remove old walls if resizing
    for (const wall of this.wallBodies) {
      this.world.removeBody(wall);
    }
    this.wallBodies = [];
    this.traySize = size;

    const halfSize = size / 2;
    const thickness = 1;
    const h = this.trayHeight;

    const wallsData = [
      // North Wall (+Z)
      { pos: [0, h / 2, halfSize + thickness / 2], halfExtents: [halfSize + thickness, h / 2, thickness / 2] },
      // South Wall (-Z)
      { pos: [0, h / 2, -halfSize - thickness / 2], halfExtents: [halfSize + thickness, h / 2, thickness / 2] },
      // East Wall (+X)
      { pos: [halfSize + thickness / 2, h / 2, 0], halfExtents: [thickness / 2, h / 2, halfSize + thickness] },
      // West Wall (-X)
      { pos: [-halfSize - thickness / 2, h / 2, 0], halfExtents: [thickness / 2, h / 2, halfSize + thickness] },
    ];

    for (const w of wallsData) {
      const wallBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        material: this.wallMaterial,
        shape: new CANNON.Box(new CANNON.Vec3(...w.halfExtents))
      });
      wallBody.position.set(...w.pos);
      this.world.addBody(wallBody);
      this.wallBodies.push(wallBody);
    }
  }

  updateFromSkills(skillTree) {
    // Check if expanded tray is unlocked
    const targetSize = skillTree['tree_expanded_tray'] ? 19 : 15;
    if (targetSize !== this.traySize) {
      this.setupWalls(targetSize);
    }

    // Check bouncier walls
    if (skillTree['tree_bouncier_walls']) {
      const lvl = skillTree['tree_bouncier_walls'];
      this.diceWallContact.restitution = 0.55 + lvl * 0.18;
    } else {
      this.diceWallContact.restitution = 0.55;
    }
  }

  step(dt) {
    const fixedTimeStep = 1 / 60;
    this.world.step(fixedTimeStep, Math.min(dt, 0.1), 3);
  }
}
