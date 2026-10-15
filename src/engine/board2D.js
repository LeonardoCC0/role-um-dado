// 2D Dice Tabletop Simulation Engine with Mouse Swipe / Hover Physics
import { Formulas, DICE_TIERS } from '../state/formulas.js';
import { sounds } from '../audio/soundEngine.js';

// Pip positions normalized in [-1, 1] range inside the die
const PIP_LAYOUTS = {
  1: [[0, 0]],
  2: [[-0.45, -0.45], [0.45, 0.45]],
  3: [[-0.45, -0.45], [0, 0], [0.45, 0.45]],
  4: [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]],
  5: [[-0.45, -0.45], [0.45, -0.45], [0, 0], [-0.45, 0.45], [0.45, 0.45]],
  6: [[-0.45, -0.5], [0.45, -0.5], [-0.45, 0], [0.45, 0], [-0.45, 0.5], [0.45, 0.5]]
};

export class Board2D {
  constructor(container, gameState) {
    this.container = container;
    this.gameState = gameState;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'board-2d-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.dice = []; // Array of 2D die objects
    this.particles = [];
    this.floatingTexts = [];
    this.helperHands = [];
    this.shootingStars = [];
    this.starSpawnTimer = 0;

    // Mouse tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.mousePrevX = 0;
    this.mousePrevY = 0;
    this.mouseVx = 0;
    this.mouseVy = 0;
    this.isMouseOnBoard = false;
    this.lastRattleTime = 0;

    // Board Arena Dimensions
    this.arena = {
      x: 0,
      y: 0,
      width: 800,
      height: 550,
      radius: 20
    };

    this.dieSize = 64;

    this.setupResize();
    this.setupMouseEvents();
    this.syncWithState();
  }

  setupResize() {
    const resize = () => {
      const rect = this.container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = rect.width;
      this.height = rect.height;

      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      this.ctx.scale(dpr, dpr);
      this.updateArenaBounds();
    };

    window.addEventListener('resize', resize);
    resize();
  }

  updateArenaBounds() {
    const isExpanded = !!this.gameState.skillTree['tree_expanded_tray'];
    const scale = isExpanded ? 1.15 : 1.0;

    const maxW = Math.min(this.width * 0.92, 920 * scale);
    const maxH = Math.min(this.height * 0.84, 620 * scale);

    this.arena.width = maxW;
    this.arena.height = maxH;
    this.arena.x = (this.width - maxW) / 2;
    this.arena.y = (this.height - maxH) / 2;

    // Keep dice within new arena
    for (const d of this.dice) {
      d.x = Math.max(this.arena.x + this.dieSize / 2, Math.min(this.arena.x + this.arena.width - this.dieSize / 2, d.x));
      d.y = Math.max(this.arena.y + this.dieSize / 2, Math.min(this.arena.y + this.arena.height - this.dieSize / 2, d.y));
    }
  }

  setupMouseEvents() {
    const handleMove = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      this.mouseVx = (x - this.mousePrevX) * 45; // Pixel per second estimation
      this.mouseVy = (y - this.mousePrevY) * 45;

      this.mousePrevX = this.mouseX;
      this.mousePrevY = this.mouseY;
      this.mouseX = x;
      this.mouseY = y;
      this.isMouseOnBoard = true;

      // Check collision with all dice on mouse move!
      this.checkMouseDiceCollision();
      this.checkMouseStarCollision();
    };

