// 3D Helper Hands System with Physical Flicking and Automation
import * as THREE from 'three';

export class HelperHandsManager {
  constructor(sceneEngine, diceManager, gameState) {
    this.sceneEngine = sceneEngine;
    this.diceManager = diceManager;
    this.gameState = gameState;

    this.hands = []; // Array of { group, index, timer, isFlicking, targetDie }
    this.autoRollTimer = 0;
    this.kineticPulseTimer = 0;

    this.handMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.6,
      roughness: 0.3
    });
    this.jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.8,
      roughness: 0.2
    });
  }

  // Calculate how many total hands should be active
  getTotalHandCount() {
    let count = this.gameState.commonUpgrades?.helperHands || 0;
    const tree = this.gameState.skillTree || {};
    if (tree['tree_helper_hand_1']) count += 1;
    if (tree['tree_helper_hand_2']) count += 1;
    if (tree['tree_helper_hand_3']) count += 1;
    return count;
  }

  // Calculate roll interval
  getRollInterval() {
    const freqLvl = this.gameState.commonUpgrades?.rollFrequency || 0;
    const jointsLvl = this.gameState.skillTree?.['tree_greased_joints'] || 0;

    let interval = 4.0;
    interval -= freqLvl * 0.1;
    interval -= jointsLvl * 0.45;
    return Math.max(1.0, interval);
  }

  createHandMesh() {
    const group = new THREE.Group();

    // Palm
    const palmGeo = new THREE.BoxGeometry(0.8, 0.25, 0.9);
    const palm = new THREE.Mesh(palmGeo, this.handMaterial);
    palm.castShadow = true;
    group.add(palm);

    // 4 Fingers
    for (let f = 0; f < 4; f++) {
      const fingerGeo = new THREE.BoxGeometry(0.16, 0.2, 0.45);
      const finger = new THREE.Mesh(fingerGeo, this.jointMaterial);
      finger.position.set(-0.3 + f * 0.2, 0, 0.6);
      finger.castShadow = true;
      group.add(finger);
    }

    // Thumb
    const thumbGeo = new THREE.BoxGeometry(0.35, 0.2, 0.18);
    const thumb = new THREE.Mesh(thumbGeo, this.jointMaterial);
    thumb.position.set(-0.55, 0, 0.15);
    thumb.rotation.y = Math.PI / 6;
    thumb.castShadow = true;
    group.add(thumb);

    // Arm connector
    const armGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.2, 12);
    const arm = new THREE.Mesh(armGeo, this.handMaterial);
    arm.rotation.x = Math.PI / 3;
    arm.position.set(0, 0.4, -0.6);
    arm.castShadow = true;
    group.add(arm);

    return group;
  }

  syncHands() {
    const targetCount = this.getTotalHandCount();

    // Remove excess hands
    while (this.hands.length > targetCount) {
      const removed = this.hands.pop();
      this.sceneEngine.scene.remove(removed.group);
    }

    // Add missing hands
    while (this.hands.length < targetCount) {
      const index = this.hands.length;
      const mesh = this.createHandMesh();
      this.sceneEngine.scene.add(mesh);

      this.hands.push({
        group: mesh,
        index,
        timer: Math.random() * 2.0, // Stagger initial timers
        isFlicking: false,
        flickProgress: 0,
        homePos: new THREE.Vector3(),
        homeRot: new THREE.Euler()
      });
    }

    // Position hands around perimeter
    const trayR = (this.physicsEngine?.traySize || 15) / 2 + 0.6;
    this.hands.forEach((hand, i) => {
      const angle = (i / Math.max(1, targetCount)) * Math.PI * 2;
      hand.homePos.set(Math.cos(angle) * trayR, 2.5, Math.sin(angle) * trayR);
      hand.homeRot.set(0.3, -angle - Math.PI / 2, 0);

      if (!hand.isFlicking) {
        hand.group.position.copy(hand.homePos);
        hand.group.rotation.copy(hand.homeRot);
      }
    });
  }

  update(dt) {
    this.syncHands();

    const interval = this.getRollInterval();
    const diceList = this.diceManager.dice;

    // Check kinetic pulse skill (tree_master_autoroll)
    if (this.gameState.skillTree['tree_master_autoroll']) {
      this.kineticPulseTimer += dt;
      if (this.kineticPulseTimer >= 10) {
        this.kineticPulseTimer = 0;
        this.diceManager.rollAll(1.8);
      }
    }

    // Update each hand
    this.hands.forEach((hand) => {
      if (hand.isFlicking) {
        // Flick animation
        hand.flickProgress += dt * 4;
        if (hand.flickProgress < 0.5) {
          // Swoop down
          const t = hand.flickProgress * 2;
          hand.group.position.lerpVectors(hand.homePos, hand.flickTargetPos, t);
          hand.group.rotation.x = 0.8;
        } else if (hand.flickProgress < 1.0) {
          // Flick forward and execute roll
          if (!hand.hasFlicked) {
            hand.hasFlicked = true;
            if (hand.targetDie) {
              const quantumHands = !!this.gameState.skillTree['tree_quantum_hands'];
              const power = quantumHands && Math.random() < 0.25 ? 2.2 : 1.0;
              this.diceManager.rollDie(hand.targetDie, power);
            }
          }
          const t = (hand.flickProgress - 0.5) * 2;
          hand.group.position.lerpVectors(hand.flickTargetPos, hand.homePos, t);
          hand.group.rotation.copy(hand.homeRot);
        } else {
          // Finished flick
          hand.isFlicking = false;
          hand.hasFlicked = false;
          hand.flickProgress = 0;
          hand.group.position.copy(hand.homePos);
          hand.group.rotation.copy(hand.homeRot);
        }
      } else {
        // Idle hover
        hand.timer += dt;
        const now = Date.now() * 0.003;
        hand.group.position.y = hand.homePos.y + Math.sin(now + hand.index) * 0.2;

        if (hand.timer >= interval) {
          hand.timer = 0;
          if (diceList.length > 0) {
            // Find a die to flick
            const targetDie = diceList[Math.floor(Math.random() * diceList.length)];
            hand.isFlicking = true;
            hand.hasFlicked = false;
            hand.flickProgress = 0;
            hand.targetDie = targetDie;

            // Target position just next to the die
            hand.flickTargetPos = new THREE.Vector3(
              targetDie.mesh.position.x * 0.7,
              0.8,
              targetDie.mesh.position.z * 0.7
            );
          }
        }
      }
    });
  }
}
