// Dice 3D & Physics Management, Rolling, Face Detection & Payouts
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createDiceMaterials } from './diceTextures.js';
import { Formulas, DICE_TIERS } from '../state/formulas.js';
import { sounds } from '../audio/soundEngine.js';

// Local direction vectors for each face of the d6 cube
// In BoxGeometry face order:
// +X: Face 2 (normal: 1, 0, 0)
// -X: Face 5 (normal: -1, 0, 0)
// +Y: Face 1 (normal: 0, 1, 0)
// -Y: Face 6 (normal: 0, -1, 0)
// +Z: Face 3 (normal: 0, 0, 1)
// -Z: Face 4 (normal: 0, 0, -1)
const FACE_NORMALS = [
  { face: 2, vec: new CANNON.Vec3(1, 0, 0) },
  { face: 5, vec: new CANNON.Vec3(-1, 0, 0) },
  { face: 1, vec: new CANNON.Vec3(0, 1, 0) },
  { face: 6, vec: new CANNON.Vec3(0, -1, 0) },
  { face: 3, vec: new CANNON.Vec3(0, 0, 1) },
  { face: 4, vec: new CANNON.Vec3(0, 0, -1) }
];

export class DiceManager {
  constructor(sceneEngine, physicsEngine, gameState, effectsManager) {
    this.sceneEngine = sceneEngine;
    this.physicsEngine = physicsEngine;
    this.gameState = gameState;
    this.effects = effectsManager;

    this.dice = []; // Array of { id, tierIndex, mesh, body, isRolling, hasScored, settleTime }
    this.diceSize = 1.3;
    this.boxGeometry = new THREE.BoxGeometry(this.diceSize, this.diceSize, this.diceSize);

    // Initial sync
    this.syncWithState();
  }

  syncWithState() {
    const activeList = this.gameState.activeDice || [];
    const activeIds = new Set(activeList.map(d => d.id));

    // Remove dice no longer active
    for (let i = this.dice.length - 1; i >= 0; i--) {
      const d = this.dice[i];
      if (!activeIds.has(d.id)) {
        this.sceneEngine.scene.remove(d.mesh);
        this.physicsEngine.world.removeBody(d.body);
        this.dice.splice(i, 1);
      }
    }

    // Add new dice or update tier
    activeList.forEach((activeDie, index) => {
      let existing = this.dice.find(d => d.id === activeDie.id);
      if (!existing) {
        this.createDie(activeDie.id, activeDie.tierIndex, index);
      } else if (existing.tierIndex !== activeDie.tierIndex) {
        // Tier changed: update materials
        existing.tierIndex = activeDie.tierIndex;
        existing.mesh.material = createDiceMaterials(activeDie.tierIndex);
      }
    });
  }