    this.canvas.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('mouseenter', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      this.mousePrevX = this.mouseX;
      this.mousePrevY = this.mouseY;
      this.isMouseOnBoard = true;
      this.checkMouseDiceCollision();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isMouseOnBoard = false;
      this.mouseVx = 0;
      this.mouseVy = 0;
    });

    // Mobile touch support (touch move swiping)
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = t.clientX - rect.left;
        this.mouseY = t.clientY - rect.top;
        this.mousePrevX = this.mouseX;
        this.mousePrevY = this.mouseY;
        this.isMouseOnBoard = true;
        this.checkMouseDiceCollision();
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        handleMove(t.clientX, t.clientY);
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.isMouseOnBoard = false;
    });
  }

  checkMouseDiceCollision() {
    const rollPowerLvl = this.gameState.commonUpgrades?.rollPower || 0;
    const powerMult = 1 + rollPowerLvl * 0.12;
    const cursorRadius = Formulas.getCursorRadius(this.gameState);
    const hitRadius = cursorRadius + (this.dieSize * 0.55);

    for (const die of this.dice) {
      // Do not allow re-rolling if the die is currently in the air or rolling
      if (die.isAirborne || die.z > 0 || die.isRolling) {
        continue;
      }

      const dx = die.x - this.mouseX;
      const dy = die.y - this.mouseY;
      const dist = Math.hypot(dx, dy);

      if (dist < hitRadius) {
        // Calculate collision impulse from mouse speed
        let pushVx = this.mouseVx * 0.35 * powerMult;
        let pushVy = this.mouseVy * 0.35 * powerMult;
        const mouseSpeed = Math.hypot(pushVx, pushVy);

        // If mouse moved slowly but hovered over die, give it a natural flick away from cursor!
        if (mouseSpeed < 180) {
          const angle = Math.atan2(dy, dx) || (Math.random() * Math.PI * 2);
          const minFlick = (240 + Math.random() * 120) * powerMult;
          pushVx += Math.cos(angle) * minFlick;
          pushVy += Math.sin(angle) * minFlick;
        }

        // Apply impulse to die
        die.vx = Math.max(-800, Math.min(800, die.vx + pushVx));
        die.vy = Math.max(-800, Math.min(800, die.vy + pushVy));

        // Upward jump impulse ("subindo")
        die.z = 0;
        die.vz = 360 + Math.random() * 80;
        die.isAirborne = true;

        // Add rotational torque based on hit angle
        die.vRot += ((Math.random() - 0.5) * 18 + (pushVx - pushVy) * 0.02) * powerMult;

        die.isRolling = true;
        die.hasScored = false;
        die.settleTimer = 0;

        // Throttled rattle sound
        const now = performance.now();
        if (now - this.lastRattleTime > 90) {
          sounds.playDiceRattle();
          this.lastRattleTime = now;
        }

        // Spawn contact sparkle particles
        this.spawnSparks(die.x, die.y, 6, '#fbbf24');
      }
    }
  }

  checkMouseStarCollision() {
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      const dist = Math.hypot(star.x - this.mouseX, star.y - this.mouseY);
      if (dist < star.radius * 1.5) {
        this.collectStar(i);
      }
    }
  }

  collectStar(index) {
    const star = this.shootingStars.splice(index, 1)[0];
    if (!star) return;

    const amount = 2 + Math.floor(Math.random() * 4);
    this.gameState.addStardust(amount);
    this.spawnFloatingText(star.x, star.y, `✨ +${amount} STARDUST!`, '#60a5fa', 1.2);
    this.spawnSparks(star.x, star.y, 16, '#60a5fa');
    sounds.playStardust();
  }

  // Synchronize active dice with gameState
  syncWithState() {
    const activeList = this.gameState.activeDice || [];
    const activeIds = new Set(activeList.map(d => d.id));

    // Remove old dice
    this.dice = this.dice.filter(d => activeIds.has(d.id));

    // Add or update dice
    activeList.forEach((activeDie, index) => {
      let existing = this.dice.find(d => d.id === activeDie.id);
      if (!existing) {
        const spreadAngle = (index / Math.max(1, activeList.length)) * Math.PI * 2;
        const rx = this.arena.x + this.arena.width / 2 + Math.cos(spreadAngle) * (this.arena.width * 0.25);
        const ry = this.arena.y + this.arena.height / 2 + Math.sin(spreadAngle) * (this.arena.height * 0.25);

        this.dice.push({
          id: activeDie.id,
          tierIndex: activeDie.tierIndex,
          x: rx,
          y: ry,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          z: 0,
          vz: 0,
          isAirborne: false,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 4,
          face: 1 + Math.floor(Math.random() * 6),
          displayFace: 1 + Math.floor(Math.random() * 6),
          isRolling: false,
          hasScored: true,
          settleTimer: 0,
          scale: 1.0
        });
      } else {
        existing.tierIndex = activeDie.tierIndex;
      }
    });

    this.syncHelperHands();
  }

  syncHelperHands() {
    let count = this.gameState.commonUpgrades?.helperHands || 0;
    const tree = this.gameState.skillTree || {};
    if (tree['tree_helper_hand_1']) count += 1;
    if (tree['tree_helper_hand_2']) count += 1;
    if (tree['tree_helper_hand_3']) count += 1;

    // Adjust hand count
    while (this.helperHands.length > count) {
      this.helperHands.pop();
    }
    while (this.helperHands.length < count) {
      const idx = this.helperHands.length;
      this.helperHands.push({
        id: 'hand_' + idx,
        x: this.arena.x + Math.random() * this.arena.width,
        y: this.arena.y + Math.random() * this.arena.height,
        vx: 0,
        vy: 0,
        targetDie: null,
        swipeTimer: Math.random() * 2.0,
        angle: 0
      });
    }
  }

  // Gentle table shake / roll all dice
  rollAll(power = 1.0) {
    sounds.playDiceRattle();
    const rollPowerLvl = this.gameState.commonUpgrades?.rollPower || 0;
    const powerMult = (1 + rollPowerLvl * 0.12) * power;

    for (const die of this.dice) {
      if (die.isAirborne || die.z > 0) continue;

      const angle = Math.random() * Math.PI * 2;
      const speed = (260 + Math.random() * 180) * powerMult;

      die.vx = Math.cos(angle) * speed;
      die.vy = Math.sin(angle) * speed;
      die.z = 0;
      die.vz = (350 + Math.random() * 70) * Math.min(1.3, powerMult);
      die.isAirborne = true;
      die.vRot = (Math.random() - 0.5) * 18 * powerMult;
      die.isRolling = true;
      die.hasScored = false;
      die.settleTimer = 0;
    }
  }

  spawnSparks(x, y, count = 8, color = '#fbbf24') {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 40 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color,
        radius: 2 + Math.random() * 3,
        life: 1.0,
        decay: 1.8 + Math.random() * 1.5
      });
    }
  }

  spawnFloatingText(x, y, text, color = '#4ade80', size = 1.0) {
    this.floatingTexts.push({
      x: x + (Math.random() * 30 - 15),
      y: y - 10,
      text,
      color,
      size,
      vy: -55,
      life: 1.0,
      decay: 0.85
    });
  }

  update(dt) {
    this.updateArenaBounds();

    // 1. Update Helper Hands
    const freqLvl = this.gameState.commonUpgrades?.rollFrequency || 0;
    const jointsLvl = this.gameState.skillTree?.['tree_greased_joints'] || 0;
    const swipeInterval = Math.max(0.8, 3.5 - freqLvl * 0.1 - jointsLvl * 0.4);

    for (const hand of this.helperHands) {
      hand.swipeTimer += dt;

      if (!hand.targetDie || hand.swipeTimer >= swipeInterval || hand.targetDie.isAirborne || hand.targetDie.z > 0) {
        hand.swipeTimer = 0;
        const availableDice = this.dice.filter(d => !d.isAirborne && (d.z || 0) === 0);
        if (availableDice.length > 0) {
          hand.targetDie = availableDice[Math.floor(Math.random() * availableDice.length)];
        } else if (this.dice.length > 0) {
          hand.targetDie = this.dice[Math.floor(Math.random() * this.dice.length)];
        }
      }

      if (hand.targetDie) {
        const dx = hand.targetDie.x - hand.x;
        const dy = hand.targetDie.y - hand.y;
        const dist = Math.hypot(dx, dy);

        hand.angle = Math.atan2(dy, dx);
        const handSpeed = 260 + (freqLvl * 15);

        if (dist > 15) {
          hand.vx = (dx / dist) * handSpeed;
          hand.vy = (dy / dist) * handSpeed;
          hand.x += hand.vx * dt;
          hand.y += hand.vy * dt;
        } else if (!hand.targetDie.isAirborne && (hand.targetDie.z || 0) === 0) {
          // Reached die: SWIPE and pop it up!
          const quantum = !!this.gameState.skillTree['tree_quantum_hands'];
          const boost = (quantum && Math.random() < 0.25) ? 2.2 : 1.0;
          const flickAngle = hand.angle + (Math.random() - 0.5) * 0.8;
          const flickSpeed = (350 + Math.random() * 150) * boost;

          hand.targetDie.vx += Math.cos(flickAngle) * flickSpeed;
          hand.targetDie.vy += Math.sin(flickAngle) * flickSpeed;
          hand.targetDie.z = 0;
          hand.targetDie.vz = (340 + Math.random() * 70) * boost;
          hand.targetDie.isAirborne = true;
          hand.targetDie.vRot += (Math.random() - 0.5) * 16;
          hand.targetDie.isRolling = true;
          hand.targetDie.hasScored = false;
          hand.targetDie.settleTimer = 0;

          sounds.playDiceRattle();
          this.spawnSparks(hand.targetDie.x, hand.targetDie.y, 5, '#60a5fa');

          // Pick a new random target die or reposition
          hand.targetDie = null;
          hand.swipeTimer = 0;
        }
      }
    }

    // 2. Update Shooting Stars (Skill Tree: tree_shooting_stars)
    if (this.gameState.skillTree['tree_shooting_stars']) {
      this.starSpawnTimer += dt;
      if (this.starSpawnTimer >= 20 && this.shootingStars.length < 2) {
        this.starSpawnTimer = 0;
        this.shootingStars.push({
          x: this.arena.x + 40 + Math.random() * (this.arena.width - 80),
          y: this.arena.y + 40 + Math.random() * (this.arena.height - 80),
          radius: 18,
          rotation: 0,
          life: 14.0 // 14 seconds to click/swipe
        });
        sounds.playStardust();
      }
    }

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      star.life -= dt;
      star.rotation += dt * 3;
      if (star.life <= 0) {
        this.shootingStars.splice(i, 1);
      }
    }

    // 3. Update Dice Physics (Jump / Air, Wall Bounce, Friction, Settle Detection)
    const magnetismLvl = this.gameState.commonUpgrades?.trayMagnetism || 0;
    const bouncierWallsLvl = this.gameState.skillTree?.['tree_bouncier_walls'] || 0;
    const wallRestitution = 0.65 + bouncierWallsLvl * 0.12;

    const gravity = 1200; // Snappy, responsive vertical gravity (~0.6s total air flight)
    const half = this.dieSize / 2;

    const centerX = this.arena.x + this.arena.width / 2;
    const centerY = this.arena.y + this.arena.height / 2;

    // Skill tree vortex suction towards mouse
    if (this.isMouseOnBoard && this.gameState.skillTree['tree_gravitational_reach']) {
      const reachRadius = Formulas.getCursorRadius(this.gameState) * 1.3;
      const pullPower = 35 * this.gameState.skillTree['tree_gravitational_reach'];
      for (const d of this.dice) {
        if (d.isAirborne || (d.z || 0) > 0) continue;
        const dx = this.mouseX - d.x;
        const dy = this.mouseY - d.y;
        const dist = Math.hypot(dx, dy);
        if (dist < reachRadius && dist > 15) {
          d.vx += (dx / dist) * pullPower * dt;
          d.vy += (dy / dist) * pullPower * dt;
        }
      }
    }

    for (let i = 0; i < this.dice.length; i++) {
      const d = this.dice[i];

      // Central Magnetism (only grounded dice)
      if (magnetismLvl > 0 && !d.isAirborne) {
        const toCx = centerX - d.x;
        const toCy = centerY - d.y;
        const dist = Math.hypot(toCx, toCy);
        if (dist > 40) {
          const force = 18 * magnetismLvl;
          d.vx += (toCx / dist) * force * dt;
          d.vy += (toCy / dist) * force * dt;
        }
      }

      // 3D Airborne Dynamics
      if (d.isAirborne) {
        d.vz -= gravity * dt;
        d.z += d.vz * dt;

        // Air damping
        d.vx *= 0.97;
        d.vy *= 0.97;
        d.vRot *= 0.965;

        // Rapidly tumble faces while rolling in air
        if (Math.random() < 0.35) {
          d.displayFace = 1 + Math.floor(Math.random() * 6);
        }

        // Ground landing touchdown
        if (d.z <= 0) {
          d.z = 0;
          d.vz = 0;
          d.isAirborne = false;

          // Impact sparks & immediate settlement
          const tier = DICE_TIERS[d.tierIndex] || DICE_TIERS[0];
          this.spawnSparks(d.x, d.y, 8, tier.color);
          this.settleDie(d);
        }
      } else {
        // Ground friction (quick deceleration)
        d.vx *= 0.935;
        d.vy *= 0.935;
        d.vRot *= 0.91;

        // Ground roll fallback
        if (d.isRolling && !d.hasScored) {
          d.settleTimer += dt;
          if (d.settleTimer >= 0.15 || Math.hypot(d.vx, d.vy) < 20) {
            this.settleDie(d);
          }
        }
      }

      // Move
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.rotation += d.vRot * dt;

      // Wall Bounce (Arena Boundaries)
      const minX = this.arena.x + half;
      const maxX = this.arena.x + this.arena.width - half;
      const minY = this.arena.y + half;
      const maxY = this.arena.y + this.arena.height - half;

      if (d.x < minX) {
        d.x = minX;
        d.vx = -d.vx * wallRestitution;
        d.vRot += (Math.random() - 0.5) * 4;
        sounds.playDiceRattle();
      } else if (d.x > maxX) {
        d.x = maxX;
        d.vx = -d.vx * wallRestitution;
        d.vRot += (Math.random() - 0.5) * 4;
        sounds.playDiceRattle();
      }

      if (d.y < minY) {
        d.y = minY;
        d.vy = -d.vy * wallRestitution;
        d.vRot += (Math.random() - 0.5) * 4;
        sounds.playDiceRattle();
      } else if (d.y > maxY) {
        d.y = maxY;
        d.vy = -d.vy * wallRestitution;
        d.vRot += (Math.random() - 0.5) * 4;
        sounds.playDiceRattle();
      }

      // Dice-to-Dice Elastic Collision
      for (let j = i + 1; j < this.dice.length; j++) {
        const d2 = this.dice[j];
        const cdx = d2.x - d.x;
        const cdy = d2.y - d.y;
        const cdist = Math.hypot(cdx, cdy);
        const minDist = this.dieSize * 0.95;

        if (cdist < minDist && cdist > 0.01) {
          // Push apart
          const overlap = minDist - cdist;
          const nx = cdx / cdist;
          const ny = cdy / cdist;

          d.x -= nx * overlap * 0.5;
          d.y -= ny * overlap * 0.5;
          d2.x += nx * overlap * 0.5;
          d2.y += ny * overlap * 0.5;

          // Swap momentum along collision normal
          const kx = d.vx - d2.vx;
          const ky = d.vy - d2.vy;
          const p = 2 * (nx * kx + ny * ky) / 2;

          d.vx -= p * nx * 0.85;
          d.vy -= p * ny * 0.85;
          d2.vx += p * nx * 0.85;
          d2.vy += p * ny * 0.85;

          // Angular kick
          d.vRot += (Math.random() - 0.5) * 3;
          d2.vRot += (Math.random() - 0.5) * 3;

          sounds.playDiceRattle();
        }
      }
    }

    // 4. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 5. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= ft.decay * dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  settleDie(die) {
    die.isRolling = false;
    die.isAirborne = false;
    die.hasScored = true;
    die.settleTimer = 0;
    die.z = 0;
    die.vz = 0;

    // Pick final random landing face 1..6
    const face = 1 + Math.floor(Math.random() * 6);
    die.face = face;
    die.displayFace = face;

    // Align rotation cleanly to nearest 90 degrees
    const nearestRightAngle = Math.round(die.rotation / (Math.PI / 2)) * (Math.PI / 2);
    die.rotation = nearestRightAngle;
    die.vRot = 0;
    die.vx = 0;
    die.vy = 0;

    // Check critical hit
    const isCrit = Formulas.checkCritical(this.gameState);
    if (isCrit) {
      this.gameState.stats.criticalRollsCount += 1;
    }

    // Calculate payout
    const income = Formulas.calculateDiceIncome(face, die.tierIndex, this.gameState, isCrit);
    this.gameState.addCoins(income);
    this.gameState.stats.totalRolls += 1;

    // Check Stardust drop
    const stardustDrop = Formulas.checkStardustDrop(face, die.tierIndex, this.gameState);
    if (stardustDrop.dropped) {
      this.gameState.addStardust(stardustDrop.amount);
      this.spawnFloatingText(die.x, die.y - 25, `✨ +${stardustDrop.amount} STARDUST!`, '#60a5fa', 1.15);
      this.spawnSparks(die.x, die.y, 12, '#60a5fa');
    }

    // Check Dark Matter drop
    const darkMatterDrop = Formulas.checkDarkMatterDrop(face, die.tierIndex, this.gameState, isCrit);
    if (darkMatterDrop.dropped) {
      this.gameState.addDarkMatter(darkMatterDrop.amount);
      this.spawnFloatingText(die.x, die.y - 45, `🌌 +${darkMatterDrop.amount} MATÉRIA ESCURA!`, '#c084fc', 1.25);
      this.spawnSparks(die.x, die.y, 16, '#c084fc');
    }

    // Sound
    sounds.playDiceLand(face, isCrit);
    sounds.playCoin();

    // Floating text indicator
    const prefix = isCrit ? '⚡ CRIT! ' : '';
    const color = isCrit ? '#fbbf24' : '#4ade80';
    this.spawnFloatingText(die.x, die.y, `${prefix}+$${Formulas.formatNumber(income)} [${face}]`, color, isCrit ? 1.3 : 1.0);
    this.spawnSparks(die.x, die.y, isCrit ? 14 : 6, color);
  }

  // Draw 2D Tabletop, Dice, Pips, Hands, Stars & Particles
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Table Arena (Felt Board with Wood Border)
    const { x, y, width, height, radius } = this.arena;

    // Arena Outer Drop Shadow
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    this.ctx.shadowBlur = 25;
    this.ctx.shadowOffsetY = 8;

    // Arena Border (Wood / Dark Rim)
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.roundRect(x - 8, y - 8, width + 16, height + 16, radius + 4);
    this.ctx.fill();
    this.ctx.restore();

    // Arena Felt Surface
    this.ctx.save();
    const feltGrad = this.ctx.createRadialGradient(
      x + width / 2, y + height / 2, 50,
      x + width / 2, y + height / 2, width * 0.7
    );
    feltGrad.addColorStop(0, '#1e293b');
    feltGrad.addColorStop(1, '#0f172a');
    this.ctx.fillStyle = feltGrad;
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, radius);
    this.ctx.fill();

    // Inner Grid / Felt Texture Lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    this.ctx.lineWidth = 1;
    const gridSize = 45;
    for (let gx = x + gridSize; gx < x + width; gx += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(gx, y);
      this.ctx.lineTo(gx, y + height);
      this.ctx.stroke();
    }
    for (let gy = y + gridSize; gy < y + height; gy += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, gy);
      this.ctx.lineTo(x + width, gy);
      this.ctx.stroke();
    }

    // Border highlight
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();

    // Watermark / Instructions on Table
    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.font = '700 13px Inter, sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    this.ctx.fillText('👉 PASSE O MOUSE POR CIMA DOS DADOS PARA ROLAR!', x + width / 2, y + height - 16);
    this.ctx.restore();

    // 2. Draw Interactive Mouse Area Aura on Table
    if (this.isMouseOnBoard) {
      const cursorRadius = Formulas.getCursorRadius(this.gameState);
      this.drawMouseAura(this.mouseX, this.mouseY, cursorRadius);
    }

    // 3. Draw Shooting Stars (tree_shooting_stars)
    for (const star of this.shootingStars) {
      this.ctx.save();
      this.ctx.translate(star.x, star.y);
      this.ctx.rotate(star.rotation);

      // Star Glow
      this.ctx.shadowColor = '#38bdf8';
      this.ctx.shadowBlur = 20;

      this.ctx.fillStyle = '#7dd3fc';
      this.ctx.beginPath();
      for (let p = 0; p < 8; p++) {
        const r = (p % 2 === 0) ? star.radius : star.radius * 0.45;
        const sa = (p / 8) * Math.PI * 2;
        const sx = Math.cos(sa) * r;
        const sy = Math.sin(sa) * r;
        if (p === 0) this.ctx.moveTo(sx, sy);
        else this.ctx.lineTo(sx, sy);
      }
      this.ctx.closePath();
      this.ctx.fill();

      // Center sparkle
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    // 4. Draw 2D Dice
    for (const die of this.dice) {
      this.drawDie(die);
    }

    // 5. Draw Helper Hands
    for (const hand of this.helperHands) {
      this.drawHand(hand);
    }

    // 6. Draw Particles
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 7. Draw Floating Texts
    for (const ft of this.floatingTexts) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, ft.life);
      this.ctx.textAlign = 'center';
      this.ctx.font = `900 ${Math.round(15 * ft.size)}px Inter, sans-serif`;

      // Text Shadow
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
      this.ctx.fillText(ft.text, ft.x - 1, ft.y - 1);

      this.ctx.fillStyle = ft.color;
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    }
  }

  // Draw Dynamic Mouse Aura and Reticle on Table
  drawMouseAura(x, y, radius) {
    const time = performance.now();
    const hasSuction = !!this.gameState.skillTree['tree_gravitational_reach'];
    const pulse = Math.sin(time * 0.005) * 0.05;
    const r = radius * (1 + pulse);

    this.ctx.save();

    // Radial gradient glow filling the mouse interaction area
    const auraGrad = this.ctx.createRadialGradient(x, y, 0, x, y, r);
    if (hasSuction) {
      auraGrad.addColorStop(0, 'rgba(192, 132, 252, 0.08)');
      auraGrad.addColorStop(0.7, 'rgba(147, 51, 234, 0.16)');
      auraGrad.addColorStop(1, 'rgba(56, 189, 248, 0.32)');
    } else {
      auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
      auraGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.14)');
      auraGrad.addColorStop(1, 'rgba(56, 189, 248, 0.28)');
    }

    this.ctx.fillStyle = auraGrad;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fill();

    // Rotating boundary dashed ring
    this.ctx.strokeStyle = hasSuction ? 'rgba(192, 132, 252, 0.75)' : 'rgba(56, 189, 248, 0.75)';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = hasSuction ? '#a855f7' : '#38bdf8';
    this.ctx.shadowBlur = 10;
    this.ctx.setLineDash([7, 5]);
    this.ctx.lineDashOffset = -time * 0.02;

    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.stroke();

    // Reset dash & shadow
    this.ctx.setLineDash([]);
    this.ctx.shadowBlur = 0;

    // Reticle crosshair ticks on the ring perimeter
    const rot = (time * 0.001) % (Math.PI * 2);
    for (let i = 0; i < 4; i++) {
      const a = rot + (i * Math.PI) / 2;
      const inR = r - 5;
      const outR = r + 5;
      this.ctx.beginPath();
      this.ctx.moveTo(x + Math.cos(a) * inR, y + Math.sin(a) * inR);
      this.ctx.lineTo(x + Math.cos(a) * outR, y + Math.sin(a) * outR);
      this.ctx.strokeStyle = hasSuction ? 'rgba(216, 180, 254, 0.9)' : 'rgba(125, 211, 252, 0.9)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    // Glowing center pointer
    this.ctx.fillStyle = hasSuction ? '#c084fc' : '#38bdf8';
    this.ctx.shadowColor = hasSuction ? '#c084fc' : '#38bdf8';
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawDie(die) {
    const tier = DICE_TIERS[die.tierIndex] || DICE_TIERS[0];
    const size = this.dieSize;
    const half = size / 2;
    const z = Math.max(0, die.z || 0);

    // 3D elevation offsets: die rises upward on screen and expands
    const visualY = die.y - z * 0.45;
    const visualScale = 1.0 + (z / 64) * 0.35;

    // 1. Draw Ground Shadow on Table Felt (separated and blurred when airborne)
    this.ctx.save();
    const shadowX = die.x + (3 + z * 0.25);
    const shadowY = die.y + (4 + z * 0.65);
    const shadowBlur = 10 + z * 0.75;
    const shadowAlpha = Math.max(0.12, 0.45 - (z / 100) * 0.22);
    const shadowScale = 1.0 + (z / 100) * 0.15;

    this.ctx.translate(shadowX, shadowY);
    this.ctx.rotate(die.rotation);
    this.ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha * 0.8})`;
    this.ctx.shadowBlur = shadowBlur;
    this.ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    const sHalf = (size * shadowScale) / 2;
    this.ctx.beginPath();
    this.ctx.roundRect(-sHalf, -sHalf, size * shadowScale, size * shadowScale, 12 * shadowScale);
    this.ctx.fill();
    this.ctx.restore();

    // 2. Draw Die Body (at visual height and scale)
    this.ctx.save();
    this.ctx.translate(die.x, visualY);
    this.ctx.scale(visualScale, visualScale);
    this.ctx.rotate(die.rotation);

    // Die Body (Rounded Box)
    this.ctx.fillStyle = tier.color;
    this.ctx.beginPath();
    this.ctx.roundRect(-half, -half, size, size, 12);
    this.ctx.fill();

    // Subtle Radial Highlight / Gloss
    const gloss = this.ctx.createRadialGradient(-half * 0.3, -half * 0.3, 4, 0, 0, half * 1.2);
    gloss.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    gloss.addColorStop(0.8, 'rgba(0, 0, 0, 0.1)');
    gloss.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    this.ctx.fillStyle = gloss;
    this.ctx.fill();

    // Inner Border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw Pips (Dots)
    const pipNumber = die.displayFace || 1;
    const pips = PIP_LAYOUTS[pipNumber] || PIP_LAYOUTS[1];
    const pipR = size * 0.095;

    for (const [px, py] of pips) {
      const cx = px * (half * 0.75);
      const cy = py * (half * 0.75);

      // Pip Shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      this.ctx.beginPath();
      this.ctx.arc(cx + 1, cy + 1.5, pipR, 0, Math.PI * 2);
      this.ctx.fill();

      // Pip Body
      this.ctx.fillStyle = tier.pipColor;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, pipR, 0, Math.PI * 2);
      this.ctx.fill();

      // Pip Specular Reflection
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      this.ctx.beginPath();
      this.ctx.arc(cx - pipR * 0.3, cy - pipR * 0.3, pipR * 0.35, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Special Tier Particle Sparkles
    if (tier.id === 'stardust' || tier.id === 'diamond' || tier.id === 'cosmic') {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(-half * 0.6, -half * 0.6, 2, 0, Math.PI * 2);
      this.ctx.arc(half * 0.6, half * 0.6, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawHand(hand) {
    this.ctx.save();
    this.ctx.translate(hand.x, hand.y);
    this.ctx.rotate(hand.angle + Math.PI / 2);

    // Hand Glow
    this.ctx.shadowColor = '#3b82f6';
    this.ctx.shadowBlur = 12;

    // Hand Icon (Robotic helper hand)
    this.ctx.font = '28px serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🖐️', 0, 0);

    this.ctx.restore();
  }
}