  createDie(id, tierIndex, slotIndex = 0) {
    const materials = createDiceMaterials(tierIndex);
    const mesh = new THREE.Mesh(this.boxGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Cannon body
    const half = this.diceSize / 2;
    const shape = new CANNON.Box(new CANNON.Vec3(half, half, half));
    const body = new CANNON.Body({
      mass: 1.2,
      shape,
      material: this.physicsEngine.diceMaterial,
      linearDamping: 0.25,
      angularDamping: 0.35
    });

    // Spread initial positions in tray
    const angle = (slotIndex / Math.max(1, this.gameState.activeDice.length)) * Math.PI * 2;
    const r = 2.5 + (slotIndex % 3) * 1.2;
    const startX = Math.cos(angle) * r;
    const startZ = Math.sin(angle) * r;
    const startY = 1.0 + slotIndex * 0.4;

    body.position.set(startX, startY, startZ);
    mesh.position.copy(body.position);

    // Sound collision listener
    body.addEventListener('collide', (e) => {
      const relVel = e.contact.getImpactVelocityAlongNormal();
      if (Math.abs(relVel) > 3.0) {
        sounds.playDiceRattle();
      }
    });

    this.sceneEngine.scene.add(mesh);
    this.physicsEngine.world.addBody(body);

    const dieObj = {
      id,
      tierIndex,
      mesh,
      body,
      isRolling: false,
      hasScored: true, // Initially at rest
      settleTime: 0,
      currentFace: 1
    };

    this.dice.push(dieObj);
  }

  rollDie(die, impulsePower = 1.0) {
    die.isRolling = true;
    die.hasScored = false;
    die.settleTime = 0;

    // Wake up body
    die.body.wakeUp();

    // Calculate impulse from roll power upgrade
    const rollPowerLvl = this.gameState.commonUpgrades?.rollPower || 0;
    const powerMultiplier = (1 + rollPowerLvl * 0.08) * impulsePower;

    // Lift and push
    const upImpulse = (15 + Math.random() * 6) * powerMultiplier;
    const horizAngle = Math.random() * Math.PI * 2;
    const horizForce = (6 + Math.random() * 8) * powerMultiplier;
    const horizX = Math.cos(horizAngle) * horizForce;
    const horizZ = Math.sin(horizAngle) * horizForce;

    // Apply upward impulse at center
    die.body.velocity.set(horizX, upImpulse, horizZ);

    // Apply intense random spin (angular velocity)
    const spinMax = 18 * powerMultiplier;
    die.body.angularVelocity.set(
      (Math.random() - 0.5) * spinMax * 2,
      (Math.random() - 0.5) * spinMax * 2,
      (Math.random() - 0.5) * spinMax * 2
    );

    sounds.playDiceRattle();
  }

  rollAll(impulsePower = 1.0) {
    sounds.playDiceRattle();
    for (const die of this.dice) {
      this.rollDie(die, impulsePower);
    }
  }

  // Detect which face is currently pointing upwards towards +Y
  getFacingNumber(body) {
    let bestFace = 1;
    let maxDot = -Infinity;

    for (const { face, vec } of FACE_NORMALS) {
      // Rotate local normal by body quaternion into world space
      const worldVec = body.quaternion.vmult(vec);
      // Dot product with world UP (0, 1, 0) is simply worldVec.y
      if (worldVec.y > maxDot) {
        maxDot = worldVec.y;
        bestFace = face;
      }
    }
    return bestFace;
  }

  update(dt) {
    const magnetismLvl = this.gameState.commonUpgrades?.trayMagnetism || 0;

    for (const die of this.dice) {
      // Sync Three.js mesh with Cannon.js body
      die.mesh.position.copy(die.body.position);
      die.mesh.quaternion.copy(die.body.quaternion);

      // Central tray magnetism (pull towards center 0, 0)
      if (magnetismLvl > 0) {
        const pullStrength = 1.8 * magnetismLvl;
        const dir = new CANNON.Vec3(-die.body.position.x, 0, -die.body.position.z);
        const dist = dir.length();
        if (dist > 1.5) {
          dir.normalize();
          die.body.applyForce(dir.scale(pullStrength * die.body.mass));
        }
      }

      // Check rolling and settling
      if (die.isRolling && !die.hasScored) {
        const speedSq = die.body.velocity.lengthSquared();
        const angSpeedSq = die.body.angularVelocity.lengthSquared();

        // If moving slowly and close to floor
        if (speedSq < 0.25 && angSpeedSq < 0.4 && die.body.position.y < 2.0) {
          die.settleTime += dt;
          if (die.settleTime >= 0.28) {
            // Settle confirmed!
            this.handleDieScore(die);
          }
        } else {
          die.settleTime = 0;
        }
      }
    }
  }

  handleDieScore(die) {
    die.isRolling = false;
    die.hasScored = true;
    die.settleTime = 0;

    const face = this.getFacingNumber(die.body);
    die.currentFace = face;

    // Check critical hit
    const isCrit = Formulas.checkCritical(this.gameState);
    if (isCrit) {
      this.gameState.stats.criticalRollsCount += 1;
    }

    // Calculate income
    const income = Formulas.calculateDiceIncome(face, die.tierIndex, this.gameState, isCrit);
    this.gameState.addCoins(income);
    this.gameState.stats.totalRolls += 1;

    // Check Stardust drop
    const stardustDrop = Formulas.checkStardustDrop(face, die.tierIndex, this.gameState);
    if (stardustDrop.dropped) {
      this.gameState.addStardust(stardustDrop.amount);
    }

    // Check Dark Matter drop
    const darkMatterDrop = Formulas.checkDarkMatterDrop(face, die.tierIndex, this.gameState, isCrit);
    if (darkMatterDrop.dropped) {
      this.gameState.addDarkMatter(darkMatterDrop.amount);
    }

    // Sound effect
    sounds.playDiceLand(face, isCrit);
    sounds.playCoin();

    // Floating visual indicator
    if (this.effects) {
      this.effects.spawnFloatingIncome(die.mesh.position, income, isCrit, face);
      if (stardustDrop.dropped) {
        this.effects.spawnFloatingStardust(die.mesh.position, stardustDrop.amount);
      }
      if (darkMatterDrop.dropped) {
        this.effects.spawnFloatingDarkMatter(die.mesh.position, darkMatterDrop.amount);
      }
      // Shockwave ring on critical or 6
      if (isCrit || face === 6) {
        this.effects.spawnShockwave(die.mesh.position, isCrit ? 0xf59e0b : 0x60a5fa);
      }
    }
  }
}
